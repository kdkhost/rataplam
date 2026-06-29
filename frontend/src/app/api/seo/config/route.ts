import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina') || 'home';
    const res = await fetch(`${API_URL}/api/seo/config?pagina=${pagina}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao buscar config SEO' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_URL}/api/seo/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao salvar config SEO' }, { status: 500 });
  }
}
