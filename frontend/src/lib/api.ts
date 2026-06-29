const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  try {
    const res = await fetch(`${API_BASE}/api/csrf-token`);
    const data = await res.json();
    if (data.token) { csrfToken = data.token; return data.token; }
  } catch { /* ignore */ }
  return '';
}

async function requisicao(url: string, opcoes: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rataplam_token') : null;
  const method = (opcoes.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opcoes.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (method !== 'GET') {
    const csrf = await fetchCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...opcoes, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  get: (url: string) => requisicao(url),
  post: (url: string, body: unknown) => requisicao(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: unknown) => requisicao(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => requisicao(url, { method: 'DELETE' }),
  upload: async (url: string, formData: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rataplam_token') : null;
    const csrf = await fetchCsrfToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrf) headers['X-CSRF-Token'] = csrf;

    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  },
};

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

export function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR');
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncar(texto: string, limite: number): string {
  return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
}
