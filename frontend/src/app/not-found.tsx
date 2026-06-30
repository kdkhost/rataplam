'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="text-9xl mb-6 animate-bounce">😺</div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Página não encontrada</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Ops! A página que você procura não existe ou foi movida.
            Não se preocupe, vamos ajudar você a voltar ao caminho certo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-bold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/loja"
              className="px-8 py-4 border-2 border-rose-400 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all"
            >
              Ver Loja
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-sm">
            <Link href="/contato" className="text-rose-600 hover:underline">Fale Conosco</Link>
            <Link href="/perguntas-frequentes" className="text-rose-600 hover:underline">FAQ</Link>
            <Link href="/rastrear-pedido" className="text-rose-600 hover:underline">Rastrear Pedido</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}