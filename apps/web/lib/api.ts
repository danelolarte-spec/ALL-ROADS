'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ar_token');
}

export function setToken(token: string) {
  localStorage.setItem('ar_token', token);
}

export function clearToken() {
  localStorage.removeItem('ar_token');
  localStorage.removeItem('ar_user');
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ar_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem('ar_user', JSON.stringify(user));
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { json?: any } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    clearToken();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const fetcher = (path: string) => api(path);
