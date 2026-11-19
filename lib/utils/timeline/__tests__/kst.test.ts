import {
  addDays,
  dayKey,
  diffDays,
  formatHm,
  formatMd,
  formatMdw,
  parseNaive,
  toKstNaive,
  weekdayOf,
} from 'lib/utils/timeline/kst';

describe('한국 시간 벽시계 계산', () => {
  it('실제 시각을 한국 시간 문자열로 바꾼다 (실행 환경의 시간대와 무관)', () => {
    expect(toKstNaive(Date.UTC(2026, 10, 12, 15, 0, 30))).toBe(
      '2026-11-13T00:00'
    );
    expect(toKstNaive(Date.UTC(2026, 10, 13, 1, 0, 0))).toBe(
      '2026-11-13T10:00'
    );
  });

  it('시간대 표기가 없는 API 문자열을 글자 그대로 읽는다', () => {
    expect(dayKey(parseNaive('2026-11-13T17:00'))).toBe('2026-11-13');
    expect(formatHm(parseNaive('2026-11-13T17:00:00'))).toBe('17:00');
    expect(formatHm(parseNaive('2026-11-13T09:05:59.000Z'))).toBe('09:05');
    expect(dayKey(parseNaive('2026-11-13'))).toBe('2026-11-13');
  });

  it('읽을 수 없는 값은 NaN', () => {
    expect(Number.isNaN(parseNaive(''))).toBe(true);
    expect(Number.isNaN(parseNaive('없음'))).toBe(true);
  });

  it('날짜 키를 더하고 뺀다 (달과 해를 넘어간다)', () => {
    expect(addDays('2026-11-13', 13)).toBe('2026-11-26');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-11-13', '2026-11-10')).toBe(3);
    expect(diffDays('2026-11-10', '2026-11-13')).toBe(-3);
  });

  it('요일과 표시 문구', () => {
    expect(weekdayOf('2026-11-13')).toBe(5);
    expect(formatMd('2026-11-03')).toBe('11.3');
    expect(formatMdw('2026-11-22')).toBe('11.22(일)');
    expect(formatMdw('2026-12-05')).toBe('12.5(토)');
  });
});
