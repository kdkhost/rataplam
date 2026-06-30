-- ============================================
-- RATAPLAM - Schema SQLite
-- Loja de Roupas Infantis
-- ============================================

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============================================
-- TABELAS DE USUARIOS E AUTENTICACAO
-- ============================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    data_nascimento TEXT,
    sexo TEXT DEFAULT 'O' CHECK (sexo IN ('M', 'F', 'O')),
    foto_perfil TEXT,
    role TEXT DEFAULT 'cliente' CHECK (role IN ('admin', 'vendedor', 'cliente')),
    ativo INTEGER DEFAULT 1,
    email_verificado INTEGER DEFAULT 0,
    token_verificacao TEXT,
    token_reset_senha TEXT,
    ultimo_login TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- ============================================
-- TABELAS DE TOKENS (SESSAO)
-- ============================================

CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expira_em TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_usuario ON tokens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tokens_expira ON tokens(expira_em);

-- ============================================
-- TABELAS DE ENDERECOS
-- ============================================

CREATE TABLE IF NOT EXISTS enderecos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome_destinatario TEXT NOT NULL,
    cpf_destinatario TEXT,
    cep TEXT NOT NULL,
    logradouro TEXT NOT NULL,
    numero TEXT NOT NULL,
    complemento TEXT,
    bairro TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    telefone_destinatario TEXT,
    principal INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_enderecos_usuario ON enderecos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_cep ON enderecos(cep);

-- ============================================
-- TABELAS DE CATEGORIAS
-- ============================================

CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descricao TEXT,
    imagem TEXT,
    categoria_pai_id INTEGER,
    ordem INTEGER DEFAULT 0,
    ativa INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categorias_slug ON categorias(slug);
CREATE INDEX IF NOT EXISTS idx_categorias_ativa ON categorias(ativa);

-- ============================================
-- TABELAS DE FAIXAS ETARIAS
-- ============================================

CREATE TABLE IF NOT EXISTS faixas_etarias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    idade_min INTEGER NOT NULL,
    idade_max INTEGER NOT NULL,
    imagem TEXT,
    ordem INTEGER DEFAULT 0,
    ativa INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_faixas_slug ON faixas_etarias(slug);

-- ============================================
-- TABELAS DE PRODUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    descricao TEXT,
    descricao_curta TEXT,
    preco REAL NOT NULL,
    preco_promocional REAL,
    custo REAL DEFAULT 0,
    sku TEXT UNIQUE,
    barras TEXT,
    estoque INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 5,
    peso_gramas INTEGER,
    altura_cm REAL,
    largura_cm REAL,
    profundidade_cm REAL,
    categoria_id INTEGER,
    faixa_etaria_id INTEGER,
    genero TEXT DEFAULT 'U' CHECK (genero IN ('M', 'F', 'U')),
    destaque INTEGER DEFAULT 0,
    novo INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    visualizacoes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
    FOREIGN KEY (faixa_etaria_id) REFERENCES faixas_etarias(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_produtos_slug ON produtos(slug);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_faixa ON produtos(faixa_etaria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_preco ON produtos(preco);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON produtos(destaque);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);

-- ============================================
-- TABELAS DE IMAGENS DOS PRODUTOS
-- ============================================

CREATE TABLE IF NOT EXISTS produtos_imagens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt TEXT,
    principal INTEGER DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_imagens_produto ON produtos_imagens(produto_id);

-- ============================================
-- TABELAS DE VARIACOES (TAMANHO/COR)
-- ============================================

CREATE TABLE IF NOT EXISTS variacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    sku TEXT UNIQUE,
    preco_adicional REAL DEFAULT 0,
    estoque INTEGER DEFAULT 0,
    cor TEXT,
    cor_hex TEXT,
    tamanho TEXT,
    ativa INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_variacoes_produto ON variacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_variacoes_tamanho ON variacoes(tamanho);
CREATE INDEX IF NOT EXISTS idx_variacoes_cor ON variacoes(cor);

-- ============================================
-- TABELAS DE AVALIACOES
-- ============================================

CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    titulo TEXT,
    comentario TEXT,
    aprovada INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_produto ON avaliacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);

-- ============================================
-- TABELAS DE CUPONS DE DESCONTO
-- ============================================

CREATE TABLE IF NOT EXISTS cupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT,
    tipo TEXT DEFAULT 'percentual' CHECK (tipo IN ('percentual', 'fixo')),
    valor REAL NOT NULL,
    valor_minimo REAL DEFAULT 0,
    limite_uso INTEGER,
    usos_realizados INTEGER DEFAULT 0,
    data_inicio TEXT,
    data_fim TEXT,
    ativo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_cupons_codigo ON cupons(codigo);
CREATE INDEX IF NOT EXISTS idx_cupons_ativo ON cupons(ativo);

-- ============================================
-- TABELAS DE PEDIDOS
-- ============================================

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_pedido TEXT NOT NULL UNIQUE,
    usuario_id INTEGER,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado', 'reembolsado')),
    subtotal REAL NOT NULL,
    desconto REAL DEFAULT 0,
    frete REAL DEFAULT 0,
    total REAL NOT NULL,
    cupom_id INTEGER,
    cupom_codigo TEXT,
    nome_comprador TEXT,
    email_comprador TEXT,
    cpf_comprador TEXT,
    telefone_comprador TEXT,
    cep_cobranca TEXT,
    logradouro_cobranca TEXT,
    numero_cobranca TEXT,
    complemento_cobranca TEXT,
    bairro_cobranca TEXT,
    cidade_cobranca TEXT,
    estado_cobranca TEXT,
    cep_entrega TEXT,
    logradouro_entrega TEXT,
    numero_entrega TEXT,
    complemento_entrega TEXT,
    bairro_entrega TEXT,
    cidade_entrega TEXT,
    estado_entrega TEXT,
    metodo_pagamento TEXT,
    transaction_id TEXT,
    payment_id TEXT,
    status_pagamento TEXT,
    transportadora TEXT,
    codigo_rastreio TEXT,
    prazo_entrega_dias INTEGER,
    observacoes TEXT,
    data_pagamento TEXT,
    data_envio TEXT,
    data_entrega TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos(created_at);

-- ============================================
-- TABELAS DE ITENS DO PEDIDO
-- ============================================

CREATE TABLE IF NOT EXISTS pedido_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    variacao_id INTEGER,
    nome_produto TEXT NOT NULL,
    sku TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario REAL NOT NULL,
    preco_total REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_variacao ON pedido_itens(variacao_id);

-- ============================================
-- TABELAS DE PAGAMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    gateway TEXT NOT NULL,
    payment_id TEXT NOT NULL,
    external_reference TEXT,
    status TEXT NOT NULL,
    status_detail TEXT,
    tipo_pagamento TEXT,
    valor REAL NOT NULL,
    moeda TEXT DEFAULT 'BRL',
    description TEXT,
    payer_email TEXT,
    payer_nome TEXT,
    card_last_four TEXT,
    card_brand TEXT,
    installments INTEGER DEFAULT 1,
    webhook_received_at TEXT,
    webhook_payload TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido ON pagamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_payment ON pagamentos(payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- ============================================
-- TABELAS DE WEBHOOKS (LOG)
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gateway TEXT NOT NULL,
    event_type TEXT,
    payload TEXT,
    processado INTEGER DEFAULT 0,
    erro TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_gateway ON webhook_logs(gateway);
CREATE INDEX IF NOT EXISTS idx_webhook_processado ON webhook_logs(processado);

-- ============================================
-- TABELAS DO CARRINHO DE COMPRAS
-- ============================================

CREATE TABLE IF NOT EXISTS carrinho (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    usuario_id INTEGER,
    produto_id INTEGER NOT NULL,
    variacao_id INTEGER,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE(session_id, produto_id, variacao_id)
);

CREATE INDEX IF NOT EXISTS idx_carrinho_session ON carrinho(session_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho(usuario_id);

-- ============================================
-- TABELAS DE LISTA DE DESEJOS
-- ============================================

CREATE TABLE IF NOT EXISTS lista_desejos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, produto_id)
);

-- ============================================
-- TABELAS DE CONFIGURACOES DO SISTEMA
-- ============================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chave TEXT NOT NULL UNIQUE,
    valor TEXT,
    tipo TEXT DEFAULT 'texto',
    grupo TEXT,
    descricao TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_config_chave ON configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_config_grupo ON configuracoes(grupo);

-- ============================================
-- TABELAS DE LOG DE EMAILS
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destinatario TEXT NOT NULL,
    assunto TEXT NOT NULL,
    template TEXT,
    dados TEXT,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
    erro TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_email_dest ON email_logs(destinatario);
CREATE INDEX IF NOT EXISTS idx_email_status ON email_logs(status);

-- ============================================
-- TABELAS DE SMTP CONFIGURACAO
-- ============================================

CREATE TABLE IF NOT EXISTS smtp_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL DEFAULT 'Principal',
    host TEXT NOT NULL,
    porta INTEGER NOT NULL DEFAULT 587,
    criptografia TEXT DEFAULT 'tls' CHECK (criptografia IN ('tls', 'ssl', 'none')),
    usuario TEXT NOT NULL,
    senha TEXT NOT NULL,
    de_nome TEXT NOT NULL,
    de_email TEXT NOT NULL,
    reply_to TEXT,
    ativo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABELAS DE PROVADOR VIRTUAL
-- ============================================

CREATE TABLE IF NOT EXISTS provador_virtual (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    session_id TEXT,
    foto_crianca TEXT NOT NULL,
    produto_id INTEGER NOT NULL,
    resultado_url TEXT,
    status TEXT DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_provador_usuario ON provador_virtual(usuario_id);
CREATE INDEX IF NOT EXISTS idx_provador_session ON provador_virtual(session_id);

-- ============================================
-- TABELAS DE BANNERS/SLIDERS
-- ============================================

CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    subtitulo TEXT,
    imagem TEXT NOT NULL,
    link TEXT,
    ordem INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_banners_ativo ON banners(ativo);

-- ============================================
-- TABELA DE SEO CONFIG
-- ============================================

CREATE TABLE IF NOT EXISTS seo_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pagina TEXT NOT NULL UNIQUE,
    titulo TEXT,
    descricao TEXT,
    keywords TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    canonical_url TEXT,
    robots TEXT DEFAULT 'index, follow',
    schema_json TEXT,
    score_seo INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ============================================
-- TABELA DE BLOG
-- ============================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    resumo TEXT,
    conteudo TEXT,
    imagem TEXT,
    categoria TEXT,
    tags TEXT,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
    visualizacoes INTEGER DEFAULT 0,
    autor TEXT DEFAULT 'RATAPLAM',
    publicado_em TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

-- ============================================
-- TABELA DE VISITAS
-- ============================================

CREATE TABLE IF NOT EXISTS visitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    ip TEXT,
    user_agent TEXT,
    url TEXT,
    pagina TEXT,
    referrer TEXT,
    dispositivo TEXT,
    navegador TEXT,
    sistema_operacional TEXT,
    idioma TEXT,
    duracao_segundos INTEGER DEFAULT 0,
    scroll_percent INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_visitas_session ON visitas(session_id);
CREATE INDEX IF NOT EXISTS idx_visitas_created ON visitas(created_at);

CREATE TABLE IF NOT EXISTS visitas_diarias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    total_visitas INTEGER DEFAULT 0,
    visitas_unicas INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    desktop INTEGER DEFAULT 0,
    mobile INTEGER DEFAULT 0,
    tablet INTEGER DEFAULT 0,
    UNIQUE(data)
);

CREATE TABLE IF NOT EXISTS paginas_mais_visitadas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    pagina TEXT NOT NULL,
    visualizacoes INTEGER DEFAULT 0,
    visitantes_unicos INTEGER DEFAULT 0,
    UNIQUE(data, pagina)
);

-- ============================================
-- TABELAS DE CRON
-- ============================================

CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    expressao_cron TEXT NOT NULL,
    ultimo_execucao TEXT,
    proxima_execucao TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'erro')),
    ativo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS cron_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    inicio TEXT,
    fim TEXT,
    status TEXT,
    mensagem TEXT,
    dados_execucao TEXT,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (job_id) REFERENCES cron_jobs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job ON cron_logs(job_id);

-- ============================================
-- TABELA DE RELATORIOS CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS relatorios_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    data TEXT NOT NULL,
    dados TEXT,
    criado_em TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(tipo, data)
);
