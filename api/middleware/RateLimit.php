<?php
declare(strict_types=1);

namespace Rataplam\Middleware;

class RateLimit
{
    private static string $cacheDir = __DIR__ . '/../cache/ratelimit';

    public static function verificar(int $limite = 200, int $janelaSegundos = 60): bool
    {
        $ip = self::getIp();
        $chave = md5($ip);

        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }

        $arquivo = self::$cacheDir . '/' . $chave . '.json';
        $agora = time();

        $dados = ['requisicoes' => [], 'bloqueado_ate' => 0];

        if (file_exists($arquivo)) {
            $conteudo = file_get_contents($arquivo);
            if ($conteudo) {
                $dados = json_decode($conteudo, true) ?: $dados;
            }
        }

        if (($dados['bloqueado_ate'] ?? 0) > $agora) {
            http_response_code(429);
            header('Retry-After: ' . ($dados['bloqueado_ate'] - $agora));
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'erro' => 'Muitas requisicoes. Tente novamente em ' . ($dados['bloqueado_ate'] - $agora) . ' segundos.',
            ]);
            exit;
        }

        $dados['requisicoes'] = array_filter($dados['requisicoes'], fn($t) => $t > $agora - $janelaSegundos);
        $dados['requisicoes'][] = $agora;

        if (count($dados['requisicoes']) > $limite) {
            $dados['bloqueado_ate'] = $agora + $janelaSegundos;
            file_put_contents($arquivo, json_encode($dados));

            http_response_code(429);
            header('Retry-After: ' . $janelaSegundos);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'erro' => "Limite de {$limite} requisicoes por {$janelaSegundos}s excedido. Tente novamente mais tarde.",
            ]);
            exit;
        }

        file_put_contents($arquivo, json_encode($dados));
        return true;
    }

    private static function getIp(): string
    {
        $keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', $_SERVER[$key])[0];
                return trim($ip);
            }
        }
        return '0.0.0.0';
    }
}
