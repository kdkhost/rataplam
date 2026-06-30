'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface CompraRecente {
  produto: string;
  imagem: string;
  tempo: string;
}

export default function CompraAlert() {
  const [compras, setCompras] = useState<CompraRecente[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      try {
        const dados = await api.get('/api/visitas/compras-recentes');
        setCompras(dados.compras || []);
      } catch {}
    };
    buscar();
    const interval = setInterval(buscar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (compras.length > 0) {
      setMostrar(true);
      const interval = setInterval(() => {
        setIndiceAtual((prev) => (prev + 1) % compras.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [compras]);

  const compra = compras[indiceAtual];
  if (!mostrar || !compra) return null;

  return (
    <div
      className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 z-50 animate-slide-in-right"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image
            src={compra.imagem}
            alt={compra.produto}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Acabou de comprar</p>
          <p className="font-semibold text-gray-900 dark:text-white truncate">{compra.produto}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400">{compra.tempo}</p>
        </div>
        <button
          onClick={() => setMostrar(false)}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}