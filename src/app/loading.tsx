import { LogoMark } from '@/components/ui/Logo';

export default function Loading() {
  return (
    <div className="grid min-h-[70svh] place-items-center" role="status" aria-label="Loading">
      <div className="text-center"><LogoMark draw className="mx-auto h-16 w-16" /><p className="mt-4 text-xs uppercase tracking-[0.4em] text-gold/70">Loading</p></div>
    </div>
  );
}
