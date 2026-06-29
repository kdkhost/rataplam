-- ============================================
-- RATAPLAM - Schema do Banco de Dados MariaDB
-- Loja de Roupas Infantis
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS rataplam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rataplam;

-- ============================================
-- TABELAS DE USUÁRIOS E AUTENTICAÇÃO
-- ============================================

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(15),
    data_nascimento DATE,
    sexo ENUM('M', 'F', 'O') DEFAULT 'O',
    foto_perfil VARCHAR(500),
    role ENUM('admin', 'vendedor', 'cliente') DEFAULT 'cliente',
    ativo TINYINT(1) DEFAULT 1,
    email_verificado TINYINT(1) DEFAULT 0,
    token_verificacao VARCHAR(64),
    token_reset_senha VARCHAR(64),
    ultimo_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE TOKENS (SESSÃO)
-- ============================================

CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(128) NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expira (expira_em)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE ENDEREÇOS
-- ============================================

CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome_destinatario VARCHAR(255) NOT NULL,
    cpf_destinatario VARCHAR(14),
    cep VARCHAR(9) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    telefone_destinatario VARCHAR(15),
    principal TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_cep (cep)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE CATEGORIAS
-- ============================================

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    imagem VARCHAR(500),
    categoria_pai_id INT,
    ordem INT DEFAULT 0,
    ativa TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_ativa (ativa)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE FAIXAS ETÁRIAS
-- ============================================

CREATE TABLE faixas_etarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    idade_min INT NOT NULL,
    idade_max INT NOT NULL,
    imagem VARCHAR(500),
    ordem INT DEFAULT 0,
    ativa TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE PRODUTOS
-- ============================================

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    descricao_curta VARCHAR(500),
    preco DECIMAL(10,2) NOT NULL,
    preco_promocional DECIMAL(10,2),
    custo DECIMAL(10,2) DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    barras VARCHAR(50),
    estoque INT DEFAULT 0,
    estoque_minimo INT DEFAULT 5,
    peso_gramas INT,
    altura_cm DECIMAL(5,2),
    largura_cm DECIMAL(5,2),
    profundidade_cm DECIMAL(5,2),
    categoria_id INT,
    faixa_etaria_id INT,
    genero ENUM('M', 'F', 'U') DEFAULT 'U',
    destaque TINYINT(1) DEFAULT 0,
    novo TINYINT(1) DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    visualizacoes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (faixa_etaria_id) REFERENCES faixas_etarias(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_categoria (categoria_id),
    INDEX idx_faixa_etaria (faixa_etaria_id),
    INDEX idx_preco (preco),
    INDEX idx_destaque (destaque),
    INDEX idx_ativo (ativo),
    FULLTEXT INDEX idx_busca (nome, descricao)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE IMAGENS DOS PRODUTOS
-- ============================================

CREATE TABLE produtos_imagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt VARCHAR(255),
    principal TINYINT(1) DEFAULT 0,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_produto (produto_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE VARIAÇÕES (TAMANHO/COR)
-- ============================================

CREATE TABLE variacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    preco_adicional DECIMAL(10,2) DEFAULT 0,
    estoque INT DEFAULT 0,
    cor VARCHAR(50),
    cor_hex VARCHAR(7),
    tamanho VARCHAR(20),
    ativa TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_produto (produto_id),
    INDEX idx_tamanho (tamanho),
    INDEX idx_cor (cor)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE AVALIAÇÕES
-- ============================================

CREATE TABLE avaliacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nota TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    titulo VARCHAR(255),
    comentario TEXT,
    aprovada TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_produto (produto_id),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE CUPONS DE DESCONTO
-- ============================================

CREATE TABLE cupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    tipo ENUM('percentual', 'fixo') DEFAULT 'percentual',
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo DECIMAL(10,2) DEFAULT 0,
    limite_uso INT,
    usos_realizados INT DEFAULT 0,
    data_inicio DATETIME,
    data_fim DATETIME,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE PEDIDOS
-- ============================================

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    usuario_id INT,
    status ENUM('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado', 'reembolsado') DEFAULT 'pendente',
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    frete DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    cupom_id INT,
    cupom_codigo VARCHAR(50),
    nome_comprador VARCHAR(255),
    email_comprador VARCHAR(255),
    cpf_comprador VARCHAR(14),
    telefone_comprador VARCHAR(15),
    -- Endereço de cobrança
    cep_cobranca VARCHAR(9),
    logradouro_cobranca VARCHAR(255),
    numero_cobranca VARCHAR(20),
    complemento_cobranca VARCHAR(100),
    bairro_cobranca VARCHAR(100),
    cidade_cobranca VARCHAR(100),
    estado_cobranca CHAR(2),
    -- Endereço de entrega
    cep_entrega VARCHAR(9),
    logradouro_entrega VARCHAR(255),
    numero_entrega VARCHAR(20),
    complemento_entrega VARCHAR(100),
    bairro_entrega VARCHAR(100),
    cidade_entrega VARCHAR(100),
    estado_entrega CHAR(2),
    -- Pagamento
    metodo_pagamento VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_id VARCHAR(255),
    status_pagamento VARCHAR(50),
    -- Frete
    transportadora VARCHAR(100),
    codigo_rastreio VARCHAR(100),
    prazo_entrega_dias INT,
    -- Observações
    observacoes TEXT,
    data_pagamento DATETIME,
    data_envio DATETIME,
    data_entrega DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE SET NULL,
    INDEX idx_numero (numero_pedido),
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE ITENS DO PEDIDO
-- ============================================

CREATE TABLE pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    variacao_id INT,
    nome_produto VARCHAR(255) NOT NULL,
    sku VARCHAR(50),
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    preco_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE PAGAMENTOS (MERCADOPAGO/STRIPE)
-- ============================================

CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    gateway VARCHAR(50) NOT NULL, -- 'mercadopago' ou 'stripe'
    payment_id VARCHAR(255) NOT NULL,
    external_reference VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    status_detail VARCHAR(100),
    tipo_pagamento VARCHAR(50), -- 'credit_card', 'ticket', 'boleto', etc
    valor DECIMAL(10,2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    description TEXT,
    payer_email VARCHAR(255),
    payer_nome VARCHAR(255),
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    installments INT DEFAULT 1,
    webhook_received_at DATETIME,
    webhook_payload JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE WEBHOOKS (LOG)
-- ============================================

CREATE TABLE webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway VARCHAR(50) NOT NULL,
    event_type VARCHAR(100),
    payload JSON,
    processado TINYINT(1) DEFAULT 0,
    erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gateway (gateway),
    INDEX idx_processado (processado)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DO CARRINHO DE COMPRAS
-- ============================================

CREATE TABLE carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    usuario_id INT,
    produto_id INT NOT NULL,
    variacao_id INT,
    quantidade INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE LISTA DE DESEJOS
-- ============================================

CREATE TABLE lista_desejos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    produto_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_usuario_produto (usuario_id, produto_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE CONFIGURAÇÕES DO SISTEMA
-- ============================================

CREATE TABLE configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'texto',
    grupo VARCHAR(50),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chave (chave),
    INDEX idx_grupo (grupo)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE LOG DE EMAILS
-- ============================================

CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    template VARCHAR(100),
    dados JSON,
    status ENUM('pendente', 'enviado', 'erro') DEFAULT 'pendente',
    erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_destinatario (destinatario),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE SMPS CONFIGURAÇÃO
-- ============================================

CREATE TABLE smtp_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL DEFAULT 'Principal',
    host VARCHAR(255) NOT NULL,
    porta INT NOT NULL DEFAULT 587,
    criptografia ENUM('tls', 'ssl', 'none') DEFAULT 'tls',
    usuario VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    de_nome VARCHAR(255) NOT NULL,
    de_email VARCHAR(255) NOT NULL,
    reply_to VARCHAR(255),
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE PROVADOR VIRTUAL
-- ============================================

CREATE TABLE provador_virtual (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    session_id VARCHAR(64),
    foto_crianca VARCHAR(500) NOT NULL,
    produto_id INT NOT NULL,
    resultado_url VARCHAR(500),
    status ENUM('processando', 'concluido', 'erro') DEFAULT 'processando',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_session (session_id)
) ENGINE=InnoDB;

-- ============================================
-- TABELAS DE BANNERS/SLIDERS
-- ============================================

CREATE TABLE banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    subtitulo VARCHAR(255),
    imagem VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    ordem INT DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB;

-- ============================================
-- DADOS INICIAIS - CATEGORIAS
-- ============================================

INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
('Bebê', 'bebe', 'Roupas para bebês de 0 a 1 ano', 1),
('Acessórios', 'acessorios', 'Sapatos, toalhas e acessórios infantis', 2),
('Bermudas', 'bermudas', 'Bermudas para meninos', 3),
('Blusas', 'blusas', 'Blusas e camisetas infantis', 4),
('Biquínis', 'biquinis', 'Biquínis infantis com proteção UV', 5),
('Calças', 'calcas', 'Calças infantis', 6),
('Conjuntos', 'conjuntos', 'Conjuntos infantis completos', 7),
('Macacões', 'macacoes', 'Macacões para bebês e crianças', 8),
('Vestidos', 'vestidos', 'Vestidos infantis', 9);

-- ============================================
-- DADOS INICIAIS - FAIXAS ETÁRIAS
-- ============================================

INSERT INTO faixas_etarias (nome, slug, idade_min, idade_max, ordem) VALUES
('0 a 1 ano', '0-a-1', 0, 1, 1),
('1 a 3 anos', '1-a-3', 1, 3, 2),
('4 a 8 anos', '4-a-8', 4, 8, 3),
('10 a 14 anos', '10-a-14', 10, 14, 4);

-- ============================================
-- DADOS INICIAIS - PRODUTOS (populados do site)
-- ============================================

INSERT INTO produtos (nome, slug, descricao_curta, preco, estoque, categoria_id, faixa_etaria_id, genero, destaque, novo) VALUES
-- Bebê
('Conjunto Navy', 'conjunto-navy', 'Conjunto bebê elegante na cor navy', 129.90, 10, 1, 1, 'U', 1, 0),
('Vestido Celebrare', 'vestido-celebrare', 'Vestido infantil Celebrare', 69.90, 15, 9, 1, 'F', 1, 0),
('Macacão Rita', 'macacao-rita', 'Macacão bebê Rita', 74.90, 20, 8, 1, 'F', 0, 0),
('Macacão Sansão', 'macacao-sansao', 'Macacão bebê Sansão', 74.90, 20, 8, 1, 'M', 0, 0),
('Conjunto Nature', 'conjunto-nature', 'Conjunto natureza para bebê', 139.90, 8, 1, 1, 'U', 0, 0),
('Vestido Delicate', 'vestido-delicate', 'Vestido delicado infantil', 98.90, 12, 9, 1, 'F', 1, 0),
('Body Sansão', 'body-sansao', 'Body bebê Sansão', 42.90, 25, 1, 1, 'M', 0, 0),
('Macacão Cachorro', 'macacao-cachorro', 'Macacão com estampa de cachorro', 94.90, 15, 8, 1, 'U', 1, 0),
('Macacão Nemo', 'macacao-nemo', 'Macacão estampa Nemo', 82.90, 18, 8, 1, 'U', 0, 0),
('Macacão Cara de Urso', 'macacao-cara-de-urso', 'Macacão com cara de urso', 149.90, 10, 8, 1, 'U', 1, 0),
('Macacão ABC', 'macacao-abc', 'Macacão educativo ABC', 129.90, 12, 8, 1, 'U', 0, 0),
('Macacão Transportes', 'macacao-transportes', 'Macacão estampa de transportes', 148.90, 8, 8, 2, 'M', 1, 0),
('Macacão Cogumelo', 'macacao-cogumelo', 'Macacão estampa cogumelo', 137.90, 14, 8, 1, 'U', 0, 0),
('Conjunto Deby', 'conjunto-deby', 'Conjunto Deby infantil', 189.90, 6, 7, 1, 'F', 1, 0),
('Macacão Leo', 'macacao-leo', 'Macacão bebê Leo', 136.90, 12, 8, 1, 'M', 0, 0),
('Macacão Flor', 'macacao-flor', 'Macacão estampa floral', 137.90, 16, 8, 1, 'F', 0, 0),
('Macacão Selva', 'macacao-selva', 'Macacão estampa selva', 137.90, 14, 8, 2, 'U', 0, 0),
('Macacão Abelhas', 'macacao-abelhas', 'Macacão estampa de abelhas', 137.90, 10, 8, 1, 'U', 0, 0),
('Macacão Luiza', 'macacao-luiza', 'Macacão bebê Luiza', 152.90, 8, 8, 1, 'F', 1, 0),
('Macacão Beni', 'macacao-beni', 'Macacão bebê Beni', 168.90, 6, 8, 1, 'U', 0, 0),

-- Acessórios
('Sapatinho Tricô Time', 'sapatinho-trico-time', 'Sapatinho de tricô estilo time', 38.90, 30, 2, 1, 'U', 0, 0),
('Sapatinho Tricô Bota', 'sapatinho-trico-bota', 'Sapatinho tricô estilo bota', 38.90, 25, 2, 1, 'U', 0, 0),
('Sapatinho Tricô Bicolor', 'sapatinho-trico-bicolor', 'Sapatinho tricô bicolor', 38.90, 28, 2, 1, 'U', 0, 0),
('Toalha Batizado', 'toalha-batizado', 'Toalha para batizado', 59.90, 20, 2, 1, 'U', 1, 0),
('Colete Tricô Trick', 'colete-trico-trick', 'Colete de tricô Trick', 134.90, 10, 2, 2, 'U', 0, 0),
('Sapatinho Tricô Liso', 'sapatinho-trico-liso', 'Sapatinho tricô liso', 38.90, 30, 2, 1, 'U', 0, 0),

-- Bermudas
('Bermuda Cuca', 'bermuda-cuca', 'Bermuda infantil Cuca', 21.90, 40, 3, 3, 'M', 0, 0),
('Bermuda Bob', 'bermuda-bob', 'Bermuda infantil Bob', 62.90, 20, 3, 3, 'M', 0, 0),
('Bermuda Gamer', 'bermuda-gamer', 'Bermuda gamer para meninos', 109.90, 15, 3, 3, 'M', 1, 0),
('Bermuda Show', 'bermuda-show', 'Bermuda Show', 112.90, 12, 3, 3, 'M', 0, 0),
('Bermuda Kayke', 'bermuda-kayke', 'Bermuda Kayke', 84.90, 18, 3, 3, 'M', 0, 0),
('Bermuda Play', 'bermuda-play', 'Bermuda Play', 112.90, 14, 3, 3, 'M', 0, 0),
('Bermuda Vida', 'bermuda-vida', 'Bermuda Vida', 54.90, 22, 3, 3, 'M', 0, 0),
('Bermuda Rasga', 'bermuda-rasga', 'Bermuda Rasga', 114.90, 10, 3, 4, 'M', 0, 0),
('Bermuda Naipe', 'bermuda-naipe', 'Bermuda Naipe', 64.90, 20, 3, 3, 'M', 0, 0),
('Bermuda Pepe', 'bermuda-pepe', 'Bermuda Pepe', 62.90, 18, 3, 3, 'M', 0, 0),
('Bermuda Omar', 'bermuda-omar', 'Bermuda Omar', 52.90, 25, 3, 3, 'M', 0, 0),
('Bermuda Zion', 'bermuda-zion', 'Bermuda Zion', 49.90, 22, 3, 3, 'M', 0, 0),
('Bermuda Explorer', 'bermuda-explore', 'Bermuda Explorer', 69.90, 16, 3, 3, 'M', 1, 0),
('Bermuda Positive', 'bermuda-positive', 'Bermuda Positive', 124.90, 8, 3, 4, 'M', 0, 0),
('Bermuda Tropical', 'bermuda-tropical', 'Bermuda Tropical', 132.90, 10, 3, 4, 'M', 1, 0),
('Bermuda Andes', 'bermuda-andes', 'Bermuda Andes', 102.90, 14, 3, 4, 'M', 0, 0),
('Bermuda Posi', 'bermuda-posi', 'Bermuda Posi', 134.90, 8, 3, 4, 'M', 0, 0),
('Bermuda Expedit', 'bermuda-expedit', 'Bermuda Expedit', 137.90, 6, 3, 4, 'M', 0, 0),
('Bermuda Cena', 'bermuda-cena', 'Bermuda Cena', 112.90, 12, 3, 4, 'M', 0, 0),
('Bermuda Spray', 'bermuda-spray', 'Bermuda Spray', 74.90, 15, 3, 3, 'M', 0, 0),

-- Blusas
('Blusa Friends Trip', 'blusa-friends-trip', 'Blusa Friends Trip', 47.90, 20, 4, 3, 'U', 0, 0),
('Blusa Princesa Vet', 'blusa-princesa-vet', 'Blusa Princesa Veterinária', 36.90, 25, 4, 3, 'F', 1, 0),
('Blusa Boggie', 'blusa-boggie', 'Blusa Boggie', 57.90, 12, 4, 3, 'U', 0, 0),
('Blusa Senso', 'blusa-senso', 'Blusa Senso', 36.90, 22, 4, 3, 'U', 0, 0),
('Blusa Underwater', 'blusa-underwater', 'Blusa Underwater', 42.90, 18, 4, 3, 'U', 0, 0),
('Blusa Stingray', 'blusa-stingray', 'Blusa Stingray', 39.90, 20, 4, 3, 'U', 0, 0),
('Blusa Clean', 'blusa-clean', 'Blusa Clean', 49.90, 15, 4, 3, 'U', 0, 0),
('Blusa Street', 'blusa-street', 'Blusa Street', 52.90, 14, 4, 4, 'M', 0, 0),
('Blusa Seahorse', 'blusa-seahorse', 'Blusa Seahorse', 44.90, 18, 4, 3, 'U', 0, 0),
('Blusa Mar', 'blusa-mar', 'Blusa Mar', 57.90, 10, 4, 3, 'U', 0, 0),
('Blusa Pranchas', 'blusa-pranchas', 'Blusa Pranchas', 51.90, 16, 4, 3, 'M', 0, 0),
('Blusa Water Melon', 'blusa-water-melon', 'Blusa Water Melon', 46.90, 20, 4, 3, 'F', 0, 0),
('Blusa Cão', 'blusa-cao', 'Blusa estampa de cão', 42.90, 18, 4, 3, 'U', 0, 0),
('Blusa Foguete', 'blusa-foguete', 'Blusa estampa foguete', 44.90, 22, 4, 3, 'M', 1, 0),
('Blusa Concha', 'blusa-concha', 'Blusa Concha', 52.90, 14, 4, 3, 'F', 0, 0),
('Blusa Maresia', 'blusa-maresia', 'Blusa Maresia', 49.90, 16, 4, 3, 'F', 0, 0),
('Blusa Canada', 'blusa-canada', 'Blusa Canada', 39.90, 20, 4, 3, 'M', 0, 0),
('Blusa Selo', 'blusa-selo', 'Blusa Selo', 46.90, 12, 4, 3, 'U', 0, 0),
('Blusa Big Wave', 'blusa-big-wave', 'Blusa Big Wave', 52.90, 10, 4, 3, 'M', 0, 0),
('Blusa Flor de Crochê', 'blusa-flor-de-croche', 'Blusa Flor de Crochê', 39.90, 18, 4, 3, 'F', 1, 0),

-- Biquínis
('Biquíni Liana', 'biquini-liana', 'Biquíni infantil Liana', 104.90, 12, 5, 3, 'F', 1, 0),
('Biquíni Arco Íris', 'biquini-arco-iris', 'Biquíni Arco Íris', 99.90, 14, 5, 3, 'F', 0, 0),
('Biquíni Susy', 'biquini-susy', 'Biquíni Susy', 116.90, 10, 5, 3, 'F', 0, 0),
('Biquíni UV Primavera', 'biquini-uv-primavera', 'Biquíni UV Proteção Primavera', 96.90, 16, 5, 3, 'F', 1, 0),
('Biquíni UV Borboletas L', 'biquini-uv-borboletas-l', 'Biquíni UV Borboletas Grande', 189.90, 6, 5, 4, 'F', 0, 0),
('Biquíni UV Oriente', 'biquini-uv-oriente', 'Biquíni UV Oriente', 129.90, 10, 5, 3, 'F', 0, 0),
('Biquíni UV Dina', 'biquini-uv-dina', 'Biquíni UV Dina', 147.90, 8, 5, 4, 'F', 1, 0),
('Biquíni UV Arcos', 'biquini-uv-arcos', 'Biquíni UV Arcos', 109.90, 12, 5, 3, 'F', 0, 0),
('Biquíni UV Confete', 'biquini-uv-confete', 'Biquíni UV Confete', 139.90, 8, 5, 4, 'F', 0, 0),
('Biquíni UV Borboletas', 'biquini-uv-borboletas', 'Biquíni UV Borboletas', 109.90, 14, 5, 3, 'F', 0, 0),

-- Calças
('Calça Bento', 'calca-bento', 'Calça infantil Bento', 139.90, 12, 6, 3, 'M', 1, 0),
('Calça Run', 'calca-run', 'Calça Run esportiva', 119.90, 15, 6, 3, 'M', 0, 0),
('Calça Suez', 'calca-suez', 'Calça Suez', 87.90, 18, 6, 3, 'M', 0, 0),
('Calça Practice', 'calca-practice', 'Calça Practice', 82.90, 20, 6, 3, 'M', 0, 0),
('Calça Lion', 'calca-lion', 'Calça Lion', 144.90, 8, 6, 3, 'M', 0, 0),
('Calça Pantacour', 'calca-pantacour', 'Calça Pantacour', 49.90, 22, 6, 3, 'F', 0, 0),
('Calça Nono', 'calca-nono', 'Calça Nono', 39.90, 25, 6, 2, 'U', 0, 0),
('Calça Juno', 'calca-juno', 'Calça Juno', 52.90, 18, 6, 3, 'F', 0, 0),
('Calça Tuctuc', 'calca-tuctuc', 'Calça Tuctuc', 42.90, 20, 6, 2, 'U', 0, 0);

-- ============================================
-- DADOS INICIAIS - ADMIN
-- ============================================

INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Administrador', 'admin@rataplam.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ============================================
-- DADOS INICIAIS - CONFIGURAÇÕES
-- ============================================

INSERT INTO configuracoes (chave, valor, tipo, grupo, descricao) VALUES
('nome_loja', 'RATAPLAM', 'texto', 'geral', 'Nome da loja'),
('email_loja', 'contato@rataplam.com.br', 'email', 'geral', 'E-mail principal da loja'),
('telefone_loja', '(11) 99999-9999', 'telefone', 'geral', 'Telefone da loja'),
('cnpj_loja', '00.000.000/0001-00', 'cnpj', 'geral', 'CNPJ da loja'),
('endereco_loja', 'São Paulo - SP', 'texto', 'geral', 'Endereço da loja'),
('frete_gratis_valor', '199.90', 'moeda', 'frete', 'Valor mínimo para frete grátis'),
('frete_fixo', '15.90', 'moeda', 'frete', 'Valor do frete fixo'),
('mercadopago_access_token', '', 'texto', 'pagamento', 'Access Token do MercadoPago'),
('mercadopago_public_key', '', 'texto', 'pagamento', 'Public Key do MercadoPago'),
('stripe_secret_key', '', 'texto', 'pagamento', 'Secret Key do Stripe'),
('stripe_publishable_key', '', 'texto', 'pagamento', 'Publishable Key do Stripe'),
('stripe_webhook_secret', '', 'texto', 'pagamento', 'Webhook Secret do Stripe'),
('smtp_host', 'smtp.gmail.com', 'texto', 'email', 'Host SMTP'),
('smtp_porta', '587', 'numero', 'email', 'Porta SMTP'),
('smtp_criptografia', 'tls', 'texto', 'email', 'Criptografia SMTP'),
('smtp_usuario', '', 'email', 'email', 'Usuário SMTP'),
('smtp_senha', '', 'texto', 'email', 'Senha SMTP'),
('smtp_de_nome', 'RATAPLAM', 'texto', 'email', 'Nome do remetente'),
('smtp_de_email', 'contato@rataplam.com.br', 'email', 'email', 'E-mail do remetente');

-- ============================================
-- DADOS INICIAIS - BANNERS
-- ============================================

INSERT INTO banners (titulo, subtitulo, imagem, link, ordem) VALUES
('Roupas Infantis RATAPLAM', 'Qualidade e conforto para o seu pequeno', '/images/banners/banner1.jpg', '/loja', 1),
('Nova Coleção', 'Confira as novidades da temporada', '/images/banners/banner2.jpg', '/loja?novo=1', 2),
('Frete Grátis', 'Acima de R$ 199,90', '/images/banners/banner3.jpg', '/loja', 3);
