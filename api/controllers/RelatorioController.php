<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class RelatorioController
{
    public static function vendas(): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $periodo = $_GET['periodo'] ?? 'mes';
            $status = $_GET['status'] ?? '';
            $dataInicio = $_GET['data_inicio'] ?? '';
            $dataFim = $_GET['data_fim'] ?? '';

            switch ($periodo) {
                case 'dia':
                    $groupBy = Database::dateFunc('created_at');
                    $labelFormat = '%d/%m/%Y';
                    break;
                case 'semana':
                    $groupBy = Database::yearWeek('created_at');
                    $labelFormat = '%x-W%v';
                    break;
                case 'ano':
                    $groupBy = Database::year('created_at');
                    $labelFormat = '%Y';
                    break;
                case 'mes':
                default:
                    $groupBy = Database::dateFormat('created_at', '%Y-%m');
                    $labelFormat = '%Y-%m';
                    break;
            }

            $where = '1=1';
            $params = [];

            if ($status) {
                $where .= ' AND status = ?';
                $params[] = $status;
            }

            if ($dataInicio) {
                $where .= ' AND created_at >= ?';
                $params[] = $dataInicio . ' 00:00:00';
            }

            if ($dataFim) {
                $where .= ' AND created_at <= ?';
                $params[] = $dataFim . ' 23:59:59';
            }

            $vendasPeriodo = Database::fetchAll(
                "SELECT {$groupBy} as periodo,
                        COUNT(*) as total_pedidos,
                        SUM(total) as receita_total,
                        SUM(desconto) as total_desconto,
                        SUM(frete) as total_frete,
                        AVG(total) as ticket_medio
                 FROM pedidos WHERE {$where} AND status != 'cancelado'
                 GROUP BY periodo
                 ORDER BY periodo DESC
                 LIMIT 24",
                $params
            );

            $resumoGeral = Database::fetch(
                "SELECT COUNT(*) as total_pedidos,
                        COALESCE(SUM(total), 0) as receita_total,
                        COALESCE(SUM(desconto), 0) as total_desconto,
                        COALESCE(SUM(frete), 0) as total_frete,
                        COALESCE(AVG(total), 0) as ticket_medio,
                        COALESCE(SUM(CASE WHEN status = 'pago' THEN total ELSE 0 END), 0) as receita_confirmada,
                        COALESCE(SUM(CASE WHEN status = 'pendente' THEN total ELSE 0 END), 0) as receita_pendente,
                        COALESCE(SUM(CASE WHEN status = 'cancelado' THEN total ELSE 0 END), 0) as total_cancelado
                 FROM pedidos WHERE {$where}",
                $params
            );

            $statusVendas = Database::fetchAll(
                "SELECT status, COUNT(*) as quantidade, SUM(total) as valor
                 FROM pedidos WHERE {$where}
                 GROUP BY status
                 ORDER BY quantidade DESC",
                $params
            );

            $topProdutos = Database::fetchAll(
                "SELECT pi.nome_produto, SUM(pi.quantidade) as total_vendido, SUM(pi.preco_total) as receita
                 FROM pedido_itens pi
                 JOIN pedidos p ON pi.pedido_id = p.id
                 WHERE {$where} AND p.status != 'cancelado'
                 GROUP BY pi.produto_id, pi.nome_produto
                 ORDER BY total_vendido DESC
                 LIMIT 10",
                $params
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'periodo' => $periodo,
                'vendas' => $vendasPeriodo,
                'resumo' => $resumoGeral,
                'por_status' => $statusVendas,
                'top_produtos' => $topProdutos,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao gerar relatorio de vendas', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function estoque(): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $tipo = $_GET['tipo'] ?? 'geral';
            $categoriaId = !empty($_GET['categoria_id']) ? (int)$_GET['categoria_id'] : 0;

            $where = 'p.ativo = 1';
            $params = [];

            if ($categoriaId) {
                $where .= ' AND p.categoria_id = ?';
                $params[] = $categoriaId;
            }

            switch ($tipo) {
                case 'baixo_estoque':
                    $where .= ' AND p.estoque > 0 AND p.estoque <= 10';
                    break;
                case 'sem_estoque':
                    $where .= ' AND p.estoque = 0';
                    break;
                case 'geral':
                default:
                    break;
            }

            $produtos = Database::fetchAll(
                "SELECT p.id, p.nome, p.sku, p.estoque, p.preco, p.preco_promocional,
                        c.nome as categoria_nome,
                        (SELECT COUNT(*) FROM variacoes v WHERE v.produto_id = p.id) as total_variacoes
                 FROM produtos p
                 LEFT JOIN categorias c ON p.categoria_id = c.id
                 WHERE {$where}
                 ORDER BY p.estoque ASC, p.nome ASC",
                $params
            );

            $resumo = Database::fetch(
                "SELECT COUNT(*) as total_produtos,
                        COALESCE(SUM(estoque), 0) as estoque_total,
                        COALESCE(SUM(estoque * preco), 0) as valor_estoque,
                        SUM(CASE WHEN estoque = 0 THEN 1 ELSE 0 END) as sem_estoque,
                        SUM(CASE WHEN estoque > 0 AND estoque <= 10 THEN 1 ELSE 0 END) as baixo_estoque,
                        SUM(CASE WHEN estoque > 10 THEN 1 ELSE 0 END) as estoque_ok
                 FROM produtos WHERE ativo = 1"
            );

            $porCategoria = Database::fetchAll(
                "SELECT c.nome as categoria,
                        COUNT(p.id) as total_produtos,
                        COALESCE(SUM(p.estoque), 0) as estoque_total,
                        COALESCE(SUM(p.estoque * p.preco), 0) as valor_estoque
                 FROM categorias c
                 LEFT JOIN produtos p ON p.categoria_id = c.id AND p.ativo = 1
                 GROUP BY c.id, c.nome
                 ORDER BY c.nome"
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'tipo' => $tipo,
                'produtos' => $produtos,
                'resumo' => $resumo,
                'por_categoria' => $porCategoria,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao gerar relatorio de estoque', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }

    public static function financeiro(): void
    {
        try {
            \Rataplam\Middleware\Auth::verificarAdmin();

            $periodo = $_GET['periodo'] ?? 'mes';
            $dataInicio = $_GET['data_inicio'] ?? '';
            $dataFim = $_GET['data_fim'] ?? '';

            switch ($periodo) {
                case 'dia':
                    $groupBy = Database::dateFunc('created_at');
                    break;
                case 'semana':
                    $groupBy = Database::yearWeek('created_at');
                    break;
                case 'ano':
                    $groupBy = Database::year('created_at');
                    break;
                case 'mes':
                default:
                    $groupBy = Database::dateFormat('created_at', '%Y-%m');
                    break;
            }

            $where = "status IN ('pago', 'enviado', 'entregue')";
            $params = [];

            if ($dataInicio) {
                $where .= ' AND created_at >= ?';
                $params[] = $dataInicio . ' 00:00:00';
            }

            if ($dataFim) {
                $where .= ' AND created_at <= ?';
                $params[] = $dataFim . ' 23:59:59';
            }

            $receitaPeriodo = Database::fetchAll(
                "SELECT {$groupBy} as periodo,
                        COUNT(*) as total_pedidos,
                        SUM(total) as receita_bruta,
                        SUM(desconto) as total_descontos,
                        SUM(frete) as total_frete,
                        SUM(total - desconto) as receita_liquida
                 FROM pedidos WHERE {$where}
                 GROUP BY periodo
                 ORDER BY periodo DESC
                 LIMIT 24",
                $params
            );

            $resumo = Database::fetch(
                "SELECT COUNT(*) as total_pedidos,
                        COALESCE(SUM(total), 0) as receita_bruta,
                        COALESCE(SUM(desconto), 0) as total_descontos,
                        COALESCE(SUM(frete), 0) as total_frete,
                        COALESCE(SUM(total - desconto), 0) as receita_liquida,
                        COALESCE(AVG(total), 0) as ticket_medio
                 FROM pedidos WHERE {$where}",
                $params
            );

            $metodosPagamento = Database::fetchAll(
                "SELECT metodo_pagamento, COUNT(*) as quantidade, SUM(total) as valor
                 FROM pedidos WHERE {$where}
                 GROUP BY metodo_pagamento
                 ORDER BY valor DESC",
                $params
            );

            $cuponsUsados = Database::fetch(
                "SELECT COUNT(*) as total_usos, COALESCE(SUM(desconto), 0) as total_desconto
                 FROM pedidos WHERE {$where} AND cupom_id IS NOT NULL"
            );

            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'sucesso' => true,
                'periodo' => $periodo,
                'receita' => $receitaPeriodo,
                'resumo' => $resumo,
                'metodos_pagamento' => $metodosPagamento,
                'cupons' => $cuponsUsados,
            ]);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => 'Erro ao gerar relatorio financeiro', 'mensagem' => $e->getMessage()]);
            exit;
        }
    }
}
