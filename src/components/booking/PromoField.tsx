'use client';
import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { api, apiError } from '@/lib/api';

/** Promo code input. Validates via POST /promotions/validate; parent stores the applied code. */
export function PromoField({ applied, onApply, nights, amount, roomType }: { applied: string; onApply: (code: string) => void; nights: number; amount: number; roomType?: string }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setBusy(true); setMsg(null);
    try {
      const { data } = await api.post<{ valid: boolean; message: string; code?: string; discountAmount?: number }>('/promotions/validate', { code: c, nights, amount, roomType });
      if (data.valid) { onApply(data.code || c); setMsg({ ok: true, text: data.message || 'Promo code applied' }); setCode(''); }
      else setMsg({ ok: false, text: data.message || 'This code is not valid for your stay' });
    } catch (e) { setMsg({ ok: false, text: apiError(e) }); }
    finally { setBusy(false); }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-gold-light"><Check size={16} /> <strong className="tracking-widest">{applied}</strong> applied</span>
        <button type="button" onClick={() => { onApply(''); setMsg(null); }} aria-label="Remove promo code" className="text-cream/60 hover:text-gold"><X size={16} /></button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } }} placeholder="Promo code" aria-label="Promo code" maxLength={30}
            className="w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 pl-10 pr-3 text-sm uppercase tracking-widest text-cream outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-cream/40 focus:border-gold" />
        </div>
        <button type="button" onClick={apply} disabled={busy || !code.trim()} className="btn btn-ghost btn-sm">{busy ? '...' : 'Apply'}</button>
      </div>
      {msg && <p role="status" className={`mt-2 text-xs ${msg.ok ? 'text-sage' : 'text-[#f19a8f]'}`}>{msg.text}</p>}
    </div>
  );
}
