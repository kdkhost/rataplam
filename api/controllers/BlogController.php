<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class BlogController
{
    // ── Público ────────────────────────────────────────────────────────

    public static function listar(): void
    {
        $status  = $_GET['status']   ?? 'publicado';
        $limite  = min(50, max(1, (int)($_GET['limite'] ?? 12)));
        $pagina  = max(1, (int)($_GET['pagina'] ?? 1));
        $offset  = ($pagina - 1) * $limite;
        $busca   = $_GET['busca']    ?? '';
        $categoria = $_GET['categoria'] ?? '';

        $where  = '1=1';
        $params = [];

        if ($status === 'publicado') {
            $where .= " AND status = 'publicado' AND publicado_em <= " . \Rataplam\Config\Database::now();
        } elseif (in_array($status, ['rascunho', 'publicado', 'arquivado'], true)) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        if ($busca) {
            $where .= ' AND (titulo LIKE ? OR resumo LIKE ?)';
            $params[] = "%{$busca}%";
            $params[] = "%{$busca}%";
        }
        if ($categoria) {
            $where .= ' AND categoria = ?';
            $params[] = $categoria;
        }

        $total = Database::fetch("SELECT COUNT(*) as t FROM blog_posts WHERE {$where}", $params);
        $posts = Database::fetchAll(
            "SELECT id, titulo, slug, resumo, imagem, categoria, tags, publicado_em as dataPublicacao, status
             FROM blog_posts WHERE {$where}
             ORDER BY publicado_em DESC
             LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso'       => true,
            'posts'         => $posts,
            'total'         => (int)($total['t'] ?? 0),
            'total_paginas' => (int)ceil(($total['t'] ?? 0) / $limite),
            'pagina_atual'  => $pagina,
        ]);
        exit;
    }

    public static function buscarPorSlug(string $slug): void
    {
        $post = Database::fetch(
            "SELECT * FROM blog_posts WHERE slug = ? AND status = 'publicado' AND publicado_em <= " . \Rataplam\Config\Database::now(),
            [$slug]
        );

        if (!$post) {
            http_response_code(404);
            echo json_encode(['erro' => 'Post não encontrado']);
            exit;
        }

        // Incrementa visualizações
        Database::query("UPDATE blog_posts SET visualizacoes = visualizacoes + 1 WHERE id = ?", [$post['id']]);

        // Posts relacionados (mesma categoria, exceto este)
        $relacionados = Database::fetchAll(
            "SELECT id, titulo, slug, resumo, imagem, categoria, publicado_em as dataPublicacao
             FROM blog_posts
             WHERE categoria = ? AND id != ? AND status = 'publicado'
             ORDER BY publicado_em DESC LIMIT 3",
            [$post['categoria'], $post['id']]
        );

        $post['dataPublicacao'] = $post['publicado_em'];

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso'     => true,
            'post'        => $post,
            'relacionados' => $relacionados,
        ]);
        exit;
    }

    // ── Admin ───────────────────────────────────────────────────────────

    public static function adminListar(): void
    {
        \Rataplam\Middleware\Auth::verificarAdmin();

        $limite  = min(50, max(1, (int)($_GET['limite'] ?? 20)));
        $pagina  = max(1, (int)($_GET['pagina'] ?? 1));
        $offset  = ($pagina - 1) * $limite;
        $busca   = $_GET['busca']  ?? '';
        $status  = $_GET['status'] ?? '';

        $where  = '1=1';
        $params = [];

        if ($busca) {
            $where .= ' AND (titulo LIKE ? OR resumo LIKE ?)';
            $params[] = "%{$busca}%";
            $params[] = "%{$busca}%";
        }
        if ($status) {
            $where .= ' AND status = ?';
            $params[] = $status;
        }

        $total = Database::fetch("SELECT COUNT(*) as t FROM blog_posts WHERE {$where}", $params);
        $posts = Database::fetchAll(
            "SELECT id, titulo, slug, resumo, imagem, categoria, tags, status, publicado_em, visualizacoes, created_at
             FROM blog_posts WHERE {$where}
             ORDER BY created_at DESC
             LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso'       => true,
            'posts'         => $posts,
            'total'         => (int)($total['t'] ?? 0),
            'total_paginas' => (int)ceil(($total['t'] ?? 0) / $limite),
        ]);
        exit;
    }

    public static function criar(): void
    {
        \Rataplam\Middleware\Auth::verificarAdmin();

        $input = json_decode(file_get_contents('php://input'), true);
        $titulo = trim($input['titulo'] ?? '');

        if (empty($titulo)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Título é obrigatório']);
            exit;
        }

        $slug = self::gerarSlug($titulo);

        $id = Database::insert('blog_posts', [
            'titulo'       => $titulo,
            'slug'         => $slug,
            'resumo'       => $input['resumo']   ?? '',
            'conteudo'     => $input['conteudo']  ?? '',
            'imagem'       => $input['imagem']    ?? '',
            'categoria'    => $input['categoria'] ?? '',
            'tags'         => $input['tags']      ?? '',
            'status'       => in_array($input['status'] ?? '', ['rascunho', 'publicado', 'arquivado'], true)
                              ? $input['status'] : 'rascunho',
            'publicado_em' => !empty($input['publicado_em']) ? $input['publicado_em'] : null,
            'visualizacoes' => 0,
        ]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id, 'slug' => $slug]);
        exit;
    }

    public static function atualizar(int $id): void
    {
        \Rataplam\Middleware\Auth::verificarAdmin();

        $input  = json_decode(file_get_contents('php://input'), true);
        $campos = ['titulo', 'resumo', 'conteudo', 'imagem', 'categoria', 'tags', 'status', 'publicado_em'];
        $dados  = array_intersect_key($input, array_flip($campos));

        if (!empty($dados['titulo'])) {
            $dados['slug'] = self::gerarSlug($dados['titulo'], $id);
        }
        if (!empty($dados['status']) && !in_array($dados['status'], ['rascunho', 'publicado', 'arquivado'], true)) {
            unset($dados['status']);
        }

        if (!empty($dados)) {
            Database::update('blog_posts', $dados, 'id = ?', [$id]);
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function excluir(int $id): void
    {
        \Rataplam\Middleware\Auth::verificarAdmin();
        Database::delete('blog_posts', 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private static function gerarSlug(string $texto, ?int $excluirId = null): string
    {
        $slug = strtolower(trim($texto));
        $slug = preg_replace('/[àáâãäå]/u', 'a', $slug);
        $slug = preg_replace('/[èéêë]/u', 'e', $slug);
        $slug = preg_replace('/[ìíîï]/u', 'i', $slug);
        $slug = preg_replace('/[òóôõö]/u', 'o', $slug);
        $slug = preg_replace('/[ùúûü]/u', 'u', $slug);
        $slug = preg_replace('/[ç]/u', 'c', $slug);
        $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
        $slug = preg_replace('/[\s-]+/', '-', $slug);
        $slug = trim($slug, '-');

        // Garante unicidade
        $base    = $slug;
        $counter = 1;
        while (true) {
            $q      = $excluirId
                ? "SELECT id FROM blog_posts WHERE slug = ? AND id != ?"
                : "SELECT id FROM blog_posts WHERE slug = ?";
            $params = $excluirId ? [$slug, $excluirId] : [$slug];
            $existe = Database::fetch($q, $params);
            if (!$existe) break;
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
