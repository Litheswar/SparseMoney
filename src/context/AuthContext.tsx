import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

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
  phone?: string;
  upiId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (bankName: string, phone?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function generateUPI(name: string, email: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${suffix}@sparesmart`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Recover session on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch profile from our backend
          try {
            const { profile } = await api.profile.get();
            if (mounted) {
              setUser({
                id: session.user.id,
                name: profile.name || session.user.email?.split('@')[0] || 'User',
                email: profile.email || session.user.email || '',
                role: profile.role || 'user',
                avatar: profile.avatar,
                bankConnected: profile.is_bank_connected || false,
                bankName: profile.bank_name,
                maskedAccount: profile.masked_account,
                phone: profile.phone,
                upiId: profile.name ? generateUPI(profile.name, profile.email) : undefined,
              });
            }
          } catch {
            // Profile doesn't exist yet — user just signed up
            if (mounted) {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: 'user',
                bankConnected: false,
              });
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth changes (login/logout from other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) { setUser(null); setLoading(false); }
      } else if (event === 'SIGNED_IN' && session?.user && !user) {
        // Will be handled by the login/signup functions
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };

      // Fetch user profile
      try {
        const { profile } = await api.profile.get();
        setUser({
          id: data.user.id,
          name: profile.name || data.user.email?.split('@')[0] || 'User',
          email: profile.email || data.user.email || '',
          role: profile.role || 'user',
          avatar: profile.avatar,
          bankConnected: profile.is_bank_connected || false,
          bankName: profile.bank_name,
          maskedAccount: profile.masked_account,
          phone: profile.phone,
          upiId: profile.name ? generateUPI(profile.name, profile.email) : undefined,
        });
      } catch {
        // Profile doesn't exist — freshly signed-up user
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email || email,
          role: 'user',
          bankConnected: false,
        });
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Signup failed' };

      // Create user record in our database via backend API
      try {
        await api.auth.signup(name, email);
      } catch (e) {
        console.warn('Backend user creation issue (may already exist):', e);
      }

      setUser({
        id: data.user.id,
        name,
        email,
        role: 'user',
        bankConnected: false,
        upiId: generateUPI(name, email),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const completeOnboarding = useCallback(async (bankName: string, phone?: string) => {
    try {
      await api.auth.completeOnboarding(bankName, undefined, phone);
      setUser(prev => prev ? {
        ...prev,
        bankConnected: true,
        bankName,
        phone,
        maskedAccount: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
        upiId: prev.upiId || generateUPI(prev.name, prev.email),
      } : null);
    } catch (err) {
      console.error('Onboarding error:', err);
      // Still mark as completed on frontend so user can proceed
      setUser(prev => prev ? {
        ...prev,
        bankConnected: true,
        bankName,
        phone,
        maskedAccount: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      } : null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { profile } = await api.profile.get();
      setUser(prev => prev ? {
        ...prev,
        name: profile.name || prev.name,
        bankConnected: profile.is_bank_connected || false,
        bankName: profile.bank_name,
        maskedAccount: profile.masked_account,
        phone: profile.phone,
        avatar: profile.avatar,
        role: profile.role || 'user',
      } : null);
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, signup, logout,
      completeOnboarding, refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
