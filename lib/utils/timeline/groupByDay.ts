import { Event, EventResponse } from 'model/event';
import { describeEvent, TimelineEvent } from 'lib/utils/timeline/describeEvent';

export interface DayGroup {
  key: string;
  items: TimelineEvent[];
}

// 월 묶음을 풀어 한 줄로 만든다. 같은 id는 처음 것만 남긴다.
export const flattenEvents = (
  responses: EventResponse[] | undefined
): Event[] => {
  const seen: Record<string, boolean> = {};
  const result: Event[] = [];
  (responses || []).filter(Boolean).forEach((response) => {
    (response.dev_event || []).forEach((event) => {
      if (!event || seen[event.id]) return;
      seen[event.id] = true;
      result.push(event);
    });
  });
  return result;
};

export const toTimeline = (events: Event[], now: string): TimelineEvent[] =>
  events.map((event) => describeEvent(event, now));

export const groupByDay = (items: TimelineEvent[]): DayGroup[] => {
  const sorted = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      if (a.item.dateKey !== b.item.dateKey) {
        return a.item.dateKey < b.item.dateKey ? -1 : 1;
      }
      return (
        a.item.sortAt - b.item.sortAt ||
        a.item.endAt - b.item.endAt ||
        a.index - b.index
      );
    });

  const groups: DayGroup[] = [];
  sorted.forEach(({ item }) => {
    const last = groups[groups.length - 1];
    if (last && last.key === item.dateKey) last.items.push(item);
    else groups.push({ key: item.dateKey, items: [item] });
  });
  return groups;
};

export const countByDay = (items: TimelineEvent[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    counts[item.dateKey] = (counts[item.dateKey] || 0) + 1;
  });
  return counts;
};

export const countPast = (items: TimelineEvent[], todayKey: string): number =>
  items.filter((item) => item.dateKey < todayKey).length;

export const countNew = (items: TimelineEvent[]): number =>
  items.filter((item) => item.isNew).length;

export const findTargetKey = (
  groups: DayGroup[],
  key: string
): string | null => {
  if (groups.length === 0) return null;
  const found = groups.find((group) => group.key >= key);
  return found ? found.key : groups[groups.length - 1].key;
};
