'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  distance = 40,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const getInitialStyles = (): React.CSSProperties => {
      const base: React.CSSProperties = { opacity: 0, transition: `opacity ${duration}ms ease, transform ${duration}ms ease` };
      switch (direction) {
        case 'up': return { ...base, transform: `translateY(${distance}px)` };
        case 'down': return { ...base, transform: `translateY(-${distance}px)` };
        case 'left': return { ...base, transform: `translateX(${distance}px)` };
        case 'right': return { ...base, transform: `translateX(-${distance}px)` };
        case 'fade': return base;
      }
    };

    const getVisibleStyles = (): React.CSSProperties => {
      return { opacity: 1, transform: 'translate(0, 0)' };
    };

    el.style.cssText = Object.entries(getInitialStyles())
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            const visible = getVisibleStyles();
            el.style.opacity = String(visible.opacity);
            el.style.transform = visible.transform || '';
          }, delay);
          if (once) observer.unobserve(el);
        } else if (!once) {
          const initial = getInitialStyles();
          el.style.opacity = String(initial.opacity);
          el.style.transform = initial.transform || '';
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, distance, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
