'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, formatarMoeda, formatarData } from '@/lib/api';
import { Badge } from '@/components/ui';

interface Pedido {
  id: number; numero_pedido: string; status: string; total: number;
  created_at: string; itens_count?: number;
}

const statusCores: Record<string, 'sucesso' | 'erro' | 'aviso' | 'info' | 'padrao'> = {
  pendente: 'aviso', pago: 'info', processando: 'info', enviado: 'sucesso', entregue: 'sucesso', cancelado: 'erro', reembolsado: 'erro',
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get('/api/pedidos?minha_conta=1');
      setPedidos(data.pedidos || []);
    } catch { setPedidos([]); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>
      {carregando ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}</div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-700">Nenhum pedido encontrado</h3>
          <Link href="/loja" className="mt-4 inline-block text-blue-600 hover:underline">Fazer primeira compra</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => (
            <Link key={p.id} href={`/conta/pedidos/${p.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-gray-900">#{p.numero_pedido}</span>
                    <Badge variante={statusCores[p.status] || 'padrao'}>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatarData(p.created_at)}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{formatarMoeda(p.total)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
