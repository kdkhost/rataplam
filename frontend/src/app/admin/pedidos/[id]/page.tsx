'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { api, formatarMoeda, formatarData } from '@/lib/api';
import { Badge, Botao, Select, Toast } from '@/components/ui';
import Link from 'next/link';

interface Pedido { id: number; numero_pedido: string; status: string; total: number; nome_comprador: string; email_comprador: string; cpf_comprador: string; telefone_comprador: string; cep_entrega: string; logradouro_entrega: string; numero_entrega: string; bairro_entrega: string; cidade_entrega: string; estado_entrega: string; metodo_pagamento: string; created_at: string; }
interface Item { id: number; nome_produto: string; quantidade: number; preco_unitario: number; preco_total: number; }

const STATUS_OP = ['pendente', 'pago', 'processando', 'em_separacao', 'enviado', 'entregue', 'cancelado', 'reembolsado'];

const statusVariante: Record<string, 'aviso' | 'info' | 'padrao' | 'sucesso' | 'erro'> = {
  pendente: 'aviso',
  pago: 'info',
  processando: 'padrao',
  em_separacao: 'info',
  enviado: 'info',
  entregue: 'sucesso',
  cancelado: 'erro',
  reembolsado: 'erro',
};

export default function AdminPedidoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [status, setStatus] = useState('');
  const [toast, setToast] = useState('');

  const carregar = useCallback(async () => {
    try {
      const data = await api.get(`/api/admin/pedidos/${id}`);
      setPedido(data.pedido);
      setItens(data.pedido?.itens || []);
      setStatus(data.pedido?.status || '');
    } catch { /* empty */ }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarStatus = async () => {
    try {
      await api.put(`/api/admin/pedidos/${id}`, { status });
      setToast('Status atualizado'); carregar();
    } catch { setToast('Erro ao atualizar'); }
  };

  if (!pedido) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pedido {pedido.numero_pedido}</h2>
          <p className="text-sm text-gray-500">Feito em {formatarData(pedido.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select label="" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OP.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </Select>
          <Botao onClick={atualizarStatus}>Atualizar</Botao>
        </div>
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
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-lg text-blue-600">{formatarMoeda(pedido.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Cliente</h3>
            <div className="text-sm space-y-2 text-gray-600">
              <p><strong>Nome:</strong> {pedido.nome_comprador}</p>
              <p><strong>E-mail:</strong> {pedido.email_comprador}</p>
              <p><strong>CPF:</strong> {pedido.cpf_comprador}</p>
              <p><strong>Telefone:</strong> {pedido.telefone_comprador}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Entrega</h3>
            <div className="text-sm space-y-2 text-gray-600">
              <p>{pedido.logradouro_entrega}, {pedido.numero_entrega}</p>
              {pedido.cidade_entrega && <p>{pedido.bairro_entrega} - {pedido.cidade_entrega}/{pedido.estado_entrega}</p>}
              <p>CEP: {pedido.cep_entrega}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Pagamento</h3>
            <div className="text-sm space-y-3 text-gray-600">
              <p><strong>Metodo:</strong> {pedido.metodo_pagamento}</p>
              <Badge variante={statusVariante[pedido.status] || 'padrao'}>{pedido.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Link href="/admin/pedidos" className="text-sm text-blue-600 hover:underline">← Voltar para pedidos</Link>
      </div>
    </div>
  );
}
