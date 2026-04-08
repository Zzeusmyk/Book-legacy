import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const { data } = await api.get('/api/auth/me');
        setAuthor(data.author);
      }
    } catch {
      await SecureStore.deleteItemAsync('token');
      setAuthor(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    await SecureStore.setItemAsync('token', data.token);
    setAuthor(data.author);
    return data;
  };

  const register = async (fields) => {
    const { data } = await api.post('/api/auth/register', fields);
    await SecureStore.setItemAsync('token', data.token);
    setAuthor(data.author);
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    setAuthor(null);
  };

  const updateAuthor = (updated) => setAuthor(updated);

  return (
    <AuthContext.Provider value={{ author, loading, login, register, logout, updateAuthor }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
