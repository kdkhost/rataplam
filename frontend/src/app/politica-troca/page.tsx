'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function PoliticaTrocaPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Inicio</Link> / <span className="text-foreground">Politica de Trocas</span>
        </nav>
        <h1 className="text-4xl font-bold text-foreground mb-8">Politica de Trocas e Devolucoes</h1>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8">
          <ScrollReveal direction="up" delay={0}>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Prazo para Troca</h2>
              <p className="text-foreground leading-relaxed">Voce tem ate <strong>30 dias corridos</strong> apos o recebimento do produto para solicitar a troca ou devolucao.</p>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80}>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Condicoes para Troca</h2>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li>O produto deve estar sem sinais de uso, lavagem ou desgaste</li>
                <li>As etiquetas devem estar intactas e posicionadas no local original</li>
                <li>O produto deve ser devolvido na embalagem original</li>
                <li>Produtos em promocao podem ter condicao diferente - consulte</li>
              </ul>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={160}>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Como Solicitar</h2>
              <ol className="list-decimal list-inside text-foreground space-y-2 ml-4">
                <li>Entre em contato pelo e-mail <strong>contato@rataplam.com.br</strong></li>
                <li>Informe o numero do pedido e o motivo da troca/devolucao</li>
                <li>Aguarde a confirmacao e instrucoes de envio</li>
                <li>Apos receber o produto, faremos a analise e o reembolso ou envio do novo item</li>
              </ol>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={240}>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Reembolso</h2>
              <p className="text-foreground leading-relaxed mb-4">O reembolso sera realizado em ate <strong>10 dias uteis</strong> apos a aprovacao da devolucao, na mesma forma de pagamento utilizada na compra:</p>
              <ul className="list-disc list-inside text-foreground space-y-2 ml-4">
                <li><strong>Cartao de credito:</strong> estorno na fatura (podendo levar 1-2 faturas)</li>
                <li><strong>Pix:</strong> devolucao na conta utilizada</li>
                <li><strong>Boleto:</strong> transferencia bancaria (necessario informar dados bancarios)</li>
              </ul>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={320}>
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Frete de Devolucao</h2>
              <p className="text-foreground leading-relaxed">Caso a devolucao seja por defeito de fabricacao, o frete sera por nossa conta. Para trocas por arrependimento, o frete de devolucao sera de responsabilidade do cliente.</p>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
