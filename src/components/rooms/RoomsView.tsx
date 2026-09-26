'use client';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { DateRangeField, GuestsField } from '@/components/ui/DateRange';
import { RoomCard } from './RoomCard';
import { CardSkeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { useRooms } from '@/hooks/useData';
import { TYPE_LABEL, TYPE_ORDER } from '@/lib/rooms';
import { cn } from '@/lib/format';

type Sort = 'recommended' | 'price-asc' | 'price-desc';

export function RoomsView() {
  const sp = useSearchParams();
  const [type, setType] = useState(sp.get('type') || 'all');
  const [dates, setDates] = useState<{ checkIn?: string; checkOut?: string }>({ checkIn: sp.get('checkIn') || undefined, checkOut: sp.get('checkOut') || undefined });
  const [guests, setGuests] = useState({ adults: Number(sp.get('adults')) || 2, children: Number(sp.get('children')) || 0 });
  const [sort, setSort] = useState<Sort>('recommended');
  const hasDates = !!(dates.checkIn && dates.checkOut);
  const { data, loading, error, waking, reload } = useRooms({ adults: guests.adults, children: guests.children, checkIn: hasDates ? dates.checkIn : undefined, checkOut: hasDates ? dates.checkOut : undefined });

  useEffect(() => {
    const p = new URLSearchParams();
    if (type !== 'all') p.set('type', type);
    if (dates.checkIn) p.set('checkIn', dates.checkIn);
    if (dates.checkOut) p.set('checkOut', dates.checkOut);
    if (guests.adults !== 2) p.set('adults', String(guests.adults));
    if (guests.children) p.set('children', String(guests.children));
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [type, dates, guests]);

  const list = useMemo(() => {
    let r = (data || []).filter((x) => (type === 'all' || x.type === type) && x.maxAdults >= guests.adults && x.maxChildren >= guests.children);
    r = [...r].sort((a, b) => {
      if (hasDates && (a.available === false) !== (b.available === false)) return a.available === false ? 1 : -1;
      if (sort === 'price-asc') return a.pricePerNight - b.pricePerNight;
      if (sort === 'price-desc') return b.pricePerNight - a.pricePerNight;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
    });
    return r;
  }, [data, type, guests, sort, hasDates]);

  const qs = new URLSearchParams();
  if (dates.checkIn) qs.set('checkIn', dates.checkIn);
  if (dates.checkOut) qs.set('checkOut', dates.checkOut);
  qs.set('adults', String(guests.adults));
  if (guests.children) qs.set('children', String(guests.children));

  return (
    <section className="container-x pb-10">
      <div className="glass sticky top-[4.5rem] z-30 mb-10 rounded-3xl p-4">
        <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Room type">
          {['all', ...TYPE_ORDER].map((t) => (
            <button key={t} role="tab" aria-selected={type === t} onClick={() => setType(t)} className={cn('relative shrink-0 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition', type === t ? 'text-forest-950' : 'text-cream/70 hover:text-gold')}>
              {type === t && <motion.span layoutId="type-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="relative">{t === 'all' ? 'All rooms' : TYPE_LABEL[t]}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <DateRangeField checkIn={dates.checkIn} checkOut={dates.checkOut} onChange={setDates} compact />
          <GuestsField adults={guests.adults} kids={guests.children} onChange={setGuests} compact />
          <div className="relative">
            <label htmlFor="sort" className="sr-only">Sort rooms</label>
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-full w-full appearance-none rounded-2xl border border-white/15 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-cream outline-none focus:border-gold">
              <option className="bg-forest-900" value="recommended">Recommended</option>
              <option className="bg-forest-900" value="price-asc">Price: low to high</option>
              <option className="bg-forest-900" value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3"><CardSkeleton count={6} /></div>}
      {loading && <WakingNote show={waking} />}
      {!loading && !data && error != null && <ErrorNote message="We could not load our rooms." onRetry={reload} />}
      {!loading && data && (
        <>
          <p className="mb-6 text-sm text-cream/55" aria-live="polite">{list.length} {list.length === 1 ? 'room' : 'rooms'}{hasDates ? ' for your dates' : ''}</p>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((r, i) => (
                <motion.div layout key={r._id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
                  <RoomCard room={r} delay={(i % 3) * 0.06} soldOut={hasDates && r.available === false} href={`/rooms/${r.slug || r._id}?${qs.toString()}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {list.length === 0 && (
            <div className="glass mx-auto max-w-xl rounded-3xl p-10 text-center"><p className="font-display text-3xl">No rooms match</p><p className="mt-2 text-sm text-cream/60">Try changing the room type or the number of guests, or send us a message and we will help.</p></div>
          )}
        </>
      )}
    </section>
  );
}
