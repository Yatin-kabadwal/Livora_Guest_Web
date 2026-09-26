/** Safe localStorage helpers (never throw, SSR safe). */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be blocked */
  }
}
export function readSession(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage.getItem(key); } catch { return null; }
}
export function writeSession(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(key, value); } catch { /* ignore */ }
}

export interface SavedThread { ref: string; token: string; subject?: string; at: string }
export const THREADS_KEY = 'cvl_threads';
export const LAST_BOOKING_KEY = 'cvl_last_booking';

export const getSavedThreads = (): SavedThread[] => readJSON<SavedThread[]>(THREADS_KEY, []);
export function saveThread(t: SavedThread) {
  const list = getSavedThreads().filter((x) => x.token !== t.token);
  list.unshift(t);
  writeJSON(THREADS_KEY, list.slice(0, 20));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cvl-threads'));
}
export const getLastBooking = () => readJSON<{ ref: string; email: string } | null>(LAST_BOOKING_KEY, null);
export const saveLastBooking = (b: { ref: string; email: string }) => writeJSON(LAST_BOOKING_KEY, b);
