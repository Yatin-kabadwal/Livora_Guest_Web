'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromotions } from '@/hooks/useData';
import { Skeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { Reveal } from '@/components/ui/Motion';
import { formatINR, formatDate } from '@/lib/format';
import type { Promotion } from '@/types';

function Coupon({ p, i }: { p: Promotion; i: number }) {
  const [c, setC] = useState(false);
  const off = p.discountType === 'percent' ? `${p.discountValue}%` : formatINR(p.discountValue);
  const copy = async () => { try { await navigator.clipboard.writeText(p.code); setC(true); toast.success(`Code ${p.code} copied`); setTimeout(() => setC(false), 2200); } catch { toast(`Your code is ${p.code}`); } };
  const terms = [p.minNights ? `Minimum ${p.minNights} night${p.minNights > 1 ? 's' : ''}` : '', p.minAmount ? `Minimum booking ${formatINR(p.minAmount)}` : '', p.maxDiscountAmount ? `Discount up to ${formatINR(p.maxDiscountAmount)}` : '', p.validTo ? `Valid until ${formatDate(p.validTo)}` : ''].filter(Boolean);
  return (
    <Reveal delay={(i % 2) * 0.1}>
      <article className="relative flex overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-forest-800 to-forest-900 shadow-glass">
        <div className="relative flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-gold-light to-gold p-4 text-forest-950 sm:w-40">
          <p className="font-display text-5xl font-bold leading-none sm:text-6xl">{off}</p><p className="mt-1 text-xs font-bold uppercase tracking-[0.25em]">off</p>
          <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-forest-950" aria-hidden="true" />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-4 border-l-2 border-dashed border-gold/40 p-6">
          <div><h2 className="font-display text-3xl leading-tight">{p.name}</h2>{p.description && <p className="mt-2 text-sm text-cream/65">{p.description}</p>}
            {terms.length > 0 && <ul className="mt-3 space-y-0.5 text-xs text-cream/50">{terms.map((t) => <li key={t}>{t}</li>)}</ul>}</div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={copy} aria-label={`Copy code ${p.code}`} className="flex items-center gap-3 rounded-xl border border-dashed border-gold px-4 py-2.5 font-bold tracking-[0.25em] text-gold-light transition hover:bg-gold/10">{p.code}{c ? <Check size={16} /> : <Copy size={16} />}</button>
            <Link href={`/booking?promo=${encodeURIComponent(p.code)}`} className="link-underline text-xs font-semibold uppercase tracking-widest text-gold">Use at booking</Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function OffersView() {
  const { data, loading, error, waking, reload } = usePromotions();
  return (
    <section className="container-x pb-16">
      {loading && <div className="grid gap-6 lg:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-56 rounded-3xl" />)}<div className="col-span-full"><WakingNote show={waking} /></div></div>}
      {!loading && !data && error != null && <ErrorNote message="We could not load offers right now." onRetry={reload} />}
      {data && data.length > 0 && <div className="grid gap-6 lg:grid-cols-2">{data.map((p, i) => <Coupon key={p._id} p={p} i={i} />)}</div>}
      {data && data.length === 0 && <div className="glass mx-auto max-w-xl rounded-3xl p-12 text-center"><Scissors className="mx-auto mb-4 text-gold" /><p className="font-display text-3xl">No offers right now</p><p className="mt-2 text-sm text-cream/60">New offers appear here as soon as they are available. In the meantime, our best rates are always on this website.</p><Link href="/rooms" className="btn btn-gold btn-sm mt-6">Browse rooms</Link></div>}
      <div className="glass mx-auto mt-16 max-w-3xl rounded-3xl p-8">
        <h2 className="font-display text-3xl">How to apply a code</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-cream/70"><li>Copy the code from the offer above.</li><li>Choose your dates and room, then paste the code in the promo field on the booking page.</li><li>The discount is shown in your price summary before you confirm.</li></ol>
      </div>
    </section>
  );
}
