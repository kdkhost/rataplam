'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function PoliticaTrocaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Politica de Trocas</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Politica de Trocas e Devolucoes</h1>

          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prazo para Troca</h2>
              <p className="text-gray-700 leading-relaxed">Voce tem ate <strong>30 dias corridos</strong> apos o recebimento do produto para solicitar a troca ou devolucao.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Condicoes para Troca</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>O produto deve estar sem sinais de uso, lavagem ou desgaste</li>
                <li>As etiquetas devem estar intactas e posicionadas no local original</li>
                <li>O produto deve ser devolvido na embalagem original</li>
                <li>Produtos em promocao podem ter condicao diferente - consulte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Como Solicitar</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>Entre em contato pelo e-mail <strong>contato@rataplam.com.br</strong></li>
                <li>Informe o numero do pedido e o motivo da troca/devolucao</li>
                <li>Aguarde a confirmacao e instrucoes de envio</li>
                <li>Apos receber o produto, faremos a analise e o reembolso ou envio do novo item</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reembolso</h2>
              <p className="text-gray-700 leading-relaxed mb-4">O reembolso sera realizado em ate <strong>10 dias uteis</strong> apos a aprovacao da devolucao, na mesma forma de pagamento utilizada na compra:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Cartao de credito:</strong> estorno na fatura (podendo levar 1-2 faturas)</li>
                <li><strong>Pix:</strong> devolucao na conta utilizada</li>
                <li><strong>Boleto:</strong> transferencia bancaria (necessario informar dados bancarios)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frete de Devolucao</h2>
              <p className="text-gray-700 leading-relaxed">Caso a devolucao seja por defeito de fabricacao, o frete sera por nossa conta. Para trocas por arrependimento, o frete de devolucao sera de responsabilidade do cliente.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
