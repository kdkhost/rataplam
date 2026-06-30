import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/cron/${id}/executar`, {
    method: 'POST',
    headers: { ...(auth ? { Authorization: auth } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
