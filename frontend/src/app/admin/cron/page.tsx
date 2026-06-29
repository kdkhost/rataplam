'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarDataHora } from '@/lib/api';
import { Badge, Botao, Toast } from '@/components/ui';

interface CronJob {
  id: number; nome: string; descricao: string; expressao_cron: string;
  ultimo_execucao: string | null; proxima_execucao: string | null;
  status: string; ativo: number;
}
interface CronLog {
  id: number; job_nome: string; inicio: string; fim: string | null;
  status: string; mensagem: string;
}

export default function AdminCron() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');
  const [executando, setExecutando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const data = await api.get('/api/admin/cron');
      setJobs(data.jobs || []);
      setLogs(data.logs || []);
    } catch { /* empty */ }
    finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const executarTodos = async () => {
    setExecutando(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/cron/executar`);
      const data = await res.json();
      setToast(`${data.executados} jobs executados`);
      carregar();
    } catch { setToast('Erro ao executar cron'); }
    finally { setExecutando(false); }
  };

  const toggleJob = async (id: number) => {
    try {
      await api.post(`/api/admin/cron/${id}`, {});
      carregar();
    } catch { setToast('Erro ao alterar job'); }
  };

  const executarJob = async (id: number) => {
    try {
      await api.put(`/api/admin/cron/${id}`, {});
      setToast('Job executado');
      carregar();
    } catch { setToast('Erro ao executar job'); }
  };

  const statusBadge = (s: string) => {
    const v: Record<string, 'sucesso' | 'erro' | 'aviso' | 'info' | 'padrao'> = {
      concluido: 'sucesso', erro: 'erro', executando: 'info', pendente: 'aviso',
    };
    return <Badge variante={v[s] || 'padrao'}>{s}</Badge>;
  };

  if (carregando) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>;

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cron Jobs</h2>
          <p className="text-sm text-gray-500">Tarefas agendadas do sistema</p>
        </div>
        <Botao onClick={executarTodos} disabled={executando}>
          {executando ? 'Executando...' : 'Executar Todos Agora'}
        </Botao>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descricao</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cron</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ultima Execucao</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Proxima</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{job.nome}</td>
                <td className="px-4 py-3 text-gray-500">{job.descricao}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{job.expressao_cron}</td>
                <td className="px-4 py-3">{statusBadge(job.status)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.ultimo_execucao ? formatarDataHora(job.ultimo_execucao) : '-'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{job.proxima_execucao ? formatarDataHora(job.proxima_execucao) : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => executarJob(job.id)} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">Executar</button>
                    <button onClick={() => toggleJob(job.id)} className={`text-xs px-2 py-1 rounded ${job.ativo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                      {job.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs Recentes</h3>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Job</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inicio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fim</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum log ainda</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{log.job_nome}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatarDataHora(log.inicio)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{log.fim ? formatarDataHora(log.fim) : '-'}</td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{log.mensagem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
