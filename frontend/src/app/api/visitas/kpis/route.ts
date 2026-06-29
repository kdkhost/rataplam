import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/visitas/kpis`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      sucesso: true,
      kpis: {
        visitas_hoje: 0, visitas_ontem: 0, crescimento_hoje: 0,
        uniques_hoje: 0, uniques_ontem: 0, visitas_semana: 0,
        crescimento_semana: 0, visitas_mes: 0, crescimento_mes: 0,
        total_geral: 0, paginas_hoje: 0, duracao_media: 0,
        bounce_rate: 0, taxa_conversao: 0, receita_hoje: 0,
        ticket_medio: 0, pedidos_hoje: 0,
      }
    });
  }
}
