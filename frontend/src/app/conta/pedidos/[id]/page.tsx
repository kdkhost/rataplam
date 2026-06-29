'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, formatarMoeda, formatarDataHora } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui';

interface PedidoItem {
  id: number;
  produto_id: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
}

interface Pedido {
  id: number;
  numero_pedido: string;
  status: string;
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  nome_comprador: string;
  email_comprador: string;
  cpf_comprador: string;
  telefone_comprador: string;
  cep_entrega: string;
  logradouro_entrega: string;
  numero_entrega: string;
  complemento_entrega: string;
  bairro_entrega: string;
  cidade_entrega: string;
  estado_entrega: string;
  metodo_pagamento: string;
  created_at: string;
  itens: PedidoItem[];
}

const statusCores: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  processando: 'bg-blue-100 text-blue-800',
  pago: 'bg-green-100 text-green-800',
  enviado: 'bg-purple-100 text-purple-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  reembolsado: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  processando: 'Processando',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
};

export default function ContaPedidoDetalhePage() {
  const { id } = useParams();
  const { isLogado } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isLogado) return;
    api.get(`/api/pedidos/${id}`)
      .then((data) => setPedido(data.pedido))
      .catch((err) => setErro(err.erro || 'Pedido nao encontrado'))
      .finally(() => setCarregando(false));
  }, [id, isLogado]);

  if (!isLogado) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 mb-4">Faca login para ver seus pedidos</p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">Entrar</Link>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{erro || 'Pedido nao encontrado'}</h2>
        <Link href="/conta/pedidos" className="text-blue-600 hover:underline">Voltar para meus pedidos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/conta/pedidos" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Meus Pedidos
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pedido #{pedido.numero_pedido}</h1>
            <p className="text-sm text-gray-500 mt-1">Realizado em {formatarDataHora(pedido.created_at)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusCores[pedido.status] || 'bg-gray-100 text-gray-800'}`}>
            {statusLabels[pedido.status] || pedido.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            <div className="space-y-4">
              {pedido.itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.nome_produto}</p>
                    <p className="text-sm text-gray-500">{item.quantidade}x {formatarMoeda(item.preco_unitario)}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatarMoeda(item.preco_total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Endereco de Entrega</h2>
            <p className="text-gray-700">
              {pedido.logradouro_entrega}, {pedido.numero_entrega}
              {pedido.complemento_entrega && ` - ${pedido.complemento_entrega}`}
            </p>
            <p className="text-gray-700">{pedido.bairro_entrega} - {pedido.cidade_entrega}/{pedido.estado_entrega}</p>
            <p className="text-gray-700">CEP: {pedido.cep_entrega}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatarMoeda(pedido.subtotal)}</span></div>
              {pedido.desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatarMoeda(pedido.desconto)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span>{pedido.frete === 0 ? 'Gratis' : formatarMoeda(pedido.frete)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100"><span>Total</span><span>{formatarMoeda(pedido.total)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Pagamento</h3>
            <p className="text-sm text-gray-600 capitalize">{pedido.metodo_pagamento}</p>
          </div>

          <Link href="/loja" className="block text-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
