<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Rataplam\Controllers\AuthController;
use Rataplam\Controllers\ProdutoController;
use Rataplam\Controllers\PedidoController;
use Rataplam\Controllers\AdminController;
use Rataplam\Controllers\VisitaController;
use Rataplam\Controllers\SeoController;
use Rataplam\Controllers\CronController;
use Rataplam\Controllers\ProvadorController;
use Rataplam\Controllers\CarrinhoController;
use Rataplam\Controllers\EnderecoController;
use Rataplam\Controllers\FavoritoController;
use Rataplam\Controllers\VariacaoController;
use Rataplam\Controllers\PagamentoController;
use Rataplam\Controllers\RelatorioController;
use Rataplam\Controllers\LogController;
use Rataplam\Middleware\Auth;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

try {
    // ── Auth (público) ──────────────────────────────
    if ($method === 'POST' && $uri === '/api/auth/login') {
        AuthController::login();
    }
    if ($method === 'POST' && $uri === '/api/auth/cadastro') {
        AuthController::cadastro();
    }

    // ── Auth (autenticado) ──────────────────────────
    if ($uri === '/api/auth/me') {
        Auth::verificar();
        AuthController::me();
    }
    if ($method === 'POST' && $uri === '/api/auth/logout') {
        Auth::verificar();
        AuthController::logout();
    }

    // ── Auth: atualizar perfil ─────────────────────
    if ($method === 'PUT' && $uri === '/api/auth/me') {
        Auth::verificar();
        $input = json_decode(file_get_contents('php://input'), true);
        $dados = \Rataplam\Middleware\Auth::verificar();
        $camposPermitidos = ['nome', 'cpf', 'telefone'];
        $atualizar = array_intersect_key($input, array_flip($camposPermitidos));
        if (!empty($atualizar)) {
            \Rataplam\Config\Database::update('usuarios', $atualizar, 'id = ?', [$dados['id']]);
        }
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // ── Auth: esqueci senha ────────────────────────
    if ($method === 'POST' && $uri === '/api/auth/esqueci-senha') {
        AuthController::esqueciSenha();
    }
    if ($method === 'POST' && $uri === '/api/auth/resetar-senha') {
        AuthController::resetarSenha();
    }

    // ── CEP (público) ───────────────────────────────
    if ($method === 'GET' && preg_match('#^/api/cep/(\d{5}-?\d{3})$#', $uri, $m)) {
        $cep = str_replace('-', '', $m[1]);
        $resultado = \Rataplam\Services\CepService::buscarStatic($cep);
        echo json_encode($resultado);
        exit;
    }

    // ── Contato (público) ──────────────────────────
    if ($method === 'POST' && $uri === '/api/contato') {
        $input = json_decode(file_get_contents('php://input'), true);
        $nome = $input['nome'] ?? '';
        $email = $input['email'] ?? '';
        $assunto = $input['assunto'] ?? '';
        $mensagem = $input['mensagem'] ?? '';
        \Rataplam\Config\Database::insert('email_logs', [
            'destinatario' => 'contato@rataplam.com.br',
            'assunto' => "[Contato] {$assunto} - {$nome}",
            'template' => 'contato',
            'dados' => json_encode(['nome' => $nome, 'email' => $email, 'assunto' => $assunto, 'mensagem' => $mensagem]),
            'status' => 'pendente',
        ]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'mensagem' => 'Mensagem enviada com sucesso!']);
        exit;
    }

    // ── Produtos (público) ──────────────────────────
    if ($method === 'GET' && $uri === '/api/produtos') {
        ProdutoController::listar();
    }
    if ($method === 'GET' && preg_match('#^/api/produtos/([a-z0-9-]+)$#', $uri, $m)) {
        ProdutoController::buscarPorSlug($m[1]);
    }

    // ── Pedidos (público: criar) ────────────────────
    if ($method === 'POST' && $uri === '/api/pedidos') {
        PedidoController::criar();
    }

    // ── Pedidos (autenticado) ───────────────────────
    if ($method === 'GET' && $uri === '/api/pedidos') {
        Auth::verificarOpcional();
        PedidoController::listar();
    }
    if (preg_match('#^/api/pedidos/(\d+)$#', $uri, $m)) {
        Auth::verificarOpcional();
        if ($method === 'GET') PedidoController::buscar((int) $m[1]);
        if ($method === 'PUT') PedidoController::atualizar((int) $m[1]);
    }

    // ── Endereços (legado inline - removido, agora usa EnderecoController) ──

    // ── Admin: Dashboard KPIs ───────────────────────
    if ($method === 'GET' && $uri === '/api/admin/dashboard/kpis') {
        Auth::verificarAdmin();
        $resultado = VisitaController::kpis();
        echo json_encode($resultado);
        exit;
    }

    // ── Admin: Visitas ──────────────────────────────
    if ($method === 'POST' && $uri === '/api/visitas/registrar') {
        $input = json_decode(file_get_contents('php://input'), true);
        $resultado = VisitaController::registrar($input);
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'POST' && $uri === '/api/visitas/atualizar-duracao') {
        $input = json_decode(file_get_contents('php://input'), true);
        $resultado = VisitaController::atualizarDuracao($input);
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'GET' && $uri === '/api/visitas/online') {
        $resultado = VisitaController::online();
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'GET' && $uri === '/api/visitas/kpis') {
        Auth::verificarAdmin();
        $resultado = VisitaController::kpis();
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'GET' && $uri === '/api/visitas/estatisticas') {
        Auth::verificarAdmin();
        $resultado = VisitaController::estatisticas();
        echo json_encode($resultado);
        exit;
    }

    // ── SEO ─────────────────────────────────────────
    if ($method === 'GET' && preg_match('#^/api/seo/config/(.+)$#', $uri, $m)) {
        $resultado = SeoController::buscarConfig($m[1]);
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'POST' && preg_match('#^/api/seo/config/(.+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        $input = json_decode(file_get_contents('php://input'), true);
        $resultado = SeoController::salvarConfig($m[1], $input);
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'GET' && $uri === '/api/seo/pages') {
        Auth::verificarAdmin();
        $resultado = SeoController::listarPaginas();
        echo json_encode($resultado);
        exit;
    }
    if ($method === 'POST' && $uri === '/api/seo/score') {
        $input = json_decode(file_get_contents('php://input'), true);
        $resultado = SeoController::calcularScore($input);
        echo json_encode($resultado);
        exit;
    }

    // ── Admin: Produtos CRUD ────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/produtos') {
        Auth::verificarAdmin();
        ProdutoController::adminListar();
    }
    if ($method === 'POST' && $uri === '/api/admin/produtos') {
        Auth::verificarAdmin();
        ProdutoController::criar();
    }
    if (preg_match('#^/api/admin/produtos/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        if ($method === 'PUT') ProdutoController::atualizar((int) $m[1]);
        if ($method === 'DELETE') ProdutoController::excluir((int) $m[1]);
    }

    // ── Admin: Produtos Imagens ──────────────────────
    if ($method === 'GET' && preg_match('#^/api/admin/produtos/(\d+)/imagens$#', $uri, $m)) {
        Auth::verificarAdmin();
        ProdutoController::listarImagens((int) $m[1]);
    }
    if ($method === 'POST' && preg_match('#^/api/admin/produtos/(\d+)/imagens$#', $uri, $m)) {
        Auth::verificarAdmin();
        ProdutoController::uploadImagem((int) $m[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/admin/produtos/imagens/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        ProdutoController::excluirImagem((int) $m[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/admin/produtos/imagens/(\d+)/principal$#', $uri, $m)) {
        Auth::verificarAdmin();
        ProdutoController::definirPrincipal((int) $m[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/admin/produtos/(\d+)/imagens/ordem$#', $uri, $m)) {
        Auth::verificarAdmin();
        ProdutoController::reordenarImagens((int) $m[1]);
    }

    // ── Admin: Pedidos ──────────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/pedidos') {
        Auth::verificarAdmin();
        PedidoController::listar();
    }
    if (preg_match('#^/api/admin/pedidos/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        if ($method === 'GET') PedidoController::buscar((int) $m[1]);
        if ($method === 'PUT') PedidoController::atualizar((int) $m[1]);
    }

    // ── Admin: Clientes ─────────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/clientes') {
        Auth::verificarAdmin();
        AdminController::listarClientes();
    }
    if (preg_match('#^/api/admin/clientes/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        if ($method === 'PUT') AdminController::atualizarCliente((int) $m[1]);
    }

    // ── Admin: Categorias CRUD ──────────────────────
    if ($method === 'GET' && $uri === '/api/admin/categorias') {
        Auth::verificarAdmin();
        AdminController::listarCategorias();
    }
    if ($method === 'GET' && $uri === '/api/admin/faixas-etarias') {
        Auth::verificarAdmin();
        AdminController::listarFaixasEtarias();
    }
    if ($method === 'POST' && $uri === '/api/admin/categorias') {
        Auth::verificarAdmin();
        AdminController::criarCategoria();
    }
    if (preg_match('#^/api/admin/categorias/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        if ($method === 'PUT') AdminController::atualizarCategoria((int) $m[1]);
        if ($method === 'DELETE') AdminController::excluirCategoria((int) $m[1]);
    }

    // ── Admin: Cupons CRUD ──────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/cupons') {
        Auth::verificarAdmin();
        AdminController::listarCupons();
    }
    if ($method === 'POST' && $uri === '/api/admin/cupons') {
        Auth::verificarAdmin();
        AdminController::criarCupom();
    }
    if (preg_match('#^/api/admin/cupons/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        if ($method === 'PUT') AdminController::atualizarCupom((int) $m[1]);
        if ($method === 'DELETE') AdminController::excluirCupom((int) $m[1]);
    }

    // ── Admin: Configurações ────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/configuracoes') {
        Auth::verificarAdmin();
        AdminController::listarConfiguracoes();
    }
    if ($method === 'POST' && $uri === '/api/admin/configuracoes') {
        Auth::verificarAdmin();
        AdminController::salvarConfiguracoes();
    }

    // ── Admin: Avaliações (moderação) ───────────────
    if ($method === 'GET' && $uri === '/api/admin/avaliacoes') {
        Auth::verificarAdmin();
        $avaliacoes = \Rataplam\Config\Database::fetchAll(
            "SELECT a.*, u.nome as usuario_nome, p.nome as produto_nome FROM avaliacoes a JOIN usuarios u ON a.usuario_id = u.id JOIN produtos p ON a.produto_id = p.id ORDER BY a.created_at DESC"
        );
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'avaliacoes' => $avaliacoes]);
        exit;
    }
    if (preg_match('#^/api/admin/avaliacoes/(\d+)/aprovar$#', $uri, $m)) {
        Auth::verificarAdmin();
        \Rataplam\Config\Database::update('avaliacoes', ['aprovada' => 1], 'id = ?', [(int) $m[1]]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }
    if (preg_match('#^/api/admin/avaliacoes/(\d+)/rejeitar$#', $uri, $m)) {
        Auth::verificarAdmin();
        \Rataplam\Config\Database::update('avaliacoes', ['aprovada' => 0], 'id = ?', [(int) $m[1]]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // ── Admin: Banners CRUD ─────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/banners') {
        Auth::verificarAdmin();
        $banners = \Rataplam\Config\Database::fetchAll("SELECT * FROM banners ORDER BY ordem");
        echo json_encode(['sucesso' => true, 'banners' => $banners]);
        exit;
    }
    if ($method === 'POST' && $uri === '/api/admin/banners') {
        Auth::verificarAdmin();
        $input = json_decode(file_get_contents('php://input'), true);
        $id = \Rataplam\Config\Database::insert('banners', [
            'titulo' => $input['titulo'] ?? '',
            'subtitulo' => $input['subtitulo'] ?? '',
            'imagem' => $input['imagem'] ?? '',
            'link' => $input['link'] ?? '',
            'ordem' => $input['ordem'] ?? 0,
            'ativo' => $input['ativo'] ?? 1,
        ]);
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }
    if (preg_match('#^/api/admin/banners/(\d+)$#', $uri, $m)) {
        Auth::verificarAdmin();
        $id = (int) $m[1];
        if ($method === 'PUT') {
            $input = json_decode(file_get_contents('php://input'), true);
            $dados = array_filter($input, fn($v) => $v !== null);
            \Rataplam\Config\Database::update('banners', $dados, 'id = ?', [$id]);
            echo json_encode(['sucesso' => true]);
            exit;
        }
        if ($method === 'DELETE') {
            \Rataplam\Config\Database::delete('banners', 'id = ?', [$id]);
            echo json_encode(['sucesso' => true]);
            exit;
        }
    }

    // ── Banners (público) ──────────────────────────
    if ($method === 'GET' && $uri === '/api/banners') {
        $banners = \Rataplam\Config\Database::fetchAll(
            "SELECT * FROM banners WHERE ativo = 1 ORDER BY ordem ASC"
        );
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'banners' => $banners]);
        exit;
    }

    // ── Avaliações (público: listar + criar) ──────────
    if ($method === 'GET' && preg_match('#^/api/produtos/(\d+)/avaliacoes$#', $uri, $m)) {
        $produtoId = (int) $m[1];
        $avaliacoes = \Rataplam\Config\Database::fetchAll(
            "SELECT a.*, u.nome as usuario_nome FROM avaliacoes a JOIN usuarios u ON a.usuario_id = u.id WHERE a.produto_id = ? AND a.aprovada = 1 ORDER BY a.created_at DESC",
            [$produtoId]
        );
        $media = \Rataplam\Config\Database::fetch(
            "SELECT AVG(nota) as media, COUNT(*) as total FROM avaliacoes WHERE produto_id = ? AND aprovada = 1",
            [$produtoId]
        );
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'avaliacoes' => $avaliacoes, 'media' => $media['media'] ?? 0, 'total' => $media['total'] ?? 0]);
        exit;
    }
    if ($method === 'POST' && preg_match('#^/api/produtos/(\d+)/avaliacoes$#', $uri, $m)) {
        Auth::verificar();
        $produtoId = (int) $m[1];
        $dados = Auth::verificar();
        $input = json_decode(file_get_contents('php://input'), true);
        $existe = \Rataplam\Config\Database::fetch(
            "SELECT id FROM avaliacoes WHERE produto_id = ? AND usuario_id = ?",
            [$produtoId, $dados['id']]
        );
        if ($existe) {
            http_response_code(400);
            echo json_encode(['erro' => 'Voce ja avaliou este produto']);
            exit;
        }
        $id = \Rataplam\Config\Database::insert('avaliacoes', [
            'produto_id' => $produtoId,
            'usuario_id' => $dados['id'],
            'nota' => max(1, min(5, (int) ($input['nota'] ?? 5))),
            'titulo' => $input['titulo'] ?? '',
            'comentario' => $input['comentario'] ?? '',
        ]);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'id' => $id]);
        exit;
    }

    // ── Carrinho (autenticado ou visitante com session) ─
    if ($method === 'GET' && $uri === '/api/carrinho') {
        CarrinhoController::listar();
    }
    if ($method === 'POST' && $uri === '/api/carrinho') {
        CarrinhoController::adicionar();
    }
    if ($method === 'PUT' && preg_match('#^/api/carrinho/(\d+)$#', $uri, $m)) {
        CarrinhoController::atualizar((int) $m[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/carrinho/(\d+)$#', $uri, $m)) {
        CarrinhoController::excluir((int) $m[1]);
    }
    if ($method === 'DELETE' && $uri === '/api/carrinho') {
        CarrinhoController::limpar();
    }

    // ── Endereços (autenticado) ─────────────────────
    if ($method === 'GET' && $uri === '/api/enderecos') {
        EnderecoController::listar();
    }
    if ($method === 'POST' && $uri === '/api/enderecos') {
        EnderecoController::criar();
    }
    if ($method === 'PUT' && preg_match('#^/api/enderecos/(\d+)$#', $uri, $m)) {
        EnderecoController::atualizar((int) $m[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/enderecos/(\d+)$#', $uri, $m)) {
        EnderecoController::excluir((int) $m[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/enderecos/(\d+)/principal$#', $uri, $m)) {
        EnderecoController::definirPrincipal((int) $m[1]);
    }

    // ── Favoritos (autenticado) ──────────────────────
    if ($method === 'GET' && $uri === '/api/favoritos') {
        FavoritoController::listar();
    }
    if ($method === 'POST' && $uri === '/api/favoritos') {
        FavoritoController::adicionar();
    }
    if ($method === 'DELETE' && preg_match('#^/api/favoritos/(\d+)$#', $uri, $m)) {
        FavoritoController::excluir((int) $m[1]);
    }
    if ($method === 'GET' && preg_match('#^/api/favoritos/(\d+)/verificar$#', $uri, $m)) {
        FavoritoController::verificar((int) $m[1]);
    }

    // ── Variações (admin: CRUD) ──────────────────────
    if ($method === 'GET' && preg_match('#^/api/admin/produtos/(\d+)/variacoes$#', $uri, $m)) {
        VariacaoController::listar((int) $m[1]);
    }
    if ($method === 'POST' && preg_match('#^/api/admin/produtos/(\d+)/variacoes$#', $uri, $m)) {
        VariacaoController::criar((int) $m[1]);
    }
    if ($method === 'PUT' && preg_match('#^/api/admin/variacoes/(\d+)$#', $uri, $m)) {
        VariacaoController::atualizar((int) $m[1]);
    }
    if ($method === 'DELETE' && preg_match('#^/api/admin/variacoes/(\d+)$#', $uri, $m)) {
        VariacaoController::excluir((int) $m[1]);
    }

    // ── Pagamentos ───────────────────────────────────
    if ($method === 'POST' && $uri === '/api/pagamentos') {
        PagamentoController::criar();
    }
    if ($method === 'GET' && preg_match('#^/api/pagamentos/(\d+)/status$#', $uri, $m)) {
        PagamentoController::status((int) $m[1]);
    }
    if ($method === 'POST' && $uri === '/api/pagamentos/webhook/mercadopago') {
        PagamentoController::webhookMercadoPago();
    }
    if ($method === 'POST' && $uri === '/api/pagamentos/webhook/stripe') {
        PagamentoController::webhookStripe();
    }

    // ── Relatórios (admin) ──────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/relatorios/vendas') {
        RelatorioController::vendas();
    }
    if ($method === 'GET' && $uri === '/api/admin/relatorios/estoque') {
        RelatorioController::estoque();
    }
    if ($method === 'GET' && $uri === '/api/admin/relatorios/financeiro') {
        RelatorioController::financeiro();
    }

    // ── Logs (admin) ────────────────────────────────
    if ($method === 'GET' && $uri === '/api/admin/logs/webhooks') {
        LogController::webhooks();
    }
    if ($method === 'GET' && $uri === '/api/admin/logs/emails') {
        LogController::emails();
    }
    if ($method === 'DELETE' && preg_match('#^/api/admin/logs/(\d+)/limpar$#', $uri, $m)) {
        LogController::limpar((int) $m[1]);
    }

    // ── Cupons (validação pública) ──────────────────
    if ($method === 'POST' && $uri === '/api/cupons/validar') {
        $input = json_decode(file_get_contents('php://input'), true);
        $codigo = strtoupper($input['codigo'] ?? '');
        $cupom = \Rataplam\Config\Database::fetch(
            "SELECT * FROM cupons WHERE codigo = ? AND ativo = 1 AND (data_inicio IS NULL OR data_inicio <= NOW()) AND (data_fim IS NULL OR data_fim >= NOW())",
            [$codigo]
        );
        if (!$cupom) {
            http_response_code(400);
            echo json_encode(['erro' => 'Cupom invalido ou expirado']);
            exit;
        }
        if ($cupom['limite_uso'] > 0 && $cupom['usos_realizados'] >= $cupom['limite_uso']) {
            http_response_code(400);
            echo json_encode(['erro' => 'Cupom atingiu o limite de uso']);
            exit;
        }
        $desconto = $cupom['tipo'] === 'percentual' ? 0 : $cupom['valor'];
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['sucesso' => true, 'desconto' => $desconto, 'tipo' => $cupom['tipo'], 'valor' => $cupom['valor']]);
        exit;
    }

    // ── Cron (interno, centralizado) ────────────────
    if ($method === 'GET' && $uri === '/api/cron/executar') {
        Auth::verificarAdmin();
        CronController::executar();
    }
    if ($method === 'GET' && $uri === '/api/cron/status') {
        Auth::verificarAdmin();
        CronController::status();
    }
    if ($method === 'POST' && preg_match('#^/api/cron/(\d+)/toggle$#', $uri, $m)) {
        Auth::verificarAdmin();
        CronController::toggleJob((int) $m[1]);
    }
    if ($method === 'POST' && preg_match('#^/api/cron/(\d+)/executar$#', $uri, $m)) {
        Auth::verificarAdmin();
        CronController::executarJob((int) $m[1]);
    }

    // ── Webhooks (público - payment gateways) ────────
    if ($method === 'POST' && $uri === '/api/webhooks/mercadopago') {
        $input = json_decode(file_get_contents('php://input'), true);
        $paymentService = new \Rataplam\Services\PaymentService();
        $resultado = $paymentService->webhookMercadoPago($input);

        \Rataplam\Config\Database::insert('webhook_logs', [
            'gateway' => 'mercadopago',
            'event_type' => $input['type'] ?? 'unknown',
            'payload' => json_encode($input),
            'processado' => $resultado['sucesso'] ? 1 : 0,
        ]);

        // Process payment immediately
        if ($resultado['sucesso'] && isset($resultado['external_reference'])) {
            $status = $paymentService->mapearStatus('mercadopago', $resultado['status'] ?? '');
            if ($status !== 'pendente') {
                \Rataplam\Config\Database::update('pedidos', ['status' => $status], 'numero_pedido = ? OR id = ?', [
                    $resultado['external_reference'], $resultado['external_reference']
                ]);
            }
        }

        http_response_code(200);
        echo json_encode(['received' => true]);
        exit;
    }
    if ($method === 'POST' && $uri === '/api/webhooks/stripe') {
        $payload = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $input = json_decode($payload, true);
        $paymentService = new \Rataplam\Services\PaymentService();
        $resultado = $paymentService->webhookStripe($payload, $signature);

        \Rataplam\Config\Database::insert('webhook_logs', [
            'gateway' => 'stripe',
            'event_type' => $input['type'] ?? 'unknown',
            'payload' => $payload,
            'processado' => $resultado['sucesso'] ? 1 : 0,
        ]);

        http_response_code(200);
        echo json_encode(['received' => true]);
        exit;
    }

    // ── Provador Virtual (IA) ─────────────────────────
    if ($method === 'POST' && $uri === '/api/provador/processar') {
        ProvadorController::processar();
    }
    if ($method === 'GET' && $uri === '/api/provador/status') {
        ProvadorController::status();
    }

    // ── 404 ─────────────────────────────────────────
    http_response_code(404);
    echo json_encode(['erro' => 'Rota não encontrada', 'rota' => $uri]);
    exit;

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno do servidor', 'mensagem' => $e->getMessage()]);
    exit;
}
