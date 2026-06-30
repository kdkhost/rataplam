# Changelog - RATAPLAM

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2026-06-29 - "Grande Atualização: Sistema Completo"

### 🎉 Adicionado - Sistema Frontend Completo

#### **Páginas Institucionais Profissionais**
- **Política de Privacidade** - 8 seções completas (LGPD), cards de contato (e-mail, telefone, Instagram), design com gradientes rose/violet
- **Termos de Uso** - 10 cláusulas jurídicas, contact cards, layout responsivo
- **Política de Trocas** - 7 seções (prazo 30 dias, condições, reembolso por forma de pagamento, frete, defeitos, itens não trocáveis), CTA para suporte
- **Sobre** - História, valores (0-14 anos, Qualidade, Frete Grátis), cards informativos, CTAs
- **Perguntas Frequentes** - 8 FAQs em accordion animado, CTA para contato
- **Contato** - Formulário validado + 3 cards de contato (e-mail, WhatsApp, horário), toast de sucesso/erro
- **Rastrear Pedido** - Busca por número, timeline visual 6 etapas, rastreio Correios, endereço, itens
- **Blog** - Lista com skeleton loading, cards com imagem/categoria/data, posts individuais
- **Provador Virtual** - IA (Replicate/Flux), upload foto, preview, histórico

#### **Sistema de Temas & UX**
- **Dark/Light Mode** - `ThemeProvider` com localStorage, detecção sistema, transição suave 300ms
- **ThemeToggle** - Botão animado (sol/lua) com rotação, no Header
- **Preloader Configurável** - 3 tipos (pontos, logo, barra), cor/tipo/texto via admin, fade-out 1.5s
- **Scrollbar Personalizada** - Estilo rosa/violet global em `globals.css`

#### **Carrossel & Sliders Avançados**
- **Carousel** - Touch/swipe, auto-play, setas, dots, responsivo (1/2/3 itens), snap scroll, hover pause
- **BannerSlider** - Ken Burns effect (zoom 12s), overlay gradiente, texto posicionável (esq/centro/dir), CTA link, keyboard nav, dots/setas

#### **Popups Inteligentes (3 tipos)**
- **PopupPromocao** - Countdown regressivo (dias/horas/min/segs), dismiss 24h (localStorage), imagem/desconto/texto via admin
- **PopupBlackFriday** - Tema escuro/dourado, partículas flutuantes animadas, dismiss 24h, ativação via admin
- **PopupSaida** - Exit-intent (mouseleave topo) desktop, 30s mobile, cupom "PRIMEIRACOMPRA10", copy-to-clipboard, sessionStorage
- **PopupManager** - Orquestrador com prioridade: Black Friday > Promo > Saída, um por vez

#### **Alertas Tempo Real**
- **CompraAlert** - "Alguém comprou X agora!" flutuante (bottom-left), ciclo 8s, busca a cada 30s, dados anonimizados, sessionStorage dismiss

#### **Páginas de Sistema**
- **404** - Ilustração animada 😺, botões Início/Loja, links rápidos
- **500/Error Boundary** - 😿, botão "Tentar Novamente" (reset), link Início
- **Manutenção** - Totalmente configurável via admin: título, mensagem, countdown (data fim), imagem, newsletter signup, contatos, Instagram

#### **Checkout com Correios**
- Busca CEP → `POST /api/frete/calcular` → opções PAC/SEDEX com preço/prazo
- Seleção visual (radio cards), fallback config admin, envio `frete_servico` + `frete_valor` no pedido
- Sidebar confirmação com serviço + prazo

---

### 🛠 Adicionado - Backend PHP (API)

#### **FreteController + CorreiosService**
- `calcular()` - CEP origem/destino, peso/dimensões calculados do carrinho, retorna PAC/SEDEX
- `rastrear(codigo)` - Proxy Correios (proxyapp + SRO fallback), SSL, cache
- `listarOpcoes()` - Serviços disponíveis
- Rotas: `POST /api/frete/calcular`, `GET /api/frete/rastrear/{codigo}`, `GET /api/frete/opcoes`

#### **MensagemController (Suporte)**
- `criar()` - Público (nome, e-mail, assunto, mensagem)
- `listar()` - Admin (filtros status)
- `responder(id)` - Admin resposta + e-mail
- `marcarLida(id)` - Admin
- Tabela `mensagens` no schema

#### **VisitaController - Novo Método**
- `comprasRecentes()` - Últimos 5 pedidos pagos/entregues (produto, imagem, tempo relativo), cache 60s

#### **CronController - Correção Crítica**
- Renomeado `executarJob(int)` → `executarJobPorId(int)` para evitar fatal error (duas assinaturas)
- 14 jobs funcionais

#### **Index.php - Rotas Corrigidas**
- `GET /api/auth/me` + `PUT /api/auth/me` separados (antes GET capturava PUT)
- SEO routes: `GET/POST /api/seo/config`, `GET /api/seo/pages`, `POST /api/seo/score`, `POST /api/seo/preview`
- Cron: `POST /api/cron/{id}/executar` → `executarJobPorId`
- Novas: `POST /api/mensagens`, `GET /api/mensagens`, `POST /api/mensagens/{id}/responder`, `PUT /api/mensagens/{id}/lida`
- Nova: `GET /api/visitas/compras-recentes`

#### **PedidoController - E-mails**
- `atualizar()` envia `$url` + `$link` para templates (pagamento_aprovado, pedido_enviado, pedido_entregue)
- Templates usam botão "Acompanhar/Rastrear/Avaliar" funcional

#### **VirtualFittingService**
- Query corrigida: `imagem_url` → `url` (coluna real em `produtos_imagens`)

#### **Email Templates - Correções**
- `nova-senha.php` - Botão "Redefinir Senha" com `$link` (era `$nova_senha` N/A)
- Variáveis `$url`/`$link` injetadas nos status-change emails

---

### 🗄 Adicionado - Banco de Dados

#### **Schema (schema.sql)**
- 22 tabelas: usuarios, tokens, enderecos, categorias, faixas_etarias, produtos, produtos_imagens, variacoes, avaliacoes, cupons, pedidos, pedido_itens, pagamentos, webhook_logs, carrinho, lista_desejos, configuracoes, email_logs, smtp_config, provador_virtual, banners, relatorios_cache
- **Índices/Constraints novos**: `UNIQUE(usuario_id, produto_id)` em avaliacoes, `UNIQUE(session_id, produto_id, variacao_id)` em carrinho, `INDEX(variacao_id)` em pedido_itens

#### **Migrations**
- `migration_visitas.sql` - visitas, visitas_detalhes, paginas, eventos, sessões, contadores, kpis
- `migration_cron.sql` - cron_jobs, cron_logs + 14 jobs padrão ativos

#### **Seeds**
- `seed_produtos.sql` - 33 produtos reais (8 macacões, 8 bermudas, 8 blusas, 3 biquínis, 3 calças, 3 acessórios), preços/imagens Wix originais, 6 categorias, 4 faixas etárias, ~30% promo, 6 destaques
- `seed_configuracoes.sql` - Contato real (rataplam.contato@gmail.com, (21) 99691-3143, @rataplam.loja, CNPJ 33.149.055/0001-17, Travessa Roma 14 Rocinha RJ), frete grátis 199.90/fixo 15.90, popups, SMTP, SEO, cron secret

---

### 🎨 Adicionado - Componentes UI (Design System)

| Componente | Props/Features |
|------------|----------------|
| **Modal** | `abierto`, `onFechar`, `titulo`, `children`, `tamanho`, backdrop blur |
| **Confirmar** | `aberto`, `onConfirmar`, `onFechar`, `titulo`, `mensagem`, `textoConfirmar`, `variante` |
| **Toast** | `mensagem`, `tipo` (sucesso/erro/aviso/info), `onFechar`, auto-dismiss 5s, slide-in-right |
| **Tabela** | `colunas`, `dados`, `render(cell, row)`, `ordenavel`, `paginacao`, `carregando`, `vazio` |
| **Paginacao** | `paginaAtual`, `totalPaginas`, `onMudarPagina`, `itensPorPagina`, ellipsis inteligente |
| **Badge** | `variante` (padrao/sucesso/erro/aviso/info), `tamanho`, `ponto` |
| **Input** | `label`, `type`, `placeholder`, `value`, `onChange`, `erro`, `icone`, `mascara` |
| **Select** | `label`, `opcoes`, `value`, `onChange`, `erro`, `placeholder` |
| **Textarea** | `label`, `value`, `onChange`, `erro`, `linhas`, `maxLength` |
| **Botao** | `variante` (primario/secundario/perigo/ghost/link), `tamanho`, `loading`, `icone`, `fullWidth` |
| **CampoFormulario** | Wrapper label+input+erro+ajuda, consistente |
| **ContadorVisitas** | 4 estilos: `hero` (grande), `card`, `badge`, `minimal`, animação contagem |
| **AnimatedCounter** | `valorInicial`, `valorFinal`, `duracao`, `formatador`, easing |
| **DashboardKpis** | 4 cards: pedidos/receita hoje, mês, visitantes, estoque baixo |
| **SeoEditor** | Abas (Básico, Open Graph, Twitter, Avançado), score tempo real, preview Google/FB/Twitter/LI |
| **BannerCarousel** | Auto-play, dots, setas, touch, Ken Burns, overlay, CTA |

---

### 🔧 Melhorado - Otimizações & Correções

#### **Performance Frontend**
- `next.config.ts`: `reactStrictMode: true`, `poweredByHeader: false`, domínios imagem (wixstatic, rataplam.com.br, localhost)
- `globals.css`: `@variant dark`, scrollbar custom, animações (fade, slide, scale, bounce, float, gradient-shift, spin-slow), line-clamp 1/2/3, `::selection` rosa
- Lazy loading imagens (`next/image` priority acima da dobra)
- Fontes Geist variable auto-hosted
- Build 97 rotas, 0 erros TS, ~7s compilação

#### **Segurança Backend**
- `Auth::verificar()` bloqueia usuários `ativo=0`
- Limpeza tokens expirados + max 5 sessões/usuário
- `EmailService` - whitelist 22 variáveis (sem `extract()`), boundary aleatório
- `PaymentService` - Stripe webhook HMAC verificação, MercadoPago assinatura
- Preços **sempre do BD** em pedidos (nunca do cliente)
- Transação atômica: pedido + itens + estoque - rollback em falha
- RateLimit 100req/min (arquivo), exclui webhooks/visitas
- CSRF HMAC-SHA256, 1h expiração, auto-verify POST/PUT/DELETE (exclui login/cadastro/csrf-token/webhooks/visitas)

#### **Compatibilidade PHP**
- PHP 7.4+: `match` → `switch`, `str_contains` → `strpos!==false`, `str_starts_with` → `strpos===0`
- PHP 8.5: `Pdo\Mysql::ATTR_INIT_COMMAND` fallback em Database.php
- Composer PSR-4 `Rataplam\\` → `./` (estrutura real)

#### **Deploy aaPanel/cPanel**
- `DEPLOY.md` - 10 passos completos
- `.htaccess` raiz → `/api/*` para PHP, resto para frontend
- `api/public/.htaccess` - rewrite, CORS, headers segurança, uploads proteção
- `api/public/router.php` - servidor built-in dev
- `composer.json` - PSR-4, PHP >=7.4, dependências

---

### 📦 Atualizado - Páginas Existentes

| Página | Melhorias |
|--------|-----------|
| **Homepage** | Carousel produtos (API + fallback), BannerSlider hero, categorias grid, faixas etárias, depoimentos, trust badges, newsletter funcional, preloader |
| **Loja** | Filtros drawer mobile/sidebar desktop, ordenação, paginação, skeletons, empty state |
| **Produto** | Galeria thumbnails, variações tamanho/cor (auto-sync `variacaoSel`), qty +/- com estoque, tabs, breadcrumbs |
| **Carrinho** | Qty +/-, cupom validação API, animação remoção, resumo gradient, frete config |
| **Checkout** | 3 passos (progress bar animado), validação completa, CEP auto-complete, Correios shipping, pagamento gateway |
| **Conta** | Perfil editável, pedidos (cards + status badge), endereços CRUD+CEP, favoritos, troca senha |
| **Admin Dashboard** | KPIs API, gráfico barras visitas 30d, 7 quick links coloridos |
| **Admin Produtos** | Imagens drag-drop, reordenar, principal, variações inline, SEO por produto |
| **Admin Pedidos** | Timeline status, rastreio, itens, e-mails, impressão, mudança status dropdown |
| **Header** | Sticky backdrop-blur, logo animado, busca overlay, menu mobile slide-in, user dropdown, ThemeToggle |
| **Footer** | Dados reais (e-mail, WhatsApp 21 99691-3143, endereço, CNPJ), payment badges, social links |

---

### 🗑 Removido
- Placeholders "Em desenvolvimento" / "Gráfico será carregado em breve"
- Botões sem `onClick` (homepage add-to-cart, newsletter)
- Hardcoded produtos/categorias (agora API + fallback)
- Chinese chars `通过` em politica-privacidade
- `valor` prop em Input (era `value`)
- `onCancelar` em Confirmar (era `onFechar`)
- `variante` em Badge (era `cor`)
- Duplicata `executarJob` em CronController (fatal error)

---

## [1.0.0] - 2026-06-28 - "Fundação"

### Adicionado
- Estrutura base Next.js 16 + PHP 7.4
- Auth (login, cadastro, reset senha, JWT)
- CRUD produtos/pedidos/clientes
- Carrinho localStorage + servidor
- MercadoPago + Stripe integração
- 14 email templates
- Admin panel básico
- Schema MariaDB completo
- Deploy config aaPanel/cPanel

---

## Notas de Migração v1 → v2

### Banco de Dados
```bash
# Execute em ordem (idempotente com IF NOT EXISTS / INSERT IGNORE)
mysql -u user -p rataplam < database/migration_visitas.sql
mysql -u user -p rataplam < database/migration_cron.sql
mysql -u user -p rataplam < database/seed_produtos.sql
mysql -u user -p rataplam < database/seed_configuracoes.sql
```

### Variáveis de Ambiente Novas
```env
# Backend
REPLICATE_API_TOKEN=r8_xxxx          # Provador virtual
CRON_SECRET_KEY=chave_longa_aqui     # Cron interno

# Frontend
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

### Configurações Admin (Painel → Configurações)
- `preloader_tipo` (pontos/logo/barra), `preloader_cor` (#ec4899), `preloader_texto`
- `popup_promocao_ativo` (0/1), `popup_promocao_titulo`, `popup_promocao_descricao`, `popup_promocao_desconto`, `popup_promocao_data_fim`
- `black_friday_ativo` (0/1), `black_friday_desconto`
- `manutencao_ativo` (0/1), `manutencao_titulo`, `manutencao_mensagem`, `manutencao_data_fim`, `manutencao_imagem`
- `frete_gratis_valor` (199.90), `frete_fixo` (15.90)

---

**Desenvolvido com ❤️ pela equipe RATAPLAM**  
*Roupas que contam histórias — do 0 aos 14 anos.*