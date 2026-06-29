<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class ProdutoController
{
    public static function listar(): void
    {
        $busca = $_GET['busca'] ?? '';
        $categoria = $_GET['categoria'] ?? '';
        $faixa = $_GET['faixa_etaria'] ?? '';
        $genero = $_GET['genero'] ?? '';
        $ordenar = $_GET['ordenar'] ?? 'recentes';
        $pagina = max(1, (int)($_GET['pagina'] ?? 1));
        $limite = 20;
        $offset = ($pagina - 1) * $limite;

        $where = ['p.ativo = 1'];
        $params = [];

        if ($busca) { $where[] = '(p.nome LIKE ? OR p.descricao LIKE ?)'; $params[] = "%{$busca}%"; $params[] = "%{$busca}%"; }
        if ($categoria) { $where[] = 'c.slug = ?'; $params[] = $categoria; }
        if ($faixa) { $where[] = 'f.slug = ?'; $params[] = $faixa; }
        if ($genero) { $where[] = 'p.genero = ?'; $params[] = $genero; }

        $whereSql = implode(' AND ', $where);

        $orderMap = [
            'recentes' => 'p.created_at DESC',
            'preco_asc' => 'p.preco ASC',
            'preco_desc' => 'p.preco DESC',
            'nome' => 'p.nome ASC',
        ];
        $order = $orderMap[$ordenar] ?? 'p.created_at DESC';

        $total = Database::fetch("SELECT COUNT(*) as t FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id LEFT JOIN faixas_etarias f ON p.faixa_etaria_id = f.id WHERE {$whereSql}", $params);
        $totalPaginas = ceil(($total['t'] ?? 0) / $limite);

        $produtos = Database::fetchAll(
            "SELECT p.*, c.nome as categoria_nome, f.nome as faixa_etaria_nome,
             (SELECT url FROM produtos_imagens WHERE produto_id = p.id AND principal = 1 LIMIT 1) as imagem
             FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id LEFT JOIN faixas_etarias f ON p.faixa_etaria_id = f.id
             WHERE {$whereSql} ORDER BY {$order} LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'produtos' => $produtos, 'total_paginas' => $totalPaginas, 'total' => $total['t'] ?? 0]);
        exit;
    }

    public static function buscarPorSlug(string $slug): void
    {
        $produto = Database::fetch(
            "SELECT p.*, c.nome as categoria_nome, f.nome as faixa_etaria_nome
             FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id LEFT JOIN faixas_etarias f ON p.faixa_etaria_id = f.id
             WHERE p.slug = ? AND p.ativo = 1",
            [$slug]
        );

        if (!$produto) { http_response_code(404); echo json_encode(['erro' => 'Produto não encontrado']); exit; }

        $produto['imagens'] = Database::fetchAll("SELECT * FROM produtos_imagens WHERE produto_id = ? ORDER BY ordem", [$produto['id']]);
        $produto['variacoes'] = Database::fetchAll("SELECT * FROM variacoes WHERE produto_id = ? AND ativa = 1", [$produto['id']]);
        $produto['avaliacoes'] = Database::fetchAll(
            "SELECT a.*, u.nome as usuario_nome FROM avaliacoes a JOIN usuarios u ON a.usuario_id = u.id WHERE a.produto_id = ? AND a.aprovada = 1 ORDER BY a.created_at DESC LIMIT 10",
            [$produto['id']]
        );

        Database::query("UPDATE produtos SET visualizacoes = visualizacoes + 1 WHERE id = ?", [$produto['id']]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'produto' => $produto]);
        exit;
    }

    public static function criar(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $slug = $input['slug'] ?? self::gerarSlug($input['nome'] ?? '');

        $id = Database::insert('produtos', [
            'nome' => $input['nome'], 'slug' => $slug, 'descricao' => $input['descricao'] ?? '',
            'descricao_curta' => $input['descricao_curta'] ?? '', 'preco' => $input['preco'],
            'preco_promocional' => $input['preco_promocional'] ?? null, 'estoque' => $input['estoque'] ?? 0,
            'categoria_id' => $input['categoria_id'] ?? null, 'faixa_etaria_id' => $input['faixa_etaria_id'] ?? null,
            'genero' => $input['genero'] ?? 'U', 'destaque' => $input['destaque'] ?? 0, 'ativo' => 1,
        ]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }

    public static function atualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $dados = array_filter($input, fn($v) => $v !== null);
        Database::update('produtos', $dados, 'id = ?', [$id]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function excluir(int $id): void
    {
        Database::update('produtos', ['ativo' => 0], 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function adminListar(): void
    {
        $busca = $_GET['busca'] ?? '';
        $pagina = max(1, (int)($_GET['pagina'] ?? 1));
        $limite = 20;
        $offset = ($pagina - 1) * $limite;

        $where = '1=1';
        $params = [];
        if ($busca) { $where = '(p.nome LIKE ? OR p.sku LIKE ?)'; $params = ["%{$busca}%", "%{$busca}%"]; }

        $total = Database::fetch("SELECT COUNT(*) as t FROM produtos p WHERE {$where}", $params);
        $produtos = Database::fetchAll(
            "SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE {$where} ORDER BY p.created_at DESC LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'produtos' => $produtos, 'total_paginas' => ceil(($total['t'] ?? 0) / $limite)]);
        exit;
    }

    public static function uploadImagem(int $produtoId): void
    {
        if (!isset($_FILES['imagem'])) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum arquivo enviado']);
            exit;
        }

        $file = $_FILES['imagem'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $maxSize = 5 * 1024 * 1024;

        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF']);
            exit;
        }

        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['erro' => 'Arquivo muito grande. Máximo 5MB']);
            exit;
        }

        $produto = Database::fetch("SELECT id FROM produtos WHERE id = ?", [$produtoId]);
        if (!$produto) {
            http_response_code(404);
            echo json_encode(['erro' => 'Produto não encontrado']);
            exit;
        }

        $uploadDir = __DIR__ . '/../public/uploads/produtos/' . $produtoId . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = uniqid('img_') . '.' . $ext;
        $filepath = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao salvar arquivo']);
            exit;
        }

        $url = '/uploads/produtos/' . $produtoId . '/' . $filename;
        $alt = $_POST['alt'] ?? '';
        $principal = (int)($_POST['principal'] ?? 0);

        if ($principal) {
            Database::query("UPDATE produtos_imagens SET principal = 0 WHERE produto_id = ?", [$produtoId]);
        }

        $maxOrdem = Database::fetch("SELECT COALESCE(MAX(ordem), 0) as max_ordem FROM produtos_imagens WHERE produto_id = ?", [$produtoId]);
        $ordem = ($maxOrdem['max_ordem'] ?? 0) + 1;

        $id = Database::insert('produtos_imagens', [
            'produto_id' => $produtoId,
            'url' => $url,
            'alt' => $alt,
            'principal' => $principal,
            'ordem' => $ordem,
        ]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id, 'url' => $url]);
        exit;
    }

    public static function listarImagens(int $produtoId): void
    {
        $imagens = Database::fetchAll(
            "SELECT * FROM produtos_imagens WHERE produto_id = ? ORDER BY ordem ASC",
            [$produtoId]
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'imagens' => $imagens]);
        exit;
    }

    public static function excluirImagem(int $imagemId): void
    {
        $imagem = Database::fetch("SELECT * FROM produtos_imagens WHERE id = ?", [$imagemId]);
        if (!$imagem) {
            http_response_code(404);
            echo json_encode(['erro' => 'Imagem não encontrada']);
            exit;
        }

        $filePath = __DIR__ . '/../public' . $imagem['url'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        Database::delete('produtos_imagens', 'id = ?', [$imagemId]);

        if ($imagem['principal']) {
            $primeira = Database::fetch(
                "SELECT id FROM produtos_imagens WHERE produto_id = ? ORDER BY ordem ASC LIMIT 1",
                [$imagem['produto_id']]
            );
            if ($primeira) {
                Database::update('produtos_imagens', ['principal' => 1], 'id = ?', [$primeira['id']]);
            }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function definirPrincipal(int $imagemId): void
    {
        $imagem = Database::fetch("SELECT * FROM produtos_imagens WHERE id = ?", [$imagemId]);
        if (!$imagem) {
            http_response_code(404);
            echo json_encode(['erro' => 'Imagem não encontrada']);
            exit;
        }

        Database::query("UPDATE produtos_imagens SET principal = 0 WHERE produto_id = ?", [$imagem['produto_id']]);
        Database::update('produtos_imagens', ['principal' => 1], 'id = ?', [$imagemId]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function reordenarImagens(int $produtoId): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $ordens = $input['ordens'] ?? [];

        foreach ($ordens as $item) {
            $imgId = (int)($item['id'] ?? 0);
            $ordem = (int)($item['ordem'] ?? 0);
            if ($imgId && $ordem >= 0) {
                Database::update('produtos_imagens', ['ordem' => $ordem], 'id = ? AND produto_id = ?', [$imgId, $produtoId]);
            }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    private static function gerarSlug(string $texto): string
    {
        $slug = strtolower($texto);
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }
}
