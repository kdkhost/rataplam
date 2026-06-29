import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const session = req.headers.get('x-session-id');
  const headers: Record<string, string> = {};
  if (auth) headers['Authorization'] = auth;
  if (session) headers['X-Session-ID'] = session;
  const res = await fetch(`${API_URL}/api/carrinho`, { headers });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const session = req.headers.get('x-session-id');
  const body = await req.json();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = auth;
  if (session) headers['X-Session-ID'] = session;
  const res = await fetch(`${API_URL}/api/carrinho`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const session = req.headers.get('x-session-id');
  const body = await req.json();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = auth;
  if (session) headers['X-Session-ID'] = session;
  const res = await fetch(`${API_URL}/api/carrinho`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const session = req.headers.get('x-session-id');
  const { searchParams } = new URL(req.url);
  const produto_id = searchParams.get('produto_id');
  const variacao_id = searchParams.get('variacao_id');
  const headers: Record<string, string> = {};
  if (auth) headers['Authorization'] = auth;
  if (session) headers['X-Session-ID'] = session;
  let url = `${API_URL}/api/carrinho`;
  const params = new URLSearchParams();
  if (produto_id) params.set('produto_id', produto_id);
  if (variacao_id) params.set('variacao_id', variacao_id);
  if (params.toString()) url += `?${params.toString()}`;
  const res = await fetch(url, { method: 'DELETE', headers });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
