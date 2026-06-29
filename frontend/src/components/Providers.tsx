'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { CarrinhoProvider } from '@/lib/carrinho';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        {children}
      </CarrinhoProvider>
    </AuthProvider>
  );
}
