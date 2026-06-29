<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class EnderecoController
{
    public static function listar(): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $enderecos = Database::fetchAll(
                "SELECT * FROM enderecos WHERE usuario_id = ? ORDER BY principal DESC, created_at DESC",
                [$dados['id']]
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'enderecos' => $enderecos]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar enderecos', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function criar(): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();
            $input = json_decode(file_get_contents('php://input'), true);

            $nome = trim($input['nome'] ?? '');
            $cep = preg_replace('/\D/', '', $input['cep'] ?? '');
            $logradouro = trim($input['logradouro'] ?? '');
            $numero = trim($input['numero'] ?? '');

            if (empty($nome) || empty($cep) || empty($logradouro) || empty($numero)) {
                http_response_code(400);
                echo json_encode(['erro' => 'Nome, CEP, logradouro e numero sao obrigatorios']);
                exit;
            }

            if (strlen($cep) !== 8) {
                http_response_code(400);
                echo json_encode(['erro' => 'CEP invalido']);
                exit;
            }

            $principal = (int)($input['principal'] ?? 0);

            if ($principal) {
                Database::query("UPDATE enderecos SET principal = 0 WHERE usuario_id = ?", [$dados['id']]);
            }

            $totalEnderecos = Database::count('enderecos', 'usuario_id = ?', [$dados['id']]);

            $id = Database::insert('enderecos', [
                'usuario_id' => $dados['id'],
                'nome' => $nome,
                'cep' => $cep,
                'logradouro' => $logradouro,
                'numero' => $numero,
                'complemento' => $input['complemento'] ?? '',
                'bairro' => $input['bairro'] ?? '',
                'cidade' => $input['cidade'] ?? '',
                'estado' => $input['estado'] ?? '',
                'principal' => $principal ?: ($totalEnderecos === 0 ? 1 : 0),
            ]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'id' => $id]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao criar endereco', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function atualizar(int $id): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();
            $input = json_decode(file_get_contents('php://input'), true);

            $existente = Database::fetch(
                "SELECT id FROM enderecos WHERE id = ? AND usuario_id = ?",
                [$id, $dados['id']]
            );

            if (!$existente) {
                http_response_code(404);
                echo json_encode(['erro' => 'Endereco nao encontrado']);
                exit;
            }

            $camposPermitidos = ['nome', 'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'principal'];
            $atualizar = array_intersect_key($input, array_flip($camposPermitidos));

            if (isset($atualizar['cep'])) {
                $atualizar['cep'] = preg_replace('/\D/', '', $atualizar['cep']);
                if (strlen($atualizar['cep']) !== 8) {
                    http_response_code(400);
                    echo json_encode(['erro' => 'CEP invalido']);
                    exit;
                }
            }

            if (!empty($atualizar['principal']) && $atualizar['principal'] == 1) {
                Database::query("UPDATE enderecos SET principal = 0 WHERE usuario_id = ?", [$dados['id']]);
            }

            if (!empty($atualizar)) {
                Database::update('enderecos', $atualizar, 'id = ? AND usuario_id = ?', [$id, $dados['id']]);
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao atualizar endereco', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function excluir(int $id): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $existente = Database::fetch(
                "SELECT id, principal FROM enderecos WHERE id = ? AND usuario_id = ?",
                [$id, $dados['id']]
            );

            if (!$existente) {
                http_response_code(404);
                echo json_encode(['erro' => 'Endereco nao encontrado']);
                exit;
            }

            Database::delete('enderecos', 'id = ? AND usuario_id = ?', [$id, $dados['id']]);

            if ($existente['principal']) {
                $proximo = Database::fetch(
                    "SELECT id FROM enderecos WHERE usuario_id = ? ORDER BY created_at DESC LIMIT 1",
                    [$dados['id']]
                );
                if ($proximo) {
                    Database::update('enderecos', ['principal' => 1], 'id = ?', [$proximo['id']]);
                }
            }

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Endereco excluido com sucesso']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao excluir endereco', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function definirPrincipal(int $id): void
    {
        try {
            $dados = \Rataplam\Middleware\Auth::verificar();

            $existente = Database::fetch(
                "SELECT id FROM enderecos WHERE id = ? AND usuario_id = ?",
                [$id, $dados['id']]
            );

            if (!$existente) {
                http_response_code(404);
                echo json_encode(['erro' => 'Endereco nao encontrado']);
                exit;
            }

            Database::query("UPDATE enderecos SET principal = 0 WHERE usuario_id = ?", [$dados['id']]);
            Database::update('enderecos', ['principal' => 1], 'id = ?', [$id]);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'mensagem' => 'Endereco definido como principal']);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao definir endereco principal', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
