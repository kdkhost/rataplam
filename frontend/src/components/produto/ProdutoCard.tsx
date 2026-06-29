'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatarMoeda } from '@/lib/api';
import { useCarrinho } from '@/lib/carrinho';
import { useState } from 'react';

interface Produto {
  id: number;
  nome: string;
  slug: string;
  preco: number;
  preco_promocional?: number;
  estoque: number;
  imagem?: string;
}

export default function ProdutoCard({ produto }: { produto: Produto }) {
  const { adicionar } = useCarrinho();
  const [adicionando, setAdicionando] = useState(false);
  const [favorito, setFavorito] = useState(false);

  const handleAdicionar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (produto.estoque === 0) return;
    setAdicionando(true);
    adicionar({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_promocional || produto.preco,
      imagem: produto.imagem || '',
      quantidade: 1,
      estoque: produto.estoque,
    });
    setTimeout(() => setAdicionando(false), 600);
  };

  const handleFavorito = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorito(!favorito);
  };

  const desconto = produto.preco_promocional
    ? Math.round(((produto.preco - produto.preco_promocional) / produto.preco) * 100)
    : 0;

  const esgotado = produto.estoque === 0;

  return (
    <Link
      href={`/produto/${produto.slug}`}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-2xl">
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-4xl">
            🧸
          </div>
        )}

        {desconto > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
            -{desconto}%
          </span>
        )}

        {esgotado && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
            <span className="px-4 py-2 bg-gray-700/90 text-white text-sm font-semibold rounded-full backdrop-blur-sm">
              Esgotado
            </span>
          </div>
        )}

        <button
          onClick={handleFavorito}
          className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 z-20"
        >
          <svg
            className={`w-5 h-5 transition-colors duration-200 ${favorito ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 z-10">
          <span className="px-5 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Ver Detalhes
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-rose-600 transition-colors duration-200 line-clamp-2 mb-3 min-h-[2.5rem]">
          {produto.nome}
        </h3>

        <div className="mb-3">
          {produto.preco_promocional ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-rose-600">
                {formatarMoeda(produto.preco_promocional)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatarMoeda(produto.preco)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatarMoeda(produto.preco)}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleAdicionar}
            disabled={esgotado}
            className={`
              w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200
              ${
                esgotado
                  ? 'bg-gray-300 cursor-not-allowed'
                  : adicionando
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 scale-95 shadow-sm'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-lg active:scale-95'
              }
            `}
          >
            {esgotado
              ? 'Indisponível'
              : adicionando
                ? 'Adicionado!'
                : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    </Link>
  );
}
