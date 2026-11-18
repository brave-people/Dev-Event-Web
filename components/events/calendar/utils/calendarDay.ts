import { formatKoDay } from 'components/events/calendar/utils/calendarMonth';
import { TimelineEvent } from 'lib/utils/timeline/describeEvent';
import { addDays } from 'lib/utils/timeline/kst';

// keys: 이 달에서 (필터를 건 뒤) 행사가 있는 날, 오름차순

export const pickDefaultDay = (
  keys: string[],
  monthKey: string,
  todayKey: string
): string | null => {
  if (keys.length === 0) return null;
  if (todayKey.slice(0, 7) !== monthKey) return keys[0];
  if (keys.indexOf(todayKey) >= 0) return todayKey;
  const after = keys.filter((k) => k > todayKey)[0];
  return after || keys[0];
};

export const resolveDay = (opts: {
  wanted: string | null;
  keys: string[];
  monthKey: string;
  todayKey: string;
}): string | null => {
  const { wanted, keys, monthKey, todayKey } = opts;
  if (keys.length === 0) return null;
  if (wanted && wanted.slice(0, 7) === monthKey) return wanted;
  return pickDefaultDay(keys, monthKey, todayKey);
};

const ARROW_STEP: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

export const moveByArrow = (
  keys: string[],
  from: string,
  arrow: string
): string | null => {
  const step = ARROW_STEP[arrow];
  if (!step) return null;
  const target = addDays(from, step);
  if (step > 0) {
    return keys.filter((k) => k >= target)[0] || null;
  }
  const before = keys.filter((k) => k <= target);
  return before.length > 0 ? before[before.length - 1] : null;
};

export const neighborDays = (
  keys: string[],
  key: string
): { prev: string | null; next: string | null } => {
  const before = keys.filter((k) => k < key);
  const after = keys.filter((k) => k > key);
  return {
    prev: before.length > 0 ? before[before.length - 1] : null,
    next: after.length > 0 ? after[0] : null,
  };
};

export type DaySectionId = 'deadline' | 'open';

export interface DaySection {
  id: DaySectionId;
  title: string;
  items: TimelineEvent[];
}

export const splitDay = (
  items: TimelineEvent[],
  key: string,
  todayKey: string
): DaySection[] => {
  const isPast = key < todayKey;
  const isToday = key === todayKey;
  const deadline = items.filter((i) => i.event.event_time_type === 'RECRUIT');
  const open = items.filter((i) => i.event.event_time_type !== 'RECRUIT');
  const sections: DaySection[] = [];
  if (deadline.length > 0) {
    sections.push({
      id: 'deadline',
      title: isPast ? '이날 접수를 마감했어요' : '이날 접수를 마감해요',
      items: deadline,
    });
  }
  if (open.length > 0) {
    sections.push({
      id: 'open',
      title: isPast
        ? '이날 열렸어요'
        : isToday
        ? '오늘 열리거나 진행 중이에요'
        : '이날 열려요',
      items: open,
    });
  }
  return sections;
};

export const daySummary = (sections: DaySection[], isPast: boolean): string => {
  if (sections.length === 0) return '등록된 행사가 없어요';
  return sections
    .map((s) =>
      s.id === 'deadline'
        ? `접수 마감 ${s.items.length}건`
        : `${isPast ? '열린' : '열리는'} 행사 ${s.items.length}건`
    )
    .join(' · ');
};

export const emptyDayAction = (
  prev: string | null,
  next: string | null
): { key: string; label: string } | null => {
  if (next) {
    return { key: next, label: `다음 행사가 있는 ${formatKoDay(next)} 보기` };
  }
  if (prev) {
    return { key: prev, label: `이전 행사가 있는 ${formatKoDay(prev)} 보기` };
  }
  return null;
};
