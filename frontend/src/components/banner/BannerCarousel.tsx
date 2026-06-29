'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Banner {
  id: number;
  titulo: string;
  subtitulo: string;
  imagem: string;
  link: string;
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then(d => d.sucesso && setBanners(d.banners || []))
      .catch(() => {});
  }, []);

  const proximo = useCallback(() => {
    if (banners.length === 0) return;
    setAtual(a => (a + 1) % banners.length);
  }, [banners.length]);

  const anterior = useCallback(() => {
    if (banners.length === 0) return;
    setAtual(a => (a - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(proximo, 5000);
    return () => clearInterval(timer);
  }, [banners.length, proximo]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-gray-900">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === atual ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent z-10" />
          <img
            src={banner.imagem}
            alt={banner.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">{banner.titulo}</h2>
              <p className="text-lg text-gray-200 mb-6">{banner.subtitulo}</p>
              {banner.link && (
                <Link href={banner.link} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block">
                  Confira
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={anterior} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={proximo} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setAtual(i)} className={`w-2 h-2 rounded-full transition-colors ${i === atual ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
