'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarMoeda, formatarData } from '@/lib/api';
import { Tabela, Badge, Modal, Input, Select, Textarea, Botao, Confirmar, Toast } from '@/components/ui';

interface Cupom { id: number; codigo: string; tipo: string; valor: number; valor_minimo: number; limite_uso: number; usos_realizados: number; ativo: number; data_inicio: string; data_fim: string; }

export default function AdminCupons() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cupom | null>(null);
  const [confirmar, setConfirmar] = useState<Cupom | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ codigo: '', descricao: '', tipo: 'percentual', valor: '', valor_minimo: '', limite_uso: '', data_inicio: '', data_fim: '' });

  const carregar = useCallback(async () => {
    try { const data = await api.get('/api/admin/cupons'); setCupons(data.cupons || []); }
    catch { setCupons([]); } finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async () => {
    try {
      const payload = { ...form, valor: parseFloat(form.valor), valor_minimo: parseFloat(form.valor_minimo) || 0, limite_uso: parseInt(form.limite_uso) || 0 };
      if (editando) await api.put(`/api/admin/cupons/${editando.id}`, payload);
      else await api.post('/api/admin/cupons', payload);
      setModalAberto(false); setToast('Cupom salvo'); carregar();
    } catch { setToast('Erro ao salvar'); }
  };

  const excluir = async (c: Cupom) => {
    try { await api.delete(`/api/admin/cupons/${c.id}`); setToast('Excluído'); carregar(); }
    catch { setToast('Erro ao excluir'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Cupons de Desconto</h2>
        <Botao onClick={() => { setEditando(null); setForm({ codigo: '', descricao: '', tipo: 'percentual', valor: '', valor_minimo: '', limite_uso: '', data_inicio: '', data_fim: '' }); setModalAberto(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Cupom
        </Botao>
      </div>

      <Tabela
        colunas={[
          { chave: 'codigo', label: 'Código', render: (v) => <span className="font-mono font-bold">{v as string}</span> },
          { chave: 'tipo', label: 'Tipo', render: (v) => <Badge>{v as string}</Badge> },
          { chave: 'valor', label: 'Valor', render: (v, r) => r.tipo === 'percentual' ? `${v}%` : formatarMoeda(v as number) },
          { chave: 'usos_realizados', label: 'Usos', render: (v, r) => `${v}/${r.limite_uso || '∞'}` },
          { chave: 'ativo', label: 'Status', render: (v) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge> },
        ]}
        dados={cupons}
        onEditar={(c) => { setEditando(c as unknown as Cupom); setForm({ codigo: c.codigo as string, descricao: (c.descricao as string) || '', tipo: c.tipo as string, valor: String(c.valor), valor_minimo: String(c.valor_minimo ?? ''), limite_uso: String(c.limite_uso ?? ''), data_inicio: (c.data_inicio as string) || '', data_fim: (c.data_fim as string) || '' }); setModalAberto(true); }}
        onExcluir={(c) => setConfirmar(c as unknown as Cupom)}
        loading={carregando}
      />

      <Confirmar aberto={!!confirmar} onFechar={() => setConfirmar(null)} onConfirmar={() => confirmar && excluir(confirmar)} titulo="Excluir" mensagem={`Excluir cupom "${confirmar?.codigo}"?`} variante="perigo" />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? 'Editar Cupom' : 'Novo Cupom'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Código" value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))} className="bg-card text-foreground border-input" />
            <Select label="Tipo" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className="bg-card text-foreground border-input">
              <option value="percentual">Percentual (%)</option><option value="fixo">Valor Fixo (R$)</option>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Valor" type="number" step="0.01" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} className="bg-card text-foreground border-input" />
            <Input label="Mín. Compra (R$)" type="number" step="0.01" value={form.valor_minimo} onChange={(e) => setForm((p) => ({ ...p, valor_minimo: e.target.value }))} className="bg-card text-foreground border-input" />
            <Input label="Limite de Uso" type="number" value={form.limite_uso} onChange={(e) => setForm((p) => ({ ...p, limite_uso: e.target.value }))} className="bg-card text-foreground border-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data Início" type="date" value={form.data_inicio} onChange={(e) => setForm((p) => ({ ...p, data_inicio: e.target.value }))} className="bg-card text-foreground border-input" />
            <Input label="Data Fim" type="date" value={form.data_fim} onChange={(e) => setForm((p) => ({ ...p, data_fim: e.target.value }))} className="bg-card text-foreground border-input" />
          </div>
          <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} className="bg-card text-foreground border-input" />
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={salvar}>{editando ? 'Salvar' : 'Criar'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
