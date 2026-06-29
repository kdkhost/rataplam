'use client';

import { useState, useEffect, useCallback } from 'react';
import SeoEditor from '@/components/seo/SeoEditor';

interface SeoData {
  pagina: string;
  titulo: string;
  descricao: string;
  keywords: string;
  og_titulo: string;
  og_descricao: string;
  og_imagem: string;
  og_tipo: string;
  twitter_card: string;
  twitter_titulo: string;
  twitter_descricao: string;
  twitter_imagem: string;
  canonical_url: string;
  robots: string;
  schema_json: string;
  score_seo: number;
}

interface PaginaSeo {
  pagina: string;
  titulo: string;
  score_seo: number;
}

const configPadrao: SeoData = {
  pagina: 'home',
  titulo: 'RATAPLAM - Roupas Infantis | Qualidade e Conforto',
  descricao: 'Loja de roupas infantis RATAPLAM. Macacões, bermudas, blusas, biquínis e acessórios para crianças de 0 a 14 anos.',
  keywords: 'roupas infantis, roupas de bebê, macacão infantil, bermuda menino, blusa criança',
  og_titulo: 'RATAPLAM - Roupas Infantis',
  og_descricao: 'Loja de roupas infantis RATAPLAM. Qualidade e conforto para o seu pequeno.',
  og_imagem: '/images/og-default.jpg',
  og_tipo: 'website',
  twitter_card: 'summary_large_image',
  twitter_titulo: 'RATAPLAM - Roupas Infantis',
  twitter_descricao: 'Loja de roupas infantis RATAPLAM. Qualidade e conforto para o seu pequeno.',
  twitter_imagem: '',
  canonical_url: 'https://rataplam.com.br',
  robots: 'index, follow',
  schema_json: '',
  score_seo: 0,
};

export default function AdminSeo() {
  const [paginas, setPaginas] = useState<PaginaSeo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState('home');
  const [dados, setDados] = useState<SeoData>(configPadrao);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const carregarPaginas = useCallback(async () => {
    try {
      const res = await fetch('/api/seo/config?pagina=' + paginaAtual);
      const data = await res.json();
      if (data.sucesso && data.config) {
        setDados(data.config);
      }
    } catch (e) {
      console.error('Erro ao carregar páginas:', e);
    }
  }, [paginaAtual]);

  useEffect(() => {
    carregarPaginas();
  }, [carregarPaginas]);

  const salvar = useCallback(async () => {
    setSalvando(true);
    setMensagem('');
    try {
      const res = await fetch('/api/seo/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const data = await res.json();
      if (data.sucesso) {
        setMensagem('Configuração salva com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      }
    } catch (e) {
      setMensagem('Erro ao salvar configuração');
    } finally {
      setSalvando(false);
    }
  }, [dados]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Configuração SEO</h1>
              <p className="text-xs text-gray-500">Otimização para buscadores e redes sociais</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">Dashboard</a>
            <a href="/admin/seo" className="text-sm font-medium text-purple-600">SEO</a>
            <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">Loja</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Páginas</h3>
            <div className="space-y-1">
              {['home', 'loja', 'produto', 'carrinho', 'checkout', 'contato', 'sobre'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPaginaAtual(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${paginaAtual === p ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{p}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Editando: {paginaAtual}</h2>
                {mensagem && (
                  <p className={`text-sm mt-1 ${mensagem.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                    {mensagem}
                  </p>
                )}
              </div>
              <button
                onClick={salvar}
                disabled={salvando}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {salvando ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Salvar Configuração'
                )}
              </button>
            </div>

            <SeoEditor
              dados={dados}
              onChange={(novo) => setDados((prev) => ({ ...prev, ...novo }))}
              onCalcularScore={() => {}}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
