'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, formatarMoeda } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Toast } from '@/components/ui';

interface Favorito {
  id: number;
  produto_id: number;
  nome: string;
  slug: string;
  preco: number;
  preco_promocional?: number;
  imagem: string;
  created_at: string;
}

export default function FavoritosPage() {
  const { isLogado, carregando: authCarregando } = useAuth();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await api.get('/api/favoritos');
      setFavoritos(data.favoritos || data || []);
    } catch {
      setFavoritos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (isLogado) carregar();
  }, [isLogado, carregar]);

  const removerFavorito = async (produtoId: number) => {
    try {
      await api.post('/api/favoritos', { produto_id: produtoId });
      setFavoritos((prev) => prev.filter((f) => f.produto_id !== produtoId));
      setToast('Produto removido dos favoritos');
    } catch {
      setToast('Erro ao remover favorito');
    }
  };

  if (authCarregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
      <p className="text-gray-500 mb-8">{favoritos.length} {favoritos.length === 1 ? 'produto' : 'produtos'} salvos</p>

      {carregando ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-lg font-semibold text-gray-700">Nenhum favorito ainda</h3>
          <p className="text-gray-500 mt-2">Explore nossa loja e salve os produtos que voce mais gosta</p>
          <Link href="/loja"
            className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            Ver Loja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoritos.map((fav) => (
            <div key={fav.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
              <Link href={`/produto/${fav.slug}`} className="relative aspect-square bg-gray-50 overflow-hidden">
                {fav.imagem ? (
                  <Image src={fav.imagem} alt={fav.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-4xl">🧸</div>
                )}
                <button onClick={(e) => { e.preventDefault(); removerFavorito(fav.produto_id); }}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors group/btn">
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link href={`/produto/${fav.slug}`}>
                  <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{fav.nome}</h3>
                </Link>
                <div className="mt-auto">
                  {fav.preco_promocional ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">{formatarMoeda(fav.preco_promocional)}</span>
                      <span className="text-sm text-gray-400 line-through">{formatarMoeda(fav.preco)}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">{formatarMoeda(fav.preco)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
