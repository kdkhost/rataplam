'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const perguntas = [
  { pergunta: 'Como faco um pedido?', resposta: 'Escolha os produtos, adicione ao carrinho e finalize a compra. Voce recebera um e-mail de confirmacao.' },
  { pergunta: 'Qual o prazo de entrega?', resposta: 'O prazo varia de 3 a 10 dias uteis, dependendo da sua regiao. Voce recebera o codigo de rastreio por e-mail.' },
  { pergunta: 'Posso trocar um produto?', resposta: 'Sim! Voce tem ate 30 dias apos o recebimento para solicitar a troca. O produto deve estar sem uso e com etiquetas.' },
  { pergunta: 'Como faco para devolver?', resposta: 'Entre em contato pelo e-mail contato@rataplam.com.br ou pelo formulario de contato com o numero do pedido.' },
  { pergunta: 'Quais formas de pagamento sao aceitas?', resposta: 'Aceitamos cartao de credito (parcelamento ate 6x), boleto bancario e Pix.' },
  { pergunta: 'O frete e gratis?', resposta: 'Sim! Para compras acima de R$ 199,90, o frete e por nossa conta para todo o Brasil.' },
  { pergunta: 'Posso cancelar um pedido?', resposta: 'Sim, caso o pedido ainda nao tenha sido enviado, entre em contato para solicitar o cancelamento.' },
  { pergunta: 'Como rastrear meu pedido?', resposta: 'Apos o envio, voce recebera um e-mail com o codigo de rastreio para acompanhar a entrega.' },
];

export default function PerguntasFrequentesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Perguntas Frequentes</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h1>
          <p className="text-gray-600 mb-10">Encontre respostas para as duvidas mais comuns</p>

          <div className="space-y-3">
            {perguntas.map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                  {item.pergunta}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{item.resposta}</div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-2xl shadow-sm p-8">
            <p className="text-gray-500 mb-4">Nao encontrou sua duvida?</p>
            <Link href="/contato" className="inline-block px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200">
              Fale Conosco
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
