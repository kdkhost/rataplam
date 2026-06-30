'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCarrinho } from '@/lib/carrinho';
import { api, formatarMoeda } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Config {
  frete_gratis_valor: number;
  frete_fixo: number;
}

export default function CarrinhoPage() {
  const { itens, total, totalItens, remover, atualizarQuantidade, limpar } = useCarrinho();
  const [config, setConfig] = useState<Config>({ frete_gratis_valor: 199.90, frete_fixo: 15.90 });
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [erroCupom, setErroCupom] = useState('');
  const [itensRemovendo, setItensRemovendo] = useState<number[]>([]);

  useEffect(() => {
    api.get('/api/admin/configuracoes').then((data) => {
      const map: Record<string, string> = {};
      (data.configuracoes || []).forEach((c: { chave: string; valor: string }) => { map[c.chave] = c.valor; });
      setConfig({
        frete_gratis_valor: parseFloat(map.frete_gratis_valor) || 199.90,
        frete_fixo: parseFloat(map.frete_fixo) || 15.90,
      });
    }).catch(() => {});
  }, []);

  const frete = total >= config.frete_gratis_valor ? 0 : config.frete_fixo;

  const aplicarCupom = async () => {
    if (!cupom.trim()) return;
    setErroCupom('');
    try {
      const data = await api.post('/api/cupons/validar', { codigo: cupom });
      if (data.desconto) setDesconto(data.desconto);
    } catch {
      setErroCupom('Cupom invalido');
    }
  };

  const handleRemover = (index: number) => {
    setItensRemovendo((prev) => [...prev, index]);
    setTimeout(() => {
      remover(index);
      setItensRemovendo((prev) => prev.filter((i) => i !== index));
    }, 300);
  };

  if (itens.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-brand-cream pt-20">
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-brand-blue-light to-brand-pink-light rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-brand-blue/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Seu carrinho esta vazio</h2>
            <p className="text-gray-500 mb-10 text-lg">Adicione produtos incriveis para o seu pequeno</p>
            <Link href="/loja" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-blue/25 transition-all duration-300 hover:scale-[1.02] active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Ver Produtos
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-brand-cream pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Carrinho de Compras</h1>
            <p className="text-gray-500 mt-1">{totalItens} {totalItens === 1 ? 'item' : 'itens'} no carrinho</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {itens.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex gap-5 transition-all duration-300 ${itensRemovendo.includes(index) ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100'}`}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative shrink-0">
                    {item.imagem ? (
                      <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">🧸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{item.nome}</h3>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {item.tamanho && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue-light text-brand-blue">Tam: {item.tamanho}</span>
                          )}
                          {item.cor && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-pink-light text-brand-pink">Cor: {item.cor}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleRemover(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-gray-100 rounded-xl p-1">
                        <button onClick={() => atualizarQuantidade(index, item.quantidade - 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-gray-900">{item.quantidade}</span>
                        <button onClick={() => atualizarQuantidade(index, item.quantidade + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <span className="font-bold text-lg text-gray-900">{formatarMoeda(item.preco * item.quantidade)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <button onClick={limpar} className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Limpar carrinho
                </button>
                <Link href="/loja" className="text-sm text-brand-blue hover:text-brand-blue-dark font-medium transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Continuar Comprando
                </Link>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Resumo do Pedido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})</span>
                    <span className="font-semibold text-gray-900">{formatarMoeda(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frete</span>
                    <span className={`font-semibold ${frete === 0 ? 'text-green-600' : 'text-gray-900'}`}>{frete === 0 ? 'Gratis' : formatarMoeda(frete)}</span>
                  </div>
                  {frete > 0 && (
                    <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">Frete gratis acima de {formatarMoeda(config.frete_gratis_valor)}</p>
                  )}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Cupom de Desconto</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Codigo do cupom"
                          value={cupom}
                          onChange={(e) => setCupom(e.target.value.toUpperCase())}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                        />
                        <button onClick={aplicarCupom} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                          Aplicar
                        </button>
                      </div>
                      {erroCupom && <p className="text-xs text-red-500 mt-1.5">{erroCupom}</p>}
                      {desconto > 0 && <p className="text-xs text-green-600 mt-1.5">Cupom aplicado! -{formatarMoeda(desconto)}</p>}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    {desconto > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Desconto</span>
                        <span className="font-semibold text-green-600">-{formatarMoeda(desconto)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-2xl bg-gradient-to-r from-brand-blue to-brand-pink bg-clip-text text-transparent">{formatarMoeda(total + frete - desconto)}</span>
                    </div>
                  </div>
                </div>
                <Link href="/checkout" className="block w-full mt-6 py-4 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-2xl font-bold text-center hover:shadow-lg hover:shadow-brand-blue/25 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                  Finalizar Compra
                </Link>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Compra segura
                  </span>
                  <span>SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
