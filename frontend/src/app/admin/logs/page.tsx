'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarDataHora } from '@/lib/api';
import { Tabela, Badge, Select, Paginacao } from '@/components/ui';

type Aba = 'webhooks' | 'emails';

interface WebhookLog {
  id: number;
  gateway: string;
  event_type: string;
  payload?: string;
  processado: number;
  erro?: string;
  created_at: string;
}

interface EmailLog {
  id: number;
  destinatario: string;
  assunto: string;
  template: string;
  status: string;
  erro?: string;
  created_at: string;
}

const statusEmailCores: Record<string, 'sucesso' | 'erro' | 'aviso' | 'info' | 'padrao'> = {
  pendente: 'aviso', enviado: 'sucesso', erro: 'erro', enviado_confirmado: 'sucesso',
};

export default function AdminLogs() {
  const [aba, setAba] = useState<Aba>('webhooks');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({ pagina: String(pagina) });
      if (filtroStatus) params.set('status', filtroStatus);

      if (aba === 'webhooks') {
        const data = await api.get(`/api/admin/logs/webhooks?${params}`);
        setWebhooks(data.logs || []);
        setTotalPaginas(data.total_paginas || 1);
      } else {
        const data = await api.get(`/api/admin/logs/emails?${params}`);
        setEmails(data.logs || []);
        setTotalPaginas(data.total_paginas || 1);
      }
    } catch {
      setWebhooks([]);
      setEmails([]);
    } finally {
      setCarregando(false);
    }
  }, [aba, pagina, filtroStatus]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => { setPagina(1); }, [aba, filtroStatus]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Logs do Sistema</h2>
        <p className="text-sm text-muted-foreground">Acompanhe webhooks e envios de e-mail</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex bg-muted rounded-xl p-1">
          {(['webhooks', 'emails'] as Aba[]).map((a) => (
            <button key={a} onClick={() => setAba(a)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${aba === a ? 'bg-card text-blue-600 shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {a === 'webhooks' ? 'Webhooks' : 'E-mails'}
            </button>
          ))}
        </div>
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full sm:w-48">
          <option value="">Todos os status</option>
          {aba === 'webhooks' ? (
            <>
              <option value="processado">Processado</option>
              <option value="pendente">Pendente</option>
              <option value="erro">Erro</option>
            </>
          ) : (
            <>
              <option value="enviado">Enviado</option>
              <option value="pendente">Pendente</option>
              <option value="erro">Erro</option>
            </>
          )}
        </Select>
      </div>

      {aba === 'webhooks' ? (
        <Tabela
          colunas={[
            { chave: 'gateway', label: 'Gateway', render: (v) => <Badge variante="info">{v as string}</Badge> },
            { chave: 'event_type', label: 'Evento', render: (v) => <span className="font-mono text-xs">{v as string}</span> },
            { chave: 'processado', label: 'Status', render: (v) => <Badge variante={v ? 'sucesso' : 'erro'}>{v ? 'Processado' : 'Pendente'}</Badge> },
            { chave: 'created_at', label: 'Data', render: (v) => formatarDataHora(v as string) },
          ]}
          dados={webhooks}
          loading={carregando}
        />
      ) : (
        <Tabela
          colunas={[
            { chave: 'destinatario', label: 'Destinatario' },
            { chave: 'assunto', label: 'Assunto' },
            { chave: 'template', label: 'Template', render: (v) => <Badge variante="padrao">{v as string}</Badge> },
            { chave: 'status', label: 'Status', render: (v) => <Badge variante={statusEmailCores[v as string] || 'padrao'}>{v as string}</Badge> },
            { chave: 'created_at', label: 'Data', render: (v) => formatarDataHora(v as string) },
          ]}
          dados={emails}
          loading={carregando}
        />
      )}

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} onMudar={setPagina} />
    </div>
  );
}
