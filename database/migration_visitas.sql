-- ============================================
-- TABELA DE VISITAS E MÉTRICAS
-- ============================================

CREATE TABLE IF NOT EXISTS visitas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    usuario_id INT,
    ip VARCHAR(45),
    user_agent TEXT,
    url VARCHAR(500) NOT NULL,
    pagina VARCHAR(255),
    referrer VARCHAR(500),
    dispositivo ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
    navegador VARCHAR(100),
    sistema_operacional VARCHAR(100),
    pais VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    idioma VARCHAR(10),
    duracao_segundos INT DEFAULT 0,
    scroll_percent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_url (url(191)),
    INDEX idx_created (created_at),
    INDEX idx_dispositivo (dispositivo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS visitas_diarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    total_visitas BIGINT DEFAULT 0,
    visitas_unicas BIGINT DEFAULT 0,
    page_views BIGINT DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    duracao_media_segundos INT DEFAULT 0,
    desktop BIGINT DEFAULT 0,
    mobile BIGINT DEFAULT 0,
    tablet BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_data (data)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paginas_mais_visitadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    pagina VARCHAR(255) NOT NULL,
    visualizacoes INT DEFAULT 0,
    visitantes_unicos INT DEFAULT 0,
    tempo_medio_segundos INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_pagina_data (data, pagina),
    INDEX idx_data (data),
    INDEX idx_visualizacoes (visualizacoes)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seo_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pagina VARCHAR(255) NOT NULL UNIQUE,
    titulo VARCHAR(70),
    descricao VARCHAR(160),
    keywords TEXT,
    og_titulo VARCHAR(70),
    og_descricao VARCHAR(200),
    og_imagem VARCHAR(500),
    og_tipo VARCHAR(50) DEFAULT 'website',
    twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
    twitter_titulo VARCHAR(70),
    twitter_descricao VARCHAR(200),
    twitter_imagem VARCHAR(500),
    canonical_url VARCHAR(500),
    robots VARCHAR(50) DEFAULT 'index, follow',
    schema_json TEXT,
    score_seo INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pagina (pagina)
) ENGINE=InnoDB;
