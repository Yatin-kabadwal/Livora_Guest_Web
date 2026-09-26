import { cn } from '@/lib/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass overflow-hidden rounded-3xl" aria-hidden="true">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="mt-4 h-10 w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

/** Friendly note shown when the API takes a while (cold start). */
export function WakingNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="mt-6 flex items-center justify-center gap-3 text-center text-sm text-sage">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
      Waking up the server, one moment. This can take up to half a minute the first time.
    </p>
  );
}

export function ErrorNote({ message = 'We could not load this right now.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="glass mx-auto max-w-xl rounded-3xl p-8 text-center">
      <p className="font-display text-2xl text-cream">{message}</p>
      <p className="mt-2 text-sm text-cream/60">Our server may be starting up. Please try again in a moment, or call us and we will help you directly.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost btn-sm mt-5">Try again</button>
      )}
    </div>
  );
}
