import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '7d';
    const res = await fetch(`${API_URL}/api/visitas/estatisticas?periodo=${periodo}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
