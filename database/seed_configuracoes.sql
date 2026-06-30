-- ============================================
-- RATAPLAM - Dados reais de contato e configuracoes
-- ============================================

SET NAMES utf8mb4;
USE rataplam;

INSERT IGNORE INTO configuracoes (chave, valor, descricao) VALUES
-- Contato real do site antigo
('nome_loja', 'RATAPLAM', 'Nome da loja'),
('email_contato', 'rataplam.contato@gmail.com', 'E-mail de contato'),
('telefone_contato', '(21) 99691-3143', 'Telefone de contato'),
('instagram', '@rataplam.loja', 'Instagram da loja'),
('cnpj', '33.149.055/0001-17', 'CNPJ da empresa'),
('razao_social', 'Nice armarinho Ltda', 'Razao social'),
('endereco_loja', 'Travessa Roma 14, Rocinha - Rio de Janeiro / RJ', 'Endereco da loja'),

-- Frete
('frete_gratis_valor', '199.90', 'Valor minimo para frete gratis'),
('frete_fixo', '15.90', 'Valor do frete fixo'),

-- Popup e promocoes
('popup_promocao_ativo', '0', 'Popup de promocao ativo (1=sim, 0=nao)'),
('popup_promocao_titulo', 'Oferta Especial', 'Titulo do popup de promocao'),
('popup_promocao_descricao', 'Ate 30% de desconto em produtos selecionados!', 'Descricao do popup'),
('popup_promocao_desconto', '30', 'Percentual de desconto'),
('popup_promocao_data_fim', '', 'Data fim da promocao (YYYY-MM-DD HH:MM:SS)'),

-- Black Friday
('black_friday_ativo', '0', 'Black Friday ativo (1=sim, 0=nao)'),
('black_friday_desconto', '40', 'Percentual de desconto Black Friday'),

-- Pagamento
('gateway_padrao', 'mercadopago', 'Gateway de pagamento padrao'),
('mercadopago_public_key', '', 'Chave publica MercadoPago'),
('mercadopago_access_token', '', 'Access token MercadoPago'),
('stripe_public_key', '', 'Chave publica Stripe'),
('stripe_secret_key', '', 'Chave secreta Stripe'),

-- SMTP
('smtp_host', 'smtp.gmail.com', 'Host SMTP'),
('smtp_porta', '587', 'Porta SMTP'),
('smtp_usuario', '', 'Usuario SMTP'),
('smtp_senha', '', 'Senha SMTP'),
('smtp_de', 'rataplam.contato@gmail.com', 'E-mail remetente'),

-- SEO
('meta_titulo', 'RATAPLAM - Roupas Infantis | Qualidade e Conforto', 'Titulo padrao SEO'),
('meta_descricao', 'Loja de roupas infantis RATAPLAM. Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos.', 'Descricao padrao SEO'),

-- Visita
('visitas_hoje', '0', 'Contador de visitas hoje'),
('visitas_total', '0', 'Total de visitas'),

-- Cron
('cron_secret_key', 'rataplam_cron_', 'Chave secreta do cron');
