import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/api/visitas/online`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ sucesso: true, online: 0 });
  }
}
