'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  children: ReactNode;
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ aberto, onFechar, titulo, children, tamanho = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    if (aberto) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const tamanhos = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onFechar} />
      <div ref={modalRef} className={`relative bg-white rounded-2xl shadow-2xl w-full ${tamanhos[tamanho]} max-h-[90vh] overflow-hidden animate-scale-in`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <button onClick={onFechar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmarProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  variante?: 'perigo' | 'padrao';
}

export function Confirmar({ aberto, onFechar, onConfirmar, titulo, mensagem, textoConfirmar = 'Confirmar', variante = 'padrao' }: ConfirmarProps) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={titulo} tamanho="sm">
      <p className="text-gray-600 mb-6">{mensagem}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onFechar} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
        <button onClick={() => { onConfirmar(); onFechar(); }}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${variante === 'perigo' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

export function Toast({ mensagem, tipo = 'sucesso', onFechar }: { mensagem: string; tipo?: 'sucesso' | 'erro' | 'aviso'; onFechar: () => void }) {
  useEffect(() => { const t = setTimeout(onFechar, 4000); return () => clearTimeout(t); }, [onFechar]);
  const cores = { sucesso: 'bg-green-600', erro: 'bg-red-600', aviso: 'bg-yellow-500' };
  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 text-white rounded-xl shadow-lg animate-slide-down ${cores[tipo]}`}>
      {mensagem}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function Tabela({ colunas, dados, onEditar, onExcluir, loading }: {
  colunas: { chave: string; label: string; render?: (v: unknown, r: Record<string, unknown>) => ReactNode }[];
  dados: any[];
  onEditar?: (r: any) => void;
  onExcluir?: (r: any) => void;
  loading?: boolean;
}) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-50 animate-pulse">
          <div className="flex gap-4">{colunas.map((_, j) => <div key={j} className="h-4 bg-gray-200 rounded flex-1" />)}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>{colunas.map((c) => <th key={c.chave} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{c.label}</th>)}
            {(onEditar || onExcluir) && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {dados.length === 0 ? (
            <tr><td colSpan={colunas.length + 1} className="px-4 py-12 text-center text-gray-400">Nenhum registro encontrado</td></tr>
          ) : dados.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
              {colunas.map((c) => <td key={c.chave} className="px-4 py-3 text-gray-700">{c.render ? c.render(r[c.chave], r) : String(r[c.chave] ?? '')}</td>)}
              {(onEditar || onExcluir) && (
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {onEditar && <button onClick={() => onEditar(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>}
                    {onExcluir && <button onClick={() => onExcluir(r)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Paginacao({ pagina, totalPaginas, onMudar }: { pagina: number; totalPaginas: number; onMudar: (p: number) => void }) {
  if (totalPaginas <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onMudar(pagina - 1)} disabled={pagina <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Anterior</button>
      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
        const p = Math.max(1, Math.min(pagina - 2, totalPaginas - 4)) + i;
        if (p > totalPaginas) return null;
        return <button key={p} onClick={() => onMudar(p)} className={`w-9 h-9 text-sm rounded-lg ${p === pagina ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>;
      })}
      <button onClick={() => onMudar(pagina + 1)} disabled={pagina >= totalPaginas} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Próxima</button>
    </div>
  );
}

export function Badge({ children, variante = 'padrao' }: { children: ReactNode; variante?: 'padrao' | 'sucesso' | 'erro' | 'aviso' | 'info' }) {
  const cores = { padrao: 'bg-gray-100 text-gray-700', sucesso: 'bg-green-100 text-green-700', erro: 'bg-red-100 text-red-700', aviso: 'bg-yellow-100 text-yellow-700', info: 'bg-blue-100 text-blue-700' };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cores[variante]}`}>{children}</span>;
}

export function CampoFormulario({ label, erro, children, ...props }: { label: string; erro?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  );
}

export function Botao({ children, variante = 'primario', tamanho = 'md', loading, ...props }: {
  children: ReactNode; variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma';
  tamanho?: 'sm' | 'md' | 'lg'; loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantes = {
    primario: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secundario: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    perigo: 'bg-red-600 text-white hover:bg-red-700',
    fantasma: 'text-gray-600 hover:bg-gray-100',
  };
  const tamanhos = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button {...props} disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all ${variantes[variante]} ${tamanhos[tamanho]} disabled:opacity-50`}>
      {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
      {children}
    </button>
  );
}

export function Input({ label, erro, className = '', ...props }: { label?: string; erro?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input {...props} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${erro ? 'border-red-300' : 'border-gray-300'} ${className}`} />
      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  );
}

export function Select({ label, erro, children, className = '', ...props }: { label?: string; erro?: string; className?: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select {...props} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${erro ? 'border-red-300' : 'border-gray-300'} ${className}`}>
        {children}
      </select>
      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  );
}

export function Textarea({ label, erro, className = '', ...props }: { label?: string; erro?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea {...props} className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${erro ? 'border-red-300' : 'border-gray-300'} ${className}`} />
      {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
    </div>
  );
}
