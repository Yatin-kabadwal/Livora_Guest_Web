'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getWithRetry } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const cache = new Map<string, { at: number; data: unknown }>();
const inflight = new Map<string, Promise<unknown>>();

interface Opts { ttl?: number; enabled?: boolean; params?: Record<string, unknown>; tries?: number; isValid?: (d: unknown) => boolean }

/**
 * Fetch a public GET endpoint with cache, retry/backoff and a "waking" flag
 * that turns true after 6s of waiting (Render free-tier cold start).
 */
export function useFetch<T>(url: string | null, opts: Opts = {}) {
  const { ttl = 60_000, enabled = true, params, tries = 3, isValid } = opts;
  const key = url ? url + '?' + JSON.stringify(params || {}) : '';
  // Initial state must match the server render (no cache read), so hydration is stable.
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!!url && enabled);
  const [error, setError] = useState<unknown>(null);
  const [waking, setWaking] = useState(false);
  const [nonce, setNonce] = useState(0);
  const alive = useRef(true);

  useIsoLayoutEffect(() => {
    const c = key ? (cache.get(key) as { at: number; data: T } | undefined) : undefined;
    if (c && Date.now() - c.at < ttl) { setData(c.data); setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    if (!url || !enabled) { setLoading(false); return; }
    const c = cache.get(key) as { at: number; data: T } | undefined;
    if (c && Date.now() - c.at < ttl && nonce === 0) { setData(c.data); setLoading(false); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => { if (!cancelled) setWaking(true); }, 6000);
    let p = inflight.get(key) as Promise<T> | undefined;
    if (!p || nonce > 0) {
      const cfg: AxiosRequestConfig = { params };
      p = getWithRetry<T>(url, cfg, tries)
        .then((d) => { if (isValid && !isValid(d)) throw new Error('Unexpected response from server'); return d; })
        .finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    p.then((d) => {
      cache.set(key, { at: Date.now(), data: d });
      if (!cancelled) { setData(d); setError(null); }
    }).catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { clearTimeout(timer); if (!cancelled) { setLoading(false); setWaking(false); } });
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, waking: waking && loading, reload };
}
