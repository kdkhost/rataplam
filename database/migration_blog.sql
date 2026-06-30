-- ============================================
-- RATAPLAM - Migration: Blog
-- Execute: mysql -u user -p rataplam < database/migration_blog.sql
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    resumo TEXT,
    conteudo LONGTEXT,
    imagem VARCHAR(500),
    categoria VARCHAR(100),
    tags VARCHAR(500),
    status ENUM('rascunho', 'publicado', 'arquivado') DEFAULT 'rascunho',
    visualizacoes INT DEFAULT 0,
    publicado_em DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_categoria (categoria),
    INDEX idx_publicado (publicado_em),
    FULLTEXT INDEX idx_busca (titulo, resumo, conteudo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts de exemplo
INSERT IGNORE INTO blog_posts (titulo, slug, resumo, conteudo, imagem, categoria, tags, status, publicado_em) VALUES
(
    'Guia de moda infantil: como vestir seu bebê com estilo',
    'guia-moda-infantil-bebe',
    'Dicas práticas para escolher as melhores roupas para o seu bebê, unindo conforto, segurança e muito estilo.',
    '<p>Vestir um bebê é uma das tarefas mais adoráveis da maternidade. Mas além do visual fofo, é preciso pensar no conforto e na segurança do pequeno.</p><h2>1. Priorize tecidos naturais</h2><p>Algodão e malha são os melhores amigos do bebê. Eles são macios, respiráveis e ajudam a regular a temperatura corporal. Evite tecidos sintéticos que podem causar irritações na pele sensível dos bebês.</p><h2>2. Atenção aos fechamentos</h2><p>Prefira roupas com zíper ou botões de pressão que facilitam as trocas de fraldas. Macacões com abertura completa na parte de baixo são os queridinhos das mamães por esse motivo.</p><h2>3. Tamanho ideal</h2><p>Bebês crescem muito rápido! Compre um tamanho acima do atual para aproveitar melhor as peças. Roupas muito apertadas dificultam a movimentação e podem incomodar.</p><h2>4. Cores e estampas</h2><p>Aposte em cores alegres e estampas temáticas — animais, natureza, personagens — que estimulam a visão do bebê. A linha RATAPLAM tem opções incríveis para cada fase.</p>',
    'https://static.wixstatic.com/media/c6e4ba_sample1.jpg',
    'Bebê',
    'moda infantil, bebê, dicas',
    'publicado',
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    'Tendências de moda infantil para o verão',
    'tendencias-moda-infantil-verao',
    'Confira as principais tendências de moda infantil para a estação mais quente do ano. Cores vibrantes e muita leveza!',
    '<p>O verão está chegando e com ele uma explosão de cores e estampas na moda infantil. Veja o que vai bombar na temporada!</p><h2>Estampas tropicais</h2><p>Folhas, flores e frutas dominam as coleções deste verão. São peças alegres que transmitem toda a energia da estação.</p><h2>Biquínis com proteção UV</h2><p>A proteção solar é fundamental para crianças. A RATAPLAM tem uma linha completa de biquínis infantis com fator de proteção ultravioleta, garantindo diversão segura na praia ou piscina.</p><h2>Cores neon</h2><p>O neon é tendência forte! Rosa, verde e laranja estão presentes em blusas, bermudas e acessórios. Uma ótima pedida para looks despojados e modernos.</p><h2>Conjuntos combinando</h2><p>Praticidade e estilo andam juntos nos conjuntos coordenados. Blusa + bermuda ou top + calça — a criança sai produzida sem precisar de muito esforço na hora de escolher o look.</p>',
    'https://static.wixstatic.com/media/c6e4ba_sample2.jpg',
    'Tendências',
    'verao, tendencias, moda 2024',
    'publicado',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
    'Como cuidar das roupas infantis: dicas de lavagem e conservação',
    'como-cuidar-roupas-infantis',
    'Aprenda a lavar, secar e armazenar as roupas do seu filho para que durem mais e mantenham a qualidade.',
    '<p>Com tantas peças fofas e coloridas no armário do seu filho, é importante saber como cuidar direitinho para que durem bastante.</p><h2>Lave antes do primeiro uso</h2><p>Sempre lave as roupas novas antes de colocar no bebê. Isso remove resíduos de processos de fabricação e garante mais segurança.</p><h2>Use sabão neutro ou de bebê</h2><p>Detergentes agressivos podem danificar as fibras e irritar a pele sensível das crianças. Prefira produtos específicos para roupas de bebê.</p><h2>Respeite os símbolos da etiqueta</h2><p>Cada peça tem suas instruções de lavagem. Cores escuras geralmente pedem água fria, enquanto roupas brancas toleram temperatura maior.</p><h2>Evite o sol direto nas cores</h2><p>Seque roupas coloridas à sombra ou viradas do avesso para evitar que as cores desbotem com exposição excessiva ao sol.</p><h2>Armazenamento correto</h2><p>Guarde as roupas limpas e bem dobradas. Use sachês de lavanda para um aroma agradável e para afastar insetos naturalmente.</p>',
    'https://static.wixstatic.com/media/c6e4ba_sample3.jpg',
    'Dicas',
    'cuidados, lavagem, conservação',
    'publicado',
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);
