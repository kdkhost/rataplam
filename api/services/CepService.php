<?php
declare(strict_types=1);

namespace Rataplam\Services;

class CepService
{
    private array $apis = [
        'brasilapi' => 'https://brasilapi.com.br/api/cep/v1/',
        'viacep' => 'https://viacep.com.br/ws/',
    ];

    public function buscar(string $cep): ?array
    {
        $cep = preg_replace('/\D/', '', $cep);

        if (strlen($cep) !== 8) {
            return null;
        }

        foreach ($this->apis as $nome => $url) {
            $resultado = $this->requisicao($url . $cep . '/json');
            if ($resultado && isset($resultado['logradouro'])) {
                return [
                    'cep' => $cep,
                    'logradouro' => $resultado['logradouro'] ?? '',
                    'complemento' => $resultado['complemento'] ?? '',
                    'bairro' => $resultado['bairro'] ?? '',
                    'cidade' => $resultado['localidade'] ?? $resultado['city'] ?? '',
                    'estado' => $resultado['uf'] ?? $resultado['state'] ?? '',
                    'ibge' => $resultado['ibge'] ?? '',
                ];
            }
        }

        return null;
    }

    private function requisicao(string $url): ?array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            return null;
        }

        return json_decode($response, true);
    }
}
