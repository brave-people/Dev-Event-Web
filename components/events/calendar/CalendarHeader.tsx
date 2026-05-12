import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import ViewToggle from './ViewToggle';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);

type Props = { year: number; month: number };

const CalendarHeader = ({ year, month }: Props) => {
  const router = useRouter();

  const navigate = (deltaMonths: number | 'today') => {
    let nextYear = year;
    let nextMonth = month;
    if (deltaMonths === 'today') {
      const now = dayjs();
      nextYear = now.year();
      nextMonth = now.month() + 1;
    } else {
      const next = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).add(deltaMonths, 'month');
      nextYear = next.year();
      nextMonth = next.month() + 1;
    }
    router.push({
      pathname: '/events',
      query: { ...router.query, view: 'calendar', year: nextYear, month: nextMonth },
    });
  };

  return (
    <div className={cn('header')}>
      <div className={cn('header__nav')}>
        <button type="button" className={cn('header__navBtn')} aria-label="이전 달" onClick={() => navigate(-1)}>‹</button>
        <span className={cn('header__monthLabel')}>{year}년 {month}월</span>
        <button type="button" className={cn('header__navBtn')} aria-label="다음 달" onClick={() => navigate(1)}>›</button>
        <button type="button" className={cn('header__todayBtn')} onClick={() => navigate('today')}>오늘</button>
      </div>
      <ViewToggle current="calendar" />
    </div>
  );
};

export default CalendarHeader;
