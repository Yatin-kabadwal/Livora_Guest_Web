'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageForm } from '@/components/messages/MessageForm';
import { Reveal } from '@/components/ui/Motion';
import { Btn } from '@/components/ui/Button';
import { useSettings } from '@/hooks/useSettings';
import { telLink, waLink } from '@/config/site';
import { formatClock } from '@/lib/format';

export function ContactView() {
  const { settings: s } = useSettings();
  const faqs = [
    { q: 'What are the check-in and check-out times?', a: `Check-in starts at ${formatClock(s.checkInTime)} and check-out is by ${formatClock(s.checkOutTime)}. If you need an earlier arrival or later departure, please message us and we will do our best.` },
    { q: 'What is your cancellation policy?', a: `You can cancel free of charge up to ${s.cancellationHours} hours before check-in from the Manage booking page. For later changes, please contact us and we will guide you.` },
    { q: 'Do I need to pay when I book?', a: 'No. Booking online is free. You pay at the resort at check-in.' },
    { q: 'Are pets allowed?', a: 'Pet arrangements can vary by room and season. Please call us to confirm before you travel.' },
    { q: 'Can you help with a jeep safari?', a: 'Yes, we can help you plan safaris in Jim Corbett National Park. Zones, timings and permits are set by the park, so please tell us your dates and we will guide you.' },
    { q: 'How do I get to the resort?', a: 'Open our location in Google Maps for directions. If you are travelling by train or bus, call us and we will help with the best route.' },
  ];
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { Icon: Phone, l: 'Call us', v: s.phone, href: telLink(s.phone) },
    { Icon: MessageCircle, l: 'WhatsApp', v: 'Chat with the front desk', href: waLink(s.whatsapp, 'Hello, I would like to know more about Corbett The Vedant By Livora.'), ext: true },
    { Icon: Mail, l: 'Email', v: s.email, href: `mailto:${s.email}` },
    { Icon: MapPin, l: 'Visit', v: s.address, href: s.mapsUrl, ext: true },
    { Icon: Clock, l: 'Front desk', v: 'Open 24x7' },
  ];
  return (
    <div className="container-x pb-10">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="glass rounded-[2.5rem] p-6 sm:p-10">
            <h2 className="font-display text-4xl sm:text-5xl">Send us a message</h2>
            <p className="mb-8 mt-3 text-sm text-cream/60">Your message goes straight to our team. We reply right here, and by email.</p>
            <MessageForm />
          </div>
        </Reveal>
        <div className="space-y-4">
          {items.map(({ Icon, l, v, href, ext }, i) => (
            <Reveal key={l} delay={i * 0.06}>
              {href ? (
                <a href={href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="glass group flex items-center gap-4 rounded-2xl p-5 transition hover:border-gold/60">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-forest-950"><Icon size={20} /></span>
                  <span className="min-w-0"><span className="block text-[0.65rem] uppercase tracking-[0.2em] text-gold">{l}</span><span className="block break-words text-cream">{v}</span></span>
                </a>
              ) : (
                <div className="glass flex items-center gap-4 rounded-2xl p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon size={20} /></span><span><span className="block text-[0.65rem] uppercase tracking-[0.2em] text-gold">{l}</span><span className="block text-cream">{v}</span></span></div>
              )}
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <div className="glass relative mt-16 overflow-hidden rounded-[2.5rem]">
          <iframe title="Map showing Corbett The Vedant By Livora" src={s.mapsEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[26rem] w-full border-0 [filter:invert(.9)_hue-rotate(160deg)_saturate(.6)_brightness(.9)]" allowFullScreen />
          <div className="absolute bottom-5 left-5 right-5 flex justify-center sm:left-auto sm:right-6 sm:justify-end"><Btn href={s.mapsUrl} external><ExternalLink size={15} /> Open in Google Maps</Btn></div>
        </div>
      </Reveal>

      <section className="mx-auto mt-24 max-w-3xl" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h-display mb-10 text-center text-5xl sm:text-6xl">Good to <em className="text-gold-light">know</em></h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="glass overflow-hidden rounded-2xl">
              <h3><button id={`faq-b-${i}`} aria-expanded={open === i} aria-controls={`faq-p-${i}`} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-2xl text-cream">{f.q}<motion.span animate={{ rotate: open === i ? 180 : 0 }} className="shrink-0 text-gold"><ChevronDown size={20} /></motion.span></button></h3>
              <AnimatePresence initial={false}>
                {open === i && <motion.div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden"><p className="px-6 pb-6 leading-relaxed text-cream/70">{f.a}</p></motion.div>}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
