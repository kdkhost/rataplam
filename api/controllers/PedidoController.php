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

        $subtotal = 0;
        foreach ($itens as $item) { $subtotal += $item['preco'] * $item['quantidade']; }

        $frete = $subtotal >= 199.90 ? 0 : 15.90;
        $desconto = 0;
        $cupomId = null;
        $cupomCodigo = $input['cupom'] ?? '';
        if ($cupomCodigo) {
            $cupom = Database::fetch("SELECT * FROM cupons WHERE codigo = ? AND ativo = 1", [strtoupper($cupomCodigo)]);
            if ($cupom && ($cupom['limite_uso'] == 0 || $cupom['usos_realizados'] < $cupom['limite_uso'])) {
                $cupomId = $cupom['id'];
                $desconto = $cupom['tipo'] === 'percentual' ? round($subtotal * $cupom['valor'] / 100, 2) : min($cupom['valor'], $subtotal);
                Database::update('cupons', ['usos_realizados' => $cupom['usos_realizados'] + 1], 'id = ?', [$cupomId]);
            }
        }

        $total = max(0, $subtotal - $desconto + $frete);
        $numero = 'RAT' . date('ymd') . strtoupper(substr(uniqid(), -6));

        $pedidoId = Database::insert('pedidos', [
            'numero_pedido' => $numero,
            'status' => 'pendente',
            'subtotal' => $subtotal,
            'desconto' => $desconto,
            'frete' => $frete,
            'total' => $total,
            'cupom_id' => $cupomId,
            'cupom_codigo' => strtoupper($cupomCodigo),
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
        ]);

        foreach ($itens as $item) {
            Database::insert('pedido_itens', [
                'pedido_id' => $pedidoId,
                'produto_id' => $item['produto_id'],
                'variacao_id' => $item['variacao_id'] ?? null,
                'nome_produto' => $item['nome'] ?? '',
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $item['preco'],
                'preco_total' => $item['preco'] * $item['quantidade'],
            ]);
            Database::query("UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?", [$item['quantidade'], $item['produto_id'], $item['quantidade']]);
        }

        try {
            $emailService = new EmailService();
            $emailService->enviarTemplate($input['email'] ?? '', 'confirmacao_pedido', [
                'assunto' => "Pedido #{$numero} - RATAPLAM",
                'nome' => $input['nome'] ?? 'Cliente',
                'numero' => $numero,
                'itens' => $itens,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'frete' => $frete,
                'total' => $total,
                'endereco' => "{$input['logradouro'] ?? ''}, {$input['numero'] ?? ''} - {$input['bairro'] ?? ''}, {$input['cidade'] ?? ''}/{$input['estado'] ?? ''}",
                'data' => date('d/m/Y H:i'),
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
            $dados = \Rataplam\Middleware\Auth::verificarOpcional();
            if ($dados) $usuarioId = $dados['id'] ?? null;
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
        if (!$pedido) { http_response_code(404); echo json_encode(['erro' => 'Pedido não encontrado']); exit; }
        $pedido['itens'] = Database::fetchAll("SELECT * FROM pedido_itens WHERE pedido_id = ?", [$id]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'pedido' => $pedido]);
        exit;
    }

    public static function atualizar(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $statusAnterior = Database::fetch("SELECT status, email_comprador, nome_comprador, numero_pedido FROM pedidos WHERE id = ?", [$id]);
        Database::update('pedidos', $input, 'id = ?', [$id]);

        if ($statusAnterior && isset($input['status']) && $input['status'] !== $statusAnterior['status']) {
            try {
                $emailService = new EmailService();
                $templateMap = [
                    'pago' => 'pagamento_aprovado',
                    'enviado' => 'pedido_enviado',
                    'cancelado' => 'pedido_cancelado',
                ];
                $template = $templateMap[$input['status']] ?? null;
                if ($template && $statusAnterior['email_comprador']) {
                    $emailService->enviarTemplate($statusAnterior['email_comprador'], $template, [
                        'assunto' => "Pedido {$statusAnterior['numero_pedido']} - " . ucfirst($input['status']) . " - RATAPLAM",
                        'nome' => $statusAnterior['nome_comprador'],
                        'numero' => $statusAnterior['numero_pedido'],
                        'status' => $input['status'],
                    ]);
                }
            } catch (\Throwable $e) { /* email falha silenciosamente */ }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }
}
