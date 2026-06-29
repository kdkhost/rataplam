'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { maskCpf, maskTelefone } from '@/lib/masks';
import { useState } from 'react';
import { Toast, Confirmar } from '@/components/ui';

export default function ContaPage() {
  const { usuario, atualizar, logout } = useAuth();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [toast, setToast] = useState('');
  const [tipoToast, setTipoToast] = useState<'sucesso' | 'erro'>('sucesso');
  const [salvando, setSalvando] = useState(false);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
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
      setTipoToast('sucesso');
    } catch {
      setToast('Erro ao atualizar dados');
      setTipoToast('erro');
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const menuItems = [
    { href: '/conta', label: 'Dados Pessoais', ativo: true, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { href: '/conta/pedidos', label: 'Meus Pedidos', ativo: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { href: '/conta/enderecos', label: 'Endereços', ativo: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )},
    { href: '/conta/favoritos', label: 'Favoritos', ativo: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    )},
    { href: '/conta/trocar-senha', label: 'Trocar Senha', ativo: false, icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast mensagem={toast} tipo={tipoToast} onFechar={() => setToast('')} />}
      <Confirmar
        aberto={confirmarLogout}
        onFechar={() => setConfirmarLogout(false)}
        onConfirmar={handleLogout}
        titulo="Sair da conta"
        mensagem="Tem certeza que deseja sair da sua conta?"
        textoConfirmar="Sair"
        variante="perigo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
          <p className="text-gray-500 mt-1">Gerencie seus dados pessoais e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                      item.ativo
                        ? 'bg-rose-50 text-rose-600 rounded-xl'
                        : 'text-gray-600 hover:bg-gray-50 rounded-xl'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setConfirmarLogout(true)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sair da conta
                </button>
              </div>
            </nav>
          </aside>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Atualize suas informações de perfil</p>
                  </div>
                  <button
                    onClick={() => {
                      if (editando) {
                        setDados({
                          nome: usuario?.nome || '',
                          email: usuario?.email || '',
                          cpf: usuario?.cpf || '',
                          telefone: usuario?.telefone || '',
                        });
                      }
                      setEditando(!editando);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    {editando ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Cancelar
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Editar
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                    <input
                      type="text"
                      value={dados.nome}
                      onChange={(e) => setDados((p) => ({ ...p, nome: e.target.value }))}
                      disabled={!editando}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input
                      type="email"
                      value={dados.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">O e-mail não pode ser alterado</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                    <input
                      type="text"
                      value={dados.cpf}
                      onChange={(e) => setDados((p) => ({ ...p, cpf: maskCpf(e.target.value) }))}
                      disabled={!editando}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                    <input
                      type="text"
                      value={dados.telefone}
                      onChange={(e) => setDados((p) => ({ ...p, telefone: maskTelefone(e.target.value) }))}
                      disabled={!editando}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {editando && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={handleSalvar}
                      disabled={salvando}
                      className="py-3 px-6 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {salvando ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
