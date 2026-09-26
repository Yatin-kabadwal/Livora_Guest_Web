'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, Copy, Check, MapPin, Leaf, Bird, Compass, Sparkles, Clock, Home as HomeIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeading } from '@/components/ui/Section';
import { Reveal, ParallaxImage, Counter, Marquee, MaskText } from '@/components/ui/Motion';
import { Btn } from '@/components/ui/Button';
import { CardSkeleton, ErrorNote, WakingNote } from '@/components/ui/Skeleton';
import { RoomCard } from '@/components/rooms/RoomCard';
import { LogoMark } from '@/components/ui/Logo';
import { photos } from '@/config/photos';
import { experiences } from '@/config/experiences';
import { useRooms, usePromotions, useReviews } from '@/hooks/useData';
import { useSettings } from '@/hooks/useSettings';
import { useReducedMotion } from '@/hooks/useMedia';
import { groupByType } from '@/lib/rooms';
import { formatINR } from '@/lib/format';
import type { Promotion } from '@/types';

export function MarqueeStrip() {
  return (
    <div className="border-y border-white/10 bg-forest-900 py-6">
      <Marquee items={['Jeep safari', 'Birdwatching', 'Riverside dining', 'Guided nature walks', 'Bonfire evenings', 'Yoga & wellness', 'Sal forest mornings']} />
    </div>
  );
}

export function StorySection() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40" aria-labelledby="story-h">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-moss/20 blur-[120px]" />
      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal><p className="eyebrow mb-5">Welcome to The Vedant</p></Reveal>
          <h2 id="story-h" className="h-display text-5xl sm:text-6xl lg:text-7xl"><MaskText text="A quieter kind of stay." italicWords={['quieter']} /></h2>
          <Reveal delay={0.1}><p className="mt-8 text-lg leading-relaxed text-cream/75">At the edge of Jim Corbett National Park, where Sal forest meets the foothills, we keep things deliberately small: ten rooms, unhurried mornings and hosts who remember your name.</p></Reveal>
          <Reveal delay={0.2}><p className="mt-5 leading-relaxed text-cream/65">Come for the safari, stay for the silence. The Vedant is a place to slow down, wake to birdsong and let the forest set the pace, hosted with warmth by Livora.</p></Reveal>
          <Reveal delay={0.3}><div className="mt-10 flex flex-wrap items-center gap-6"><Btn href="/about" variant="ghost">Read our story</Btn><Link href="/gallery" className="link-underline inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold">See the gallery <ArrowRight size={15} /></Link></div></Reveal>
        </div>
        <div className="relative mx-auto grid w-full max-w-xl grid-cols-6 grid-rows-6 gap-4 sm:h-[36rem]">
          <ParallaxImage src={photos.resort.about1} alt="The resort surrounded by forest" className="col-span-4 row-span-4 h-72 rounded-[2rem] sm:h-auto" />
          <ParallaxImage src={photos.resort.about2} alt="A quiet corner of the resort" className="col-span-2 col-start-5 row-span-3 row-start-2 hidden rounded-[2rem] sm:block" amount={20} />
          <ParallaxImage src={photos.resort.about3} alt="Evening light on the lawn" className="col-span-3 col-start-3 row-span-2 row-start-5 hidden rounded-[2rem] sm:block" amount={16} />
          <div className="absolute -bottom-6 left-2 hidden rounded-2xl border border-gold/30 bg-forest-900/90 px-5 py-4 backdrop-blur sm:block">
            <p className="font-display text-4xl text-gold-light"><Counter to={10} /></p><p className="text-[0.68rem] uppercase tracking-[0.2em] text-cream/60">Private rooms only</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StaySection() {
  const { data, loading, error, waking, reload } = useRooms();
  const groups = data ? groupByType(data) : [];
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="stay-h">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div id="stay-h"><SectionHeading eyebrow="Stay" title="Five ways to wake up in the forest" italicWords={['forest']} /></div>
          <Reveal><Btn href="/rooms" variant="ghost">View all rooms</Btn></Reveal>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-6">
          {loading && <CardSkeleton count={3} />}
          {!loading && groups.map((g, i) => (
            <div key={g.type} className={groups.length === 5 && i >= 3 ? 'xl:col-span-3' : 'xl:col-span-2'}>
              <RoomCard room={g.rooms[0]} href={`/rooms?type=${g.type}`} delay={(i % 3) * 0.1} fromLabel priceOverride={g.from} />
            </div>
          ))}
        </div>
        {loading && <WakingNote show={waking} />}
        {!loading && error != null && !data && <div className="mt-6"><ErrorNote message="Our rooms are on their way." onRetry={reload} /></div>}
        {!loading && data && groups.length === 0 && <p className="mt-10 text-center text-cream/60">Rooms will be listed here shortly. Please contact us to reserve.</p>}
      </div>
    </section>
  );
}

export function StatsSection() {
  const stats = [
    { n: 10, s: '', l: 'Private rooms', Icon: HomeIcon },
    { n: 5, s: '', l: 'Room categories', Icon: Sparkles },
    { n: 24, s: 'x7', l: 'Front desk', Icon: Clock },
    { n: 6, s: '', l: 'Signature experiences', Icon: Compass },
  ];
  return (
    <section className="relative border-y border-white/10 bg-gradient-to-b from-forest-900 to-forest-950 py-20" aria-label="At a glance">
      <div className="container-x grid grid-cols-2 gap-10 lg:grid-cols-4">
        {stats.map(({ n, s, l, Icon }, i) => (
          <Reveal key={l} delay={i * 0.1} className="text-center">
            <Icon className="mx-auto mb-4 text-gold/80" size={22} />
            <p className="font-display text-7xl text-cream sm:text-8xl"><Counter to={n} suffix={s} /></p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-sage">{l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ExperiencesScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.04, 0.96], [0, -dist]);
  useEffect(() => {
    const measure = () => { if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth)); };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const cards = experiences.map((e, i) => (
    <Link key={e.slug} href={`/experiences#${e.slug}`} className="group relative block h-[62svh] w-[78vw] shrink-0 overflow-hidden rounded-[2rem] border border-white/10 sm:h-[68vh] sm:w-[44vw] lg:w-[30vw]" aria-label={e.title}>
      <img src={e.image} alt={e.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/30 to-transparent" />
      <span className="absolute left-6 top-6 font-display text-6xl text-white/25">{String(i + 1).padStart(2, '0')}</span>
      <div className="absolute inset-x-0 bottom-0 p-7">
        <p className="eyebrow mb-2">{e.kicker}</p>
        <h3 className="font-display text-4xl text-cream sm:text-5xl">{e.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-cream/70">{e.short}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold transition group-hover:gap-4">Discover <ArrowRight size={14} /></span>
      </div>
    </Link>
  ));

  const head = (
    <div className="container-x pb-10 pt-24"><SectionHeading eyebrow="Experiences" title="Days shaped by the forest" italicWords={['forest']} sub="From first-light safaris to fireside evenings, everything is unhurried and arranged on request." /></div>
  );

  if (reduce) {
    return (<section aria-label="Experiences">{head}<div data-lenis-prevent className="no-scrollbar flex snap-x gap-5 overflow-x-auto px-4 pb-16 sm:px-8">{cards}</div></section>);
  }
  return (
    <section ref={ref} style={{ height: dist ? `calc(100svh + ${dist}px + 8vh)` : '320vh' }} className="relative" aria-label="Experiences">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-x pb-6 pt-16 md:pt-20"><p className="eyebrow mb-3">Experiences</p>
          <h2 className="h-display text-4xl sm:text-6xl">Days shaped by the <em className="text-gold-light">forest</em></h2></div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-5 px-4 will-change-transform sm:gap-7 sm:px-8 lg:px-14">
          {cards}
          <Link href="/experiences" className="glass flex h-[62svh] w-[60vw] shrink-0 flex-col items-center justify-center rounded-[2rem] p-8 text-center sm:h-[68vh] sm:w-[28vw]"><LogoMark className="mb-6 h-16 w-16" /><p className="font-display text-3xl text-cream">All experiences</p><ArrowRight className="mt-4 text-gold" /></Link>
        </motion.div>
        <div className="container-x mt-6"><div className="h-px w-full bg-white/10"><motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-gold" /></div></div>
      </div>
    </section>
  );
}

export function DiningTeaser() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36" aria-labelledby="dine-h">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="grid grid-cols-2 gap-4">
          <ParallaxImage src={photos.dining[0]} alt="A dish from Vedant Kitchen" className="mt-10 aspect-[3/4] rounded-[2rem]" />
          <ParallaxImage src={photos.dining[1]} alt="Dining at the resort" className="aspect-[3/4] rounded-[2rem]" amount={18} />
        </div>
        <div>
          <Reveal><p className="eyebrow mb-5">Vedant Kitchen</p></Reveal>
          <h2 id="dine-h" className="h-display text-5xl sm:text-6xl lg:text-7xl"><MaskText text="Warm plates, wood smoke and slow dinners." italicWords={['slow']} /></h2>
          <Reveal delay={0.1}><p className="mt-7 text-lg leading-relaxed text-cream/70">Our kitchen cooks fresh, honest food for the appetite you build in the forest, with vegetarian and non-vegetarian choices. Browse today's menu, exactly as the kitchen has it.</p></Reveal>
          <Reveal delay={0.2}><div className="mt-9"><Btn href="/dining">See the menu</Btn></div></Reveal>
        </div>
      </div>
    </section>
  );
}

function OfferMini({ p }: { p: Promotion }) {
  const [copied, setCopied] = useState(false);
  const off = p.discountType === 'percent' ? `${p.discountValue}% off` : `${formatINR(p.discountValue)} off`;
  return (
    <div className="glass relative flex w-[19rem] shrink-0 flex-col justify-between rounded-3xl p-6">
      <div><p className="eyebrow mb-2">{off}</p><h3 className="font-display text-3xl leading-tight text-cream">{p.name}</h3>
        {p.description && <p className="mt-2 line-clamp-2 text-sm text-cream/65">{p.description}</p>}</div>
      <button onClick={async () => { try { await navigator.clipboard.writeText(p.code); setCopied(true); toast.success(`Code ${p.code} copied`); setTimeout(() => setCopied(false), 2000); } catch { toast(`Use code ${p.code}`); } }}
        className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-gold/60 px-4 py-3 text-sm font-bold tracking-[0.2em] text-gold-light transition hover:bg-gold/10" aria-label={`Copy promo code ${p.code}`}>
        {p.code}{copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export function OffersStrip() {
  const { data } = usePromotions();
  if (!data || data.length === 0) return null;
  return (
    <section className="border-y border-gold/15 bg-forest-900/60 py-16" aria-labelledby="offers-h">
      <div className="container-x">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Offers</p><h2 id="offers-h" className="h-display text-4xl sm:text-5xl">Current <em className="text-gold-light">offers</em></h2></div><Link href="/offers" className="link-underline text-sm font-semibold uppercase tracking-widest text-gold">All offers</Link></div>
        <div data-lenis-prevent className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">{data.slice(0, 6).map((p) => <OfferMini key={p._id} p={p} />)}</div>
      </div>
    </section>
  );
}

const HIGHLIGHTS = [
  { Icon: Leaf, t: 'At the forest edge', d: 'Set beside the Sal forests of Jim Corbett, with birdsong for an alarm clock.' },
  { Icon: HomeIcon, t: 'Only ten rooms', d: 'A small property means calm corridors, personal attention and no crowds.' },
  { Icon: Compass, t: 'Safari, arranged', d: 'We help you plan jeep safaris and nature walks with local guides.' },
  { Icon: Bird, t: 'Slow by design', d: 'Birdwatching at dawn, bonfires at dusk, and nowhere you have to be.' },
];

export function LoveSection() {
  const { data } = useReviews();
  const reviews = (data || []).slice(0, 6);
  if (reviews.length > 0) {
    return (
      <section className="py-28" aria-labelledby="rev-h">
        <div className="container-x">
          <SectionHeading eyebrow="Guest words" title="Kind words from our guests" italicWords={['guests']} />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r._id} delay={(i % 3) * 0.1}>
                <figure className="glass h-full rounded-3xl p-8">
                  <div className="flex gap-1 text-gold" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={16} fill={k < r.rating ? 'currentColor' : 'none'} />)}</div>
                  {r.title && <p className="mt-4 font-display text-2xl text-cream">{r.title}</p>}
                  <blockquote className="mt-3 text-sm leading-relaxed text-cream/75">{r.comment}</blockquote>
                  <figcaption className="mt-5 text-xs uppercase tracking-widest text-sage">{r.name}{r.location ? `, ${r.location}` : ''}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-28" aria-labelledby="love-h">
      <div className="container-x">
        <div id="love-h"><SectionHeading eyebrow="Why guests love it" title="Small, calm and close to the wild" italicWords={['calm']} /></div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="glass group h-full rounded-3xl p-7 transition duration-500 hover:-translate-y-2 hover:border-gold/50">
                <span className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-forest-950"><Icon size={22} /></span>
                <h3 className="font-display text-2xl text-cream">{t}</h3><p className="mt-2 text-sm leading-relaxed text-cream/65">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocationSection() {
  const { settings: s } = useSettings();
  return (
    <section className="py-16 sm:py-24" aria-labelledby="loc-h">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-[2.5rem]">
          <div className="grid lg:grid-cols-2">
            <div className="relative z-10 p-8 sm:p-14">
              <p className="eyebrow mb-4">Getting here</p>
              <h2 id="loc-h" className="h-display text-5xl sm:text-6xl">At the edge of <em className="text-gold-light">Jim Corbett</em></h2>
              <p className="mt-6 flex items-start gap-3 text-cream/75"><MapPin className="mt-1 shrink-0 text-gold" size={18} />{s.address}</p>
              <p className="mt-4 text-sm leading-relaxed text-cream/60">Need help planning the journey? Call us or message us and we will guide you, from the nearest railway station to your safari zone.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Btn href={s.mapsUrl} external>Open in Google Maps</Btn><Btn href="/contact" variant="ghost">Contact us</Btn></div>
            </div>
            <div className="relative min-h-[18rem] lg:min-h-[26rem]">
              <img src={photos.resort.exterior} alt="The resort in its forest setting" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden py-32 text-center sm:py-44" aria-labelledby="cta-h">
      <img src={photos.resort.night} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950 via-forest-950/60 to-forest-950" />
      <div className="container-x">
        <div className="mx-auto mb-8 h-20 w-20 [perspective:600px]"><div className="spin3d h-full w-full"><LogoMark className="h-full w-full drop-shadow-[0_0_24px_rgba(217,183,106,.5)]" /></div></div>
        <h2 id="cta-h" className="h-display mx-auto max-w-4xl text-6xl sm:text-8xl"><MaskText text="Your forest morning is waiting." italicWords={['forest']} /></h2>
        <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-xl text-cream/70">Reserve in minutes. No payment now, pay at the resort at check-in.</p></Reveal>
        <Reveal delay={0.3}><div className="mt-10 flex flex-wrap justify-center gap-4"><Btn href="/booking">Book your stay</Btn><Btn href="/contact" variant="ghost">Ask us anything</Btn></div></Reveal>
      </div>
    </section>
  );
}

