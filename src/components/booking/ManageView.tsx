'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, Star, XCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { BookingDetail } from './BookingDetail';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, WakingNote } from '@/components/ui/Skeleton';
import { api, apiError, getWithRetry } from '@/lib/api';
import { getLastBooking, saveLastBooking } from '@/lib/storage';
import { useAuth } from '@/store/auth';
import { useMounted } from '@/hooks/useMedia';
import { useSettings } from '@/hooks/useSettings';
import { isEmail } from '@/lib/format';
import type { Booking } from '@/types';

export function ManageView() {
  const sp = useSearchParams();
  const { settings } = useSettings();
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.accessToken);
  const mounted = useMounted();
  const [ref, setRef] = useState(sp.get('ref') || '');
  const [email, setEmail] = useState(sp.get('email') || '');
  const [b, setB] = useState<Booking | null>(null);
  const [cancelHours, setCancelHours] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState('');
  const [dlg, setDlg] = useState(false);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const lookup = useCallback(async (r: string, e: string) => {
    setBusy(true); setError(''); setB(null);
    const t = setTimeout(() => setWaking(true), 6000);
    try {
      const d = await getWithRetry<{ booking: Booking; cancellationHours?: number }>('/bookings/lookup', { params: { ref: r.trim().toUpperCase(), email: e.trim() } }, 2);
      if (!d?.booking?.bookingRef) throw new Error('We could not find a booking with those details.');
      setB(d.booking); setCancelHours(d.cancellationHours ?? null); saveLastBooking({ ref: d.booking.bookingRef, email: e.trim() });
    } catch (x) { setError(apiError(x, 'We could not find a booking with those details.')); }
    finally { clearTimeout(t); setBusy(false); setWaking(false); }
  }, []);

  useEffect(() => {
    let r = sp.get('ref') || '', e = sp.get('email') || '';
    if (!r || !e) { const last = getLastBooking(); if (last && !sp.get('ref')) { setRef(last.ref); setEmail(last.email); } return; }
    setRef(r); setEmail(e); lookup(r, e);
  }, [sp, lookup]);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!ref.trim() || !isEmail(email)) { setError('Please enter your booking reference and the email used to book.'); return; }
    lookup(ref, email);
  };

  const cancel = async () => {
    if (!b) return;
    setCancelling(true);
    try {
      const { data } = await api.post<Booking>('/bookings/lookup/cancel', { ref: b.bookingRef, email: email || b.guestEmail, reason: reason.trim() || undefined });
      setB({ ...b, ...data }); setDlg(false); toast.success('Your booking has been cancelled.');
    } catch (x) { toast.error(apiError(x)); setDlg(false); }
    finally { setCancelling(false); }
  };

  const invoice = async () => {
    if (!b) return;
    try {
      const { data } = await api.get<Blob>(`/bookings/${b._id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a'); a.href = url; a.download = `Invoice-${b.bookingRef}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (x) { toast.error(apiError(x, 'The invoice is not available for this account. Please ask at reception.')); }
  };

  const canCancel = b && (b.status === 'confirmed');
  const loggedIn = mounted && !!user && !!token;
  const hours = cancelHours ?? settings.cancellationHours;

  return (
    <div className="container-x pb-24 pt-36 sm:pt-44">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-4">Your booking</p>
        <h1 className="h-display text-5xl sm:text-7xl">Manage <em className="text-gold-light">booking</em></h1>

        {!b && (
          <form onSubmit={submit} noValidate className="glass mt-10 max-w-2xl rounded-[2rem] p-6 sm:p-8" aria-label="Find your booking">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="m-ref" label="Booking reference (CVL-2026-00001)" value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} />
              <Field id="m-email" label="Email used to book" type="email" value={email} onChange={(e) => setEmail(e.target.value)} auto="email" />
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl bg-ember/10 p-3 text-sm text-ember">{error}</p>}
            <button type="submit" disabled={busy} className="btn btn-gold mt-6 w-full sm:w-auto">{busy ? 'Looking up' : 'Find my booking'}</button>
            {busy && <WakingNote show={waking} />}
            {busy && <div className="mt-6 space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>}
            <p className="mt-6 text-sm text-cream/50">Have an account? <Link href="/profile" className="text-gold underline">View all your bookings</Link>.</p>
          </form>
        )}

        {b && (
          <div className="mt-10">
            <BookingDetail b={b} />
            <div className="glass mt-6 flex flex-wrap items-center gap-3 rounded-[2rem] p-6">
              {canCancel && <button onClick={() => setDlg(true)} className="btn btn-ghost btn-sm border-ember/50 text-ember hover:border-ember hover:text-ember"><XCircle size={15} /> Cancel booking</button>}
              {loggedIn ? <button onClick={invoice} className="btn btn-gold btn-sm"><Download size={15} /> Download invoice</button>
                : <p className="flex items-start gap-2 text-sm text-cream/60"><Info size={16} className="mt-0.5 shrink-0 text-gold" />Invoices are emailed to you, or available at reception. Owners can <Link href={`/auth/login?next=${encodeURIComponent('/booking/manage?ref=' + b.bookingRef + '&email=' + encodeURIComponent(b.guestEmail))}`} className="text-gold underline">sign in</Link> to download.</p>}
              {b.status === 'checked_out' && <Link href={`/review?ref=${encodeURIComponent(b.bookingRef)}&email=${encodeURIComponent(email || b.guestEmail)}`} className="btn btn-gold btn-sm"><Star size={15} /> Write a review</Link>}
              <button onClick={() => { setB(null); setError(''); }} className="ml-auto text-xs uppercase tracking-widest text-cream/50 hover:text-gold">Look up another</button>
            </div>
            {canCancel && <p className="mt-3 text-xs text-cream/50">Free cancellation is available up to {hours} hours before check-in. Later cancellations are subject to the resort's policy and we will tell you exactly what applies.</p>}
          </div>
        )}
      </div>
      <Modal open={dlg} onClose={() => setDlg(false)} title="Cancel this booking?">
        <p className="text-sm leading-relaxed text-cream/70">This will release your room. Free cancellation applies up to {hours} hours before check-in; if that window has passed, we will let you know what to do next.</p>
        <label htmlFor="cr" className="mt-5 block text-xs uppercase tracking-widest text-gold">Reason (optional)</label>
        <textarea id="cr" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 p-3 text-sm text-cream outline-none focus:border-gold" />
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button onClick={() => setDlg(false)} className="btn btn-ghost btn-sm">Keep booking</button>
          <button onClick={cancel} disabled={cancelling} className="btn btn-sm bg-ember text-forest-950">{cancelling ? 'Cancelling' : 'Yes, cancel booking'}</button>
        </div>
      </Modal>
    </div>
  );
}
