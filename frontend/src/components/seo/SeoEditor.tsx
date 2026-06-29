'use client';

import { useState, useCallback } from 'react';

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

interface PreviewRedeSocial {
  titulo: string;
  descricao: string;
  imagem: string;
  url: string;
  dominio: string;
}

interface SeoPreviewProps {
  dados: SeoData;
  onChange: (dados: Partial<SeoData>) => void;
  onCalcularScore: () => void;
}

function ScoreCircular({ score }: { score: number }) {
  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (score / 100) * circunferencia;

  const cor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';
  const texto = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Precisa Melhorar';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={raio} fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={raio} fill="none" stroke={cor} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circunferencia} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: cor }}>{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium mt-2" style={{ color: cor }}>{texto}</span>
    </div>
  );
}

function GooglePreview({ titulo, descricao, url }: { titulo: string; descricao: string; url: string }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="text-xs text-gray-500 mb-1">Prévia no Google</div>
      <div className="space-y-1">
        <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
          {titulo || 'Título da Página'}
        </div>
        <div className="text-green-700 text-sm">{url || 'https://rataplam.com.br'}</div>
        <div className="text-gray-600 text-sm line-clamp-2">
          {descricao || 'Descrição da página que aparece nos resultados de busca...'}
        </div>
      </div>
    </div>
  );
}

function FacebookPreview({ titulo, descricao, imagem, dominio, url }: PreviewRedeSocial) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="text-xs text-gray-500 p-3 pb-1">Prévia no Facebook</div>
      <div className="border-t border-gray-200">
        {imagem && (
          <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={imagem} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div className="p-3">
          <div className="text-xs text-gray-500 uppercase">{dominio || 'rataplam.com.br'}</div>
          <div className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
            {titulo || 'Título da Página'}
          </div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {descricao || 'Descrição da página para redes sociais...'}
          </div>
        </div>
      </div>
    </div>
  );
}

function TwitterPreview({ titulo, descricao, imagem, card }: PreviewRedeSocial & { card: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="text-xs text-gray-500 p-3 pb-1">Prévia no Twitter/X</div>
      <div className="border-t border-gray-200">
        {imagem && (
          <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={imagem} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div className="p-3">
          <div className="text-sm font-semibold text-gray-900 line-clamp-2">
            {titulo || 'Título da Página'}
          </div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-3">
            {descricao || 'Descrição da página para Twitter...'}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedinPreview({ titulo, descricao, imagem, url }: PreviewRedeSocial & { dominio?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="text-xs text-gray-500 p-3 pb-1">Prévia no LinkedIn</div>
      <div className="border-t border-gray-200">
        {imagem && (
          <div className="relative h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
            <img src={imagem} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
        <div className="p-3">
          <div className="text-sm font-semibold text-gray-900 line-clamp-2">
            {titulo || 'Título da Página'}
          </div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {descricao || 'Descrição da página...'}
          </div>
          <div className="text-xs text-gray-400 mt-2">{url || 'rataplam.com.br'}</div>
        </div>
      </div>
    </div>
  );
}

function DicaItem({ nivel, mensagem }: { nivel: string; mensagem: string }) {
  const cores: Record<string, string> = {
    critico: 'bg-red-50 text-red-700 border-red-200',
    erro: 'bg-red-50 text-red-600 border-red-200',
    aviso: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    dica: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const icones: Record<string, string> = {
    critico: '🔴',
    erro: '❌',
    aviso: '⚠️',
    dica: '💡',
  };

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${cores[nivel] || cores.dica}`}>
      <span className="text-sm">{icones[nivel] || '💡'}</span>
      <span className="text-sm">{mensagem}</span>
    </div>
  );
}

export default function SeoEditor({ dados, onChange, onCalcularScore }: SeoPreviewProps) {
  const [abaAtiva, setAbaAtiva] = useState<'editor' | 'preview'>('editor');
  const [redeAtiva, setRedeAtiva] = useState<'google' | 'facebook' | 'twitter' | 'linkedin'>('google');
  const [dicas, setDicas] = useState<Array<{ nivel: string; mensagem: string }>>([]);
  const [score, setScore] = useState(dados.score_seo || 0);
  const [calculando, setCalculando] = useState(false);

  const calcularScoreLocal = useCallback(async () => {
    setCalculando(true);
    try {
      const res = await fetch('/api/seo/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setDicas(data.dicas || []);
      }
    } catch (e) {
      console.error('Erro ao calcular score:', e);
    } finally {
      setCalculando(false);
    }
  }, [dados]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAbaAtiva('editor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'editor' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setAbaAtiva('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${abaAtiva === 'preview' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Prévia
          </button>
        </div>
        <button
          onClick={calcularScoreLocal}
          disabled={calculando}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {calculando ? 'Calculando...' : 'Calcular Score'}
        </button>
      </div>

      <div className="p-6">
        {abaAtiva === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                <input
                  type="text"
                  value={dados.titulo}
                  onChange={(e) => onChange({ titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Título otimizado para buscadores"
                />
                <div className="text-xs text-gray-400 mt-1">{dados.titulo.length}/60 caracteres</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descrição</label>
                <textarea
                  value={dados.descricao}
                  onChange={(e) => onChange({ descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição que aparece nos resultados de busca"
                />
                <div className="text-xs text-gray-400 mt-1">{dados.descricao.length}/160 caracteres</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
                <input
                  type="text"
                  value={dados.keywords}
                  onChange={(e) => onChange({ keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="roupas infantis, roupas de bebê, macacão"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Canônica</label>
                <input
                  type="url"
                  value={dados.canonical_url}
                  onChange={(e) => onChange({ canonical_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://rataplam.com.br/pagina"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Robots</label>
                <select
                  value={dados.robots}
                  onChange={(e) => onChange({ robots: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="index, follow">Indexar e seguir</option>
                  <option value="noindex, nofollow">Não indexar</option>
                  <option value="index, nofollow">Indexar, não seguir</option>
                  <option value="noindex, follow">Não indexar, seguir</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Open Graph</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={dados.og_titulo}
                    onChange={(e) => onChange({ og_titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Título para redes sociais"
                  />
                  <textarea
                    value={dados.og_descricao}
                    onChange={(e) => onChange({ og_descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Descrição para redes sociais"
                  />
                  <input
                    type="url"
                    value={dados.og_imagem}
                    onChange={(e) => onChange({ og_imagem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="URL da imagem OG (1200x630)"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Twitter Card</h4>
                <div className="space-y-3">
                  <select
                    value={dados.twitter_card}
                    onChange={(e) => onChange({ twitter_card: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="summary">Summary</option>
                  </select>
                  <input
                    type="text"
                    value={dados.twitter_titulo}
                    onChange={(e) => onChange({ twitter_titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Título para Twitter"
                  />
                  <textarea
                    value={dados.twitter_descricao}
                    onChange={(e) => onChange({ twitter_descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Descrição para Twitter"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-6">
              <ScoreCircular score={score} />
            </div>

            <div className="flex items-center gap-2 mb-4 justify-center">
              {(['google', 'facebook', 'twitter', 'linkedin'] as const).map((rede) => (
                <button
                  key={rede}
                  onClick={() => setRedeAtiva(rede)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${redeAtiva === rede ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {rede}
                </button>
              ))}
            </div>

            <div className="max-w-xl mx-auto">
              {redeAtiva === 'google' && (
                <GooglePreview titulo={dados.titulo} descricao={dados.descricao} url={dados.canonical_url || 'https://rataplam.com.br'} />
              )}
              {redeAtiva === 'facebook' && (
                <FacebookPreview
                  titulo={dados.og_titulo || dados.titulo}
                  descricao={dados.og_descricao || dados.descricao}
                  imagem={dados.og_imagem}
                  dominio="rataplam.com.br"
                  url={dados.canonical_url || 'https://rataplam.com.br'}
                />
              )}
              {redeAtiva === 'twitter' && (
                <TwitterPreview
                  titulo={dados.twitter_titulo || dados.titulo}
                  descricao={dados.twitter_descricao || dados.descricao}
                  imagem={dados.twitter_imagem || dados.og_imagem}
                  card={dados.twitter_card}
                  dominio="rataplam.com.br"
                  url={dados.canonical_url || 'https://rataplam.com.br'}
                />
              )}
              {redeAtiva === 'linkedin' && (
                <LinkedinPreview
                  titulo={dados.og_titulo || dados.titulo}
                  descricao={dados.og_descricao || dados.descricao}
                  imagem={dados.og_imagem}
                  url={dados.canonical_url || 'https://rataplam.com.br'}
                  dominio="rataplam.com.br"
                />
              )}
            </div>

            {dicas.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Dicas de Melhoria</h4>
                {dicas.map((dica, i) => (
                  <DicaItem key={i} nivel={dica.nivel} mensagem={dica.mensagem} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
