'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { Botao, Input, Textarea, Toast } from '@/components/ui';

export default function ContatoPage() {
  const [toast, setToast] = useState('');
  const [tipoToast, setTipoToast] = useState<'sucesso' | 'erro'>('sucesso');
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post('/api/contato', form);
      setToast('Mensagem enviada com sucesso! Responderemos em breve.');
      setTipoToast('sucesso');
      setForm({ nome: '', email: '', assunto: '', mensagem: '' });
    } catch {
      setToast('Erro ao enviar mensagem. Tente novamente.');
      setTipoToast('erro');
    } finally { setEnviando(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">Inicio</Link> / <span className="text-gray-900">Contato</span>
          </nav>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contato</h1>
            <p className="text-lg text-gray-600">Tem alguma duvida? Fale conosco!</p>
          </div>

          {toast && <Toast mensagem={toast} tipo={tipoToast} onFechar={() => setToast('')} />}

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

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center text-white mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">E-mail</h3>
              <p className="text-sm text-gray-500">contato@rataplam.com.br</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center text-white mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Telefone</h3>
              <p className="text-sm text-gray-500">(11) 99999-9999</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-violet-500 flex items-center justify-center text-white mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Horario</h3>
              <p className="text-sm text-gray-500">Seg-Sex 9h as 18h</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
