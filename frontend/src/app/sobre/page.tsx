'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Sobre</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Sobre a RATAPLAM</h1>

          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            <p className="text-xl text-gray-600 leading-relaxed">
              A RATAPLAM nasceu do amor por vestir criancas com conforto, qualidade e estilo.
              Nossa missao e oferecer roupas infantis que expressem a personalidade de cada pequeno,
              com materiais que respeitam a pele sensivel das criancas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
              <div className="text-center p-6 bg-rose-50 rounded-2xl">
                <div className="text-4xl mb-3">👶</div>
                <h3 className="font-bold text-gray-900 mb-2">0 a 14 Anos</h3>
                <p className="text-sm text-gray-500">Roupas para todas as fases da infancia</p>
              </div>
              <div className="text-center p-6 bg-violet-50 rounded-2xl">
                <div className="text-4xl mb-3">🧵</div>
                <h3 className="font-bold text-gray-900 mb-2">Qualidade</h3>
                <p className="text-sm text-gray-500">Materiais selecionados e acabamento impecavel</p>
              </div>
              <div className="text-center p-6 bg-pink-50 rounded-2xl">
                <div className="text-4xl mb-3">🚚</div>
                <h3 className="font-bold text-gray-900 mb-2">Frete Gratis</h3>
                <p className="text-sm text-gray-500">Acima de R$ 199,90 para todo o Brasil</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Historia</h2>
              <p className="text-gray-700 leading-relaxed">
                Fundada em Sao Paulo, a RATAPLAM rapidamente se tornou referencia em moda infantil.
                Cada peca e pensada para proporcionar conforto e liberdade de movimento,
                permitindo que as criancas brinquem e sejam felizes com roupa de qualidade.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Trabalhamos com tecidos como algodao, malha e viscose, garantindo maciez e durabilidade.
                Nossas estampas sao desenvolvidas com carinho, pensando em temas que as criancas amam.
              </p>
            </div>

            <div className="text-center pt-8 border-t">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
              <p className="text-gray-500 mb-6">Estamos prontos para ajuda-lo(a)!</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="mailto:contato@rataplam.com.br" className="px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200">
                  Enviar E-mail
                </a>
                <Link href="/contato" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Formulario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
