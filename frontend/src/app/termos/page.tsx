'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

const secoes = [
  { titulo: '1. Aceite dos Termos', conteudo: 'Ao acessar e utilizar o site da RATAPLAM, voce concorda com estes Termos de Uso. Caso nao concorde, nao utilize o site.' },
  { titulo: '2. Cadastro', conteudo: 'Para realizar compras, e necessario criar uma conta com dados veridicos. Voce e responsavel pela seguranca da sua senha e de todas as atividades realizadas na sua conta.' },
  { titulo: '3. Produtos e Precos', conteudo: 'Todos os precos estao em Reais (BRL) e incluem impostos quando aplicavel. A RATAPLAM se reserva o direito de alterar precos sem aviso previo. Erros de digitacao no preco nao serao honrados.' },
  { titulo: '4. Pedidos', conteudo: 'A confirmacao do pedido ocorre apos a aprovacao do pagamento. A RATAPLAM se reserva o direito de cancelar pedidos em caso de indisponibilidade de estoque ou erro de preco.' },
  { titulo: '5. Pagamento', conteudo: 'Formas de pagamento aceitas: cartao de credito (parcelamento ate 6x), boleto bancario e Pix. O processamento e feito de forma segura por gateways de pagamento parceiros.' },
  { titulo: '6. Propriedade Intelectual', conteudo: 'Todo o conteudo do site (textos, imagens, logotipos, marcas) e propriedade da RATAPLAM e esta protegido por direitos autorais. E proibida a reproducao sem autorizacao.' },
  { titulo: '7. Privacidade', conteudo: 'Os dados pessoais sao tratados conforme a Lei Geral de Protecao de Dados (LGPD). Consulte nossa Politica de Privacidade para mais detalhes.' },
  { titulo: '8. Alteracoes', conteudo: 'A RATAPLAM pode alterar estes termos a qualquer momento. As alteracoes entram em vigor imediatamente apos a publicacao no site.' },
  { titulo: '9. Contato', conteudo: 'Em caso de duvidas sobre estes termos, entre em contato pelo e-mail contato@rataplam.com.br.' },
];

export default function TermosPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Inicio</Link> / <span className="text-foreground">Termos de Uso</span>
        </nav>
        <h1 className="text-4xl font-bold text-foreground mb-4">Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">Ultima atualizacao: Janeiro de 2025</p>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8">
          {secoes.map((s, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 80}>
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">{s.titulo}</h2>
                <p className="text-foreground leading-relaxed">{s.conteudo}</p>
              </section>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
