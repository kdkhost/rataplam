'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  ibge: string;
}

export function useCep() {
  const [carregando, setCarregando] = useState(false);
  const [endereco, setEndereco] = useState<EnderecoViaCep | null>(null);
  const [erro, setErro] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buscarCep = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setEndereco(null);
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErro('CEP nao encontrado');
        setEndereco(null);
      } else {
        setEndereco({
          cep: data.cep,
          logradouro: data.logradouro,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          ibge: data.ibge,
        });
      }
    } catch {
      setErro('Erro ao buscar CEP');
      setEndereco(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const buscarCepDebounce = useCallback((cep: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => buscarCep(cep), 500);
  }, [buscarCep]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return { endereco, carregando, erro, buscarCep, buscarCepDebounce, limpar: () => setEndereco(null) };
}
