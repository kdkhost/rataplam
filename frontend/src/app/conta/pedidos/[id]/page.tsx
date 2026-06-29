'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { api, formatarMoeda, formatarData } from '@/lib/api';
import { Badge } from '@/components/ui';

interface Pedido { id: number; numero_pedido: string; status: string; subtotal: number; frete: number; total: number; nome_comprador: string; email_comprador: string; cep_entrega: string; logradouro_entrega: string; numero_entrega: string; bairro_entrega: string; cidade_entrega: string; estado_entrega: string; metodo_pagamento: string; codigo_rastreio?: string; transportadora?: string; created_at: string; }
interface Item { id: number; nome_produto: string; quantidade: number; preco_unitario: number; preco_total: number; }

const statusVariante: Record<string, 'aviso' | 'info' | 'padrao' | 'sucesso' | 'erro'> = {
  pendente: 'aviso', pago: 'info', processando: 'padrao', enviado: 'info', entregue: 'sucesso', cancelado: 'erro',
};

const statusLabel: Record<string, string> = {
  pendente: 'Pendente', pago: 'Pago', processando: 'Processando', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado',
};

export default function ContaPedidoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<Item[]>([]);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get(`/api/pedidos/${id}`);
      setPedido(data.pedido);
      setItens(data.pedido?.itens || []);
    } catch { /* empty */ }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  if (!pedido) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/conta/pedidos" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Voltar para meus pedidos</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedido {pedido.numero_pedido}</h1>
          <p className="text-sm text-gray-500">Feito em {formatarData(pedido.created_at)}</p>
        </div>
        <Badge variante={statusVariante[pedido.status] || 'padrao'}>{statusLabel[pedido.status] || pedido.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.nome_produto}</p>
                    <p className="text-sm text-gray-500">{item.quantidade}x {formatarMoeda(item.preco_unitario)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatarMoeda(item.preco_total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatarMoeda(pedido.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Frete</span><span>{pedido.frete === 0 ? 'Gratis' : formatarMoeda(pedido.frete)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span className="text-blue-600">{formatarMoeda(pedido.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Endereco de Entrega</h3>
            <div className="text-sm space-y-1 text-gray-600">
              <p>{pedido.logradouro_entrega}, {pedido.numero_entrega}</p>
              {pedido.cidade_entrega && <p>{pedido.bairro_entrega} - {pedido.cidade_entrega}/{pedido.estado_entrega}</p>}
              <p>CEP: {pedido.cep_entrega}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Pagamento</h3>
            <p className="text-sm text-gray-600 capitalize">{pedido.metodo_pagamento}</p>
          </div>

          {pedido.codigo_rastreio && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Rastreio</h3>
              <p className="text-sm text-gray-600">{pedido.transportadora}: <strong>{pedido.codigo_rastreio}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
