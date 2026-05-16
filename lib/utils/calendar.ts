import { Event } from 'model/event';

export type CalendarTarget = 'google' | 'apple' | 'outlook';

const pad = (n: number) => String(n).padStart(2, '0');

const toIcsUtc = (input: string | Date): string => {
  const d = typeof input === 'string' ? new Date(input) : input;
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

const toIcsDate = (input: string | Date): string => {
  const d = typeof input === 'string' ? new Date(input) : input;
  return (
    d.getFullYear().toString() + pad(d.getMonth() + 1) + pad(d.getDate())
  );
};

// DST/TZ-safe single day increment using local date components.
const nextLocalDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

const escapeText = (text: string): string =>
  text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

export const isAllDayEvent = (
  event: Pick<Event, 'use_start_date_time_yn' | 'use_end_date_time_yn'>
): boolean =>
  event.use_start_date_time_yn === 'N' || event.use_end_date_time_yn === 'N';

const buildDetails = (event: Event, baseUrl: string): string => {
  const link = baseUrl ? `${baseUrl}/event/detail/${event.id}` : '';
  const desc = event.description ? event.description.slice(0, 500) : '';
  return [desc, link ? `자세히 보기: ${link}` : ''].filter(Boolean).join('\n\n');
};

export const buildIcsForEvent = (event: Event, baseUrl = ''): string => {
  const start = new Date(event.start_date_time);
  const end = new Date(event.end_date_time);
  const allDay = isAllDayEvent(event);
  const now = new Date();
  const uid = `dev-event-${event.id}@dev-event.vercel.app`;
  const link = baseUrl ? `${baseUrl}/event/detail/${event.id}` : '';

  const dtStart = allDay
    ? `DTSTART;VALUE=DATE:${toIcsDate(start)}`
    : `DTSTART:${toIcsUtc(start)}`;
  const dtEnd = allDay
    ? `DTEND;VALUE=DATE:${toIcsDate(nextLocalDay(end))}`
    : `DTEND:${toIcsUtc(end)}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dev Event Web//KO//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(now)}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(buildDetails(event, baseUrl))}`,
    event.organizer ? `LOCATION:${escapeText(event.organizer)}` : '',
    link ? `URL:${link}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(event.title)} 시작 30분 전`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
};

export const buildGoogleCalendarUrl = (event: Event, baseUrl = ''): string => {
  const start = new Date(event.start_date_time);
  const end = new Date(event.end_date_time);
  const allDay = isAllDayEvent(event);

  const dates = allDay
    ? `${toIcsDate(start)}/${toIcsDate(nextLocalDay(end))}`
    : `${toIcsUtc(start)}/${toIcsUtc(end)}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: buildDetails(event, baseUrl),
    location: event.organizer || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const downloadIcsForEvent = (event: Event, baseUrl = ''): void => {
  const ics = buildIcsForEvent(event, baseUrl);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `dev-event-${event.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const openInCalendar = (
  target: CalendarTarget,
  event: Event,
  baseUrl = ''
): void => {
  if (target === 'google') {
    window.open(buildGoogleCalendarUrl(event, baseUrl), '_blank', 'noopener');
    return;
  }
  downloadIcsForEvent(event, baseUrl);
};
