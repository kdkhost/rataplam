'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCarrinho } from '@/lib/carrinho';

export default function Header() {
  const { usuario, isLogado, isAdmin, logout } = useAuth();
  const { totalItens } = useCarrinho();
  const [menuAberto, setMenuAberto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const router = useRouter();

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(busca.trim())}`);
      setBusca('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">RATAPLAM</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/loja" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Loja</Link>
              <Link href="/loja?genero=M" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Meninos</Link>
              <Link href="/loja?genero=F" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Meninas</Link>
              <Link href="/loja?faixa=0-a-1" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Bebs</Link>
            </nav>
          </div>

          <form onSubmit={handleBusca} className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition" />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Link href="/carrinho" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItens > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItens > 9 ? '9+' : totalItens}
                </span>
              )}
            </Link>

            {isLogado ? (
              <div className="relative">
                <button onClick={() => setMenuAberto(!menuAberto)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-bold">{usuario?.nome?.charAt(0)}</span>
                  </div>
                  <span className="hidden sm:block">{usuario?.nome?.split(' ')[0]}</span>
                </button>
                {menuAberto && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{usuario?.nome}</p>
                        <p className="text-xs text-gray-500">{usuario?.email}</p>
                      </div>
                      <Link href="/conta" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuAberto(false)}>Minha Conta</Link>
                      <Link href="/conta/pedidos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuAberto(false)}>Meus Pedidos</Link>
                      <Link href="/conta/enderecos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuAberto(false)}>Enderecos</Link>
                      {isAdmin && <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50" onClick={() => setMenuAberto(false)}>Painel Admin</Link>}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setMenuAberto(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sair</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                Entrar
              </Link>
            )}

            <button onClick={() => setMobileAberto(!mobileAberto)} className="md:hidden p-2 text-gray-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileAberto ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileAberto && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-slide-down">
            <form onSubmit={handleBusca} className="px-2 pb-2">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produtos..."
                className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
            </form>
            <Link href="/loja" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileAberto(false)}>Loja</Link>
            <Link href="/loja?genero=M" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileAberto(false)}>Meninos</Link>
            <Link href="/loja?genero=F" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileAberto(false)}>Meninas</Link>
            <Link href="/contato" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileAberto(false)}>Contato</Link>
            <Link href="/sobre" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl" onClick={() => setMobileAberto(false)}>Sobre</Link>
            {isAdmin && <Link href="/admin/dashboard" className="block px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => setMobileAberto(false)}>Admin</Link>}
          </div>
        )}
      </div>
    </header>
  );
}
