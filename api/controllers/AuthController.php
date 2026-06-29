<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class AuthController
{
    public static function login(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $senha = $input['senha'] ?? '';

        if (empty($email) || empty($senha)) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail e senha sao obrigatorios']);
            exit;
        }

        $usuario = Database::fetch("SELECT * FROM usuarios WHERE email = ? AND ativo = 1", [$email]);

        if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'E-mail ou senha invalidos']);
            exit;
        }

        Database::update('usuarios', ['ultimo_login' => date('Y-m-d H:i:s')], 'id = ?', [$usuario['id']]);

        $token = \Rataplam\Middleware\Auth::gerarToken($usuario['id']);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'token' => $token,
            'usuario' => [
                'id' => $usuario['id'],
                'nome' => $usuario['nome'],
                'email' => $usuario['email'],
                'role' => $usuario['role'],
            ],
        ]);
        exit;
    }

    public static function cadastro(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $nome = trim($input['nome'] ?? '');
        $email = trim($input['email'] ?? '');
        $senha = $input['senha'] ?? '';

        if (empty($nome) || empty($email) || empty($senha)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, e-mail e senha sao obrigatorios']);
            exit;
        }

        if (strlen($senha) < 6) {
            http_response_code(400);
            echo json_encode(['erro' => 'A senha deve ter no minimo 6 caracteres']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail invalido']);
            exit;
        }

        $existente = Database::count('usuarios', 'email = ?', [$email]);
        if ($existente) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail ja cadastrado']);
            exit;
        }

        $id = Database::insert('usuarios', [
            'nome' => $nome,
            'email' => $email,
            'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
            'cpf' => preg_replace('/\D/', '', $input['cpf'] ?? ''),
            'telefone' => preg_replace('/\D/', '', $input['telefone'] ?? ''),
            'role' => 'cliente',
            'ativo' => 1,
        ]);

        $token = \Rataplam\Middleware\Auth::gerarToken($id);

        // Send welcome email
        try {
            $emailService = new \Rataplam\Services\EmailService();
            $emailService->enviarTemplate($email, 'boas-vindas', [
                'assunto' => 'Bem-vindo a RATAPLAM!',
                'nome' => $nome,
            ]);
        } catch (\Throwable $e) { /* email falha silenciosamente */ }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'token' => $token,
            'usuario' => ['id' => $id, 'nome' => $nome, 'email' => $email, 'role' => 'cliente'],
        ]);
        exit;
    }

    public static function me(): void
    {
        $dados = \Rataplam\Middleware\Auth::verificar();
        $usuario = Database::fetch("SELECT id, nome, email, cpf, telefone, role, ativo FROM usuarios WHERE id = ?", [$dados['id']]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'usuario' => $usuario]);
        exit;
    }

    public static function logout(): void
    {
        $headers = getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? $headers['authorization'] ?? '');
        if ($token) \Rataplam\Middleware\Auth::revogarToken($token);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function esqueciSenha(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        if (empty($email)) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail e obrigatorio']);
            exit;
        }

        $usuario = Database::fetch("SELECT id, nome FROM usuarios WHERE email = ? AND ativo = 1", [$email]);

        if ($usuario) {
            $token = bin2hex(random_bytes(32));
            Database::update('usuarios', ['token_reset_senha' => $token], 'id = ?', [$usuario['id']]);

            try {
                $emailService = new \Rataplam\Services\EmailService();
                $emailService->enviarTemplate($email, 'nova-senha', [
                    'assunto' => 'Recuperacao de Senha - RATAPLAM',
                    'nome' => $usuario['nome'],
                    'token' => $token,
                    'link' => (getenv('FRONTEND_URL') ?: 'http://localhost:3000') . "/auth/resetar-senha?token={$token}",
                ]);
            } catch (\Throwable $e) { /* email falha silenciosamente */ }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'mensagem' => 'Se o e-mail estiver cadastrado, voce recebera as instrucoes.']);
        exit;
    }

    public static function resetarSenha(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        $novaSenha = $input['senha'] ?? '';

        if (empty($token) || empty($novaSenha)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Token e nova senha sao obrigatorios']);
            exit;
        }

        if (strlen($novaSenha) < 6) {
            http_response_code(400);
            echo json_encode(['erro' => 'A senha deve ter no minimo 6 caracteres']);
            exit;
        }

        $usuario = Database::fetch("SELECT id FROM usuarios WHERE token_reset_senha = ?", [$token]);
        if (!$usuario) {
            http_response_code(400);
            echo json_encode(['erro' => 'Token invalido ou expirado']);
            exit;
        }

        Database::update('usuarios', [
            'senha_hash' => password_hash($novaSenha, PASSWORD_DEFAULT),
            'token_reset_senha' => null,
        ], 'id = ?', [$usuario['id']]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'mensagem' => 'Senha redefinida com sucesso']);
        exit;
    }
}
