<?php
declare(strict_types=1);

namespace Rataplam\Services;

class VirtualFittingService
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = getenv('REPLICATE_API_TOKEN') ?: '';
        if (empty($this->apiKey)) {
            $config = \Rataplam\Config\Database::fetch(
                "SELECT valor FROM configuracoes WHERE chave = 'replicate_api_token'"
            );
            $this->apiKey = $config['valor'] ?? '';
        }
        $this->model = 'black-forest-labs/flux-kontext-pro';
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

        // SECURITY FIX: Validate base64 size (max 10MB)
        $sizeBytes = (int) (strlen($fotoBase64) * 3 / 4);
        if ($sizeBytes > 10 * 1024 * 1024) {
            throw new \RuntimeException('Imagem muito grande. Maximo 10MB.');
        }

        // CRITICAL FIX: Upload image first to get a URL, then pass URL to Replicate
        $imageUrl = $this->uploadImagemTemporaria($fotoBase64);
        $prompt = $this->gerarPrompt($roupaUrl, $estilo);

        $payload = json_encode([
            'input' => [
                'image' => $imageUrl,
                'prompt' => $prompt,
                'guidance_scale' => 3.5,
                'num_inference_steps' => 28,
            ],
        ]);

        $ch = curl_init("https://api.replicate.com/v1/models/{$this->model}/predictions");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
                'Prefer: wait',
            ],
            CURLOPT_TIMEOUT => 120,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 201 && $httpCode !== 200) {
            throw new \RuntimeException("Erro na API de IA: HTTP {$httpCode}");
        }

        $data = json_decode($response, true);

        // If using Prefer: wait, result may come directly
        if (($data['status'] ?? '') === 'succeeded') {
            $output = $data['output'] ?? null;
            $resultUrl = is_array($output) ? ($output[0] ?? null) : $output;
            return ['sucesso' => true, 'imagem_url' => $resultUrl, 'prediction_id' => $data['id'] ?? ''];
        }

        $predictionId = $data['id'] ?? null;
        if (!$predictionId) {
            throw new \RuntimeException('Nao foi possivel criar a previsao');
        }

        return $this->aguardarResultado($predictionId);
    }

    private function uploadImagemTemporaria(string $base64): string
    {
        // Decode base64 and upload to a temporary hosting service
        // For now, use a data URI (some APIs accept this)
        // In production, upload to S3/CloudFlare R2 and return URL
        if (preg_match('/^data:image\/(\w+);base64,/', $base64, $type)) {
            // Already a data URI - return as is
            return $base64;
        }

        // Add data URI prefix if missing
        $mime = 'image/jpeg';
        if (strpos($base64, 'iVBOR') === 0) $mime = 'image/png';
        elseif (strpos($base64, 'UklGR') === 0) $mime = 'image/webp';

        return "data:{$mime};base64,{$base64}";
    }

    private function gerarPrompt(string $roupaUrl, string $estilo): string
    {
        $base = "A child wearing the clothing shown in the reference image. Keep the child's face, pose, and background exactly the same. Only change the clothing. ";

        switch ($estilo) {
            case 'realista': return $base . "Photorealistic, natural lighting, high quality.";
            case 'editorial': return $base . "Fashion editorial style, studio lighting, professional photography.";
            case 'casual': return $base . "Casual everyday style, natural lighting.";
            default: return $base . "Photorealistic, natural lighting.";
        }
    }

    private function aguardarResultado(string $predictionId): array
    {
        $maxTime = 90; // 90 seconds max
        $startTime = time();

        while ((time() - $startTime) < $maxTime) {
            sleep(3);

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
                return ['sucesso' => true, 'imagem_url' => $imageUrl, 'prediction_id' => $predictionId];
            }

            if ($status === 'failed' || $status === 'canceled') {
                throw new \RuntimeException("Processamento falhou: " . ($data['error'] ?? 'Erro desconhecido'));
            }
        }

        throw new \RuntimeException('Timeout aguardando resultado da IA');
    }

    public function gerarThumbnailRoupa(string $produtoId): array
    {
        // FIX: Correct table name - use produtos_imagens or fallback to produtos.imagem_url
        $produto = \Rataplam\Config\Database::fetch(
            "SELECT imagem_url FROM produtos_imagens WHERE produto_id = ? AND principal = 1 LIMIT 1",
            [$produtoId]
        );

        if (!$produto) {
            // Fallback: try produto_imagens (alternate table name)
            $produto = \Rataplam\Config\Database::fetch(
                "SELECT imagem_url FROM produto_imagens WHERE produto_id = ? AND principal = 1 LIMIT 1",
                [$produtoId]
            );
        }

        if (!$produto) {
            $produto = \Rataplam\Config\Database::fetch(
                "SELECT imagem_url FROM produtos WHERE id = ?",
                [$produtoId]
            );
        }

        return ['sucesso' => true, 'imagem_url' => $produto['imagem_url'] ?? null];
    }
}
