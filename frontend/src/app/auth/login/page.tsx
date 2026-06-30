'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const emailSalvo = localStorage.getItem('rataplam_email_lembrar');
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    try {
      if (lembrarMe) {
        localStorage.setItem('rataplam_email_lembrar', email);
      } else {
        localStorage.removeItem('rataplam_email_lembrar');
      }
      const data = await login(email, senha);
      // Admin vai direto para o painel
      if (data?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch {
      setErro('E-mail ou senha inválidos');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img src="https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg" alt="RATAPLAM" className="h-12 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-gray-500 mt-1">Entre na sua conta para continuar</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {erro && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{erro}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Sua senha" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" checked={lembrarMe} onChange={(e) => setLembrarMe(e.target.checked)} />
                <span className="text-gray-600">Lembrar-me</span>
              </label>
              <Link href="/auth/esqueci-senha" className="text-blue-600 hover:underline">Esqueci a senha</Link>
            </div>
            <button type="submit" disabled={carregando}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta? <Link href="/auth/cadastro" className="text-blue-600 font-medium hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
