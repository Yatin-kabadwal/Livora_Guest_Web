'use client';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, MessageSquare, User as UserIcon, Lock, LogOut, Download, XCircle, Star, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { PasswordField } from '@/components/auth/PasswordField';
import { StatusChip } from '@/components/booking/BookingDetail';
import { ThreadStatusChip } from '@/components/messages/ThreadView';
import { Skeleton, ErrorNote } from '@/components/ui/Skeleton';
import { resolveRoomImages } from '@/config/photos';
import { formatINR, formatStay, formatDateTime, istYmd, isPhone, cn } from '@/lib/format';
import type { Booking, Thread, User } from '@/types';

type Tab = 'bookings' | 'messages' | 'details' | 'security';
const TABS: { id: Tab; label: string; Icon: typeof UserIcon }[] = [
  { id: 'bookings', label: 'My bookings', Icon: CalendarDays }, { id: 'messages', label: 'My messages', Icon: MessageSquare },
  { id: 'details', label: 'Details', Icon: UserIcon }, { id: 'security', label: 'Security', Icon: Lock },
];

export function ProfileView() {
  const router = useRouter();
  const { hydrated, user, refreshToken, clear } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');
  const [unread, setUnread] = useState(0);

  useEffect(() => { if (hydrated && !user) router.replace('/auth/login?next=/profile'); }, [hydrated, user, router]);

  const logout = async () => {
    try { await api.post('/auth/logout', { refreshToken }); } catch { /* ignore */ }
    clear(); toast.success('Signed out'); router.replace('/');
  };

  if (!hydrated || !user) return <div className="container-x pb-20 pt-40"><Skeleton className="h-16 w-1/2" /><Skeleton className="mt-8 h-64" /></div>;

  return (
    <div className="container-x pb-24 pt-32 sm:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-3">My account</p><h1 className="h-display text-5xl sm:text-7xl">Hello, <em className="text-gold-light">{user.firstName}</em></h1></div>
        <button onClick={logout} className="btn btn-ghost btn-sm"><LogOut size={15} /> Sign out</button>
      </div>
      <div role="tablist" aria-label="Account sections" className="no-scrollbar mt-10 flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)} className={cn('relative flex shrink-0 items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] transition', tab === id ? 'text-gold-light' : 'text-cream/55 hover:text-cream')}>
            <Icon size={15} />{label}{id === 'messages' && unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[0.65rem] font-bold text-forest-950" aria-label={`${unread} unread`}>{unread}</span>}
            {tab === id && <motion.span layoutId="prof-tab" className="absolute inset-x-3 bottom-0 h-0.5 bg-gold" />}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-10">
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'messages' && <MessagesTab onUnread={setUnread} />}
        {tab === 'details' && <DetailsTab />}
        {tab === 'security' && <SecurityTab />}
      </div>
      <MessagesUnreadProbe onUnread={setUnread} skip={tab === 'messages'} />
    </div>
  );
}

function MessagesUnreadProbe({ onUnread, skip }: { onUnread: (n: number) => void; skip: boolean }) {
  useEffect(() => {
    if (skip) return;
    api.get<Thread[]>('/messages/mine').then(({ data }) => onUnread((data || []).filter((t) => t.unreadByGuest).length)).catch(() => undefined);
  }, [skip, onUnread]);
  return null;
}

function BookingsTab() {
  const [list, setList] = useState<Booking[] | null>(null);
  const [err, setErr] = useState('');
  const [cancel, setCancel] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { setErr(''); api.get<Booking[]>('/bookings/mine').then(({ data }) => setList(data)).catch((e) => setErr(apiError(e))); }, []);
  useEffect(load, [load]);
  const today = new Date().toISOString().slice(0, 10);
  const { upcoming, past } = useMemo(() => {
    const u: Booking[] = [], p: Booking[] = [];
    (list || []).forEach((b) => (['confirmed', 'checked_in'].includes(b.status) && istYmd(b.checkOut) >= today ? u : p).push(b));
    return { upcoming: u, past: p };
  }, [list, today]);

  const invoice = async (b: Booking) => {
    try {
      const { data } = await api.get<Blob>(`/bookings/${b._id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(data); const a = document.createElement('a'); a.href = url; a.download = `Invoice-${b.bookingRef}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) { toast.error(apiError(e)); }
  };
  const doCancel = async () => {
    if (!cancel) return; setBusy(true);
    try { await api.post(`/bookings/${cancel._id}/cancel`, { reason: 'Cancelled by guest from website' }); toast.success('Booking cancelled'); setCancel(null); load(); }
    catch (e) { toast.error(apiError(e)); setCancel(null); } finally { setBusy(false); }
  };

  const Card = ({ b }: { b: Booking }) => {
    const room = typeof b.roomId === 'object' ? b.roomId : undefined;
    const img = resolveRoomImages(room?.imageUrls, b.roomType)[0];
    return (
      <article className="glass flex flex-col overflow-hidden rounded-3xl sm:flex-row">
        <img src={img} alt="" loading="lazy" className="h-44 w-full object-cover sm:h-auto sm:w-56" />
        <div className="flex flex-1 flex-col justify-between gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-display text-3xl">{b.roomName}</h3><p className="text-sm text-cream/60">{formatStay(b.checkIn)} → {formatStay(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''}</p><p className="mt-1 text-xs tracking-widest text-gold">{b.bookingRef}</p></div><StatusChip status={b.status} /></div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-auto font-display text-2xl text-gold-light">{formatINR(b.totalAmount)}</span>
            <Link href={`/booking/manage?ref=${encodeURIComponent(b.bookingRef)}&email=${encodeURIComponent(b.guestEmail)}`} className="btn btn-ghost btn-sm">Manage <ArrowUpRight size={14} /></Link>
            <button onClick={() => invoice(b)} className="btn btn-ghost btn-sm" aria-label={`Download invoice for ${b.bookingRef}`}><Download size={14} /> Invoice</button>
            {b.status === 'confirmed' && <button onClick={() => setCancel(b)} className="btn btn-ghost btn-sm border-ember/50 text-ember"><XCircle size={14} /> Cancel</button>}
            {b.status === 'checked_out' && <Link href={`/review?ref=${encodeURIComponent(b.bookingRef)}&email=${encodeURIComponent(b.guestEmail)}`} className="btn btn-gold btn-sm"><Star size={14} /> Review</Link>}
          </div>
        </div>
      </article>
    );
  };

  if (err) return <ErrorNote message={err} onRetry={load} />;
  if (!list) return <div className="space-y-4">{[0, 1].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}</div>;
  return (
    <div className="space-y-12">
      {list.length === 0 && <div className="glass mx-auto max-w-xl rounded-3xl p-12 text-center"><p className="font-display text-3xl">No bookings yet</p><p className="mt-2 text-sm text-cream/60">Your stays will appear here.</p><Link href="/booking" className="btn btn-gold btn-sm mt-6">Book a stay</Link></div>}
      {upcoming.length > 0 && <section><h2 className="mb-5 font-display text-4xl">Upcoming</h2><div className="space-y-5">{upcoming.map((b) => <Card key={b._id} b={b} />)}</div></section>}
      {past.length > 0 && <section><h2 className="mb-5 font-display text-4xl">Past & cancelled</h2><div className="space-y-5">{past.map((b) => <Card key={b._id} b={b} />)}</div></section>}
      <Modal open={!!cancel} onClose={() => setCancel(null)} title="Cancel this booking?">
        <p className="text-sm text-cream/70">{cancel?.roomName}, {formatStay(cancel?.checkIn)}. Free cancellation applies inside the cancellation window; the resort will tell you if it has passed.</p>
        <div className="mt-6 flex justify-end gap-3"><button onClick={() => setCancel(null)} className="btn btn-ghost btn-sm">Keep booking</button><button onClick={doCancel} disabled={busy} className="btn btn-sm bg-ember text-forest-950">{busy ? 'Cancelling' : 'Yes, cancel'}</button></div>
      </Modal>
    </div>
  );
}

function MessagesTab({ onUnread }: { onUnread: (n: number) => void }) {
  const [list, setList] = useState<Thread[] | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => { setErr(''); api.get<Thread[]>('/messages/mine').then(({ data }) => { setList(data); onUnread((data || []).filter((t) => t.unreadByGuest).length); }).catch((e) => setErr(apiError(e))); }, [onUnread]);
  useEffect(load, [load]);
  if (err) return <ErrorNote message={err} onRetry={load} />;
  if (!list) return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>;
  if (!list.length) return <div className="glass mx-auto max-w-xl rounded-3xl p-12 text-center"><p className="font-display text-3xl">No messages yet</p><Link href="/contact" className="btn btn-gold btn-sm mt-6">Send a message</Link></div>;
  return (
    <ul className="space-y-3">
      {list.map((t) => {
        const last = t.messages?.[t.messages.length - 1];
        return (
          <li key={t.token || t.ref}><Link href={`/messages/${t.token}`} className="glass flex items-center gap-4 rounded-2xl p-5 transition hover:border-gold/60">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><MessageSquare size={20} />{t.unreadByGuest && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-forest-900 bg-ember" aria-label="Unread" />}</span>
            <span className="min-w-0 flex-1"><span className="block truncate font-display text-2xl">{t.subject || 'Conversation'}</span><span className="block truncate text-sm text-cream/55">{last?.body}</span></span>
            <span className="hidden text-right sm:block"><ThreadStatusChip status={t.status} /><span className="mt-1 block text-xs text-cream/40">{formatDateTime(t.lastMessageAt)}</span></span>
          </Link></li>
        );
      })}
    </ul>
  );
}

function DetailsTab() {
  const user = useAuth((s) => s.user)!;
  const setUser = useAuth((s) => s.setUser);
  const [f, setF] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.firstName.trim().length < 2) return toast.error('Please enter your first name');
    if (f.phone && !isPhone(f.phone)) return toast.error('Please enter a valid phone number');
    setBusy(true);
    try { const { data } = await api.put<User>('/auth/profile', { firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim() }); setUser({ ...user, ...data, id: data.id || data._id || user.id }); toast.success('Details updated'); }
    catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="glass max-w-2xl space-y-4 rounded-[2rem] p-6 sm:p-8" aria-label="Edit details">
      <div className="grid gap-4 sm:grid-cols-2"><Field id="d-fn" label="First name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} auto="given-name" /><Field id="d-ln" label="Last name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} auto="family-name" /></div>
      <Field id="d-ph" label="Phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} auto="tel" />
      <div className="field"><input id="d-em" value={user.email} readOnly placeholder=" " aria-readonly="true" className="opacity-60" /><label htmlFor="d-em">Email (cannot be changed)</label></div>
      <button type="submit" disabled={busy} className="btn btn-gold">{busy ? 'Saving' : 'Save changes'}</button>
    </form>
  );
}

function SecurityTab() {
  const [f, setF] = useState({ cur: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.cur) return toast.error('Please enter your current password');
    if (f.next.length < 8) return toast.error('New password must be at least 8 characters');
    if (f.next !== f.confirm) return toast.error('Passwords do not match');
    setBusy(true);
    try { await api.put('/auth/change-password', { currentPassword: f.cur, newPassword: f.next }); toast.success('Password changed'); setF({ cur: '', next: '', confirm: '' }); }
    catch (x) { toast.error(apiError(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="glass max-w-2xl space-y-4 rounded-[2rem] p-6 sm:p-8" aria-label="Change password">
      <PasswordField id="s-cur" label="Current password" value={f.cur} onChange={(e) => setF({ ...f, cur: e.target.value })} />
      <PasswordField id="s-new" label="New password (8+ characters)" auto="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
      <PasswordField id="s-cf" label="Confirm new password" auto="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} />
      <button type="submit" disabled={busy} className="btn btn-gold">{busy ? 'Saving' : 'Change password'}</button>
    </form>
  );
}
