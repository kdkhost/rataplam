'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useCep } from '@/lib/useCep';
import { Botao, Input, Select, Modal, Toast, Confirmar } from '@/components/ui';
import { maskCep } from '@/lib/masks';

interface Endereco { id: number; nome_destinatario: string; cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; principal: number; }

export default function ContaEnderecosPage() {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Endereco | null>(null);
  const [confirmar, setConfirmar] = useState<Endereco | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ nome_destinatario: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });

  const { buscarCepDebounce, endereco } = useCep();

  const carregar = useCallback(async () => {
    try { const data = await api.get('/api/enderecos'); setEnderecos(data.enderecos || []); }
    catch { setEnderecos([]); } finally { setCarregando(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleCep = (cep: string) => {
    setForm((p) => ({ ...p, cep: maskCep(cep) }));
    buscarCepDebounce(cep);
  };

  useEffect(() => {
    if (endereco) {
      setForm((p) => ({ ...p, logradouro: endereco.logradouro || '', bairro: endereco.bairro || '', cidade: endereco.cidade || '', estado: endereco.estado || '' }));
    }
  }, [endereco]);

  const salvar = async () => {
    try {
      if (editando) await api.put(`/api/enderecos/${editando.id}`, form);
      else await api.post('/api/enderecos', form);
      setModalAberto(false); setToast('Endereço salvo'); carregar();
    } catch { setToast('Erro ao salvar'); }
  };

  const excluir = async (e: Endereco) => {
    try { await api.delete(`/api/enderecos/${e.id}`); setToast('Excluído'); carregar(); }
    catch { setToast('Erro ao excluir'); }
  };

  const formVazio = { nome_destinatario: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' };

  return (
    <div>
      {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Meus Endereços</h2>
        <Botao onClick={() => { setEditando(null); setForm(formVazio); setModalAberto(true); }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Novo Endereço
        </Botao>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : enderecos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 mb-4">Nenhum endereço cadastrado</p>
          <Botao onClick={() => { setEditando(null); setForm(formVazio); setModalAberto(true); }}>Adicionar Endereço</Botao>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enderecos.map((end) => (
            <div key={end.id} className="bg-white rounded-2xl border border-gray-100 p-5 relative">
              {end.principal ? <span className="absolute top-3 right-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Principal</span> : null}
              <p className="font-medium text-gray-900">{end.nome_destinatario}</p>
              <p className="text-sm text-gray-500 mt-1">{end.logradouro}, {end.numero} {end.complemento ? `- ${end.complemento}` : ''}</p>
              <p className="text-sm text-gray-500">{end.bairro} - {end.cidade}/{end.estado}</p>
              <p className="text-sm text-gray-500">CEP: {end.cep}</p>
              <div className="flex gap-2 mt-4">
                <Botao variante="secundario" onClick={() => { setEditando(end); setForm(end); setModalAberto(true); }}>Editar</Botao>
                <Botao variante="perigo" onClick={() => setConfirmar(end)}>Excluir</Botao>
              </div>
            </div>
          ))}
        </div>
      )}

      <Confirmar aberto={!!confirmar} onFechar={() => setConfirmar(null)} onConfirmar={() => confirmar && excluir(confirmar)} titulo="Excluir Endereço" mensagem="Excluir este endereço?" variante="perigo" />

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={editando ? 'Editar Endereço' : 'Novo Endereço'}>
        <div className="space-y-4">
          <Input label="Nome do destinatário" value={form.nome_destinatario} onChange={(e) => setForm((p) => ({ ...p, nome_destinatario: e.target.value }))} />
          <Input label="CEP" value={form.cep} onChange={(e) => handleCep(e.target.value)} maxLength={9} />
          <Input label="Logradouro" value={form.logradouro} onChange={(e) => setForm((p) => ({ ...p, logradouro: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Número" value={form.numero} onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))} />
            <Input label="Complemento" value={form.complemento} onChange={(e) => setForm((p) => ({ ...p, complemento: e.target.value }))} />
          </div>
          <Input label="Bairro" value={form.bairro} onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cidade" value={form.cidade} onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))} />
            <Select label="Estado" value={form.estado} onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}>
              <option value="">UF</option>
              <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
              <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
              <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
              <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
              <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
              <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
              <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Botao variante="secundario" onClick={() => setModalAberto(false)}>Cancelar</Botao>
            <Botao onClick={salvar}>{editando ? 'Salvar' : 'Adicionar'}</Botao>
          </div>
        </div>
      </Modal>
    </div>
  );
}
