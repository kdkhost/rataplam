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

        $usuario = Database::fetch("SELECT * FROM usuarios WHERE email = ? AND ativo = 1", [$email]);

        if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
            http_response_code(401);
            echo json_encode(['erro' => 'E-mail ou senha inválidos']);
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

        $existente = Database::count('usuarios', 'email = ?', [$input['email'] ?? '']);
        if ($existente) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail já cadastrado']);
            exit;
        }

        $id = Database::insert('usuarios', [
            'nome' => $input['nome'] ?? '',
            'email' => $input['email'] ?? '',
            'senha_hash' => password_hash($input['senha'] ?? '', PASSWORD_DEFAULT),
            'cpf' => $input['cpf'] ?? null,
            'telefone' => $input['telefone'] ?? null,
            'role' => 'cliente',
        ]);

        $token = \Rataplam\Middleware\Auth::gerarToken($id);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'token' => $token,
            'usuario' => ['id' => $id, 'nome' => $input['nome'], 'email' => $input['email'], 'role' => 'cliente'],
        ]);
        exit;
    }

    public static function me(): void
    {
        $dados = \Rataplam\Middleware\Auth::verificar();
        $usuario = Database::fetch("SELECT id, nome, email, cpf, telefone, role FROM usuarios WHERE id = ?", [$dados['id']]);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'usuario' => $usuario]);
        exit;
    }

    public static function logout(): void
    {
        $headers = getallheaders();
        $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
        if ($token) \Rataplam\Middleware\Auth::revogarToken($token);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }
}
