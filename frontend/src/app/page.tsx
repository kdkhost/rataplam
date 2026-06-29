import ContadorVisitas from '@/components/contador/ContadorVisitas';
import BannerCarousel from '@/components/banner/BannerCarousel';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <BannerCarousel />

      <main>
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Roupas Infantis</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Qualidade e conforto para o seu pequeno. Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/loja" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Ver Colecao
              </Link>
              <Link href="/provador-virtual" className="px-8 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors border border-gray-200">
                Provador Virtual
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Faixas Etarias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { nome: '0 a 1 ano', slug: '0-a-1', cor: 'from-pink-100 to-pink-50' },
                { nome: '1 a 3 anos', slug: '1-a-3', cor: 'from-purple-100 to-purple-50' },
                { nome: '4 a 8 anos', slug: '4-a-8', cor: 'from-blue-100 to-blue-50' },
                { nome: '10 a 14 anos', slug: '10-a-14', cor: 'from-green-100 to-green-50' },
              ].map((fx) => (
                <Link
                  key={fx.slug}
                  href={`/loja?faixa=${fx.slug}`}
                  className={`bg-gradient-to-br ${fx.cor} rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-sm`}
                >
                  <div className="text-4xl mb-3">👶</div>
                  <h3 className="text-lg font-semibold text-gray-800">{fx.nome}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { nome: 'Macacoes', slug: 'macacoes', icon: '👶' },
                { nome: 'Bermudas', slug: 'bermudas', icon: '🩳' },
                { nome: 'Blusas', slug: 'blusas', icon: '👕' },
                { nome: 'Biquinis', slug: 'biquinis', icon: '👙' },
                { nome: 'Calcás', slug: 'calcas', icon: '👖' },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/loja?categoria=${cat.slug}`}
                  className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="text-sm font-medium text-gray-700">{cat.nome}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Provador Virtual</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Envie uma foto da crianca e veja como a roupa fica nela em tempo real. Tecnologia de ponta para a melhor experiencia de compra.
            </p>
            <Link href="/provador-virtual" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Testar Provador Virtual
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
