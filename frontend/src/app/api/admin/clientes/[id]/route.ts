import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = req.headers.get('authorization');
  const body = await req.json();
  const res = await fetch(`${API_URL}/api/admin/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: auth || '' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
