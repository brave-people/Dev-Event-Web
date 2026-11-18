import {
  buildMonthCells,
  formatKoDay,
  HEAT_STEPS,
  heatLegend,
  heatLevel,
  MonthCell,
} from 'components/events/calendar/utils/calendarMonth';

const TODAY = '2026-11-13'; // 금요일. 목업의 고정 날짜와 같다

describe('색 단계', () => {
  it('기준은 2·4·7건이다 (2026-11-13 데이터에 맞춘 값)', () => {
    expect(HEAT_STEPS).toEqual([2, 4, 7]);
  });

  it('0건은 0, 1~2건은 1, 3~4건은 2, 5~7건은 3, 8건 이상은 4단계', () => {
    expect([0, 1, 2, 3, 4, 5, 7, 8, 11].map((n) => heatLevel(n))).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4,
    ]);
  });

  it('범례의 문구는 기준에서 만든다', () => {
    expect(heatLegend()).toEqual(['1~2건', '3~4건', '5~7건', '8건 이상']);
  });

  it('기준을 바꾸면 단계와 범례가 함께 바뀐다', () => {
    expect(heatLevel(3, [3, 6, 10])).toBe(1);
    expect(heatLevel(11, [3, 6, 10])).toBe(4);
    expect(heatLegend([3, 6, 10])).toEqual([
      '1~3건',
      '4~6건',
      '7~10건',
      '11건 이상',
    ]);
    expect(heatLegend([1, 2, 3])).toEqual(['1건', '2건', '3건', '4건 이상']);
  });
});

describe('buildMonthCells', () => {
  // 목업 스냅샷의 11월 6일(11건), 13일(6건), 14일(1건), 20일(10건)
  const counts = {
    '2026-11-06': 11,
    '2026-11-13': 6,
    '2026-11-14': 1,
    '2026-11-20': 10,
    '2026-12-02': 2,
  };
  const weeks = buildMonthCells(2026, 11, counts, TODAY);
  const cell = (key: string): MonthCell =>
    weeks.flat().filter((c) => c.key === key)[0];

  it('2026년 11월은 다섯 줄이다 (1일이 일요일. 이 달의 날이 없는 줄은 뺀다)', () => {
    expect(weeks).toHaveLength(5);
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks[0][0].key).toBe('2026-11-01');
    expect(weeks[0][0].weekday).toBe(0);
    expect(weeks[4][1].key).toBe('2026-11-30');
  });

  it('줄 수는 달마다 다르다', () => {
    expect(buildMonthCells(2026, 2, {}, TODAY)).toHaveLength(4);
    expect(buildMonthCells(2026, 8, {}, TODAY)).toHaveLength(6);
    expect(buildMonthCells(2026, 12, {}, TODAY)).toHaveLength(5);
  });

  it('다른 달의 날은 빈칸이다 (건수가 있어도 세지 않는다)', () => {
    const dec2 = cell('2026-12-02');
    expect(dec2.inMonth).toBe(false);
    expect(dec2.count).toBe(0);
    expect(dec2.level).toBe(0);
    expect(dec2.label).toBe('');
    expect(dec2.tip).toBe('');
  });

  it('칸마다 건수와 색 단계', () => {
    expect(cell('2026-11-06')).toMatchObject({ day: 6, count: 11, level: 4 });
    expect(cell('2026-11-13')).toMatchObject({ day: 13, count: 6, level: 3 });
    expect(cell('2026-11-14')).toMatchObject({ day: 14, count: 1, level: 1 });
    expect(cell('2026-11-02')).toMatchObject({ day: 2, count: 0, level: 0 });
  });

  it('오늘과 지난 날', () => {
    expect(cell('2026-11-12')).toMatchObject({ isToday: false, isPast: true });
    expect(cell('2026-11-13')).toMatchObject({ isToday: true, isPast: false });
    expect(cell('2026-11-14')).toMatchObject({ isToday: false, isPast: false });
  });

  it('읽어 주는 문구와 올렸을 때의 한 줄 설명', () => {
    expect(cell('2026-11-20').label).toBe('11월 20일 금요일, 행사 10건');
    expect(cell('2026-11-20').tip).toBe('11월 20일 금요일 · 행사 10건');
    expect(cell('2026-11-13').label).toBe('11월 13일 금요일, 행사 6건, 오늘');
    expect(cell('2026-11-02').label).toBe('11월 2일 월요일, 행사 0건');
    expect(cell('2026-11-02').tip).toBe('');
  });
});

describe('formatKoDay', () => {
  it("날짜 키를 'N월 N일'로 적는다", () => {
    expect(formatKoDay('2026-11-20')).toBe('11월 20일');
    expect(formatKoDay('2026-12-02')).toBe('12월 2일');
  });
});
