<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class CarrinhoController
{
    private static function obterIdentificador(): array
    {
        $dados = \Rataplam\Middleware\Auth::verificarOpcional();
        if ($dados) {
            return ['tipo' => 'usuario', 'id' => $dados['id']];
        }

        $headers = getallheaders();
        $sessionId = $headers['X-Session-ID'] ?? $headers['x-session-id'] ?? '';
        if (empty($sessionId)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Session ID obrigatorio para visitantes']);
            exit;
        }

        return ['tipo' => 'sessao', 'id' => $sessionId];
    }

    public static function listar(): void
    {
        try {
            $ident = self::obterIdentificador();

            if ($ident['tipo'] === 'usuario') {
                $itens = Database::fetchAll(
                    "SELECT c.*, p.nome, p.preco, p.preco_promocional, p.estoque, p.ativo,
                            (SELECT url FROM produtos_imagens WHERE produto_id = c.produto_id AND principal = 1 LIMIT 1) as imagem_url,
                            v.tamanho, v.cor as variacao_cor
                     FROM carrinho c
                     JOIN produtos p ON c.produto_id = p.id
                     LEFT JOIN variacoes v ON c.variacao_id = v.id
                     WHERE c.usuario_id = ? AND p.ativo = 1
                     ORDER BY c.created_at DESC",
                    [$ident['id']]
                );
            } else {
                $itens = Database::fetchAll(
                    "SELECT c.*, p.nome, p.preco, p.preco_promocional, p.estoque, p.ativo,
                            (SELECT url FROM produtos_imagens WHERE produto_id = c.produto_id AND principal = 1 LIMIT 1) as imagem_url,
                            v.tamanho, v.cor as variacao_cor
                     FROM carrinho c
                     JOIN produtos p ON c.produto_id = p.id
                     LEFT JOIN variacoes v ON c.variacao_id = v.id
                     WHERE c.session_id = ? AND p.ativo = 1
                     ORDER BY c.created_at DESC",
                    [$ident['id']]
                );
            }

            $total = 0;
            foreach ($itens as $item) {
                $preco = $item['preco_promocional'] ?? $item['preco'];
                $total += $preco * $item['quantidade'];
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'itens' => $itens, 'total' => round($total, 2), 'quantidade_itens' => count($itens)]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar carrinho', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function adicionar(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $produtoId = (int)($input['produto_id'] ?? 0);
            $variacaoId = !empty($input['variacao_id']) ? (int)$input['variacao_id'] : null;
            $quantidade = max(1, (int)($input['quantidade'] ?? 1));

            if ($produtoId <= 0) {
                http_response_code(400);
                echo json_encode(['erro' => 'Produto invalido']);
                exit;
            }

            $produto = Database::fetch("SELECT id, nome, estoque, ativo FROM produtos WHERE id = ? AND ativo = 1", [$produtoId]);
            if (!$produto) {
                http_response_code(404);
                echo json_encode(['erro' => 'Produto nao encontrado ou indisponivel']);
                exit;
            }

            if ($produto['estoque'] < $quantidade) {
                http_response_code(400);
                echo json_encode(['erro' => "Estoque insuficiente. Disponivel: {$produto['estoque']}"]);
                exit;
            }

            $ident = self::obterIdentificador();

            if ($ident['tipo'] === 'usuario') {
                $existente = Database::fetch(
                    "SELECT id, quantidade FROM carrinho WHERE usuario_id = ? AND produto_id = ? AND (variacao_id = ? OR (variacao_id IS NULL AND ? IS NULL))",
                    [$ident['id'], $produtoId, $variacaoId, $variacaoId]
                );
            } else {
                $existente = Database::fetch(
                    "SELECT id, quantidade FROM carrinho WHERE session_id = ? AND produto_id = ? AND (variacao_id = ? OR (variacao_id IS NULL AND ? IS NULL))",
                    [$ident['id'], $produtoId, $variacaoId, $variacaoId]
                );
            }

            if ($existente) {
                $novaQtd = $existente['quantidade'] + $quantidade;
                if ($novaQtd > $produto['estoque']) {
                    http_response_code(400);
                    echo json_encode(['erro' => "Estoque insuficiente. Disponivel: {$produto['estoque']}"]);
                    exit;
                }
                Database::update('carrinho', ['quantidade' => $novaQtd], 'id = ?', [$existente['id']]);
                $id = $existente['id'];
            } else {
                $dadosInserir = [
                    'produto_id' => $produtoId,
                    'variacao_id' => $variacaoId,
                    'quantidade' => $quantidade,
                ];

                if ($ident['tipo'] === 'usuario') {
                    $dadosInserir['usuario_id'] = $ident['id'];
                } else {
                    $dadosInserir['session_id'] = $ident['id'];
                }

                $id = Database::insert('carrinho', $dadosInserir);
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'id' => $id, 'mensagem' => 'Produto adicionado ao carrinho']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao adicionar ao carrinho', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function atualizar(int $id): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $quantidade = max(1, (int)($input['quantidade'] ?? 1));

            $ident = self::obterIdentificador();

            if ($ident['tipo'] === 'usuario') {
                $item = Database::fetch(
                    "SELECT c.*, p.estoque FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.id = ? AND c.usuario_id = ?",
                    [$id, $ident['id']]
                );
            } else {
                $item = Database::fetch(
                    "SELECT c.*, p.estoque FROM carrinho c JOIN produtos p ON c.produto_id = p.id WHERE c.id = ? AND c.session_id = ?",
                    [$id, $ident['id']]
                );
            }

            if (!$item) {
                http_response_code(404);
                echo json_encode(['erro' => 'Item nao encontrado no carrinho']);
                exit;
            }

            if ($quantidade > $item['estoque']) {
                http_response_code(400);
                echo json_encode(['erro' => "Estoque insuficiente. Disponivel: {$item['estoque']}"]);
                exit;
            }

            Database::update('carrinho', ['quantidade' => $quantidade], 'id = ?', [$id]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar carrinho', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function excluir(int $id): void
    {
        try {
            $ident = self::obterIdentificador();

            if ($ident['tipo'] === 'usuario') {
                $item = Database::fetch("SELECT id FROM carrinho WHERE id = ? AND usuario_id = ?", [$id, $ident['id']]);
            } else {
                $item = Database::fetch("SELECT id FROM carrinho WHERE id = ? AND session_id = ?", [$id, $ident['id']]);
            }

            if (!$item) {
                http_response_code(404);
                echo json_encode(['erro' => 'Item nao encontrado no carrinho']);
                exit;
            }

            Database::delete('carrinho', 'id = ?', [$id]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Item removido do carrinho']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao remover item', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function limpar(): void
    {
        try {
            $ident = self::obterIdentificador();

            if ($ident['tipo'] === 'usuario') {
                Database::delete('carrinho', 'usuario_id = ?', [$ident['id']]);
            } else {
                Database::delete('carrinho', 'session_id = ?', [$ident['id']]);
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Carrinho limpo com sucesso']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao limpar carrinho', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
