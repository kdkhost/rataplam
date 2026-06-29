'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Tabela, Modal, Input, Textarea, Botao, Confirmar, Toast } from '@/components/ui';

interface Categoria { id: number; nome: string; slug: string; descricao: string; ativa: number; }

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [confirmar, setConfirmar] = useState<Categoria | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ nome: '', slug: '', descricao: '' });

  const carregar = useCallback(async () => {
    try { const data = await api.get('/api/admin/categorias'); setCategorias(data.categorias || []); }
    catch { setCategorias([]); } finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async () => {
    try {
      if (editando) await api.put(`/api/admin/categorias/${editando.id}`, form);
      else await api.post('/api/admin/categorias', form);
      setModalAberto(false); setToast('Categoria salva'); carregar();
    } catch { setToast('Erro ao salvar'); }
  };

  const excluir = async (c: Categoria) => {
    try { await api.delete(`/api/admin/categorias/${c.id}`); setToast('Excluída'); carregar(); }
    catch { setToast('Erro ao excluir'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categorias</h2>
        <Botao onClick={() => { setEditando(null); setForm({ nome: '', slug: '', descricao: '' }); setModalAberto(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Nova Categoria
        </Botao>
      </div>

      <Tabela
        colunas={[
          { chave: 'nome', label: 'Nome' },
          { chave: 'slug', label: 'Slug' },
          { chave: 'ativa', label: 'Status', render: (v) => v ? <span className="text-green-600 text-xs font-medium">Ativa</span> : <span className="text-red-600 text-xs font-medium">Inativa</span> },
        ]}
        dados={categorias}
        onEditar={(c) => { setEditando(c as unknown as Categoria); setForm({ nome: c.nome as string, slug: c.slug as string, descricao: (c.descricao as string) || '' }); setModalAberto(true); }}
        onExcluir={(c) => setConfirmar(c as unknown as Categoria)}
        loading={carregando}
      />

      <Confirmar aberto={!!confirmar} onFechar={() => setConfirmar(null)} onConfirmar={() => confirmar && excluir(confirmar)} titulo="Excluir" mensagem={`Excluir "${confirmar?.nome}"?`} variante="perigo" />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? 'Editar Categoria' : 'Nova Categoria'}>
        <div className="space-y-4">
          <Input label="Nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={3} />
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={salvar}>{editando ? 'Salvar' : 'Criar'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
