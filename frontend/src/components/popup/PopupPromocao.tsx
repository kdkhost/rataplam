'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface PopupPromocaoProps {
  config: {
    popup_promocao_ativo: boolean;
    popup_promocao_titulo?: string;
    popup_promocao_subtitulo?: string;
    popup_promocao_desconto?: string;
    popup_promocao_imagem?: string;
    popup_promocao_data_fim?: string;
  };
  onDismiss: () => void;
}

export default function PopupPromocao({ config, onDismiss }: PopupPromocaoProps) {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = useCallback(() => {
    if (!config.popup_promocao_data_fim) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const end = new Date(config.popup_promocao_data_fim).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [config.popup_promocao_data_fim]);

  useEffect(() => {
    const dismissed = localStorage.getItem('popup_promocao_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        onDismiss();
        return;
      }
    }
    setVisible(true);
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) return;
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [visible, calculateTimeLeft]);

  const handleDismiss = () => {
    localStorage.setItem('popup_promocao_dismissed', Date.now().toString());
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {config.popup_promocao_imagem && (
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-violet-500 animate-gradient" />
            <img
              src={config.popup_promocao_imagem}
              alt="Promoção"
              className="relative w-full h-full object-cover"
            />
          </div>
        )}

        {!config.popup_promocao_imagem && (
          <div className="h-4 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 animate-gradient" />
        )}

        <div className="p-6 text-center">
          {config.popup_promocao_desconto && (
            <div className="inline-block px-4 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold mb-3">
              {config.popup_promocao_desconto} OFF
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {config.popup_promocao_titulo || 'Oferta Especial'}
          </h2>

          <p className="text-gray-600 mb-6">
            {config.popup_promocao_subtitulo || 'Aproveite nossa promoção por tempo limitado!'}
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {[
              { value: timeLeft.days, label: 'Dias' },
              { value: timeLeft.hours, label: 'Horas' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Seg' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{String(item.value).padStart(2, '0')}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/loja"
            className="block w-full py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-center"
          >
            Aproveitar
          </Link>
        </div>
      </div>
    </div>
  );
}
