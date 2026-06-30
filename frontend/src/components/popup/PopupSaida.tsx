'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface PopupSaidaProps {
  onDismiss: () => void;
}

export default function PopupSaida({ onDismiss }: PopupSaidaProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const sessionShown = sessionStorage.getItem('popup_saida_shown');
    if (sessionShown) {
      onDismiss();
      return;
    }

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [handleMouseLeave, onDismiss]);

  useEffect(() => {
    if (visible) {
      sessionStorage.setItem('popup_saida_shown', 'true');
    }
  }, [visible]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('PRIMEIRACOMPRA10');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = 'PRIMEIRACOMPRA10';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 pointer-events-auto animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="inline-block px-4 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold mb-3">
            ESPERE! Temos um presente
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ganhe 10% de desconto na sua primeira compra!
          </h2>

          <p className="text-gray-600 mb-4 text-sm">
            Use o código abaixo e economize na sua primeira compra na RATAPLAM.
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="px-4 py-2 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 font-mono text-lg font-bold text-gray-900 select-all">
              PRIMEIRACOMPRA10
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              Continuar Comprando
            </button>
            <Link
              href="/loja"
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-center text-sm"
            >
              Ir para Loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
