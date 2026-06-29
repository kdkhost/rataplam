import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const acao = body.acao;
  const authHeader = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/admin/avaliacoes/${id}/${acao}`, {
    method: 'PUT',
    headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
