'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Pedido {
  id: string;
  numero: string;
  status: string;
  statusLabel: string;
  dataCriacao: string;
  valorTotal: number;
  itens: Array<{
    nome: string;
    quantidade: number;
    preco: number;
    imagem: string;
  }>;
  enderecoEntrega: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  rastreamento?: {
    codigo: string;
    transportadora: string;
    url: string;
  };
}

export default function RastrearPedidoPage() {
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busca.trim()) return;

    setCarregando(true);
    setErro('');
    setPedido(null);

    try {
      const dados = await api.get(`/api/pedidos/rastrear/${busca.trim()}`);
      setPedido(dados);
    } catch (erro) {
      setErro('Pedido nao encontrado. Verifique o numero do pedido.');
    } finally {
      setCarregando(false);
    }
  };

  const statusColors: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    pago: 'bg-blue-100 text-blue-800',
    separando: 'bg-purple-100 text-purple-800',
    enviado: 'bg-indigo-100 text-indigo-800',
    em_transito: 'bg-orange-100 text-orange-800',
    entregue: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
  };

  const statusSteps = ['pendente', 'pago', 'separando', 'enviado', 'em_transito', 'entregue'];

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Rastrear Pedido</h1>
          <p className="text-lg text-gray-600">
            Insira o numero do pedido para acompanhar a entrega
          </p>
        </div>

        <form onSubmit={handleBuscar} className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Numero do pedido (ex: 12345)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={carregando}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {carregando ? 'Buscando...' : 'Rastrear'}
            </button>
          </div>

          {!usuario && (
            <p className="mt-3 text-sm text-gray-500">
              Faca login para ver seus pedidos automaticamente.
            </p>
          )}
        </form>

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-red-700 font-medium">{erro}</p>
          </div>
        )}

        {pedido && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Pedido</p>
                  <p className="text-xl font-bold text-gray-900">#{pedido.numero}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[pedido.status] || 'bg-gray-100 text-gray-800'}`}>
                  {pedido.statusLabel}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span>📅</span>
                <span>
                  {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {(pedido.valorTotal || 0).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900 text-sm mb-3">Etapas do Pedido:</p>
                {statusSteps.map((step, index) => {
                  const currentIndex = statusSteps.indexOf(pedido.status);
                  const isComplete = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  return (
                    <div key={step} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-blue-50' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {isComplete ? '✓' : index + 1}
                      </div>
                      <span className={`text-sm capitalize ${isComplete ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {step.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {pedido.rastreamento && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">🚚 Rastreamento</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Transportadora:</strong> {pedido.rastreamento.transportadora}</p>
                  <p><strong>Codigo:</strong> {pedido.rastreamento.codigo}</p>
                  {pedido.rastreamento.url && (
                    <a
                      href={pedido.rastreamento.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-blue-600 font-semibold hover:underline"
                    >
                      Rastrear na transportadora →
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">📍 Endereco de Entrega</h3>
              <p className="text-gray-700">
                {pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}
                {pedido.enderecoEntrega.bairro && ` - ${pedido.enderecoEntrega.bairro}`}
                <br />
                {pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado}
                <br />
                CEP: {pedido.enderecoEntrega.cep}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
              <div className="space-y-4">
                {pedido.itens.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">👕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.nome}</p>
                      <p className="text-sm text-gray-500">
                        Qtd: {item.quantidade} x R$ {(item.preco || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      R$ {((item.preco || 0) * item.quantidade).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}