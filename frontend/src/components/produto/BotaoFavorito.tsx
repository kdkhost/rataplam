'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface Props {
  produtoId: number;
  size?: 'sm' | 'md';
}

export default function BotaoFavorito({ produtoId, size = 'sm' }: Props) {
  const { isLogado } = useAuth();
  const [favoritado, setFavoritado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!isLogado) return;
    fetch('/api/favoritos', {
      headers: { Authorization: `Bearer ${localStorage.getItem('rataplam_token')}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.favoritos) {
          setFavoritado(d.favoritos.some((f: any) => f.id === produtoId));
        }
      })
      .catch(() => {});
  }, [isLogado, produtoId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLogado || carregando) return;
    setCarregando(true);
    try {
      if (favoritado) {
        await fetch(`/api/favoritos/${produtoId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('rataplam_token')}` },
        });
        setFavoritado(false);
      } else {
        await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('rataplam_token')}` },
          body: JSON.stringify({ produto_id: produtoId }),
        });
        setFavoritado(true);
      }
    } catch { /* empty */ }
    finally { setCarregando(false); }
  };

  const sz = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const icon = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={toggle}
      className={`${sz} rounded-full flex items-center justify-center transition-all ${
        favoritado
          ? 'bg-brand-pink text-white shadow-md shadow-brand-pink/20 scale-110'
          : 'bg-white text-gray-400 hover:text-brand-pink hover:bg-brand-pink-light border border-gray-200 hover:border-brand-pink/30 hover:scale-105'
      }`}
      title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <svg className={icon} fill={favoritado ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
