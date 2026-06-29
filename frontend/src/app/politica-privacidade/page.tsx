'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const secoes = [
  { titulo: '1. Informacoes que Coletamos', conteudo: 'Coletamos informacoes que voce nos fornece diretamente, como quando cria uma conta, realiza uma compra ou entra em contato conosco. Isso inclui nome completo, e-mail, telefone, endereco, dados de pagamento (processados de forma segura), historico de pedidos e informacoes de navegacao (cookies).' },
  { titulo: '2. Como Usamos suas Informacoes', conteudo: 'Utilizamos seus dados para processar e enviar seus pedidos, enviar atualizacoes e promocoes, melhorar nossos servicos, prevenir fraudes e cumprir obrigacoes legais.' },
  { titulo: '3. Compartilhamento de Dados', conteudo: 'Nao vendemos suas informacoes pessoais. Compartilhamos dados apenas com parceiros essenciais para o funcionamento do servico, como transportadoras e processadores de pagamento, sempre seguindo rigorosas politicas de seguranca.' },
  { titulo: '4. Seus Direitos', conteudo: 'Voce tem direito a acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato conosco pelo e-mail privacidade@rataplam.com.br ou telefone (11) 99999-9999.' },
  { titulo: '5. Cookies', conteudo: 'Utilizamos cookies para melhorar sua experiencia. Voce pode configurar seu navegador para recusar cookies, mas isso pode afetar o funcionamento do site.' },
  { titulo: '6. Seguranca', conteudo: 'Adotamos medidas tecnicas e organizacionais para proteger seus dados contra acesso nao autorizado, alteracao, divulgacao ou destruicao.' },
  { titulo: '7. Alteracoes', conteudo: 'Esta politica pode ser atualizada periodicamente. Recomendamos que voce a revise regularmente. Alteracoes significativas serao comunicadas por e-mail.' },
];

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Politica de Privacidade</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Politica de Privacidade</h1>
          <p className="text-gray-500 mb-8">Ultima atualizacao: Janeiro de 2025</p>

          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
            {secoes.map((s, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{s.titulo}</h2>
                <p className="text-gray-700 leading-relaxed">{s.conteudo}</p>
              </section>
            ))}

            <div className="border-t pt-6 text-sm text-gray-500">
              <p>Duvidas? Entre em contato: <a href="mailto:privacidade@rataplam.com.br" className="text-rose-600 hover:underline">privacidade@rataplam.com.br</a></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
