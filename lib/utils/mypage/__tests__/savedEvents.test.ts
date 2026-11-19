import { Event, MyEvent } from 'model/event';
import {
  describeSaved,
  isSavedDone,
  savedEndDate,
  savedTabOf,
  splitSaved,
} from 'lib/utils/mypage/savedEvents';

const NOW = '2026-11-18T15:00';

const ev = (over: Partial<Event> = {}): Event =>
  ({
    event_time_type: 'DATE',
    use_start_date_time_yn: 'Y',
    use_end_date_time_yn: 'Y',
    start_date_time: '2026-11-10T10:00:00',
    end_date_time: '2026-11-25T18:00:00',
    tags: [],
    ...over,
  } as unknown as Event);

const my = (id: number, over: Partial<Event> = {}): MyEvent =>
  ({ favorite_id: id, dev_event: ev(over) } as unknown as MyEvent);

describe('savedEndDate', () => {
  const START = '2026-11-10T10:00:00';
  const END = '2026-11-25T18:00:00';
  const cases: [
    Event['use_start_date_time_yn'],
    Event['use_end_date_time_yn'],
    string
  ][] = [
    ['Y', 'Y', END],
    ['Y', 'N', END],
    ['Y', null, START],
    ['N', null, START],
    [null, 'Y', END],
    [null, null, END],
  ];
  cases.forEach(([s, e, expected]) => {
    it(`start_yn=${s} end_yn=${e}`, () => {
      expect(
        savedEndDate(
          ev({
            use_start_date_time_yn: s,
            use_end_date_time_yn: e,
            start_date_time: START,
            end_date_time: END,
          })
        )
      ).toBe(expected);
    });
  });
});

describe('isSavedDone', () => {
  const endAt = (d: string) => ev({ end_date_time: d });
  it('어제는 종료', () => {
    expect(isSavedDone(endAt('2026-11-17T23:59:00'), NOW)).toBe(true);
  });
  it('오늘은 시각이 지나도 진행중', () => {
    expect(isSavedDone(endAt('2026-11-18T09:00:00'), NOW)).toBe(false);
    expect(isSavedDone(endAt('2026-11-18T23:00:00'), NOW)).toBe(false);
    expect(isSavedDone(endAt('2026-11-19T00:00:00'), NOW)).toBe(false);
  });
  it('해가 다르면 종료', () => {
    expect(isSavedDone(endAt('2025-12-31T10:00:00'), NOW)).toBe(true);
  });
  it('날이 바뀌면 종료', () => {
    expect(isSavedDone(endAt('2026-11-18T23:00:00'), '2026-11-19T00:00')).toBe(
      true
    );
  });
  it('끝 사용 여부가 비면 시작일로 판정', () => {
    ['Y', 'N'].forEach((s) => {
      expect(
        isSavedDone(
          ev({
            use_start_date_time_yn: s as 'Y' | 'N',
            use_end_date_time_yn: null,
            start_date_time: '2026-11-10T10:00:00',
            end_date_time: '2026-11-25T18:00:00',
          }),
          NOW
        )
      ).toBe(true);
    });
  });
  it('둘 다 비면 끝으로 판정', () => {
    expect(
      isSavedDone(
        ev({
          use_start_date_time_yn: null,
          use_end_date_time_yn: null,
          start_date_time: '2026-11-10T10:00:00',
          end_date_time: '2026-11-25T18:00:00',
        }),
        NOW
      )
    ).toBe(false);
  });
  it('읽을 수 없는 날짜는 종료', () => {
    expect(isSavedDone(endAt(''), NOW)).toBe(true);
    expect(isSavedDone(endAt('abc'), NOW)).toBe(true);
    expect(isSavedDone(endAt(null as unknown as string), NOW)).toBe(true);
  });
});

describe('describeSaved', () => {
  const rows: [string, Partial<Event>, boolean, string, string, string][] = [
    [
      '접수형 D-6',
      { event_time_type: 'RECRUIT', end_date_time: '2026-11-24T18:00:00' },
      false,
      'dead',
      '마감 D-6',
      '11.24(화) 18:00 접수 마감',
    ],
    [
      '접수형 오늘 마감',
      { event_time_type: 'RECRUIT', end_date_time: '2026-11-18T23:59:00' },
      false,
      'dead',
      '오늘 마감',
      '11.18(수) 23:59 접수 마감',
    ],
    [
      '접수형 오늘 시각 지남',
      { event_time_type: 'RECRUIT', end_date_time: '2026-11-18T09:00:00' },
      false,
      'dead',
      '오늘 마감',
      '11.18(수) 09:00 접수 마감',
    ],
    [
      '접수형 종료',
      { event_time_type: 'RECRUIT', end_date_time: '2026-11-10T18:00:00' },
      true,
      'done',
      '종료',
      '11.10(화) 접수 마감',
    ],
    [
      '일시형 D-3',
      {
        start_date_time: '2026-11-21T10:00:00',
        end_date_time: '2026-11-21T18:00:00',
      },
      false,
      'open',
      'D-3',
      '11.21(토) 10:00 ~ 18:00',
    ],
    [
      '일시형 오늘',
      {
        start_date_time: '2026-11-18T19:00:00',
        end_date_time: '2026-11-18T21:00:00',
      },
      false,
      'open',
      '오늘',
      '11.18(수) 19:00 ~ 21:00',
    ],
    [
      '일시형 진행 중',
      {
        start_date_time: '2026-11-16T09:00:00',
        end_date_time: '2026-11-20T18:00:00',
      },
      false,
      'open',
      '진행 중',
      '11.16(월) 09:00 ~ 11.20(금) 18:00',
    ],
    [
      '일시형 오늘 시각 지남',
      {
        start_date_time: '2026-11-18T10:00:00',
        end_date_time: '2026-11-18T12:00:00',
      },
      false,
      'open',
      '오늘',
      '11.18(수) 10:00 ~ 12:00',
    ],
    [
      '일시형 시각 없음',
      {
        start_date_time: '2026-11-21',
        end_date_time: '2026-11-22',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      },
      false,
      'open',
      'D-3',
      '11.21(토) ~ 11.22(일)',
    ],
    [
      '일시형 종료',
      {
        start_date_time: '2026-11-10T10:00:00',
        end_date_time: '2026-11-10T18:00:00',
      },
      true,
      'done',
      '종료',
      '11.10(화) 10:00 ~ 18:00',
    ],
    [
      '날짜 없음',
      { start_date_time: '', end_date_time: '' },
      true,
      'done',
      '종료',
      '',
    ],
  ];
  rows.forEach(([name, over, done, tone, label, when]) => {
    it(name, () => {
      const item = my(7, over);
      const r = describeSaved(item, NOW);
      expect(r.done).toBe(done);
      expect(r.tone).toBe(tone);
      expect(r.label).toBe(label);
      expect(r.when).toBe(when);
      expect(r.favoriteId).toBe(7);
      expect(r.event).toBe(item.dev_event);
    });
  });
});

describe('splitSaved', () => {
  it('비어 있으면 빈 둘', () => {
    [undefined, null, []].forEach((v) => {
      expect(splitSaved(v, NOW)).toEqual({ ongoing: [], done: [] });
    });
  });
  it('받은 순서를 지키고 하나도 빠지지 않는다', () => {
    const past = { end_date_time: '2026-11-01T10:00:00' };
    const list = [
      my(1, past),
      my(2),
      my(3, past),
      my(4),
      my(5, { end_date_time: '2026-12-01T10:00:00' }),
    ];
    const first = list[0];
    const r = splitSaved(list, NOW);
    expect(r.ongoing.map((i) => i.favoriteId)).toEqual([2, 4, 5]);
    expect(r.done.map((i) => i.favoriteId)).toEqual([1, 3]);
    expect(r.ongoing.length + r.done.length).toBe(5);
    expect(list.length).toBe(5);
    expect(list[0]).toBe(first);
  });
});

describe('savedTabOf', () => {
  it('done만 done', () => {
    expect(savedTabOf('done')).toBe('done');
  });
  it('그 밖에는 ongoing', () => {
    [undefined, 'ongoing', 'foo', '', ['done'], ['done', 'x']].forEach((v) => {
      expect(savedTabOf(v)).toBe('ongoing');
    });
  });
});
