'use client';

import { useEffect, useState, useCallback } from 'react';
import AnimatedCounter from './AnimatedCounter';

interface KpiData {
  visitas_hoje: number;
  visitas_ontem: number;
  crescimento_hoje: number;
  uniques_hoje: number;
  uniques_ontem: number;
  visitas_semana: number;
  crescimento_semana: number;
  visitas_mes: number;
  crescimento_mes: number;
  total_geral: number;
  paginas_hoje: number;
  duracao_media: number;
  bounce_rate: number;
  taxa_conversao: number;
  receita_hoje: number;
  ticket_medio: number;
  pedidos_hoje: number;
}

interface KpiCardProps {
  titulo: string;
  valor: number;
  valorAnterior?: number;
  icone: React.ReactNode;
  cor: string;
  prefixo?: string;
  sufixo?: string;
  casasDecimais?: number;
}

function KpiCard({ titulo, valor, valorAnterior, icone, cor, prefixo = '', sufixo = '', casasDecimais = 0 }: KpiCardProps) {
  const crescimento = valorAnterior && valorAnterior > 0
    ? ((valor - valorAnterior) / valorAnterior) * 100
    : valor > 0 ? 100 : 0;

  const isPositivo = crescimento >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300`} style={{ backgroundColor: cor }}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cor} bg-opacity-10`} style={{ backgroundColor: `${cor}15` }}>
            <div style={{ color: cor }}>{icone}</div>
          </div>
          {crescimento !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositivo ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <svg className={`w-3 h-3 ${isPositivo ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(crescimento).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="text-gray-500 text-sm mb-1">{titulo}</div>
        <AnimatedCounter
          valor={valor}
          prefixo={prefixo}
          sufixo={sufixo}
          casasDecimais={casasDecimais}
          tamanho="lg"
          className="text-gray-900"
          duracao={1500}
        />
      </div>
    </div>
  );
}

interface DashboardKpisProps {
  apiUrl?: string;
}

export default function DashboardKpis({ apiUrl = '/api/visitas' }: DashboardKpisProps) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  const buscarKpis = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/kpis`);
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setUltimaAtualizacao(new Date());
      }
    } catch (e) {
      console.error('Erro ao buscar KPIs:', e);
    } finally {
      setCarregando(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    buscarKpis();
    const interval = setInterval(buscarKpis, 60000);
    return () => clearInterval(interval);
  }, [buscarKpis]);

  if (carregando) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Painel de Métricas</h2>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Atualizado {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          titulo="Visitas Hoje"
          valor={kpis.visitas_hoje}
          valorAnterior={kpis.visitas_ontem}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          cor="#3B82F6"
        />

        <KpiCard
          titulo="Visitantes Únicos"
          valor={kpis.uniques_hoje}
          valorAnterior={kpis.uniques_ontem}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          cor="#10B981"
        />

        <KpiCard
          titulo="Esta Semana"
          valor={kpis.visitas_semana}
          valorAnterior={Math.round(kpis.visitas_semana / (1 + kpis.crescimento_semana / 100))}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          cor="#8B5CF6"
        />

        <KpiCard
          titulo="Este Mês"
          valor={kpis.visitas_mes}
          valorAnterior={Math.round(kpis.visitas_mes / (1 + kpis.crescimento_mes / 100))}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          cor="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titulo="Total Geral"
          valor={kpis.total_geral}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          }
          cor="#EC4899"
        />

        <KpiCard
          titulo="Duração Média"
          valor={kpis.duracao_media}
          sufixo="s"
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          cor="#06B6D4"
        />

        <KpiCard
          titulo="Taxa Conversão"
          valor={kpis.taxa_conversao}
          sufixo="%"
          casasDecimais={1}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          cor="#10B981"
        />

        <KpiCard
          titulo="Receita Hoje"
          valor={kpis.receita_hoje}
          prefixo="R$ "
          casasDecimais={2}
          icone={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          cor="#F97316"
        />
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        Taxa de Bounce: {kpis.bounce_rate}% · Pedidos Hoje: {kpis.pedidos_hoje} · Ticket Médio: R$ {kpis.ticket_medio.toFixed(2)}
      </div>
    </div>
  );
}
