'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  itemsPerView?: { mobile: number; tablet: number; desktop: number };
  className?: string;
}

export default function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const childrenArray = Array.isArray(children) ? children : [children];
  const totalItems = childrenArray.length;
  const maxIndex = Math.max(0, totalItems - 1);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!containerRef.current) return;
      const itemWidth = containerRef.current.offsetWidth / itemsPerView.desktop;
      containerRef.current.scrollTo({
        left: itemWidth * index,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    },
    [itemsPerView.desktop]
  );

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (autoPlay && totalItems > 1) {
      autoPlayRef.current = setInterval(next, interval);
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [autoPlay, interval, next, totalItems]);

  useEffect(() => {
    if (containerRef.current) {
      const itemWidth = containerRef.current.offsetWidth / itemsPerView.desktop;
      containerRef.current.scrollTo({
        left: itemWidth * currentIndex,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, itemsPerView.desktop]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.clientX;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (autoPlay) {
        autoPlayRef.current = setInterval(next, interval);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const x = e.touches[0].clientX;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={`flex-shrink-0 snap-center snap-always transition-transform duration-300 ${
              index === currentIndex ? 'scale-102 z-10' : ''
            }`}
            style={{
              width: `calc(100% / ${itemsPerView.desktop} - ${itemsPerView.desktop > 1 ? '1rem' : '0'})`,
              minWidth: `calc(100% / ${itemsPerView.desktop} - ${itemsPerView.desktop > 1 ? '1rem' : '0'})`,
              scrollSnapAlign: 'center',
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && totalItems > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:translate-x-0 w-12 h-12 md:w-14 md:h-14 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-rose-500 hover:text-white hover:shadow-rose-500/30 transition-all duration-300 z-20 group"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-0 w-12 h-12 md:w-14 md:h-14 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-xl flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-rose-500 hover:text-white hover:shadow-rose-500/30 transition-all duration-300 z-20 group"
            aria-label="Próximo"
          >
            <svg className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalItems }, (_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-gradient-to-r from-rose-500 to-violet-500 w-8 shadow-lg shadow-rose-500/30'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-rose-400'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}