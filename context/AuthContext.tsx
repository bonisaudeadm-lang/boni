import React, { useState, useEffect, useContext, createContext, useMemo, useCallback, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (credentials: any, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load user and token from storage
    const storedToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: any, rememberMe: boolean) => {
    const response = await api.login(credentials);
    
    // Defensively find the token, checking for both 'jwt' and 'JWT'
    const jwt = response.jwt || response.JWT;

    // Defensively find the user object, checking for different property names and casings (e.g., holder vs Holder)
    const finalUser = response.user || response.holder || response.User || response.Holder;

    if (!jwt) {
      console.error("JWT token not found in login response. Response received:", response);
      throw new Error('Token JWT não encontrado na resposta do login.');
    }
    
    if (!finalUser) {
      console.error("Login response missing user data. Response received:", response);
      throw new Error('Login bem-sucedido, mas dados do usuário não encontrados na resposta.');
    }
    
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('jwtToken', jwt);
    storage.setItem('user', JSON.stringify(finalUser));
    setToken(jwt);
    setUser(finalUser as User);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
