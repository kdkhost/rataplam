import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre a RATAPLAM | Roupas Infantis',
  description: 'Conheça a RATAPLAM - Roupas infantis com qualidade, conforto e estilo para crianças de 0 a 14 anos.',
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Sobre a RATAPLAM</h1>

        <div className="prose prose-lg mx-auto text-gray-600 space-y-8">
          <p className="text-xl text-center leading-relaxed">
            A RATAPLAM nasceu do amor por vestir crianças com conforto, qualidade e estilo.
            Nossa missão é oferecer roupas infantis que expressem a personalidade de cada pequeno,
            com materiais que respeitam a pele sensível das crianças.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👶</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">0 a 14 Anos</h3>
              <p className="text-sm text-gray-500">Roupas para todas as fases da infância</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧵</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Qualidade</h3>
              <p className="text-sm text-gray-500">Materiais selecionados e acabamento impecável</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Frete Grátis</h3>
              <p className="text-sm text-gray-500">Acima de R$ 199,90 para todo o Brasil</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa História</h2>
            <p>
              Fundada em São Paulo, a RATAPLAM rapidamente se tornou referência em moda infantil.
              Cada peça é pensada para proporcionar conforto e liberdade de movimento,
              permitindo que as crianças brinquem e sejam felizes com roupa de qualidade.
            </p>
            <p className="mt-4">
              Trabalhamos com tecidos como algodão, malha e viscose, garantindo maciez e durabilidade.
              Nossas estampas são desenvolvidas com carinho, pensando em temas que as crianças amam.
            </p>
          </div>

          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
            <p className="text-gray-500 mb-6">Estamos prontos para ajudá-lo(a)!</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="mailto:contato@rataplam.com.br" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                E-mail
              </a>
              <a href="/contato" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                Formulário
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
