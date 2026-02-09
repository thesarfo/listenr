import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as apiAuth } from '../api/client';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  is_admin?: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'musicboxd_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (t: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      const me = await apiAuth.me();
      setUser({
        id: me.id,
        username: me.username,
        email: me.email,
        avatar_url: me.avatar_url,
        bio: me.bio,
        is_admin: me.is_admin ?? false,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setIsLoading(false);
      return;
    }
    loadUser(t).finally(() => setIsLoading(false));
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await apiAuth.login({ email, password });
    await loadUser(access_token);
  }, [loadUser]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { access_token } = await apiAuth.register({ username, email, password });
    await loadUser(access_token);
  }, [loadUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
