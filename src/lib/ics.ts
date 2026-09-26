import { istYmd } from './format';
import type { Booking } from '@/types';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const stamp = (ymd: string, hhmm: string) => `${ymd.replace(/-/g, '')}T${hhmm.replace(':', '')}00`;

/** Build an .ics file (floating local time) for a booking. */
export function buildIcs(b: Booking, opts: { name: string; address: string; checkIn: string; checkOut: string; phone: string }): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Corbett The Vedant By Livora//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.bookingRef}@corbett-the-vedant`, `DTSTAMP:${now}`,
    `DTSTART:${stamp(istYmd(b.checkIn), opts.checkIn)}`, `DTEND:${stamp(istYmd(b.checkOut), opts.checkOut)}`,
    `SUMMARY:${esc(`Stay at ${opts.name}`)}`, `LOCATION:${esc(opts.address)}`,
    `DESCRIPTION:${esc(`Booking ${b.bookingRef}\n${b.roomName}, ${b.nights} night(s)\nPay at the resort at check-in.\nQuestions? Call ${opts.phone}`)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Your forest stay is tomorrow', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function downloadText(filename: string, text: string, mime = 'text/calendar;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
