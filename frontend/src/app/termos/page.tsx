import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | RATAPLAM',
  description: 'Termos e condicoes de uso da loja RATAPLAM.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Termos de Uso</h1>
        <p className="text-sm text-gray-400 text-center mb-12">Ultima atualizacao: Janeiro de 2025</p>

        <div className="prose prose-lg mx-auto text-gray-600 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceite dos Termos</h2>
            <p>Ao acessar e utilizar o site da RATAPLAM, voce concorda com estes Termos de Uso. Caso nao concorde, nao utilize o site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cadastro</h2>
            <p>Para realizar compras, e necessario criar uma conta com dados veridicos. Voce e responsavel pela seguranca da sua senha e de todas as atividades realizadas na sua conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Produtos e Precos</h2>
            <p>Todos os precos estao em Reais (BRL) e incluem impostos quando aplicavel. A RATAPLAM se reserva o direito de alterar precos sem aviso previo. Erros de digitacao no preco nao serao honrados.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Pedidos</h2>
            <p>A confirmacao do pedido ocorre apos a aprovacao do pagamento. A RATAPLAM se reserva o direito de cancelar pedidos em caso de indisponibilidade de estoque ou erro de preco.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Pagamento</h2>
            <p>Formas de pagamento aceitas: cartao de credito (parcelamento ate 6x), boleto bancario e Pix. O processamento e feito de forma segura por gateways de pagamento parceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
            <p>Todo o conteudo do site (textos, imagens, logotipos, marcas) e propriedade da RATAPLAM e esta protegido por direitos autorais. E proibida a reproducao sem autorizacao.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Privacidade</h2>
            <p>Os dados pessoais sao tratados conforme a Lei Geral de Protecao de Dados (LGPD). Consulte nossa Politica de Privacidade para mais detalhes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Alteracoes</h2>
            <p>A RATAPLAM pode alterar estes termos a qualquer momento. As alteracoes entram em vigor imediatamente apos a publicacao no site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contato</h2>
            <p>Em caso de duvidas sobre estes termos, entre em contato pelo e-mail <strong>contato@rataplam.com.br</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
