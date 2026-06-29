import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const url = new URL(req.url);
  const res = await fetch(`${API_URL}/api/produtos?${url.searchParams}`, {
    headers: { Authorization: auth || '' },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
