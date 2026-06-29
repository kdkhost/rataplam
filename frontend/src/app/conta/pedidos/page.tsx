'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, formatarMoeda, formatarData } from '@/lib/api';

interface Pedido {
  id: number;
  numero_pedido: string;
  status: string;
  total: number;
  created_at: string;
  itens_count?: number;
}

const statusConfig: Record<string, { label: string; cor: string; bg: string }> = {
  pendente: { label: 'Pendente', cor: 'text-amber-700', bg: 'bg-amber-50 border border-amber-200' },
  pago: { label: 'Pago', cor: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  processando: { label: 'Processando', cor: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  enviado: { label: 'Enviado', cor: 'text-violet-700', bg: 'bg-violet-50 border border-violet-200' },
  entregue: { label: 'Entregue', cor: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' },
  cancelado: { label: 'Cancelado', cor: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
  reembolsado: { label: 'Reembolsado', cor: 'text-red-700', bg: 'bg-red-50 border border-red-200' },
};

const statusIcons: Record<string, string> = {
  pendente: '⏳',
  pago: '✅',
  processando: '⚙️',
  enviado: '🚚',
  entregue: '📦',
  cancelado: '❌',
  reembolsado: '💰',
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get('/api/pedidos?minha_conta=1');
      setPedidos(data.pedidos || []);
    } catch {
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-500 mt-1">Acompanhe seus pedidos e entregas</p>
        </div>

        {carregando ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded-lg w-24 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-lg w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Você ainda não fez nenhum pedido. Que tal dar uma olhada nas nossas novidades?</p>
              <Link
                href="/loja"
                className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Começar a comprar
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const status = statusConfig[pedido.status] || { label: pedido.status, cor: 'text-gray-700', bg: 'bg-gray-50 border border-gray-200' };
              const icon = statusIcons[pedido.status] || '📋';
              return (
                <Link
                  key={pedido.id}
                  href={`/conta/pedidos/${pedido.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-bold text-gray-900">#{pedido.numero_pedido}</span>
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cor} ${status.bg}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatarData(pedido.created_at)}
                          </p>
                          {pedido.itens_count !== undefined && (
                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              {pedido.itens_count} {pedido.itens_count === 1 ? 'item' : 'itens'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:text-right">
                      <div className="text-lg font-bold text-gray-900">{formatarMoeda(pedido.total)}</div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
