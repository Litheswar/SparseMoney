import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bankConnected: boolean;
  bankName?: string;
  maskedAccount?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  completeOnboarding: (bankName: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, User & { password: string }> = {
  'user@sparesmart.com': {
    id: 'u1',
    name: 'Arjun Mehta',
    email: 'user@sparesmart.com',
    role: 'user',
    password: 'user123',
    bankConnected: false,
  },
  'admin@sparesmart.com': {
    id: 'a1',
    name: 'Priya Sharma',
    email: 'admin@sparesmart.com',
    role: 'admin',
    password: 'admin123',
    bankConnected: true,
    bankName: 'HDFC',
    maskedAccount: 'XXXX-XXXX-4523',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string, role?: UserRole) => {
    const found = DEMO_USERS[email];
    if (found && found.password === password && (!role || found.role === role)) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const completeOnboarding = useCallback((bankName: string) => {
    setUser(prev => prev ? {
      ...prev,
      bankConnected: true,
      bankName,
      maskedAccount: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
    } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
