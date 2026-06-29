'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, formatarMoeda } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Produto {
  id: number;
  slug: string;
  nome: string;
  preco: number;
  preco_promocional?: number;
  imagem_url?: string;
}

interface StatusProvador {
  configurado: boolean;
  modelo: string;
}

export default function ProvadorVirtualPage() {
  const { isLogado } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [estilo, setEstilo] = useState('realista');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [status, setStatus] = useState<StatusProvador | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');
  const [mostrarBusca, setMostrarBusca] = useState(false);

  useEffect(() => {
    api.get('/api/provador/status').then(setStatus).catch(() => setStatus({ configurado: false, modelo: '' }));
  }, []);

  useEffect(() => {
    if (busca.length >= 2) {
      api.get(`/api/produtos?busca=${encodeURIComponent(busca)}&limite=8`)
        .then((data) => setProdutos(data.produtos || []))
        .catch(() => setProdutos([]));
    } else {
      setProdutos([]);
    }
  }, [busca]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErro('Arquivo muito grande. Maximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFoto(ev.target?.result as string);
        setErro('');
        setResultado(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessar = async () => {
    if (!foto || !produtoSelecionado) {
      setErro('Selecione uma foto e um produto.');
      return;
    }

    setProcessando(true);
    setErro('');
    setResultado(null);

    try {
      const data = await api.post('/api/provador/processar', {
        foto,
        produto_id: produtoSelecionado.id,
        estilo,
      });

      if (data.imagem_url) {
        setResultado(data.imagem_url);
      } else {
        setErro('Nao foi possivel gerar a imagem.');
      }
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar imagem');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Provador Virtual com IA</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Envie uma foto da crianca e veja como nossas roupas ficam nela. 
          Tecnologia de inteligencia artificial para a melhor experiencia.
        </p>
        {!status?.configurado && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm max-w-lg mx-auto">
            Configure a chave <code>REPLICATE_API_TOKEN</code> nas configuracoes do sistema para ativar o provador virtual.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Envie a Foto da Crianca</h2>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleFotoChange} 
              />
              {foto ? (
                <div className="relative inline-block">
                  <img src={foto} alt="Foto da crianca" className="max-h-64 mx-auto rounded-lg" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFoto(null); setResultado(null); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ) : (
                <>
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">Clique ou arraste uma foto</p>
                  <p className="text-xs text-gray-400">JPG, PNG ou WebP, ate 5MB</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Escolha a Roupa</h2>
            <div className="relative mb-4">
              <input
                type="text"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setMostrarBusca(true); }}
                onFocus={() => setMostrarBusca(true)}
                placeholder="Buscar produto..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {mostrarBusca && produtos.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-64 overflow-y-auto">
                  {produtos.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProdutoSelecionado(p);
                        setBusca(p.nome);
                        setMostrarBusca(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-left transition-colors"
                    >
                      {p.imagem_url && (
                        <img src={p.imagem_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                        <p className="text-xs text-purple-600">{formatarMoeda(p.preco_promocional || p.preco)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {produtoSelecionado && (
              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                {produtoSelecionado.imagem_url && (
                  <img src={produtoSelecionado.imagem_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{produtoSelecionado.nome}</p>
                  <p className="text-sm text-purple-600">{formatarMoeda(produtoSelecionado.preco_promocional || produtoSelecionado.preco)}</p>
                </div>
                <button 
                  onClick={() => { setProdutoSelecionado(null); setBusca(''); }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Estilo da Imagem</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'realista', label: 'Realista', desc: 'Foto natural' },
                { value: 'editorial', label: 'Editorial', desc: 'Estilo revista' },
                { value: 'casual', label: 'Casual', desc: 'Do dia a dia' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEstilo(opt.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    estilo === opt.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">{erro}</div>
          )}

          <button
            onClick={handleProcessar}
            disabled={!foto || !produtoSelecionado || processando || !status?.configurado}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando com IA...
              </span>
            ) : (
              'Gerar Imagem Virtual'
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Resultado</h3>
            {resultado ? (
              <div className="space-y-4">
                <img src={resultado} alt="Resultado provador virtual" className="w-full rounded-xl" />
                <div className="flex gap-2">
                  <a
                    href={resultado}
                    download
                    className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium text-center hover:bg-purple-700"
                  >
                    Baixar
                  </a>
                  <button
                    onClick={() => { setResultado(null); }}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
                  >
                    Tentar Outra
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Selecione foto e produto para ver o resultado</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Como funciona</h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Envie uma foto da crianca de pe, de frente</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Escolha a roupa que deseja visualizar</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>A IA troca a roupa mantendo a pose e o rosto</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Baixe a imagem e compartilhe</span>
              </li>
            </ol>
          </div>

          {!isLogado && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <strong>Dica:</strong> Faca login para salvar seus provadores virtuais no historico.
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/loja" className="text-sm text-purple-600 hover:underline">Voltar para a Loja</Link>
      </div>
    </div>
  );
}
