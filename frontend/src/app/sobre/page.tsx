'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

export default function SobrePage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <ScrollReveal direction="up">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Inicio</Link> / <span className="text-foreground">Sobre</span>
          </nav>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100}>
          <h1 className="text-4xl font-bold text-foreground mb-8">Sobre a RATAPLAM</h1>
        </ScrollReveal>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8 space-y-8">
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A RATAPLAM nasceu do amor por vestir criancas com conforto, qualidade e estilo.
              Nossa missao e oferecer roupas infantis que expressem a personalidade de cada pequeno,
              com materiais que respeitam a pele sensivel das criancas.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            {[
              { icon: '👶', title: '0 a 14 Anos', desc: 'Roupas para todas as fases da infancia', bg: 'bg-rose-50 dark:bg-rose-950' },
              { icon: '🧵', title: 'Qualidade', desc: 'Materiais selecionados e acabamento impecavel', bg: 'bg-violet-50 dark:bg-violet-950' },
              { icon: '🚚', title: 'Frete Gratis', desc: 'Acima de R$ 199,90 para todo o Brasil', bg: 'bg-pink-50 dark:bg-pink-950' },
            ].map((card, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 100}>
                <div className={`text-center p-6 ${card.bg} rounded-2xl`}>
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="bg-muted rounded-2xl p-8">
            <ScrollReveal direction="up">
              <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Historia</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <p className="text-foreground leading-relaxed">
                Fundada em Sao Paulo, a RATAPLAM rapidamente se tornou referencia em moda infantil.
                Cada peca e pensada para proporcionar conforto e liberdade de movimento,
                permitindo que as criancas brinquem e sejam felizes com roupa de qualidade.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-foreground leading-relaxed mt-4">
                Trabalhamos com tecidos como algodao, malha e viscose, garantindo maciez e durabilidade.
                Nossas estampas sao desenvolvidas com carinho, pensando em temas que as criancas amam.
              </p>
            </ScrollReveal>
          </div>

          <div className="text-center pt-8 border-t border-border">
            <ScrollReveal direction="up">
              <h2 className="text-2xl font-bold text-foreground mb-4">Entre em Contato</h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <p className="text-muted-foreground mb-6">Estamos prontos para ajuda-lo(a)!</p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="mailto:contato@rataplam.com.br" className="px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200">
                  Enviar E-mail
                </a>
                <Link href="/contato" className="px-6 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-colors">
                  Formulario
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
