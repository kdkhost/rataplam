'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useCarrinho } from '@/lib/carrinho';

const LOGO_URL = 'https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg';

const categoriasLoja = [
  { label: 'Todos', href: '/loja' },
  { label: 'Macacoes', href: '/loja?categoria=macacoes' },
  { label: 'Bermudas', href: '/loja?categoria=bermudas' },
  { label: 'Blusas', href: '/loja?categoria=blusas' },
  { label: 'Biquinis', href: '/loja?categoria=biquinis' },
  { label: 'Vestidos', href: '/loja?categoria=vestidos' },
  { label: 'Calcas', href: '/loja?categoria=calcas' },
  { label: 'Acessorios', href: '/loja?categoria=acessorios' },
];

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/loja', label: 'Loja', hasDropdown: true },
  { href: '/loja?genero=M', label: 'Masculino' },
  { href: '/loja?genero=F', label: 'Feminino' },
  { href: '/blog', label: 'Blog' },
  { href: '/contato', label: 'Contato' },
];

export default function Header() {
  const { usuario, isLogado, isAdmin, logout } = useAuth();
  const { totalItens } = useCarrinho();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileAberto, setMobileAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [lojaDropdown, setLojaDropdown] = useState(false);

  const buscaInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lojaDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (buscaAberta && buscaInputRef.current) buscaInputRef.current.focus();
  }, [buscaAberta]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuAberto(false);
      if (lojaDropdownRef.current && !lojaDropdownRef.current.contains(e.target as Node)) setLojaDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileAberto(false);
    setBuscaAberta(false);
    setUserMenuAberto(false);
    setLojaDropdown(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileAberto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileAberto]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/loja?busca=${encodeURIComponent(busca.trim())}`);
      setBusca('');
      setBuscaAberta(false);
      setMobileAberto(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    const basePath = href.split('?')[0];
    return pathname === basePath || pathname.startsWith(basePath + '/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-[0_1px_20px_rgba(7,140,251,0.08)]'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center gap-10">
              <button
                onClick={() => setMobileAberto(!mobileAberto)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-brand-blue-light transition-all"
                aria-label="Menu"
              >
                <div className="w-5 h-4 relative flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${mobileAberto ? 'rotate-45 translate-y-[7px]' : ''}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileAberto ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${mobileAberto ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                </div>
              </button>

              <Link href="/" className="relative shrink-0 group -my-3 z-10" aria-label="RATAPLAM - Pagina inicial">
                {LOGO_URL ? (
                  <img src={LOGO_URL} alt="RATAPLAM" className="h-14 w-auto group-hover:opacity-80 transition-opacity" />
                ) : (
                  <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-brand-blue transition-colors">RATAPLAM</span>
                )}
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    const active = pathname === '/loja' || pathname.startsWith('/loja');
                    return (
                      <div key={link.href} className="relative" ref={lojaDropdownRef}>
                        <button
                          onClick={() => setLojaDropdown(!lojaDropdown)}
                          onMouseEnter={() => setLojaDropdown(true)}
                          className={`flex items-center gap-1 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            active
                              ? 'text-brand-blue bg-brand-blue-light'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${lojaDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {lojaDropdown && (
                          <div
                            className="absolute left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100/80 py-2 z-50 animate-fade-in"
                            onMouseLeave={() => setLojaDropdown(false)}
                          >
                            {categoriasLoja.map((cat) => (
                              <Link
                                key={cat.href}
                                href={cat.href}
                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-blue-light hover:text-brand-blue transition-colors"
                                onClick={() => setLojaDropdown(false)}
                              >
                                {cat.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        active
                          ? 'text-brand-blue bg-brand-blue-light'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-blue rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setBuscaAberta(!buscaAberta)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-brand-blue hover:bg-brand-blue-light transition-all"
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <div className="hidden lg:block relative" ref={userMenuRef}>
                {isLogado ? (
                  <>
                    <button
                      onClick={() => setUserMenuAberto(!userMenuAberto)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                      aria-label="Menu do usuario"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center ring-2 ring-white shadow-sm">
                        <span className="text-white text-xs font-bold">{usuario?.nome?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium max-w-[100px] truncate">{usuario?.nome?.split(' ')[0]}</span>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${userMenuAberto ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {userMenuAberto && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 py-2 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{usuario?.nome}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{usuario?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/conta" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuAberto(false)}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Minha Conta
                          </Link>
                          <Link href="/conta/pedidos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuAberto(false)}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            Meus Pedidos
                          </Link>
                          <Link href="/conta/enderecos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setUserMenuAberto(false)}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Enderecos
                          </Link>
                        </div>
                        {isAdmin && (
                          <div className="py-1 border-t border-gray-100">
                            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-blue hover:bg-brand-blue-light transition-colors" onClick={() => setUserMenuAberto(false)}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              Painel Admin
                            </Link>
                          </div>
                        )}
                        <div className="py-1 border-t border-gray-100">
                          <button onClick={() => { logout(); setUserMenuAberto(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Sair da conta
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Entrar
                  </Link>
                )}
              </div>

              <Link
                href="/carrinho"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-brand-pink hover:bg-brand-pink-light transition-all"
                aria-label="Carrinho"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {totalItens > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-brand-pink to-brand-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                    {totalItens > 99 ? '99+' : totalItens}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${buscaAberta ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <form onSubmit={handleBusca} className="relative">
              <input
                ref={buscaInputRef}
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:bg-white outline-none transition-all"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>
        </div>
      </header>

      {buscaAberta && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm hidden lg:block" onClick={() => setBuscaAberta(false)} />
      )}

      <div className={`fixed top-16 left-0 right-0 z-40 hidden lg:block transition-all duration-300 ease-in-out ${buscaAberta ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
          <form onSubmit={handleBusca} className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="O que voce esta procurando?"
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none shadow-xl transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      </div>

      {mobileAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileAberto(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[min(320px,85vw)] bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                {LOGO_URL ? (
                  <img src={LOGO_URL} alt="RATAPLAM" className="h-8 w-auto" />
                ) : (
                  <span className="text-lg font-extrabold text-gray-900">RATAPLAM</span>
                )}
              </div>
              <button
                onClick={() => setMobileAberto(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBusca} className="px-5 pt-4 pb-2">
              <div className="relative">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    const active = pathname === '/loja' || pathname.startsWith('/loja');
                    return (
                      <div key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            active
                              ? 'text-brand-blue bg-brand-blue-light'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileAberto(false)}
                        >
                          {link.label}
                        </Link>
                        <div className="ml-4 mt-1 space-y-0.5">
                          {categoriasLoja.slice(1).map((cat) => (
                            <Link
                              key={cat.href}
                              href={cat.href}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-brand-blue hover:bg-brand-blue-light transition-colors"
                              onClick={() => setMobileAberto(false)}
                            >
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'text-brand-blue bg-brand-blue-light'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileAberto(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="my-4 border-t border-gray-100" />

              {isLogado ? (
                <div className="space-y-1">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center ring-2 ring-white shadow-sm">
                      <span className="text-white text-sm font-bold">{usuario?.nome?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{usuario?.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
                    </div>
                  </div>
                  <Link href="/conta" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" onClick={() => setMobileAberto(false)}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Minha Conta
                  </Link>
                  <Link href="/conta/pedidos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" onClick={() => setMobileAberto(false)}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Meus Pedidos
                  </Link>
                  <Link href="/conta/enderecos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all" onClick={() => setMobileAberto(false)}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Enderecos
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-blue hover:bg-brand-blue-light transition-all" onClick={() => setMobileAberto(false)}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Painel Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setMobileAberto(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-1">
                  <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-brand-blue-dark hover:to-brand-blue shadow-md shadow-brand-blue/20 transition-all" onClick={() => setMobileAberto(false)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    Entrar
                  </Link>
                  <Link href="/auth/cadastro" className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-brand-blue bg-brand-blue-light hover:bg-brand-blue/10 transition-all" onClick={() => setMobileAberto(false)}>
                    Criar conta
                  </Link>
                </div>
              )}
            </nav>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-center text-gray-400">RATAPLAM &copy; 2026</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
