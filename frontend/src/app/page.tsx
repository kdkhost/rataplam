'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { useCarrinho } from '@/lib/carrinho';
import { useState } from 'react';

const products = [
  { id: 1, slug: 'macacao-cachorro', name: 'Macacao Cachorro', price: 89.90, image: 'https://static.wixstatic.com/media/e23129_e7615472cc5d4c2b8eae2d876d360ea3~mv2.jpg', estoque: 20 },
  { id: 2, slug: 'macacao-nemo', name: 'Macacao Nemo', price: 99.90, image: 'https://static.wixstatic.com/media/e23129_b887b8b44bd743749d0eeb3740846160~mv2.png', estoque: 20 },
  { id: 3, slug: 'macacao-selva', name: 'Macacao Selva', price: 94.90, image: 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg', estoque: 20 },
  { id: 4, slug: 'vestido-delicate', name: 'Vestido Delicate', price: 119.90, image: 'https://static.wixstatic.com/media/e23129_9f4c1c93c54d4137b82477ff0e685358~mv2.png', estoque: 20 },
  { id: 5, slug: 'bermuda-tropical', name: 'Bermuda Tropical', price: 69.90, image: 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg', estoque: 20 },
  { id: 6, slug: 'blusa-friends-trip', name: 'Blusa Friends Trip', price: 59.90, image: 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png', estoque: 20 },
  { id: 7, slug: 'biquini-liana', name: 'Biquini Liana', price: 79.90, image: 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png', estoque: 20 },
  { id: 8, slug: 'sapatinho-trico', name: 'Sapatinho Trico', price: 49.90, image: 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg', estoque: 20 },
];

const categories = [
  { name: 'Macacoes', slug: 'macacoes', image: 'https://static.wixstatic.com/media/e23129_74b957d328f247a7b23710257ada6d72~mv2.jpg' },
  { name: 'Bermudas', slug: 'bermudas', image: 'https://static.wixstatic.com/media/e23129_41db3354d3834c6ab8815821e5817913~mv2.jpg' },
  { name: 'Blusas', slug: 'blusas', image: 'https://static.wixstatic.com/media/e23129_c8f4906b9df04133a3121e86e1753485~mv2.png' },
  { name: 'Biquinis', slug: 'biquinis', image: 'https://static.wixstatic.com/media/e23129_8165b0bff17049beb94aa0d3359b9bbd~mv2.png' },
  { name: 'Calcas', slug: 'calcas', image: 'https://static.wixstatic.com/media/e23129_10c8ee98b97b48da930b65d821c3a821~mv2.png' },
  { name: 'Acessorios', slug: 'acessorios', image: 'https://static.wixstatic.com/media/e23129_4659ca570c404bb2b4d3831ff9dfd4b7~mv2.jpg' },
];

const ageRanges = [
  { label: '0-1', slug: '0-a-1', emoji: '\u{1F476}', color: 'from-rose-200 to-pink-200' },
  { label: '1-3', slug: '1-a-3', emoji: '\u{1F9F8}', color: 'from-pink-200 to-purple-200' },
  { label: '4-8', slug: '4-a-8', emoji: '\u{1F31F}', color: 'from-purple-200 to-violet-200' },
  { label: '10-14', slug: '10-a-14', emoji: '\u{1F680}', color: 'from-violet-200 to-fuchsia-200' },
];

const testimonials = [
  { name: 'Ana Carolina', location: 'Sao Paulo, SP', text: 'Roupas de qualidade incrivel! Meu filho adora os macacoes da RATAPLAM. Acabamento perfeito e tecido super macio.', rating: 5 },
  { name: 'Fernanda Lima', location: 'Rio de Janeiro, RJ', text: 'O provador virtual e incrivel! Consegui escolher a peca perfeita sem sair de casa. Recomendo demais!', rating: 5 },
  { name: 'Juliana Santos', location: 'Belo Horizonte, MG', text: 'Entrega rapida e roupas lindas. Ja sou cliente fiel ha 2 anos. Minha filha so quer usar RATAPLAM!', rating: 5 },
];

const trustItems = [
  { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h-.375a3 3 0 01-3-3V7.5a3 3 0 013-3h.375m0 0h16.5m-16.5 0a3 3 0 00-3 3v3.75a3 3 0 003 3h.375m16.5 0h.375a3 3 0 003-3V7.5a3 3 0 00-3-3h-.375m0 0V4.125a2.25 2.25 0 00-2.25-2.25H10.5m0 0h3m-3 0V1.5a2.25 2.25 0 00-2.25-2.25H5.625a2.25 2.25 0 00-2.25 2.25V4.125" /></svg>, title: 'Frete Gratis', description: 'Acima de R$ 199,00 para todo o Brasil' },
  { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, title: 'Pagamento Seguro', description: 'Criptografia e protecao de dados' },
  { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" /></svg>, title: 'Troca Facil', description: '30 dias para trocar sem complicacao' },
  { icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>, title: 'Feito com Amor', description: 'Peca a peca, pensando no bem-estar infantil' },
];

export default function Home() {
  const { adicionar } = useCarrinho();
  const [adicionado, setAdicionado] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleAddToCart = (product: typeof products[0]) => {
    adicionar({
      produto_id: product.id,
      nome: product.name,
      preco: product.price,
      imagem: product.image,
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
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-rose-400 via-pink-500 to-violet-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              Nova Colecao Verao 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Roupas que contam historias
            </h1>
            <p className="text-lg sm:text-xl text-rose-100 mb-10 max-w-xl leading-relaxed">
              Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos. Qualidade, conforto e estilo em cada peca.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/loja" className="inline-flex items-center justify-center px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:bg-rose-50 transition-all shadow-2xl shadow-pink-900/30 hover:scale-105">
                Ver Colecao
              </Link>
              <Link href="/provador-virtual" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white backdrop-blur-sm rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all hover:scale-105">
                Provador Virtual
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Nossas Categorias</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Encontre a peca perfeita para o seu pequeno</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/loja?categoria=${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 16vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-white font-bold text-sm sm:text-base">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Produtos em Destaque</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">As pecas mais amadas pelas criancas e pais</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <Link href={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-50">
                  <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    Novidade
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/produto/${product.slug}`}>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1 truncate hover:text-pink-600 transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-pink-600 font-extrabold text-lg mb-3">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                  <button onClick={() => handleAddToCart(product)} className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-sm hover:from-pink-600 hover:to-rose-600 transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-95">
                    {adicionado === product.id ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/loja" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-full font-bold text-lg hover:from-pink-600 hover:to-violet-600 transition-all shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105">
              Ver Todos os Produtos
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Por Idade</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Filtrar por faixa etaria para encontrar o tamanho ideal</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ageRanges.map((range) => (
              <Link key={range.slug} href={`/loja?faixa=${range.slug}`} className="group relative overflow-hidden rounded-3xl aspect-square">
                <div className={`absolute inset-0 bg-gradient-to-br ${range.color} group-hover:scale-110 transition-transform duration-500`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{range.emoji}</div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">{range.label} anos</h3>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ver pecas
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-8 sm:p-12 lg:p-16">
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
                <p className="text-purple-100 text-lg mb-8 max-w-lg leading-relaxed">
                  Envie uma foto da crianca e veja como a roupa fica nela em tempo real. Tecnologia de ponta para a melhor experiencia de compra.
                </p>
                <Link href="/provador-virtual" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-purple-50 transition-all shadow-2xl shadow-purple-900/30 hover:scale-105">
                  Experimentar Agora
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
              <div className="flex-shrink-0 w-64 h-64 sm:w-80 sm:h-80 relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20" />
                <div className="absolute inset-4 flex flex-col items-center justify-center text-center">
                  <svg className="w-16 h-16 text-white/80 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-white/70 text-sm font-medium">Tire uma foto</p>
                  <p className="text-white/50 text-xs mt-1">e veja o resultado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">O que dizem nossos clientes</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">A satisfacao das familias e a nossa maior motivacao</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-rose-50/50 border border-rose-100 hover:bg-rose-50 transition-colors duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white mb-4 shadow-lg shadow-pink-200">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-violet-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Receba ofertas exclusivas</h2>
          <p className="text-rose-100 text-lg mb-8 max-w-lg mx-auto">
            Cadastre-se e ganhe 10% de desconto na primeira compra. Novidades, lancamentos e promocoes direto no seu e-mail.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" className="flex-1 px-6 py-4 rounded-full text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30" required />
            <button type="submit" className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold hover:bg-rose-50 transition-all shadow-2xl shadow-pink-900/30 hover:scale-105 whitespace-nowrap">
              Cadastrar
            </button>
          </form>
          {newsletterMsg && <p className="text-white text-sm mt-4 font-medium">{newsletterMsg}</p>}
          {!newsletterMsg && <p className="text-rose-200 text-xs mt-4">Ao se cadastrar, voce concorda com nossa Politica de Privacidade.</p>}
        </div>
      </section>

      <Footer />
    </div>
  );
}
