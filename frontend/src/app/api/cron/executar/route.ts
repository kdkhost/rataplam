import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:8080';

/**
 * Proxy para execução manual do cron pelo painel admin.
 * Passa o Bearer token do admin para autenticar no backend.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  try {
    const res = await fetch(`${API_URL}/api/cron/executar`, {
      headers: { ...(auth ? { Authorization: auth } : {}) },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ erro: 'Erro ao executar cron' }, { status: 500 });
  }
}
