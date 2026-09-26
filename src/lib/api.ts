import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config/site';
import { useAuth } from '@/store/auth';
import type { AuthResponse } from '@/types';

export const api = axios.create({ baseURL: API_URL, timeout: 45000, headers: { 'Content-Type': 'application/json' } });

/** Friendly error message from any thrown value. */
export function apiError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = e as AxiosError<{ message?: string }>;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED') return 'The server is taking longer than usual to respond. Please try again in a moment.';
  if (err?.isAxiosError && !err.response) return 'We could not reach the server. Please check your connection and try again.';
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
export const apiStatus = (e: unknown): number | undefined => (e as AxiosError)?.response?.status;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuth.getState().accessToken;
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setSession, clear } = useAuth.getState();
  if (!refreshToken) return null;
  try {
    // plain axios so this call does not go through our interceptors
    const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 45000 });
    setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    return data.accessToken;
  } catch (e) {
    const status = apiStatus(e);
    if (status === 400 || status === 401 || status === 403) clear();
    return null;
  }
}

type Retriable = AxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as Retriable | undefined;
    const url = original?.url || '';
    const isAuthCall = /\/auth\/(login|register|refresh|forgot-password|reset-password)/.test(url);
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall && useAuth.getState().refreshToken) {
      original._retried = true;
      refreshing = refreshing || doRefresh().finally(() => { refreshing = null; });
      const token = await refreshing;
      if (token) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${token}` } as never;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET with retry + backoff (Render free tier cold starts). */
export async function getWithRetry<T>(url: string, config?: AxiosRequestConfig, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const { data } = await api.get<T>(url, config);
      return data;
    } catch (e) {
      last = e;
      const s = apiStatus(e);
      if (s && s >= 400 && s < 500 && s !== 408 && s !== 429) break; // don't retry real client errors
      if ((e as Error)?.name === 'CanceledError') break;
      await sleep(900 * Math.pow(2, i));
    }
  }
  throw last;
}
