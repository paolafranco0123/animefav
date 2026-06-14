'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    authAPI.getProfile()
      .then(res => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error('error cargando perfil:', err);
        localStorage.removeItem('token');
        setLoading(false);
      })
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, []);


const login = async (email, password) => {
  const res = await authAPI.login({ email, password });
  const { token, user } = res.data;
  localStorage.setItem('token', token);
  setUser(user);
  return user;
};
  const register = async (data) => {
    const res = await authAPI.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
  <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}