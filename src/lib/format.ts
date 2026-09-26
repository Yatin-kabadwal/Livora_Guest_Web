import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

export const formatINR = (n: number | undefined | null): string =>
  '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n || 0));

/** Accepts ISO strings, YYYY-MM-DD or Date. Returns "12 Oct 2026". */
export function toDate(d: string | Date | undefined | null): Date | null {
  if (!d) return null;
  const x = typeof d === 'string' ? parseISO(d.length === 10 ? d : d) : d;
  return isValid(x) ? x : null;
}
export const formatDate = (d: string | Date | undefined | null): string => {
  const x = toDate(d);
  return x ? format(x, 'd MMM yyyy') : '';
};
export const formatDateLong = (d: string | Date | undefined | null): string => {
  const x = toDate(d);
  return x ? format(x, 'EEE, d MMM yyyy') : '';
};
export const formatTime = (d: string | Date | undefined | null): string => {
  const x = toDate(d);
  return x ? format(x, 'h:mm a') : '';
};
export const formatDateTime = (d: string | Date | undefined | null): string => {
  const x = toDate(d);
  return x ? format(x, 'd MMM, h:mm a') : '';
};
export const ymd = (d: Date): string => format(d, 'yyyy-MM-dd');
/** Parse YYYY-MM-DD as a local calendar day. */
export const fromYmd = (s?: string | null): Date | undefined => {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return undefined;
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const nightsBetween = (a?: Date, b?: Date): number => (a && b ? Math.max(0, differenceInCalendarDays(b, a)) : 0);
/** "14:00" -> "2:00 PM" */
export const formatClock = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, '0')} ${ap}`;
};
export const cn = (...c: Array<string | false | null | undefined>): string => c.filter(Boolean).join(' ');
export const pluralize = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const isPhone = (s: string) => /^\+?[\d\s-]{10,15}$/.test(s.trim());
export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const statusLabel = (s: string) => capitalize(s.replace(/_/g, ' '));

/** Calendar day (YYYY-MM-DD) in Indian time for an ISO timestamp or a plain date string. */
export function istYmd(iso?: string | null): string {
  if (!iso) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 19800000).toISOString().slice(0, 10);
}
export const formatStay = (iso?: string | null): string => formatDate(istYmd(iso));
export const formatStayLong = (iso?: string | null): string => formatDateLong(istYmd(iso));
