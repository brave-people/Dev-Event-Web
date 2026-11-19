import { buildCalendarMatrix } from 'components/events/calendar/utils/buildCalendarMatrix';
import { DOW } from 'lib/utils/timeline/kst';

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

// 색 단계의 기준은 이 한 곳에서만 바꾼다
export const HEAT_STEPS: readonly number[] = [2, 4, 7];

export const heatLevel = (
  count: number,
  steps: readonly number[] = HEAT_STEPS
): HeatLevel => {
  if (typeof count !== 'number' || !(count > 0)) return 0;
  if (count <= steps[0]) return 1;
  if (count <= steps[1]) return 2;
  if (count <= steps[2]) return 3;
  return 4;
};

const range = (from: number, to: number): string =>
  from === to ? `${from}건` : `${from}~${to}건`;

export const heatLegend = (steps: readonly number[] = HEAT_STEPS): string[] => [
  range(1, steps[0]),
  range(steps[0] + 1, steps[1]),
  range(steps[1] + 1, steps[2]),
  `${steps[2] + 1}건 이상`,
];

export interface MonthCell {
  key: string;
  day: number;
  weekday: number;
  inMonth: boolean;
  count: number;
  level: HeatLevel;
  isToday: boolean;
  isPast: boolean;
  label: string;
  tip: string;
}

export const formatKoDay = (key: string): string =>
  `${Number(key.slice(5, 7))}월 ${Number(key.slice(8, 10))}일`;

export const buildMonthCells = (
  year: number,
  month: number,
  counts: Record<string, number>,
  todayKey: string
): MonthCell[][] =>
  buildCalendarMatrix(year, month)
    .filter((week) => week.some((c) => !c.isOutside))
    .map((week) =>
      week.map((c): MonthCell => {
        if (c.isOutside) {
          return {
            key: c.date,
            day: c.day,
            weekday: c.dow,
            inMonth: false,
            count: 0,
            level: 0,
            isToday: false,
            isPast: false,
            label: '',
            tip: '',
          };
        }
        const count = counts[c.date] || 0;
        const isToday = c.date === todayKey;
        const base = `${formatKoDay(c.date)} ${DOW[c.dow]}요일`;
        return {
          key: c.date,
          day: c.day,
          weekday: c.dow,
          inMonth: true,
          count,
          level: heatLevel(count),
          isToday,
          isPast: c.date < todayKey,
          label: `${base}, 행사 ${count}건${isToday ? ', 오늘' : ''}`,
          tip: count > 0 ? `${base} · 행사 ${count}건` : '',
        };
      })
    );
