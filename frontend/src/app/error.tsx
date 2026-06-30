'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro 500:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="text-9xl mb-6 animate-pulse">😿</div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Erro interno do servidor</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Algo deu errado do nosso lado. Nossa equipe já foi notificada.
            Tente novamente em alguns instantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-bold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200"
            >
              Tentar Novamente
            </button>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-rose-400 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-all"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}