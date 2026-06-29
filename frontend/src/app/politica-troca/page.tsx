import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Trocas e Devoluções | RATAPLAM',
  description: 'Política de trocas, devoluções e reembolso da RATAPLAM.',
};

export default function PoliticaTrocaPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Política de Trocas e Devoluções</h1>

        <div className="prose prose-lg mx-auto text-gray-600 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Prazo para Troca</h2>
            <p>Você tem até <strong>30 dias corridos</strong> após o recebimento do produto para solicitar a troca ou devolução.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Condições para Troca</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>O produto deve estar sem sinais de uso, lavagem ou desgaste</li>
              <li>As etiquetas devem estar intactas e posicionadas no local original</li>
              <li>O produto deve ser devolvido na embalagem original</li>
              <li>Produtos em promoção podem ter condição diferente - consulte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Como Solicitar</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Entre em contato pelo e-mail <strong>contato@rataplam.com.br</strong></li>
              <li>Informe o número do pedido e o motivo da troca/devolução</li>
              <li>Aguarde a confirmação e instruções de envio</li>
              <li>Após receber o produto, faremos a análise e o reembolso ou envio do novo item</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Reembolso</h2>
            <p>
              O reembolso será realizado em até <strong>10 dias úteis</strong> após a aprovação da devolução,
              na mesma forma de pagamento utilizada na compra:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cartão de crédito:</strong> estorno na fatura (podendo levar 1-2 faturas)</li>
              <li><strong>Pix:</strong> devolução na conta utilizada</li>
              <li><strong>Boleto:</strong> transferência bancária (necessário informar dados bancários)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Frete de Devolução</h2>
            <p>
              Caso a devolução seja por defeito de fabricação, o frete será por nossa conta.
              Para trocas por arrependimento, o frete de devolução será de responsabilidade do cliente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
