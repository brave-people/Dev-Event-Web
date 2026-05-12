import dayjs from 'dayjs';

export interface CalendarCell {
  date: string;     // 'YYYY-MM-DD'
  year: number;
  month: number;    // 1~12
  day: number;
  dow: number;      // 0=Sun ... 6=Sat
  isOutside: boolean;
}

export function buildCalendarMatrix(year: number, month: number): CalendarCell[][] {
  const firstOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const startDow = firstOfMonth.day(); // 0~6
  const gridStart = firstOfMonth.subtract(startDow, 'day');

  const matrix: CalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = gridStart.add(w * 7 + d, 'day');
      week.push({
        date: cur.format('YYYY-MM-DD'),
        year: cur.year(),
        month: cur.month() + 1,
        day: cur.date(),
        dow: cur.day(),
        isOutside: cur.month() + 1 !== month || cur.year() !== year,
      });
    }
    matrix.push(week);
  }
  return matrix;
}
