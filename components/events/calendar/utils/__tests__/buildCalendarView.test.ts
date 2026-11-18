import { buildCalendarView } from 'components/events/calendar/utils/buildCalendarView';
import { MonthCell } from 'components/events/calendar/utils/calendarMonth';
import { EMPTY_FILTERS } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일

const event = (over: Partial<Event> & { tagNames?: string[] }): Event => {
  const { tagNames = [], ...rest } = over;
  return {
    id: '1',
    title: '행사',
    description: '',
    organizer: '주최',
    event_link: 'https://example.com',
    cover_image_link: '',
    display_sequence: 0,
    event_time_type: 'RECRUIT',
    start_day_week: '수',
    start_date_time: '2026-11-01T00:00',
    end_day_week: '수',
    end_date_time: '2026-11-13T17:00',
    tags: tagNames.map((tag_name, index) => ({
      id: index + 1,
      tag_name,
      tag_color: '#0043FF',
      category: null,
    })),
    create_date_time: '2026-10-01T09:00',
    use_start_date_time_yn: 'Y',
    use_end_date_time_yn: 'Y',
    ...rest,
  };
};
const date = (over: Partial<Event> & { tagNames?: string[] }): Event =>
  event({ event_time_type: 'DATE', ...over });

const EVENTS: Event[] = [
  // 1: 오늘 17시에 접수 마감
  event({ id: '1', tagNames: ['AI', '온라인'] }),
  // 2: 오늘 저녁에 열림
  date({
    id: '2',
    start_date_time: '2026-11-13T19:00',
    end_date_time: '2026-11-13T21:00',
    tagNames: ['클라우드'],
  }),
  // 3: 어제 시작해 내일 끝남 (진행 중 → 오늘)
  date({
    id: '3',
    start_date_time: '2026-11-12T09:00',
    end_date_time: '2026-11-14T18:00',
    tagNames: ['AI'],
  }),
  // 4: 20일 접수 마감, 어제 등록 (새 행사)
  event({
    id: '4',
    end_date_time: '2026-11-20T23:59',
    create_date_time: '2026-11-12T09:00',
    tagNames: ['AI'],
  }),
  // 5: 20~22일 사흘짜리 (시작일에만 센다)
  date({
    id: '5',
    start_date_time: '2026-11-20T10:00',
    end_date_time: '2026-11-22T18:00',
  }),
  // 6: 6일에 끝난 행사
  date({
    id: '6',
    start_date_time: '2026-11-06T19:00',
    end_date_time: '2026-11-06T21:00',
    tagNames: ['AI'],
  }),
  // 7: 10월에 접수를 시작해 12월 2일 마감 (11월에는 놓이지 않는다), 어제 등록
  event({
    id: '7',
    start_date_time: '2026-10-20T00:00',
    end_date_time: '2026-12-02T18:00',
    create_date_time: '2026-11-12T09:00',
  }),
  // 8: 10일에 접수가 끝난 행사
  event({ id: '8', end_date_time: '2026-11-10T18:00', tagNames: ['보안'] }),
];

const build = (over: Partial<Parameters<typeof buildCalendarView>[0]> = {}) =>
  buildCalendarView({
    events: EVENTS,
    filters: EMPTY_FILTERS,
    newOnly: false,
    year: 2026,
    month: 11,
    wanted: null,
    now: NOW,
    ...over,
  });
const cell = (weeks: MonthCell[][], key: string): MonthCell =>
  weeks.flat().filter((c) => c.key === key)[0];
const ids = (section: { items: { event: Event }[] }) =>
  section.items.map((i) => i.event.id);

describe('buildCalendarView — 날짜별 건수', () => {
  const view = build();

  it('접수형은 마감일, 일시형은 시작일, 진행 중은 오늘에 센다', () => {
    expect(cell(view.weeks, '2026-11-13').count).toBe(3);
    expect(cell(view.weeks, '2026-11-20').count).toBe(2);
    expect(cell(view.weeks, '2026-11-06').count).toBe(1);
    expect(cell(view.weeks, '2026-11-10').count).toBe(1);
  });

  it('여러 날에 걸친 행사를 날마다 세지 않는다', () => {
    expect(cell(view.weeks, '2026-11-12').count).toBe(0);
    expect(cell(view.weeks, '2026-11-14').count).toBe(0);
    expect(cell(view.weeks, '2026-11-21').count).toBe(0);
    expect(cell(view.weeks, '2026-11-22').count).toBe(0);
  });

  it('이 달에 놓이지 않는 행사는 빼고, 행사 있는 날을 순서대로 준다', () => {
    expect(view.monthKey).toBe('2026-11');
    expect(view.keys).toEqual([
      '2026-11-06',
      '2026-11-10',
      '2026-11-13',
      '2026-11-20',
    ]);
  });
});

describe('buildCalendarView — 고른 날', () => {
  it('주소에 날짜가 없으면 오늘을 고르고 두 묶음으로 나눈다', () => {
    const view = build();
    expect(view.todayKey).toBe('2026-11-13');
    expect(view.selectedKey).toBe('2026-11-13');
    expect(view.isPastDay).toBe(false);
    expect(view.sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '오늘 열리거나 진행 중이에요',
    ]);
    expect(ids(view.sections[0])).toEqual(['1']);
    expect(ids(view.sections[1])).toEqual(['3', '2']); // 타임라인과 같은 순서: 진행 중이 먼저
    expect(view.summary).toBe('접수 마감 1건 · 열리는 행사 2건');
    expect(view.prevKey).toBe('2026-11-10');
    expect(view.nextKey).toBe('2026-11-20');
  });

  it('주소의 날짜가 지난 날이면 "열렸어요"로 바뀐다', () => {
    const view = build({ wanted: '2026-11-06' });
    expect(view.selectedKey).toBe('2026-11-06');
    expect(view.isPastDay).toBe(true);
    expect(view.sections.map((s) => s.title)).toEqual(['이날 열렸어요']);
    expect(view.sections[0].items[0].status).toBe('ended');
    expect(view.summary).toBe('열린 행사 1건');
    expect(view.prevKey).toBeNull();
    expect(view.nextKey).toBe('2026-11-10');
  });

  it('다른 달은 그 달의 첫 행사일을 고른다', () => {
    const view = build({ year: 2026, month: 12 });
    expect(view.keys).toEqual(['2026-12-02']);
    expect(view.selectedKey).toBe('2026-12-02');
    expect(view.sections.map((s) => s.title)).toEqual(['이날 접수를 마감해요']);
  });
});

describe('buildCalendarView — 필터와 새 행사', () => {
  it('필터를 걸면 달력의 건수도 걸러진 값이다', () => {
    const view = build({ filters: { tags: ['AI'] } });
    expect(cell(view.weeks, '2026-11-13').count).toBe(2);
    expect(cell(view.weeks, '2026-11-20').count).toBe(1);
    expect(cell(view.weeks, '2026-11-10').count).toBe(0);
    expect(view.keys).toEqual(['2026-11-06', '2026-11-13', '2026-11-20']);
  });

  it('검색어도 같이 건다', () => {
    const view = build({
      events: [
        event({ id: '1', title: '카카오 테크 밋업' }),
        event({ id: '2', title: '다른 행사' }),
      ],
      filters: { tags: [], kwd: '카카오테크' },
    });
    expect(cell(view.weeks, '2026-11-13').count).toBe(1);
  });

  it('필터 때문에 고른 날이 비면 묶음이 없고 앞뒤 날짜는 알려 준다', () => {
    const view = build({ filters: { tags: ['AI'] }, wanted: '2026-11-10' });
    expect(view.selectedKey).toBe('2026-11-10');
    expect(view.sections).toEqual([]);
    expect(view.summary).toBe('등록된 행사가 없어요');
    expect(view.prevKey).toBe('2026-11-06');
    expect(view.nextKey).toBe('2026-11-13');
  });

  it('새 행사만 보면 새 행사가 있는 날만 남고, 그 가운데서 날을 고른다', () => {
    const view = build({ newOnly: true });
    expect(view.keys).toEqual(['2026-11-20']);
    expect(view.selectedKey).toBe('2026-11-20');
    expect(cell(view.weeks, '2026-11-13').count).toBe(0);
  });

  it('조건에 맞는 행사가 이 달에 없으면 고른 날이 없다', () => {
    const view = build({
      filters: { tags: ['블록체인'] },
      wanted: '2026-11-13',
    });
    expect(view.keys).toEqual([]);
    expect(view.selectedKey).toBeNull();
    expect(view.sections).toEqual([]);
    expect(view.prevKey).toBeNull();
    expect(view.nextKey).toBeNull();
  });

  it('newCount는 이 달에 놓인 새 행사 수다 (필터와 무관, 다른 달에 놓인 것은 뺀다)', () => {
    expect(build().newCount).toBe(1);
    expect(build({ filters: { tags: ['보안'] } }).newCount).toBe(1);
    expect(build({ year: 2026, month: 12 }).newCount).toBe(1);
  });
});
