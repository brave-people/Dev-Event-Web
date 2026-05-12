import dayjs from 'dayjs';
import { Event } from 'model/event';
import { CalendarCell } from './buildCalendarMatrix';

export interface EventSegment {
  eventId: string;
  event: Event;
  weekIndex: number;   // 0~5
  startCol: number;    // 0~6 (inclusive)
  endCol: number;      // 0~6 (inclusive)
  isStart: boolean;    // true if this segment includes the event's original start day
  isEnd: boolean;      // true if this segment includes the event's original end day
  isOutside: boolean;  // segment falls entirely in outside cells of the matrix
}

function isRenderable(e: Event): boolean {
  if (e.event_time_type !== 'DATE') return false;
  if (e.use_start_date_time_yn === 'N') return false;
  if (!e.start_date_time) return false;
  return true;
}

export function layoutMultiDayEvents(
  events: Event[],
  matrix: CalendarCell[][],
): EventSegment[][] {
  const segmentsByWeek: EventSegment[][] = matrix.map(() => []);

  const sorted = [...events]
    .filter(isRenderable)
    .sort((a, b) => {
      const ds = a.display_sequence - b.display_sequence;
      if (ds !== 0) return ds;
      return a.start_date_time.localeCompare(b.start_date_time);
    });

  const gridStart = dayjs(matrix[0][0].date);
  const gridEnd   = dayjs(matrix[5][6].date);

  for (const event of sorted) {
    const start = dayjs(event.start_date_time);
    const end   = event.end_date_time ? dayjs(event.end_date_time) : start;

    // clip to grid
    const clipStart = start.isBefore(gridStart) ? gridStart : start;
    const clipEnd   = end.isAfter(gridEnd)      ? gridEnd   : end;
    if (clipEnd.isBefore(clipStart)) continue;

    for (let w = 0; w < matrix.length; w++) {
      const weekStart = dayjs(matrix[w][0].date);
      const weekEnd   = dayjs(matrix[w][6].date);

      if (clipEnd.isBefore(weekStart) || clipStart.isAfter(weekEnd)) continue;

      const segStart = clipStart.isBefore(weekStart) ? weekStart : clipStart;
      const segEnd   = clipEnd.isAfter(weekEnd)      ? weekEnd   : clipEnd;
      const startCol = segStart.diff(weekStart, 'day');
      const endCol   = segEnd.diff(weekStart, 'day');

      const segmentIsOutside = Array.from(
        { length: endCol - startCol + 1 },
        (_, i) => matrix[w][startCol + i].isOutside,
      ).some(Boolean);

      segmentsByWeek[w].push({
        eventId: event.id,
        event,
        weekIndex: w,
        startCol,
        endCol,
        isStart: segStart.isSame(start, 'day'),
        isEnd:   segEnd.isSame(end, 'day'),
        isOutside: segmentIsOutside,
      });
    }
  }

  return segmentsByWeek;
}
