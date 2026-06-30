import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

/**
 * Helper: resolve um slug de produto para o ID numérico.
 * O backend /api/produtos/:slug retorna { produto: { id, ... } }.
 */
async function resolverIdPorSlug(slug: string): Promise<number | null> {
  // Verifica se já é um ID numérico (evita busca desnecessária)
  if (/^\d+$/.test(slug)) return parseInt(slug, 10);
  try {
    const res = await fetch(`${API_URL}/api/produtos/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.produto?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const produtoId = await resolverIdPorSlug(slug);
  if (!produtoId) {
    return NextResponse.json({ sucesso: false, erro: 'Produto não encontrado' }, { status: 404 });
  }
  try {
    const res = await fetch(`${API_URL}/api/produtos/${produtoId}/avaliacoes`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao buscar avaliações' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const produtoId = await resolverIdPorSlug(slug);
  if (!produtoId) {
    return NextResponse.json({ sucesso: false, erro: 'Produto não encontrado' }, { status: 404 });
  }
  const body = await req.json();
  const authHeader = req.headers.get('authorization');
  try {
    const res = await fetch(`${API_URL}/api/produtos/${produtoId}/avaliacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ sucesso: false, erro: 'Erro ao enviar avaliação' }, { status: 500 });
  }
}
