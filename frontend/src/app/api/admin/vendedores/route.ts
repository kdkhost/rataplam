import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

/**
 * Proxy para vendedores — redirecionado para /api/admin/clientes com role=vendedor,
 * já que vendedores são usuários com role='vendedor' no mesmo endpoint de clientes.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams();
  params.set('role', 'vendedor');
  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }

  const res = await fetch(`${API_URL}/api/admin/clientes?${params.toString()}`, {
    headers: { ...(auth ? { Authorization: auth } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const body = await req.json();
  // Garante que role=vendedor seja enviado
  const res = await fetch(`${API_URL}/api/admin/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify({ ...body, role: 'vendedor' }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
