import { cn } from '@/lib/format';

/** The mark: a "V" formed by two mountain ridges, with a Sal leaf rising from between them. */
export function LogoMark({ className, draw = false }: { className?: string; draw?: boolean }) {
  const s = draw ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 } : undefined;
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true" focusable="false">
      <path className={draw ? 'logo-draw' : undefined} pathLength={draw ? 1 : undefined} style={s} d="M9 14 L32 54 L55 14" stroke="#d9b76a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path className={draw ? 'logo-draw' : undefined} pathLength={draw ? 1 : undefined} style={s} d="M17 34 L24 26 L29 31 L36 21 L47 34" stroke="#8fb9a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
      <path className={draw ? 'logo-draw' : undefined} pathLength={draw ? 1 : undefined} style={s} d="M32 6 C40 14 40 24 32 31 C24 24 24 14 32 6Z" stroke="#f0d9a0" strokeWidth="1.8" strokeLinejoin="round" fill={draw ? 'none' : 'rgba(143,185,160,.25)'} />
      <path className={draw ? 'logo-draw' : undefined} pathLength={draw ? 1 : undefined} style={s} d="M32 10 V29" stroke="#f0d9a0" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Full wordmark as one inline SVG: mark + "CORBETT THE VEDANT" + small-caps "BY LIVORA". */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <svg
      viewBox={compact ? '0 0 56 56' : '0 0 340 56'}
      className={cn('h-10 w-auto', className)}
      role="img"
      aria-label="Corbett The Vedant By Livora"
    >
      <g transform="translate(0 0) scale(.875)">
        <path d="M9 14 L32 54 L55 14" stroke="#d9b76a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M17 34 L24 26 L29 31 L36 21 L47 34" stroke="#8fb9a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".9" />
        <path d="M32 6 C40 14 40 24 32 31 C24 24 24 14 32 6Z" stroke="#f0d9a0" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(143,185,160,.25)" />
        <path d="M32 10 V29" stroke="#f0d9a0" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      {!compact && (
        <g>
          <text x="66" y="28" fill="#f4efe2" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="23" fontWeight="600" textLength="266" lengthAdjust="spacing">CORBETT THE VEDANT</text>
          <text x="67" y="46" fill="#d9b76a" fontFamily="'Manrope Variable', system-ui, sans-serif" fontSize="8.5" fontWeight="600" textLength="108" lengthAdjust="spacing">BY LIVORA</text>
        </g>
      )}
    </svg>
  );
}
