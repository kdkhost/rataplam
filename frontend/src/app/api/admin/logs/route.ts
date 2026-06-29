import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const status = searchParams.get('status');
  const pagina = searchParams.get('pagina');
  let url = `${API_URL}/api/admin/logs`;
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (status) params.set('status', status);
  if (pagina) params.set('pagina', pagina);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url, {
    headers: { ...(auth ? { Authorization: auth } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
