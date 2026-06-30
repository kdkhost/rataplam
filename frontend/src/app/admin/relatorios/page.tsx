'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, formatarMoeda } from '@/lib/api';
import AnimatedCounter from '@/components/kpi/AnimatedCounter';
import { Badge, Select } from '@/components/ui';

type Aba = 'vendas' | 'estoque' | 'financeiro';

interface VendasData {
  total_vendas: number;
  total_pedidos: number;
  ticket_medio: number;
  pedidos_por_status: { status: string; total: number }[];
  top_produtos: { nome: string; total: number; quantidade: number }[];
}

interface EstoqueData {
  estoque_baixo: { nome: string; estoque: number; categoria: string }[];
  sem_estoque: number;
  por_categoria: { categoria: string; total: number }[];
}

interface FinanceiroData {
  receita_total: number;
  descontos: number;
  frete_total: number;
  lucro_estimado: number;
  receita_por_mes: { mes: string; total: number }[];
}

const periodos = [
  { valor: 'dia', label: 'Hoje' },
  { valor: 'mes', label: 'Este Mês' },
  { valor: 'semana', label: 'Últimas Semanas' },
  { valor: 'ano', label: 'Este Ano' },
];

const statusCores: Record<string, 'sucesso' | 'erro' | 'aviso' | 'info' | 'padrao'> = {
  pendente: 'aviso', pago: 'info', processando: 'info', enviado: 'sucesso', entregue: 'sucesso', cancelado: 'erro',
};

export default function AdminRelatorios() {
  const [aba, setAba] = useState<Aba>('vendas');
  const [periodo, setPeriodo] = useState('mes');
  const [vendas, setVendas] = useState<VendasData | null>(null);
  const [estoque, setEstoque] = useState<EstoqueData | null>(null);
  const [financeiro, setFinanceiro] = useState<FinanceiroData | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const params = `?periodo=${periodo}`;
      if (aba === 'vendas') {
        const data = await api.get(`/api/admin/relatorios/vendas${params}`);
        // Normaliza a resposta do backend para o formato esperado pelo componente
        const resumo = data?.resumo ?? {};
        const porStatus = data?.por_status ?? [];
        const topProdutos = data?.top_produtos ?? [];
        setVendas({
          total_vendas: parseFloat(resumo.receita_total ?? 0),
          total_pedidos: parseInt(resumo.total_pedidos ?? 0, 10),
          ticket_medio: parseFloat(resumo.ticket_medio ?? 0),
          pedidos_por_status: porStatus.map((s: { status: string; quantidade: number }) => ({
            status: s.status,
            total: s.quantidade,
          })),
          top_produtos: topProdutos.map((p: { nome_produto: string; receita: string; total_vendido: number }) => ({
            nome: p.nome_produto,
            total: parseFloat(p.receita ?? 0),
            quantidade: p.total_vendido,
          })),
        });
      } else if (aba === 'estoque') {
        const data = await api.get(`/api/admin/relatorios/estoque${params}`);
        const resumo = data?.resumo ?? {};
        const produtos = data?.produtos ?? [];
        const porCategoria = data?.por_categoria ?? [];
        setEstoque({
          sem_estoque: parseInt(resumo.sem_estoque ?? 0, 10),
          estoque_baixo: produtos
            .filter((p: { estoque: number }) => p.estoque <= 10)
            .slice(0, 20)
            .map((p: { nome: string; estoque: number; categoria_nome: string }) => ({
              nome: p.nome,
              estoque: p.estoque,
              categoria: p.categoria_nome ?? '',
            })),
          por_categoria: porCategoria.map((c: { categoria: string; total_produtos: number }) => ({
            categoria: c.categoria,
            total: c.total_produtos,
          })),
        });
      } else {
        const data = await api.get(`/api/admin/relatorios/financeiro${params}`);
        const resumo = data?.resumo ?? {};
        const receita = data?.receita ?? [];
        setFinanceiro({
          receita_total: parseFloat(resumo.receita_bruta ?? 0),
          descontos: parseFloat(resumo.total_descontos ?? 0),
          frete_total: parseFloat(resumo.total_frete ?? 0),
          lucro_estimado: parseFloat(resumo.receita_liquida ?? 0),
          receita_por_mes: receita.map((r: { periodo: string; receita_bruta: string }) => ({
            mes: r.periodo,
            total: parseFloat(r.receita_bruta ?? 0),
          })),
        });
      }
    } catch {
      // erro silencioso
    } finally {
      setCarregando(false);
    }
  }, [aba, periodo]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const renderConteudo = () => {
    if (carregando) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (aba === 'vendas' && vendas) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Vendas</p>
              <AnimatedCounter valor={vendas.total_vendas} prefixo="R$ " sufixo="" casasDecimais={2} className="text-blue-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Pedidos</p>
              <AnimatedCounter valor={vendas.total_pedidos} className="text-gray-900" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Ticket Medio</p>
              <AnimatedCounter valor={vendas.ticket_medio} prefixo="R$ " casasDecimais={2} className="text-green-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Pedidos por Status</p>
              <div className="mt-2 space-y-1">
                {vendas.pedidos_por_status.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <Badge variante={statusCores[s.status] || 'padrao'}>{s.status}</Badge>
                    <span className="font-medium text-gray-700">{s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
            {vendas.top_produtos.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum dado disponivel</p>
            ) : (
              <div className="space-y-3">
                {vendas.top_produtos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm text-gray-800">{p.nome}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{formatarMoeda(p.total)}</span>
                      <span className="text-xs text-gray-500 block">{p.quantidade} un.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (aba === 'estoque' && estoque) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Sem Estoque</p>
              <AnimatedCounter valor={estoque.sem_estoque} className="text-red-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
              <AnimatedCounter valor={estoque.estoque_baixo.length} className="text-orange-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Total Categorias</p>
              <AnimatedCounter valor={estoque.por_categoria.length} className="text-blue-600" tamanho="lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estoque Baixo</h3>
            {estoque.estoque_baixo.length === 0 ? (
              <p className="text-green-600 text-sm font-medium">Todos os produtos com estoque adequado!</p>
            ) : (
              <div className="space-y-2">
                {estoque.estoque_baixo.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-sm text-gray-800">{p.nome}</span>
                      <span className="text-xs text-gray-500 ml-2">({p.categoria})</span>
                    </div>
                    <Badge variante={p.estoque === 0 ? 'erro' : 'aviso'}>{p.estoque} unidades</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estoque por Categoria</h3>
            <div className="space-y-2">
              {estoque.por_categoria.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-800">{c.categoria}</span>
                  <span className="text-sm font-medium text-gray-700">{c.total} produtos</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (aba === 'financeiro' && financeiro) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Receita Total</p>
              <AnimatedCounter valor={financeiro.receita_total} prefixo="R$ " casasDecimais={2} className="text-green-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Descontos</p>
              <AnimatedCounter valor={financeiro.descontos} prefixo="R$ " casasDecimais={2} className="text-red-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Frete Total</p>
              <AnimatedCounter valor={financeiro.frete_total} prefixo="R$ " casasDecimais={2} className="text-blue-600" tamanho="lg" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Lucro Estimado</p>
              <AnimatedCounter valor={financeiro.lucro_estimado} prefixo="R$ " casasDecimais={2} className="text-green-700" tamanho="lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Mes</h3>
            {financeiro.receita_por_mes.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum dado disponivel</p>
            ) : (
              <div className="space-y-2">
                {financeiro.receita_por_mes.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-800">{m.mes}</span>
                    <span className="text-sm font-medium text-gray-900">{formatarMoeda(m.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return <p className="text-gray-500 text-sm">Nenhum dado disponivel para este periodo.</p>;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Relatorios</h2>
        <p className="text-sm text-gray-500">Analise detalhada do desempenho da loja</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['vendas', 'estoque', 'financeiro'] as Aba[]).map((a) => (
            <button key={a} onClick={() => setAba(a)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${aba === a ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {a}
            </button>
          ))}
        </div>
        <Select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="w-full sm:w-48">
          {periodos.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
        </Select>
      </div>

      {renderConteudo()}
    </div>
  );
}
