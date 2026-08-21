/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { User } from '../types/user';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('vibegram_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('vibegram_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('vibegram_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (usernameOrEmail: string, password: string) => {
    const res = await authApi.login({
      username_or_email: usernameOrEmail,
      password,
    });
    localStorage.setItem('vibegram_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
  }) => {
    const res = await authApi.register(data);
    localStorage.setItem('vibegram_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('vibegram_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
