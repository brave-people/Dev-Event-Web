import { Event } from 'model/event';
import { costOf, ddayLabel } from 'lib/utils/detail/applyCard';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import { readEventPeriod } from 'lib/utils/timeline/period';

export const RELATED_MAX = 4;
export const TOPIC_TAGS: readonly string[] = [
  'AI',
  '클라우드',
  '블록체인',
  '보안',
  '기술일반',
];

export interface RelatedPick {
  title: string; // '같은 날 다른 행사' | '비슷한 행사'
  events: Event[]; // 본문을 비운 것. 네 건까지
}

// description만 ''로 바꾼 사본
export const slimEvent = (event: Event): Event => ({
  ...event,
  description: '',
});

export const pickRelated = (
  current: Event,
  candidates: Event[],
  now: string
): RelatedPick | null => {
  const currentId = String(current.id);
  const alive = candidates.filter(
    (c) =>
      String(c.id) !== currentId && describeEvent(c, now).status !== 'ended'
  );

  if (readEventPeriod(current)) {
    const dateKey = describeEvent(current, now).dateKey;
    const sameDay = alive
      .filter((c) => describeEvent(c, now).dateKey === dateKey)
      .slice(0, RELATED_MAX);
    if (sameDay.length > 0) {
      return { title: '같은 날 다른 행사', events: sameDay.map(slimEvent) };
    }
  }

  const topics = (current.tags || [])
    .map((t) => t.tag_name)
    .filter((name) => TOPIC_TAGS.includes(name));
  const similar = alive
    .filter((c) => (c.tags || []).some((t) => topics.includes(t.tag_name)))
    .slice(0, RELATED_MAX);
  if (similar.length > 0) {
    return { title: '비슷한 행사', events: similar.map(slimEvent) };
  }
  return null;
};

// 그 사이 끝난 행사를 뺀다
export const aliveRelated = (events: Event[], now: string): Event[] =>
  events.filter((e) => describeEvent(e, now).status !== 'ended');

// '주최 · 마감 D-6 · 무료'
export const relatedMeta = (event: Event, now: string): string =>
  [event.organizer, ddayLabel(event, now), costOf(event.tags)]
    .filter(Boolean)
    .join(' · ');
