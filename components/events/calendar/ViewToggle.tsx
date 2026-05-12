import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);

export type ViewMode = 'list' | 'calendar';

type Props = { current: ViewMode };

const ViewToggle = ({ current }: Props) => {
  const router = useRouter();

  const switchTo = (mode: ViewMode) => {
    if (mode === current) return;
    if (mode === 'list') {
      const { view, year, month, ...rest } = router.query;
      router.push({ pathname: '/events', query: rest });
    } else {
      const now = dayjs();
      router.push({
        pathname: '/events',
        query: {
          ...router.query,
          view: 'calendar',
          year: router.query.year ?? now.year(),
          month: router.query.month ?? now.month() + 1,
        },
      });
    }
  };

  return (
    <div className={cn('viewToggle')} role="tablist" aria-label="보기 전환">
      <button
        type="button"
        role="tab"
        aria-selected={current === 'list'}
        className={cn('viewToggle__btn', { on: current === 'list' })}
        onClick={() => switchTo('list')}
      >
        📋 리스트
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={current === 'calendar'}
        className={cn('viewToggle__btn', { on: current === 'calendar' })}
        onClick={() => switchTo('calendar')}
      >
        📅 캘린더
      </button>
    </div>
  );
};

export default ViewToggle;
