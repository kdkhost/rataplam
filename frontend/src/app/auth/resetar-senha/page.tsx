'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Botao, Input, Toast } from '@/components/ui';

function ResetarSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [toast, setToast] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link invalido</h1>
          <p className="text-gray-500 mb-6">O link de redefinicao de senha e invalido ou expirado.</p>
          <Link href="/auth/esqueci-senha" className="text-blue-600 hover:underline">Solicitar novo link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha.length < 6) {
      setErro('A senha deve ter no minimo 6 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas nao conferem');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/api/auth/resetar-senha', { token, senha });
      setSucesso(true);
      setToast('Senha redefinida com sucesso!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (e: unknown) {
      setErro((e as { erro?: string }).erro || 'Erro ao redefinir senha');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg" alt="RATAPLAM" className="h-12 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Redefinir Senha</h1>
          <p className="text-gray-500 mt-1">Digite sua nova senha</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {sucesso ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-green-700 font-medium">Senha redefinida com sucesso!</p>
              <p className="text-sm text-gray-500 mt-2">Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{erro}</div>}
              <Input label="Nova Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} placeholder="Minimo 6 caracteres" />
              <Input label="Confirmar Senha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required placeholder="Repita a senha" />
              <Botao type="submit" disabled={carregando} className="w-full">
                {carregando ? 'Redefinindo...' : 'Redefinir Senha'}
              </Botao>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Voltar para o login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <ResetarSenhaForm />
    </Suspense>
  );
}
