'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Botao, Input, Textarea, Toast } from '@/components/ui';

export default function ContatoPage() {
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post('/api/contato', form);
      setToast('Mensagem enviada com sucesso!');
      setForm({ nome: '', email: '', assunto: '', mensagem: '' });
    } catch {
      setToast('Erro ao enviar mensagem');
    } finally { setEnviando(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Contato</h1>
        <p className="text-gray-500 text-center mb-12">Tem alguma dúvida? Fale conosco!</p>

        {toast && <Toast mensagem={toast} onFechar={() => setToast('')} />}

        <form onSubmit={enviar} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nome" value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} required />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <Input label="Assunto" value={form.assunto} onChange={(e) => setForm((p) => ({ ...p, assunto: e.target.value }))} required />
          <Textarea label="Mensagem" value={form.mensagem} onChange={(e) => setForm((p) => ({ ...p, mensagem: e.target.value }))} rows={6} required />
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Enviando...' : 'Enviar Mensagem'}
          </Botao>
        </form>
      </div>
    </div>
  );
}
