import {
  buildStripDays,
  monthKey,
  monthTotals,
  readMonthParam,
  STRIP_MAX_DAYS,
  stripDayLabel,
  stripRange,
} from 'lib/utils/timeline/dateStrip';
import { EventResponse } from 'model/event';

const TODAY = '2026-11-13';

describe('stripRange', () => {
  it('오늘부터, 적어도 14일', () => {
    expect(stripRange({ keys: [], todayKey: TODAY, showPast: false })).toEqual({
      from: '2026-11-13',
      to: '2026-11-26',
    });
  });

  it('행사가 더 뒤에 있으면 마지막 행사 날까지', () => {
    expect(
      stripRange({
        keys: ['2026-11-01', '2026-12-28'],
        todayKey: TODAY,
        showPast: false,
      })
    ).toEqual({ from: '2026-11-13', to: '2026-12-28' });
  });

  it('지난 행사를 펼치면 가장 이른 날부터', () => {
    expect(
      stripRange({
        keys: ['2026-11-01', '2026-11-20'],
        todayKey: TODAY,
        showPast: true,
      })
    ).toEqual({ from: '2026-11-01', to: '2026-11-26' });
  });

  it('펼쳐도 지난 행사가 없으면 오늘부터', () => {
    expect(
      stripRange({ keys: ['2026-11-20'], todayKey: TODAY, showPast: true }).from
    ).toBe('2026-11-13');
  });

  it('다른 달을 볼 때는 그 달의 1일부터 말일까지', () => {
    expect(
      stripRange({
        keys: [],
        todayKey: TODAY,
        showPast: false,
        month: { year: 2026, month: 10 },
      })
    ).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(
      stripRange({
        keys: [],
        todayKey: TODAY,
        showPast: false,
        month: { year: 2028, month: 2 },
      })
    ).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});

describe('buildStripDays', () => {
  const days = buildStripDays(
    { from: '2026-11-29', to: '2026-12-02' },
    { '2026-11-30': 2, '2026-12-01': 1 },
    '2026-11-30'
  );

  it('하루에 한 칸', () => {
    expect(days.map((d) => d.key)).toEqual([
      '2026-11-29',
      '2026-11-30',
      '2026-12-01',
      '2026-12-02',
    ]);
  });

  it('지난 날, 오늘, 건수', () => {
    expect(days[0]).toEqual({
      key: '2026-11-29',
      day: 29,
      label: '일',
      weekday: 0,
      count: 0,
      isToday: false,
      isPast: true,
      isFirst: false,
    });
    expect(days[1]).toEqual({
      key: '2026-11-30',
      day: 30,
      label: '월',
      weekday: 1,
      count: 2,
      isToday: true,
      isPast: false,
      isFirst: false,
    });
  });

  it('1일에는 요일 대신 "12월"', () => {
    expect(days[2]).toEqual({
      key: '2026-12-01',
      day: 1,
      label: '12월',
      weekday: 2,
      count: 1,
      isToday: false,
      isPast: false,
      isFirst: true,
    });
  });

  it('띠의 길이는 시작일부터 366일을 넘지 않는다', () => {
    const long = buildStripDays(
      { from: '2026-11-13', to: '2036-11-13' },
      { '2026-11-20': 1, '2036-11-13': 1 },
      '2026-11-13'
    );
    expect(STRIP_MAX_DAYS).toBe(366);
    expect(long.length).toBe(366);
    expect(long[0].key).toBe('2026-11-13');
    expect(long.some((d) => d.key === '2026-11-20' && d.count === 1)).toBe(
      true
    );
    expect(long.some((d) => d.key === '2036-11-13')).toBe(false);
  });

  it('칸을 읽어 주는 문구', () => {
    expect(stripDayLabel(days[1])).toBe('11월 30일 월요일, 행사 2건, 오늘');
    expect(stripDayLabel(days[3])).toBe('12월 2일 수요일, 행사 0건');
  });
});

describe('월 선택', () => {
  it('응답에 들어 있는 달의 건수는 metadata.total', () => {
    const responses: EventResponse[] = [
      { metadata: { total: 68, year: 2026, month: 11 }, dev_event: [] },
      { metadata: { total: 44, year: 2026, month: 12 }, dev_event: [] },
    ];
    expect(monthTotals(responses)).toEqual({ '2026-11': 68, '2026-12': 44 });
    expect(monthTotals(undefined)).toEqual({});
  });

  it('연·월이 숫자가 아닌 묶음은 건너뛴다', () => {
    const responses = [
      { metadata: { total: 5 }, dev_event: [] },
      { metadata: { total: 68, year: 2026, month: 11 }, dev_event: [] },
    ] as unknown as EventResponse[];
    expect(monthTotals(responses)).toEqual({ '2026-11': 68 });
  });

  it('달의 키', () => {
    expect(monthKey(2026, 3)).toBe('2026-03');
  });

  it('주소의 연·월을 읽는다', () => {
    expect(readMonthParam({ year: '2026', month: '10' })).toEqual({
      year: 2026,
      month: 10,
    });
  });

  it('잘못된 값은 받지 않는다', () => {
    expect(readMonthParam({})).toBeNull();
    expect(readMonthParam({ year: '2026' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '13' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '0' })).toBeNull();
    expect(readMonthParam({ year: '0', month: '10' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '10.5' })).toBeNull();
    expect(readMonthParam({ year: '2026.5', month: '10' })).toBeNull();
    expect(readMonthParam({ year: ['2026', '2025'], month: '10' })).toBeNull();
  });
});
