'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmacaoConteudo() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get('pedido');
  const total = searchParams.get('total');

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Pedido Confirmado!</h1>
      <p className="text-gray-500 mb-2">Obrigado pela sua compra!</p>
      {pedido && (
        <p className="text-sm text-gray-600 mb-1">
          Numero do pedido: <strong className="text-gray-900">{pedido}</strong>
        </p>
      )}
      {total && (
        <p className="text-sm text-gray-600 mb-6">
          Total: <strong className="text-gray-900">R$ {parseFloat(total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </p>
      )}
      <p className="text-sm text-gray-500 mb-8">
        Voce recebera um e-mail com os detalhes do pedido e o codigo de rastreio apos o envio.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/conta/pedidos" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Meus Pedidos
        </Link>
        <Link href="/loja" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutConfirmacaoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>}>
      <ConfirmacaoConteudo />
    </Suspense>
  );
}
