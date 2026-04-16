/**
 * SpareSmart API Client
 * Centralized fetch wrapper that attaches the Supabase JWT token.
 */

import { supabase } from './supabase';

const API_BASE = '/api';

async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || `API error ${res.status}`);
  }

  return json.data;
}

// === AUTH ===
export const api = {
  auth: {
    signup: (name: string, email: string) =>
      apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email }) }),

    completeOnboarding: (bankName: string, maskedAccount?: string, phone?: string) =>
      apiFetch('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({ bank_name: bankName, masked_account: maskedAccount, phone }),
      }),
  },

  // === DASHBOARD ===
  dashboard: {
    getSummary: () => apiFetch('/dashboard/summary'),
  },

  // === TRANSACTIONS ===
  transactions: {
    simulate: (overrides?: { merchant?: string; category?: string; amount?: number }) =>
      apiFetch('/transactions/simulate', { method: 'POST', body: JSON.stringify(overrides || {}) }),

    list: (params?: { search?: string; category?: string; limit?: number; offset?: number }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.category) qs.set('category', params.category);
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.offset) qs.set('offset', String(params.offset));
      return apiFetch(`/transactions?${qs.toString()}`);
    },

    categories: () => apiFetch('/transactions/categories'),
  },

  // === WALLET ===
  wallet: {
    get: () => apiFetch('/wallet'),
    holdings: () => apiFetch('/wallet/holdings'),
    investments: () => apiFetch('/wallet/investments'),
    allocations: () => apiFetch('/wallet/allocations'),
  },

  // === RULES ===
  rules: {
    list: () => apiFetch('/rules'),
    create: (rule: { name: string; condition: string; action: string; target: string; category?: string; enabled?: boolean }) =>
      apiFetch('/rules', { method: 'POST', body: JSON.stringify(rule) }),
    toggle: (id: string) => apiFetch(`/rules/${id}/toggle`, { method: 'PATCH' }),
    delete: (id: string) => apiFetch(`/rules/${id}`, { method: 'DELETE' }),
  },

  // === GROUPS ===
  groups: {
    list: () => apiFetch('/groups'),
    create: (group: { name: string; goal: number; emoji?: string }) =>
      apiFetch('/groups', { method: 'POST', body: JSON.stringify(group) }),
    contribute: (groupId: string, amount: number) =>
      apiFetch(`/groups/${groupId}/contribute`, { method: 'POST', body: JSON.stringify({ amount }) }),
  },

  // === NOTIFICATIONS ===
  notifications: {
    list: (limit = 20) => apiFetch(`/notifications?limit=${limit}`),
    markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  },

  // === INSIGHTS ===
  insights: {
    spending: () => apiFetch('/insights/spending'),
    health: () => apiFetch('/insights/health'),
    personality: () => apiFetch('/insights/personality'),
    missed: () => apiFetch('/insights/missed'),
    risks: () => apiFetch('/insights/risks'),
    timeline: () => apiFetch('/insights/timeline'),
    baseValues: () => apiFetch('/insights/base-values'),
  },

  // === PROFILE ===
  profile: {
    get: () => apiFetch('/profile'),
    getSettings: () => apiFetch('/profile/settings'),
    update: (updates: { name?: string; avatar?: string }) =>
      apiFetch('/profile', { method: 'PATCH', body: JSON.stringify(updates) }),
    updateSettings: (settings: Record<string, unknown>) =>
      apiFetch('/profile/settings', { method: 'PATCH', body: JSON.stringify(settings) }),
  },

  // === MARKET DATA ===
  market: {
    prices: () => apiFetch('/market/prices'),
    portfolio: () => apiFetch('/market/portfolio'),
    history: () => apiFetch('/market/history'),
  },
};
