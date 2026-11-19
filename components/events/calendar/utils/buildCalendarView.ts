import {
  daySummary,
  DaySection,
  neighborDays,
  resolveDay,
  splitDay,
} from 'components/events/calendar/utils/calendarDay';
import {
  buildMonthCells,
  MonthCell,
} from 'components/events/calendar/utils/calendarMonth';
import { monthKey as toMonthKey } from 'lib/utils/timeline/dateStrip';
import { applyFilters, TimelineFilters } from 'lib/utils/timeline/filters';
import {
  countByDay,
  countNew,
  groupByDay,
  toTimeline,
} from 'lib/utils/timeline/groupByDay';
import { dayKey, parseNaive } from 'lib/utils/timeline/kst';
import { Event } from 'model/event';

export interface CalendarViewModel {
  todayKey: string;
  monthKey: string; // 'YYYY-MM'
  weeks: MonthCell[][]; // 달력 칸 (필터·새 행사만을 건 뒤의 건수)
  keys: string[]; // 이 달에서 행사가 있는 날 (오름차순)
  selectedKey: string | null; // 고른 날. 이 달에 맞는 행사가 없으면 null
  isPastDay: boolean; // 고른 날이 오늘보다 앞인지
  prevKey: string | null; // 앞의 행사 있는 날 (이 달 안에서)
  nextKey: string | null;
  sections: DaySection[]; // 고른 날의 묶음. 그날 행사가 없으면 []
  summary: string; // 날짜 제목 아래 한 줄
  newCount: number; // "새로 올라온 행사 N"의 N
}

export const buildCalendarView = (input: {
  events: Event[];
  filters: TimelineFilters;
  newOnly: boolean;
  year: number;
  month: number;
  wanted: string | null;
  now: string;
}): CalendarViewModel => {
  const { events, filters, newOnly, year, month, wanted, now } = input;
  const todayKey = dayKey(parseNaive(now));
  const monthKey = toMonthKey(year, month);
  const inMonth = (item: { dateKey: string }) =>
    item.dateKey.slice(0, 7) === monthKey;

  const monthItems = toTimeline(events, now).filter(inMonth);
  const newCount = countNew(monthItems);

  const filtered = toTimeline(applyFilters(events, filters), now).filter(
    inMonth
  );
  const shown = newOnly ? filtered.filter((item) => item.isNew) : filtered;

  const groups = groupByDay(shown);
  const keys = groups.map((group) => group.key);
  const weeks = buildMonthCells(year, month, countByDay(shown), todayKey);

  const selectedKey = resolveDay({ wanted, keys, monthKey, todayKey });
  const isPastDay = selectedKey !== null && selectedKey < todayKey;
  const group = groups.filter((g) => g.key === selectedKey)[0];
  const sections =
    selectedKey && group ? splitDay(group.items, selectedKey, todayKey) : [];
  const { prev, next } = selectedKey
    ? neighborDays(keys, selectedKey)
    : { prev: null, next: null };

  return {
    todayKey,
    monthKey,
    weeks,
    keys,
    selectedKey,
    isPastDay,
    prevKey: prev,
    nextKey: next,
    sections,
    summary: daySummary(sections, isPastDay),
    newCount,
  };
};
