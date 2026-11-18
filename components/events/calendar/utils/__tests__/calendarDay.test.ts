import {
  daySummary,
  emptyDayAction,
  moveByArrow,
  neighborDays,
  pickDefaultDay,
  resolveDay,
  splitDay,
} from 'components/events/calendar/utils/calendarDay';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일
const TODAY = '2026-11-13';
// 이 달에서 행사가 있는 날
const KEYS = [
  '2026-11-06',
  '2026-11-13',
  '2026-11-14',
  '2026-11-20',
  '2026-11-30',
];

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
  start_date_time: '2026-11-01T00:00',
  end_day_week: '수',
  end_date_time: '2026-11-20T17:00',
  tags: [],
  create_date_time: '2026-10-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});
const item = (over: Partial<Event>) => describeEvent(ev(over), NOW);
const ids = (section: { items: { event: Event }[] }) =>
  section.items.map((i) => i.event.id);

describe('pickDefaultDay — 달을 열었을 때 고를 날', () => {
  it('이번 달이고 오늘 행사가 있으면 오늘', () => {
    expect(pickDefaultDay(KEYS, '2026-11', TODAY)).toBe('2026-11-13');
  });

  it('오늘 행사가 없으면 오늘 뒤의 첫 행사일', () => {
    expect(pickDefaultDay(KEYS, '2026-11', '2026-11-15')).toBe('2026-11-20');
  });

  it('오늘 뒤에 행사가 없으면 이 달의 첫 행사일', () => {
    expect(pickDefaultDay(['2026-11-06', '2026-11-10'], '2026-11', TODAY)).toBe(
      '2026-11-06'
    );
  });

  it('다른 달이면 그 달의 첫 행사일', () => {
    expect(pickDefaultDay(['2026-12-02', '2026-12-03'], '2026-12', TODAY)).toBe(
      '2026-12-02'
    );
    expect(pickDefaultDay(['2026-10-05', '2026-10-20'], '2026-10', TODAY)).toBe(
      '2026-10-05'
    );
  });

  it('행사가 없는 달이면 고른 날이 없다', () => {
    expect(pickDefaultDay([], '2026-11', TODAY)).toBeNull();
  });
});

describe('resolveDay — 주소의 날짜와 기본 날짜', () => {
  const base = { keys: KEYS, monthKey: '2026-11', todayKey: TODAY };

  it('주소의 날짜가 이 달이면 그날을 고른다', () => {
    expect(resolveDay({ ...base, wanted: '2026-11-20' })).toBe('2026-11-20');
  });

  it('필터 때문에 그날 행사가 없어도 그대로 둔다', () => {
    expect(resolveDay({ ...base, wanted: '2026-11-12' })).toBe('2026-11-12');
  });

  it('주소에 날짜가 없거나 다른 달의 날짜면 기본 날짜', () => {
    expect(resolveDay({ ...base, wanted: null })).toBe('2026-11-13');
    expect(resolveDay({ ...base, wanted: '2026-12-02' })).toBe('2026-11-13');
  });

  it('이 달에 행사가 하나도 없으면 고른 날이 없다', () => {
    expect(resolveDay({ ...base, keys: [], wanted: '2026-11-12' })).toBeNull();
  });
});

describe('moveByArrow — 방향키로 갈 날', () => {
  it('좌우는 하루. 행사 없는 날은 건너뛴다', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowRight')).toBe('2026-11-14');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowRight')).toBe('2026-11-20');
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowLeft')).toBe('2026-11-06');
  });

  it('위아래는 한 주. 그날 행사가 없으면 그 방향으로 가장 가까운 날', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowDown')).toBe('2026-11-20');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowDown')).toBe('2026-11-30');
    expect(moveByArrow(KEYS, '2026-11-20', 'ArrowUp')).toBe('2026-11-13');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowUp')).toBe('2026-11-06');
  });

  it('그 방향에 행사 있는 날이 없으면 움직이지 않는다', () => {
    expect(moveByArrow(KEYS, '2026-11-30', 'ArrowRight')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-30', 'ArrowDown')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-06', 'ArrowLeft')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowUp')).toBe('2026-11-06');
    expect(moveByArrow(KEYS, '2026-11-06', 'ArrowUp')).toBeNull();
    expect(moveByArrow([], '2026-11-13', 'ArrowRight')).toBeNull();
  });

  it('방향키가 아니면 움직이지 않는다', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'Enter')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-13', 'Tab')).toBeNull();
  });
});

describe('neighborDays — 날짜 제목 옆 ‹ ›', () => {
  it('앞뒤의 행사 있는 날', () => {
    expect(neighborDays(KEYS, '2026-11-14')).toEqual({
      prev: '2026-11-13',
      next: '2026-11-20',
    });
  });

  it('끝에서는 없다', () => {
    expect(neighborDays(KEYS, '2026-11-06').prev).toBeNull();
    expect(neighborDays(KEYS, '2026-11-30').next).toBeNull();
  });

  it('고른 날에 행사가 없어도(필터) 앞뒤를 찾는다', () => {
    expect(neighborDays(KEYS, '2026-11-12')).toEqual({
      prev: '2026-11-06',
      next: '2026-11-13',
    });
  });
});

describe('splitDay — 하루의 두 묶음', () => {
  const recruitA = item({ id: 'a', end_date_time: '2026-11-20T17:00' });
  const recruitB = item({ id: 'b', end_date_time: '2026-11-20T23:59' });
  const open = item({
    id: 'c',
    event_time_type: 'DATE',
    start_date_time: '2026-11-20T19:00',
    end_date_time: '2026-11-20T21:00',
  });

  it('접수형과 일시형으로 나눈다. 받은 순서는 그대로', () => {
    const sections = splitDay([recruitA, open, recruitB], '2026-11-20', TODAY);
    expect(sections.map((s) => s.id)).toEqual(['deadline', 'open']);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '이날 열려요',
    ]);
    expect(ids(sections[0])).toEqual(['a', 'b']);
    expect(ids(sections[1])).toEqual(['c']);
  });

  it('오늘이면 "오늘 열리거나 진행 중이에요"', () => {
    const sections = splitDay([recruitA, open], TODAY, TODAY);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '오늘 열리거나 진행 중이에요',
    ]);
  });

  it('지난 날이면 "마감했어요", "열렸어요"', () => {
    const sections = splitDay([recruitA, open], '2026-11-06', TODAY);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감했어요',
      '이날 열렸어요',
    ]);
  });

  it('한쪽만 있으면 그 묶음만, 없으면 빈 배열', () => {
    expect(splitDay([open], '2026-11-20', TODAY).map((s) => s.id)).toEqual([
      'open',
    ]);
    expect(splitDay([], '2026-11-20', TODAY)).toEqual([]);
  });
});

describe('daySummary · emptyDayAction — 목업의 문구', () => {
  const recruit = item({ id: 'a' });
  const open = item({
    id: 'c',
    event_time_type: 'DATE',
    start_date_time: '2026-11-20T19:00',
    end_date_time: '2026-11-20T21:00',
  });

  it('날짜 제목 아래 한 줄', () => {
    const both = splitDay([recruit, recruit, open], '2026-11-20', TODAY);
    expect(daySummary(both, false)).toBe('접수 마감 2건 · 열리는 행사 1건');
    expect(daySummary(both, true)).toBe('접수 마감 2건 · 열린 행사 1건');
    expect(daySummary(splitDay([open], '2026-11-20', TODAY), false)).toBe(
      '열리는 행사 1건'
    );
    expect(daySummary([], false)).toBe('등록된 행사가 없어요');
  });

  it('고른 날이 비었을 때의 버튼: 다음 날이 먼저, 없으면 이전 날', () => {
    expect(emptyDayAction('2026-11-06', '2026-11-21')).toEqual({
      key: '2026-11-21',
      label: '다음 행사가 있는 11월 21일 보기',
    });
    expect(emptyDayAction('2026-11-06', null)).toEqual({
      key: '2026-11-06',
      label: '이전 행사가 있는 11월 6일 보기',
    });
    expect(emptyDayAction(null, null)).toBeNull();
  });
});
