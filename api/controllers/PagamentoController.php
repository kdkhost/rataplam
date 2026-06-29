<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;
use Rataplam\Services\PaymentService;

class PagamentoController
{
    public static function criar(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $gateway = $input['gateway'] ?? 'mercadopago';
            $pedidoId = (int)($input['pedido_id'] ?? 0);

            if ($pedidoId <= 0) {
                http_response_code(400);
                echo json_encode(['erro' => 'Pedido invalido']);
                exit;
            }

            $pedido = Database::fetch(
                "SELECT * FROM pedidos WHERE id = ? AND status = 'pendente'",
                [$pedidoId]
            );

            if (!$pedido) {
                http_response_code(404);
                echo json_encode(['erro' => 'Pedido nao encontrado ou ja processado']);
                exit;
            }

            $paymentService = new PaymentService();
            $frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';

            $dadosPagamento = [
                'titulo' => "Pedido #{$pedido['numero_pedido']}",
                'valor' => (float)$pedido['total'],
                'quantidade' => 1,
                'email' => $pedido['email_comprador'] ?? '',
                'nome' => $pedido['nome_comprador'] ?? '',
                'pedido_numero' => $pedido['numero_pedido'],
            ];

            $resultado = null;

            switch ($gateway) {
                case 'mercadopago':
                    $dadosPagamento['webhook_url'] = (getenv('API_URL') ?: 'https://api.rataplam.com.br') . '/api/webhooks/mercadopago';
                    $dadosPagamento['endereco'] = [
                        'cep' => $pedido['cep_entrega'] ?? '',
                        'logradouro' => $pedido['logradouro_entrega'] ?? '',
                        'numero' => $pedido['numero_entrega'] ?? '',
                    ];
                    $resultado = $paymentService->criarPagamentoMercadoPago($dadosPagamento);
                    break;

                case 'stripe':
                    $dadosPagamento['success_url'] = $frontendUrl . "/pedido/{$pedido['numero_pedido']}/sucesso";
                    $dadosPagamento['cancel_url'] = $frontendUrl . "/pedido/{$pedido['numero_pedido']}/pagamento";
                    $resultado = $paymentService->criarPagamentoStripe($dadosPagamento);
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['erro' => 'Gateway de pagamento invalido. Use: mercadopago ou stripe']);
                    exit;
            }

            if (!$resultado || empty($resultado['sucesso'])) {
                http_response_code(400);
                echo json_encode(['erro' => $resultado['erro'] ?? 'Erro ao processar pagamento']);
                exit;
            }

            Database::update('pedidos', [
                'metodo_pagamento' => $gateway,
                'payment_id' => $resultado['payment_id'] ?? $resultado['session_id'] ?? null,
            ], 'id = ?', [$pedidoId]);

            Database::insert('pagamentos', [
                'pedido_id' => $pedidoId,
                'gateway' => $gateway,
                'payment_id' => $resultado['payment_id'] ?? $resultado['session_id'] ?? '',
                'valor' => $pedido['total'],
                'status' => 'pendente',
                'dados' => json_encode($resultado),
            ]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'gateway' => $gateway,
                'payment_id' => $resultado['payment_id'] ?? $resultado['session_id'] ?? '',
                'link_pagamento' => $resultado['link_pagamento'] ?? $resultado['url'] ?? null,
                'qr_code' => $resultado['qr_code'] ?? null,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar pagamento', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function status(int $id): void
    {
        try {
            $pagamento = Database::fetch(
                "SELECT pg.*, p.numero_pedido, p.status as pedido_status
                 FROM pagamentos pg
                 JOIN pedidos p ON pg.pedido_id = p.id
                 WHERE pg.id = ?",
                [$id]
            );

            if (!$pagamento) {
                http_response_code(404);
                echo json_encode(['erro' => 'Pagamento nao encontrado']);
                exit;
            }

            $dados = \Rataplam\Middleware\Auth::verificarOpcional();
            if ($dados && $dados['role'] !== 'admin') {
                $pedido = Database::fetch(
                    "SELECT usuario_id FROM pedidos WHERE id = ?",
                    [$pagamento['pedido_id']]
                );
                if ($pedido && ($pedido['usuario_id'] ?? null) !== $dados['id']) {
                    http_response_code(403);
                    echo json_encode(['erro' => 'Acesso negado']);
                    exit;
                }
            } elseif (!$dados) {
                http_response_code(401);
                echo json_encode(['erro' => 'Autenticacao obrigatoria']);
                exit;
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'pagamento' => $pagamento]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao consultar pagamento', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function webhookMercadoPago(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['erro' => 'Payload invalido']);
                exit;
            }

            $paymentService = new PaymentService();
            $resultado = $paymentService->webhookMercadoPago($input);

            Database::insert('webhook_logs', [
                'gateway' => 'mercadopago',
                'event_type' => $input['type'] ?? 'unknown',
                'payload' => json_encode($input),
                'processado' => $resultado['sucesso'] ? 1 : 0,
            ]);

            if ($resultado['sucesso'] && isset($resultado['external_reference'])) {
                $status = $paymentService->mapearStatus('mercadopago', $resultado['status'] ?? '');
                if ($status !== 'pendente') {
                    $pedido = Database::fetch(
                        "SELECT id, numero_pedido FROM pedidos WHERE numero_pedido = ? OR id = ?",
                        [$resultado['external_reference'], $resultado['external_reference']]
                    );

                    if ($pedido) {
                        Database::update('pedidos', ['status' => $status], 'id = ?', [$pedido['id']]);

                        Database::update('pagamentos', [
                            'status' => $status,
                            'dados' => json_encode($resultado),
                        ], 'pedido_id = ? AND gateway = ?', [$pedido['id'], 'mercadopago']);
                    }
                }
            }

            http_response_code(200);
            echo json_encode(['received' => true]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(200);
            echo json_encode(['received' => true]);
            exit;
        }
    }

    public static function webhookStripe(): void
    {
        try {
            $payload = file_get_contents('php://input');
            $signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
            $input = json_decode($payload, true);

            $paymentService = new PaymentService();
            $resultado = $paymentService->webhookStripe($payload, $signature);

            Database::insert('webhook_logs', [
                'gateway' => 'stripe',
                'event_type' => $input['type'] ?? 'unknown',
                'payload' => $payload,
                'processado' => $resultado['sucesso'] ? 1 : 0,
            ]);

            if ($resultado['sucesso'] && isset($resultado['pedido_numero']) && !empty($resultado['pedido_numero'])) {
                $status = $paymentService->mapearStatus('stripe', $resultado['status'] ?? '');
                if ($status !== 'pendente') {
                    $pedido = Database::fetch(
                        "SELECT id FROM pedidos WHERE numero_pedido = ?",
                        [$resultado['pedido_numero']]
                    );

                    if ($pedido) {
                        Database::update('pedidos', ['status' => $status], 'id = ?', [$pedido['id']]);

                        Database::update('pagamentos', [
                            'status' => $status,
                            'dados' => json_encode($resultado),
                        ], 'pedido_id = ? AND gateway = ?', [$pedido['id'], 'stripe']);
                    }
                }
            }

            http_response_code(200);
            echo json_encode(['received' => true]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(200);
            echo json_encode(['received' => true]);
            exit;
        }
    }
}
