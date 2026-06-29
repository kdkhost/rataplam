import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const res = await fetch(`${API_URL}/api/frete/rastrear/${encodeURIComponent(codigo)}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
