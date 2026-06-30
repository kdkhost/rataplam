'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api, formatarMoeda } from '@/lib/api';
import { useCarrinho } from '@/lib/carrinho';
import Avaliacoes from '@/components/produto/Avaliacoes';
import BotaoFavorito from '@/components/produto/BotaoFavorito';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ScrollReveal';

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
  const [adicionado, setAdicionado] = useState(false);

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

  useEffect(() => {
    if (!produto?.variacoes?.length) return;
    if (!tamanhoSel && !corSel) { setVariacaoSel(null); return; }
    const match = produto.variacoes.find(v =>
      (!tamanhoSel || v.tamanho === tamanhoSel) && (!corSel || v.cor === corSel)
    );
    setVariacaoSel(match?.id ?? null);
  }, [tamanhoSel, corSel, produto]);

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
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  };

  if (carregando) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  if (!produto) return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-20 pt-24 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900">Produto nao encontrado</h2>
        <Link href="/loja" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-semibold hover:bg-brand-blue-dark transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar a loja
        </Link>
      </div>
      <Footer />
    </>
  );

  const tamanhos = [...new Set(produto.variacoes?.map((v) => v.tamanho).filter(Boolean))];
  const cores = [...new Set(produto.variacoes?.map((v) => v.cor).filter(Boolean))];
  const imagens = produto.imagens || [];
  const estoqueBaixo = produto.estoque > 0 && produto.estoque <= 5;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-brand-cream pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-brand-blue transition-colors">Inicio</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/loja" className="hover:text-brand-blue transition-colors">Loja</Link>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{produto.nome}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <ScrollReveal direction="left">
              <div>
                <div className="group relative aspect-square bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 cursor-zoom-in">
                  {imagens.length > 0 ? (
                    <Image src={imagens[imgPrincipal]?.url || imagens[0].url} alt={imagens[imgPrincipal]?.alt || produto.nome} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[2.5] group-hover:origin-[var(--mouse-x,center)_var(--mouse-y,center)]" sizes="(max-width: 768px) 100vw, 50vw"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        e.currentTarget.parentElement?.style.setProperty('--mouse-x', `${x}%`);
                        e.currentTarget.parentElement?.style.setProperty('--mouse-y', `${y}%`);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-blue-light to-brand-pink-light flex items-center justify-center text-8xl text-gray-300">🧸</div>
                  )}
                  {produto.preco_promocional && (
                    <div className="absolute top-4 left-4 bg-brand-pink text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                      -{Math.round(((produto.preco - produto.preco_promocional) / produto.preco) * 100)}% OFF
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    Passe o mouse para zoom
                  </div>
                </div>
                {imagens.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {imagens.map((img, i) => (
                      <button key={i} onClick={() => setImgPrincipal(i)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${i === imgPrincipal ? 'border-brand-blue shadow-md scale-105' : 'border-gray-200 hover:border-brand-blue/50 opacity-70 hover:opacity-100 hover:scale-105'}`}>
                        <Image src={img.url} alt={img.alt || ''} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {produto.categoria_nome && (
                      <span className="inline-block text-xs font-semibold text-brand-blue bg-brand-blue-light px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                        {produto.categoria_nome}
                      </span>
                    )}
                    <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 leading-tight">{produto.nome}</h1>
                  </div>
                  <BotaoFavorito produtoId={produto.id} size="md" />
                </div>

                <div className="flex items-center gap-3 mt-3">
                  {produto.faixa_etaria_nome && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {produto.faixa_etaria_nome}
                    </span>
                  )}
                  {produto.genero && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {produto.genero === 'M' ? 'Masculino' : produto.genero === 'F' ? 'Feminino' : 'Unissex'}
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  {produto.preco_promocional ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-4xl font-extrabold text-brand-pink">{formatarMoeda(produto.preco_promocional)}</span>
                      <span className="text-lg text-gray-400 line-through">{formatarMoeda(produto.preco)}</span>
                      <span className="bg-brand-pink/10 text-brand-pink text-xs font-bold px-3 py-1 rounded-full">
                        Economize {formatarMoeda(produto.preco - produto.preco_promocional)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-extrabold text-gray-900">{formatarMoeda(produto.preco)}</span>
                  )}
                </div>

                {tamanhos.length > 0 && (
                  <div className="mt-8">
                    <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">Tamanho</label>
                    <div className="flex gap-2 flex-wrap">
                      {tamanhos.map((t) => (
                        <button key={t} onClick={() => setTamanhoSel(t)}
                          className={`min-w-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${tamanhoSel === t ? 'border-brand-blue bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'border-gray-200 text-gray-700 hover:border-brand-blue/50 hover:bg-brand-blue-light'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cores.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">
                      Cor {corSel && <span className="font-normal text-gray-500 normal-case">— {corSel}</span>}
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {cores.map((c) => {
                        const hex = produto.variacoes?.find((v) => v.cor === c)?.cor_hex;
                        return (
                          <button key={c} onClick={() => setCorSel(c)}
                            className={`w-11 h-11 rounded-full border-2 transition-all ${corSel === c ? 'border-brand-blue scale-110 shadow-lg ring-2 ring-brand-blue/20' : 'border-gray-200 hover:border-brand-blue/50 hover:scale-105'}`}
                            style={{ backgroundColor: hex || '#ccc' }} title={c}>
                            {corSel === c && (
                              <svg className="w-5 h-5 mx-auto text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-brand-blue-light hover:text-brand-blue transition-colors font-bold text-lg">-</button>
                    <span className="w-12 text-center text-sm font-bold">{quantidade}</span>
                    <button onClick={() => setQuantidade(quantidade + 1)} disabled={quantidade >= produto.estoque} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-brand-blue-light hover:text-brand-blue transition-colors font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                  </div>
                  <button onClick={handleAdicionar} disabled={produto.estoque === 0}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                      produto.estoque === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : adicionado
                          ? 'bg-green-500 text-white shadow-md shadow-green-200'
                          : 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-lg shadow-brand-blue/20 hover:shadow-xl hover:from-brand-blue-dark hover:to-brand-blue'
                    }`}>
                    {produto.estoque === 0 ? (
                      'Esgotado'
                    ) : adicionado ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Adicionado!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Adicionar ao Carrinho
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-100">
                    {produto.estoque > 0 ? (
                      <>
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {estoqueBaixo ? (
                          <span>Ultimas <strong className="text-brand-pink">{produto.estoque}</strong> unidades</span>
                        ) : (
                          <span>{produto.estoque} em estoque</span>
                        )}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Indisponivel
                      </>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-100">
                    <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
                    Frete gratis acima de R$ 199,90
                  </span>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex gap-6 mb-5">
                    <button onClick={() => setAbaAtiva('descricao')}
                      className={`text-sm font-bold pb-2 border-b-2 transition-all ${abaAtiva === 'descricao' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      Descricao
                    </button>
                    <button onClick={() => setAbaAtiva('detalhes')}
                      className={`text-sm font-bold pb-2 border-b-2 transition-all ${abaAtiva === 'detalhes' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                      Detalhes
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100">
                    {abaAtiva === 'descricao' ? (
                      <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao || 'Sem descricao disponivel.'}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {produto.genero && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-blue rounded-full shrink-0" />
                            <span className="text-gray-500">Genero:</span>
                            <span className="font-semibold text-gray-900">{produto.genero === 'M' ? 'Masculino' : produto.genero === 'F' ? 'Feminino' : 'Unissex'}</span>
                          </div>
                        )}
                        {produto.peso_gramas && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-pink rounded-full shrink-0" />
                            <span className="text-gray-500">Peso:</span>
                            <span className="font-semibold text-gray-900">{produto.peso_gramas}g</span>
                          </div>
                        )}
                        {produto.categoria_nome && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-brand-rose rounded-full shrink-0" />
                            <span className="text-gray-500">Categoria:</span>
                            <span className="font-semibold text-gray-900">{produto.categoria_nome}</span>
                          </div>
                        )}
                        {produto.faixa_etaria_nome && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0" />
                            <span className="text-gray-500">Idade:</span>
                            <span className="font-semibold text-gray-900">{produto.faixa_etaria_nome}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={200}>
            <div className="mt-16">
              <Avaliacoes produtoId={produto.id} />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="mt-16 text-center">
              <Link href="/loja" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue rounded-2xl font-bold border-2 border-brand-blue/20 hover:border-brand-blue hover:bg-brand-blue-light transition-all shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Continuar Comprando
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <Footer />
    </>
  );
}
