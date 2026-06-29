import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | RATAPLAM',
  description: 'Dúvidas frequentes sobre pedidos, entregas, trocas e devoluções na RATAPLAM.',
};

const perguntas = [
  { pergunta: 'Como faço um pedido?', resposta: 'Escolha os produtos, adicione ao carrinho e finalize a compra. Você receberá um e-mail de confirmação.' },
  { pergunta: 'Qual o prazo de entrega?', resposta: 'O prazo varia de 3 a 10 dias úteis, dependendo da sua região. Você receberá o código de rastreio por e-mail.' },
  { pergunta: 'Posso trocar um produto?', resposta: 'Sim! Você tem até 30 dias após o recebimento para solicitar a troca. O produto deve estar sem uso e com etiquetas.' },
  { pergunta: 'Como faço para devolver?', resposta: 'Entre em contato pelo e-mail contato@rataplam.com.br ou pelo formulário de contato com o número do pedido.' },
  { pergunta: 'Quais formas de pagamento são aceitas?', resposta: 'Aceitamos cartão de crédito (parcelamento até 6x), boleto bancário e Pix.' },
  { pergunta: 'O frete é grátis?', resposta: 'Sim! Para compras acima de R$ 199,90, o frete é por nossa conta para todo o Brasil.' },
  { pergunta: 'Posso cancelar um pedido?', resposta: 'Sim, caso o pedido ainda não tenha sido enviado, entre em contato para solicitar o cancelamento.' },
  { pergunta: 'Como rastrear meu pedido?', resposta: 'Após o envio, você receberá um e-mail com o código de rastreio para acompanhar a entrega.' },
];

export default function PerguntasFrequentesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Perguntas Frequentes</h1>
        <p className="text-gray-500 text-center mb-12">Encontre respostas para as dúvidas mais comuns</p>

        <div className="space-y-4">
          {perguntas.map((item, i) => (
            <details key={i} className="group bg-gray-50 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100 transition-colors">
                {item.pergunta}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                {item.resposta}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">Não encontrou sua dúvida?</p>
          <a href="/contato" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Fale Conosco
          </a>
        </div>
      </div>
    </div>
  );
}
