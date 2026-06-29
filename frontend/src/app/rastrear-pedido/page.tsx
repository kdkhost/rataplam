'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { api, formatarMoeda } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Pedido {
  id: string;
  numero: string;
  status: string;
  statusLabel: string;
  dataCriacao: string;
  valorTotal: number;
  itens: Array<{ nome: string; quantidade: number; preco: number; imagem: string }>;
  enderecoEntrega: { logradouro: string; numero: string; bairro: string; cidade: string; estado: string; cep: string };
  rastreamento?: { codigo: string; transportadora: string; url: string };
}

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  pago: 'bg-blue-100 text-blue-800',
  em_separacao: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  em_transito: 'bg-orange-100 text-orange-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente', pago: 'Pago', em_separacao: 'Em Separacao', enviado: 'Enviado',
  em_transito: 'Em Transito', entregue: 'Entregue', cancelado: 'Cancelado',
};

const statusSteps = ['pendente', 'pago', 'em_separacao', 'enviado', 'em_transito', 'entregue'];

export default function RastrearPedidoPage() {
  const { usuario } = useAuth();
  const [busca, setBusca] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busca.trim()) return;
    setCarregando(true);
    setErro('');
    setPedido(null);
    setBuscou(true);
    try {
      const dados = await api.get(`/api/pedidos/${busca.trim()}`);
      setPedido(dados.pedido);
    } catch {
      setErro('Pedido nao encontrado. Verifique o numero do pedido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Rastrear Pedido</span>
          </nav>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Rastrear Pedido</h1>
            <p className="text-lg text-gray-600">Insira o numero do pedido para acompanhar a entrega</p>
          </div>

          <form onSubmit={handleBuscar} className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex gap-3">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
                placeholder="Numero do pedido (ex: RAT-20260629-001)"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all" />
              <button type="submit" disabled={carregando}
                className="px-8 py-3 bg-gradient-to-r from-rose-500 to-violet-500 text-white font-bold rounded-xl hover:from-rose-600 hover:to-violet-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-200">
                {carregando ? 'Buscando...' : 'Rastrear'}
              </button>
            </div>
            {!usuario && <p className="mt-3 text-sm text-gray-500">Faca login para ver seus pedidos automaticamente.</p>}
          </form>

          {carregando && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          )}

          {erro && !carregando && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-700 font-medium mb-2">{erro}</p>
              <Link href="/conta/pedidos" className="text-rose-600 hover:underline text-sm font-medium">Ver meus pedidos</Link>
            </div>
          )}

          {!buscou && !carregando && (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500">Digite o numero do pedido acima para acompanhar sua entrega</p>
            </div>
          )}

          {pedido && !carregando && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Pedido</p>
                    <p className="text-xl font-bold text-gray-900">#{pedido.numero}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[pedido.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[pedido.status] || pedido.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                <div className="flex items-center gap-2 mb-6 p-3 bg-rose-50 rounded-xl">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatarMoeda(pedido.valorTotal || 0)}</p>
                  </div>
                </div>

                <p className="font-semibold text-gray-900 text-sm mb-3">Etapas do Pedido:</p>
                <div className="space-y-2">
                  {statusSteps.map((step, index) => {
                    const currentIndex = statusSteps.indexOf(pedido.status);
                    const isComplete = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    return (
                      <div key={step} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrent ? 'bg-rose-50 border border-rose-200' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isComplete ? 'bg-gradient-to-r from-rose-500 to-violet-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isComplete ? '✓' : index + 1}
                        </div>
                        <span className={`text-sm ${isComplete ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                          {step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {pedido.rastreamento && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Rastreamento</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Transportadora:</strong> {pedido.rastreamento.transportadora}</p>
                    <p><strong>Codigo:</strong> {pedido.rastreamento.codigo}</p>
                    {pedido.rastreamento.url && (
                      <a href={pedido.rastreamento.url} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-2 text-rose-600 font-semibold hover:underline">
                        Rastrear na transportadora →
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">Endereco de Entrega</h3>
                <p className="text-gray-700">
                  {pedido.enderecoEntrega.logradouro}, {pedido.enderecoEntrega.numero}
                  {pedido.enderecoEntrega.bairro && ` - ${pedido.enderecoEntrega.bairro}`}<br />
                  {pedido.enderecoEntrega.cidade} - {pedido.enderecoEntrega.estado}<br />
                  CEP: {pedido.enderecoEntrega.cep}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Itens do Pedido</h3>
                <div className="space-y-4">
                  {pedido.itens.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative">
                        {item.imagem ? (
                          <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">👕</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.nome}</p>
                        <p className="text-sm text-gray-500">Qtd: {item.quantidade} x {formatarMoeda(item.preco || 0)}</p>
                      </div>
                      <p className="font-bold text-gray-900">{formatarMoeda((item.preco || 0) * item.quantidade)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
