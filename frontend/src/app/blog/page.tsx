'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';

interface Post {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  imagem: string;
  dataPublicacao: string;
  categoria: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPosts = async () => {
      try {
        const dados = await api.get('/api/blog?status=publicado');
        setPosts(dados.posts || []);
      } catch (erro) {
        console.error('Erro ao carregar posts:', erro);
      } finally {
        setCarregando(false);
      }
    };
    carregarPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Blog</span>
          </nav>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog RATAPLAM</h1>
            <p className="text-lg text-gray-600">Dicas de moda infantil, tendencias e novidades da nossa loja</p>
          </div>

          {carregando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum post publicado</h2>
              <p className="text-gray-600">Em breve teremos conteudo incrivel para voce!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                    <div className="relative h-48 bg-gray-100">
                      {post.imagem ? (
                        <Image src={post.imagem} alt={post.titulo} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📷</div>
                      )}
                      {post.categoria && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {post.categoria}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <time className="text-sm text-gray-500 mb-2">
                        {new Date(post.dataPublicacao).toLocaleDateString('pt-BR')}
                      </time>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.titulo}</h2>
                      <p className="text-gray-600 text-sm line-clamp-3 flex-1">{post.resumo}</p>
                      <span className="mt-4 text-rose-600 font-semibold text-sm">Ler mais →</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}