import { Event, EventDate, MyEvent } from 'model/event';
import { ddayLabel } from 'lib/utils/detail/applyCard';
import { describeWhen } from 'lib/utils/detail/summary';
import {
  dayKey,
  formatHm,
  formatMdw,
  parseNaive,
} from 'lib/utils/timeline/kst';
import { readEventPeriod } from 'lib/utils/timeline/period';

export type SavedTab = 'ongoing' | 'done';
export type SavedTone = 'done' | 'dead' | 'open';

export interface SavedItem {
  favoriteId: number;
  event: Event; // 받은 객체 그대로
  done: boolean; // 탭을 가르는 값. 줄을 흐리게 하는 것도 이 값이다
  tone: SavedTone; // 배지의 색
  label: string; // 배지의 글자
  when: string; // 기간 글자. 읽을 수 없으면 ''
}

export interface SavedView {
  ongoing: SavedItem[];
  done: SavedItem[];
}

// 시작 사용 여부에 값이 있고 끝 사용 여부가 비어 있으면 시작일, 그 밖에는 끝일.
// 'Y'인지 견주지 않고 값이 있는지만 본다(지금 코드의 규칙).
export const savedEndDate = (event: EventDate): string =>
  event.use_start_date_time_yn && !event.use_end_date_time_yn
    ? event.start_date_time
    : event.end_date_time;

// 날짜만 견준다. 읽을 수 없으면 종료.
export const isSavedDone = (event: EventDate, now: string): boolean => {
  const end = parseNaive(savedEndDate(event));
  if (Number.isNaN(end)) return true;
  return dayKey(end) < dayKey(parseNaive(now));
};

export const describeSaved = (item: MyEvent, now: string): SavedItem => {
  const event = item.dev_event;
  const done = isSavedDone(event, now);
  const recruit = event.event_time_type === 'RECRUIT';

  let label = '종료';
  if (!done) {
    const dday = ddayLabel(event, now);
    label =
      dday === '' || dday === '종료' ? (recruit ? '오늘 마감' : '오늘') : dday;
  }
  const tone: SavedTone = done ? 'done' : recruit ? 'dead' : 'open';

  let when = '';
  const period = readEventPeriod(event);
  if (period) {
    if (recruit) {
      const time =
        period.endHasTime && !done ? ` ${formatHm(period.endAt)}` : '';
      when = `${formatMdw(period.endDay)}${time} 접수 마감`;
    } else {
      when = describeWhen(event, now)?.range ?? '';
    }
  }

  return { favoriteId: item.favorite_id, event, done, tone, label, when };
};

export const splitSaved = (
  list: MyEvent[] | null | undefined,
  now: string
): SavedView => {
  const view: SavedView = { ongoing: [], done: [] };
  (list || []).forEach((item) => {
    const described = describeSaved(item, now);
    (described.done ? view.done : view.ongoing).push(described);
  });
  return view;
};

export const savedTabOf = (query: string | string[] | undefined): SavedTab =>
  query === 'done' ? 'done' : 'ongoing';
