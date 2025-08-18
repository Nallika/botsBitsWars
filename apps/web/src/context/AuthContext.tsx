import React, { createContext, useContext, useState, ReactNode } from 'react';

import * as authService from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string;
  clearError: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(email, password);

      setUser({ email: data.email });

      return true;
    } catch (err: any) {
      setError(err.message);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    setError('');

    try {
      const data = await authService.register(email, password);

      setUser({ email: data.email });

      return true;
    } catch (err: any) {
      setError(err.message);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const clearError = () => {
    setError('');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
};
