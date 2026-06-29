<?php
declare(strict_types=1);

namespace Rataplam\Middleware;

class CsrfProtection
{
    private static string $secret = '';

    public static function init(string $secret = ''): void
    {
        self::$secret = $secret ?: (getenv('CSRF_SECRET') ?: 'rataplam_csrf_' . md5('rataplam'));
    }

    public static function gerarToken(): string
    {
        $agora = time();
        $payload = $agora . '.' . bin2hex(random_bytes(16));
        $assinatura = hash_hmac('sha256', $payload, self::$secret);
        return base64_encode($payload . '.' . $assinatura);
    }

    public static function validarToken(string $token): bool
    {
        if (empty($token)) return false;

        $decoded = base64_decode($token, true);
        if ($decoded === false) return false;

        $parts = explode('.', $decoded);
        if (count($parts) !== 3) return false;

        list($timestamp, $random, $assinatura) = $parts;
        $payload = $timestamp . '.' . $random;
        $esperada = hash_hmac('sha256', $payload, self::$secret);

        if (!hash_equals($esperada, $assinatura)) return false;

        $agora = time();
        $tokenTime = (int) $timestamp;
        if ($agora - $tokenTime > 3600) return false;

        return true;
    }

    public static function verificar(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') return;

        $token = $_SERVER['HTTP_X_CSRF_TOKEN']
            ?? $_POST['_csrf_token']
            ?? '';

        if (!self::validarToken($token)) {
            http_response_code(403);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['erro' => 'Token CSRF invalido ou expirado']);
            exit;
        }
    }
}
