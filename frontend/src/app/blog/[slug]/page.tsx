'use client';

import { useState, useEffect } from 'react';
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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPost = async () => {
      try {
        const dados = await api.get(`/api/blog/slug/${params.slug}`);
        setPost(dados);
      } catch (erro) {
        console.error('Erro ao carregar post:', erro);
      } finally {
        setCarregando(false);
      }
    };
    carregarPost();
  }, [params.slug]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post nao encontrado</h1>
          <p className="text-gray-600">O post que voce procura nao existe ou foi removido.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {post.imagem && (
            <div className="relative h-72 md:h-96">
              <img src={post.imagem} alt={post.titulo} className="w-full h-full object-cover" />
              {post.categoria && (
                <span className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                  {post.categoria}
                </span>
              )}
            </div>
          )}
          <div className="p-6 md:p-10">
            <time className="text-sm text-gray-500">
              {new Date(post.dataPublicacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-8 leading-tight">
              {post.titulo}
            </h1>
            <div
              className="prose prose-lg max-w-none prose-blue"
              dangerouslySetInnerHTML={{ __html: post.conteudo }}
            />
          </div>
        </article>

        <div className="text-center mt-10">
          <a href="/blog" className="text-blue-600 font-semibold hover:underline">
            ← Voltar ao Blog
          </a>
        </div>
      </div>
    </main>
  );
}