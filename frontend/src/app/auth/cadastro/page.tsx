'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { maskCpf, maskTelefone } from '@/lib/masks';

export default function CadastroPage() {
  const router = useRouter();
  const { cadastro } = useAuth();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState({ nome: '', email: '', cpf: '', telefone: '', senha: '', confirmar_senha: '' });

  const set = (campo: string, valor: string) => setDados((prev) => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dados.senha !== dados.confirmar_senha) { setErro('As senhas não conferem'); return; }
    setCarregando(true);
    setErro('');
    try {
      await cadastro(dados);
      router.push('/');
    } catch (e: unknown) {
      setErro((e as { erro?: string }).erro || 'Erro ao criar conta');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">R</span></div>
            <span className="text-2xl font-bold text-gray-900">RATAPLAM</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-gray-500 mt-1">Preencha seus dados para se cadastrar</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {erro && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm mb-4">{erro}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input type="text" value={dados.nome} onChange={(e) => set('nome', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={dados.email} onChange={(e) => set('email', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="seu@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input type="text" value={dados.cpf} onChange={(e) => set('cpf', maskCpf(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={dados.telefone} onChange={(e) => set('telefone', maskTelefone(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={dados.senha} onChange={(e) => set('senha', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <input type="password" value={dados.confirmar_senha} onChange={(e) => set('confirmar_senha', e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" disabled={carregando}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta? <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
