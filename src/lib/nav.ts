/** Only allow same-site relative redirects. */
export function safeNext(n: string | null | undefined, fallback = '/profile'): string {
  if (!n || !n.startsWith('/') || n.startsWith('//') || n.includes('\\')) return fallback;
  return n;
}
