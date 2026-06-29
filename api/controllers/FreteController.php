<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Services\CorreiosService;

class FreteController
{
    public static function calcular(): void
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $cepDestino = $input['cep_destino'] ?? '';
            $cepOrigem = $input['cep_origem'] ?? '';
            $peso = (float)($input['peso'] ?? 0.5);
            $comprimento = (float)($input['comprimento'] ?? 30.0);
            $altura = (float)($input['altura'] ?? 10.0);
            $largura = (float)($input['largura'] ?? 20.0);
            $itens = $input['itens'] ?? [];

            $cepDestino = preg_replace('/\D/', '', $cepDestino);

            if (strlen($cepDestino) !== 8) {
                http_response_code(400);
                echo json_encode(['erro' => 'CEP de destino invalido']);
                exit;
            }

            if (empty($cepOrigem)) {
                $cepOrigem = '01001000';
            } else {
                $cepOrigem = preg_replace('/\D/', '', $cepOrigem);
                if (strlen($cepOrigem) !== 8) {
                    $cepOrigem = '01001000';
                }
            }

            if (!empty($itens)) {
                $pesoTotal = 0;
                $valorTotal = 0;

                foreach ($itens as $item) {
                    $qtd = max(1, (int)($item['quantidade'] ?? 1));
                    $pesoItem = (float)($item['peso'] ?? 0.3);
                    $pesoTotal += $pesoItem * $qtd;
                    $valorItem = (float)($item['preco'] ?? 0);
                    $valorTotal += $valorItem * $qtd;
                }

                if ($pesoTotal > 0) $peso = $pesoTotal;

                if ($valorTotal >= 199.90) {
                    $correios = new CorreiosService();
                    $opcoes = $correios->calcularFrete($cepOrigem, $cepDestino, $peso, $comprimento, $altura, $largura);

                    foreach ($opcoes as &$opcao) {
                        if ($opcao['servico'] === 'PAC' && $opcao['erro'] === null) {
                            $opcao['valor'] = 0;
                            $opcao['frete_gratis'] = true;
                        }
                    }
                    unset($opcao);

                    header('Content-Type: application/json; charset=utf-8');
                    echo json_encode(['sucesso' => true, 'opcoes' => $opcoes]);
                    exit;
                }
            }

            $correios = new CorreiosService();
            $opcoes = $correios->calcularFrete($cepOrigem, $cepDestino, $peso, $comprimento, $altura, $largura);

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'opcoes' => $opcoes]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao calcular frete', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function rastrear(string $codigo): void
    {
        try {
            $codigo = strtoupper(trim($codigo));

            if (empty($codigo)) {
                http_response_code(400);
                echo json_encode(['erro' => 'Codigo de rastreio obrigatorio']);
                exit;
            }

            $correios = new CorreiosService();
            $resultado = $correios->rastrearEncomenda($codigo);

            $statusCode = isset($resultado['sucesso']) && $resultado['sucesso'] ? 200 : 404;

            http_response_code($statusCode);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($resultado);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao rastrear encomenda', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function listarOpcoes(): void
    {
        try {
            $correios = new CorreiosService();
            $servicos = $correios->listarServicos();

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['sucesso' => true, 'servicos' => $servicos]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao listar servicos']);
            exit;
        }
    }
}
