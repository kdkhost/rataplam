'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';

interface Post {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  imagem: string;
  dataPublicacao: string;
  categoria: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPost = async () => {
      try {
        const dados = await api.get(`/api/blog/slug/${params.slug}`);
        setPost(dados);
      } catch { setPost(null); }
      finally { setCarregando(false); }
    };
    carregarPost();
  }, [params.slug]);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="space-y-3"><div className="h-4 bg-gray-200 rounded" /><div className="h-4 bg-gray-200 rounded" /><div className="h-4 bg-gray-200 rounded w-5/6" /></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post nao encontrado</h1>
            <p className="text-gray-600 mb-6">O post que voce procura nao existe ou foi removido.</p>
            <Link href="/blog" className="inline-block px-6 py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200">
              Voltar ao Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <Link href="/blog" className="hover:text-gray-700">Blog</Link> / <span className="text-gray-900">{post.titulo}</span>
          </nav>

          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {post.imagem && (
              <div className="relative h-72 md:h-96">
                <Image src={post.imagem} alt={post.titulo} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                {post.categoria && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    {post.categoria}
                  </span>
                )}
              </div>
            )}
            <div className="p-6 md:p-10">
              <time className="text-sm text-gray-500">
                {new Date(post.dataPublicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </time>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-8 leading-tight">{post.titulo}</h1>
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.conteudo }} />
            </div>
          </article>

          <div className="text-center mt-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:underline">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Voltar ao Blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
