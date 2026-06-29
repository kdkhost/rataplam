'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface AnimatedCounterProps {
  valor: number;
  duracao?: number;
  prefixo?: string;
  sufixo?: string;
  casasDecimais?: number;
  className?: string;
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function AnimatedCounter({
  valor,
  duracao = 2000,
  prefixo = '',
  sufixo = '',
  casasDecimais = 0,
  className = '',
  tamanho = 'md',
}: AnimatedCounterProps) {
  const [valorAtual, setValorAtual] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const tamanhos = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const formatar = (v: number): string => {
    if (casasDecimais > 0) {
      return v.toFixed(casasDecimais);
    }
    return Math.round(v).toLocaleString('pt-BR');
  };

  const easing = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animar = useCallback(() => {
    if (!isVisible) return;
    const agora = Date.now();
    const elapsed = agora - startTimeRef.current;
    const progresso = Math.min(elapsed / duracao, 1);
    const eased = easing(progresso);
    setValorAtual(eased * valor);

    if (progresso < 1) {
      animFrameRef.current = requestAnimationFrame(animar);
    }
  }, [isVisible, duracao, valor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startTimeRef.current = Date.now();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      animFrameRef.current = requestAnimationFrame(animar);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, animar]);

  return (
    <span ref={ref} className={`${tamanhos[tamanho]} font-bold tabular-nums ${className}`}>
      {prefixo}{formatar(valorAtual)}{sufixo}
    </span>
  );
}
