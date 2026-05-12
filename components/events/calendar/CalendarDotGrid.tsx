import { useMemo } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { buildCalendarMatrix } from './utils/buildCalendarMatrix';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const MAX_DOTS = 3;

type Props = {
  year: number;
  month: number;
  events: Event[];
  selectedDate: string | null;
  onSelectDate: (dateISO: string) => void;
};

const CalendarDotGrid = ({ year, month, events, selectedDate, onSelectDate }: Props) => {
  const matrix = useMemo(() => buildCalendarMatrix(year, month), [year, month]);
  const todayISO = dayjs().format('YYYY-MM-DD');

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events
      .filter((e) =>
        e.event_time_type === 'DATE' &&
        e.use_start_date_time_yn !== 'N' &&
        e.start_date_time
      )
      .forEach((e) => {
        const start = dayjs(e.start_date_time);
        const end   = e.end_date_time ? dayjs(e.end_date_time) : start;
        let cursor = start;
        while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
          const iso = cursor.format('YYYY-MM-DD');
          if (!map.has(iso)) map.set(iso, []);
          map.get(iso)!.push(e);
          cursor = cursor.add(1, 'day');
        }
      });
    return map;
  }, [events]);

  return (
    <div className={cn('dot__grid')}>
      {matrix.flat().map((cell) => {
        const isToday = cell.date === todayISO && !cell.isOutside;
        const isSelected = cell.date === selectedDate;
        const dayEvents = eventsByDate.get(cell.date) ?? [];
        const visible = dayEvents.slice(0, MAX_DOTS);
        const overflow = dayEvents.length - visible.length;

        return (
          <div
            key={cell.date}
            className={cn('dot__cell', {
              outside: cell.isOutside,
              today: isToday,
              selected: isSelected,
              sun: cell.dow === 0,
              sat: cell.dow === 6,
            })}
            role="button"
            tabIndex={0}
            aria-label={`${cell.month}월 ${cell.day}일 행사 ${dayEvents.length}건`}
            onClick={() => onSelectDate(cell.date)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectDate(cell.date); }}
          >
            <span>{cell.day}</span>
            {(visible.length > 0 || overflow > 0) && (
              <div className={cn('dot__dots')}>
                {visible.map((e, i) => (
                  <i
                    key={`${e.id}-${i}`}
                    style={{ background: tagColor(e.tags.map((t: TagResponse) => t.tag_name)) }}
                  />
                ))}
                {overflow > 0 && <i className={cn('plus')} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDotGrid;
