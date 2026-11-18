import { useContext } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import {
  toCalendarHref,
  toTimelineHref,
} from 'components/events/calendar/utils/calendarUrl';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { EventContext } from 'context/event';
import { toKstNaive } from 'lib/utils/timeline/kst';
import style from './ViewToggle.module.scss';

const cn = classNames.bind(style);

export type ViewMode = 'list' | 'calendar';

type Props = {
  current: ViewMode;
  dayKey?: string; // 지금 보고 있는(고른) 날. 넘기지 않으면 날짜 없이 전환한다
};

const ViewToggle = ({ current, dayKey }: Props) => {
  const router = useRouter();
  const { handleFocusDay } = useContext(EventContext);

  const switchTo = (mode: ViewMode) => {
    if (mode === current) return;
    const todayKey = toKstNaive(Date.now()).slice(0, 10);
    if (mode === 'list') {
      handleFocusDay(dayKey ?? null);
      router.push(toTimelineHref({ query: router.query, todayKey }));
    } else {
      router.push(toCalendarHref({ query: router.query, dayKey, todayKey }));
    }
  };

  return (
    <div className={cn('toggle')} role="group" aria-label="보기 방식">
      <button
        type="button"
        aria-pressed={current === 'list'}
        aria-label="타임라인으로 보기"
        className={cn('toggle__btn', { 'is-on': current === 'list' })}
        onClick={() => switchTo('list')}
      >
        <TimelineIcon name="rows" size={18} />
        <span>타임라인</span>
      </button>
      <button
        type="button"
        aria-pressed={current === 'calendar'}
        aria-label="캘린더로 보기"
        className={cn('toggle__btn', { 'is-on': current === 'calendar' })}
        onClick={() => switchTo('calendar')}
      >
        <TimelineIcon name="calendar" size={18} />
        <span>캘린더</span>
      </button>
    </div>
  );
};

export default ViewToggle;
