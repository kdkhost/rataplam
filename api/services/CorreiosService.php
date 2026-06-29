<?php
declare(strict_types=1);

namespace Rataplam\Services;

class CorreiosService
{
    private string $cepOrigemPadrao;
    private float $pesoPadrao;
    private float $comprimentoPadrao;
    private float $alturaPadrao;
    private float $larguraPadrao;

    public function __construct()
    {
        $this->cepOrigemPadrao = '01001000';
        $this->pesoPadrao = 0.5;
        $this->comprimentoPadrao = 30.0;
        $this->alturaPadrao = 10.0;
        $this->larguraPadrao = 20.0;
    }

    public function calcularFrete(
        string $cepOrigem,
        string $cepDestino,
        float $peso = 0.5,
        float $comprimento = 30.0,
        float $altura = 10.0,
        float $largura = 20.0
    ): array {
        $cepOrigem = $this->normalizarCep($cepOrigem);
        $cepDestino = $this->normalizarCep($cepDestino);

        if (strlen($cepOrigem) !== 8 || strlen($cepDestino) !== 8) {
            return [
                ['servico' => 'PAC', 'prazo' => 0, 'valor' => 0, 'erro' => 'CEPs invalidos'],
                ['servico' => 'SEDEX', 'prazo' => 0, 'valor' => 0, 'erro' => 'CEPs invalidos'],
            ];
        }

        $peso = max($this->pesoPadrao, $peso);
        $comprimento = max($this->comprimentoPadrao, $comprimento);
        $altura = max($this->alturaPadrao, $altura);
        $largura = max($this->larguraPadrao, $largura);

        $resultados = [];

        $servicos = [
            ['codigo' => '04510', 'nome' => 'PAC'],
            ['codigo' => '04014', 'nome' => 'SEDEX'],
        ];

        foreach ($servicos as $servico) {
            $resultado = $this->consultarServico($servico['codigo'], $cepOrigem, $cepDestino, $peso, $comprimento, $altura, $largura);
            $resultado['servico'] = $servico['nome'];
            $resultados[] = $resultado;
        }

        if (empty($resultados) || ($resultados[0]['erro'] && $resultados[1]['erro'] ?? true)) {
            $resultados = $this->valoresPadrao($cepOrigem, $cepDestino);
        }

        return $resultados;
    }

    private function consultarServico(
        string $codigoServico,
        string $cepOrigem,
        string $cepDestino,
        float $peso,
        float $comprimento,
        float $altura,
        float $largura
    ): array {
        $params = [
            'nCdEmpresa' => '',
            'sDsSenha' => '',
            'nCdServico' => $codigoServico,
            'sCepOrigem' => $cepOrigem,
            'sCepDestino' => $cepDestino,
            'nVlPeso' => number_format($peso, 2, '.', ''),
            'nCdFormato' => '1',
            'nVlComprimento' => number_format($comprimento, 2, '.', ''),
            'nVlAltura' => number_format($altura, 2, '.', ''),
            'nVlLargura' => number_format($largura, 2, '.', ''),
            'nVlDiametro' => '0',
            'sCdMaoPropria' => 'N',
            'nVlValorDeclarado' => '0',
            'sCdAvisoRecebimento' => 'N',
        ];

        $url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo?' . http_build_query($params);

        $resultado = $this->requisicao($url);

        if ($resultado === null) {
            return ['servico' => '', 'prazo' => 0, 'valor' => 0, 'erro' => 'Falha ao comunicar com Correios'];
        }

        if (isset($resultado['Erro']) && $resultado['Erro'] !== '0') {
            $codigoErro = $resultado['Erro'];
            $mensagemErro = $resultado['MsgErro'] ?? 'Erro desconhecido dos Correios';
            return ['servico' => '', 'prazo' => 0, 'valor' => 0, 'erro' => "Erro {$codigoErro}: {$mensagemErro}"];
        }

        $servicos = $resultado['Servicos'] ?? $resultado['Servico'] ?? [];

        if (is_array($servicos) && !isset($servicos['Codigo'])) {
            $servicos = reset($servicos) ?: [];
        }

        $prazo = (int)($servicos['PrazoEntrega'] ?? 0);
        $valor = (float)($servicos['Valor'] ?? 0);

        return [
            'servico' => '',
            'prazo' => $prazo,
            'valor' => $valor,
            'erro' => null,
        ];
    }

    public function rastrearEncomenda(string $codigo): array
    {
        $codigo = strtoupper(trim($codigo));
        $codigo = preg_replace('/\s+/', '', $codigo);

        if (strlen($codigo) < 10 || strlen($codigo) > 45) {
            return ['sucesso' => false, 'erro' => 'Codigo de rastreio invalido'];
        }

        $resultado = $this->rastrearViaProxyApp($codigo);

        if ($resultado !== null) {
            return $resultado;
        }

        $resultado = $this->rastrearViaSRO($codigo);

        if ($resultado !== null) {
            return $resultado;
        }

        return ['sucesso' => false, 'erro' => 'Nao foi possivel rastrear a encomenda', 'codigo' => $codigo];
    }

    private function rastrearViaProxyApp(string $codigo): ?array
    {
        $url = "https://proxyapp.correios.com.br/v1/sro-rastro/{$codigo}";

        $headers = [
            'Accept: application/json',
            'User-Agent: Dart/3.0 (dart:io)',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'app-check-token: YmNkNGY3YmM0ZmJkNGY3',
        ];

        $response = $this->requisicaoComHeaders($url, $headers);

        if ($response === null) {
            return null;
        }

        $decoded = json_decode($response, true);

        if ($decoded === null || !isset($decoded['objetos'])) {
            return null;
        }

        $objeto = reset($decoded['objetos']);

        if (empty($objeto)) {
            return [
                'sucesso' => true,
                'codigo' => $codigo,
                'eventos' => [],
                'mensagem' => 'Nenhum evento encontrado',
            ];
        }

        $eventos = [];
        $eventosRaw = $objeto['eventos'] ?? [];

        foreach ($eventosRaw as $evento) {
            $eventos[] = [
                'data' => $evento['dtHrCriado'] ?? '',
                'hora' => '',
                'local' => $evento['unidade']['nome'] ?? $evento['unidade'] ?? '',
                'destino' => $evento['unidadeDestino']['nome'] ?? '',
                'status' => $evento['tipo'] ?? '',
                'descricao' => $evento['descricao'] ?? '',
            ];
        }

        return [
            'sucesso' => true,
            'codigo' => $codigo,
            'tipo' => $objeto['tipoPostal']['descricao'] ?? '',
            'status' => $objeto['categoria'] ?? '',
            'ultima_atualizacao' => $objeto['dtHrAtualizacao'] ?? '',
            'eventos' => $eventos,
        ];
    }

    private function rastrearViaSRO(string $codigo): ?array
    {
        $params = [
            'tipo' => 'L',
            'resultado' => 'T',
            'objetos' => $codigo,
        ];

        $url = 'http://ws.correios.com.br/logcorreios/SroIndex.asmx/BuscaEventosLista?' . http_build_query($params);

        $response = $this->requisicao($url);

        if ($response === null) {
            return null;
        }

        $decoded = json_decode($response, true);

        if ($decoded === null || !isset($decoded['Return'])) {
            return null;
        }

        $retorno = $decoded['Return'];

        if (isset($retorno['Erro']) && $retorno['Erro'] !== '0') {
            return [
                'sucesso' => false,
                'codigo' => $codigo,
                'erro' => 'Objeto nao encontrado nos Correios',
            ];
        }

        $eventos = [];
        $eventosRaw = $retorno['Eventos'] ?? [];

        if (isset($eventosRaw['Evento'])) {
            if (isset($eventosRaw['Evento'][0])) {
                $eventosRaw = $eventosRaw['Evento'];
            } else {
                $eventosRaw = [$eventosRaw['Evento']];
            }
        }

        foreach ($eventosRaw as $evento) {
            $eventos[] = [
                'data' => $evento['Data'] ?? '',
                'hora' => $evento['Hora'] ?? '',
                'local' => $evento['Local'] ?? '',
                'destino' => $evento['Destino'] ?? '',
                'status' => $evento['Status'] ?? '',
                'descricao' => $evento['Descricao'] ?? '',
            ];
        }

        return [
            'sucesso' => true,
            'codigo' => $codigo,
            'eventos' => $eventos,
        ];
    }

    private function valoresPadrao(string $cepOrigem, string $cepDestino): array
    {
        $distancia = $this->estimarDistancia($cepOrigem, $cepDestino);

        if ($distancia < 500) {
            $valorPac = 15.90;
            $prazoPac = 5;
            $valorSedex = 22.90;
            $prazoSedex = 2;
        } elseif ($distancia < 1500) {
            $valorPac = 19.90;
            $prazoPac = 8;
            $valorSedex = 29.90;
            $prazoSedex = 3;
        } else {
            $valorPac = 24.90;
            $prazoPac = 12;
            $valorSedex = 39.90;
            $prazoSedex = 5;
        }

        return [
            [
                'servico' => 'PAC',
                'prazo' => $prazoPac,
                'valor' => $valorPac,
                'erro' => null,
                'origem' => 'valores_padrao',
            ],
            [
                'servico' => 'SEDEX',
                'prazo' => $prazoSedex,
                'valor' => $valorSedex,
                'erro' => null,
                'origem' => 'valores_padrao',
            ],
        ];
    }

    private function estimarDistancia(string $cepOrigem, string $cepDestino): float
    {
        $prefixoOrigem = (int)substr($cepOrigem, 0, 3);
        $prefixoDestino = (int)substr($cepDestino, 0, 3);

        $regioesOrigem = $this->classificarRegiao($prefixoOrigem);
        $regioesDestino = $this->classificarRegiao($prefixoDestino);

        if ($regioesOrigem === $regioesDestino) {
            return 200;
        }

        $distanciaBase = [
            'SP_CAPITAL' => 0,
            'SP_INTERIOR' => 100,
            'SUDESTE' => 400,
            'SUL' => 700,
            'CENTRO_OESTE' => 1000,
            'NORDESTE' => 1500,
            'NORTE' => 2000,
        ];

        $distOrigem = $distanciaBase[$regioesOrigem] ?? 500;
        $distDestino = $distanciaBase[$regioesDestino] ?? 500;

        return abs($distOrigem - $distDestino) + 200;
    }

    private function classificarRegiao(int $prefixo): string
    {
        if ($prefixo >= 100 && $prefixo <= 199) return 'SP_CAPITAL';
        if ($prefixo >= 200 && $prefixo <= 299) return 'SP_INTERIOR';
        if ($prefixo >= 300 && $prefixo <= 399) return 'SP_INTERIOR';
        if ($prefixo >= 400 && $prefixo <= 499) return 'SP_INTERIOR';
        if ($prefixo >= 500 && $prefixo <= 599) return 'SP_INTERIOR';
        if ($prefixo >= 600 && $prefixo <= 699) return 'SP_INTERIOR';
        if ($prefixo >= 700 && $prefixo <= 799) return 'CENTRO_OESTE';
        if ($prefixo >= 800 && $prefixo <= 899) return 'SUL';
        if ($prefixo >= 900 && $prefixo <= 999) return 'SUL';
        if ($prefixo >= 100 && $prefixo <= 299) return 'SUDESTE';
        if ($prefixo >= 300 && $prefixo <= 499) return 'SUDESTE';
        if ($prefixo >= 500 && $prefixo <= 599) return 'NORDESTE';
        return 'NORTE';
    }

    public function listarServicos(): array
    {
        return [
            [
                'codigo' => '04510',
                'nome' => 'PAC',
                'descricao' => 'Encomenda normal, prazo maior, valor mais acessivel',
            ],
            [
                'codigo' => '04014',
                'nome' => 'SEDEX',
                'descricao' => 'Encomenda prioritaria, prazo menor, valor mais alto',
            ],
        ];
    }

    private function requisicao(string $url): ?array
    {
        $response = $this->requisicaoRaw($url);

        if ($response === null) {
            return null;
        }

        $decoded = json_decode($response, true);

        if ($decoded !== null) {
            return $decoded;
        }

        return $this->parseXmlResponse($response);
    }

    private function requisicaoComHeaders(string $url, array $headers): ?string
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false || $response === '') {
            return null;
        }

        $decoded = json_decode($response, true);
        if ($decoded !== null) {
            return $response;
        }

        return null;
    }

    private function requisicaoRaw(string $url): ?string
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || $response === false) {
            return null;
        }

        return $response;
    }

    private function parseXmlResponse(string $xml): ?array
    {
        $old = libxml_use_internal_errors(true);
        $doc = simplexml_load_string($xml);
        libxml_use_internal_errors($old);

        if ($doc === false) {
            return null;
        }

        $json = json_encode($doc);
        return json_decode($json, true);
    }

    private function normalizarCep(string $cep): string
    {
        return preg_replace('/\D/', '', $cep);
    }
}
