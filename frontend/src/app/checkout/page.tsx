'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCarrinho } from '@/lib/carrinho';
import { useAuth } from '@/lib/auth';
import { api, formatarMoeda } from '@/lib/api';
import { maskCpf, maskTelefone, maskCep } from '@/lib/masks';
import { useCep } from '@/lib/useCep';

export default function CheckoutPage() {
  const router = useRouter();
  const { itens, total, limpar } = useCarrinho();
  const { usuario } = useAuth();
  const { endereco: enderecoCep, buscarCepDebounce, carregando: carregandoCep } = useCep();
  const [etapa, setEtapa] = useState<'dados' | 'pagamento' | 'confirmacao'>('dados');
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [gateway, setGateway] = useState<'mercadopago' | 'stripe'>('mercadopago');
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);

  const [dados, setDados] = useState({
    nome: usuario?.nome || '', email: usuario?.email || '', cpf: '', telefone: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });

  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 });
  const frete = total >= 199.90 ? 0 : 15.90;

  const handleCepChange = (valor: string) => {
    setDados((prev) => ({ ...prev, cep: valor }));
    buscarCepDebounce(valor);
  };

  const handleCepBlur = () => {
    if (enderecoCep) {
      setDados((prev) => ({
        ...prev,
        logradouro: enderecoCep.logradouro,
        bairro: enderecoCep.bairro,
        cidade: enderecoCep.cidade,
        estado: enderecoCep.estado,
      }));
    }
  };

  const validarDados = (): boolean => {
    const erros: string[] = [];
    if (!dados.nome.trim()) erros.push('Nome e obrigatorio');
    if (!dados.email.trim()) erros.push('E-mail e obrigatorio');
    if (!dados.cpf.trim() || dados.cpf.replace(/\D/g, '').length < 11) erros.push('CPF invalido');
    if (!dados.telefone.trim()) erros.push('Telefone e obrigatorio');
    if (!dados.cep.trim()) erros.push('CEP e obrigatorio');
    if (!dados.logradouro.trim()) erros.push('Logradouro e obrigatorio');
    if (!dados.numero.trim()) erros.push('Numero e obrigatorio');
    if (!dados.bairro.trim()) erros.push('Bairro e obrigatorio');
    if (!dados.cidade.trim()) erros.push('Cidade e obrigatoria');
    if (!dados.estado.trim()) erros.push('Estado e obrigatorio');
    setErrosValidacao(erros);
    return erros.length === 0;
  };

  const aplicarCupom = async () => {
    if (!cupom.trim()) return;
    try {
      const data = await api.post('/api/cupons/validar', { codigo: cupom });
      if (data.desconto) setDesconto(data.desconto);
    } catch { setErro('Cupom invalido'); }
  };

  const handleCheckout = async () => {
    setProcessando(true);
    setErro('');
    try {
      const payload = {
        itens: itens.map((i) => ({
          produto_id: i.produto_id,
          variacao_id: i.variacao_id,
          quantidade: i.quantidade,
          preco: i.preco,
          nome: i.nome,
        })),
        ...dados,
        gateway,
        cupom: cupom || undefined,
      };
      const data = await api.post('/api/pedidos', payload);
      limpar();
      router.push(`/checkout/confirmacao?pedido=${data.numero_pedido}&total=${(total + frete - desconto).toFixed(2)}`);
    } catch (e: unknown) {
      setErro((e as { erro?: string }).erro || 'Erro ao processar pedido');
    } finally {
      setProcessando(false);
    }
  };

  if (itens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum item no carrinho</h2>
        <Link href="/loja" className="text-blue-600 hover:underline">Voltar a loja</Link>
      </div>
    );
  }

  const passos = [
    { chave: 'dados', numero: 1, label: 'Dados Pessoais' },
    { chave: 'pagamento', numero: 2, label: 'Pagamento' },
    { chave: 'confirmacao', numero: 3, label: 'Confirmacao' },
  ];

  const etapaIndex = passos.findIndex((p) => p.chave === etapa);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex items-center gap-4 mb-8">
        {passos.map((e, i) => (
          <div key={e.chave} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${etapa === e.chave ? 'bg-blue-600 text-white' : i < etapaIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < etapaIndex ? '✓' : e.numero}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${etapa === e.chave ? 'text-gray-900' : 'text-gray-400'}`}>{e.label}</span>
            {i < passos.length - 1 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {erro && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">{erro}</div>}
          {errosValidacao.length > 0 && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm">
              <p className="font-medium mb-1">Corrija os erros:</p>
              <ul className="list-disc pl-5">{errosValidacao.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {etapa === 'dados' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" value={dados.nome} onChange={(e) => setDados((p) => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input type="email" value={dados.email} onChange={(e) => setDados((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                  <input type="text" value={dados.cpf} onChange={(e) => setDados((p) => ({ ...p, cpf: maskCpf(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input type="text" value={dados.telefone} onChange={(e) => setDados((p) => ({ ...p, telefone: maskTelefone(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="(00) 00000-0000" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 pt-4">Endereco de Entrega</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <input type="text" value={dados.cep} onChange={(e) => handleCepChange(maskCep(e.target.value))} onBlur={handleCepBlur} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="00000-000" />
                  {carregandoCep && <p className="text-xs text-blue-500 mt-1">Buscando...</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
                  <input type="text" value={dados.logradouro} onChange={(e) => setDados((p) => ({ ...p, logradouro: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero *</label>
                  <input type="text" value={dados.numero} onChange={(e) => setDados((p) => ({ ...p, numero: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input type="text" value={dados.complemento} onChange={(e) => setDados((p) => ({ ...p, complemento: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                  <input type="text" value={dados.bairro} onChange={(e) => setDados((p) => ({ ...p, bairro: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                  <input type="text" value={dados.cidade} onChange={(e) => setDados((p) => ({ ...p, cidade: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select value={dados.estado} onChange={(e) => setDados((p) => ({ ...p, estado: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">UF</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { if (validarDados()) setEtapa('pagamento'); }} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors mt-4">
                Continuar para Pagamento
              </button>
            </div>
          )}

          {etapa === 'pagamento' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Forma de Pagamento</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGateway('mercadopago')} className={`p-4 rounded-xl border-2 text-center transition-colors ${gateway === 'mercadopago' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-2xl mb-1">💳</div>
                  <div className="text-sm font-medium">Mercado Pago</div>
                </button>
                <button onClick={() => setGateway('stripe')} className={`p-4 rounded-xl border-2 text-center transition-colors ${gateway === 'stripe' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="text-sm font-medium">Stripe</div>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Dados do Cartao</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Numero do cartao" value={cartao.numero} onChange={(e) => setCartao((p) => ({ ...p, numero: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" placeholder="Nome no cartao" value={cartao.nome} onChange={(e) => setCartao((p) => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/AA" value={cartao.validade} onChange={(e) => setCartao((p) => ({ ...p, validade: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="text" placeholder="CVV" value={cartao.cvv} onChange={(e) => setCartao((p) => ({ ...p, cvv: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <select value={cartao.parcelas} onChange={(e) => setCartao((p) => ({ ...p, parcelas: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}x {n === 1 ? `de ${formatarMoeda(total / n)}` : `de ${formatarMoeda(total / n)} sem juros`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEtapa('dados')} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Voltar</button>
                <button onClick={() => setEtapa('confirmacao')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Revisar Pedido</button>
              </div>
            </div>
          )}

          {etapa === 'confirmacao' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Confirmar Pedido</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <div><span className="text-gray-500">Nome:</span> {dados.nome}</div>
                <div><span className="text-gray-500">E-mail:</span> {dados.email}</div>
                <div><span className="text-gray-500">CPF:</span> {dados.cpf}</div>
                <div><span className="text-gray-500">Endereco:</span> {dados.logradouro}, {dados.numero} - {dados.bairro}, {dados.cidade}/{dados.estado}</div>
                <div><span className="text-gray-500">CEP:</span> {dados.cep}</div>
                <div><span className="text-gray-500">Pagamento:</span> {gateway === 'mercadopago' ? 'Mercado Pago' : 'Stripe'} ({cartao.parcelas}x)</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEtapa('pagamento')} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Voltar</button>
                <button onClick={handleCheckout} disabled={processando} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                  {processando ? 'Processando...' : 'Confirmar e Pagar'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seu Pedido</h3>
            <div className="space-y-3">
              {itens.map((item) => (
                <Link key={item.id} href={`/produto/${item.produto_id}`} className="flex items-center gap-3 text-sm hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                    {item.imagem ? (
                      <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">🧸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.nome}</p>
                    <p className="text-gray-500">Qtd: {item.quantidade}</p>
                  </div>
                  <span className="font-medium">{formatarMoeda(item.preco * item.quantidade)}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input type="text" placeholder="Cupom de desconto" value={cupom} onChange={(e) => setCupom(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none" />
                <button onClick={aplicarCupom} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatarMoeda(total)}</span></div>
              {desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatarMoeda(desconto)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className={frete === 0 ? 'text-green-600 font-medium' : ''}>{frete === 0 ? 'Gratis' : formatarMoeda(frete)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100"><span>Total</span><span>{formatarMoeda(total + frete - desconto)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
