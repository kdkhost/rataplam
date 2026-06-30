'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Input, Textarea, Botao, Toast, Select } from '@/components/ui';

interface Config { [chave: string]: string; }

export default function AdminConfiguracoes() {
  const [config, setConfig] = useState<Config>({});
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState('');
  const [aba, setAba] = useState('geral');

  const carregar = useCallback(async () => {
    try {
      const data = await api.get('/api/admin/configuracoes');
      const map: Config = {};
      (data.configuracoes || []).forEach((c: { chave: string; valor: string }) => { map[c.chave] = c.valor; });
      setConfig(map);
    } catch {} finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async () => {
    try {
      const itens = Object.entries(config).map(([chave, valor]) => ({ chave, valor }));
      await api.post('/api/admin/configuracoes', { configuracoes: itens });
      setToast('Configurações salvas!');
    } catch { setToast('Erro ao salvar'); }
  };

  const set = (chave: string, valor: string) => setConfig((prev) => ({ ...prev, [chave]: valor }));

  const abas = [
    { chave: 'geral', label: 'Geral' }, { chave: 'frete', label: 'Frete' },
    { chave: 'pagamento', label: 'Pagamento' }, { chave: 'email', label: 'E-mail/SMTP' },
    { chave: 'ia', label: 'IA / Provador' },
  ];

  const campos: Record<string, { chave: string; label: string; tipo?: string }[]> = {
    geral: [
      { chave: 'nome_loja', label: 'Nome da Loja' }, { chave: 'email_loja', label: 'E-mail da Loja', tipo: 'email' },
      { chave: 'telefone_loja', label: 'Telefone' }, { chave: 'cnpj_loja', label: 'CNPJ' }, { chave: 'endereco_loja', label: 'Endereço' },
    ],
    frete: [
      { chave: 'frete_gratis_valor', label: 'Valor Mín. Frete Grátis (R$)', tipo: 'number' },
      { chave: 'frete_fixo', label: 'Frete Fixo (R$)', tipo: 'number' },
    ],
    pagamento: [
      { chave: 'mercadopago_access_token', label: 'MP Access Token' },
      { chave: 'mercadopago_public_key', label: 'MP Public Key' },
      { chave: 'stripe_secret_key', label: 'Stripe Secret Key' },
      { chave: 'stripe_publishable_key', label: 'Stripe Publishable Key' },
      { chave: 'stripe_webhook_secret', label: 'Stripe Webhook Secret' },
    ],
    email: [
      { chave: 'smtp_host', label: 'Host SMTP' }, { chave: 'smtp_porta', label: 'Porta', tipo: 'number' },
      { chave: 'smtp_criptografia', label: 'Criptografia' }, { chave: 'smtp_usuario', label: 'Usuário' },
      { chave: 'smtp_senha', label: 'Senha', tipo: 'password' }, { chave: 'smtp_de_nome', label: 'Nome Remetente' },
      { chave: 'smtp_de_email', label: 'E-mail Remetente', tipo: 'email' },
    ],
    ia: [
      { chave: 'replicate_api_token', label: 'Replicate API Token', tipo: 'password' },
    ],
  };

  if (carregando) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl" />)}</div>;

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <Botao onClick={salvar}>Salvar Configurações</Botao>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border">
        {abas.map((a) => (
          <button key={a.chave} onClick={() => setAba(a.chave)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${aba === a.chave ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {a.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(campos[aba] || []).map((c) => (
            <Input key={c.chave} label={c.label} type={c.tipo || 'text'} value={config[c.chave] || ''} onChange={(e) => set(c.chave, e.target.value)} />
          ))}
        </div>
      </div>
    </div>
  );
}
