'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { CarrinhoProvider } from '@/lib/carrinho';
import PopupManager from '@/components/popup/PopupManager';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        {children}
        <PopupManager />
      </CarrinhoProvider>
    </AuthProvider>
  );
}
