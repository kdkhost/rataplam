'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Botao, Input, Toast } from '@/components/ui';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [toast, setToast] = useState('');
  const [carregando, setCarregando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      await api.post('/api/auth/esqueci-senha', { email });
      setEnviado(true);
    } catch {
      setToast('Se o e-mail estiver cadastrado, voce recebera as instrucoes.');
      setEnviado(true);
    } finally { setCarregando(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg" alt="RATAPLAM" className="h-10 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Esqueceu a senha?</h1>
          <p className="text-gray-500 mt-2 text-sm">Informe seu e-mail para redefinir sua senha</p>
        </div>

        {toast && <Toast mensagem={toast} tipo="aviso" onFechar={() => setToast('')} />}

        {enviado ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">E-mail enviado!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, voce recebera as instrucoes para redefinir sua senha.
            </p>
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-4">
            <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" />
            <Botao type="submit" disabled={carregando} className="w-full">
              {carregando ? 'Enviando...' : 'Enviar Instrucoes'}
            </Botao>
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
