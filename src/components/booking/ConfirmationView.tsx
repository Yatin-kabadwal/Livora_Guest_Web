'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarPlus, MapPin, Share2, ClipboardList } from 'lucide-react';
import { AnimatedCheck } from '@/components/messages/MessageForm';
import { BookingDetail } from './BookingDetail';
import { Skeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { getWithRetry, apiError } from '@/lib/api';
import { getLastBooking, saveLastBooking } from '@/lib/storage';
import { buildIcs, downloadText } from '@/lib/ics';
import { useSettings } from '@/hooks/useSettings';
import { useReducedMotion } from '@/hooks/useMedia';
import { formatStay, formatClock } from '@/lib/format';
import { waLink, SITE_URL } from '@/config/site';
import type { Booking } from '@/types';

const COLORS = ['#d9b76a', '#f0d9a0', '#8fb9a0', '#2f6b4f', '#e07a3f', '#f4efe2'];

function Confetti() {
  const reduce = useReducedMotion();
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  const bits = useMemo(() => Array.from({ length: 44 }, (_, i) => ({ x: Math.random() * 100, d: Math.random() * 0.8, s: 6 + Math.random() * 8, r: Math.random() * 360, c: COLORS[i % COLORS.length], t: 2.6 + Math.random() * 2, sway: (Math.random() - 0.5) * 120, round: i % 3 === 0 })), []);
  if (!ok || reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
      {bits.map((b, i) => (
        <motion.span key={i} initial={{ y: -30, x: `${b.x}vw`, rotate: 0, opacity: 1 }} animate={{ y: '105vh', x: `calc(${b.x}vw + ${b.sway}px)`, rotate: b.r + 540, opacity: [1, 1, 0] }} transition={{ duration: b.t, delay: b.d, ease: 'easeIn' }}
          style={{ position: 'absolute', top: 0, width: b.s, height: b.round ? b.s : b.s * 1.8, background: b.c, borderRadius: b.round ? '50%' : 2 }} />
      ))}
    </div>
  );
}

export function ConfirmationView() {
  const sp = useSearchParams();
  const { settings } = useSettings();
  const [ref, setRef] = useState(sp.get('ref') || '');
  const [email, setEmail] = useState(sp.get('email') || '');
  const [b, setB] = useState<Booking | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error' | 'none'>('loading');
  const [err, setErr] = useState('');
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    let r = sp.get('ref') || '', e = sp.get('email') || '';
    if (!r || !e) { const last = getLastBooking(); if (last) { r = last.ref; e = last.email; } }
    setRef(r); setEmail(e);
    if (!r || !e) { setState('none'); return; }
    const t = setTimeout(() => setWaking(true), 6000);
    getWithRetry<{ booking: Booking }>('/bookings/lookup', { params: { ref: r, email: e } })
      .then((d) => { if (!d?.booking?.bookingRef) throw new Error('We could not find that booking.'); setB(d.booking); saveLastBooking({ ref: r, email: e }); setState('ok'); })
      .catch((x) => { setErr(apiError(x)); setState('error'); })
      .finally(() => { clearTimeout(t); setWaking(false); });
    return () => clearTimeout(t);
  }, [sp]);

  const manageHref = `/booking/manage?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`;
  const addToCal = () => b && downloadText(`${b.bookingRef}.ics`, buildIcs(b, { name: settings.resortName, address: settings.address, checkIn: settings.checkInTime, checkOut: settings.checkOutTime, phone: settings.phone }));
  const shareText = b ? `I have booked a stay at ${settings.resortName}, ${formatStay(b.checkIn)} to ${formatStay(b.checkOut)}. Booking ref ${b.bookingRef}. ${SITE_URL}` : '';

  return (
    <div className="container-x pb-24 pt-36 sm:pt-44">
      {state === 'loading' && <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="mx-auto h-24 w-24 rounded-full" /><Skeleton className="mx-auto h-14 w-2/3" /><Skeleton className="h-64" /><WakingNote show={waking} /></div>}
      {state === 'none' && <div className="mx-auto max-w-xl"><ErrorNote message="We could not find a booking to show." /><p className="mt-6 text-center"><Link href="/booking/manage" className="btn btn-gold btn-sm">Look up a booking</Link></p></div>}
      {state === 'error' && <div className="mx-auto max-w-xl"><ErrorNote message={err} /><p className="mt-6 text-center text-sm text-cream/60">Your booking may still have been received. Please check your email or <Link href="/booking/manage" className="text-gold underline">look it up here</Link>.</p></div>}
      {state === 'ok' && b && (
        <>
          <Confetti />
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto w-fit"><AnimatedCheck size={110} /></div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="eyebrow mt-8">Booking confirmed</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="h-display mt-3 text-5xl sm:text-7xl">See you in the <em className="text-gold-light">forest</em></motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mx-auto mt-5 max-w-xl text-cream/70">Thank you, {b.guestName.split(' ')[0]}. A confirmation has been sent to {b.guestEmail}. There is nothing to pay now. Settle your stay at the resort, at check-in from {formatClock(settings.checkInTime)}.</motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={addToCal} className="btn btn-gold btn-sm"><CalendarPlus size={15} /> Add to calendar</button>
              <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><MapPin size={15} /> Get directions</a>
              <a href={waLink('', shareText).replace('wa.me/', 'wa.me/')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Share2 size={15} /> Share on WhatsApp</a>
              <Link href={manageHref} className="btn btn-ghost btn-sm"><ClipboardList size={15} /> Manage booking</Link>
            </motion.div>
          </div>
          <div className="mx-auto mt-14 max-w-5xl"><BookingDetail b={b} /></div>
        </>
      )}
    </div>
  );
}
