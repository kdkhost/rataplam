'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface VisitorStats {
  hoje: number;
  hoje_unicas: number;
  total: number;
}

interface ContadorVisitasProps {
  apiUrl?: string;
  estilo?: 'badge' | 'barra' | 'inline' | 'card';
  mostrarOnline?: boolean;
  posicao?: 'footer' | 'header' | 'sidebar';
}

export default function ContadorVisitas({
  apiUrl = '/api/visitas',
  estilo = 'badge',
  mostrarOnline = true,
  posicao = 'footer',
}: ContadorVisitasProps) {
  const [stats, setStats] = useState<VisitorStats>({ hoje: 0, hoje_unicas: 0, total: 0 });
  const [online, setOnline] = useState(0);
  const [animado, setAnimado] = useState(false);
  const [visibilidade, setVisibilidade] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>('');
  const startRef = useRef<number>(Date.now());

  const gerarSessionId = useCallback(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('rataplam_vid') : null;
    if (stored) return stored;
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    if (typeof window !== 'undefined') localStorage.setItem('rataplam_vid', id);
    return id;
  }, []);

  const registrarVisita = useCallback(async () => {
    try {
      const sessionId = gerarSessionId();
      sessionIdRef.current = sessionId;
      const res = await fetch(`${apiUrl}/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          session_id: sessionId,
          referrer: document.referrer,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          setTimeout(() => setAnimado(true), 100);
        }
      }
    } catch (e) {
      console.error('Erro ao registrar visita:', e);
    }
  }, [apiUrl, gerarSessionId]);

  const atualizarDuracao = useCallback(async () => {
    if (!sessionIdRef.current) return;
    const duracao = Math.floor((Date.now() - startRef.current) / 1000);
    const scrollPercent = Math.round(
      ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100
    );
    try {
      await fetch(`${apiUrl}/atualizar-duracao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          url: window.location.href,
          duracao,
          scroll: scrollPercent,
        }),
      });
    } catch {}
  }, [apiUrl]);

  const buscarOnline = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/online`);
      if (res.ok) {
        const data = await res.json();
        setOnline(data.online || 0);
      }
    } catch {}
  }, [apiUrl]);

  useEffect(() => {
    registrarVisita();
    buscarOnline();

    intervalRef.current = setInterval(buscarOnline, 30000);

    const handleBeforeUnload = () => {
      atualizarDuracao();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleVisibility = () => {
      setVisibilidade(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
      atualizarDuracao();
    };
  }, [registrarVisita, buscarOnline, atualizarDuracao]);

  const formatarNumero = (n: number): string => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  if (estilo === 'badge') {
    return (
      <div className={`flex items-center gap-3 text-xs text-gray-500 ${animado ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>{formatarNumero(online)} online</span>
        </div>
        <span className="text-gray-300">|</span>
        <span>{formatarNumero(stats.total)} visitas</span>
      </div>
    );
  }

  if (estilo === 'barra') {
    return (
      <div className={`flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 ${animado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} transition-all duration-500`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span>{formatarNumero(online)} agora</span>
          </div>
          <span>{formatarNumero(stats.hoje)} hoje</span>
          <span>{formatarNumero(stats.total)} total</span>
        </div>
        <span className="text-gray-400">RATAPLAM</span>
      </div>
    );
  }

  if (estilo === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-gray-400 ${animado ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
        {formatarNumero(stats.total)}
      </span>
    );
  }

  if (estilo === 'card') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm ${animado ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-500`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">Visitantes</h4>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatarNumero(online)}</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{formatarNumero(stats.hoje)}</div>
            <div className="text-xs text-gray-400">Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{formatarNumero(stats.total)}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
