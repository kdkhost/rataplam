<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Rataplam\Config\Database;

$produtos = Database::fetchAll("SELECT id, nome, slug, categoria_id, faixa_etaria_id FROM produtos WHERE ativo = 1 ORDER BY id");

$tamanhosPorFaixa = [
    1 => ['RN', '1', '2'],           // 0-2 anos
    2 => ['2', '3', '4'],            // 2-4 anos
    3 => ['4', '6', '8'],            // 4-8 anos
    4 => ['8', '10', '12'],          // 8-12 anos
    5 => ['12', '14', '16'],         // 12-16 anos
];

$coresPadrao = [
    1 => [['cor' => 'Branco', 'hex' => '#FFFFFF'], ['cor' => 'Azul', 'hex' => '#0066CC'], ['cor' => 'Rosa', 'hex' => '#FF69B4']],
    2 => [['cor' => 'Branco', 'hex' => '#FFFFFF'], ['cor' => 'Azul Claro', 'hex' => '#87CEEB'], ['cor' => 'Verde', 'hex' => '#228B22']],
    3 => [['cor' => 'Branco', 'hex' => '#FFFFFF'], ['cor' => 'Amarelo', 'hex' => '#FFD700'], ['cor' => 'Vermelho', 'hex' => '#CC0000']],
    4 => [['cor' => 'Preto', 'hex' => '#000000'], ['cor' => 'Branco', 'hex' => '#FFFFFF'], ['cor' => 'Azul Marinho', 'hex' => '#000080']],
    5 => [['cor' => 'Preto', 'hex' => '#000000'], ['cor' => 'Branco', 'hex' => '#FFFFFF'], ['cor' => 'Cinza', 'hex' => '#808080']],
];

$estoqueBase = [8, 12, 15, 20, 5, 10];

$count = 0;
foreach ($produtos as $produto) {
    $faixaId = $produto['faixa_etaria_id'] ?? 1;
    $catId = $produto['categoria_id'] ?? 1;

    $tamanhos = $tamanhosPorFaixa[$faixaId] ?? $tamanhosPorFaixa[1];
    $cores = $coresPadrao[$catId] ?? $coresPadrao[1];

    foreach ($cores as $corInfo) {
        foreach ($tamanhos as $tamanho) {
            $sku = strtoupper(substr($produto['slug'], 0, 8)) . '-' . $produto['id'] . '-' . strtoupper(substr($corInfo['cor'], 0, 3)) . '-' . $tamanho;
            $estoque = $estoqueBase[array_rand($estoqueBase)];
            $precoAdicional = ($tamanho >= '8' && $tamanho !== 'RN') ? 5.00 : 0.00;

            try {
                Database::insert('variacoes', [
                    'produto_id' => $produto['id'],
                    'nome' => $corInfo['cor'] . ' - ' . $tamanho,
                    'sku' => $sku,
                    'preco_adicional' => $precoAdicional,
                    'estoque' => $estoque,
                    'cor' => $corInfo['cor'],
                    'cor_hex' => $corInfo['hex'],
                    'tamanho' => $tamanho,
                    'ativa' => 1,
                ]);
                $count++;
            } catch (\Throwable $e) {
                // SKU duplicates are expected for different products, skip silently
            }
        }
    }
}

echo "Variacoes criadas: $count\n";
