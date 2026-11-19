import { Event } from 'model/event';
import { applyFilters, TimelineFilters } from 'lib/utils/timeline/filters';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import {
  countByDay,
  countNew,
  countPast,
  DayGroup,
  groupByDay,
  toTimeline,
} from 'lib/utils/timeline/groupByDay';
import {
  buildStripDays,
  monthKey,
  MonthParam,
  stripRange,
  StripDay,
} from 'lib/utils/timeline/dateStrip';
import { dayKey, parseNaive } from 'lib/utils/timeline/kst';

export interface TimelineView {
  todayKey: string;
  groups: DayGroup[]; // 필터·새 행사만·월을 적용한 전체 묶음 (지난 날 포함)
  visible: DayGroup[]; // 화면에 그릴 묶음
  days: StripDay[]; // 날짜 띠의 칸
  pastCount: number; // "지난 행사 N건 보기"의 N
  newCount: number; // "새로 올라온 행사 N"의 N
  visibleCount: number; // visible에 든 행사 수
}

export const buildTimelineView = (input: {
  events: Event[];
  current: Event[];
  filters: TimelineFilters;
  newOnly: boolean;
  showPast: boolean;
  month: MonthParam | null;
  now: string;
}): TimelineView => {
  const { events, current, filters, newOnly, showPast, month, now } = input;
  const todayKey = dayKey(parseNaive(now));
  const prefix = month ? monthKey(month.year, month.month) : null;
  const inMonth = (dateKey: string) =>
    prefix === null || dateKey.slice(0, 7) === prefix;

  // 띠의 범위: 거르기 전 행사의 날짜 키 (달을 볼 때는 그 달 안의 것만)
  const allKeys = events
    .map((event) => describeEvent(event, now).dateKey)
    .filter(inMonth);

  let items = toTimeline(applyFilters(events, filters), now).filter((item) =>
    inMonth(item.dateKey)
  );
  if (newOnly) items = items.filter((item) => item.isNew);

  const groups = groupByDay(items);
  const visible =
    showPast || month
      ? groups
      : groups.filter((group) => group.key >= todayKey);

  const range = stripRange({ keys: allKeys, todayKey, showPast, month });
  const days = buildStripDays(range, countByDay(items), todayKey);

  return {
    todayKey,
    groups,
    visible,
    days,
    pastCount: month ? 0 : countPast(items, todayKey),
    newCount: countNew(toTimeline(current, now)),
    visibleCount: visible.reduce((sum, group) => sum + group.items.length, 0),
  };
};
