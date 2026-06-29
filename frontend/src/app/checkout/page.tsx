'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCarrinho } from '@/lib/carrinho';
import { useAuth } from '@/lib/auth';
import { api, formatarMoeda } from '@/lib/api';
import { maskCpf, maskTelefone, maskCep, maskCartao, maskValidade } from '@/lib/masks';
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
  const [freteConfig, setFreteConfig] = useState({ frete_gratis_valor: 199.90, frete_fixo: 15.90 });

  const [dados, setDados] = useState({
    nome: usuario?.nome || '', email: usuario?.email || '', cpf: '', telefone: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });

  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 });
  const frete = total >= freteConfig.frete_gratis_valor ? 0 : freteConfig.frete_fixo;

  useEffect(() => {
    api.get('/api/admin/configuracoes').then((data) => {
      const map: Record<string, string> = {};
      (data.configuracoes || []).forEach((c: { chave: string; valor: string }) => { map[c.chave] = c.valor; });
      setFreteConfig({
        frete_gratis_valor: parseFloat(map.frete_gratis_valor) || 199.90,
        frete_fixo: parseFloat(map.frete_fixo) || 15.90,
      });
    }).catch(() => {});
  }, []);

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
      if (data.tipo === 'percentual') {
        setDesconto(total * (data.valor / 100));
      } else {
        setDesconto(data.valor || data.desconto || 0);
      }
    } catch {
      setErro('Cupom invalido');
    }
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
      const pedidoData = await api.post('/api/pedidos', payload);

      try {
        const pagamentoData = await api.post('/api/pagamentos', {
          gateway,
          pedido_id: pedidoData.pedido_id,
        });
        limpar();
        if (pagamentoData.link_pagamento) {
          window.location.href = pagamentoData.link_pagamento;
          return;
        }
        router.push(`/checkout/confirmacao?pedido=${pedidoData.numero_pedido}&total=${(total + frete - desconto).toFixed(2)}`);
      } catch {
        limpar();
        router.push(`/checkout/confirmacao?pedido=${pedidoData.numero_pedido}&total=${(total + frete - desconto).toFixed(2)}`);
      }
    } catch (e: unknown) {
      setErro((e as { erro?: string }).erro || 'Erro ao processar pedido');
    } finally {
      setProcessando(false);
    }
  };

  if (itens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-rose-100 to-violet-100 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Nenhum item no carrinho</h2>
        <p className="text-gray-500 mb-10 text-lg">Adicione produtos para finalizar sua compra</p>
        <Link href="/loja" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          Ver Produtos
        </Link>
      </div>
    );
  }

  const passos = [
    { chave: 'dados', numero: 1, label: 'Dados' },
    { chave: 'pagamento', numero: 2, label: 'Pagamento' },
    { chave: 'confirmacao', numero: 3, label: 'Confirmacao' },
  ];

  const etapaIndex = passos.findIndex((p) => p.chave === etapa);

  const inputClasses = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 bg-gray-50 focus:bg-white";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex items-center justify-center gap-0 mb-10">
        {passos.map((p, i) => (
          <div key={p.chave} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${etapa === p.chave ? 'bg-gradient-to-br from-rose-500 to-violet-500 text-white shadow-lg shadow-rose-500/25 scale-110' : i < etapaIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < etapaIndex ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : p.numero}
              </div>
              <span className={`text-xs font-semibold mt-2 ${etapa === p.chave ? 'text-gray-900' : 'text-gray-400'}`}>{p.label}</span>
            </div>
            {i < passos.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${i < etapaIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {erro}
            </div>
          )}
          {errosValidacao.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Corrija os erros:
              </p>
              <ul className="list-disc pl-5 space-y-1">{errosValidacao.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}

          {etapa === 'dados' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Dados Pessoais</h2>
                <p className="text-sm text-gray-500 mt-1">Preencha seus dados para entrega</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClasses}>Nome Completo *</label>
                  <input type="text" value={dados.nome} onChange={(e) => setDados((p) => ({ ...p, nome: e.target.value }))} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>E-mail *</label>
                  <input type="email" value={dados.email} onChange={(e) => setDados((p) => ({ ...p, email: e.target.value }))} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Telefone *</label>
                  <input type="text" value={dados.telefone} onChange={(e) => setDados((p) => ({ ...p, telefone: maskTelefone(e.target.value) }))} className={inputClasses} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className={labelClasses}>CPF *</label>
                  <input type="text" value={dados.cpf} onChange={(e) => setDados((p) => ({ ...p, cpf: maskCpf(e.target.value) }))} className={inputClasses} placeholder="000.000.000-00" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Endereco de Entrega</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClasses}>CEP *</label>
                    <input type="text" value={dados.cep} onChange={(e) => handleCepChange(maskCep(e.target.value))} onBlur={handleCepBlur} className={inputClasses} placeholder="00000-000" />
                    {carregandoCep && <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1"><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Buscando...</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClasses}>Logradouro *</label>
                    <input type="text" value={dados.logradouro} onChange={(e) => setDados((p) => ({ ...p, logradouro: e.target.value }))} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Numero *</label>
                    <input type="text" value={dados.numero} onChange={(e) => setDados((p) => ({ ...p, numero: e.target.value }))} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Complemento</label>
                    <input type="text" value={dados.complemento} onChange={(e) => setDados((p) => ({ ...p, complemento: e.target.value }))} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Bairro *</label>
                    <input type="text" value={dados.bairro} onChange={(e) => setDados((p) => ({ ...p, bairro: e.target.value }))} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Cidade *</label>
                    <input type="text" value={dados.cidade} onChange={(e) => setDados((p) => ({ ...p, cidade: e.target.value }))} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Estado *</label>
                    <select value={dados.estado} onChange={(e) => setDados((p) => ({ ...p, estado: e.target.value }))} className={inputClasses}>
                      <option value="">UF</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={() => { if (validarDados()) setEtapa('pagamento'); }} className="w-full py-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5">
                Continuar para Pagamento
              </button>
            </div>
          )}

          {etapa === 'pagamento' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Forma de Pagamento</h2>
                <p className="text-sm text-gray-500 mt-1">Escolha como deseja pagar</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGateway('mercadopago')} className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${gateway === 'mercadopago' ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-500/10' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-black text-blue-600">MP</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">Mercado Pago</div>
                  <div className="text-xs text-gray-500 mt-1">Cartao, PIX ou boleto</div>
                </button>
                <button onClick={() => setGateway('stripe')} className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${gateway === 'stripe' ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-500/10' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <div className="w-12 h-12 mx-auto mb-3 bg-violet-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-black text-violet-600">S</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">Stripe</div>
                  <div className="text-xs text-gray-500 mt-1">Cartao internacional</div>
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Dados do Cartao</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <input type="text" placeholder="Numero do cartao" value={cartao.numero} onChange={(e) => setCartao((p) => ({ ...p, numero: maskCartao(e.target.value) }))} className={inputClasses} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center"><span className="text-[8px] font-bold text-gray-500">VISA</span></div>
                      <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center"><span className="text-[7px] font-bold text-gray-500">MC</span></div>
                    </div>
                  </div>
                  <input type="text" placeholder="Nome no cartao" value={cartao.nome} onChange={(e) => setCartao((p) => ({ ...p, nome: e.target.value }))} className={inputClasses} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/AA" value={cartao.validade} onChange={(e) => setCartao((p) => ({ ...p, validade: maskValidade(e.target.value) }))} className={inputClasses} />
                    <input type="text" placeholder="CVV" value={cartao.cvv} onChange={(e) => setCartao((p) => ({ ...p, cvv: e.target.value }))} className={inputClasses} maxLength={4} />
                  </div>
                  <select value={cartao.parcelas} onChange={(e) => setCartao((p) => ({ ...p, parcelas: Number(e.target.value) }))} className={inputClasses}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
                      const valorParcela = (total + frete - desconto) / n;
                      return <option key={n} value={n}>{n}x {n === 1 ? `de ${formatarMoeda(valorParcela)}` : `de ${formatarMoeda(valorParcela)} sem juros`}</option>;
                    })}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEtapa('dados')} className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Voltar
                </button>
                <button onClick={() => setEtapa('confirmacao')} className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5">
                  Revisar Pedido
                </button>
              </div>
            </div>
          )}

          {etapa === 'confirmacao' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Confirmar Pedido</h2>
                <p className="text-sm text-gray-500 mt-1">Revise seus dados antes de finalizar</p>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{dados.nome}</span></div>
                    <div><span className="text-gray-500">E-mail:</span> <span className="font-medium">{dados.email}</span></div>
                    <div><span className="text-gray-500">CPF:</span> <span className="font-medium">{dados.cpf}</span></div>
                    <div><span className="text-gray-500">Telefone:</span> <span className="font-medium">{dados.telefone}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Endereco de Entrega
                  </h3>
                  <p className="text-sm font-medium">{dados.logradouro}, {dados.numero} {dados.complemento ? `- ${dados.complemento}` : ''} - {dados.bairro}, {dados.cidade}/{dados.estado} - CEP: {dados.cep}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Pagamento
                  </h3>
                  <p className="text-sm font-medium">{gateway === 'mercadopago' ? 'Mercado Pago' : 'Stripe'} - {cartao.parcelas}x {cartao.parcelas === 1 ? 'a vista' : `de ${formatarMoeda((total + frete - desconto) / cartao.parcelas)}`}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEtapa('pagamento')} className="flex-1 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Voltar
                </button>
                <button onClick={handleCheckout} disabled={processando} className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  {processando ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Processando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Confirmar e Pagar
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-5">Seu Pedido</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {itens.map((item) => (
                <Link key={item.id} href={`/produto/${item.produto_id}`} className="flex items-center gap-3 text-sm hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative shrink-0">
                    {item.imagem ? (
                      <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-gray-300">🧸</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900">{item.nome}</p>
                    <p className="text-gray-500">Qtd: {item.quantidade}</p>
                  </div>
                  <span className="font-semibold text-gray-900">{formatarMoeda(item.preco * item.quantidade)}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input type="text" placeholder="Cupom de desconto" value={cupom} onChange={(e) => setCupom(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all" />
                <button onClick={aplicarCupom} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                  Aplicar
                </button>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatarMoeda(total)}</span></div>
              {desconto > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span className="font-medium">-{formatarMoeda(desconto)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Frete</span><span className={`font-medium ${frete === 0 ? 'text-green-600' : ''}`}>{frete === 0 ? 'Gratis' : formatarMoeda(frete)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100"><span className="text-gray-900">Total</span><span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">{formatarMoeda(total + frete - desconto)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
