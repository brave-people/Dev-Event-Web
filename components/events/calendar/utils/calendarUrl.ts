import {
  MonthParam,
  monthKey,
  readMonthParam,
} from 'lib/utils/timeline/dateStrip';
import { dayKey, keyToMs } from 'lib/utils/timeline/kst';

export type UrlQuery = Record<string, string | string[] | undefined>;

export interface CalendarTarget {
  year: number;
  month: number; // 1~12
  day?: string | null; // 고른 날. 없으면 주소에 넣지 않는다
}

const FIRST_ONLY_KEYS = ['type', 'location', 'coast', 'kwd'];

const textOf = (value: string | string[] | undefined): string | null => {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' && first !== '' ? first : null;
};

// 'YYYY-MM-DD' 형식이고 실제로 있는 날짜인가
const isRealDay = (value: string | null): value is string =>
  !!value &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  dayKey(keyToMs(value)) === value;

// 주소의 필터만 뽑아 목록 화면의 주소로 만든다.
export const listPathOf = (query: UrlQuery): string => {
  const parts: string[] = [];

  const tags = Array.isArray(query.tag) ? query.tag : [query.tag];
  tags.forEach((tag) => {
    if (typeof tag === 'string' && tag !== '') {
      parts.push(`tag=${encodeURIComponent(tag)}`);
    }
  });

  FIRST_ONLY_KEYS.forEach((key) => {
    const value = textOf(query[key]);
    if (value) parts.push(`${key}=${encodeURIComponent(value)}`);
  });

  return parts.length > 0 ? `/search?${parts.join('&')}` : '/events';
};

// 주소의 day가 보고 있는 달의 실제 날짜일 때만 돌려준다
export const readDayParam = (
  query: UrlQuery,
  year: number,
  month: number
): string | null => {
  const { day } = query;
  if (typeof day !== 'string' || !isRealDay(day)) return null;
  return day.slice(0, 7) === monthKey(year, month) ? day : null;
};

export const calendarHref = (
  target: CalendarTarget,
  listPath: string
): string => {
  let href = `/events?view=calendar&year=${target.year}&month=${target.month}`;
  if (target.day) href += `&day=${target.day}`;
  const [path, search] = listPath.split('?');
  if (path === '/search' && search) href += `&${search}`;
  return href;
};

export const shiftMonth = (
  year: number,
  month: number,
  delta: number
): MonthParam => {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
};

// 보기 전환: 타임라인 → 캘린더
export const toCalendarHref = (opts: {
  query: UrlQuery;
  dayKey?: string | null;
  todayKey: string;
}): string => {
  const { query, todayKey } = opts;
  const listPath = listPathOf(query);

  if (isRealDay(opts.dayKey ?? null)) {
    const key = opts.dayKey as string;
    return calendarHref(
      {
        year: Number(key.slice(0, 4)),
        month: Number(key.slice(5, 7)),
        day: key,
      },
      listPath
    );
  }

  const param = readMonthParam({ year: query.year, month: query.month });
  const target = param || {
    year: Number(todayKey.slice(0, 4)),
    month: Number(todayKey.slice(5, 7)),
  };
  return calendarHref(target, listPath);
};

// 보기 전환: 캘린더 → 타임라인
export const toTimelineHref = (opts: {
  query: UrlQuery;
  todayKey: string;
}): string => {
  const { query, todayKey } = opts;
  const listPath = listPathOf(query);
  if (listPath !== '/events') return listPath;

  const param = readMonthParam({ year: query.year, month: query.month });
  if (param && monthKey(param.year, param.month) < todayKey.slice(0, 7)) {
    return `/events?year=${param.year}&month=${param.month}`;
  }
  return '/events';
};
