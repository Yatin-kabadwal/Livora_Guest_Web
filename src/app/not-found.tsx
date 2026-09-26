import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="relative grid min-h-[100svh] place-items-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(47,107,79,.3),transparent_65%)]" />
      <div className="relative">
        <LogoMark className="mx-auto mb-6 h-20 w-20 opacity-80" />
        <p className="eyebrow">Error 404</p>
        <h1 className="h-display mt-4 text-7xl sm:text-9xl">Lost in the <em className="text-gold-light">forest</em></h1>
        <p className="mx-auto mt-5 max-w-md text-cream/65">The page you are looking for has wandered off the trail. Let us guide you back.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="btn btn-gold">Back to home</Link><Link href="/rooms" className="btn btn-ghost">See rooms</Link></div>
      </div>
    </div>
  );
}
