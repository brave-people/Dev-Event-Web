import { buildCalendarMatrix, CalendarCell } from '../buildCalendarMatrix';

describe('buildCalendarMatrix', () => {
  it('returns 6 weeks × 7 days = 42 cells', () => {
    const matrix = buildCalendarMatrix(2026, 5);
    expect(matrix).toHaveLength(6);
    matrix.forEach((week) => expect(week).toHaveLength(7));
  });

  it('marks outside-month cells with isOutside=true (2026-05)', () => {
    const matrix = buildCalendarMatrix(2026, 5);
    // 2026/5/1 is Friday — first row has 5 outside cells (4/26~4/30)
    expect(matrix[0][0]).toEqual<CalendarCell>({
      date: '2026-04-26', year: 2026, month: 4, day: 26, dow: 0, isOutside: true,
    });
    expect(matrix[0][5]).toEqual<CalendarCell>({
      date: '2026-05-01', year: 2026, month: 5, day: 1, dow: 5, isOutside: false,
    });
  });

  it('handles year boundary (2025-12 → 2026-01 outside cells)', () => {
    const matrix = buildCalendarMatrix(2025, 12);
    const last = matrix[matrix.length - 1];
    const outsideAfter = last.filter((c) => c.isOutside && c.year === 2026);
    expect(outsideAfter.length).toBeGreaterThan(0);
    expect(outsideAfter[0].month).toBe(1);
  });

  it('handles leap year February 2024 correctly', () => {
    const matrix = buildCalendarMatrix(2024, 2);
    const inMonth = matrix.flat().filter((c) => !c.isOutside);
    expect(inMonth).toHaveLength(29);
    expect(inMonth[inMonth.length - 1].day).toBe(29);
  });
});
