'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface PopupBlackFridayProps {
  config: {
    popup_black_friday_ativo: boolean;
    popup_black_friday_titulo?: string;
    popup_black_friday_subtitulo?: string;
    popup_black_friday_desconto?: string;
    popup_black_friday_imagem?: string;
    popup_black_friday_data_fim?: string;
  };
  onDismiss: () => void;
}

export default function PopupBlackFriday({ config, onDismiss }: PopupBlackFridayProps) {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTimeLeft = useCallback(() => {
    if (!config.popup_black_friday_data_fim) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const end = new Date(config.popup_black_friday_data_fim).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [config.popup_black_friday_data_fim]);

  useEffect(() => {
    const dismissed = localStorage.getItem('popup_blackfriday_dismissed');
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
    localStorage.setItem('popup_blackfriday_dismissed', Date.now().toString());
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div className="text-yellow-400 text-lg opacity-60">✦</div>
            </div>
          ))}
        </div>

        {config.popup_black_friday_imagem && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={config.popup_black_friday_imagem}
              alt="Black Friday"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          </div>
        )}

        {!config.popup_black_friday_imagem && (
          <div className="h-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500" />
        )}

        <div className="relative p-6 text-center">
          <div className="inline-block px-4 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold mb-3 border border-yellow-500/30">
            BLACK FRIDAY
          </div>

          {config.popup_black_friday_desconto && (
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-2">
              {config.popup_black_friday_desconto} OFF
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-2">
            {config.popup_black_friday_titulo || 'Black Friday RATAPLAM'}
          </h2>

          <p className="text-gray-400 mb-6">
            {config.popup_black_friday_subtitulo || 'As melhores ofertas do ano!'}
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {[
              { value: timeLeft.days, label: 'Dias' },
              { value: timeLeft.hours, label: 'Horas' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Seg' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <span className="text-xl font-bold text-yellow-400">{String(item.value).padStart(2, '0')}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/loja"
            className="block w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity text-center"
          >
            Ver Ofertas de Black Friday
          </Link>
        </div>
      </div>
    </div>
  );
}
