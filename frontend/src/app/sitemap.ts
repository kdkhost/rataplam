import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rataplam.com.br';
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:8080';

interface Produto  { slug: string; updated_at?: string; }
interface Categoria { slug: string; }
interface BlogPost  { slug: string; publicado_em?: string; updated_at?: string; }

async function buscarProdutos(): Promise<Produto[]> {
  try {
    const res = await fetch(`${API_URL}/api/produtos?limite=500`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.produtos || [];
  } catch { return []; }
}

async function buscarCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(`${API_URL}/api/admin/categorias`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categorias || [];
  } catch { return []; }
}

async function buscarPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog?status=publicado&limite=200`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts || [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [produtos, categorias, posts] = await Promise.all([
    buscarProdutos(),
    buscarCategorias(),
    buscarPosts(),
  ]);

  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: BASE_URL,                               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/loja`,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/blog`,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/sobre`,                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contato`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/perguntas-frequentes`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/politica-troca`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/politica-privacidade`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/termos`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/provador-virtual`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/rastrear-pedido`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const paginasProdutos: MetadataRoute.Sitemap = produtos.map((p) => ({
    url: `${BASE_URL}/produto/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const paginasCategorias: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${BASE_URL}/loja?categoria=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const paginasBlog: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : p.publicado_em ? new Date(p.publicado_em) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...paginasEstaticas, ...paginasProdutos, ...paginasCategorias, ...paginasBlog];
}
