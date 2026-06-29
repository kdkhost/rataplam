import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/cron/${id}/toggle`, {
    method: 'POST',
    headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/cron/${id}/executar`, {
    method: 'POST',
    headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
