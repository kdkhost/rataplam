'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProdutoCard from '@/components/produto/ProdutoCard';
import ScrollReveal from '@/components/ScrollReveal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';

interface Produto {
  id: number; nome: string; slug: string; preco: number; preco_promocional?: number;
  imagem: string; estoque: number; genero: string; novo?: boolean; destaque?: boolean;
  categoria_nome?: string; faixa_etaria_nome?: string;
}

function LojaConteudo() {
  const searchParams = useSearchParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({
    busca: searchParams.get('busca') || '',
    categoria: searchParams.get('categoria') || '',
    faixa: searchParams.get('faixa') || '',
    genero: searchParams.get('genero') || '',
    ordenar: 'recentes',
  });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const buscarProdutos = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.busca) params.set('busca', filtros.busca);
      if (filtros.categoria) params.set('categoria', filtros.categoria);
      if (filtros.faixa) params.set('faixa_etaria', filtros.faixa);
      if (filtros.genero) params.set('genero', filtros.genero);
      params.set('ordenar', filtros.ordenar);
      params.set('pagina', String(pagina));

      const data = await api.get(`/api/produtos?${params}`);
      setProdutos(data.produtos || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch {
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }, [filtros, pagina]);

  useEffect(() => { buscarProdutos(); }, [buscarProdutos]);

  useEffect(() => {
    setFiltros({
      busca: searchParams.get('busca') || '',
      categoria: searchParams.get('categoria') || '',
      faixa: searchParams.get('faixa') || '',
      genero: searchParams.get('genero') || '',
      ordenar: 'recentes',
    });
    setPagina(1);
  }, [searchParams]);

  const handleFiltro = (chave: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [chave]: valor }));
    setPagina(1);
  };

  const tituloPagina = filtros.genero === 'M' ? 'Masculino' : filtros.genero === 'F' ? 'Feminino' : 'Nossa Loja';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-brand-cream pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScrollReveal direction="up">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">{tituloPagina}</h1>
              <p className="text-gray-500 mt-2">Encontre as melhores roupas para o seu pequeno</p>
              {filtros.busca && <p className="text-sm text-brand-blue mt-1">Resultados para: &quot;{filtros.busca}&quot; <button onClick={() => handleFiltro('busca', '')} className="text-red-500 hover:underline ml-2">(limpar)</button></p>}
            </div>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row gap-8">
            <ScrollReveal direction="left" delay={100}>
              <aside className="lg:w-64 shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
                    <input type="text" value={filtros.busca} onChange={(e) => handleFiltro('busca', e.target.value)}
                      placeholder="Nome do produto..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                    <select value={filtros.categoria} onChange={(e) => handleFiltro('categoria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none">
                      <option value="">Todas</option>
                      <option value="macacoes">Macacoes</option>
                      <option value="bermudas">Bermudas</option>
                      <option value="blusas">Blusas</option>
                      <option value="biquinis">Biquinis</option>
                      <option value="calcas">Calcas</option>
                      <option value="conjuntos">Conjuntos</option>
                      <option value="acessorios">Acessorios</option>
                      <option value="vestidos">Vestidos</option>
                      <option value="bebe">Bebe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Faixa Etaria</label>
                    <select value={filtros.faixa} onChange={(e) => handleFiltro('faixa', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none">
                      <option value="">Todas</option>
                      <option value="0-a-1">0 a 1 ano</option>
                      <option value="1-a-3">1 a 3 anos</option>
                      <option value="4-a-8">4 a 8 anos</option>
                      <option value="10-a-14">10 a 14 anos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Genero</label>
                    <select value={filtros.genero} onChange={(e) => handleFiltro('genero', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none">
                      <option value="">Todos</option>
                      <option value="M">Meninos</option>
                      <option value="F">Meninas</option>
                      <option value="U">Unissex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ordenar</label>
                    <select value={filtros.ordenar} onChange={(e) => handleFiltro('ordenar', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue outline-none">
                      <option value="recentes">Mais recentes</option>
                      <option value="preco_asc">Menor preco</option>
                      <option value="preco_desc">Maior preco</option>
                      <option value="nome">Nome A-Z</option>
                    </select>
                  </div>
                  {(filtros.categoria || filtros.faixa || filtros.genero) && (
                    <button onClick={() => { setFiltros({ busca: filtros.busca, categoria: '', faixa: '', genero: '', ordenar: 'recentes' }); setPagina(1); }}
                      className="w-full text-sm text-red-500 hover:text-red-700 font-medium">
                      Limpar filtros
                    </button>
                  )}
                </div>
              </aside>
            </ScrollReveal>

            <div className="flex-1">
              {carregando ? (
                <ScrollReveal direction="up">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                </ScrollReveal>
              ) : produtos.length === 0 ? (
                <ScrollReveal direction="up">
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-700">Nenhum produto encontrado</h3>
                    <p className="text-gray-500 mt-2">Tente ajustar os filtros de busca</p>
                    <button onClick={() => { setFiltros({ busca: '', categoria: '', faixa: '', genero: '', ordenar: 'recentes' }); setPagina(1); }}
                      className="mt-4 px-6 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-brand-blue-dark transition-colors">
                      Ver todos os produtos
                    </button>
                  </div>
                </ScrollReveal>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {produtos.map((p, i) => (
                      <ScrollReveal key={p.id} direction="up" delay={i * 80}>
                        <ProdutoCard produto={p} />
                      </ScrollReveal>
                    ))}
                  </div>
                  {totalPaginas > 1 && (
                    <ScrollReveal direction="up" delay={200}>
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                          <button key={p} onClick={() => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === pagina ? 'bg-brand-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </ScrollReveal>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function LojaPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-brand-cream pt-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
        </div>
        <Footer />
      </>
    }>
      <LojaConteudo />
    </Suspense>
  );
}
