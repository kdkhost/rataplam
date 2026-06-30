'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface PreloaderConfig {
  preloader_tipo?: 'pontos' | 'logo' | 'barra';
  preloader_cor?: string;
  preloader_texto?: string;
}

export default function Preloader() {
  const [config, setConfig] = useState<PreloaderConfig>({});
  const [show, setShow] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.get('/api/admin/configuracoes');
        const map: Record<string, string> = {};
        (data.configuracoes || []).forEach((c: { chave: string; valor: string }) => {
          map[c.chave] = c.valor;
        });
        setConfig({
          preloader_tipo: (map.preloader_tipo as any) || 'logo',
          preloader_cor: map.preloader_cor || '#ec4899',
          preloader_texto: map.preloader_texto || 'Carregando...',
        });
      } catch {
        setConfig({ preloader_tipo: 'logo', preloader_cor: '#ec4899', preloader_texto: 'Carregando...' });
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      setTimeout(() => setShow(false), 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const cor = config.preloader_cor || '#ec4899';
  const tipo = config.preloader_tipo || 'logo';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'white', background: 'white' }}
    >
      <div className="flex flex-col items-center gap-6">
        {tipo === 'pontos' && (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: cor,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
        )}
        {tipo === 'barra' && (
          <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full animate-pulse"
              style={{ backgroundColor: cor, width: '100%' }}
            />
          </div>
        )}
        {tipo === 'logo' && (
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center animate-pulse"
              style={{
                background: `linear-gradient(135deg, ${cor}, #8b5cf6)`,
              }}
            >
              <span className="text-3xl font-black text-white">R</span>
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ backgroundColor: cor }} />
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-10" style={{ backgroundColor: cor, animationDelay: '0.5s' }} />
          </div>
        )}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{config.preloader_texto}</p>
      </div>
      <style jsx global>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
}