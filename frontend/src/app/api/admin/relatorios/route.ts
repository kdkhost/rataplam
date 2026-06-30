import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

/**
 * Proxy para relatórios do admin.
 * Mapeia ?tipo=vendas|estoque|financeiro para as rotas reais do backend.
 * Também encaminha todos os demais query params (periodo, data_inicio, data_fim, etc).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo') || 'vendas';

  // Mapeia tipo para o endpoint real
  const rotaMap: Record<string, string> = {
    vendas: 'vendas',
    estoque: 'estoque',
    financeiro: 'financeiro',
  };
  const rota = rotaMap[tipo] || 'vendas';

  // Repassa todos os query params exceto 'tipo'
  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key !== 'tipo') params.set(key, value);
  }

  const qs = params.toString();
  const url = `${API_URL}/api/admin/relatorios/${rota}${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, {
      headers: { ...(auth ? { Authorization: auth } : {}) },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ erro: 'Erro ao buscar relatorio' }, { status: 500 });
  }
}
