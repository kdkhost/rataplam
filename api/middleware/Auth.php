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
            echo json_encode(['erro' => 'Token de autenticacao nao fornecido']);
            exit;
        }

        $token = str_replace('Bearer ', '', $token);
        $dados = self::validarToken($token);

        if (!$dados) {
            http_response_code(401);
            echo json_encode(['erro' => 'Token invalido ou expirado']);
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
        // SECURITY FIX: Removed "SET SESSION sql_mode = ''" - should not be done per-request
        // SECURITY FIX: Added ativo check - deactivated users cannot authenticate
        $resultado = \Rataplam\Config\Database::fetch(
            "SELECT u.id, u.nome, u.email, u.role
             FROM usuarios u
             INNER JOIN tokens t ON t.usuario_id = u.id
             WHERE t.token = ? AND t.expira_em > " . \Rataplam\Config\Database::now() . " AND u.ativo = 1",
            [$token]
        );

        return $resultado;
    }

    public static function gerarToken(int $userId): string
    {
        $token = bin2hex(random_bytes(32));
        $expira = date('Y-m-d H:i:s', strtotime('+7 days'));

        // Clean up old tokens for this user (keep max 5 active sessions)
        $tokens = \Rataplam\Config\Database::fetchAll(
            "SELECT id FROM tokens WHERE usuario_id = ? ORDER BY expira_em DESC",
            [$userId]
        );
        if (count($tokens) > 4) {
            $oldIds = array_slice(array_column($tokens, 'id'), 5);
            if (!empty($oldIds)) {
                $placeholders = implode(',', array_fill(0, count($oldIds), '?'));
                \Rataplam\Config\Database::query("DELETE FROM tokens WHERE id IN ({$placeholders})", $oldIds);
            }
        }

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
