'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/produtos', label: 'Produtos', icon: '📦' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '🧾' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/categorias', label: 'Categorias', icon: '🏷️' },
  { href: '/admin/cupons', label: 'Cupons', icon: '🎫' },
  { href: '/admin/avaliacoes', label: 'Avaliacoes', icon: '⭐' },
  { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { href: '/admin/seo', label: 'SEO', icon: '🔍' },
  { href: '/admin/vendedores', label: 'Vendedores', icon: '🧑‍💼' },
  { href: '/admin/relatorios', label: 'Relatorios', icon: '📈' },
  { href: '/admin/logs', label: 'Logs', icon: '📋' },
  { href: '/admin/configuracoes', label: 'Configuracoes', icon: '⚙️' },
  { href: '/admin/cron', label: 'Cron Jobs', icon: '⏰' },
];

function AdminGuard({ children }: { children: ReactNode }) {
  const { isLogado, isAdmin, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && (!isLogado || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [carregando, isLogado, isAdmin, router]);

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  }

  if (!isLogado || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Redirecionando...</div>;
  }

  return <>{children}</>;
}

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">RATAPLAM</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const ativo = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${ativo ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <span className="text-lg">🏠</span> Ver Loja
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find((m) => pathname === m.href || pathname?.startsWith(m.href + '/'))?.label || 'Admin'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminGuard>
  );
}
