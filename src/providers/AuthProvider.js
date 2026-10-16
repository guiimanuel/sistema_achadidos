import React, { createContext, useEffect, useState } from 'react';
import { observarAutenticacao } from '../services/auth';
import { acompanharNotificacoes } from '../services/notifications';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => observarAutenticacao((user) => {
    setUsuario(user);
    setCarregando(false);
  }), []);

  // Visitantes continuam recebendo novos itens; contatos exigem vínculo com a conta.
  useEffect(() => {
    if (carregando) return;
    return acompanharNotificacoes(usuario?.emailVerified ? usuario : null);
  }, [usuario, carregando]);

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}
