<?php
declare(strict_types=1);

namespace Rataplam\Services;

class VirtualFittingService
{
    private string $apiKey;
    private string $modelVersion;

    public function __construct()
    {
        $this->apiKey = getenv('REPLICATE_API_TOKEN') ?: '';
        if (empty($this->apiKey)) {
            $config = \Rataplam\Config\Database::fetch(
                "SELECT valor FROM configuracoes WHERE chave = 'replicate_api_token'"
            );
            $this->apiKey = $config['valor'] ?? '';
        }
        $this->modelVersion = 'black-forest-labs/flux-kontext-pro';
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    public function processarImagem(string $fotoBase64, string $roupaUrl, string $estilo = 'realista'): array
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('API de IA nao configurada. Configure REPLICATE_API_TOKEN.');
        }

        $prompt = $this->gerarPrompt($roupaUrl, $estilo);

        $payload = json_encode([
            'version' => $this->modelVersion,
            'input' => [
                'image' => $fotoBase64,
                'prompt' => $prompt,
                'guidance_scale' => 3.5,
                'num_inference_steps' => 28,
            ],
        ]);

        $ch = curl_init('https://api.replicate.com/v1/predictions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201 && $httpCode !== 200) {
            throw new \RuntimeException("Erro na API de IA: HTTP {$httpCode}");
        }

        $data = json_decode($response, true);
        $predictionId = $data['id'] ?? null;

        if (!$predictionId) {
            throw new \RuntimeException('Nao foi possivel criar a previsao');
        }

        return $this->aguardarResultado($predictionId);
    }

    private function gerarPrompt(string $roupaUrl, string $estilo): string
    {
        $base = "A child wearing the clothing shown in the reference image. Keep the child's face, pose, and background exactly the same. Only change the clothing. ";
        
        return match ($estilo) {
            'realista' => $base . "Photorealistic, natural lighting, high quality.",
            'editorial' => $base . "Fashion editorial style, studio lighting, professional photography.",
            'casual' => $base . "Casual everyday style, natural lighting.",
            default => $base . "Photorealistic, natural lighting.",
        };
    }

    private function aguardarResultado(string $predictionId): array
    {
        $maxAttempts = 60;
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            sleep(2);
            $attempt++;

            $ch = curl_init("https://api.replicate.com/v1/predictions/{$predictionId}");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $this->apiKey,
                ],
                CURLOPT_TIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            curl_close($ch);

            $data = json_decode($response, true);
            $status = $data['status'] ?? 'unknown';

            if ($status === 'succeeded') {
                $output = $data['output'] ?? null;
                $imageUrl = is_array($output) ? ($output[0] ?? null) : $output;

                return [
                    'sucesso' => true,
                    'imagem_url' => $imageUrl,
                    'prediction_id' => $predictionId,
                ];
            }

            if ($status === 'failed' || $status === 'canceled') {
                throw new \RuntimeException("Processamento falhou: " . ($data['error'] ?? 'Erro desconhecido'));
            }
        }

        throw new \RuntimeException('Timeout aguardando resultado da IA');
    }

    public function gerarThumbnailRoupa(string $produtoId): array
    {
        $produto = \Rataplam\Config\Database::fetch(
            "SELECT imagem_url FROM produto_imagens WHERE produto_id = ? AND principal = 1 LIMIT 1",
            [$produtoId]
        );

        if (!$produto) {
            $produto = \Rataplam\Config\Database::fetch(
                "SELECT imagem_url FROM produtos WHERE id = ?",
                [$produtoId]
            );
        }

        return [
            'sucesso' => true,
            'imagem_url' => $produto['imagem_url'] ?? null,
        ];
    }
}
