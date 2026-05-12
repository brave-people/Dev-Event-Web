import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { buildCalendarMatrix } from './utils/buildCalendarMatrix';
import { layoutMultiDayEvents, EventSegment } from './utils/layoutMultiDayEvents';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';
import { useMemo } from 'react';

const cn = classNames.bind(style);

const MAX_CHIPS_PER_CELL = 2;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  year: number;
  month: number;
  events: Event[];
  onSelectDate: (dateISO: string) => void;
};

const CalendarGrid = ({ year, month, events, onSelectDate }: Props) => {
  const matrix = useMemo(() => buildCalendarMatrix(year, month), [year, month]);
  const segmentsByWeek = useMemo(
    () => layoutMultiDayEvents(events, matrix),
    [events, matrix]
  );
  const todayISO = dayjs().format('YYYY-MM-DD');

  const renderWeek = (weekIdx: number) => {
    const week = matrix[weekIdx];
    const weekSegments = segmentsByWeek[weekIdx];

    // Map each column to all segments that occupy it (for overflow counting)
    const segmentsByCol: EventSegment[][] = Array.from({ length: 7 }, () => []);
    weekSegments.forEach((seg) => {
      for (let c = seg.startCol; c <= seg.endCol; c++) {
        segmentsByCol[c].push(seg);
      }
    });

    return week.map((cell, col) => {
      const isToday = cell.date === todayISO && !cell.isOutside;
      const segsHere = segmentsByCol[col];
      const segsStartingHere = segsHere.filter((seg) => seg.startCol === col);
      const visibleSegs = segsStartingHere.slice(0, MAX_CHIPS_PER_CELL);
      const overflow = segsHere.length - visibleSegs.length;

      return (
        <div
          key={cell.date}
          className={cn('grid__cell', { outside: cell.isOutside })}
          role="button"
          tabIndex={0}
          aria-label={`${cell.month}월 ${cell.day}일 행사 ${segsHere.length}건`}
          onClick={() => onSelectDate(cell.date)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectDate(cell.date); }}
        >
          <span
            className={cn('grid__num', {
              sun: cell.dow === 0 && !cell.isOutside,
              sat: cell.dow === 6 && !cell.isOutside,
              outside: cell.isOutside,
            })}
          >
            <span className={cn({ grid__numToday: isToday })}>{cell.day}</span>
          </span>
          {visibleSegs.map((seg) => {
            const color = tagColor(seg.event.tags.map((t: TagResponse) => t.tag_name));
            const spanLen = seg.endCol - seg.startCol + 1;
            const hasLeftJoin = !seg.isStart;
            const hasRightJoin = !seg.isEnd;
            return (
              <div
                key={`${seg.eventId}-${seg.weekIndex}-${seg.startCol}`}
                className={cn(
                  'grid__chip',
                  {
                    'grid__chip--start': hasRightJoin && !hasLeftJoin,
                    'grid__chip--mid':   hasLeftJoin && hasRightJoin,
                    'grid__chip--end':   hasLeftJoin && !hasRightJoin,
                  }
                )}
                style={{
                  background: hexToBg(color, 0.08),
                  color,
                  borderLeft: `2px solid ${color}`,
                  gridColumn: `span ${spanLen}`,
                }}
                title={seg.event.title}
              >
                {seg.event.title}
              </div>
            );
          })}
          {overflow > 0 && (
            <span className={cn('grid__more')}>+{overflow} 더보기</span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className={cn('grid__weekdays')}>
        {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className={cn('grid')}>
        {matrix.map((_, w) => renderWeek(w))}
      </div>
    </>
  );
};

function hexToBg(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default CalendarGrid;
