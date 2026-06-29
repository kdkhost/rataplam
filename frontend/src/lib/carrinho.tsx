'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, formatarMoeda } from '@/lib/api';

interface ItemCarrinho {
  id: number;
  produto_id: number;
  variacao_id?: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
  tamanho?: string;
  cor?: string;
  estoque: number;
}

interface CarrinhoContextType {
  itens: ItemCarrinho[];
  total: number;
  totalItens: number;
  adicionar: (produto: Omit<ItemCarrinho, 'id'>) => void;
  remover: (index: number) => void;
  atualizarQuantidade: (index: number, qtd: number) => void;
  limpar: () => void;
  formatarTotal: () => string;
}

const CarrinhoContext = createContext<CarrinhoContextType>({} as CarrinhoContextType);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    const salvos = localStorage.getItem('rataplam_carrinho');
    if (salvos) {
      try { setItens(JSON.parse(salvos)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rataplam_carrinho', JSON.stringify(itens));
  }, [itens]);

  const adicionar = useCallback((produto: Omit<ItemCarrinho, 'id'>) => {
    setItens((prev) => {
      const existente = prev.findIndex(
        (i) => i.produto_id === produto.produto_id && i.variacao_id === produto.variacao_id
      );
      if (existente >= 0) {
        const novos = [...prev];
        novos[existente].quantidade += produto.quantidade;
        return novos;
      }
      return [...prev, { ...produto, id: Date.now() }];
    });
  }, []);

  const remover = useCallback((index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const atualizarQuantidade = useCallback((index: number, qtd: number) => {
    setItens((prev) => {
      const novos = [...prev];
      novos[index].quantidade = Math.max(1, qtd);
      return novos;
    });
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const formatarTotal = () => formatarMoeda(total);

  return (
    <CarrinhoContext.Provider value={{ itens, total, totalItens, adicionar, remover, atualizarQuantidade, limpar, formatarTotal }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
