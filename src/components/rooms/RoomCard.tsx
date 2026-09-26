'use client';
import Link from 'next/link';
import { BedDouble, Maximize2, Users, ArrowUpRight } from 'lucide-react';
import { TiltCard } from '@/components/ui/TiltCard';
import { Reveal } from '@/components/ui/Motion';
import { resolveRoomImages } from '@/config/photos';
import { formatINR } from '@/lib/format';
import { TYPE_LABEL, capacityText } from '@/lib/rooms';
import type { Room } from '@/types';

export function RoomCard({ room, href, delay = 0, soldOut = false, fromLabel = false, priceOverride }: { room: Room; href: string; delay?: number; soldOut?: boolean; fromLabel?: boolean; priceOverride?: number }) {
  const img = resolveRoomImages(room.imageUrls, room.type)[0];
  return (
    <Reveal delay={delay} y={50}>
      <TiltCard className="group rounded-3xl">
        <Link href={href} className="glass relative block overflow-hidden rounded-3xl" aria-label={`${room.name}, ${soldOut ? 'sold out for your dates' : 'view details'}`}>
          <div className="relative aspect-[4/3] overflow-hidden">
            <img src={img} alt={`${room.name} interior`} loading="lazy" decoding="async" className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 ${soldOut ? 'grayscale-[60%]' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/10 to-transparent" />
            <span className="chip chip-gold absolute left-4 top-4 bg-forest-950/60 backdrop-blur">{TYPE_LABEL[room.type] || room.type}</span>
            {soldOut && <span className="absolute right-4 top-4 rounded-full bg-ember px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-forest-950">Sold out for your dates</span>}
            <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-gold text-forest-950 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={18} /></span>
          </div>
          <div className="p-6" style={{ transform: 'translateZ(30px)' }}>
            <h3 className="font-display text-3xl leading-tight text-cream">{room.name}</h3>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-cream/65">
              <span className="flex items-center gap-1.5"><Users size={14} className="text-gold" />{capacityText(room)}</span>
              {room.bedType && <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-gold" />{room.bedType}</span>}
              {!!room.size && <span className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gold" />{room.size} sq ft</span>}
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-cream/50">{fromLabel ? 'From' : 'Per night'}</p>
                <p className="font-display text-3xl text-gold-light">{formatINR(priceOverride ?? room.pricePerNight)}</p>
              </div>
              <span className="text-[0.7rem] uppercase tracking-[0.18em] text-cream/60">incl. taxes</span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  );
}
