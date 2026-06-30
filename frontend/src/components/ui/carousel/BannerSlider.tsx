'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: string;
  imagem: string;
  titulo?: string;
  subtitulo?: string;
  link?: string;
  botaoTexto?: string;
  corOverlay?: string;
  posicaoTexto?: 'left' | 'center' | 'right';
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  altura?: 'sm' | 'md' | 'lg' | 'full';
}

const alturaMap = {
  sm: 'h-64 md:h-80',
  md: 'h-80 md:h-96 lg:h-[500px]',
  lg: 'h-96 md:h-[550px] lg:h-[600px]',
  full: 'h-[70vh] min-h-[500px]',
};

export default function BannerSlider({
  banners,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className = '',
  altura = 'lg',
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalBanners = banners.length;

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  useEffect(() => {
    if (autoPlay && totalBanners > 1) {
      autoPlayRef.current = setInterval(() => {
        if (!isHovered) next();
      }, interval);
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [autoPlay, interval, next, totalBanners, isHovered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${alturaMap[altura]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Carousel de banners"
    >
      <div
        ref={containerRef}
        className="flex transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className="flex-shrink-0 w-full relative"
            style={{ width: '100%' }}
          >
            <Image
              src={banner.imagem}
              alt={banner.titulo || `Banner ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover duration-1000"
              sizes="100vw"
              style={{
                animation: index === currentIndex ? 'kenBurns 12s ease-out forwards' : 'none',
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r"
              style={{
                background: banner.corOverlay || 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2))',
              }}
            />
            {(banner.titulo || banner.subtitulo || banner.botaoTexto) && (
              <div
                className="absolute inset-0 flex items-center px-8"
                style={{
                  justifyContent:
                    banner.posicaoTexto === 'left'
                      ? 'flex-start'
                      : banner.posicaoTexto === 'right'
                      ? 'flex-end'
                      : 'center',
                  textAlign:
                    banner.posicaoTexto === 'left'
                      ? 'left'
                      : banner.posicaoTexto === 'right'
                      ? 'right'
                      : 'center',
                }}
              >
                <div className="max-w-2xl w-full text-white animate-fade-in-up">
                  {banner.titulo && (
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight drop-shadow-lg">
                      {banner.titulo}
                    </h2>
                  )}
                  {banner.subtitulo && (
                    <p className="text-lg md:text-xl mb-6 leading-relaxed drop-shadow-md">
                      {banner.subtitulo}
                    </p>
                  )}
                  {banner.botaoTexto && banner.link && (
                    <Link
                      href={banner.link}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:bg-rose-50 transition-all shadow-2xl shadow-rose-900/30 hover:scale-105"
                    >
                      {banner.botaoTexto}
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && totalBanners > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all z-10 opacity-0 group-hover:opacity-100"
            aria-label="Banner anterior"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all z-10 opacity-0 group-hover:opacity-100"
            aria-label="Próximo banner"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showDots && totalBanners > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8 shadow-lg'
                  : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}