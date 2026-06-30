'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Tabela, Badge, Modal, Input, Botao, Confirmar, Toast } from '@/components/ui';

interface Banner { id: number; titulo: string; subtitulo: string; imagem: string; link: string; ordem: number; ativo: number; }

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Banner | null>(null);
  const [confirmar, setConfirmar] = useState<Banner | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ titulo: '', subtitulo: '', imagem: '', link: '', ordem: '0', ativo: true });

  const carregar = useCallback(async () => {
    try { const data = await api.get('/api/admin/banners'); setBanners(data.banners || []); }
    catch { setBanners([]); } finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async () => {
    try {
      const payload = { ...form, ordem: parseInt(form.ordem) || 0, ativo: form.ativo ? 1 : 0 };
      if (editando) await api.put(`/api/admin/banners/${editando.id}`, payload);
      else await api.post('/api/admin/banners', payload);
      setModalAberto(false); setToast('Banner salvo'); carregar();
    } catch { setToast('Erro ao salvar'); }
  };

  const excluir = async (b: Banner) => {
    try { await api.delete(`/api/admin/banners/${b.id}`); setToast('Excluido'); carregar(); }
    catch { setToast('Erro ao excluir'); }
  };

  const toggleAtivo = async (b: Banner) => {
    try {
      await api.put(`/api/admin/banners/${b.id}`, { ativo: b.ativo ? 0 : 1 });
      carregar();
    } catch { setToast('Erro ao alterar status'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Banners</h2>
        <Botao onClick={() => { setEditando(null); setForm({ titulo: '', subtitulo: '', imagem: '', link: '', ordem: '0', ativo: true }); setModalAberto(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Banner
        </Botao>
      </div>

      <Tabela
        colunas={[
          { chave: 'ordem', label: '#', render: (v) => <span className="text-muted-foreground">{v as number}</span> },
          { chave: 'titulo', label: 'Titulo', render: (v) => <span className="font-medium text-foreground">{v as string}</span> },
          { chave: 'subtitulo', label: 'Subtitulo', render: (v) => <span className="text-foreground">{v as string}</span> },
          { chave: 'ativo', label: 'Status', render: (v, r) => (
            <button onClick={() => toggleAtivo(r as unknown as Banner)} className="cursor-pointer">
              <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge>
            </button>
          )},
        ]}
        dados={banners}
        onEditar={(b) => { setEditando(b as unknown as Banner); setForm({ titulo: b.titulo as string, subtitulo: b.subtitulo as string, imagem: b.imagem as string, link: (b.link as string) || '', ordem: String(b.ordem), ativo: !!b.ativo }); setModalAberto(true); }}
        onExcluir={(b) => setConfirmar(b as unknown as Banner)}
        loading={carregando}
      />

      <Confirmar aberto={!!confirmar} onFechar={() => setConfirmar(null)} onConfirmar={() => confirmar && excluir(confirmar)} titulo="Excluir" mensagem="Excluir este banner?" variante="perigo" />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? 'Editar Banner' : 'Novo Banner'}>
        <div className="space-y-4">
          <Input label="Titulo" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} className="bg-card text-foreground border-input" />
          <Input label="Subtitulo" value={form.subtitulo} onChange={(e) => setForm((p) => ({ ...p, subtitulo: e.target.value }))} className="bg-card text-foreground border-input" />
          <Input label="URL da Imagem" value={form.imagem} onChange={(e) => setForm((p) => ({ ...p, imagem: e.target.value }))} className="bg-card text-foreground border-input" />
          <Input label="Link (destino)" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} className="bg-card text-foreground border-input" />
          <Input label="Ordem" type="number" value={form.ordem} onChange={(e) => setForm((p) => ({ ...p, ordem: e.target.value }))} className="bg-card text-foreground border-input" />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))} className="rounded" /> Banner ativo
          </label>
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={salvar}>{editando ? 'Salvar' : 'Criar'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
