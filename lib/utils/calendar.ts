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

// ![설명](주소). 설명 안의 대괄호는 \[ \]로 이스케이프한 것(등록 스크립트)과
// 짝이 맞는 한 겹(어드민 에디터가 그대로 넣는 파일명)까지 받는다.
const MARKDOWN_IMAGE =
  /!\[(?:[^[\]\\\n]|\\.|\[(?:[^[\]\\\n]|\\.)*\])*\]\([^)\n]*\)/;
// 이미지만 있는 줄은 줄바꿈까지 지운다. 줄바꿈을 남기면 그 자리가 빈 줄이 된다.
const IMAGE_ONLY_LINE = new RegExp(
  `^[ \\t]*(?:${MARKDOWN_IMAGE.source}[ \\t]*)+\\n`,
  'gm'
);
// 글 사이에 섞인 이미지는 앞 공백과 함께 지운다.
const INLINE_IMAGE = new RegExp(`[ \\t]*${MARKDOWN_IMAGE.source}`, 'g');

// 캘린더 설명란은 마크다운을 그리지 않는다. 이미지 문법과 S3 주소가 그대로 보이고
// 500자 안에서 요약 자리를 차지하므로, 자르기 전에 지운다.
const stripMarkdownImages = (markdown: string): string =>
  markdown
    .replace(IMAGE_ONLY_LINE, '')
    .replace(INLINE_IMAGE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const buildDetails = (event: Event, baseUrl: string): string => {
  const link = baseUrl ? `${baseUrl}/event/detail/${event.id}` : '';
  const desc = event.description
    ? stripMarkdownImages(event.description).slice(0, 500)
    : '';
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
