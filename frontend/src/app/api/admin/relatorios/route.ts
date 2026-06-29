import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const inicio = searchParams.get('inicio');
  const fim = searchParams.get('fim');
  let url = `${API_URL}/api/admin/relatorios`;
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (inicio) params.set('inicio', inicio);
  if (fim) params.set('fim', fim);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url, {
    headers: { ...(auth ? { Authorization: auth } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
