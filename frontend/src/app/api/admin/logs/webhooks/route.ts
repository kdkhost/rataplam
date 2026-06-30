import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const res = await fetch(`${API_URL}/api/admin/logs/webhooks${qs ? `?${qs}` : ''}`, {
    headers: { ...(auth ? { Authorization: auth } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
