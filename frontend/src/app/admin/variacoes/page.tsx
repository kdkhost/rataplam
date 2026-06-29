'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarMoeda } from '@/lib/api';
import { Tabela, Badge, Modal, Input, Botao, Confirmar, Toast, Paginacao } from '@/components/ui';

interface Variacao { id: number; produto_id: number; cor: string; tamanho: string; sku: string; estoque: number; preco_adicional: number; ativa: number; produto_nome?: string; }
interface Produto { id: number; nome: string; }

export default function AdminVariacoes() {
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [varEditando, setVarEditando] = useState<Variacao | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<Variacao | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ produto_id: '', cor: '', tamanho: '', sku: '', estoque: '', preco_adicional: '' });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await api.get('/api/admin/produtos?limite=500');
      const lista = data.produtos || [];
      setProdutos(lista);

      const allVars: Variacao[] = [];
      for (const p of lista) {
        try {
          const vd = await api.get(`/api/produtos/${p.id}/variacoes`);
          (vd.variacoes || []).forEach((v: Variacao) => { v.produto_nome = p.nome; allVars.push(v); });
        } catch { /* empty */ }
      }

      if (busca) {
        const b = busca.toLowerCase();
        setVariacoes(allVars.filter((v) => (v.cor + v.tamanho + v.sku + (v.produto_nome || '')).toLowerCase().includes(b)));
      } else {
        setVariacoes(allVars);
      }
      setTotalPaginas(Math.max(1, Math.ceil(allVars.length / 20)));
    } catch { setVariacoes([]); }
    finally { setCarregando(false); }
  }, [busca]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setVarEditando(null);
    setForm({ produto_id: '', cor: '', tamanho: '', sku: '', estoque: '', preco_adicional: '' });
    setModalAberto(true);
  };

  const abrirEditar = (v: Variacao) => {
    setVarEditando(v);
    setForm({ produto_id: String(v.produto_id), cor: v.cor, tamanho: v.tamanho, sku: v.sku, estoque: String(v.estoque), preco_adicional: String(v.preco_adicional) });
    setModalAberto(true);
  };

  const salvar = async () => {
    try {
      const body = { ...form, produto_id: parseInt(form.produto_id), estoque: parseInt(form.estoque) || 0, preco_adicional: parseFloat(form.preco_adicional) || 0 };
      if (varEditando) {
        await api.put(`/api/admin/variacoes/${varEditando.id}`, body);
        setToast('Variacao atualizada');
      } else {
        await api.post(`/api/admin/produtos/${form.produto_id}/variacoes`, body);
        setToast('Variacao criada');
      }
      setModalAberto(false);
      carregar();
    } catch { setToast('Erro ao salvar variacao'); }
  };

  const excluir = async (v: Variacao) => {
    try {
      await api.delete(`/api/admin/variacoes/${v.id}`);
      setToast('Variacao excluida');
      carregar();
    } catch { setToast('Erro ao excluir'); }
  };

  const colunas = [
    { chave: 'produto_nome', label: 'Produto' },
    { chave: 'cor', label: 'Cor' },
    { chave: 'tamanho', label: 'Tamanho' },
    { chave: 'sku', label: 'SKU' },
    { chave: 'estoque', label: 'Estoque', render: (v: unknown) => {
      const estoque = v as number;
      return <span className={`font-medium ${estoque === 0 ? 'text-red-600' : estoque <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>{estoque}</span>;
    }},
    { chave: 'preco_adicional', label: 'Adicional', render: (v: unknown) => formatarMoeda(v as number) },
    { chave: 'ativa', label: 'Status', render: (v: unknown) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativa' : 'Inativa'}</Badge> },
  ];

  const itensPaginados = variacoes.slice((pagina - 1) * 20, pagina * 20);

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Variacoes de Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{variacoes.length} variacoes cadastradas</p>
        </div>
        <Botao onClick={abrirNovo}>Nova Variacao</Botao>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Buscar por cor, tamanho, SKU ou produto..." value={busca} onChange={(e) => setBusca(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <Tabela colunas={colunas} dados={itensPaginados} loading={carregando} onEditar={(r) => abrirEditar(r as Variacao)} onExcluir={(v) => setConfirmarExcluir(v as Variacao)} />
      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />

      <Confirmar aberto={!!confirmarExcluir} titulo="Excluir variacao" mensagem={`Excluir variacao "${confirmarExcluir?.cor} - ${confirmarExcluir?.tamanho}"?`} onConfirmar={() => { if (confirmarExcluir) excluir(confirmarExcluir); setConfirmarExcluir(null); }} onFechar={() => setConfirmarExcluir(null)} />

      {modalAberto && (
        <Modal titulo={varEditando ? 'Editar Variacao' : 'Nova Variacao'} aberto={modalAberto} onFechar={() => setModalAberto(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
              <select value={form.produto_id} onChange={(e) => setForm((p) => ({ ...p, produto_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" disabled={!!varEditando}>
                <option value="">Selecione...</option>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cor *" value={form.cor} onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))} placeholder="Ex: Rosa" />
              <Input label="Tamanho *" value={form.tamanho} onChange={(e) => setForm((p) => ({ ...p, tamanho: e.target.value }))} placeholder="Ex: 4" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="SKU" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="SKU opcional" />
              <Input label="Estoque" value={form.estoque} onChange={(e) => setForm((p) => ({ ...p, estoque: e.target.value }))} type="number" />
              <Input label="Preco Adicional" value={form.preco_adicional} onChange={(e) => setForm((p) => ({ ...p, preco_adicional: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setModalAberto(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">{varEditando ? 'Salvar' : 'Criar'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
