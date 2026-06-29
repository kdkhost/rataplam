<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;
use Rataplam\Services\CepService;

class VisitaController
{
    public static function registrar(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $url = $input['url'] ?? '/';
        $sessionId = $input['session_id'] ?? self::gerarSessionId();
        $referrer = $input['referrer'] ?? $_SERVER['HTTP_REFERER'] ?? '';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ip = self::obterIP();

        $dispositivo = self::detectarDispositivo($userAgent);
        $navegador = self::detectarNavegador($userAgent);
        $so = self::detectarSO($userAgent);
        $pagina = self::extrairPagina($url);

        $jaVisitou = Database::count(
            'visitas',
            'session_id = ? AND DATE(created_at) = CURDATE() AND url = ?',
            [$sessionId, $url]
        );

        if ($jaVisitou === 0) {
            Database::insert('visitas', [
                'session_id' => $sessionId,
                'ip' => $ip,
                'user_agent' => $userAgent,
                'url' => $url,
                'pagina' => $pagina,
                'referrer' => $referrer,
                'dispositivo' => $dispositivo,
                'navegador' => $navegador,
                'sistema_operacional' => $so,
                'idioma' => substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'pt-BR', 0, 10),
            ]);

            self::atualizarEstatisticasDiarias($url, $dispositivo);
            self::atualizarPaginasVisitadas($pagina);
        }

        $totalHoje = Database::count('visitas', 'DATE(created_at) = CURDATE()');
        $totalUnicasHoje = Database::fetch(
            'SELECT COUNT(DISTINCT session_id) as total FROM visitas WHERE DATE(created_at) = CURDATE()'
        );
        $totalGeral = Database::count('visitas');

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'stats' => [
                'hoje' => $totalHoje,
                'hoje_unicas' => (int) ($totalUnicasHoje['total'] ?? 0),
                'total' => $totalGeral,
                'session_id' => $sessionId,
            ]
        ]);
        exit;
    }

    public static function atualizarDuracao(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $sessionId = $input['session_id'] ?? '';
        $url = $input['url'] ?? '';
        $duracao = (int) ($input['duracao'] ?? 0);
        $scroll = (int) ($input['scroll'] ?? 0);

        if ($sessionId && $duracao > 0) {
            Database::query(
                "UPDATE visitas SET duracao_segundos = ?, scroll_percent = ? WHERE session_id = ? AND url = ? ORDER BY id DESC LIMIT 1",
                [$duracao, $scroll, $sessionId, $url]
            );
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function estatisticas(): void
    {
        $periodo = $_GET['periodo'] ?? '7d';

        switch ($periodo) {
            case '24h': $whereData = 'created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'; break;
            case '30d': $whereData = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'; break;
            case '90d': $whereData = 'created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)'; break;
            case '7d':
            default: $whereData = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'; break;
        }

        $totalVisitas = Database::count('visitas', $whereData);
        $totalUnicas = Database::fetch(
            "SELECT COUNT(DISTINCT session_id) as total FROM visitas WHERE {$whereData}"
        );

        $porDia = Database::fetchAll(
            "SELECT DATE(created_at) as data, COUNT(*) as total, COUNT(DISTINCT session_id) as unicas
             FROM visitas WHERE {$whereData}
             GROUP BY DATE(created_at) ORDER BY data ASC"
        );

        $porDispositivo = Database::fetchAll(
            "SELECT dispositivo, COUNT(*) as total FROM visitas WHERE {$whereData} GROUP BY dispositivo"
        );

        $porPagina = Database::fetchAll(
            "SELECT pagina, COUNT(*) as total FROM visitas WHERE {$whereData} AND pagina IS NOT NULL GROUP BY pagina ORDER BY total DESC LIMIT 10"
        );

        $porHora = Database::fetchAll(
            "SELECT HOUR(created_at) as hora, COUNT(*) as total FROM visitas WHERE {$whereData} GROUP BY HOUR(created_at) ORDER BY hora ASC"
        );

        $duracaoMedia = Database::fetch(
            "SELECT AVG(duracao_segundos) as media, AVG(scroll_percent) as scroll_media FROM visitas WHERE {$whereData} AND duracao_segundos > 0"
        );

        $topReferrers = Database::fetchAll(
            "SELECT referrer, COUNT(*) as total FROM visitas WHERE {$whereData} AND referrer != '' GROUP BY referrer ORDER BY total DESC LIMIT 10"
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'periodo' => $periodo,
            'resumo' => [
                'total_visitas' => $totalVisitas,
                'visitantes_unicos' => (int) ($totalUnicas['total'] ?? 0),
                'duracao_media' => round((float) ($duracaoMedia['media'] ?? 0)),
                'scroll_medio' => round((float) ($duracaoMedia['scroll_media'] ?? 0)),
            ],
            'por_dia' => $porDia,
            'por_dispositivo' => $porDispositivo,
            'por_pagina' => $porPagina,
            'por_hora' => $porHora,
            'top_referrers' => $topReferrers,
        ]);
        exit;
    }

    public static function kpis(): void
    {
        $hoje = date('Y-m-d');
        $ontem = date('Y-m-d', strtotime('-1 day'));
        $semanaPassada = date('Y-m-d', strtotime('-7 days'));
        $mesPassado = date('Y-m-d', strtotime('-30 days'));

        $visitasHoje = Database::count('visitas', 'DATE(created_at) = ?', [$hoje]);
        $visitasOntem = Database::count('visitas', 'DATE(created_at) = ?', [$ontem]);

        $visitasSemana = Database::count('visitas', 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        $visitasSemanaAnterior = Database::count(
            'visitas',
            'created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );

        $visitasMes = Database::count('visitas', 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
        $visitasMesAnterior = Database::count(
            'visitas',
            'created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );

        $uniquesHoje = Database::fetch(
            'SELECT COUNT(DISTINCT session_id) as total FROM visitas WHERE DATE(created_at) = ?', [$hoje]
        );
        $uniquesOntem = Database::fetch(
            'SELECT COUNT(DISTINCT session_id) as total FROM visitas WHERE DATE(created_at) = ?', [$ontem]
        );

        $totalGeral = Database::count('visitas');

        $paginasHoje = Database::fetch(
            'SELECT COUNT(*) as total FROM visitas WHERE DATE(created_at) = ?', [$hoje]
        );
        $paginasOntem = Database::fetch(
            'SELECT COUNT(*) as total FROM visitas WHERE DATE(created_at) = ?', [$ontem]
        );

        $duracaoMedia = Database::fetch(
            'SELECT AVG(duracao_segundos) as media FROM visitas WHERE DATE(created_at) = ? AND duracao_segundos > 0', [$hoje]
        );

        $bounceRate = Database::fetch(
            "SELECT 
                (SELECT COUNT(*) FROM visitas WHERE DATE(created_at) = ? AND duracao_segundos < 10) as saltaram,
                (SELECT COUNT(*) FROM visitas WHERE DATE(created_at) = ?) as total", [$hoje, $hoje]
        );

        $taxaConversao = 0;
        $pedidosHoje = Database::count('pedidos', 'DATE(created_at) = ? AND status != "cancelado"', [$hoje]);
        if ($visitasHoje > 0) {
            $taxaConversao = round(($pedidosHoje / $visitasHoje) * 100, 2);
        }

        $receitaHoje = Database::fetch(
            'SELECT COALESCE(SUM(total), 0) as total FROM pedidos WHERE DATE(created_at) = ? AND status IN ("pago", "enviado", "entregue")', [$hoje]
        );

        $ticketMedio = Database::fetch(
            'SELECT COALESCE(AVG(total), 0) as media FROM pedidos WHERE DATE(created_at) = ? AND status IN ("pago", "enviado", "entregue")', [$hoje]
        );

        $crescimentoVisitasHoje = $visitasOntem > 0
            ? round((($visitasHoje - $visitasOntem) / $visitasOntem) * 100, 1)
            : ($visitasHoje > 0 ? 100 : 0);

        $crescimentoVisitasSemana = $visitasSemanaAnterior > 0
            ? round((($visitasSemana - $visitasSemanaAnterior) / $visitasSemanaAnterior) * 100, 1)
            : ($visitasSemana > 0 ? 100 : 0);

        $crescimentoVisitasMes = $visitasMesAnterior > 0
            ? round((($visitasMes - $visitasMesAnterior) / $visitasMesAnterior) * 100, 1)
            : ($visitasMes > 0 ? 100 : 0);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'kpis' => [
                'visitas_hoje' => $visitasHoje,
                'visitas_ontem' => $visitasOntem,
                'crescimento_hoje' => $crescimentoVisitasHoje,
                'uniques_hoje' => (int) ($uniquesHoje['total'] ?? 0),
                'uniques_ontem' => (int) ($uniquesOntem['total'] ?? 0),
                'visitas_semana' => $visitasSemana,
                'crescimento_semana' => $crescimentoVisitasSemana,
                'visitas_mes' => $visitasMes,
                'crescimento_mes' => $crescimentoVisitasMes,
                'total_geral' => $totalGeral,
                'paginas_hoje' => (int) ($paginasHoje['total'] ?? 0),
                'duracao_media' => round((float) ($duracaoMedia['media'] ?? 0)),
                'bounce_rate' => $bounceRate['total'] > 0
                    ? round((($bounceRate['saltaram'] ?? 0) / $bounceRate['total']) * 100, 1)
                    : 0,
                'taxa_conversao' => $taxaConversao,
                'receita_hoje' => (float) ($receitaHoje['total'] ?? 0),
                'ticket_medio' => (float) ($ticketMedio['media'] ?? 0),
                'pedidos_hoje' => $pedidosHoje,
            ]
        ]);
        exit;
    }

    public static function online(): void
    {
        $online = Database::fetch(
            'SELECT COUNT(DISTINCT session_id) as total FROM visitas WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)'
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'online' => (int) ($online['total'] ?? 0),
        ]);
        exit;
    }

    private static function gerarSessionId(): string
    {
        return md5(uniqid((string) mt_rand(), true));
    }

    private static function obterIP(): string
    {
        $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                return trim($ip);
            }
        }
        return '0.0.0.0';
    }

    private static function detectarDispositivo(string $ua): string
    {
        if (preg_match('/tablet|ipad/i', $ua)) return 'tablet';
        if (preg_match('/mobile|android|iphone|ipod/i', $ua)) return 'mobile';
        return 'desktop';
    }

    private static function detectarNavegador(string $ua): string
    {
        $browsers = [
            'Edge' => '/Edg[e\/]/i',
            'Chrome' => '/Chrome/i',
            'Firefox' => '/Firefox/i',
            'Safari' => '/Safari/i',
            'Opera' => '/OPR|Opera/i',
            'IE' => '/MSIE|Trident/i',
        ];
        foreach ($browsers as $nome => $pattern) {
            if (preg_match($pattern, $ua)) return $nome;
        }
        return 'Outro';
    }

    private static function detectarSO(string $ua): string
    {
        $systems = [
            'Windows' => '/Windows/i',
            'macOS' => '/Mac OS/i',
            'Linux' => '/Linux/i',
            'Android' => '/Android/i',
            'iOS' => '/iPhone|iPad|iPod/i',
        ];
        foreach ($systems as $nome => $pattern) {
            if (preg_match($pattern, $ua)) return $nome;
        }
        return 'Outro';
    }

    private static function extrairPagina(string $url): string
    {
        $parsed = parse_url($url);
        return $parsed['path'] ?? '/';
    }

    private static function atualizarEstatisticasDiarias(string $url, string $dispositivo): void
    {
        $hoje = date('Y-m-d');
        $existe = Database::count('visitas_diarias', 'data = ?', [$hoje]);

        $campoDispositivo = $dispositivo;

        if ($existe === 0) {
            Database::insert('visitas_diarias', [
                'data' => $hoje,
                'total_visitas' => 1,
                'visitas_unicas' => 1,
                'page_views' => 1,
                $campoDispositivo => 1,
            ]);
        } else {
            Database::query(
                "UPDATE visitas_diarias SET total_visitas = total_visitas + 1, page_views = page_views + 1, {$campoDispositivo} = {$campoDispositivo} + 1 WHERE data = ?",
                [$hoje]
            );
        }
    }

    private static function atualizarPaginasVisitadas(string $pagina): void
    {
        $hoje = date('Y-m-d');
        $existe = Database::count('paginas_mais_visitadas', 'data = ? AND pagina = ?', [$hoje, $pagina]);

        if ($existe === 0) {
            Database::insert('paginas_mais_visitadas', [
                'data' => $hoje,
                'pagina' => $pagina,
                'visualizacoes' => 1,
                'visitantes_unicos' => 1,
            ]);
        } else {
            Database::query(
                "UPDATE paginas_mais_visitadas SET visualizacoes = visualizacoes + 1 WHERE data = ? AND pagina = ?",
                [$hoje, $pagina]
            );
        }
    }
}
