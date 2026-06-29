<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;
use Rataplam\Services\EmailService;

class CronController
{
    public static function executar(): void
    {
        $chaveSecreta = $_GET['key'] ?? $_SERVER['HTTP_X_CRON_KEY'] ?? '';
        $chaveEsperada = getenv('CRON_SECRET_KEY') ?: 'rataplam_cron_' . md5('rataplam');

        if ($chaveSecreta !== $chaveEsperada) {
            http_response_code(403);
            echo json_encode(['erro' => 'Chave de cron invalida']);
            exit;
        }

        $agora = date('Y-m-d H:i:s');
        $jobs = Database::fetchAll(
            "SELECT * FROM cron_jobs WHERE ativo = 1 AND (proxima_execucao IS NULL OR proxima_execucao <= ?) ORDER BY proxima_execucao ASC",
            [$agora]
        );

        $resultados = [];
        foreach ($jobs as $job) {
            $resultado = self::executarJob($job);
            $resultados[] = $resultado;
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'executados' => count($resultados),
            'resultados' => $resultados,
            'timestamp' => $agora,
        ]);
        exit;
    }

    private static function executarJob(array $job): array
    {
        $inicio = date('Y-m-d H:i:s');
        Database::update('cron_jobs', ['status' => 'executando'], 'id = ?', [$job['id']]);

        try {
            $resultado = match ($job['nome']) {
                'limpar_tokens_expirados' => self::limparTokensExpirados(),
                'limpar_carrinho_abandonado' => self::limparCarrinhoAbandonado(),
                'gerar_estatisticas_diarias' => self::gerarEstatisticasDiarias(),
                'enviar_emails_pendentes' => self::enviarEmailsPendentes(),
                'cancelar_pedidos_pendentes' => self::cancelarPedidosPendentes(),
                'atualizar_estoque_minimo' => self::atualizarEstoqueMinimo(),
                'limpar_logs_antigos' => self::limparLogsAntigos(),
                'sincronizar_webhooks' => self::sincronizarWebhooks(),
                default => ['mensagem' => 'Job nao implementado'],
            };

            $fim = date('Y-m-d H:i:s');
            $proximaExecucao = self::calcularProximaExecucao($job['expressao_cron']);

            Database::update('cron_jobs', [
                'status' => 'concluido',
                'ultimo_execucao' => $inicio,
                'proxima_execucao' => $proximaExecucao,
            ], 'id = ?', [$job['id']]);

            Database::insert('cron_logs', [
                'job_id' => $job['id'],
                'inicio' => $inicio,
                'fim' => $fim,
                'status' => 'sucesso',
                'mensagem' => $resultado['mensagem'] ?? 'OK',
                'dados_execucao' => json_encode($resultado['dados'] ?? []),
            ]);

            return ['job' => $job['nome'], 'status' => 'sucesso', 'mensagem' => $resultado['mensagem'] ?? 'OK'];

        } catch (\Throwable $e) {
            $fim = date('Y-m-d H:i:s');
            Database::update('cron_jobs', [
                'status' => 'erro',
                'ultimo_execucao' => $inicio,
                'proxima_execucao' => self::calcularProximaExecucao($job['expressao_cron']),
            ], 'id = ?', [$job['id']]);

            Database::insert('cron_logs', [
                'job_id' => $job['id'],
                'inicio' => $inicio,
                'fim' => $fim,
                'status' => 'erro',
                'mensagem' => $e->getMessage(),
            ]);

            return ['job' => $job['nome'], 'status' => 'erro', 'mensagem' => $e->getMessage()];
        }
    }

    private static function limparTokensExpirados(): array
    {
        $deleted = Database::delete('tokens', 'expira_em < NOW()');
        return ['mensagem' => "Tokens expirados removidos: {$deleted}", 'dados' => ['removidos' => $deleted]];
    }

    private static function limparCarrinhoAbandonado(): array
    {
        $deleted = Database::delete('carrinho', 'updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)');
        return ['mensagem' => "Itens de carrinho abandonado removidos: {$deleted}", 'dados' => ['removidos' => $deleted]];
    }

    private static function gerarEstatisticasDiarias(): array
    {
        $hoje = date('Y-m-d', strtotime('-1 day'));
        $existe = Database::count('visitas_diarias', 'data = ?', [$hoje]);
        if ($existe === 0) {
            $visitas = Database::fetch("SELECT COUNT(*) as t FROM visitas WHERE DATE(created_at) = ?", [$hoje]);
            $unicas = Database::fetch("SELECT COUNT(DISTINCT session_id) as t FROM visitas WHERE DATE(created_at) = ?", [$hoje]);
            if (($visitas['t'] ?? 0) > 0) {
                Database::insert('visitas_diarias', [
                    'data' => $hoje,
                    'total_visitas' => $visitas['t'] ?? 0,
                    'visitas_unicas' => $unicas['t'] ?? 0,
                ]);
            }
        }
        return ['mensagem' => "Estatisticas diarias geradas para {$hoje}"];
    }

    private static function enviarEmailsPendentes(): array
    {
        $emails = Database::fetchAll(
            "SELECT * FROM email_logs WHERE status = 'erro' ORDER BY created_at DESC LIMIT 10"
        );
        $enviados = 0;
        try {
            $emailService = new EmailService();
            foreach ($emails as $email) {
                $dados = json_decode($email['dados'] ?? '{}', true);
                $resultado = $emailService->enviar($email['destinatario'], $email['assunto'], '', $email['template'], $dados);
                if ($resultado) {
                    Database::update('email_logs', ['status' => 'enviado'], 'id = ?', [$email['id']]);
                    $enviados++;
                }
            }
        } catch (\Throwable $e) {
            // falha silenciosa
        }
        return ['mensagem' => "Emails reenviados: {$enviados}", 'dados' => ['enviados' => $enviados]];
    }

    private static function cancelarPedidosPendentes(): array
    {
        $pedidos = Database::fetchAll(
            "SELECT id, email_comprador, nome_comprador, numero_pedido FROM pedidos WHERE status = 'pendente' AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        );
        $cancelados = 0;
        foreach ($pedidos as $pedido) {
            Database::update('pedidos', ['status' => 'cancelado'], 'id = ?', [$pedido['id']]);
            Database::query("UPDATE produtos p JOIN pedido_itens pi ON p.id = pi.produto_id SET p.estoque = p.estoque + pi.quantidade WHERE pi.pedido_id = ?", [$pedido['id']]);
            if ($pedido['email_comprador']) {
                try {
                    $emailService = new EmailService();
                    $emailService->enviarTemplate($pedido['email_comprador'], 'pedido_cancelado', [
                        'assunto' => "Pedido {$pedido['numero_pedido']} cancelado - RATAPLAM",
                        'nome' => $pedido['nome_comprador'],
                        'numero' => $pedido['numero_pedido'],
                    ]);
                } catch (\Throwable $e) { /* falha silenciosa */ }
            }
            $cancelados++;
        }
        return ['mensagem' => "Pedidos pendentes cancelados: {$cancelados}", 'dados' => ['cancelados' => $cancelados]];
    }

    private static function atualizarEstoqueMinimo(): array
    {
        $baixos = Database::fetchAll(
            "SELECT nome, estoque, estoque_minimo FROM produtos WHERE estoque <= estoque_minimo AND estoque_minimo > 0 AND ativo = 1"
        );
        return [
            'mensagem' => count($baixos) . " produtos com estoque baixo",
            'dados' => ['produtos_baixos' => $baixos],
        ];
    }

    private static function limparLogsAntigos(): array
    {
        $deletedWebhooks = Database::delete('webhook_logs', 'created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)');
        $deletedEmails = Database::delete('email_logs', 'created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)');
        $deletedCron = Database::delete('cron_logs', 'criado_em < DATE_SUB(NOW(), INTERVAL 90 DAY)');
        return [
            'mensagem' => "Logs antigos removidos: {$deletedWebhooks} webhooks, {$deletedEmails} emails, {$deletedCron} cron",
            'dados' => ['webhooks' => $deletedWebhooks, 'emails' => $deletedEmails, 'cron' => $deletedCron],
        ];
    }

    private static function sincronizarWebhooks(): array
    {
        $pendentes = Database::fetchAll(
            "SELECT * FROM webhook_logs WHERE processado = 0 ORDER BY created_at ASC LIMIT 20"
        );
        $processados = 0;
        foreach ($pendentes as $log) {
            $payload = json_decode($log['payload'] ?? '{}', true);
            if ($log['gateway'] === 'mercadopago' && ($payload['type'] ?? '') === 'payment') {
                $paymentId = $payload['data']['id'] ?? '';
                if ($paymentId) {
                    $pedido = Database::fetch(
                        "SELECT id, numero_pedido, email_comprador, nome_comprador FROM pedidos WHERE numero_pedido = ? OR id = ?",
                        [$payload['external_reference'] ?? '', $payload['external_reference'] ?? 0]
                    );
                    if ($pedido) {
                        $status = match ($payload['data']['status'] ?? '') {
                            'approved' => 'pago',
                            'cancelled' => 'cancelado',
                            'refunded' => 'reembolsado',
                            default => 'pendente',
                        };
                        if ($status !== 'pendente') {
                            Database::update('pedidos', ['status' => $status], 'id = ?', [$pedido['id']]);
                        }
                    }
                }
            }
            Database::update('webhook_logs', ['processado' => 1], 'id = ?', [$log['id']]);
            $processados++;
        }
        return ['mensagem' => "Webhooks processados: {$processados}", 'dados' => ['processados' => $processados]];
    }

    private static function calcularProximaExecucao(string $cronExpr): string
    {
        $parts = explode(' ', $cronExpr);
        if (count($parts) < 5) return date('Y-m-d H:i:s', strtotime('+1 hour'));

        $minuto = $parts[0];
        $hora = $parts[1];

        if (str_contains($minuto, '*/')) {
            $intervalo = (int) str_replace('*/', '', $minuto);
            return date('Y-m-d H:i:s', time() + ($intervalo * 60));
        }
        if (str_contains($hora, '*/')) {
            $intervalo = (int) str_replace('*/', '', $hora);
            return date('Y-m-d H:i:s', time() + ($intervalo * 3600));
        }

        $proxima = strtotime('tomorrow ' . str_pad($hora, 2, '0', STR_PAD_LEFT) . ':' . str_pad($minuto, 2, '0', STR_PAD_LEFT));
        return date('Y-m-d H:i:s', $proxima);
    }

    public static function status(): void
    {
        $jobs = Database::fetchAll("SELECT id, nome, descricao, expressao_cron, ultimo_execucao, proxima_execucao, status, ativo FROM cron_jobs ORDER BY nome");
        $logs = Database::fetchAll("SELECT cl.*, cj.nome as job_nome FROM cron_logs cl JOIN cron_jobs cj ON cl.job_id = cj.id ORDER BY cl.criado_em DESC LIMIT 50");

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'jobs' => $jobs, 'logs' => $logs]);
        exit;
    }

    public static function toggleJob(int $id): void
    {
        $job = Database::fetch("SELECT * FROM cron_jobs WHERE id = ?", [$id]);
        if (!$job) {
            http_response_code(404);
            echo json_encode(['erro' => 'Job nao encontrado']);
            exit;
        }
        Database::update('cron_jobs', ['ativo' => $job['ativo'] ? 0 : 1], 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'ativo' => !$job['ativo']]);
        exit;
    }

    public static function executarJob(int $id): void
    {
        $job = Database::fetch("SELECT * FROM cron_jobs WHERE id = ?", [$id]);
        if (!$job) {
            http_response_code(404);
            echo json_encode(['erro' => 'Job nao encontrado']);
            exit;
        }
        $resultado = self::executarJob($job);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($resultado);
        exit;
    }
}
