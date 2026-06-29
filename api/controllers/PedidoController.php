<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;
use Rataplam\Services\EmailService;

class PedidoController
{
    public static function criar(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $itens = $input['itens'] ?? [];

        if (empty($itens)) { http_response_code(400); echo json_encode(['erro' => 'Carrinho vazio']); exit; }

        // CRITICAL FIX: Fetch prices from DB, never trust client
        $subtotal = 0;
        $itensValidados = [];
        foreach ($itens as $item) {
            $produtoId = $item['produto_id'] ?? 0;
            $quantidade = max(1, (int)($item['quantidade'] ?? 1));

            $produto = Database::fetch("SELECT id, nome, preco, preco_promocional, estoque, ativo FROM produtos WHERE id = ? AND ativo = 1", [$produtoId]);
            if (!$produto) {
                http_response_code(400);
                echo json_encode(['erro' => "Produto #{$produtoId} nao encontrado ou indisponivel"]);
                exit;
            }
            if ($produto['estoque'] < $quantidade) {
                http_response_code(400);
                echo json_encode(['erro' => "Estoque insuficiente para {$produto['nome']}. Disponivel: {$produto['estoque']}"]);
                exit;
            }

            $precoUnitario = $produto['preco_promocional'] ?? $produto['preco'];
            $subtotal += $precoUnitario * $quantidade;

            $itensValidados[] = [
                'produto_id' => $produtoId,
                'variacao_id' => $item['variacao_id'] ?? null,
                'nome' => $produto['nome'],
                'quantidade' => $quantidade,
                'preco' => $precoUnitario,
            ];
        }

        // Read frete config from DB
        $freteGratisValor = (float)(Database::fetch("SELECT valor FROM configuracoes WHERE chave = 'frete_gratis_valor'")['valor'] ?? '199.90');
        $freteFixo = (float)(Database::fetch("SELECT valor FROM configuracoes WHERE chave = 'frete_fixo'")['valor'] ?? '15.90');
        $frete = $subtotal >= $freteGratisValor ? 0 : $freteFixo;

        // Validate cupom with date range
        $desconto = 0;
        $cupomId = null;
        $cupomCodigo = strtoupper(trim($input['cupom'] ?? ''));
        if ($cupomCodigo) {
            $cupom = Database::fetch(
                "SELECT * FROM cupons WHERE codigo = ? AND ativo = 1 AND (data_inicio IS NULL OR data_inicio <= CURDATE()) AND (data_fim IS NULL OR data_fim >= CURDATE())",
                [$cupomCodigo]
            );
            if ($cupom && ($cupom['limite_uso'] == 0 || $cupom['usos_realizados'] < $cupom['limite_uso'])) {
                $cupomId = $cupom['id'];
                $desconto = $cupom['tipo'] === 'percentual' ? round($subtotal * $cupom['valor'] / 100, 2) : min($cupom['valor'], $subtotal);
            } else {
                http_response_code(400);
                echo json_encode(['erro' => 'Cupom invalido ou expirado']);
                exit;
            }
        }

        $total = max(0, $subtotal - $desconto + $frete);
        $numero = 'RAT' . date('ymd') . strtoupper(substr(uniqid(), -6));

        // CRITICAL FIX: Transaction wrapping for atomic order creation
        $pdo = Database::getInstance();
        $pdo->beginTransaction();

        try {
            $pedidoId = Database::insert('pedidos', [
                'numero_pedido' => $numero,
                'status' => 'pendente',
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'frete' => $frete,
                'total' => $total,
                'cupom_id' => $cupomId,
                'cupom_codigo' => $cupomCodigo,
                'nome_comprador' => $input['nome'] ?? '',
                'email_comprador' => $input['email'] ?? '',
                'cpf_comprador' => $input['cpf'] ?? '',
                'telefone_comprador' => $input['telefone'] ?? '',
                'cep_entrega' => $input['cep'] ?? '',
                'logradouro_entrega' => $input['logradouro'] ?? '',
                'numero_entrega' => $input['numero'] ?? '',
                'complemento_entrega' => $input['complemento'] ?? '',
                'bairro_entrega' => $input['bairro'] ?? '',
                'cidade_entrega' => $input['cidade'] ?? '',
                'estado_entrega' => $input['estado'] ?? '',
                'metodo_pagamento' => $input['gateway'] ?? 'mercadopago',
                'usuario_id' => (Auth::verificarOpcional())['id'] ?? null,
            ]);

            foreach ($itensValidados as $item) {
                Database::insert('pedido_itens', [
                    'pedido_id' => $pedidoId,
                    'produto_id' => $item['produto_id'],
                    'variacao_id' => $item['variacao_id'],
                    'nome_produto' => $item['nome'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $item['preco'],
                    'preco_total' => $item['preco'] * $item['quantidade'],
                ]);

                // Atomic stock decrement with validation
                $affected = Database::query(
                    "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?",
                    [$item['quantidade'], $item['produto_id'], $item['quantidade']]
                );
                if ($affected->rowCount() === 0) {
                    throw new \RuntimeException("Estoque insuficiente para produto #{$item['produto_id']}");
                }
            }

            if ($cupomId) {
                Database::update('cupons', ['usos_realizados' => $cupom['usos_realizados'] + 1], 'id = ?', [$cupomId]);
            }

            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['erro' => $e->getMessage()]);
            exit;
        }

        // Send email outside transaction (non-blocking)
        try {
            $emailService = new EmailService();
            $emailService->enviarTemplate($input['email'] ?? '', 'confirmacao_pedido', [
                'assunto' => "Pedido #{$numero} - RATAPLAM",
                'nome' => $input['nome'] ?? 'Cliente',
                'numero' => $numero,
                'itens' => $itensValidados,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'frete' => $frete,
                'total' => $total,
                'endereco' => "{$input['logradouro'] ?? ''}, {$input['numero'] ?? ''} - {$input['bairro'] ?? ''}, {$input['cidade'] ?? ''}/{$input['estado'] ?? ''}",
                'data' => date('d/m/Y H:i'),
            ]);

            // Notify admin of new order
            $adminEmail = \Rataplam\Config\Config::get('smtp_de_email', 'contato@rataplam.com.br');
            $emailService->enviarTemplate($adminEmail, 'novo_pedido_admin', [
                'assunto' => "Novo Pedido #{$numero} - RATAPLAM",
                'numero' => $numero,
                'nome' => $input['nome'] ?? 'Cliente',
                'total' => $total,
                'metodo' => $input['gateway'] ?? 'mercadopago',
            ]);
        } catch (\Throwable $e) { /* email falha silenciosamente */ }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'numero_pedido' => $numero, 'pedido_id' => $pedidoId, 'total' => $total]);
        exit;
    }

    public static function listar(): void
    {
        $minhaConta = isset($_GET['minha_conta']);
        $usuarioId = null;

        if ($minhaConta) {
            $dados = Auth::verificarOpcional();
            if ($dados) $usuarioId = $dados['id'] ?? null;
        } else {
            // CRITICAL FIX: Require admin auth for listing all orders
            Auth::verificarAdmin();
        }

        $pagina = max(1, (int)($_GET['pagina'] ?? 1));
        $status = $_GET['status'] ?? '';
        $limite = 20;
        $offset = ($pagina - 1) * $limite;

        $where = '1=1';
        $params = [];
        if ($status) { $where .= ' AND status = ?'; $params[] = $status; }
        if ($usuarioId) { $where .= ' AND usuario_id = ?'; $params[] = $usuarioId; }

        $total = Database::fetch("SELECT COUNT(*) as t FROM pedidos WHERE {$where}", $params);
        $pedidos = Database::fetchAll(
            "SELECT * FROM pedidos WHERE {$where} ORDER BY created_at DESC LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'pedidos' => $pedidos, 'total_paginas' => ceil(($total['t'] ?? 0) / $limite)]);
        exit;
    }

    public static function buscar(int $id): void
    {
        $pedido = Database::fetch("SELECT * FROM pedidos WHERE id = ?", [$id]);
        if (!$pedido) { http_response_code(404); echo json_encode(['erro' => 'Pedido nao encontrado']); exit; }

        // CRITICAL FIX: Auth check - user can only see own orders, admin can see all
        $dados = Auth::verificarOpcional();
        if ($dados && $dados['role'] !== 'admin') {
            if (($pedido['usuario_id'] ?? null) !== $dados['id']) {
                http_response_code(403);
                echo json_encode(['erro' => 'Acesso negado']);
                exit;
            }
        } elseif (!$dados) {
            http_response_code(401);
            echo json_encode(['erro' => 'Autenticacao obrigatoria']);
            exit;
        }

        $pedido['itens'] = Database::fetchAll("SELECT * FROM pedido_itens WHERE pedido_id = ?", [$id]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'pedido' => $pedido]);
        exit;
    }

    public static function atualizar(int $id): void
    {
        // CRITICAL FIX: Require admin auth for order updates
        Auth::verificarAdmin();

        $input = json_decode(file_get_contents('php://input'), true);

        // Whitelist allowed fields
        $allowedFields = ['status', 'codigo_rastreio', 'observacoes'];
        $updateData = array_intersect_key($input, array_flip($allowedFields));

        if (empty($updateData)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nenhum campo valido para atualizar']);
            exit;
        }

        $statusAnterior = Database::fetch("SELECT status, email_comprador, nome_comprador, numero_pedido FROM pedidos WHERE id = ?", [$id]);
        if (!$statusAnterior) {
            http_response_code(404);
            echo json_encode(['erro' => 'Pedido nao encontrado']);
            exit;
        }

        Database::update('pedidos', $updateData, 'id = ?', [$id]);

        // Send status-change email
        if (isset($updateData['status']) && $updateData['status'] !== $statusAnterior['status']) {
            try {
                $emailService = new EmailService();
                $templateMap = [
                    'pago' => 'pagamento_aprovado',
                    'enviado' => 'pedido_enviado',
                    'entregue' => 'pedido_entregue',
                    'cancelado' => 'pedido_cancelado',
                    'reembolsado' => 'reembolso_aprovado',
                    'em_separacao' => 'pedido_em_separacao',
                ];
                $template = $templateMap[$updateData['status']] ?? null;
                if ($template && $statusAnterior['email_comprador']) {
                    $emailService->enviarTemplate($statusAnterior['email_comprador'], $template, [
                        'assunto' => "Pedido {$statusAnterior['numero_pedido']} - " . ucfirst($updateData['status']) . " - RATAPLAM",
                        'nome' => $statusAnterior['nome_comprador'],
                        'numero' => $statusAnterior['numero_pedido'],
                        'status' => $updateData['status'],
                    ]);
                }
            } catch (\Throwable $e) { /* email falha silenciosamente */ }

            // Restore stock on cancellation
            if ($updateData['status'] === 'cancelado') {
                $itens = Database::fetchAll("SELECT produto_id, quantidade FROM pedido_itens WHERE pedido_id = ?", [$id]);
                foreach ($itens as $item) {
                    Database::query("UPDATE produtos SET estoque = estoque + ? WHERE id = ?", [$item['quantidade'], $item['produto_id']]);
                }
            }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }
}
