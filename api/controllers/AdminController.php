<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class AdminController
{
    public static function listarClientes(): void
    {
        $busca = $_GET['busca'] ?? '';
        $role = $_GET['role'] ?? '';
        $pagina = max(1, (int)($_GET['pagina'] ?? 1));
        $limite = 20;
        $offset = ($pagina - 1) * $limite;

        $where = '1=1';
        $params = [];
        if ($busca) {
            $where .= ' AND (u.nome LIKE ? OR u.email LIKE ? OR u.cpf LIKE ?)';
            $params = ["%{$busca}%", "%{$busca}%", "%{$busca}%"];
        }
        if ($role) {
            $where .= ' AND u.role = ?';
            $params[] = $role;
        }

        $total = Database::fetch("SELECT COUNT(*) as t FROM usuarios u WHERE {$where}", $params);
        $clientes = Database::fetchAll(
            "SELECT u.*, (SELECT COUNT(*) FROM pedidos WHERE usuario_id = u.id) as total_pedidos FROM usuarios u WHERE {$where} ORDER BY u.created_at DESC LIMIT {$limite} OFFSET {$offset}",
            $params
        );

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'clientes' => $clientes, 'total_paginas' => ceil(($total['t'] ?? 0) / $limite)]);
        exit;
    }

    public static function criarCliente(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $nome = trim($input['nome'] ?? '');
        $email = trim($input['email'] ?? '');
        $senha = $input['senha'] ?? '';
        $role = in_array($input['role'] ?? 'cliente', ['admin', 'vendedor', 'cliente']) ? $input['role'] : 'cliente';

        if (empty($nome) || empty($email) || empty($senha)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Nome, e-mail e senha sao obrigatorios']);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail invalido']);
            exit;
        }
        if (strlen($senha) < 6) {
            http_response_code(400);
            echo json_encode(['erro' => 'Senha deve ter no minimo 6 caracteres']);
            exit;
        }
        if (Database::count('usuarios', 'email = ?', [$email]) > 0) {
            http_response_code(400);
            echo json_encode(['erro' => 'E-mail ja cadastrado']);
            exit;
        }
        $id = Database::insert('usuarios', [
            'nome' => $nome,
            'email' => $email,
            'senha_hash' => password_hash($senha, PASSWORD_DEFAULT),
            'telefone' => $input['telefone'] ?? '',
            'role' => $role,
            'ativo' => 1,
        ]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }

    public static function atualizarCliente(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $camposPermitidos = ['nome', 'email', 'telefone', 'cpf', 'ativo', 'role'];
        $atualizar = array_intersect_key($input, array_flip($camposPermitidos));
        if (!empty($atualizar)) {
            Database::update('usuarios', $atualizar, 'id = ?', [$id]);
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function listarCategorias(): void
    {
        $categorias = Database::fetchAll("SELECT * FROM categorias ORDER BY ordem, nome");
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'categorias' => $categorias]);
        exit;
    }

    public static function criarCategoria(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $slug = strtolower(preg_replace('/[^a-z0-9-]/', '-', preg_replace('/\s+/', '-', $input['nome'] ?? '')));
        $id = Database::insert('categorias', [
            'nome' => $input['nome'] ?? '',
            'slug' => $slug,
            'descricao' => $input['descricao'] ?? '',
            'ordem' => $input['ordem'] ?? 0,
        ]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }

    public static function atualizarCategoria(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $dados = array_filter($input, fn($v) => $v !== null);
        Database::update('categorias', $dados, 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function excluirCategoria(int $id): void
    {
        Database::update('categorias', ['ativa' => 0], 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function listarCupons(): void
    {
        $cupons = Database::fetchAll("SELECT * FROM cupons ORDER BY created_at DESC");
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'cupons' => $cupons]);
        exit;
    }

    public static function criarCupom(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = Database::insert('cupons', [
            'codigo' => strtoupper($input['codigo'] ?? ''),
            'descricao' => $input['descricao'] ?? '',
            'tipo' => $input['tipo'] ?? 'percentual',
            'valor' => $input['valor'] ?? 0,
            'valor_minimo' => $input['valor_minimo'] ?? 0,
            'limite_uso' => $input['limite_uso'] ?? 0,
            'data_inicio' => $input['data_inicio'] ?? null,
            'data_fim' => $input['data_fim'] ?? null,
            'ativo' => $input['ativo'] ?? 1,
        ]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }

    public static function atualizarCupom(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $dados = array_filter($input, fn($v) => $v !== null);
        if (isset($dados['codigo'])) $dados['codigo'] = strtoupper($dados['codigo']);
        Database::update('cupons', $dados, 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function excluirCupom(int $id): void
    {
        Database::delete('cupons', 'id = ?', [$id]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function listarConfiguracoes(): void
    {
        $configs = Database::fetchAll("SELECT * FROM configuracoes ORDER BY grupo, chave");
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'configuracoes' => $configs]);
        exit;
    }

    public static function salvarConfiguracoes(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $itens = $input['configuracoes'] ?? [];
        foreach ($itens as $item) {
            if (isset($item['chave'], $item['valor'])) {
                $existe = Database::fetch("SELECT id FROM configuracoes WHERE chave = ?", [$item['chave']]);
                if ($existe) {
                    Database::update('configuracoes', ['valor' => $item['valor']], 'chave = ?', [$item['chave']]);
                } else {
                    Database::insert('configuracoes', ['chave' => $item['chave'], 'valor' => $item['valor']]);
                }
            }
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    public static function listarFaixasEtarias(): void
    {
        $faixas = Database::fetchAll("SELECT id, nome FROM faixas_etarias WHERE ativa = 1 ORDER BY ordem");
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'faixas' => $faixas]);
        exit;
    }
}
