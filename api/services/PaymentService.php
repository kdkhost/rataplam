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
        $event = json_decode($payload, true);

        if (!$event || !isset($event['type'])) {
            return ['sucesso' => false, 'erro' => 'Payload inválido'];
        }

        switch ($event['type']) {
            case 'checkout.session.completed':
                $session = $event['data']['object'];
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'session_id' => $session['id'] ?? '',
                    'payment_intent' => $session['payment_intent'] ?? '',
                    'status' => $session['payment_status'] ?? '',
                    'customer_email' => $session['customer_email'] ?? '',
                    'metadata' => $session['metadata'] ?? [],
                ];

            case 'payment_intent.succeeded':
                $pi = $event['data']['object'];
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'payment_intent' => $pi['id'] ?? '',
                    'status' => $pi['status'] ?? '',
                    'amount' => ($pi['amount_received'] ?? 0) / 100,
                    'metadata' => $pi['metadata'] ?? [],
                ];

            case 'payment_intent.payment_failed':
                $pi = $event['data']['object'];
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'payment_intent' => $pi['id'] ?? '',
                    'status' => 'failed',
                    'metadata' => $pi['metadata'] ?? [],
                ];

            default:
                return [
                    'sucesso' => true,
                    'event_type' => $event['type'],
                    'ignorado' => true,
                ];
        }
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
        return match ($gateway) {
            'mercadopago' => $this->mpPublicKey,
            'stripe' => $this->stripePublishable,
            default => '',
        };
    }
}
