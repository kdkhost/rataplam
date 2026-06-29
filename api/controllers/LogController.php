<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class LogController
{
    public static function webhooks(): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $pagina = max(1, (int)($_GET['pagina'] ?? 1));
            $limite = 20;
            $offset = ($pagina - 1) * $limite;
            $gateway = $_GET['gateway'] ?? '';
            $processado = isset($_GET['processado']) ? (int)$_GET['processado'] : -1;

            $where = '1=1';
            $params = [];

            if ($gateway) {
                $where .= ' AND gateway = ?';
                $params[] = $gateway;
            }

            if ($processado >= 0) {
                $where .= ' AND processado = ?';
                $params[] = $processado;
            }

            $total = Database::fetch(
                "SELECT COUNT(*) as t FROM webhook_logs WHERE {$where}",
                $params
            );

            $logs = Database::fetchAll(
                "SELECT * FROM webhook_logs WHERE {$where} ORDER BY created_at DESC LIMIT {$limite} OFFSET {$offset}",
                $params
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'logs' => $logs,
                'total' => $total['t'] ?? 0,
                'total_paginas' => ceil(($total['t'] ?? 0) / $limite),
                'pagina' => $pagina,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar logs de webhooks', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function emails(): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $pagina = max(1, (int)($_GET['pagina'] ?? 1));
            $limite = 20;
            $offset = ($pagina - 1) * $limite;
            $status = $_GET['status'] ?? '';
            $busca = $_GET['busca'] ?? '';

            $where = '1=1';
            $params = [];

            if ($status) {
                $where .= ' AND status = ?';
                $params[] = $status;
            }

            if ($busca) {
                $where .= ' AND (destinatario LIKE ? OR assunto LIKE ?)';
                $params[] = "%{$busca}%";
                $params[] = "%{$busca}%";
            }

            $total = Database::fetch(
                "SELECT COUNT(*) as t FROM email_logs WHERE {$where}",
                $params
            );

            $logs = Database::fetchAll(
                "SELECT * FROM email_logs WHERE {$where} ORDER BY created_at DESC LIMIT {$limite} OFFSET {$offset}",
                $params
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'logs' => $logs,
                'total' => $total['t'] ?? 0,
                'total_paginas' => ceil(($total['t'] ?? 0) / $limite),
                'pagina' => $pagina,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar logs de emails', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function limpar(int $tipo): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $dias = max(1, (int)($_GET['dias'] ?? 30));
            $dataLimite = date('Y-m-d H:i:s', strtotime("-{$dias} days"));

            switch ($tipo) {
                case 1:
                    Database::query("DELETE FROM webhook_logs WHERE created_at < ?", [$dataLimite]);
                    $mensagem = "Logs de webhooks anteriores a {$dias} dias removidos";
                    break;

                case 2:
                    Database::query("DELETE FROM email_logs WHERE created_at < ?", [$dataLimite]);
                    $mensagem = "Logs de emails anteriores a {$dias} dias removidos";
                    break;

                case 3:
                    Database::query("DELETE FROM webhook_logs WHERE created_at < ?", [$dataLimite]);
                    Database::query("DELETE FROM email_logs WHERE created_at < ?", [$dataLimite]);
                    $mensagem = "Todos os logs anteriores a {$dias} dias removidos";
                    break;

                default:
                    http_response_code(400);
                    echo json_encode(['erro' => 'Tipo invalido. Use: 1 (webhooks), 2 (emails), 3 (todos)']);
                    exit;
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => $mensagem]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao limpar logs', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
