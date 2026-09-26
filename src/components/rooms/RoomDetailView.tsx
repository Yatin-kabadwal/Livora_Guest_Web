'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BedDouble, Maximize2, Users, Mountain, Layers, Clock, ShieldCheck } from 'lucide-react';
import { RoomViewer3D } from './RoomViewer3D';
import { AmenityIcon } from './AmenityIcon';
import { DateRangeField, GuestsField } from '@/components/ui/DateRange';
import { MealPlanSelector } from '@/components/booking/MealPlans';
import { PromoField } from '@/components/booking/PromoField';
import { PriceBreakdown } from '@/components/booking/PriceBreakdown';
import { Reveal, MaskText } from '@/components/ui/Motion';
import { Skeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { useRoom } from '@/hooks/useData';
import { useSettings } from '@/hooks/useSettings';
import { useQuote } from '@/hooks/useQuote';
import { resolveRoomImages } from '@/config/photos';
import { TYPE_LABEL, capacityText } from '@/lib/rooms';
import { formatINR, formatClock, nightsBetween, fromYmd } from '@/lib/format';

export function RoomDetailView({ slug }: { slug: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { data: room, loading, error, waking, reload } = useRoom(slug);
  const { settings } = useSettings();
  const [dates, setDates] = useState<{ checkIn?: string; checkOut?: string }>({ checkIn: sp.get('checkIn') || undefined, checkOut: sp.get('checkOut') || undefined });
  const [guests, setGuests] = useState({ adults: Number(sp.get('adults')) || 2, children: Number(sp.get('children')) || 0 });
  const [mealPlan, setMealPlan] = useState(sp.get('mealPlan') || '');
  const [promo, setPromo] = useState(sp.get('promo') || '');
  useEffect(() => { if (!mealPlan && settings.mealPlans[0]) setMealPlan(settings.mealPlans[0].code); }, [settings.mealPlans, mealPlan]);

  const { quote, loading: qLoading, error: qError } = useQuote({ roomId: room?._id, ...dates, ...guests, mealPlan, promoCode: promo });
  const nights = nightsBetween(fromYmd(dates.checkIn), fromYmd(dates.checkOut));
  const images = useMemo(() => (room ? resolveRoomImages(room.imageUrls, room.type) : []), [room]);

  const book = () => {
    if (!room) return;
    const p = new URLSearchParams({ room: room.slug || room._id, adults: String(guests.adults), children: String(guests.children), mealPlan });
    if (dates.checkIn) p.set('checkIn', dates.checkIn);
    if (dates.checkOut) p.set('checkOut', dates.checkOut);
    if (promo) p.set('promo', promo);
    router.push(`/booking?${p.toString()}`);
  };

  if (loading) return (
    <div className="container-x pb-20 pt-36"><Skeleton className="mb-8 h-14 w-2/3" /><div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]"><Skeleton className="aspect-[16/10] rounded-[2rem]" /><Skeleton className="h-96 rounded-3xl" /></div><WakingNote show={waking} /></div>
  );
  if (!room) return (
    <div className="container-x pb-20 pt-40"><ErrorNote message={error ? 'We could not load this room.' : 'Room not found'} onRetry={error ? reload : undefined} /><p className="mt-6 text-center"><Link href="/rooms" className="link-underline text-gold">Back to all rooms</Link></p></div>
  );

  const specs = [
    { Icon: Users, l: 'Sleeps', v: capacityText(room).replace('Up to ', '') },
    room.bedType && { Icon: BedDouble, l: 'Bed', v: room.bedType },
    room.size ? { Icon: Maximize2, l: 'Size', v: `${room.size} sq ft` } : null,
    room.view && { Icon: Mountain, l: 'View', v: room.view },
    room.floor !== undefined && { Icon: Layers, l: 'Floor', v: room.floor === 0 ? 'Ground' : String(room.floor) },
  ].filter(Boolean) as Array<{ Icon: typeof Users; l: string; v: string }>;

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <Link href="/rooms" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream/60 transition hover:text-gold"><ArrowLeft size={14} /> All rooms</Link>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip chip-gold mb-4">{TYPE_LABEL[room.type] || room.type}</span>
          <h1 className="h-display text-5xl sm:text-7xl"><MaskText text={room.name} instant /></h1>
        </div>
        <div className="text-right"><p className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/50">From, per night</p><p className="font-display text-5xl text-gold-light">{formatINR(room.pricePerNight)}</p><p className="text-xs text-cream/45">incl. taxes</p></div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <RoomViewer3D images={images} alt={room.name} />
          <Reveal className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map(({ Icon, l, v }) => (
              <div key={l} className="glass flex items-center gap-3 rounded-2xl p-4"><Icon size={20} className="shrink-0 text-gold" /><div className="min-w-0"><p className="text-[0.62rem] uppercase tracking-[0.18em] text-cream/50">{l}</p><p className="truncate text-sm text-cream">{v}</p></div></div>
            ))}
          </Reveal>
          {room.description && <Reveal><div className="mt-12"><h2 className="font-display text-4xl">About this room</h2><p className="mt-4 whitespace-pre-line leading-relaxed text-cream/75">{room.description}</p></div></Reveal>}
          {room.highlights?.length > 0 && (
            <Reveal><div className="mt-12"><h2 className="font-display text-4xl">Highlights</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">{room.highlights.map((h) => <li key={h} className="flex items-start gap-3 text-cream/80"><span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />{h}</li>)}</ul></div></Reveal>
          )}
          {room.amenities?.length > 0 && (
            <Reveal><div className="mt-12"><h2 className="font-display text-4xl">Amenities</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{room.amenities.map((a) => <li key={a} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-cream/85"><span className="text-gold"><AmenityIcon name={a} /></span>{a}</li>)}</ul></div></Reveal>
          )}
          <Reveal><div className="mt-12 flex flex-wrap gap-6 rounded-3xl border border-white/10 p-6 text-sm text-cream/70">
            <span className="flex items-center gap-2"><Clock size={16} className="text-gold" /> Check-in {formatClock(settings.checkInTime)}</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-gold" /> Check-out {formatClock(settings.checkOutTime)}</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-gold" /> Free cancellation up to {settings.cancellationHours} hours before check-in</span>
          </div></Reveal>
        </div>

        <aside aria-label="Book this room" className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-[2rem] p-6 sm:p-7">
            <h2 className="font-display text-3xl">Reserve this room</h2>
            <div className="mt-5 space-y-3">
              <DateRangeField checkIn={dates.checkIn} checkOut={dates.checkOut} onChange={setDates} />
              <GuestsField adults={guests.adults} kids={guests.children} onChange={setGuests} maxAdults={room.maxAdults} maxChildren={room.maxChildren} />
            </div>
            <div className="mt-6"><MealPlanSelector plans={settings.mealPlans} value={mealPlan} onChange={setMealPlan} /></div>
            <div className="mt-6"><PromoField applied={promo} onApply={setPromo} nights={nights} amount={quote?.roomAmount ?? room.pricePerNight * Math.max(1, nights)} roomType={room.type} /></div>
            <div className="mt-6 min-h-[8rem] border-t border-white/10 pt-5" aria-live="polite">
              {!dates.checkIn || !dates.checkOut ? <p className="text-sm text-cream/55">Select your dates to see the total for your stay.</p>
                : qLoading ? <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-4 h-10 w-1/2" /></div>
                : qError ? <p className="text-sm text-[#f19a8f]">{qError}</p>
                : quote ? <PriceBreakdown q={quote} /> : null}
              {quote?.promoMessage && !qLoading && <p className="mt-2 text-xs text-sage">{quote.promoMessage}</p>}
            </div>
            {!settings.bookingsOpen && <p className="mt-4 rounded-xl bg-ember/10 p-3 text-xs text-ember">Online bookings are paused right now. Please call us to reserve.</p>}
            <button onClick={book} disabled={!settings.bookingsOpen || room.available === false} className="btn btn-gold mt-5 w-full">Book this room</button>
            <p className="mt-3 text-center text-xs text-cream/50">No payment now. Pay at the resort at check-in.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
