-- ============================================
-- RATAPLAM - Tabela de Cron Jobs
-- ============================================

CREATE TABLE IF NOT EXISTS cron_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    expressao_cron VARCHAR(50) NOT NULL,
    ultimo_execucao DATETIME,
    proxima_execucao DATETIME,
    status ENUM('pendente', 'executando', 'concluido', 'erro') DEFAULT 'pendente',
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo),
    INDEX idx_proxima (proxima_execucao)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cron_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME,
    status ENUM('sucesso', 'erro') NOT NULL,
    mensagem TEXT,
    dados_execucao JSON,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES cron_jobs(id) ON DELETE CASCADE,
    INDEX idx_job (job_id),
    INDEX idx_criado (criado_em)
) ENGINE=InnoDB;

-- ============================================
-- JOBS PADRAO
-- ============================================

INSERT INTO cron_jobs (nome, descricao, expressao_cron, proxima_execucao, ativo) VALUES
('limpar_tokens_expirados', 'Remove tokens de sessao expirados', '0 */6 * * *', NULL, 1),
('limpar_carrinho_abandonado', 'Remove itens do carrinho ha mais de 7 dias', '0 3 * * *', NULL, 1),
('gerar_estatisticas_diarias', 'Gera snapshot diario de estatisticas', '5 0 * * *', NULL, 1),
('enviar_emails_pendentes', 'Tenta reenviar emails que falharam', '*/30 * * * *', NULL, 1),
('cancelar_pedidos_pendentes', 'Cancela pedidos pendentes apos 24h', '0 1 * * *', NULL, 1),
('atualizar_estoque_minimo', 'Alerta quando estoque esta abaixo do minimo', '0 8 * * *', NULL, 1),
('backup_banco_dados', 'Gera backup diario do banco de dados', '0 2 * * *', NULL, 1),
('limpar_logs_antigos', 'Remove logs com mais de 90 dias', '0 4 1 * *', NULL, 1),
('calcular_frete_gratis', 'Recalcula quem ganhou frete gratis', '0 */2 * * *', NULL, 1),
('sincronizar_webhooks', 'Processa webhooks pendentes de pagamento', '*/5 * * * *', NULL, 1);
