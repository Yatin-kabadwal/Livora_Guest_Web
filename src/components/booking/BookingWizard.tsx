'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ArrowRight, BedDouble, Users, ShieldCheck, Wallet, AlertTriangle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { DateRangeField, GuestsField } from '@/components/ui/DateRange';
import { Field, TextArea } from '@/components/ui/Field';
import { MealPlanSelector } from './MealPlans';
import { PromoField } from './PromoField';
import { PriceBreakdown } from './PriceBreakdown';
import { Skeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { useRooms } from '@/hooks/useData';
import { useSettings } from '@/hooks/useSettings';
import { useQuote } from '@/hooks/useQuote';
import { useAuth } from '@/store/auth';
import { api, apiError, apiStatus } from '@/lib/api';
import { saveLastBooking } from '@/lib/storage';
import { resolveRoomImages } from '@/config/photos';
import { TYPE_LABEL, capacityText } from '@/lib/rooms';
import { formatINR, formatDate, formatClock, fromYmd, nightsBetween, pluralize, isEmail, isPhone, cn } from '@/lib/format';
import type { Booking, Room } from '@/types';

const STEPS = ['Dates', 'Room', 'Details', 'Review'];

export function BookingWizard() {
  const sp = useSearchParams();
  const router = useRouter();
  const { settings } = useSettings();
  const user = useAuth((s) => s.user);

  const [dates, setDates] = useState<{ checkIn?: string; checkOut?: string }>({ checkIn: sp.get('checkIn') || undefined, checkOut: sp.get('checkOut') || undefined });
  const [guests, setGuests] = useState({ adults: Number(sp.get('adults')) || 2, children: Number(sp.get('children')) || 0 });
  const [roomKey, setRoomKey] = useState<string>(sp.get('room') || '');
  const [mealPlan, setMealPlan] = useState(sp.get('mealPlan') || '');
  const [promo, setPromo] = useState(sp.get('promo') || '');
  const [g, setG] = useState({ name: '', email: '', phone: '', special: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const hasDates = !!(dates.checkIn && dates.checkOut);
  const [step, setStep] = useState(() => (sp.get('room') && sp.get('checkIn') && sp.get('checkOut') ? 3 : sp.get('checkIn') && sp.get('checkOut') ? 2 : 1));
  const [dir, setDir] = useState(1);

  const { data: rooms, loading: rLoading, error: rError, waking, reload } = useRooms({ adults: guests.adults, children: guests.children, checkIn: hasDates ? dates.checkIn : undefined, checkOut: hasDates ? dates.checkOut : undefined });
  const room: Room | undefined = useMemo(() => rooms?.find((r) => r._id === roomKey || r.slug === roomKey), [rooms, roomKey]);
  useEffect(() => { if (!mealPlan && settings.mealPlans[0]) setMealPlan(settings.mealPlans[0].code); }, [settings.mealPlans, mealPlan]);
  useEffect(() => {
    if (user) setG((s) => ({ name: s.name || [user.firstName, user.lastName].filter(Boolean).join(' '), email: s.email || user.email, phone: s.phone || user.phone || '', special: s.special }));
  }, [user]);
  // if a preselected room turns out unavailable/unknown, fall back to room choice
  useEffect(() => {
    if (rooms && step >= 3 && (!room || room.available === false)) { setStep(2); if (roomKey && room?.available === false) setNotice('That room is not available for your dates. Please choose another.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const nights = nightsBetween(fromYmd(dates.checkIn), fromYmd(dates.checkOut));
  const { quote, loading: qLoading, error: qError } = useQuote({ roomId: room?._id, ...dates, ...guests, mealPlan, promoCode: promo });
  const mealLabel = settings.mealPlans.find((p) => p.code === mealPlan)?.label || mealPlan;

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) { if (!hasDates) e.dates = 'Please choose your check-in and check-out dates'; else if (nights < 1) e.dates = 'Check-out must be after check-in'; }
    if (s === 2) { if (!room) e.room = 'Please choose a room'; else if (room.available === false) e.room = 'This room is not available for your dates'; }
    if (s === 3) {
      if (g.name.trim().length < 2) e.name = 'Please enter your full name';
      if (!isEmail(g.email)) e.email = 'Please enter a valid email address';
      if (!isPhone(g.phone)) e.phone = 'Please enter a valid phone number (10 digits or with country code)';
      if (!mealPlan) e.meal = 'Please choose a meal plan';
    }
    setErrs(e);
    if (Object.keys(e).length) { toast.error(Object.values(e)[0]); return false; }
    return true;
  };
  const next = () => { if (validate(step)) { setNotice(null); go(step + 1); } };

  const confirm = async () => {
    if (!room || !dates.checkIn || !dates.checkOut) return;
    setBusy(true);
    try {
      const { data } = await api.post<Booking>('/bookings', {
        roomId: room._id, checkIn: dates.checkIn, checkOut: dates.checkOut, adults: guests.adults, children: guests.children, mealPlan,
        promoCode: promo || undefined, specialRequests: g.special.trim() || undefined,
        guest: { name: g.name.trim(), email: g.email.trim(), phone: g.phone.trim() }, source: 'website',
      });
      if (!data?.bookingRef) throw new Error('The server sent an unexpected reply. Please try again.');
      saveLastBooking({ ref: data.bookingRef, email: g.email.trim() });
      router.push(`/booking/confirmation?ref=${encodeURIComponent(data.bookingRef)}&email=${encodeURIComponent(g.email.trim())}`);
    } catch (e) {
      if (apiStatus(e) === 409) {
        setNotice(apiError(e, 'Sorry, that room was just taken for your dates. Please choose another room or different dates.'));
        setRoomKey(''); reload(); go(2);
      } else toast.error(apiError(e));
    } finally { setBusy(false); }
  };

  const summary = (
    <div className="glass rounded-[2rem] p-6">
      <h2 className="font-display text-3xl">Your stay</h2>
      <ul className="mt-4 space-y-3 text-sm text-cream/80">
        <li className="flex items-start gap-3"><CalendarDays size={16} className="mt-0.5 shrink-0 text-gold" />{hasDates ? <span>{formatDate(dates.checkIn)} → {formatDate(dates.checkOut)}<span className="text-cream/50"> · {pluralize(nights, 'night')}</span></span> : <span className="text-cream/45">Choose your dates</span>}</li>
        <li className="flex items-start gap-3"><Users size={16} className="mt-0.5 shrink-0 text-gold" />{pluralize(guests.adults, 'adult')}{guests.children > 0 && `, ${pluralize(guests.children, 'child', 'children')}`}</li>
        <li className="flex items-start gap-3"><BedDouble size={16} className="mt-0.5 shrink-0 text-gold" />{room ? <span>{room.name}<span className="text-cream/50"> · {mealLabel}</span></span> : <span className="text-cream/45">Choose a room</span>}</li>
      </ul>
      <div className="mt-5 border-t border-white/10 pt-4" aria-live="polite">
        {!room || !hasDates ? <p className="text-sm text-cream/50">Your price appears here once you pick dates and a room.</p>
          : qLoading ? <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-3 h-10 w-1/2" /></div>
          : qError ? <p className="text-sm text-[#f19a8f]">{qError}</p>
          : quote ? <PriceBreakdown q={quote} /> : null}
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs text-cream/50"><Wallet size={14} className="mt-0.5 shrink-0 text-gold" />Pay at the resort at check-in. No online payment.</p>
    </div>
  );

  const slide = { enter: (d: number) => ({ opacity: 0, x: d * 60 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d * -60 }) };
  const availableRooms = (rooms || []).filter((r) => r.maxAdults >= guests.adults && r.maxChildren >= guests.children);

  return (
    <div className="container-x pb-32 pt-32 sm:pt-40 md:pb-24">
      <h1 className="h-display text-5xl sm:text-7xl">Book your <em className="text-gold-light">stay</em></h1>
      {/* stepper */}
      <ol className="mt-10 flex items-center gap-2 sm:gap-4" aria-label="Booking steps">
        {STEPS.map((s, i) => {
          const n = i + 1; const done = step > n; const cur = step === n;
          return (
            <li key={s} className="flex flex-1 items-center gap-2 sm:gap-4" aria-current={cur ? 'step' : undefined}>
              <button type="button" disabled={!done} onClick={() => go(n)} className="flex items-center gap-2 disabled:cursor-default" aria-label={`Step ${n}: ${s}${done ? ' (completed, go back)' : ''}`}>
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold transition', done ? 'border-gold bg-gold text-forest-950' : cur ? 'border-gold text-gold shadow-glow' : 'border-white/20 text-cream/40')}>{done ? <Check size={16} /> : n}</span>
                <span className={cn('hidden text-xs font-semibold uppercase tracking-[0.18em] sm:inline', cur ? 'text-gold-light' : 'text-cream/45')}>{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className="relative h-px flex-1 bg-white/10"><motion.span className="absolute inset-y-0 left-0 bg-gold" animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.6 }} /></span>}
            </li>
          );
        })}
      </ol>

      {!settings.bookingsOpen && <div role="alert" className="mt-8 flex gap-3 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm text-ember"><AlertTriangle size={18} className="shrink-0" />Online bookings are paused for now. Please call or message us and we will reserve for you.</div>}
      {notice && <div role="alert" className="mt-8 flex gap-3 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm text-cream"><AlertTriangle size={18} className="shrink-0 text-ember" />{notice}</div>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              {step === 1 && (
                <section aria-labelledby="s1"><h2 id="s1" className="font-display text-4xl">When would you like to stay?</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2"><DateRangeField checkIn={dates.checkIn} checkOut={dates.checkOut} onChange={setDates} /><GuestsField adults={guests.adults} kids={guests.children} onChange={setGuests} /></div>
                  {errs.dates && <p className="field-error" role="alert">{errs.dates}</p>}
                  <p className="mt-6 text-sm leading-relaxed text-cream/55">Check-in from {formatClock(settings.checkInTime)}, check-out by {formatClock(settings.checkOutTime)}. Prices are per room per night and include GST.</p>
                </section>
              )}
              {step === 2 && (
                <section aria-labelledby="s2"><h2 id="s2" className="font-display text-4xl">Choose your room</h2>
                  <p className="mt-2 text-sm text-cream/55">Availability shown for {formatDate(dates.checkIn)} to {formatDate(dates.checkOut)}.</p>
                  {rLoading && <div className="mt-6 space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}<WakingNote show={waking} /></div>}
                  {!rLoading && !rooms && rError != null && <div className="mt-6"><ErrorNote message="We could not load rooms." onRetry={reload} /></div>}
                  <div className="mt-6 space-y-4" role="radiogroup" aria-label="Rooms">
                    {availableRooms.map((r) => {
                      const off = r.available === false; const sel = room?._id === r._id;
                      return (
                        <button key={r._id} role="radio" aria-checked={sel} disabled={off} type="button" onClick={() => { setRoomKey(r._id); setErrs({}); setNotice(null); }}
                          className={cn('glass group relative flex w-full flex-col overflow-hidden rounded-3xl text-left transition sm:flex-row', sel ? 'border-gold shadow-glow ring-1 ring-gold' : 'hover:border-gold/50', off && 'cursor-not-allowed opacity-50')}>
                          <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto sm:w-56"><img src={resolveRoomImages(r.imageUrls, r.type)[0]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                            {off && <span className="absolute inset-0 grid place-items-center bg-forest-950/70 text-xs font-bold uppercase tracking-widest text-ember">Sold out for your dates</span>}</span>
                          <span className="flex flex-1 flex-col justify-between gap-3 p-5">
                            <span><span className="chip chip-gold mb-2">{TYPE_LABEL[r.type] || r.type}</span><span className="block font-display text-3xl">{r.name}</span><span className="mt-1 block text-xs text-cream/60">{capacityText(r)}{r.bedType ? ` · ${r.bedType}` : ''}{r.size ? ` · ${r.size} sq ft` : ''}</span></span>
                            <span className="flex items-end justify-between"><span><span className="block font-display text-3xl text-gold-light">{formatINR(r.pricePerNight)}</span><span className="text-[0.65rem] uppercase tracking-widest text-cream/50">per night, incl. taxes</span></span>
                              <span className={cn('grid h-9 w-9 place-items-center rounded-full border', sel ? 'border-gold bg-gold text-forest-950' : 'border-white/25 text-transparent')}><Check size={16} /></span></span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {!rLoading && rooms && availableRooms.length === 0 && <p className="mt-6 text-cream/60">No rooms fit that many guests. Try adjusting the guest count or message us for group arrangements.</p>}
                  {errs.room && <p className="field-error" role="alert">{errs.room}</p>}
                </section>
              )}
              {step === 3 && (
                <section aria-labelledby="s3"><h2 id="s3" className="font-display text-4xl">Guest details</h2>
                  {!user && <p className="mt-2 text-sm text-cream/55">Already have an account? <a href={`/auth/login?next=${encodeURIComponent('/booking?' + sp.toString())}`} className="text-gold underline">Sign in</a> to prefill your details.</p>}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Field id="g-name" label="Full name" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} error={errs.name} auto="name" /></div>
                    <Field id="g-email" label="Email" type="email" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} error={errs.email} auto="email" hint="Your confirmation is sent here" />
                    <Field id="g-phone" label="Phone" type="tel" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} error={errs.phone} auto="tel" />
                    <div className="sm:col-span-2"><TextArea id="g-special" label="Special requests (optional)" value={g.special} onChange={(e) => setG({ ...g, special: e.target.value })} rows={3} maxLength={500} /></div>
                  </div>
                  <div className="mt-8"><MealPlanSelector plans={settings.mealPlans} value={mealPlan} onChange={setMealPlan} />{errs.meal && <p className="field-error">{errs.meal}</p>}</div>
                  <div className="mt-8"><p className="mb-3 text-[0.7rem] uppercase tracking-[0.2em] text-gold">Promo code</p><PromoField applied={promo} onApply={setPromo} nights={nights} amount={quote?.roomAmount ?? (room?.pricePerNight || 0) * nights} roomType={room?.type} /></div>
                </section>
              )}
              {step === 4 && room && (
                <section aria-labelledby="s4"><h2 id="s4" className="font-display text-4xl">Review & confirm</h2>
                  <div className="glass mt-6 divide-y divide-white/10 rounded-3xl text-sm">
                    {[['Room', `${room.name} (${TYPE_LABEL[room.type] || room.type})`], ['Check-in', `${formatDate(dates.checkIn)} from ${formatClock(settings.checkInTime)}`], ['Check-out', `${formatDate(dates.checkOut)} by ${formatClock(settings.checkOutTime)}`],
                      ['Guests', `${pluralize(guests.adults, 'adult')}${guests.children ? `, ${pluralize(guests.children, 'child', 'children')}` : ''}`], ['Meal plan', mealLabel], ['Guest', g.name], ['Email', g.email], ['Phone', g.phone], ...(g.special ? [['Requests', g.special]] : [])].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-6 px-5 py-3"><dt className="text-cream/50">{k}</dt><dd className="text-right text-cream">{v}</dd></div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-3xl border border-gold/30 bg-gold/[0.07] p-6">
                    <p className="flex items-center gap-2 font-display text-2xl text-gold-light"><ShieldCheck size={20} /> No payment needed now</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/75">Pay at the resort at check-in. Free cancellation up to {settings.cancellationHours} hours before check-in. You can manage or cancel your booking anytime from the confirmation email or the Manage booking page.</p>
                  </div>
                  <p className="mt-4 text-xs text-cream/45">By confirming, you agree to our <a href="/terms" className="underline hover:text-gold">terms</a> and <a href="/privacy" className="underline hover:text-gold">privacy policy</a>.</p>
                </section>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-between gap-3 border-t border-white/10 bg-forest-950/90 px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:static md:mt-10 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <button type="button" onClick={() => go(step - 1)} disabled={step === 1} className="btn btn-ghost md:px-7"><ChevronLeft size={16} /> Back</button>
            {step < 4 ? (
              <button type="button" onClick={next} className="btn btn-gold flex-1 md:flex-none md:px-10" disabled={!settings.bookingsOpen}>Continue <ArrowRight size={16} /></button>
            ) : (
              <button type="button" onClick={confirm} disabled={busy || !settings.bookingsOpen || !quote} className="btn btn-gold flex-1 md:flex-none md:px-10">
                {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-950 border-t-transparent" /> : <Check size={16} />} {busy ? 'Confirming' : 'Confirm booking'}
              </button>
            )}
          </div>
        </div>
        <aside aria-label="Price summary" className="lg:sticky lg:top-28 lg:self-start">{summary}</aside>
      </div>
    </div>
  );
}
