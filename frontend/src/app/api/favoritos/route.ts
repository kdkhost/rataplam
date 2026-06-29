import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/favoritos`, {
    headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get('authorization');
  const res = await fetch(`${API_URL}/api/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeader ? { Authorization: authHeader } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
