import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lumina_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('lumina_user');
      localStorage.removeItem('lumina_token');
      return null;
    }
  });

  const login = async (email, password) => {
    // Limpa dados antigos antes de logar
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');

    const { data } = await api.post('/api/auth/login', { email, password });

    if (!data.token || !data.user) throw new Error('Resposta inválida do servidor');

    localStorage.setItem('lumina_token', data.token);
    localStorage.setItem('lumina_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (full_name, email, password) => {
    // Limpa dados antigos antes de registrar
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');

    const { data } = await api.post('/api/auth/register', { full_name, email, password });

    if (!data.token || !data.user) throw new Error('Resposta inválida do servidor');

    localStorage.setItem('lumina_token', data.token);
    localStorage.setItem('lumina_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('lumina_token');
    localStorage.removeItem('lumina_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('lumina_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

