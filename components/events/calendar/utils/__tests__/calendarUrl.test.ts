import {
  calendarHref,
  listPathOf,
  readDayParam,
  shiftMonth,
  toCalendarHref,
  toTimelineHref,
} from 'components/events/calendar/utils/calendarUrl';
import { readFilters } from 'lib/utils/timeline/filters';
import { initUrl, parseUrl } from 'lib/utils/UrlUtil';

const enc = encodeURIComponent;
const TODAY = '2026-11-13';
const CAL = { view: 'calendar', year: '2026', month: '11' };

describe('listPathOf — 주소의 필터를 목록 화면 주소로', () => {
  it('필터가 없으면 /events (보기·연·월·날짜는 필터가 아니다)', () => {
    expect(listPathOf({})).toBe('/events');
    expect(listPathOf({ ...CAL, day: '2026-11-20' })).toBe('/events');
  });

  it('필터를 정해진 순서(tag, type, location, coast, kwd)로 적는다', () => {
    expect(
      listPathOf({
        ...CAL,
        kwd: '카카오 테크',
        coast: '무료',
        location: '온라인',
        type: '대회',
        tag: ['AI', '클라우드'],
      })
    ).toBe(
      `/search?tag=AI&tag=${enc('클라우드')}&type=${enc('대회')}` +
        `&location=${enc('온라인')}&coast=${enc('무료')}&kwd=${enc(
          '카카오 테크'
        )}`
    );
  });

  it('태그가 하나면 문자열로 온다. 빈 값은 뺀다', () => {
    expect(listPathOf({ tag: 'AI' })).toBe('/search?tag=AI');
    expect(listPathOf({ tag: '', kwd: '' })).toBe('/events');
  });

  it('만든 주소를 readFilters가 그대로 읽는다', () => {
    const path = listPathOf({
      ...CAL,
      tag: ['AI', '대회/공모전'],
      coast: '무료',
      kwd: 'C++ & Rust 50%',
    });
    expect(readFilters(path)).toEqual({
      tags: ['AI', '대회/공모전'],
      coast: '무료',
      kwd: 'C++ & Rust 50%',
    });
  });

  it('필터 줄이 쓰는 parseUrl·initUrl에 넣으면 지금과 같은 주소가 나온다', () => {
    expect(parseUrl(listPathOf(CAL), 'tag', 'AI', [])).toBe('/search?tag=AI');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: 'AI' }), 'tag', '클라우드', ['AI'])
    ).toBe('/search?tag=AI&tag=클라우드');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: ['AI', '클라우드'] }), 'tag', 'AI', [
        'AI',
        '클라우드',
      ])
    ).toBe('/search?tag=클라우드');
    expect(
      initUrl(
        listPathOf({ ...CAL, tag: 'AI' }),
        'tag',
        ['AI'],
        undefined,
        undefined,
        undefined
      )
    ).toBe('/events');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: 'AI' }), 'kwd', '카카오 테크', ['AI'])
    ).toBe(`/search?tag=AI&kwd=${enc('카카오 테크')}`);
  });
});

describe('readDayParam — 주소의 고른 날', () => {
  it('보고 있는 달의 날짜만 받는다', () => {
    expect(readDayParam({ day: '2026-11-20' }, 2026, 11)).toBe('2026-11-20');
    expect(readDayParam({ day: '2026-12-02' }, 2026, 11)).toBeNull();
  });

  it('없는 날짜나 형식이 다른 값은 버린다', () => {
    expect(readDayParam({ day: '2026-11-31' }, 2026, 11)).toBeNull();
    expect(readDayParam({ day: '2026-11-1' }, 2026, 11)).toBeNull();
    expect(
      readDayParam({ day: ['2026-11-20', '2026-11-21'] }, 2026, 11)
    ).toBeNull();
    expect(readDayParam({}, 2026, 11)).toBeNull();
  });
});

describe('calendarHref — 캘린더 보기의 주소', () => {
  it('연·월만', () => {
    expect(calendarHref({ year: 2026, month: 11 }, '/events')).toBe(
      '/events?view=calendar&year=2026&month=11'
    );
  });

  it('고른 날이 있으면 day를 붙인다', () => {
    expect(
      calendarHref({ year: 2026, month: 11, day: '2026-11-20' }, '/events')
    ).toBe('/events?view=calendar&year=2026&month=11&day=2026-11-20');
  });

  it('목록 화면 주소의 필터를 뒤에 그대로 붙인다', () => {
    expect(
      calendarHref(
        { year: 2026, month: 11, day: '2026-11-20' },
        '/search?tag=AI&kwd=x'
      )
    ).toBe(
      '/events?view=calendar&year=2026&month=11&day=2026-11-20&tag=AI&kwd=x'
    );
    expect(
      calendarHref({ year: 2026, month: 12, day: null }, '/search?tag=클라우드')
    ).toBe('/events?view=calendar&year=2026&month=12&tag=클라우드');
  });
});

describe('shiftMonth', () => {
  it('해를 넘어간다', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2026, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});

describe('toCalendarHref — 타임라인에서 캘린더로', () => {
  it('보던 날짜가 있는 달을 열고 그날을 고른다', () => {
    expect(
      toCalendarHref({ query: {}, dayKey: '2026-11-20', todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=11&day=2026-11-20');
    expect(
      toCalendarHref({ query: {}, dayKey: '2026-12-02', todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=12&day=2026-12-02');
  });

  it('검색 화면의 필터가 따라간다', () => {
    expect(
      toCalendarHref({
        query: { tag: 'AI', kwd: '카카오 테크' },
        dayKey: '2026-11-20',
        todayKey: TODAY,
      })
    ).toBe(
      `/events?view=calendar&year=2026&month=11&day=2026-11-20&tag=AI&kwd=${enc(
        '카카오 테크'
      )}`
    );
  });

  it('보던 날짜를 모르면 주소의 연·월, 그것도 없으면 이번 달', () => {
    expect(
      toCalendarHref({ query: { year: '2026', month: '10' }, todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=10');
    expect(toCalendarHref({ query: {}, todayKey: TODAY })).toBe(
      '/events?view=calendar&year=2026&month=11'
    );
  });
});

describe('toTimelineHref — 캘린더에서 타임라인으로', () => {
  it('이번 달과 그 뒤의 달은 /events', () => {
    expect(
      toTimelineHref({ query: { ...CAL, day: '2026-11-20' }, todayKey: TODAY })
    ).toBe('/events');
    expect(
      toTimelineHref({ query: { ...CAL, month: '12' }, todayKey: TODAY })
    ).toBe('/events');
  });

  it('지난 달은 그 달의 타임라인', () => {
    expect(
      toTimelineHref({ query: { ...CAL, month: '10' }, todayKey: TODAY })
    ).toBe('/events?year=2026&month=10');
  });

  it('필터가 걸려 있으면 검색 화면', () => {
    expect(
      toTimelineHref({
        query: { ...CAL, day: '2026-11-20', tag: 'AI' },
        todayKey: TODAY,
      })
    ).toBe('/search?tag=AI');
  });

  it('연·월이 없으면 /events', () => {
    expect(
      toTimelineHref({ query: { view: 'calendar' }, todayKey: TODAY })
    ).toBe('/events');
  });
});
