'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { maskCpf, maskTelefone } from '@/lib/masks';
import { useState } from 'react';
import { Toast } from '@/components/ui';

export default function ContaPage() {
  const { usuario, atualizar, logout } = useAuth();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [toast, setToast] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    cpf: usuario?.cpf || '',
    telefone: usuario?.telefone || '',
  });

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await atualizar(dados);
      setEditando(false);
      setToast('Dados atualizados com sucesso!');
    } catch {
      setToast('Erro ao atualizar dados');
    } finally { setSalvando(false); }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Conta</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-1">
            <Link href="/conta" className="block px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl">Dados Pessoais</Link>
            <Link href="/conta/pedidos" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Meus Pedidos</Link>
            <Link href="/conta/enderecos" className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">Enderecos</Link>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">Sair</button>
          </nav>
        </aside>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
              <button onClick={() => setEditando(!editando)} className="text-sm text-blue-600 hover:underline">
                {editando ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" value={dados.nome} onChange={(e) => setDados((p) => ({ ...p, nome: e.target.value }))} disabled={!editando}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={dados.email} disabled className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input type="text" value={dados.cpf} onChange={(e) => setDados((p) => ({ ...p, cpf: maskCpf(e.target.value) }))} disabled={!editando}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={dados.telefone} onChange={(e) => setDados((p) => ({ ...p, telefone: maskTelefone(e.target.value) }))} disabled={!editando}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" />
              </div>
            </div>
            {editando && (
              <button onClick={handleSalvar} disabled={salvando}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
