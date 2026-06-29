'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api, formatarMoeda } from '@/lib/api';
import { useCarrinho } from '@/lib/carrinho';
import Avaliacoes from '@/components/produto/Avaliacoes';
import BotaoFavorito from '@/components/produto/BotaoFavorito';

interface Produto {
  id: number; nome: string; slug: string; descricao: string; preco: number;
  preco_promocional?: number; estoque: number; genero: string; peso_gramas?: number;
  categoria_nome?: string; faixa_etaria_nome?: string;
  imagens?: { url: string; alt: string; principal: number }[];
  variacoes?: { id: number; nome: string; tamanho: string; cor: string; cor_hex: string; estoque: number; preco_adicional: number }[];
}

export default function ProdutoPage() {
  const params = useParams();
  const { adicionar } = useCarrinho();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const [variacaoSel, setVariacaoSel] = useState<number | null>(null);
  const [tamanhoSel, setTamanhoSel] = useState('');
  const [corSel, setCorSel] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'descricao' | 'detalhes'>('descricao');
  const [imgPrincipal, setImgPrincipal] = useState(0);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await api.get(`/api/produtos/${params.slug}`);
        setProduto(data.produto);
      } catch { setProduto(null); }
      finally { setCarregando(false); }
    };
    carregar();
  }, [params.slug]);

  const handleAdicionar = () => {
    if (!produto) return;
    adicionar({
      produto_id: produto.id,
      variacao_id: variacaoSel || undefined,
      nome: produto.nome,
      preco: (produto.preco_promocional || produto.preco) + (produto.variacoes?.find((v) => v.id === variacaoSel)?.preco_adicional || 0),
      imagem: produto.imagens?.[0]?.url || '',
      quantidade,
      tamanho: tamanhoSel || undefined,
      cor: corSel || undefined,
      estoque: produto.estoque,
    });
  };

  if (carregando) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!produto) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-gray-900">Produto nao encontrado</h2>
      <Link href="/loja" className="mt-4 inline-block text-blue-600 hover:underline">Voltar a loja</Link>
    </div>
  );

  const tamanhos = [...new Set(produto.variacoes?.map((v) => v.tamanho).filter(Boolean))];
  const cores = [...new Set(produto.variacoes?.map((v) => v.cor).filter(Boolean))];
  const imagens = produto.imagens || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Inicio</Link> / <Link href="/loja" className="hover:text-gray-700">Loja</Link> / <span className="text-gray-900">{produto.nome}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
            {imagens.length > 0 ? (
              <Image src={imagens[imgPrincipal]?.url || imagens[0].url} alt={imagens[imgPrincipal]?.alt || produto.nome} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-8xl text-gray-300">🧸</div>
            )}
          </div>
          {imagens.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {imagens.map((img, i) => (
                <button key={i} onClick={() => setImgPrincipal(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === imgPrincipal ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{produto.nome}</h1>
            <BotaoFavorito produtoId={produto.id} size="md" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            {produto.categoria_nome && <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{produto.categoria_nome}</span>}
            {produto.faixa_etaria_nome && <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{produto.faixa_etaria_nome}</span>}
          </div>

          <div className="mt-6">
            {produto.preco_promocional ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">{formatarMoeda(produto.preco_promocional)}</span>
                <span className="text-lg text-gray-400 line-through">{formatarMoeda(produto.preco)}</span>
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  -{Math.round(((produto.preco - produto.preco_promocional) / produto.preco) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">{formatarMoeda(produto.preco)}</span>
            )}
          </div>

          {tamanhos.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Tamanho</label>
              <div className="flex gap-2 flex-wrap">
                {tamanhos.map((t) => (
                  <button key={t} onClick={() => setTamanhoSel(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tamanhoSel === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cores.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {cores.map((c) => {
                  const hex = produto.variacoes?.find((v) => v.cor === c)?.cor_hex;
                  return (
                    <button key={c} onClick={() => setCorSel(c)}
                      className={`w-10 h-10 rounded-full border-2 transition-colors ${corSel === c ? 'border-blue-600 scale-110' : 'border-gray-200'}`}
                      style={{ backgroundColor: hex || '#ccc' }} title={c} />
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-xl">-</button>
              <span className="w-12 text-center text-sm font-medium">{quantidade}</span>
              <button onClick={() => setQuantidade(quantidade + 1)} disabled={quantidade >= produto.estoque} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl disabled:opacity-30 disabled:cursor-not-allowed">+</button>
            </div>
            <button onClick={handleAdicionar} disabled={produto.estoque === 0}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {produto.estoque === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Indisponivel'}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
              Frete gratis acima de R$ 199,90
            </span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setAbaAtiva('descricao')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${abaAtiva === 'descricao' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Descricao</button>
              <button onClick={() => setAbaAtiva('detalhes')} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${abaAtiva === 'detalhes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Detalhes</button>
            </div>
            {abaAtiva === 'descricao' ? (
              <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao || 'Sem descricao disponivel.'}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {produto.genero && <div><span className="text-gray-500">Genero:</span> <span className="font-medium">{produto.genero === 'M' ? 'Masculino' : produto.genero === 'F' ? 'Feminino' : 'Unissex'}</span></div>}
                {produto.peso_gramas && <div><span className="text-gray-500">Peso:</span> <span className="font-medium">{produto.peso_gramas}g</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Avaliacoes produtoId={produto.id} />
      </div>
    </div>
  );
}
