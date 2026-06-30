'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ManutencaoConfig {
  manutencao_ativo: string;
  manutencao_titulo: string;
  manutencao_mensagem: string;
  manutencao_data_fim: string;
  manutencao_imagem: string;
}

export default function ManutencaoPage() {
  const [config, setConfig] = useState<ManutencaoConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tempoRestante, setTempoRestante] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await api.get('/api/admin/configuracoes');
        const map: Record<string, string> = {};
        (dados.configuracoes || []).forEach((c: { chave: string; valor: string }) => {
          map[c.chave] = c.valor;
        });
        setConfig({
          manutencao_ativo: map.manutencao_ativo || '0',
          manutencao_titulo: map.manutencao_titulo || 'Estamos em Manutenção',
          manutencao_mensagem: map.manutencao_mensagem || 'Voltamos em breve!',
          manutencao_data_fim: map.manutencao_data_fim || '',
          manutencao_imagem: map.manutencao_imagem || '',
        });
      } catch {
        setConfig({
          manutencao_ativo: '1',
          manutencao_titulo: 'Estamos em Manutenção',
          manutencao_mensagem: 'Voltamos em breve com novidades incríveis!',
          manutencao_data_fim: '',
          manutencao_imagem: '',
        });
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    if (!config?.manutencao_data_fim) return;
    const interval = setInterval(() => {
      const fim = new Date(config.manutencao_data_fim).getTime();
      const agora = Date.now();
      const diff = fim - agora;
      if (diff <= 0) {
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
        clearInterval(interval);
        return;
      }
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);
      setTempoRestante({ dias, horas, minutos, segundos });
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🛠️</div>
          <h1 className="text-4xl font-bold mb-2">Carregando...</h1>
          <div className="w-48 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-white animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!config || config.manutencao_ativo !== '1') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center text-white">
          {config.manutencao_imagem && (
            <Image
              src={config.manutencao_imagem}
              alt="Manutenção"
              width={200}
              height={200}
              className="mx-auto mb-8 rounded-2xl shadow-2xl"
            />
          )}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            {config.manutencao_titulo}
          </h1>
          <p className="text-xl md:text-2xl mb-10 leading-relaxed drop-shadow-md">
            {config.manutencao_mensagem}
          </p>

          {config.manutencao_data_fim && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white/20">
              <h3 className="text-lg font-semibold mb-6">Voltamos em:</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/15 rounded-xl p-4">
                  <div className="text-4xl font-bold">{tempoRestante.dias}</div>
                  <div className="text-xs opacity-75">Dias</div>
                </div>
                <div className="bg-white/15 rounded-xl p-4">
                  <div className="text-4xl font-bold">{tempoRestante.horas}</div>
                  <div className="text-xs opacity-75">Horas</div>
                </div>
                <div className="bg-white/15 rounded-xl p-4">
                  <div className="text-4xl font-bold">{tempoRestante.minutos}</div>
                  <div className="text-xs opacity-75">Min</div>
                </div>
                <div className="bg-white/15 rounded-xl p-4">
                  <div className="text-4xl font-bold">{tempoRestante.segundos}</div>
                  <div className="text-xs opacity-75">Seg</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm opacity-90">
            <p>Entre em contato:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:contato@rataplam.com.br" className="hover:underline">contato@rataplam.com.br</a>
              <a href="tel:+5521996913143" className="hover:underline">(21) 99691-3143</a>
            </div>
            <a
              href="https://www.instagram.com/rataplam.loja/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0c-3.259 0-3.668.014-4.948.072zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              @rataplam.loja
            </a>
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-sm opacity-75">
              Nice armarinho Ltda | CNPJ: 33.149.055/0001-17
            </p>
            <p className="text-xs opacity-50 mt-1">
              Travessa Roma 14, Rocinha - Rio de Janeiro / RJ
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}