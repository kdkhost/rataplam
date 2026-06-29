'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface KpiData {
  pedidos_hoje: number;
  receita_hoje: number;
  pedidos_mes: number;
  receita_mes: number;
  visitantes: number;
  produtos_estoque_baixo: number;
  cupons_ativos: number;
  avaliacoes_pendentes: number;
}

interface DiaVisitas {
  data: string;
  visitas: number;
}

const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function AdminDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [visitas, setVisitas] = useState<DiaVisitas[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [kpiRes, visitasRes] = await Promise.allSettled([
          api.get('/api/admin/relatorios?tipo=kpis'),
          api.get('/api/admin/relatorios?tipo=visitantes&periodo=30'),
        ]);
        if (kpiRes.status === 'fulfilled') setKpi(kpiRes.value);
        if (visitasRes.status === 'fulfilled') setVisitas(visitasRes.value?.visitantes || []);
      } catch {} finally { setCarregando(false); }
    };
    carregar();
  }, []);

  const maxVisitas = Math.max(...visitas.map(v => v.visitas), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {carregando ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pedidos Hoje</p>
              <p className="text-3xl font-extrabold text-gray-900">{kpi?.pedidos_hoje ?? 0}</p>
              <p className="text-xs text-green-600 mt-1">R$ {(kpi?.receita_hoje ?? 0).toFixed(2).replace('.',',')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pedidos Mes</p>
              <p className="text-3xl font-extrabold text-gray-900">{kpi?.pedidos_mes ?? 0}</p>
              <p className="text-xs text-green-600 mt-1">R$ {(kpi?.receita_mes ?? 0).toFixed(2).replace('.',',')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Visitantes Hoje</p>
              <p className="text-3xl font-extrabold text-gray-900">{kpi?.visitantes ?? 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
              <p className="text-3xl font-extrabold text-orange-500">{kpi?.produtos_estoque_baixo ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">Cupons ativos: {kpi?.cupons_ativos ?? 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitas - Ultimos 30 Dias</h3>
          {visitas.length > 0 ? (
            <div className="flex items-end gap-1 h-48">
              {visitas.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${v.data}: ${v.visitas}`}>
                  <span className="text-[10px] text-gray-400">{v.visitas}</span>
                  <div className="w-full bg-gradient-to-t from-pink-500 to-violet-500 rounded-t transition-all hover:from-pink-600 hover:to-violet-600" style={{ height: `${(v.visitas / maxVisitas) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[9px] text-gray-400">{v.data.split('/')[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sem dados de visitas</div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rapido</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/pedidos" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="text-sm font-medium text-blue-700">Pedidos</span>
            </Link>
            <Link href="/admin/produtos" className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <span className="text-sm font-medium text-orange-700">Produtos</span>
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-sm font-medium text-green-700">Clientes</span>
            </Link>
            <Link href="/admin/seo" className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-sm font-medium text-purple-700">SEO</span>
            </Link>
            <Link href="/admin/relatorios" className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors">
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-sm font-medium text-rose-700">Relatorios</span>
            </Link>
            <Link href="/admin/cron" className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-medium text-yellow-700">Cron Jobs</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-sm font-medium text-gray-700">Ver Loja</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
