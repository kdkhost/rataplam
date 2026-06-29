export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Politica de Privacidade</h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Informacoes que Coletamos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coletamos informacoes que voce nos fornece diretamente, como quando cria uma conta,
              realiza uma compra ou entra em contato conosco. Isso inclui:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Nome completo, e-mail, telefone e endereco</li>
              <li>Dados de pagamento (processados de forma segura por nossos parceiros)</li>
              <li>Historico de pedidos e preferencias de compra</li>
              <li>Informacoes de navegacao no site (cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Como Usamos suas Informacoes</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Processar e enviar seus pedidos</li>
              <li>Enviar atualizacoes sobre seus pedidos e promocoes</li>
              <li>Melhorar nossos servicos e experiencia de compra</li>
              <li>Prevenir fraudos e garantir seguranca</li>
              <li>Cumprir obrigacoes legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
            <p className="text-gray-700 leading-relaxed">
              Nao vendemos suas informacoes pessoais. Compartilhamos dados apenas com parceiros
              essenciais para o funcionamento do servico, como transportadoras e processadores
              de pagamento, sempre seguindo rigorosas politicas de seguranca.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seus Direitos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Voce tem direito a acessar, corrigir ou excluir seus dados pessoais a qualquer momento.
              Para exercer esses direitos, entre em contato通过:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>E-mail: privacidade@rataplam.com.br</li>
              <li>Telefone: (11) 99999-9999</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies para melhorar sua experiencia. Voce pode configurar seu navegador
              para recusar cookies, mas isso pode afetar o funcionamento do site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguranca</h2>
            <p className="text-gray-700 leading-relaxed">
              Adotamos medidas tecnicas e organizacionais para proteger seus dados contra acesso
              nao autorizado, alteracao, divulgacao ou destruicao.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Alteracoes</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta politica pode ser atualizada periodicamente. Recomendamos que voce a revise
              regularmente. Alteracoes significativas serao comunicadas por e-mail.
            </p>
          </section>

          <div className="border-t pt-6 text-sm text-gray-500">
            <p>Ultima atualizacao: Janeiro de 2025</p>
          </div>
        </div>
      </div>
    </main>
  );
}