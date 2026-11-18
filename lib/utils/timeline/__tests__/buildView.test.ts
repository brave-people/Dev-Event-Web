import { buildTimelineView } from 'lib/utils/timeline/buildView';
import { EMPTY_FILTERS } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00';

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

// e1: 11.10에 마감(지남) / e2: 오늘 17시 마감, 새 행사 / e3: 11.19 행사, 새 행사 / e4: 12.2 마감
const ALL: Event[] = [
  event({
    id: '1',
    title: 'Kubernetes 밋업',
    end_date_time: '2026-11-10T18:00',
    create_date_time: '2026-10-20T09:00',
    tagNames: ['AI', '온라인'],
  }),
  event({
    id: '2',
    title: 'AI 해커톤',
    end_date_time: '2026-11-13T17:00',
    create_date_time: '2026-11-12T09:00',
    tagNames: ['AI', '오프라인'],
  }),
  event({
    id: '3',
    title: '클라우드 세미나',
    event_time_type: 'DATE',
    start_date_time: '2026-11-19T19:00',
    end_date_time: '2026-11-19T20:30',
    create_date_time: '2026-11-11T09:00',
    tagNames: ['클라우드', '온라인'],
  }),
  event({
    id: '4',
    title: '보안 컨퍼런스',
    end_date_time: '2026-12-02T12:00',
    tagNames: ['보안'],
  }),
];

const base = {
  events: ALL,
  current: ALL,
  filters: EMPTY_FILTERS,
  newOnly: false,
  showPast: false,
  month: null,
  now: NOW,
};
const keys = (groups: { key: string }[]) => groups.map((g) => g.key);

describe('buildTimelineView', () => {
  it('처음에는 오늘부터 보여 주고, 지난 날짜의 행사는 건수만 센다', () => {
    const v = buildTimelineView(base);
    expect(v.todayKey).toBe('2026-11-13');
    expect(keys(v.groups)).toEqual([
      '2026-11-10',
      '2026-11-13',
      '2026-11-19',
      '2026-12-02',
    ]);
    expect(keys(v.visible)).toEqual(['2026-11-13', '2026-11-19', '2026-12-02']);
    expect(v.pastCount).toBe(1);
    expect(v.newCount).toBe(2);
    expect(v.visibleCount).toBe(3);
  });

  it('날짜 띠는 오늘부터 마지막 행사 날까지이고, 12월 1일 칸에 "12월"을 적는다', () => {
    const v = buildTimelineView(base);
    expect(v.days).toHaveLength(20);
    expect(v.days[0]).toMatchObject({
      key: '2026-11-13',
      count: 1,
      isToday: true,
    });
    expect(v.days[v.days.length - 1].key).toBe('2026-12-02');
    expect(v.days.find((d) => d.key === '2026-12-01')?.label).toBe('12월');
  });

  it('지난 행사를 펼치면 목록도 띠도 가장 이른 날부터', () => {
    const v = buildTimelineView({ ...base, showPast: true });
    expect(keys(v.visible)).toEqual([
      '2026-11-10',
      '2026-11-13',
      '2026-11-19',
      '2026-12-02',
    ]);
    expect(v.days[0].key).toBe('2026-11-10');
    expect(v.days).toHaveLength(23);
    expect(v.visibleCount).toBe(4);
  });

  it('새 행사만 보면 띠의 범위는 그대로이고 건수만 바뀐다', () => {
    const v = buildTimelineView({ ...base, newOnly: true });
    expect(keys(v.groups)).toEqual(['2026-11-13', '2026-11-19']);
    expect(v.pastCount).toBe(0);
    expect(v.days).toHaveLength(20);
    expect(v.days.find((d) => d.key === '2026-12-02')?.count).toBe(0);
    expect(v.newCount).toBe(2);
  });

  it('필터를 걸면 띠의 건수도 걸러진 값이다', () => {
    const v = buildTimelineView({ ...base, filters: { tags: ['보안'] } });
    expect(keys(v.visible)).toEqual(['2026-12-02']);
    expect(v.days[0].count).toBe(0);
    expect(v.newCount).toBe(2);
  });

  it('결과가 지난 날짜에만 있으면 그릴 묶음은 없고 지난 행사 수만 남는다', () => {
    const v = buildTimelineView({
      ...base,
      filters: { tags: [], kwd: 'kubernetes' },
    });
    expect(keys(v.groups)).toEqual(['2026-11-10']);
    expect(v.visible).toEqual([]);
    expect(v.visibleCount).toBe(0);
    expect(v.pastCount).toBe(1);
  });

  it('다른 달을 볼 때는 그 달에 놓인 행사만, 지난 것도 함께 보여 준다', () => {
    const v = buildTimelineView({ ...base, month: { year: 2026, month: 11 } });
    expect(keys(v.visible)).toEqual(['2026-11-10', '2026-11-13', '2026-11-19']);
    expect(v.days).toHaveLength(30);
    expect(v.days[0].key).toBe('2026-11-01');
    expect(v.pastCount).toBe(0);
  });

  it('행사가 없는 달도 띠는 한 달 치가 나온다', () => {
    const v = buildTimelineView({
      ...base,
      events: [],
      month: { year: 2028, month: 2 },
    });
    expect(v.visible).toEqual([]);
    expect(v.days).toHaveLength(29);
    expect(v.days.every((d) => d.count === 0)).toBe(true);
  });
});
