<?php
declare(strict_types=1);

namespace Rataplam\Controllers;

use Rataplam\Config\Database;

class SeoController
{
    public static function getConfig(): void
    {
        $pagina = $_GET['pagina'] ?? 'home';

        $config = Database::fetch('SELECT * FROM seo_config WHERE pagina = ?', [$pagina]);

        if (!$config) {
            $config = self::getConfigPadrao($pagina);
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'config' => $config]);
        exit;
    }

    public static function salvarConfig(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $pagina = $input['pagina'] ?? 'home';
        $titulo = $input['titulo'] ?? '';
        $descricao = $input['descricao'] ?? '';
        $keywords = $input['keywords'] ?? '';
        $ogTitulo = $input['og_titulo'] ?? $titulo;
        $ogDescricao = $input['og_descricao'] ?? $descricao;
        $ogImagem = $input['og_imagem'] ?? '';
        $ogTipo = $input['og_tipo'] ?? 'website';
        $twitterCard = $input['twitter_card'] ?? 'summary_large_image';
        $twitterTitulo = $input['twitter_titulo'] ?? $titulo;
        $twitterDescricao = $input['twitter_descricao'] ?? $descricao;
        $twitterImagem = $input['twitter_imagem'] ?? '';
        $canonicalUrl = $input['canonical_url'] ?? '';
        $robots = $input['robots'] ?? 'index, follow';
        $schemaJson = $input['schema_json'] ?? '';

        $score = self::calcularScore($input);

        $existe = Database::count('seo_config', 'pagina = ?', [$pagina]);

        $dados = [
            'pagina' => $pagina,
            'titulo' => $titulo,
            'descricao' => $descricao,
            'keywords' => $keywords,
            'og_titulo' => $ogTitulo,
            'og_descricao' => $ogDescricao,
            'og_imagem' => $ogImagem,
            'og_tipo' => $ogTipo,
            'twitter_card' => $twitterCard,
            'twitter_titulo' => $twitterTitulo,
            'twitter_descricao' => $twitterDescricao,
            'twitter_imagem' => $twitterImagem,
            'canonical_url' => $canonicalUrl,
            'robots' => $robots,
            'schema_json' => $schemaJson,
            'score_seo' => $score,
        ];

        if ($existe) {
            Database::update('seo_config', $dados, 'pagina = ?', [$pagina]);
        } else {
            Database::insert('seo_config', $dados);
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'score' => $score]);
        exit;
    }

    public static function calcularScoreSeo(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $score = self::calcularScore($input);

        $dicas = self::obterDicas($input);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'score' => $score,
            'dicas' => $dicas,
        ]);
        exit;
    }

    public static function listarPaginas(): void
    {
        $configs = Database::fetchAll('SELECT * FROM seo_config ORDER BY pagina');

        $padroes = ['home', 'loja', 'produto', 'carrinho', 'checkout', 'conta', 'contato', 'sobre'];

        $resultado = [];
        foreach ($padroes as $p) {
            $encontrado = null;
            foreach ($configs as $c) {
                if ($c['pagina'] === $p) {
                    $encontrado = $c;
                    break;
                }
            }
            $resultado[] = $encontrado ?: self::getConfigPadrao($p);
        }

        foreach ($configs as $c) {
            $jaExiste = false;
            foreach ($padroes as $p) {
                if ($c['pagina'] === $p) {
                    $jaExiste = true;
                    break;
                }
            }
            if (!$jaExiste) {
                $resultado[] = $c;
            }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'paginas' => $resultado]);
        exit;
    }

    public static function preview(): void
    {
        $input = json_decode(file_get_contents('php://input'), true);

        $titulo = $input['titulo'] ?? 'RATAPLAM - Roupas Infantis';
        $descricao = $input['descricao'] ?? 'Loja de roupas infantis RATAPLAM';
        $ogImagem = $input['og_imagem'] ?? '';
        $url = $input['url'] ?? 'https://rataplam.com.br';
        $tipo = $input['og_tipo'] ?? 'website';

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'sucesso' => true,
            'preview' => [
                'google' => [
                    'titulo' => substr($titulo, 0, 60),
                    'url' => $url,
                    'descricao' => substr($descricao, 0, 155),
                ],
                'facebook' => [
                    'url' => $url,
                    'dominio' => parse_url($url, PHP_URL_HOST),
                    'titulo' => substr($titulo, 0, 65),
                    'descricao' => substr($descricao, 0, 200),
                    'imagem' => $ogImagem,
                    'tipo' => $tipo,
                ],
                'twitter' => [
                    'titulo' => substr($titulo, 0, 70),
                    'descricao' => substr($descricao, 0, 200),
                    'imagem' => $ogImagem,
                    'card' => $input['twitter_card'] ?? 'summary_large_image',
                ],
                'linkedin' => [
                    'titulo' => substr($titulo, 0, 70),
                    'descricao' => substr($descricao, 0, 200),
                    'imagem' => $ogImagem,
                    'url' => $url,
                ],
            ]
        ]);
        exit;
    }

    private static function calcularScore(array $data): int
    {
        $score = 0;

        $titulo = $data['titulo'] ?? '';
        $descricao = $data['descricao'] ?? '';
        $ogTitulo = $data['og_titulo'] ?? '';
        $ogDescricao = $data['og_descricao'] ?? '';
        $ogImagem = $data['og_imagem'] ?? '';
        $keywords = $data['keywords'] ?? '';
        $canonicalUrl = $data['canonical_url'] ?? '';
        $schemaJson = $data['schema_json'] ?? '';
        $twitterCard = $data['twitter_card'] ?? '';
        $robots = $data['robots'] ?? 'index, follow';

        if (!empty($titulo)) {
            $score += 10;
            $len = mb_strlen($titulo);
            if ($len >= 30 && $len <= 60) $score += 10;
            elseif ($len > 60) $score += 5;
        }

        if (!empty($descricao)) {
            $score += 10;
            $len = mb_strlen($descricao);
            if ($len >= 120 && $len <= 160) $score += 10;
            elseif ($len > 160) $score += 5;
        }

        if (!empty($keywords)) $score += 5;
        if (!empty($ogTitulo)) $score += 5;
        if (!empty($ogDescricao)) $score += 5;

        if (!empty($ogImagem)) {
            $score += 10;
            if (filter_var($ogImagem, FILTER_VALIDATE_URL)) $score += 5;
        }

        if (!empty($canonicalUrl)) $score += 5;
        if (!empty($schemaJson)) $score += 10;

        if (!empty($twitterCard)) $score += 5;

        if ($robots === 'index, follow') $score += 5;
        elseif ($robots === 'noindex, nofollow') $score -= 5;

        return min(100, max(0, $score));
    }

    private static function obterDicas(array $data): array
    {
        $dicas = [];

        $titulo = $data['titulo'] ?? '';
        $descricao = $data['descricao'] ?? '';
        $ogImagem = $data['og_imagem'] ?? '';
        $keywords = $data['keywords'] ?? '';
        $canonicalUrl = $data['canonical_url'] ?? '';
        $schemaJson = $data['schema_json'] ?? '';

        if (empty($titulo)) {
            $dicas[] = ['nivel' => 'critico', 'mensagem' => 'Título SEO é obrigatório'];
        } elseif (mb_strlen($titulo) > 60) {
            $dicas[] = ['nivel' => 'aviso', 'mensagem' => 'Título muito longo (máx. 60 caracteres)'];
        } elseif (mb_strlen($titulo) < 30) {
            $dicas[] = ['nivel' => 'aviso', 'mensagem' => 'Título muito curto (mín. 30 caracteres)'];
        }

        if (empty($descricao)) {
            $dicas[] = ['nivel' => 'critico', 'mensagem' => 'Meta descrição é obrigatória'];
        } elseif (mb_strlen($descricao) > 160) {
            $dicas[] = ['nivel' => 'aviso', 'mensagem' => 'Descrição muito longa (máx. 160 caracteres)'];
        } elseif (mb_strlen($descricao) < 120) {
            $dicas[] = ['nivel' => 'dica', 'mensagem' => 'Descrição pode ser mais detalhada (mín. 120 caracteres)'];
        }

        if (empty($ogImagem)) {
            $dicas[] = ['nivel' => 'critico', 'mensagem' => 'Imagem Open Graph é essencial para redes sociais'];
        } elseif (!filter_var($ogImagem, FILTER_VALIDATE_URL)) {
            $dicas[] = ['nivel' => 'erro', 'mensagem' => 'URL da imagem Open Graph inválida'];
        }

        if (empty($keywords)) {
            $dicas[] = ['nivel' => 'dica', 'mensagem' => 'Adicione palavras-chave relevantes'];
        }

        if (empty($canonicalUrl)) {
            $dicas[] = ['nivel' => 'aviso', 'mensagem' => 'URL canônica ajuda a evitar conteúdo duplicado'];
        }

        if (empty($schemaJson)) {
            $dicas[] = ['nivel' => 'dica', 'mensagem' => 'Schema JSON-LD melhora a visibilidade nos buscadores'];
        }

        $ogTitulo = $data['og_titulo'] ?? '';
        if (empty($ogTitulo)) {
            $dicas[] = ['nivel' => 'dica', 'mensagem' => 'Título Open Graph melhora compartilhamento'];
        }

        $ogDescricao = $data['og_descricao'] ?? '';
        if (empty($ogDescricao)) {
            $dicas[] = ['nivel' => 'dica', 'mensagem' => 'Descrição Open Graph melhora compartilhamento'];
        }

        return $dicas;
    }

    private static function getConfigPadrao(string $pagina): array
    {
        $padroes = [
            'home' => [
                'titulo' => 'RATAPLAM - Roupas Infantis | Qualidade e Conforto',
                'descricao' => 'Loja de roupas infantis RATAPLAM. Macacões, bermudas, blusas, biquínis e acessórios para crianças de 0 a 14 anos. Frete grátis acima de R$ 199,90.',
                'keywords' => 'roupas infantis, roupas de bebê, macacão infantil, bermuda menino, blusa criança, biquíni infantil, RATAPLAM',
            ],
            'loja' => [
                'titulo' => 'Loja RATAPLAM | Roupas Infantis para Todas as Idades',
                'descricao' => 'Confira nossa coleção de roupas infantis. Encontre macacões, bermudas, blusas e muito mais para crianças de 0 a 14 anos.',
                'keywords' => 'loja roupas infantis, comprar roupas criança, moda infantil',
            ],
            'produto' => [
                'titulo' => 'Produto RATAPLAM | Roupas Infantis',
                'descricao' => 'Confira este produto RATAPLAM. Roupas infantis de qualidade para o seu pequeno.',
                'keywords' => 'produto infantil, roupa criança, RATAPLAM',
            ],
            'contato' => [
                'titulo' => 'Contato RATAPLAM | Fale Conosco',
                'descricao' => 'Entre em contato com a RATAPLAM. Tire suas dúvidas, sugestões ou elogios. Estamos aqui para ajudar!',
                'keywords' => 'contato RATAPLAM, fale conosco, suporte',
            ],
            'sobre' => [
                'titulo' => 'Sobre a RATAPLAM | Nossa História',
                'descricao' => 'Conheça a RATAPLAM. Roupas infantis com amor, qualidade e conforto para o seu pequeno.',
                'keywords' => 'sobre RATAPLAM, história, empresa',
            ],
        ];

        $base = $padroes[$pagina] ?? [
            'titulo' => 'RATAPLAM - Roupas Infantis',
            'descricao' => 'Loja de roupas infantis RATAPLAM',
            'keywords' => 'roupas infantis, RATAPLAM',
        ];

        return array_merge([
            'id' => 0,
            'pagina' => $pagina,
            'og_titulo' => $base['titulo'],
            'og_descricao' => $base['descricao'],
            'og_imagem' => '/images/og-default.jpg',
            'og_tipo' => 'website',
            'twitter_card' => 'summary_large_image',
            'twitter_titulo' => $base['titulo'],
            'twitter_descricao' => $base['descricao'],
            'twitter_imagem' => '',
            'canonical_url' => '',
            'robots' => 'index, follow',
            'schema_json' => '',
            'score_seo' => 0,
        ], $base);
    }
}
