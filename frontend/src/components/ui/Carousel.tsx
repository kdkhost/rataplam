'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';

interface CarouselProps {
  items: ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export default function Carousel({
  items,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const maxIndex = Math.max(0, items.length - visibleCount);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, maxIndex));
      setCurrentIndex(clamped);
      const container = containerRef.current;
      if (!container) return;
      const children = container.children;
      if (children[clamped]) {
        (children[clamped] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    },
    [maxIndex]
  );

  useEffect(() => {
    const updateVisibleCount = () => {
      const w = window.innerWidth;
      if (w < 640) setVisibleCount(1);
      else if (w < 1024) setVisibleCount(2);
      else setVisibleCount(4);
    };
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const handleScroll = () => {
      const scrollLeft = c.scrollLeft;
      const itemWidth = c.scrollWidth / items.length;
      const idx = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)));
    };
    c.addEventListener('scroll', handleScroll, { passive: true });
    return () => c.removeEventListener('scroll', handleScroll);
  }, [items.length, maxIndex]);

  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev >= maxIndex ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, maxIndex, scrollToIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) scrollToIndex(currentIndex + 1);
      else scrollToIndex(currentIndex - 1);
    }
  };

  const goTo = (idx: number) => scrollToIndex(idx);
  const goPrev = () => scrollToIndex(currentIndex - 1);
  const goNext = () => scrollToIndex(currentIndex + 1);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {showArrows && (
        <>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl shadow-pink-200/50 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:flex border border-gray-100"
            aria-label="Anterior"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-xl shadow-pink-200/50 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed hidden sm:flex border border-gray-100"
            aria-label="Proximo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-start"
            style={{
              width: 'calc((100% - 1.5rem) / 4)',
              minWidth: 'calc((100% - 1.5rem) / 4)',
            }}
          >
            <div className="sm:hidden" style={{ width: '100%' }}>
              <div style={{ width: 'calc((100vw - 2rem) / 1)' }}>{item}</div>
            </div>
            <div className="hidden sm:block md:hidden" style={{ width: '100%' }}>
              <div style={{ width: 'calc((100vw - 3rem) / 2)' }}>{item}</div>
            </div>
            <div className="hidden md:block lg:hidden" style={{ width: '100%' }}>
              <div style={{ width: 'calc((100vw - 5rem) / 3)' }}>{item}</div>
            </div>
            <div className="hidden lg:block" style={{ width: '100%' }}>
              {item}
            </div>
          </div>
        ))}
      </div>

      {showDots && items.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-8 bg-gradient-to-r from-pink-500 to-violet-500'
                  : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
