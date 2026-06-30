'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: string;
  telefone?: string;
  cpf?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  cadastro: (dados: Record<string, string>) => Promise<void>;
  logout: () => void;
  atualizar: (dados: Partial<Usuario>) => Promise<void>;
  isLogado: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rataplam_token');
    if (token) {
      api.get('/api/auth/me')
        .then((data) => { if (data.usuario) setUsuario(data.usuario); })
        .catch(() => localStorage.removeItem('rataplam_token'))
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await api.post('/api/auth/login', { email, senha });
    localStorage.setItem('rataplam_token', data.token);
    setUsuario(data.usuario);
    return data.usuario;
  }, []);

  const cadastro = useCallback(async (dados: Record<string, string>) => {
    const data = await api.post('/api/auth/cadastro', dados);
    localStorage.setItem('rataplam_token', data.token);
    setUsuario(data.usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rataplam_token');
    setUsuario(null);
  }, []);

  const atualizar = useCallback(async (dados: Partial<Usuario>) => {
    try {
      await api.put('/api/auth/me', dados);
      setUsuario((prev) => prev ? { ...prev, ...dados } : null);
    } catch {
      throw new Error('Erro ao atualizar dados');
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      usuario, carregando, login, cadastro, logout, atualizar,
      isLogado: !!usuario,
      isAdmin: usuario?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
