import { EventResponse } from 'model/event';
import { addDays, diffDays, DOW, weekdayOf } from 'lib/utils/timeline/kst';

export interface MonthParam {
  year: number;
  month: number; // 1~12
}

export interface StripDay {
  key: string;
  day: number; // 1~31
  label: string; // 요일 한 글자. 1일은 'N월'
  weekday: number; // 0=일 … 6=토
  count: number;
  isToday: boolean;
  isPast: boolean;
  isFirst: boolean; // 1일
}

export const STRIP_MIN_DAYS = 14;
export const STRIP_MAX_DAYS = 366;

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const monthKey = (year: number, month: number): string =>
  `${year}-${pad(month)}`;

export const stripRange = (opts: {
  keys: string[];
  todayKey: string;
  showPast: boolean;
  month?: MonthParam | null;
}): { from: string; to: string } => {
  const { keys, todayKey, showPast, month } = opts;
  if (month) {
    const from = `${monthKey(month.year, month.month)}-01`;
    const next =
      month.month === 12
        ? `${month.year + 1}-01-01`
        : `${monthKey(month.year, month.month + 1)}-01`;
    return { from, to: addDays(next, -1) };
  }

  const sorted = keys.slice().sort();
  let from = todayKey;
  if (showPast && sorted.length > 0 && sorted[0] < todayKey) from = sorted[0];

  let to = addDays(todayKey, STRIP_MIN_DAYS - 1);
  if (sorted.length > 0 && sorted[sorted.length - 1] > to) {
    to = sorted[sorted.length - 1];
  }
  return { from, to };
};

export const buildStripDays = (
  range: { from: string; to: string },
  counts: Record<string, number>,
  todayKey: string
): StripDay[] => {
  const days: StripDay[] = [];
  const total = Math.min(diffDays(range.to, range.from), STRIP_MAX_DAYS - 1);
  for (let i = 0; i <= total; i += 1) {
    const key = addDays(range.from, i);
    const day = Number(key.slice(8, 10));
    const weekday = weekdayOf(key);
    const isFirst = day === 1;
    days.push({
      key,
      day,
      label: isFirst ? `${Number(key.slice(5, 7))}월` : DOW[weekday],
      weekday,
      count: counts[key] || 0,
      isToday: key === todayKey,
      isPast: key < todayKey,
      isFirst,
    });
  }
  return days;
};

export const stripDayLabel = (day: StripDay): string => {
  const month = Number(day.key.slice(5, 7));
  const base = `${month}월 ${day.day}일 ${DOW[day.weekday]}요일, 행사 ${
    day.count
  }건`;
  return day.isToday ? `${base}, 오늘` : base;
};

export const monthTotals = (
  responses: EventResponse[] | undefined
): Record<string, number> => {
  const totals: Record<string, number> = {};
  (responses || []).filter(Boolean).forEach((response) => {
    const meta = response.metadata;
    if (!meta) return;
    if (!Number.isFinite(meta.year) || !Number.isFinite(meta.month)) return;
    totals[monthKey(meta.year, meta.month)] = meta.total;
  });
  return totals;
};

const toInt = (value: string | string[] | undefined): number | null => {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  return Number(value);
};

export const readMonthParam = (query: {
  year?: string | string[];
  month?: string | string[];
}): MonthParam | null => {
  const year = toInt(query.year);
  const month = toInt(query.month);
  if (year === null || month === null) return null;
  if (year < 2000 || year > 2100 || month < 1 || month > 12) return null;
  return { year, month };
};
