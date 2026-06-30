'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Input, Botao, Toast } from '@/components/ui';

export default function TrocarSenhaPage() {
  const { isLogado, carregando: authCarregando } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState('');
  const [toastTipo, setToastTipo] = useState<'sucesso' | 'erro'>('sucesso');
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const novosErros: Record<string, string> = {};
    if (!form.senha_atual) novosErros.senha_atual = 'Informe a senha atual';
    if (!form.nova_senha) novosErros.nova_senha = 'Informe a nova senha';
    else if (form.nova_senha.length < 6) novosErros.nova_senha = 'Minimo de 6 caracteres';
    if (!form.confirmar_senha) novosErros.confirmar_senha = 'Confirme a nova senha';
    else if (form.nova_senha !== form.confirmar_senha) novosErros.confirmar_senha = 'As senhas nao conferem';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    try {
      await api.put('/api/auth/me', {
        senha_atual: form.senha_atual,
        password: form.nova_senha,
      });
      setToastTipo('sucesso');
      setToast('Senha alterada com sucesso!');
      setTimeout(() => router.push('/conta'), 2000);
    } catch {
      setToastTipo('erro');
      setToast('Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setSalvando(false);
    }
  };

  if (authCarregando) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="max-w-md bg-white rounded-2xl p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast mensagem={toast} tipo={toastTipo} onFechar={() => setToast('')} />}
      <div className="max-w-md">
        <Link href="/conta" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trocar Senha</h1>
        <p className="text-gray-500 mb-8">Atualize sua senha de acesso</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Senha Atual"
              type="password"
              placeholder="Digite sua senha atual"
              value={form.senha_atual}
              onChange={(e) => setForm((p) => ({ ...p, senha_atual: e.target.value }))}
              erro={erros.senha_atual}
            />
            <Input
              label="Nova Senha"
              type="password"
              placeholder="Minimo de 6 caracteres"
              value={form.nova_senha}
              onChange={(e) => setForm((p) => ({ ...p, nova_senha: e.target.value }))}
              erro={erros.nova_senha}
            />
            <Input
              label="Confirmar Nova Senha"
              type="password"
              placeholder="Digite a nova senha novamente"
              value={form.confirmar_senha}
              onChange={(e) => setForm((p) => ({ ...p, confirmar_senha: e.target.value }))}
              erro={erros.confirmar_senha}
            />
            <Botao type="submit" loading={salvando} className="w-full">
              Alterar Senha
            </Botao>
          </form>
        </div>
      </div>
    </div>
  );
}
