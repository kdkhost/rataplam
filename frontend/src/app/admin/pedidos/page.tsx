'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, formatarMoeda, formatarDataHora } from '@/lib/api';
import { Tabela, Badge, Input, Select, Paginacao, Toast } from '@/components/ui';

interface Pedido { id: number; numero_pedido: string; status: string; total: number; nome_comprador: string; email_comprador: string; created_at: string; metodo_pagamento?: string; }

const statusCores: Record<string, 'sucesso' | 'erro' | 'aviso' | 'info' | 'padrao'> = {
  pendente: 'aviso', pago: 'info', processando: 'info', enviado: 'sucesso', entregue: 'sucesso', cancelado: 'erro', reembolsado: 'erro',
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [toast, setToast] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (filtroStatus) params.set('status', filtroStatus);
      const data = await api.get(`/api/admin/pedidos?${params}`);
      setPedidos(data.pedidos || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch { setPedidos([]); }
    finally { setCarregando(false); }
  }, [pagina, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarStatus = async (id: number, status: string) => {
    try { await api.put(`/api/admin/pedidos/${id}`, { status }); setToast('Status atualizado'); carregar(); }
    catch { setToast('Erro ao atualizar'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
        <p className="text-sm text-gray-500">Gerencie todos os pedidos da loja</p>
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={filtroStatus} onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}>
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option><option value="pago">Pago</option><option value="processando">Processando</option>
          <option value="enviado">Enviado</option><option value="entregue">Entregue</option><option value="cancelado">Cancelado</option>
        </Select>
      </div>

      <Tabela
        colunas={[
          { chave: 'numero_pedido', label: 'Pedido', render: (v) => <span className="font-mono font-bold">#{v as string}</span> },
          { chave: 'nome_comprador', label: 'Cliente' },
          { chave: 'total', label: 'Total', render: (v) => formatarMoeda(v as number) },
          { chave: 'status', label: 'Status', render: (v) => <Badge variante={statusCores[v as string] || 'padrao'}>{v as string}</Badge> },
          { chave: 'created_at', label: 'Data', render: (v) => formatarDataHora(v as string) },
        ]}
        dados={pedidos}
        onEditar={(p) => window.location.href = `/admin/pedidos/${p.id}`}
        loading={carregando}
      />

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
    </div>
  );
}
