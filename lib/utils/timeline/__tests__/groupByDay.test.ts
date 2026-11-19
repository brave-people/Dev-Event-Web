import {
  countByDay,
  countNew,
  countPast,
  findTargetKey,
  flattenEvents,
  groupByDay,
  toTimeline,
} from 'lib/utils/timeline/groupByDay';
import { Event, EventResponse } from 'model/event';

const NOW = '2026-11-13T10:00';

const ev = (over: Partial<Event> = {}): Event => ({
  id: '1',
  title: '행사',
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '수',
  start_date_time: '2026-11-07T00:00',
  end_day_week: '수',
  end_date_time: '2026-11-13T17:00',
  tags: [],
  create_date_time: '2026-11-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const EVENTS: Event[] = [
  ev({ id: 'a', end_date_time: '2026-11-13T17:00' }),
  ev({
    id: 'b',
    event_time_type: 'DATE',
    start_date_time: '2026-11-12T09:00',
    end_date_time: '2026-11-14T18:00',
  }),
  ev({ id: 'c', end_date_time: '2026-11-13T12:00' }),
  ev({
    id: 'd',
    event_time_type: 'DATE',
    start_date_time: '2026-11-13T19:00',
    end_date_time: '2026-11-13T21:00',
  }),
  ev({ id: 'e', end_date_time: '2026-11-13T09:00' }),
  ev({
    id: 'f',
    end_date_time: '2026-11-20T18:00',
    create_date_time: '2026-11-12T09:00',
  }),
  ev({ id: 'g', end_date_time: '2026-11-11T18:00' }),
  ev({ id: 'h', end_date_time: '2026-11-13T12:00' }),
];

const ids = (items: { event: Event }[]) =>
  items.map((i) => i.event.id).join('');

describe('flattenEvents', () => {
  const res = (month: number, events: Event[]): EventResponse => ({
    metadata: { total: events.length, year: 2026, month },
    dev_event: events,
  });

  it('월 묶음을 풀고, 두 달에 걸쳐 들어 있는 행사는 한 번만 남긴다', () => {
    const flat = flattenEvents([
      res(11, [ev({ id: '1' }), ev({ id: '2' })]),
      res(12, [ev({ id: '2' }), ev({ id: '3' })]),
    ]);
    expect(flat.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('응답이 없거나 빈 칸이 섞여 있어도 빈 배열부터 시작한다', () => {
    expect(flattenEvents(undefined)).toEqual([]);
    expect(
      flattenEvents([
        null as unknown as EventResponse,
        res(11, [ev({ id: '1' })]),
      ])
    ).toHaveLength(1);
  });
});

describe('groupByDay', () => {
  const groups = groupByDay(toTimeline(EVENTS, NOW));

  it('날짜순으로 묶는다', () => {
    expect(groups.map((g) => g.key)).toEqual([
      '2026-11-11',
      '2026-11-13',
      '2026-11-20',
    ]);
  });

  it('한 날 안에서는 시각순: 오늘 끝난 것, 진행 중(지금), 12시 마감 둘(들어온 순서), 17시 마감, 19시 시작', () => {
    expect(ids(groups[1].items)).toBe('ebchad');
  });
});

describe('건수', () => {
  const items = toTimeline(EVENTS, NOW);

  it('날짜별 건수', () => {
    expect(countByDay(items)).toEqual({
      '2026-11-11': 1,
      '2026-11-13': 6,
      '2026-11-20': 1,
    });
  });

  it('오늘보다 앞 날짜에 놓인 것만 지난 행사로 센다 (오늘 끝난 것은 세지 않는다)', () => {
    expect(countPast(items, '2026-11-13')).toBe(1);
  });

  it('새로 올라온 행사 수', () => {
    expect(countNew(items)).toBe(1);
  });
});

describe('findTargetKey', () => {
  const groups = groupByDay(toTimeline(EVENTS, NOW));

  it('그날에 행사가 있으면 그날', () => {
    expect(findTargetKey(groups, '2026-11-13')).toBe('2026-11-13');
  });
  it('없으면 그 뒤의 첫 날', () => {
    expect(findTargetKey(groups, '2026-11-14')).toBe('2026-11-20');
  });
  it('뒤에도 없으면 마지막 날', () => {
    expect(findTargetKey(groups, '2026-12-01')).toBe('2026-11-20');
  });
  it('묶음이 없으면 null', () => {
    expect(findTargetKey([], '2026-11-13')).toBeNull();
  });
});
