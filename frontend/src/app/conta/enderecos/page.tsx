'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useCep } from '@/lib/useCep';
import { maskCep } from '@/lib/masks';
import { Modal, Toast, Confirmar } from '@/components/ui';

interface Endereco {
  id: number;
  nome_destinatario: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: number;
}

export default function ContaEnderecosPage() {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [confirmar, setConfirmar] = useState<Endereco | null>(null);
  const [toast, setToast] = useState('');
  const [tipoToast, setTipoToast] = useState<'sucesso' | 'erro'>('sucesso');
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome_destinatario: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const { buscarCepDebounce, endereco, carregando: cepCarregando } = useCep();

  const carregar = useCallback(async () => {
    try {
      const data = await api.get('/api/enderecos');
      setEnderecos(data.enderecos || []);
    } catch {
      setEnderecos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleCep = (cep: string) => {
    setForm((p) => ({ ...p, cep: maskCep(cep) }));
    buscarCepDebounce(cep);
  };

  useEffect(() => {
    if (endereco) {
      setForm((p) => ({
        ...p,
        logradouro: endereco.logradouro || '',
        bairro: endereco.bairro || '',
        cidade: endereco.cidade || '',
        estado: endereco.estado || '',
      }));
    }
  }, [endereco]);

  const salvar = async () => {
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/api/enderecos/${editando.id}`, form);
      } else {
        await api.post('/api/enderecos', form);
      }
      setModalAberto(false);
      setToast(editando ? 'Endereço atualizado com sucesso!' : 'Endereço adicionado com sucesso!');
      setTipoToast('sucesso');
      carregar();
    } catch {
      setToast('Erro ao salvar endereço');
      setTipoToast('erro');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (endereco: Endereco) => {
    try {
      await api.delete(`/api/enderecos/${endereco.id}`);
      setToast('Endereço excluído com sucesso!');
      setTipoToast('sucesso');
      carregar();
    } catch {
      setToast('Erro ao excluir endereço');
      setTipoToast('erro');
    }
  };

  const formVazio = {
    nome_destinatario: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  };

  const abrirModalNovo = () => {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  };

  const abrirModalEditar = (endereco: Endereco) => {
    setEditando(endereco);
    setForm(endereco);
    setModalAberto(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast mensagem={toast} tipo={tipoToast} onFechar={() => setToast('')} />}
      <Confirmar
        aberto={!!confirmar}
        onFechar={() => setConfirmar(null)}
        onConfirmar={() => confirmar && excluir(confirmar)}
        titulo="Excluir Endereço"
        mensagem="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        textoConfirmar="Excluir"
        variante="perigo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Endereços</h1>
            <p className="text-gray-500 mt-1">Gerencie seus endereços de entrega</p>
          </div>
          <button
            onClick={abrirModalNovo}
            className="py-3 px-6 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Novo Endereço
          </button>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-lg w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded-lg w-48 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded-lg w-40 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : enderecos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum endereço cadastrado</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Adicione um endereço para facilitar suas compras e entregas.</p>
              <button
                onClick={abrirModalNovo}
                className="inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Adicionar Endereço
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enderecos.map((endereco) => (
              <div
                key={endereco.id}
                className={`bg-white rounded-2xl border shadow-sm p-6 transition-all hover:shadow-md ${
                  endereco.principal ? 'border-rose-200 ring-1 ring-rose-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{endereco.nome_destinatario}</p>
                      {endereco.principal ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          Endereço principal
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-600">
                    {endereco.logradouro}, {endereco.numero}
                    {endereco.complemento ? ` - ${endereco.complemento}` : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">CEP: {endereco.cep}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => abrirModalEditar(endereco)}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmar(endereco)}
                    className="py-2.5 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={editando ? 'Editar Endereço' : 'Novo Endereço'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do destinatário</label>
            <input
              type="text"
              value={form.nome_destinatario}
              onChange={(e) => setForm((p) => ({ ...p, nome_destinatario: e.target.value }))}
              placeholder="Nome de quem vai receber"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
            <div className="relative">
              <input
                type="text"
                value={form.cep}
                onChange={(e) => handleCep(e.target.value)}
                maxLength={9}
                placeholder="00000-000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300 pr-10"
              />
              {cepCarregando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
            <input
              type="text"
              value={form.logradouro}
              onChange={(e) => setForm((p) => ({ ...p, logradouro: e.target.value }))}
              placeholder="Rua, Avenida, etc."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
                placeholder="Número"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
              <input
                type="text"
                value={form.complemento}
                onChange={(e) => setForm((p) => ({ ...p, complemento: e.target.value }))}
                placeholder="Apto, Bloco, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
            <input
              type="text"
              value={form.bairro}
              onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))}
              placeholder="Bairro"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                placeholder="Cidade"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-gray-700"
              >
                <option value="">UF</option>
                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
                <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
                <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
                <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
                <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button
              onClick={() => setModalAberto(false)}
              className="py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="py-3 px-6 bg-gradient-to-r from-rose-500 to-violet-500 text-white rounded-xl font-semibold hover:from-rose-600 hover:to-violet-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {editando ? 'Salvar Alterações' : 'Adicionar Endereço'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
