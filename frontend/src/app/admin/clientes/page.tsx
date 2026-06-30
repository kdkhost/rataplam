'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarData } from '@/lib/api';
import { Tabela, Badge, Input, Paginacao, Toast, Modal, Botao } from '@/components/ui';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  role: string;
  ativo: number;
  total_pedidos?: number;
  created_at: string;
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [toast, setToast] = useState('');
  const [clienteVer, setClienteVer] = useState<Cliente | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (busca) params.set('busca', busca);
      const data = await api.get(`/api/admin/clientes?${params}`);
      setClientes(data.clientes || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch {
      setClientes([]);
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPagina(1); }, [busca]);

  const toggleAtivo = async (c: Cliente) => {
    try {
      await api.put(`/api/admin/clientes/${c.id}`, { ativo: c.ativo ? 0 : 1 });
      setToast(c.ativo ? 'Cliente desativado' : 'Cliente ativado');
      carregar();
    } catch {
      setToast('Erro ao alterar status');
    }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <p className="text-sm text-gray-500">Gerencie os clientes da loja</p>
      </div>

      <Input
        placeholder="Buscar por nome, e-mail ou CPF..."
        value={busca}
        onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
        className="mb-4 max-w-md"
      />

      <Tabela
        colunas={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'email', label: 'E-mail' },
          { chave: 'telefone', label: 'Telefone', render: (v) => (v as string) || '—' },
          { chave: 'total_pedidos', label: 'Pedidos', render: (v) => <span className="font-medium">{v as number ?? 0}</span> },
          {
            chave: 'role', label: 'Perfil',
            render: (v) => (
              <Badge variante={v === 'admin' ? 'info' : v === 'vendedor' ? 'aviso' : 'padrao'}>
                {v as string}
              </Badge>
            ),
          },
          {
            chave: 'ativo', label: 'Status',
            render: (v) => (
              <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge>
            ),
          },
          { chave: 'created_at', label: 'Cadastro', render: (v) => formatarData(v as string) },
        ]}
        dados={clientes}
        loading={carregando}
        onEditar={(c) => setClienteVer(c as unknown as Cliente)}
        onExcluir={(c) => toggleAtivo(c as unknown as Cliente)}
      />

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />

      {/* Modal de visualização/ações do cliente */}
      {clienteVer && (
        <Modal
          aberto={!!clienteVer}
          onFechar={() => setClienteVer(null)}
          titulo="Detalhes do Cliente"
          tamanho="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nome</p>
                <p className="font-medium text-gray-900">{clienteVer.nome}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">E-mail</p>
                <p className="font-medium text-gray-900">{clienteVer.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">CPF</p>
                <p className="font-medium text-gray-900">{clienteVer.cpf || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
                <p className="font-medium text-gray-900">{clienteVer.telefone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Perfil</p>
                <Badge variante={clienteVer.role === 'admin' ? 'info' : clienteVer.role === 'vendedor' ? 'aviso' : 'padrao'}>
                  {clienteVer.role}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Status</p>
                <Badge variante={clienteVer.ativo ? 'sucesso' : 'erro'}>
                  {clienteVer.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total de Pedidos</p>
                <p className="font-medium text-gray-900">{clienteVer.total_pedidos ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Cadastro</p>
                <p className="font-medium text-gray-900">{formatarData(clienteVer.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Botao
                variante="secundario"
                onClick={() => { toggleAtivo(clienteVer); setClienteVer(null); }}
                className="flex-1"
              >
                {clienteVer.ativo ? 'Desativar' : 'Ativar'}
              </Botao>
              <Botao variante="secundario" onClick={() => setClienteVer(null)} className="flex-1">
                Fechar
              </Botao>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
