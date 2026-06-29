'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatarMoeda } from '@/lib/api';
import { useCarrinho } from '@/lib/carrinho';
import { useState } from 'react';
import BotaoFavorito from '@/components/produto/BotaoFavorito';

interface ProdutoProps {
  id: number;
  nome: string;
  slug: string;
  preco: number;
  preco_promocional?: number;
  imagem: string;
  estoque: number;
  genero: string;
  novo?: boolean;
  destaque?: boolean;
}

export default function ProdutoCard({ produto }: { produto: ProdutoProps }) {
  const { adicionar } = useCarrinho();
  const [adicionando, setAdicionando] = useState(false);

  const handleAdicionar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdicionando(true);
    adicionar({
      produto_id: produto.id,
      nome: produto.nome,
      preco: produto.preco_promocional || produto.preco,
      imagem: produto.imagem,
      quantidade: 1,
      estoque: produto.estoque,
    });
    setTimeout(() => setAdicionando(false), 1000);
  };

  return (
    <Link href={`/produto/${produto.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {produto.imagem ? (
          <Image src={produto.imagem} alt={produto.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-4xl">🧸</div>
        )}
        {produto.novo && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">NOVO</span>
        )}
        {produto.preco_promocional && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            -{Math.round(((produto.preco - produto.preco_promocional) / produto.preco) * 100)}%
          </span>
        )}
        <div className="absolute top-3 right-3">
          <BotaoFavorito produtoId={produto.id} />
        </div>
        <button onClick={handleAdicionar}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-blue-600 hover:text-white">
          {adicionando ? (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          )}
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{produto.nome}</h3>
        <div className="mt-auto">
          {produto.preco_promocional ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">{formatarMoeda(produto.preco_promocional)}</span>
              <span className="text-sm text-gray-400 line-through">{formatarMoeda(produto.preco)}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">{formatarMoeda(produto.preco)}</span>
          )}
          {produto.estoque <= 5 && produto.estoque > 0 && (
            <p className="text-xs text-orange-500 mt-1">Ultimas {produto.estoque} unidades!</p>
          )}
          {produto.estoque === 0 && (
            <p className="text-xs text-red-500 mt-1 font-medium">Esgotado</p>
          )}
        </div>
      </div>
    </Link>
  );
}
