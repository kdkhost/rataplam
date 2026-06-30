'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Tema = 'claro' | 'escuro';

interface TemaContextType {
  tema: Tema;
  alternarTema: () => void;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('tema') as Tema | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'escuro' : 'claro');
    setTema(initial);
    document.documentElement.classList.toggle('dark', initial === 'escuro');
  }, []);

  const alternarTema = () => {
    const novo = tema === 'claro' ? 'escuro' : 'claro';
    setTema(novo);
    localStorage.setItem('tema', novo);
    document.documentElement.classList.toggle('dark', novo === 'escuro');
  };

  if (!mounted) return <>{children}</>;

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const context = useContext(TemaContext);
  if (!context) throw new Error('useTema deve ser usado dentro de TemaProvider');
  return context;
}