# ============================================
# RATAPLAM - Guia de Deploy
# Compativel com aaPanel, WHM/cPanel, Plesk
# ============================================

## Requisitos

### Servidor
- PHP 7.4 ou superior (8.0+ recomendado)
- MySQL 5.7+ ou MariaDB 10.3+
- Apache com mod_rewrite (ou Nginx)
- Node.js 18+ (para build do frontend)

### Extensoes PHP obrigatorias
- pdo_mysql
- curl
- json
- mbstring
- openssl

---

## Passo 1: Upload dos Arquivos

### Opção A: Via FTP/SFTP
1. Conecte-se ao servidor via FTP (FileZilla, WinSCP, etc)
2. Navegue ate o diretorio publico do site:
   - aaPanel: `/www/wwwroot/seudominio.com.br/`
   - cPanel: `/public_html/`
3. Upload de TODOS os arquivos, exceto:
   - `frontend/node_modules/`
   - `frontend/.next/`
   - `graphify-out/`
   - `.git/`

### Opção B: Via Git
```bash
cd /www/wwwroot/seudominio.com.br/  # aaPanel
# ou
cd /public_html/  # cPanel
git clone https://github.com/SEU_USER/rataplam.git .
```

### Opção C: Via SSH (recomendado)
```bash
cd /www/wwwroot/seudominio.com.br/
git clone https://github.com/SEU_USER/rataplam.git .
```

---

## Passo 2: Estrutura de Diretorios

Apos o upload, a estrutura deve ser:

```
seudominio.com.br/
├── api/                    # Backend PHP (acessivel via /api/)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── templates/
│   ├── public/
│   │   └── uploads/
│   │       └── produtos/   # Imagens dos produtos
│   ├── .htaccess
│   ├── index.php           # Entry point
│   └── composer.json
├── frontend/               # Frontend Next.js
│   ├── src/
│   ├── public/
│   ├── next.config.ts
│   └── package.json
├── database/
│   ├── schema.sql          # Estrutura do banco
│   ├── migration_visitas.sql
│   └── migration_cron.sql
└── .htaccess               # Redirect para frontend
```

---

## Passo 3: Banco de Dados

### Via aaPanel
1. Acesse o Painel aaPanel > MySQL
2. Crie um novo banco de dados: `rataplam`
3. Crie um usuario para o banco
4. Importe os SQLs na ordem:
   - `database/schema.sql`
   - `database/migration_visitas.sql`
   - `database/migration_cron.sql`

### Via phpMyAdmin (cPanel)
1. Acesse phpMyAdmin
2. Crie o banco `rataplam`
3. Importe os SQLs na ordem:
   - `database/schema.sql`
   - `database/migration_visitas.sql`
   - `database/migration_cron.sql`

### Via SSH
```bash
mysql -u root -p rataplam < database/schema.sql
mysql -u root -p rataplam < database/migration_visitas.sql
mysql -u root -p rataplam < database/migration_cron.sql
```

---

## Passo 4: Configuracao do Backend PHP

### Criar arquivo .env
```bash
cd api/
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do banco:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rataplam
DB_USER=usuario_do_banco
DB_SECRET=senha_do_banco
FRONTEND_URL=https://seudominio.com.br
```

### Configurar permissoes
```bash
chmod -R 755 api/
chmod -R 777 api/public/uploads/
chmod 644 api/.htaccess
```

### Instalar dependencias PHP (opcional)
```bash
cd api/
composer install --no-dev --optimize-autoloader
```

---

## Passo 5: Configuracao do Frontend

### Build do frontend
```bash
cd frontend/
npm install
npm run build
```

### Opcao A: Servir estaticamente (recomendado para shared hosting)
O build gera arquivos estaticos em `frontend/.next/`.

Configure o Apache/Nginx para servir os arquivos estaticos.

### Opcao B: Servir via Node.js (VPS dedicado)
```bash
cd frontend/
npm start
```

### Configuracao Nginx (caso necessario)
```nginx
server {
    listen 80;
    server_name seudominio.com.br;
    root /www/wwwroot/seudominio.com.br/frontend/.next;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Passo 6: Configuracao do Apache

### aaPanel
1. Acesse o Painel > Sites > Configuracoes
2. Configure o diretorio raiz para o projeto
3. Ative mod_rewrite

### cPanel
1. Acesse MultiPHP Manager ou .htaccess
2. Configure a versao PHP (7.4+)
3. Adicione regras de reescrita se necessario

### Arquivo .htaccess raiz
```apache
RewriteEngine On

# Redirecionar /api/* para o backend PHP
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api/$1 [L]

# Redirecionar todo o resto para o frontend
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ frontend/.next/$1 [L]
```

---

## Passo 7: Configuracao de Cron Jobs

### Via cPanel
1. Acesse Cron Jobs
2. Adicione o cron job:
```
*/5 * * * * curl -s -H "Authorization: Bearer SUA_CHAVE_SECRETA" https://seudominio.com.br/api/cron/executar
```

### Via aaPanel
1. Acesse o Painel > Task Scheduling
2. Adicione:
```
*/5 * * * * curl -s -H "Authorization: Bearer SUA_CHAVE_SECRETA" https://seudominio.com.br/api/cron/executar
```

### Chave secreta
A chave esta no arquivo `api/.env`:
```
CRON_SECRET_KEY=sua_chave_aqui
```

---

## Passo 8: Configuracao de Email (SMTP)

Acesse o painel admin > Configuracoes > E-mail/SMTP

Exemplos de configuracao:

### Gmail
- Host: smtp.gmail.com
- Porta: 587
- Criptografia: TLS
- Usuario: seu.email@gmail.com
- Senha: senha_de_app (nao a senha normal)

### SendGrid
- Host: smtp.sendgrid.net
- Porta: 587
- Criptografia: TLS
- Usuario: apikey
- Senha: sua_chave_sendgrid

### Mailgun
- Host: smtp.mailgun.org
- Porta: 587
- Criptografia: TLS
- Usuario: postmaster@seudominio.mailgun.org
- Senha: sua_chave_mailgun

---

## Passo 9: Webhooks de Pagamento

### MercadoPago
1. Acesse MercadoPago > Configuracoes > Webhooks
2. URL: `https://seudominio.com.br/api/webhooks/mercadopago`
3. Eventes: `payment`

### Stripe
1. Acesse Stripe > Dashboard > Webhooks
2. URL: `https://seudominio.com.br/api/webhooks/stripe`
3. Eventes: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Passo 10: SSL/HTTPS

### Via aaPanel
1. Acesse o Painel > SSL
2. Instale certificado Let's Encrypt gratuito

### Via cPanel
1. Acesse SSL/TLS > Let's Encrypt
2. Instale para seu dominio

### Apos instalar SSL
1. Descomente a forca de HTTPS no `.htaccess` da API
2. Atualize a `NEXT_PUBLIC_SITE_URL` no frontend para `https://`

---

## Solucao de Problemas

### Erro 500 no PHP
- Verifique as permissoes dos arquivos (755 para diretorios, 644 para arquivos)
- Verifique as credenciais do banco no `.env`
- Verifique os logs: `api/error_log` ou logs do aaPanel/cPanel

### Frontend nao conecta com a API
- Verifique se `API_URL` esta correto no `frontend/.env.local`
- Verifique se o Apache esta redirecionando `/api/*` corretamente
- Teste diretamente: `curl https://seudominio.com.br/api/produtos`

### Cron jobs nao executam
- Verifique se o curl funciona: `curl -s https://seudominio.com.br/api/cron/status`
- Verifique a chave secreta no header de autorizacao
- Verifique os logs do cron

### Imagens nao carregam
- Verifique as permissoes de `api/public/uploads/produtos/`
- Verifique se o `.htaccess` nao esta bloqueando imagens
- Teste o acesso direto: `https://seudominio.com.br/api/public/uploads/produtos/imagem.jpg`
