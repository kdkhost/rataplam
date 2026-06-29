<?php
declare(strict_types=1);

namespace Rataplam\Services;

use Rataplam\Config\Config;

class PaymentService
{
    private string $mpAccessToken;
    private string $mpPublicKey;
    private string $stripeSecret;
    private string $stripePublishable;
    private string $stripeWebhookSecret;

    public function __construct()
    {
        $this->mpAccessToken = Config::get('mercadopago_access_token', '');
        $this->mpPublicKey = Config::get('mercadopago_public_key', '');
        $this->stripeSecret = Config::get('stripe_secret_key', '');
        $this->stripePublishable = Config::get('stripe_publishable_key', '');
        $this->stripeWebhookSecret = Config::get('stripe_webhook_secret', '');
    }

    // ============================================
    // MERCADOPAGO
    // ============================================

    public function criarPagamentoMercadoPago(array $dados): array
    {
        $payload = [
            'items' => [
                [
                    'title' => $dados['titulo'] ?? 'Pedido RATAPLAM',
                    'quantity' => $dados['quantidade'] ?? 1,
                    'unit_price' => (float) $dados['valor'],
                    'currency_id' => 'BRL',
                ]
            ],
            'payer' => [
                'email' => $dados['email'] ?? '',
                'name' => $dados['nome'] ?? '',
            ],
            'external_reference' => $dados['pedido_numero'] ?? '',
            'notification_url' => $dados['webhook_url'] ?? '',
            'payment_methods' => [
                'installments' => $dados['parcelas'] ?? 1,
            ],
            'statement_descriptor' => 'RATAPLAM',
        ];

        if (isset($dados['endereco'])) {
            $payload['payer']['address'] = [
                'zip_code' => $dados['endereco']['cep'] ?? '',
                'street_name' => $dados['endereco']['logradouro'] ?? '',
                'street_number' => $dados['endereco']['numero'] ?? '',
            ];
        }

        $resultado = $this->requisicaoMP('POST', '/v1/payments', $payload);

        if (isset($resultado['id'])) {
            return [
                'sucesso' => true,
                'payment_id' => $resultado['id'],
                'status' => $resultado['status'],
                'status_detail' => $resultado['status_detail'] ?? '',
                'link_pagamento' => $resultado['point_of_interaction']['transaction_data']['ticket_url'] ?? null,
                'qr_code' => $resultado['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null,
            ];
        }

        return [
            'sucesso' => false,
            'erro' => $resultado['message'] ?? 'Erro ao criar pagamento',
        ];
    }

    public function consultarPagamentoMercadoPago(string $paymentId): array
    {
        return $this->requisicaoMP('GET', "/v1/payments/{$paymentId}");
    }

    public function webhookMercadoPago(array $payload): array
    {
        $tipo = $payload['type'] ?? '';
        $id = $payload['data']['id'] ?? '';

        if ($tipo === 'payment' && $id) {
            $pagamento = $this->consultarPagamentoMercadoPago((string) $id);

            return [
                'sucesso' => true,
                'payment_id' => $pagamento['id'] ?? $id,
                'status' => $pagamento['status'] ?? '',
                'status_detail' => $pagamento['status_detail'] ?? '',
                'external_reference' => $pagamento['external_reference'] ?? '',
                'transaction_amount' => $pagamento['transaction_amount'] ?? 0,
                'payment_method_id' => $pagamento['payment_method_id'] ?? '',
                'payer_email' => $pagamento['payer']['email'] ?? '',
                'card_last_four' => $pagamento['card'] ? $pagamento['card']['last_four_digits'] ?? '' : '',
                'card_brand' => $pagamento['card'] ? $pagamento['card']['brand'] ?? '' : '',
                'installments' => $pagamento['installments'] ?? 1,
            ];
        }

        return ['sucesso' => false, 'erro' => 'Evento não processado'];
    }

    private function requisicaoMP(string $method, string $endpoint, array $data = []): array
    {
        $url = "https://api.mercadopago.com{$endpoint}";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->mpAccessToken,
            ],
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($response, true);

        if ($httpCode >= 400) {
            return ['erro' => $decoded['message'] ?? 'Erro na requisição', 'status' => $httpCode];
        }

        return $decoded ?? [];
    }

    // ============================================
    // STRIPE
    // ============================================

    public function criarPagamentoStripe(array $dados): array
    {
        $payload = [
            'payment_method_types' => ['card', 'boleto'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => 'brl',
                        'product_data' => [
                            'name' => $dados['titulo'] ?? 'Pedido RATAPLAM',
                        ],
                        'unit_amount' => (int) ($dados['valor'] * 100),
                    ],
                    'quantity' => $dados['quantidade'] ?? 1,
                ]
            ],
            'mode' => 'payment',
            'success_url' => $dados['success_url'] ?? '',
            'cancel_url' => $dados['cancel_url'] ?? '',
            'customer_email' => $dados['email'] ?? '',
            'metadata' => [
                'pedido_numero' => $dados['pedido_numero'] ?? '',
            ],
        ];

        $resultado = $this->requisicaoStripe('POST', '/v1/checkout/sessions', $payload);

        if (isset($resultado['id'])) {
            return [
                'sucesso' => true,
                'session_id' => $resultado['id'],
                'url' => $resultado['url'] ?? '',
            ];
        }

        return [
            'sucesso' => false,
            'erro' => $resultado['error']['message'] ?? 'Erro ao criar sessão Stripe',
        ];
    }

    public function webhookStripe(string $payload, string $signature): array
    {
        // CRITICAL FIX: Verify Stripe webhook signature
        if (!empty($this->stripeWebhookSecret) && !empty($signature)) {
            $timestamp = $this->extractStripeTimestamp($signature);
            $signedPayload = $this->extractStripeSignedPayload($signature);

            if (!$timestamp || !$signedPayload) {
                return ['sucesso' => false, 'erro' => 'Assinatura Stripe invalida'];
            }

            // Verify timestamp is within 5 minutes
            if (abs(time() - $timestamp) > 300) {
                return ['sucesso' => false, 'erro' => 'Timestamp do webhook fora do limite'];
            }

            $expectedSig = hash_hmac('sha256', "{$timestamp}.{$payload}", $this->stripeWebhookSecret);
            if (!hash_equals($expectedSig, $signedPayload)) {
                return ['sucesso' => false, 'erro' => 'Assinatura Stripe nao confere'];
            }
        }

        $event = json_decode($payload, true);

        if (!$event || !isset($event['type'])) {
            return ['sucesso' => false, 'erro' => 'Payload invalido'];
        }

        // Process webhook immediately instead of waiting for cron
        $resultado = $this->processarWebhookStripe($event);

        return $resultado;
    }

    private function processarWebhookStripe(array $event): array
    {
        switch ($event['type']) {
            case 'checkout.session.completed':
                $session = $event['data']['object'];
                $pedidoNumero = $session['metadata']['pedido_numero'] ?? $session['external_reference'] ?? '';
                if ($pedidoNumero) {
                    $this->atualizarPedidoStripe($pedidoNumero, 'pago');
                }
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'session_id' => $session['id'] ?? '',
                    'status' => $session['payment_status'] ?? '',
                    'pedido_numero' => $pedidoNumero,
                ];

            case 'payment_intent.succeeded':
                $pi = $event['data']['object'];
                $pedidoNumero = $pi['metadata']['pedido_numero'] ?? '';
                if ($pedidoNumero) {
                    $this->atualizarPedidoStripe($pedidoNumero, 'pago');
                }
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'payment_intent' => $pi['id'] ?? '',
                    'status' => 'pago',
                ];

            case 'payment_intent.payment_failed':
                $pi = $event['data']['object'];
                $pedidoNumero = $pi['metadata']['pedido_numero'] ?? '';
                if ($pedidoNumero) {
                    $this->atualizarPedidoStripe($pedidoNumero, 'cancelado');
                }
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'status' => 'cancelado',
                ];

            default:
                return ['sucesso' => true, 'event_type' => $event['type'], 'ignorado' => true];
        }
    }

    private function atualizarPedidoStripe(string $pedidoNumero, string $status): void
    {
        \Rataplam\Config\Database::update('pedidos', ['status' => $status], 'numero_pedido = ?', [$pedidoNumero]);
    }

    private function extractStripeTimestamp(string $signature): ?int
    {
        $pairs = explode(',', $signature);
        foreach ($pairs as $pair) {
            [$key, $value] = explode('=', $pair, 2);
            if ($key === 't') return (int) $value;
        }
        return null;
    }

    private function extractStripeSignedPayload(string $signature): ?string
    {
        $pairs = explode(',', $signature);
        foreach ($pairs as $pair) {
            [$key, $value] = explode('=', $pair, 2);
            if ($key === 'v1') return $value;
        }
        return null;
    }

    private function requisicaoStripe(string $method, string $endpoint, array $data = []): array
    {
        $url = "https://api.stripe.com{$endpoint}";

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->stripeSecret,
                'Content-Type: application/x-www-form-urlencoded',
            ],
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }

        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true) ?? [];
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================

    public function mapearStatus(string $gateway, string $status): string
    {
        $mapa = [
            'mercadopago' => [
                'approved' => 'pago',
                'pending' => 'pendente',
                'authorized' => 'pago',
                'in_process' => 'processando',
                'in_bank_transfer' => 'pendente',
                'cancelled' => 'cancelado',
                'refunded' => 'reembolsado',
                'charged_back' => 'reembolsado',
            ],
            'stripe' => [
                'succeeded' => 'pago',
                'pending' => 'pendente',
                'processing' => 'processando',
                'requires_payment_method' => 'pendente',
                'requires_confirmation' => 'pendente',
                'requires_action' => 'pendente',
                'canceled' => 'cancelado',
                'failed' => 'cancelado',
            ],
        ];

        return $mapa[$gateway][$status] ?? 'pendente';
    }

    public function getPublicKey(string $gateway): string
    {
        switch ($gateway) {
            case 'mercadopago': return $this->mpPublicKey;
            case 'stripe': return $this->stripePublishable;
            default: return '';
        }
    }
}
