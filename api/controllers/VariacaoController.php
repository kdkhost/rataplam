<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class VariacaoController
{
    public static function listar(int $produtoId): void
    {
        try {
            $produto = Database::fetch("SELECT id FROM produtos WHERE id = ?", [$produtoId]);
            if (!$produto) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto nao encontrado']);
                exit;
            }

            $variacoes = Database::fetchAll(
                "SELECT * FROM variacoes WHERE produto_id = ? ORDER BY cor, tamanho",
                [$produtoId]
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'variacoes' => $variacoes]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar variacoes', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function criar(int $produtoId): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $produto = Database::fetch("SELECT id FROM produtos WHERE id = ?", [$produtoId]);
            if (!$produto) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto nao encontrado']);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $cor = trim($input['cor'] ?? '');
            $tamanho = trim($input['tamanho'] ?? '');

            if (empty($cor) || empty($tamanho)) {
                http_response_code(400);
                echo json_encode(['erro' => 'Cor e tamanho sao obrigatorios']);
                exit;
            }

            $existente = Database::fetch(
                "SELECT id FROM variacoes WHERE produto_id = ? AND cor = ? AND tamanho = ?",
                [$produtoId, $cor, $tamanho]
            );

            if ($existente) {
                http_response_code(400);
                echo json_encode(['erro' => 'Variacao com mesma cor e tamanho ja existe para este produto']);
                exit;
            }

            $nome = $cor . ' - ' . $tamanho;

            $id = Database::insert('variacoes', [
                'produto_id' => $produtoId,
                'nome' => $nome,
                'cor' => $cor,
                'tamanho' => $tamanho,
                'sku' => $input['sku'] ?? '',
                'estoque' => max(0, (int)($input['estoque'] ?? 0)),
                'preco_adicional' => (float)($input['preco_adicional'] ?? 0),
                'ativa' => $input['ativa'] ?? 1,
            ]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'id' => $id]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar variacao', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function atualizar(int $id): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $existente = Database::fetch("SELECT id FROM variacoes WHERE id = ?", [$id]);
            if (!$existente) {
                http_response_code(404);
                echo json_encode(['erro' => 'Variacao nao encontrada']);
                exit;
            }

            $input = json_decode(file_get_contents('php://input'), true);

            $camposPermitidos = ['cor', 'tamanho', 'sku', 'estoque', 'preco_adicional', 'ativa'];
            $atualizar = array_intersect_key($input, array_flip($camposPermitidos));

            if (isset($atualizar['estoque'])) {
                $atualizar['estoque'] = max(0, (int)$atualizar['estoque']);
            }

            if (isset($atualizar['preco_adicional'])) {
                $atualizar['preco_adicional'] = (float)$atualizar['preco_adicional'];
            }

            if (isset($atualizar['cor']) || isset($atualizar['tamanho'])) {
                $cor = $atualizar['cor'] ?? ($existente['cor'] ?? '');
                $tamanho = $atualizar['tamanho'] ?? ($existente['tamanho'] ?? '');
                $atualizar['nome'] = $cor . ' - ' . $tamanho;
            }

            if (!empty($atualizar)) {
                Database::update('variacoes', $atualizar, 'id = ?', [$id]);
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar variacao', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function excluir(int $id): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $existente = Database::fetch("SELECT id FROM variacoes WHERE id = ?", [$id]);
            if (!$existente) {
                http_response_code(404);
                echo json_encode(['erro' => 'Variacao nao encontrada']);
                exit;
            }

            Database::delete('variacoes', 'id = ?', [$id]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Variacao excluida com sucesso']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao excluir variacao', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
