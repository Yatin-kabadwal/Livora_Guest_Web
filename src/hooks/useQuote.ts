'use client';
import { useEffect, useState } from 'react';
import { api, apiError } from '@/lib/api';
import { useDebounced } from './useMedia';
import type { Quote } from '@/types';

export interface QuoteInput { roomId?: string; checkIn?: string; checkOut?: string; adults: number; children: number; mealPlan: string; promoCode?: string }

/** Live price quote from GET /bookings/quote (debounced). */
export function useQuote(input: QuoteInput) {
  const dbg = useDebounced(input, 350);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = !!(dbg.roomId && dbg.checkIn && dbg.checkOut);
  const key = JSON.stringify(dbg);

  useEffect(() => {
    if (!ready) { setQuote(null); setError(null); return; }
    let cancelled = false;
    setLoading(true);
    api.get<Quote>('/bookings/quote', { params: { roomId: dbg.roomId, checkIn: dbg.checkIn, checkOut: dbg.checkOut, adults: dbg.adults, children: dbg.children, mealPlan: dbg.mealPlan, promoCode: dbg.promoCode || undefined } })
      .then(({ data }) => { if (!cancelled) { setQuote(data); setError(null); } })
      .catch((e) => { if (!cancelled) { setQuote(null); setError(apiError(e)); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return { quote, loading: loading || (ready && JSON.stringify(input) !== key), error, ready };
}
