<?php
declare(strict_types=1);

namespace Rataplam\Middleware;

class Auth
{
    public static function verificar(): array
    {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($token)) {
            http_response_code(401);
            echo json_encode(['erro' => 'Token de autenticação não fornecido']);
            exit;
        }

        $token = str_replace('Bearer ', '', $token);
        $dados = self::validarToken($token);

        if (!$dados) {
            http_response_code(401);
            echo json_encode(['erro' => 'Token inválido ou expirado']);
            exit;
        }

        return $dados;
    }

    public static function verificarAdmin(): array
    {
        $dados = self::verificar();

        if ($dados['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['erro' => 'Acesso negado. Apenas administradores.']);
            exit;
        }

        return $dados;
    }

    public static function verificarOpcional(): ?array
    {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($token)) {
            return null;
        }

        $token = str_replace('Bearer ', '', $token);
        return self::validarToken($token);
    }

    private static function validarToken(string $token): ?array
    {
        \Rataplam\Config\Database::query("SET SESSION sql_mode = ''");

        $resultado = \Rataplam\Config\Database::fetch(
            "SELECT id, nome, email, role FROM usuarios WHERE id = (SELECT usuario_id FROM tokens WHERE token = ? AND expira_em > NOW())",
            [$token]
        );

        return $resultado;
    }

    public static function gerarToken(int $userId): string
    {
        $token = bin2hex(random_bytes(32));
        $expira = date('Y-m-d H:i:s', strtotime('+7 days'));

        \Rataplam\Config\Database::insert('tokens', [
            'usuario_id' => $userId,
            'token' => $token,
            'expira_em' => $expira,
        ]);

        return $token;
    }

    public static function revogarToken(string $token): bool
    {
        \Rataplam\Config\Database::delete('tokens', 'token = ?', [$token]);
        return true;
    }
}
