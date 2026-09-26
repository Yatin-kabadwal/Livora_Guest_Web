'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { telLink } from '@/config/site';

export function MobileBookBar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  if (pathname.startsWith('/booking') || pathname.startsWith('/auth') || pathname.startsWith('/messages')) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-gold/20 bg-forest-950/85 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3">
        <a href={telLink(settings.phone)} aria-label="Call the resort" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-gold"><Phone size={18} /></a>
        <Link href="/booking" className="btn btn-gold flex-1 py-3.5">Book now</Link>
      </div>
    </div>
  );
}
