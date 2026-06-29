'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCarrinho } from '@/lib/carrinho';
import { api, formatarMoeda } from '@/lib/api';

interface Config {
  frete_gratis_valor: number;
  frete_fixo: number;
}

export default function CarrinhoPage() {
  const { itens, total, totalItens, remover, atualizarQuantidade, limpar } = useCarrinho();
  const [config, setConfig] = useState<Config>({ frete_gratis_valor: 199.90, frete_fixo: 15.90 });

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

  if (itens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900">Seu carrinho esta vazio</h2>
        <p className="text-gray-500 mt-2 mb-8">Adicione produtos para continuar comprando</p>
        <Link href="/loja" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {itens.map((item, index) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm flex gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                {item.imagem ? (
                  <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">🧸</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.nome}</h3>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                  {item.tamanho && <span>Tam: {item.tamanho}</span>}
                  {item.cor && <span>Cor: {item.cor}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => atualizarQuantidade(index, item.quantidade - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">-</button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantidade}</span>
                    <button onClick={() => atualizarQuantidade(index, item.quantidade + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatarMoeda(item.preco * item.quantidade)}</span>
                    <button onClick={() => remover(index)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={limpar} className="text-sm text-red-500 hover:text-red-700 transition-colors">Limpar carrinho</button>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal ({totalItens} itens)</span><span className="font-medium">{formatarMoeda(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className={`font-medium ${frete === 0 ? 'text-green-600' : ''}`}>{frete === 0 ? 'Gratis' : formatarMoeda(frete)}</span></div>
              {frete > 0 && <p className="text-xs text-green-600">Frete gratis acima de R$ 199,90</p>}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatarMoeda(total + frete)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors">
              Finalizar Compra
            </Link>
            <Link href="/loja" className="block w-full mt-3 py-3 text-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
