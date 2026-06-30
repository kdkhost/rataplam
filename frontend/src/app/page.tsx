'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useCarrinho } from '@/lib/carrinho';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import ScrollReveal from '@/components/ScrollReveal';

interface Produto {
  id: number;
  slug: string;
  nome: string;
  preco: number;
  imagem: string;
  estoque: number;
  avaliacao?: number;
  promocao?: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  slug: string;
  imagem: string;
}

const ageRanges = [
  { label: '0-1', slug: '0-a-1', emoji: '\u{1F476}', color: 'from-brand-blue-light to-blue-100', accent: 'bg-brand-blue' },
  { label: '1-3', slug: '1-a-3', emoji: '\u{1F9F8}', color: 'from-brand-pink-light to-pink-100', accent: 'bg-brand-pink' },
  { label: '4-8', slug: '4-a-8', emoji: '\u{1F31F}', color: 'from-yellow-50 to-amber-100', accent: 'bg-amber-400' },
  { label: '10-14', slug: '10-a-14', emoji: '\u{1F680}', color: 'from-violet-50 to-purple-100', accent: 'bg-violet-500' },
];

const testimonials = [
  { name: 'Ana Carolina', location: 'Sao Paulo, SP', text: 'Roupas de qualidade incrivel! Meu filho adora os macacoes da RATAPLAM. Acabamento perfeito e tecido super macio.', rating: 5 },
  { name: 'Fernanda Lima', location: 'Rio de Janeiro, RJ', text: 'O provador virtual e incrivel! Consegui escolher a peca perfeita sem sair de casa. Recomendo demais!', rating: 5 },
  { name: 'Juliana Santos', location: 'Belo Horizonte, MG', text: 'Entrega rapida e roupas lindas. Ja sou cliente fiel ha 2 anos. Minha filha so quer usar RATAPLAM!', rating: 5 },
];

const fallbackProducts: Produto[] = [
  { id: 1, slug: 'macacao-cachorro', nome: 'Macacao Cachorro', preco: 89.90, imagem: 'https://static.wixstatic.com/media/e23129_e7615472cc5d4c2b8eae2d876d360ea3~mv2.jpg', estoque: 20 },
  { id: 2, slug: 'macacao-nemo', nome: 'Macacao Nemo', preco: 99.90, imagem: 'https://static.wixstatic.com/media/e23129_b887b8b44bd743749d0eeb3740846160~mv2.png', estoque: 20 },
  { id: 3, slug: 'macacao-selva', nome: 'Macacao Selva', preco: 94.90, imagem: 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg', estoque: 20 },
  { id: 4, slug: 'vestido-delicate', nome: 'Vestido Delicate', preco: 119.90, imagem: 'https://static.wixstatic.com/media/e23129_9f4c1c93c54d4137b82477ff0e685358~mv2.png', estoque: 20 },
  { id: 5, slug: 'bermuda-tropical', nome: 'Bermuda Tropical', preco: 69.90, imagem: 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg', estoque: 20 },
  { id: 6, slug: 'blusa-friends-trip', nome: 'Blusa Friends Trip', preco: 59.90, imagem: 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png', estoque: 20 },
  { id: 7, slug: 'biquini-liana', nome: 'Biquini Liana', preco: 79.90, imagem: 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png', estoque: 20 },
  { id: 8, slug: 'sapatinho-trico', nome: 'Sapatinho Trico', preco: 49.90, imagem: 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg', estoque: 20 },
];

const fallbackCategories: Categoria[] = [
  { id: 1, nome: 'Macacoes', slug: 'macacoes', imagem: 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg' },
  { id: 2, nome: 'Bermudas', slug: 'bermudas', imagem: 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg' },
  { id: 3, nome: 'Blusas', slug: 'blusas', imagem: 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png' },
  { id: 4, nome: 'Biquinis', slug: 'biquinis', imagem: 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png' },
  { id: 5, nome: 'Calcas', slug: 'calcas', imagem: 'https://static.wixstatic.com/media/e23129_10c8ee98b97b48da930b65d821c3a821~mv2.png' },
  { id: 6, nome: 'Acessorios', slug: 'acessorios', imagem: 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg' },
];

const trustItems = [
  { icon: '🚚', title: 'Frete Gratis', description: 'Acima de R$ 199,00 para todo o Brasil', color: 'bg-brand-blue-light text-brand-blue' },
  { icon: '🔒', title: 'Pagamento Seguro', description: 'Criptografia e protecao de dados', color: 'bg-brand-pink-light text-brand-pink' },
  { icon: '🔄', title: 'Troca Facil', description: '30 dias para trocar sem complicacao', color: 'bg-amber-50 text-amber-600' },
  { icon: '💛', title: 'Feito com Amor', description: 'Peca a peca, pensando no bem-estar infantil', color: 'bg-violet-50 text-violet-600' },
];

export default function Home() {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [products, setProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const dados = await api.get('/api/produtos?limit=8&destaque=true');
        setProducts(dados.produtos || []);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setCarregandoProdutos(false);
      }
    };
    carregarProdutos();
  }, []);

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const dados = await api.get('/api/admin/categorias');
        setCategories(dados.categorias || dados || []);
      } catch {
        setCategories(fallbackCategories);
      } finally {
        setCarregandoCategorias(false);
      }
    };
    carregarCategorias();
  }, []);

  const handleAddToCart = (product: Produto) => {
    adicionar({
      produto_id: product.id,
      nome: product.nome,
      preco: product.preco,
      imagem: product.imagem,
      quantidade: 1,
      estoque: product.estoque,
    });
    setAdicionado(product.id);
    setTimeout(() => setAdicionado(null), 1500);
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterMsg('E-mail cadastrado com sucesso! Em breve voce recebera nossas ofertas.');
    setEmail('');
    setTimeout(() => setNewsletterMsg(''), 5000);
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-blue-500 to-brand-pink text-white pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/3 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Nova Colecao Verao 2026
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
                Roupas que contam
                <span className="block bg-gradient-to-r from-white via-blue-100 to-pink-100 bg-clip-text text-transparent">
                  historias
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={200}>
              <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
                Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos. Mais de 60 anos de historia, amor e qualidade em cada peca.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/loja" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-blue rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95">
                  Ver Colecao
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link href="/sobre" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white backdrop-blur-sm rounded-2xl font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-95">
                  Nossa Historia
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-cream to-transparent" />
      </section>

      {/* Trust Bar */}
      <section className="relative -mt-6 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-xl shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-tight truncate">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="text-brand-blue font-semibold text-sm uppercase tracking-wider">Categorias</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Encontre o estilo ideal</h2>
              </div>
              <Link href="/loja" className="text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1 shrink-0">
                Ver todas
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {carregandoCategorias ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl aspect-square bg-gray-200 animate-pulse" />
              ))
            ) : categories.map((cat, i) => (
              <ScrollReveal key={cat.slug || cat.id} direction="up" delay={i * 60}>
                <Link href={`/loja?categoria=${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
                  {cat.imagem ? (
                    <Image src={cat.imagem} alt={cat.nome} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 16vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light to-brand-pink-light" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-white font-bold text-sm sm:text-base drop-shadow-lg">{cat.nome}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="text-brand-pink font-semibold text-sm uppercase tracking-wider">Destaques</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Mais amadas pelas criancas</h2>
              </div>
              <Link href="/loja" className="text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1 shrink-0">
                Ver todos
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {carregandoProdutos ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                  <div className="aspect-square bg-gray-200 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : products.map((product, i) => (
              <ScrollReveal key={product.id} direction="up" delay={i * 60}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <Link href={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
                    {product.imagem ? (
                      <Image src={product.imagem} alt={product.nome} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-light to-brand-pink-light flex items-center justify-center text-4xl text-gray-300">👕</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                    {product.promocao && (
                      <div className="absolute top-3 right-3 bg-brand-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Promoção
                      </div>
                    )}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-brand-blue hover:text-white transition-all cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/produto/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate group-hover:text-brand-blue transition-colors">{product.nome}</h3>
                    </Link>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, j) => (
                          <svg key={j} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs ml-1">(4.8)</span>
                    </div>
                    <p className="text-brand-blue font-extrabold text-lg mb-3">
                      R$ {(product.preco || 0).toFixed(2).replace('.', ',')}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                        adicionado === product.id
                          ? 'bg-green-500 text-white shadow-md shadow-green-200'
                          : 'bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white shadow-md shadow-brand-blue/20 hover:shadow-lg hover:from-brand-blue-dark hover:to-brand-blue'
                      }`}
                    >
                      {adicionado === product.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Adicionado!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          Adicionar
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Por Idade */}
      <section className="py-16 sm:py-24 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <span className="text-brand-pink font-semibold text-sm uppercase tracking-wider">Por Idade</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Filtrar por idade</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Encontre o tamanho ideal para cada fase</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {ageRanges.map((range, i) => (
              <ScrollReveal key={range.slug} direction="up" delay={i * 80}>
                <Link href={`/loja?faixa=${range.slug}`} className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${range.color} opacity-50 group-hover:opacity-70 transition-opacity`} />
                  <div className="relative p-6 sm:p-8 text-center">
                    <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{range.emoji}</div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{range.label} anos</h3>
                    <div className={`w-12 h-1 ${range.accent} rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300`} />
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Ver pecas
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Provador Virtual */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue via-blue-500 to-brand-pink text-white p-8 sm:p-12 lg:p-16">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Inteligencia Artificial
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">Provador Virtual com IA</h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
                    Envie uma foto da crianca e veja como a roupa fica nela em tempo real. Tecnologia de ponta para a melhor experiencia de compra.
                  </p>
                  <Link href="/provador-virtual" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95">
                    Experimentar Agora
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                </div>
                <div className="flex-shrink-0 w-64 h-64 sm:w-80 sm:h-80 relative">
                  <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20" />
                  <div className="absolute inset-4 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-white/80 text-sm font-medium">Tire uma foto</p>
                    <p className="text-white/50 text-xs mt-1">e veja o resultado</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 sm:py-24 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <span className="text-brand-blue font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">O que dizem nossos clientes</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">A satisfacao das familias e a nossa maior motivacao</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.location}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-brand-blue via-blue-500 to-brand-pink text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Newsletter
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Receba ofertas exclusivas</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
              Cadastre-se e ganhe 10% de desconto na primeira compra. Novidades, lancamentos e promocoes direto no seu e-mail.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" className="flex-1 px-6 py-4 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30" required />
              <button type="submit" className="px-8 py-4 bg-white text-brand-blue rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 whitespace-nowrap">
                Cadastrar
              </button>
            </form>
            {newsletterMsg && <p className="text-white text-sm mt-4 font-medium animate-fade-in">{newsletterMsg}</p>}
            {!newsletterMsg && <p className="text-blue-200 text-xs mt-4">Ao se cadastrar, voce concorda com nossa Politica de Privacidade.</p>}
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
