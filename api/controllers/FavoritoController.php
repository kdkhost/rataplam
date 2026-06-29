<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class FavoritoController
{
    public static function listar(): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $favoritos = Database::fetchAll(
                "SELECT p.*, ld.created_at as adicionado_em,
                        (SELECT url FROM produtos_imagens WHERE produto_id = p.id AND principal = 1 LIMIT 1) as imagem_url,
                        c.nome as categoria_nome
                 FROM lista_desejos ld
                 JOIN produtos p ON ld.produto_id = p.id AND p.ativo = 1
                 LEFT JOIN categorias c ON p.categoria_id = c.id
                 WHERE ld.usuario_id = ?
                 ORDER BY ld.created_at DESC",
                [$dados['id']]
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'favoritos' => $favoritos, 'total' => count($favoritos)]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar favoritos', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function adicionar(): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();
            $input = json_decode(file_get_contents('php://input'), true);
            $produtoId = (int)($input['produto_id'] ?? 0);

            if ($produtoId <= 0) {
                http_response_code(400);
                echo json_encode(['erro' => 'Produto invalido']);
                exit;
            }

            $produto = Database::fetch("SELECT id, nome FROM produtos WHERE id = ? AND ativo = 1", [$produtoId]);
            if (!$produto) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto nao encontrado']);
                exit;
            }

            $existe = Database::fetch(
                "SELECT id FROM lista_desejos WHERE usuario_id = ? AND produto_id = ?",
                [$dados['id'], $produtoId]
            );

            if ($existe) {
                http_response_code(400);
                echo json_encode(['erro' => 'Produto ja esta na lista de desejos']);
                exit;
            }

            $id = Database::insert('lista_desejos', [
                'usuario_id' => $dados['id'],
                'produto_id' => $produtoId,
            ]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'id' => $id, 'mensagem' => 'Produto adicionado aos favoritos']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao adicionar favorito', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function excluir(int $produtoId): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $existe = Database::fetch(
                "SELECT id FROM lista_desejos WHERE usuario_id = ? AND produto_id = ?",
                [$dados['id'], $produtoId]
            );

            if (!$existe) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto nao esta na lista de desejos']);
                exit;
            }

            Database::delete('lista_desejos', 'usuario_id = ? AND produto_id = ?', [$dados['id'], $produtoId]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Produto removido dos favoritos']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover favorito', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function verificar(int $produtoId): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $existe = Database::fetch(
                "SELECT id FROM lista_desejos WHERE usuario_id = ? AND produto_id = ?",
                [$dados['id'], $produtoId]
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'favoritado' => (bool)$existe]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao verificar favorito', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
