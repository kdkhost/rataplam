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

export default function AdminDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [visitas, setVisitas] = useState<DiaVisitas[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [vendasRes, estoqueRes, visitasRes, avaliacoesRes, cuponsRes] = await Promise.allSettled([
          api.get('/api/admin/relatorios/vendas?periodo=dia'),
          api.get('/api/admin/relatorios/estoque?tipo=baixo_estoque'),
          api.get('/api/visitas/estatisticas?periodo=30d'),
          api.get('/api/admin/avaliacoes'),
          api.get('/api/admin/cupons'),
        ]);

        const vendas = vendasRes.status === 'fulfilled' ? vendasRes.value : null;
        const estoque = estoqueRes.status === 'fulfilled' ? estoqueRes.value : null;
        const visitasData = visitasRes.status === 'fulfilled' ? visitasRes.value : null;
        const avaliacoes = avaliacoesRes.status === 'fulfilled' ? avaliacoesRes.value : null;
        const cupons = cuponsRes.status === 'fulfilled' ? cuponsRes.value : null;

        const vendasDia = vendas?.vendas?.[0] ?? null;
        const resumo = vendas?.resumo ?? null;

        const visitantesHoje = visitasData?.resumo?.visitantes_unicos ?? 0;

        const porDia: DiaVisitas[] = (visitasData?.por_dia ?? []).map((v: { data: string; unicas: number }) => ({
          data: new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          visitas: v.unicas,
        }));

        const avaliacoesPendentes = (avaliacoes?.avaliacoes ?? []).filter(
          (a: { aprovada: number }) => a.aprovada === 0
        ).length;

        const cuponsAtivos = (cupons?.cupons ?? []).filter((c: { ativo: number }) => c.ativo === 1).length;

        setKpi({
          pedidos_hoje: vendasDia?.total_pedidos ?? resumo?.total_pedidos ?? 0,
          receita_hoje: parseFloat(vendasDia?.receita_total ?? resumo?.receita_total ?? '0'),
          pedidos_mes: resumo?.total_pedidos ?? 0,
          receita_mes: parseFloat(resumo?.receita_total ?? '0'),
          visitantes: visitantesHoje,
          produtos_estoque_baixo: estoque?.produtos?.length ?? 0,
          cupons_ativos: cuponsAtivos,
          avaliacoes_pendentes: avaliacoesPendentes,
        });
        setVisitas(porDia);
      } catch {
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const maxVisitas = Math.max(...visitas.map((v) => v.visitas), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {carregando ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Pedidos Hoje</p>
              <p className="text-3xl font-extrabold text-foreground">{kpi?.pedidos_hoje ?? 0}</p>
              <p className="text-xs text-green-600 mt-1">
                R$ {(kpi?.receita_hoje ?? 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Pedidos no Mês</p>
              <p className="text-3xl font-extrabold text-foreground">{kpi?.pedidos_mes ?? 0}</p>
              <p className="text-xs text-green-600 mt-1">
                R$ {(kpi?.receita_mes ?? 0).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Visitantes Únicos</p>
              <p className="text-3xl font-extrabold text-foreground">{kpi?.visitantes ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">últimos 30 dias</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Estoque Baixo</p>
              <p className="text-3xl font-extrabold text-orange-500">{kpi?.produtos_estoque_baixo ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cupons ativos: {kpi?.cupons_ativos ?? 0} · Avaliações: {kpi?.avaliacoes_pendentes ?? 0}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Visitas — Últimos 30 Dias</h3>
          {visitas.length > 0 ? (
            <div className="flex items-end gap-1 h-48">
              {visitas.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${v.data}: ${v.visitas}`}
                >
                  <span className="text-[10px] text-muted-foreground">{v.visitas}</span>
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-violet-500 rounded-t transition-all hover:from-pink-600 hover:to-violet-600"
                    style={{
                      height: `${(v.visitas / maxVisitas) * 100}%`,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">{v.data.split('/')[0]}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Sem dados de visitas
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-sm font-medium text-blue-700">Pedidos</span>
            </Link>
            <Link
              href="/admin/produtos"
              className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-sm font-medium text-orange-700">Produtos</span>
            </Link>
            <Link
              href="/admin/clientes"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-green-700">Clientes</span>
            </Link>
            <Link
              href="/admin/seo"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium text-purple-700">SEO</span>
            </Link>
            <Link
              href="/admin/relatorios"
              className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-rose-700">Relatórios</span>
            </Link>
            <Link
              href="/admin/cron"
              className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors"
            >
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-yellow-700">Cron Jobs</span>
            </Link>
            <Link
              href="/admin/avaliacoes"
              className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium text-teal-700">Avaliações</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted transition-colors"
            >
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium text-foreground">Ver Loja</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
