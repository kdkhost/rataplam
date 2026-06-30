'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarDataHora } from '@/lib/api';
import { Badge, Botao, Toast } from '@/components/ui';

interface Avaliacao {
  id: number; usuario_nome: string; produto_nome: string; nota: number; titulo: string; comentario: string; aprovada: number; created_at: string;
}

export default function AdminAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await api.get('/api/admin/avaliacoes');
      setAvaliacoes(data.avaliacoes || []);
    } catch { setAvaliacoes([]); }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const aprovar = async (id: number) => {
    try { await api.put(`/api/admin/avaliacoes/${id}/aprovar`, {}); setToast('Avaliacao aprovada'); carregar(); }
    catch { setToast('Erro ao aprovar'); }
  };

  const rejeitar = async (id: number) => {
    try { await api.put(`/api/admin/avaliacoes/${id}/rejeitar`, {}); setToast('Avaliacao rejeitada'); carregar(); }
    catch { setToast('Erro ao rejeitar'); }
  };

  if (carregando) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>;

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Avaliacoes</h2>
        <p className="text-sm text-muted-foreground">{avaliacoes.length} avaliacoes no sistema</p>
      </div>

      <div className="space-y-4">
        {avaliacoes.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Nenhuma avaliacao encontrada.</p>
          </div>
        )}
        {avaliacoes.map(a => (
          <div key={a.id} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {a.usuario_nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.usuario_nome}</p>
                    <p className="text-xs text-muted-foreground">Produto: {a.produto_nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(e => (
                    <svg key={e} className={`w-4 h-4 ${e <= a.nota ? 'text-yellow-400' : 'text-muted-foreground'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">{formatarDataHora(a.created_at)}</span>
                </div>
                {a.titulo && <p className="text-sm font-medium text-foreground mb-1">{a.titulo}</p>}
                {a.comentario && <p className="text-sm text-muted-foreground">{a.comentario}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge variante={a.aprovada ? 'sucesso' : 'aviso'}>{a.aprovada ? 'Aprovada' : 'Pendente'}</Badge>
                <div className="flex gap-2">
                  {!a.aprovada && <Botao onClick={() => aprovar(a.id)} className="text-xs px-3 py-1">Aprovar</Botao>}
                  {a.aprovada ? (
                    <button onClick={() => rejeitar(a.id)} className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Rejeitar</button>
                  ) : (
                    <button onClick={() => rejeitar(a.id)} className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Rejeitar</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
