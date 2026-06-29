'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarData } from '@/lib/api';
import { Tabela, Badge, Botao, Input, Modal, Toast } from '@/components/ui';

interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  role: string;
  ativo: number;
  created_at: string;
}

interface FormVendedor {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

const formVazio: FormVendedor = { nome: '', email: '', senha: '', telefone: '' };

export default function AdminVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Vendedor | null>(null);
  const [form, setForm] = useState<FormVendedor>(formVazio);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await api.get('/api/admin/clientes?role=vendedor');
      setVendedores(data.clientes || []);
    } catch {
      setVendedores([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};
    if (!form.nome.trim()) novosErros.nome = 'Nome obrigatorio';
    if (!form.email.trim()) novosErros.email = 'E-mail obrigatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) novosErros.email = 'E-mail invalido';
    if (!editando && !form.senha) novosErros.senha = 'Senha obrigatoria';
    else if (form.senha && form.senha.length < 6) novosErros.senha = 'Minimo de 6 caracteres';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio);
    setErros({});
    setModalAberto(true);
  };

  const abrirEditar = (v: Vendedor) => {
    setEditando(v);
    setForm({ nome: v.nome, email: v.email, senha: '', telefone: v.telefone || '' });
    setErros({});
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    try {
      if (editando) {
        const dados: Record<string, string> = { nome: form.nome, telefone: form.telefone };
        if (form.senha) dados.senha = form.senha;
        await api.put(`/api/admin/clientes/${editando.id}`, dados);
        setToast('Vendedor atualizado com sucesso');
      } else {
        await api.post('/api/admin/clientes', { ...form, role: 'vendedor' });
        setToast('Vendedor criado com sucesso');
      }
      setModalAberto(false);
      carregar();
    } catch {
      setToast(editando ? 'Erro ao atualizar vendedor' : 'Erro ao criar vendedor');
    } finally {
      setSalvando(false);
    }
  };

  const toggleAtivo = async (v: Vendedor) => {
    try {
      await api.put(`/api/admin/clientes/${v.id}`, { ativo: v.ativo ? 0 : 1 });
      setToast(v.ativo ? 'Vendedor desativado' : 'Vendedor ativado');
      carregar();
    } catch {
      setToast('Erro ao alterar status');
    }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendedores</h2>
          <p className="text-sm text-gray-500">{vendedores.length} vendedores cadastrados</p>
        </div>
        <Botao onClick={abrirNovo}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Vendedor
        </Botao>
      </div>

      <Tabela
        colunas={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'email', label: 'E-mail' },
          { chave: 'telefone', label: 'Telefone' },
          { chave: 'ativo', label: 'Status', render: (v) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge> },
          { chave: 'created_at', label: 'Cadastro', render: (v) => formatarData(v as string) },
        ]}
        dados={vendedores}
        onEditar={(v) => abrirEditar(v as unknown as Vendedor)}
        onExcluir={(v) => toggleAtivo(v as unknown as Vendedor)}
        loading={carregando}
      />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? 'Editar Vendedor' : 'Novo Vendedor'}>
        <div className="space-y-4">
          <Input label="Nome" placeholder="Nome completo" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} erro={erros.nome} />
          <Input label="E-mail" type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} erro={erros.email} disabled={!!editando} />
          <Input label={editando ? 'Nova Senha (deixe vazio para manter)' : 'Senha'} type="password" placeholder="Minimo 6 caracteres" value={form.senha} onChange={(e) => setForm((p) => ({ ...p, senha: e.target.value }))} erro={erros.senha} />
          <Input label="Telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
          <div className="flex gap-3 justify-end pt-2">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={handleSalvar} loading={salvando}>{editando ? 'Salvar' : 'Criar Vendedor'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
