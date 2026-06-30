'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PreloaderContextType {
  preloaderAtivo: boolean;
  ocultarPreloader: () => void;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [preloaderAtivo, setPreloaderAtivo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloaderAtivo(false);
    }, 1500);

    const handleLoad = () => {
      clearTimeout(timer);
      setPreloaderAtivo(false);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const ocultarPreloader = () => setPreloaderAtivo(false);

  return (
    <PreloaderContext.Provider value={{ preloaderAtivo, ocultarPreloader }}>
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  const context = useContext(PreloaderContext);
  if (!context) throw new Error('usePreloader deve ser usado dentro de PreloaderProvider');
  return context;
}