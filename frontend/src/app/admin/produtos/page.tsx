'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, formatarMoeda } from '@/lib/api';
import { Tabela, Badge, Modal, Input, Select, Textarea, Botao, Confirmar, Toast, Paginacao } from '@/components/ui';

interface Produto { id: number; nome: string; slug: string; preco: number; preco_promocional?: number; estoque: number; ativo: number; categoria_nome?: string; categoria_id?: number; faixa_etaria_id?: number; descricao_curta?: string; genero?: string; destaque: number; imagem?: string; }
interface Categoria { id: number; nome: string; }
interface FaixaEtaria { id: number; nome: string; }
interface ImagemProduto { id: number; produto_id: number; url: string; alt: string; principal: number; ordem: number; }

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [faixas, setFaixas] = useState<FaixaEtaria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [confirmarExcluir, setConfirmarExcluir] = useState<Produto | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ nome: '', slug: '', descricao: '', preco: '', preco_promocional: '', estoque: '', categoria_id: '', faixa_etaria_id: '', genero: 'U', destaque: false });

  const [imagens, setImagens] = useState<ImagemProduto[]>([]);
  const [uploadando, setUploadando] = useState(false);
  const [confirmarExcluirImagem, setConfirmarExcluirImagem] = useState<ImagemProduto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarListas = useCallback(async () => {
    try {
      const catData = await api.get('/api/admin/categorias');
      setCategorias(catData.categorias || []);
    } catch { /* empty */ }
    try {
      const fxData = await api.get('/api/admin/faixas-etarias');
      setFaixas(fxData.faixas || []);
    } catch {
      setFaixas([
        { id: 1, nome: '0 a 1 ano' },
        { id: 2, nome: '1 a 3 anos' },
        { id: 3, nome: '4 a 8 anos' },
        { id: 4, nome: '10 a 14 anos' },
      ]);
    }
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (busca) params.set('busca', busca);
      const data = await api.get(`/api/admin/produtos?${params}`);
      setProdutos(data.produtos || []);
      setTotalPaginas(data.total_paginas || 1);
    } catch { setProdutos([]); }
    finally { setCarregando(false); }
  }, [pagina, busca]);

  useEffect(() => { carregar(); carregarListas(); }, [carregar, carregarListas]);

  const carregarImagens = async (produtoId: number) => {
    try {
      const data = await api.get(`/api/admin/produtos/${produtoId}/imagens`);
      setImagens(data.imagens || []);
    } catch { setImagens([]); }
  };

  const salvar = async () => {
    try {
      const payload = { ...form, preco: parseFloat(form.preco), preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional) : null, estoque: parseInt(form.estoque) || 0, categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null, faixa_etaria_id: form.faixa_etaria_id ? parseInt(form.faixa_etaria_id) : null };
      if (produtoEditando) { await api.put(`/api/admin/produtos/${produtoEditando.id}`, payload); }
      else { await api.post('/api/admin/produtos', payload); }
      setModalAberto(false);
      setToast('Produto salvo com sucesso!');
      carregar();
    } catch { setToast('Erro ao salvar produto'); }
  };

  const excluir = async (p: Produto) => {
    try { await api.delete(`/api/admin/produtos/${p.id}`); setToast('Produto excluido'); carregar(); }
    catch { setToast('Erro ao excluir'); }
  };

  const abrirEditar = (p: Produto) => {
    setProdutoEditando(p);
    setForm({
      nome: p.nome, slug: p.slug, descricao: p.descricao_curta || '',
      preco: String(p.preco), preco_promocional: p.preco_promocional ? String(p.preco_promocional) : '',
      estoque: String(p.estoque), categoria_id: p.categoria_id ? String(p.categoria_id) : '',
      faixa_etaria_id: p.faixa_etaria_id ? String(p.faixa_etaria_id) : '',
      genero: p.genero || 'U', destaque: !!p.destaque,
    });
    carregarImagens(p.id);
    setModalAberto(true);
  };

  const abrirNovo = () => { setProdutoEditando(null); setForm({ nome: '', slug: '', descricao: '', preco: '', preco_promocional: '', estoque: '', categoria_id: '', faixa_etaria_id: '', genero: 'U', destaque: false }); setImagens([]); setModalAberto(true); };

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !produtoEditando) return;

    setUploadando(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('imagem', files[i]);
        formData.append('alt', produtoEditando.nome);
        formData.append('principal', imagens.length === 0 && i === 0 ? '1' : '0');

        await api.upload(`/api/admin/produtos/${produtoEditando.id}/imagens`, formData);
      }
      setToast('Imagens enviadas com sucesso!');
      carregarImagens(produtoEditando.id);
    } catch {
      setToast('Erro ao enviar imagens');
    } finally {
      setUploadando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const excluirImagem = async (img: ImagemProduto) => {
    try {
      await api.delete(`/api/admin/produtos/imagens/${img.id}`);
      setToast('Imagem excluída');
      if (produtoEditando) carregarImagens(produtoEditando.id);
    } catch { setToast('Erro ao excluir imagem'); }
  };

  const definirPrincipal = async (img: ImagemProduto) => {
    try {
      await api.put(`/api/admin/produtos/imagens/${img.id}/principal`, {});
      setToast('Imagem definida como principal');
      if (produtoEditando) carregarImagens(produtoEditando.id);
    } catch { setToast('Erro ao definir principal'); }
  };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
          <p className="text-sm text-gray-500">{produtos.length} produtos cadastrados</p>
        </div>
        <Botao onClick={abrirNovo}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Produto
        </Botao>
      </div>

      <div className="mb-4">
        <Input placeholder="Buscar produto..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
      </div>

      <Tabela
        colunas={[
          { chave: 'imagem', label: 'Imagem', render: (v, item) => {
            const p = item as unknown as Produto;
            return p.imagem ? (
              <img src={p.imagem} alt={p.nome} className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            );
          }},
          { chave: 'nome', label: 'Nome' },
          { chave: 'preco', label: 'Preco', render: (v) => formatarMoeda(v as number) },
          { chave: 'estoque', label: 'Estoque', render: (v) => <span className={v as number <= 5 ? 'text-red-600 font-bold' : ''}>{v as number}</span> },
          { chave: 'ativo', label: 'Status', render: (v) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Ativo' : 'Inativo'}</Badge> },
        ]}
        dados={produtos}
        onEditar={abrirEditar}
        onExcluir={(p) => setConfirmarExcluir(p as unknown as Produto)}
        loading={carregando}
      />

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />

      <Confirmar aberto={!!confirmarExcluir} onFechar={() => setConfirmarExcluir(null)} onConfirmar={() => confirmarExcluir && excluir(confirmarExcluir)} titulo="Excluir Produto" mensagem={`Deseja excluir "${confirmarExcluir?.nome}"?`} variante="perigo" />

      <Confirmar aberto={!!confirmarExcluirImagem} onFechar={() => setConfirmarExcluirImagem(null)} onConfirmar={() => confirmarExcluirImagem && excluirImagem(confirmarExcluirImagem)} titulo="Excluir Imagem" mensagem="Deseja excluir esta imagem?" variante="perigo" />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={produtoEditando ? 'Editar Produto' : 'Novo Produto'} tamanho="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </div>
          <Textarea label="Descricao" value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={3} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Preco (R$)" type="number" step="0.01" value={form.preco} onChange={(e) => setForm((p) => ({ ...p, preco: e.target.value }))} />
            <Input label="Preco Promo (R$)" type="number" step="0.01" value={form.preco_promocional} onChange={(e) => setForm((p) => ({ ...p, preco_promocional: e.target.value }))} />
            <Input label="Estoque" type="number" value={form.estoque} onChange={(e) => setForm((p) => ({ ...p, estoque: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Categoria" value={form.categoria_id} onChange={(e) => setForm((p) => ({ ...p, categoria_id: e.target.value }))}>
              <option value="">Selecione</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            <Select label="Faixa Etaria" value={form.faixa_etaria_id} onChange={(e) => setForm((p) => ({ ...p, faixa_etaria_id: e.target.value }))}>
              <option value="">Selecione</option>
              {faixas.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </Select>
            <Select label="Genero" value={form.genero} onChange={(e) => setForm((p) => ({ ...p, genero: e.target.value }))}>
              <option value="U">Unissex</option><option value="M">Masculino</option><option value="F">Feminino</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.destaque} onChange={(e) => setForm((p) => ({ ...p, destaque: e.target.checked }))} className="rounded" /> Produto em destaque</label>

          {produtoEditando && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Imagens do Produto</h4>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleUploadImagem}
                  className="hidden"
                />
                <Botao
                  variante="secundario"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadando}
                >
                  {uploadando ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Adicionar Imagens
                    </span>
                  )}
                </Botao>
              </div>

              {imagens.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-sm">Nenhuma imagem cadastrada</p>
                  <p className="text-xs text-gray-400">Arraste ou clique para adicionar</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {imagens.map((img) => (
                    <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 ${img.principal ? 'border-blue-500' : 'border-gray-200'}`}>
                      <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                      {img.principal && (
                        <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Principal</span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {!img.principal && (
                          <button
                            onClick={() => definirPrincipal(img)}
                            className="bg-white text-gray-800 p-1.5 rounded-full hover:bg-blue-500 hover:text-white transition"
                            title="Definir como principal"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmarExcluirImagem(img)}
                          className="bg-white text-red-600 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition"
                          title="Excluir imagem"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={salvar}>{produtoEditando ? 'Salvar' : 'Criar'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
