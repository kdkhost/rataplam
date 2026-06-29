'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Avaliacao {
  id: number;
  usuario_nome: string;
  nota: number;
  titulo: string;
  comentario: string;
  created_at: string;
}

interface Props {
  produtoId: number;
}

function Estrelas({ nota, size = 'sm' }: { nota: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(e => (
        <svg key={e} className={`${cls} ${e <= nota ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Avaliacoes({ produtoId }: Props) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [media, setMedia] = useState(0);
  const [total, setTotal] = useState(0);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nota: 5, titulo: '', comentario: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = () => {
    fetch(`/api/produtos/${produtoId}/avaliacoes`)
      .then(r => r.json())
      .then(d => {
        if (d.sucesso) {
          setAvaliacoes(d.avaliacoes);
          setMedia(d.media || 0);
          setTotal(d.total || 0);
        }
      })
      .catch(() => {});
  };

  useEffect(() => { carregar(); }, [produtoId]);

  const enviar = async () => {
    setEnviando(true);
    setErro('');
    try {
      const res = await api.post(`/api/produtos/${produtoId}/avaliacoes`, form);
      if (res.sucesso) {
        setMostrarForm(false);
        setForm({ nota: 5, titulo: '', comentario: '' });
        carregar();
      }
    } catch (e: any) {
      setErro(e.message || 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Avaliações</h3>
        <button onClick={() => setMostrarForm(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Avaliar Produto
        </button>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="text-3xl font-bold text-gray-900">{media.toFixed(1)}</div>
          <div>
            <Estrelas nota={Math.round(media)} size="lg" />
            <p className="text-sm text-gray-500 mt-1">{total} avaliação{total !== 1 ? 'ões' : ''}</p>
          </div>
        </div>
      )}

      {mostrarForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Sua avaliação</h4>
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block">Nota</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(e => (
                <button key={e} onClick={() => setForm({ ...form, nota: e })} className="p-1">
                  <svg className={`w-8 h-8 ${e <= form.nota ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Titulo (opcional)"
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
            className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea
            placeholder="Sua avaliação..."
            value={form.comentario}
            onChange={e => setForm({ ...form, comentario: e.target.value })}
            className="w-full mb-3 px-4 py-2 border border-gray-200 rounded-lg text-sm h-24 resize-none"
          />
          {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
          <div className="flex gap-3">
            <button onClick={() => setMostrarForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={enviar} disabled={enviando} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {avaliacoes.length === 0 && (
          <p className="text-gray-500 text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
        )}
        {avaliacoes.map(a => (
          <div key={a.id} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                  {a.usuario_nome?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.usuario_nome}</p>
                  <Estrelas nota={a.nota} />
                </div>
              </div>
              <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {a.titulo && <p className="text-sm font-medium text-gray-800 mb-1">{a.titulo}</p>}
            {a.comentario && <p className="text-sm text-gray-600">{a.comentario}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
