<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Services\VirtualFittingService;

class ProvadorController
{
    public static function processar(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $foto = $input['foto'] ?? '';
        $produtoId = $input['produto_id'] ?? null;
        $estilo = $input['estilo'] ?? 'realista';

        if (empty($foto)) {
            http_response_code(400);
            echo json_encode(['erro' => 'Foto e obrigatoria']);
            exit;
        }

        if (!$produtoId) {
            http_response_code(400);
            echo json_encode(['erro' => 'Produto e obrigatorio']);
            exit;
        }

        $service = new VirtualFittingService();

        if (!$service->isConfigured()) {
            http_response_code(503);
            echo json_encode([
                'erro' => 'Servico de IA nao configurado',
                'mensagem' => 'Configure a chave REPLICATE_API_TOKEN nas configuracoes do sistema',
            ]);
            exit;
        }

        $roupaData = $service->gerarThumbnailRoupa((string)$produtoId);
        if (!$roupaData['imagem_url']) {
            http_response_code(404);
            echo json_encode(['erro' => 'Imagem do produto nao encontrada']);
            exit;
        }

        try {
            $resultado = $service->processarImagem($foto, $roupaData['imagem_url'], $estilo);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($resultado);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['erro' => $e->getMessage()]);
        }
        exit;
    }

    public static function status(): void
    {
        $service = new VirtualFittingService();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'configurado' => $service->isConfigured(),
            'modelo' => 'flux-kontext-pro',
        ]);
        exit;
    }
}
