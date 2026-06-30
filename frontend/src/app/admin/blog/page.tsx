'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarData } from '@/lib/api';
import { Tabela, Badge, Modal, Input, Textarea, Botao, Confirmar, Toast, Paginacao, Select } from '@/components/ui';

interface Post {
  id: number;
  titulo: string;
  slug: string;
  resumo: string;
  imagem: string;
  categoria: string;
  tags: string;
  status: 'rascunho' | 'publicado' | 'arquivado';
  visualizacoes: number;
  publicado_em: string | null;
  created_at: string;
}

const statusCores: Record<string, 'sucesso' | 'aviso' | 'padrao'> = {
  publicado: 'sucesso',
  rascunho: 'aviso',
  arquivado: 'padrao',
};

const formVazio = {
  titulo: '',
  resumo: '',
  conteudo: '',
  imagem: '',
  categoria: '',
  tags: '',
  status: 'rascunho' as 'rascunho' | 'publicado' | 'arquivado',
  publicado_em: '',
};

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [toast, setToast] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Post | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<Post | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(formVazio);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (busca) params.set('busca', busca);
      if (filtroStatus) params.set('status', filtroStatus);
      const data = await api.get(`/api/admin/blog?${params}`);
      setPosts(data.posts || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch {
      setPosts([]);
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPagina(1); }, [busca, filtroStatus]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  };

  const abrirEditar = (p: Post) => {
    setEditando(p);
    setForm({
      titulo: p.titulo,
      resumo: p.resumo || '',
      conteudo: '',
      imagem: p.imagem || '',
      categoria: p.categoria || '',
      tags: p.tags || '',
      status: p.status,
      publicado_em: p.publicado_em ? p.publicado_em.substring(0, 16) : '',
    });
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim()) { setToast('Título é obrigatório'); return; }
    setSalvando(true);
    try {
      const body = {
        ...form,
        publicado_em: form.publicado_em || null,
      };
      if (editando) {
        await api.put(`/api/admin/blog/${editando.id}`, body);
        setToast('Post atualizado com sucesso');
      } else {
        await api.post('/api/admin/blog', body);
        setToast('Post criado com sucesso');
      }
      setModalAberto(false);
      carregar();
    } catch {
      setToast('Erro ao salvar post');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (p: Post) => {
    try {
      await api.delete(`/api/admin/blog/${p.id}`);
      setToast('Post excluído');
      carregar();
    } catch {
      setToast('Erro ao excluir post');
    }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog</h2>
          <p className="text-sm text-muted-foreground">Gerencie os posts do blog da loja</p>
        </div>
        <Botao onClick={abrirNovo}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Post
        </Botao>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Buscar por título ou resumo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 bg-card text-foreground border-input"
        />
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-48 bg-card text-foreground border-input">
          <option value="">Todos os status</option>
          <option value="publicado">Publicados</option>
          <option value="rascunho">Rascunhos</option>
          <option value="arquivado">Arquivados</option>
        </Select>
      </div>

      <Tabela
        colunas={[
          { chave: 'titulo', label: 'Título' },
          { chave: 'categoria', label: 'Categoria', render: (v) => (v as string) || '—' },
          {
            chave: 'status', label: 'Status',
            render: (v) => <Badge variante={statusCores[v as string] || 'padrao'}>{v as string}</Badge>,
          },
          { chave: 'visualizacoes', label: 'Visualizações' },
          {
            chave: 'publicado_em', label: 'Publicado em',
            render: (v) => v ? formatarData(v as string) : '—',
          },
          { chave: 'created_at', label: 'Criado em', render: (v) => formatarData(v as string) },
        ]}
        dados={posts}
        loading={carregando}
        onEditar={(p) => abrirEditar(p as unknown as Post)}
        onExcluir={(p) => setConfirmarExcluir(p as unknown as Post)}
      />

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />

      <Confirmar
        aberto={!!confirmarExcluir}
        titulo="Excluir post"
        mensagem={`Excluir o post "${confirmarExcluir?.titulo}"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        variante="perigo"
        onConfirmar={() => { if (confirmarExcluir) excluir(confirmarExcluir); setConfirmarExcluir(null); }}
        onFechar={() => setConfirmarExcluir(null)}
      />

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? 'Editar Post' : 'Novo Post'}
        tamanho="xl"
      >
        <div className="space-y-4">
          <Input
            label="Título *"
            value={form.titulo}
            onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
            placeholder="Título do post"
            className="bg-card text-foreground border-input"
          />

          <Textarea
            label="Resumo"
            value={form.resumo}
            onChange={(e) => setForm((p) => ({ ...p, resumo: e.target.value }))}
            placeholder="Breve descrição exibida na listagem"
            rows={3}
            className="bg-card text-foreground border-input"
          />

          <Textarea
            label="Conteúdo (HTML)"
            value={form.conteudo}
            onChange={(e) => setForm((p) => ({ ...p, conteudo: e.target.value }))}
            placeholder="<p>Conteúdo completo do post em HTML...</p>"
            rows={10}
            className="bg-card text-foreground border-input"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL da Imagem"
              value={form.imagem}
              onChange={(e) => setForm((p) => ({ ...p, imagem: e.target.value }))}
              placeholder="https://..."
              className="bg-card text-foreground border-input"
            />
            <Input
              label="Categoria"
              value={form.categoria}
              onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
              placeholder="Ex: Dicas, Tendências, Bebê"
              className="bg-card text-foreground border-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tags (separadas por vírgula)"
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder="moda, infantil, verão"
              className="bg-card text-foreground border-input"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as typeof form.status }))}
              className="bg-card text-foreground border-input"
            >
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="arquivado">Arquivado</option>
            </Select>
          </div>

          <Input
            label="Data de Publicação"
            type="datetime-local"
            value={form.publicado_em}
            onChange={(e) => setForm((p) => ({ ...p, publicado_em: e.target.value }))}
            className="bg-card text-foreground border-input"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao onClick={salvar} loading={salvando}>
              {editando ? 'Salvar Alterações' : 'Criar Post'}
            </Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
