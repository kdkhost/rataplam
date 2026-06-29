'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarData } from '@/lib/api';
import { Tabela, Badge, Input, Paginacao, Toast } from '@/components/ui';

interface Cliente { id: number; nome: string; email: string; cpf: string; telefone: string; role: string; ativo: number; created_at: string; }

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [toast, setToast] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (busca) params.set('busca', busca);
      const data = await api.get(`/api/admin/clientes?${params}`);
      setClientes(data.clientes || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch { setClientes([]); }
    finally { setCarregando(false); }
  }, [pagina, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  const toggleAtivo = async (c: Cliente) => {
    try {
      await api.put(`/api/admin/clientes/${c.id}`, { ativo: c.ativo ? 0 : 1 });
      setToast(c.ativo ? 'Cliente desativado' : 'Cliente ativado');
      carregar();
    } catch { setToast('Erro ao alterar status'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <p className="text-sm text-gray-500">{clientes.length} clientes cadastrados</p>
      </div>

      <Input placeholder="Buscar por nome, e-mail ou CPF..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} className="mb-4" />

      <Tabela
        colunas={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'email', label: 'E-mail' },
          { chave: 'cpf', label: 'CPF' },
          { chave: 'role', label: 'Perfil', render: (v) => <Badge variante={v === 'admin' ? 'info' : 'padrao'}>{v as string}</Badge> },
          { chave: 'ativo', label: 'Status', render: (v) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge> },
          { chave: 'created_at', label: 'Cadastro', render: (v) => formatarData(v as string) },
        ]}
        dados={clientes}
        onEditar={(c) => toggleAtivo(c as unknown as Cliente)}
        loading={carregando}
      />

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
    </div>
  );
}
