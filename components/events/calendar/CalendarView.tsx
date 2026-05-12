import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import CalendarDotGrid from './CalendarDotGrid';
import DayDetailSheet from './DayDetailSheet';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const MOBILE_BREAKPOINT = 720;

type Props = {
  year: number;
  month: number;
  events: Event[];
};

const CalendarView = ({ year, month, events }: Props) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className={cn('container')}>
      <CalendarHeader year={year} month={month} />
      {isMobile ? (
        <CalendarDotGrid
          year={year}
          month={month}
          events={events}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      )}
      <DayDetailSheet
        isOpen={!!selectedDate}
        selectedDate={selectedDate}
        events={events}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
};

export default CalendarView;
