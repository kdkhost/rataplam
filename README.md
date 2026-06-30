# RATAPLAM - Loja de Roupas Infantis 🧸

Sistema completo de e-commerce para moda infantil (0-14 anos), desenvolvido com **Next.js 16** (frontend) + **PHP 7.4+** (backend API) + **MariaDB**. Totalmente em português brasileiro, responsivo, acessível e pronto para produção.

---

## ✨ Funcionalidades Principais

### 🛍️ **Loja Virtual**
- **Catálogo completo** com filtros por categoria, faixa etária, gênero, preço
- **Busca em tempo real** com autocomplete
- **Página do produto** com galeria de imagens, variações (tamanho/cor), estoque, avaliações
- **Carrinho persistente** (localStorage + servidor) com cupom de desconto
- **Checkout transparente** em 3 passos (dados → pagamento → confirmação)
- **Rastreamento de pedidos** com código de rastreio Correios

### 👗 **Provador Virtual com IA**
- Upload de foto da criança
- Geração de imagem com roupa via **Replicate API (Flux Kontext Pro)**
- Histórico de provas salvas

### 💳 **Pagamentos**
- **MercadoPago** (PIX, cartão, boleto) + webhook automático
- **Stripe** (cartão internacional) + webhook com verificação HMAC
- Retorno automático para página de confirmação
- E-mails transacionais em cada mudança de status

### 📧 **Sistema de E-mails (14 templates)**
- Boas-vindas, confirmação de pedido, pagamento aprovado
- Pedido em separação, enviado, entregue, cancelado, reembolsado
- Nova senha, contato, lembrete carrinho, avaliação
- Admin: novo pedido, estoque baixo
- **Templates responsivos** com preview em tempo real no admin
- SMTP configurável via painel

### 🎛️ **Painel Administrativo Completo (16 páginas)**
| Página | Funcionalidades |
|--------|----------------|
| Dashboard | KPIs animados, gráfico de visitas, ações rápidas |
| Produtos | CRUD completo, imagens drag-drop, variações, destaque |
| Pedidos | Lista, detalhes, mudança de status, impressão, rastreio |
| Clientes | Lista, edição, histórico, endereços, favoritos |
| Categorias | CRUD com ordenação |
| Cupons | CRUD, validação de datas/limites, % ou fixo |
| Banners | Slider homepage, links, ordenação |
| SEO | Editor por página, score automático, preview social |
| Avaliações | Moderação, aprovação, resposta |
| Logs | Webhooks, e-mails, erros, auditoria |
| Relatórios | Vendas, estoque, financeiro (cache diário) |
| Vendedores | CRUD, comissões |
| Configurações | Loja, frete, pagamento, SMTP, manutenção |
| Cron Jobs | 14 jobs agendados, execução manual, logs |
| Variações | CRUD por produto (tamanho, cor, estoque, preço) |

### 🔧 **Infraestrutura & DevOps**
- **Cron interno** (14 jobs): limpeza tokens, carrinhos abandonados, estatísticas, e-mails, cancelamentos, estoque mínimo, logs, webhooks, relatórios, alertas, lembretes, avaliações
- **Rate limiting** (100 req/min/IP) com exclusão webhooks
- **CSRF protection** (HMAC, 1h expiração, auto-verify)
- **Headers de segurança** (CSP, HSTS, X-Frame-Options, etc.)
- **Compatível aaPanel / WHM / cPanel** (PHP 7.4+, Apache mod_rewrite, composer.json)
- **Deploy em 10 passos** documentado

### 🎨 **Frontend Moderno**
- **Design System** rosa/violeta com gradientes, sombras, animações
- **Componentes reutilizáveis**: Modal, Toast, Tabela, Paginação, Badge, Input, Select, Botão, CampoFormulario
- **Máscaras brasileiras**: CPF, CNPJ, telefone, CEP, moeda, data, hora
- **CEP auto-complete** (ViaCEP + BrasilAPI fallback)
- **Contador de visitas** (4 estilos: hero, card, badge, minimal)
- **KPIs animados** (contagem regressiva)
- **SEO completo**: sitemap.xml, robots.txt, JSON-LD, Open Graph, Twitter Cards
- **Dark/Light mode** com persistência
- **Preloader configurável** via admin (3 tipos: pontos, logo, barra)

### 📱 **Popups Inteligentes**
- **Promocional** com countdown regressivo (configurável no admin)
- **Black Friday** tema escuro/dourado com partículas
- **Exit-intent** (desktop) / 30s (mobile) com cupom "PRIMEIRACOMPRA10"
- **Gerenciador de prioridade** (BF > Promo > Saída)

### 🔔 **Alertas em Tempo Real**
- Notificação flutuante "Alguém comprou X agora!" (ciclo 8s)
- Busca automática a cada 30s
- Dados anonimizados (produto, imagem, tempo)

### 📄 **Páginas Institucionais**
- Sobre, Contato (form + info cards), FAQ (accordion), Política de Troca, Termos, Privacidade
- Blog com lista + posts individuais
- Rastreamento de pedido público

### 🛠 **Páginas de Sistema**
- **404 personalizada** com ilustração animada
- **500/Error boundary** com retry
- **Manutenção** totalmente configurável (título, mensagem, countdown, imagem, newsletter)

---

## 🚀 Deploy Rápido

### Pré-requisitos
- PHP 7.4+ com extensões: pdo_mysql, mbstring, json, curl, openssl, gd
- MariaDB 10.3+
- Apache com mod_rewrite
- Composer

### 1. Banco de Dados
```sql
-- Execute em ordem:
SOURCE database/schema.sql;
SOURCE database/migration_visitas.sql;
SOURCE database/migration_cron.sql;
SOURCE database/seed_produtos.sql;
SOURCE database/seed_configuracoes.sql;
```

### 2. Backend (API)
```bash
cd api
cp .env.example .env.example .env
# Edite .env com credenciais do banco, chaves API, SMTP
composer install --no-dev --optimize-autoloader
# Aponte DocumentRoot para api/public/
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL
npm ci
npm run build
# Aponte para frontend/.next/standalone ou use servidor Node
```

### 4. Configurar aaPanel/cPanel
- Criar site → apontar para `frontend/` (Node) ou `api/public/` (PHP)
- SSL Let's Encrypt
- Configurar variáveis de ambiente no painel
- Cron do sistema apontar para `GET /api/cron/executar?key=SUA_CHAVE` a cada minuto

> Ver **DEPLOY.md** para guia completo com 10 passos detalhados.

---

## 📁 Estrutura do Projeto

```
RATAPLAM/
├── api/                          # Backend PHP
│   ├── config/                   # Database, Config
│   ├── controllers/              # 15 Controllers (Auth, Produto, Pedido, Admin, etc.)
│   ├── middleware/               # Auth, RateLimit, CSRF
│   ├── services/                 # Email, Payment, CEP, VirtualFitting, SEO
│   ├── templates/email/          # 14 templates HTML
│   ├── public/                   # Entry point + uploads
│   ├── composer.json
│   └── .htaccess
├── frontend/                     # Next.js 16 (App Router)
│   ├── src/
│   │   ├── app/                  # 97 rotas (páginas + API proxies)
│   │   │   ├── admin/            # 16 páginas admin
│   │   │   ├── auth/             # Login, cadastro, senha
│   │   │   ├── conta/            # Perfil, pedidos, endereços
│   │   │   ├── api/              # Proxies para PHP backend
│   │   │   └── ...               # Loja, checkout, blog, etc.
│   │   ├── components/
│   │   │   ├── layout/           # Header, Footer
│   │   │   ├── produto/          # ProdutoCard, BotaoFavorito, Avaliacoes
│   │   │   ├── ui/               # Design system (Modal, Toast, Tabela, etc.)
│   │   │   ├── carousel/         # Carousel, BannerSlider
│   │   │   ├── theme/            # ThemeProvider, ThemeToggle
│   │   │   ├── preloader/        # Preloader
│   │   │   ├── alertas/          # CompraAlert
│   │   │   └── popup/            # PopupPromocao, PopupBlackFriday, PopupSaida
│   │   ├── lib/                  # api, auth, carrinho, masks, useCep
│   │   └── providers.tsx         # Providers wrapper
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── database/
│   ├── schema.sql                # Schema completo (22 tabelas)
│   ├── migration_visitas.sql     # Analytics/SEO
│   ├── migration_cron.sql        # Cron jobs + logs
│   ├── seed_produtos.sql         # 33 produtos reais + categorias/faixas
│   └── seed_configuracoes.sql    # Contato real, SMTP, frete, popups
├── DEPLOY.md                     # Guia deploy aaPanel/cPanel
├── .htaccess                     # Roteamento raiz
└── README.md                     # Este arquivo
```

---

## ⚙️ Configurações Principais (.env)

### Backend (`api/.env`)
```env
# Banco
DB_HOST=localhost
DB_NAME=rataplam
DB_USER=rataplam_user
DB_PASS=sua_senha_forte

# API
API_BASE_URL=https://seudominio.com.br/api
CRON_SECRET_KEY=chave_secreta_muito_longa_aqui

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx
MERCADOPAGO_WEBHOOK_SECRET=xxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxx
STRIPE_PUBLIC_KEY=pk_live_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_FROM=rataplam.contato@gmail.com

# Replicate (Provador Virtual)
REPLICATE_API_TOKEN=r8_xxxx
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://seudominio.com.br/api
```

---

## 🔐 Segurança Implementada

| Camada | Proteção |
|--------|----------|
| **Autenticação** | Token JWT (Bearer) + refresh, expiração, limpeza sessões antigas (máx 5) |
| **Autorização** | Roles: admin, vendedor, cliente. Middleware em todas rotas admin |
| **CSRF** | HMAC-SHA256, token por sessão, expiração 1h, auto-verify POST/PUT/DELETE |
| **Rate Limit** | 100 req/min/IP (arquivo), exclusão webhooks/visitas |
| **Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| **SQL Injection** | Prepared statements (PDO) em 100% das queries |
| **XSS** | Sanitização saída, `dangerouslySetInnerHTML` apenas onde necessário (blog) |
| **Upload** | Validação MIME + extensão, pasta com `.htaccess` bloqueando execução |
| **Pagamentos** | Preços vindos do BD (nunca do cliente), transação atômica, verificação HMAC Stripe |

---

## 📊 Performance & SEO

- **Build Next.js**: 97 rotas, 0 erros TypeScript, ~7s compile
- **Imagens**: `next/image` com lazy loading, WebP/AVIF, domínios permitidos
- **CSS**: Tailwind JIT, purge automático, animações GPU-accelerated
- **Fontes**: Geist (variable) auto-hosted
- **SEO Score**: Título (30-60), Descrição (120-160), OG Image, Keywords, Canonical, JSON-LD
- **Sitemap/Robots**: Gerados dinamicamente com produtos/categorias reais

---

## 🧪 Testes & Qualidade

```bash
# Frontend
cd frontend
npm run lint        # ESLint
npm run typecheck   # TypeScript strict
npm run build       # Build produção

# Backend
cd api
php -l public/index.php        # Syntax check
composer validate --strict     # Composer
```

---

## 📝 Scripts Úteis

```bash
# Raiz
npm run dev          # Frontend (porta 3000)
npm run api:dev      # PHP built-in server (porta 8080)
npm run build        # Build frontend
npm run start        # Produção frontend

# Banco
mysql -u root -p rataplam < database/schema.sql
mysql -u root -p rataplam < database/seed_produtos.sql
```

---

## 🎯 Roadmap / Próximos Passos

- [ ] PWA (Service Worker, manifest, offline)
- [ ] Web Push Notifications (VAPID)
- [ ] Multi-idioma (EN/ES)
- [ ] Marketplace (vendedores múltiplos)
- [ ] App mobile (React Native / Capacitor)
- [ ] Integração ERP (Tiny, Bling)
- [ ] IA: recomendação personalizada, busca semântica

---

## 📄 Licença

Projeto proprietário - RATAPLAM® - Todos os direitos reservados.
CNPJ: 33.149.055/0001-17 | Nice armarinho Ltda

---

## 🤝 Contato & Suporte

- **E-mail**: rataplam.contato@gmail.com
- **WhatsApp**: (21) 99691-3143
- **Instagram**: @rataplam.loja
- **Endereço**: Travessa Roma 14, Rocinha - Rio de Janeiro / RJ

---

> **Desenvolvido com ❤️ para vestir crianças com qualidade, conforto e estilo.**
> *Roupas que contam histórias — do 0 aos 14 anos.*