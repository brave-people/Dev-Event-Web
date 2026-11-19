import classNames from 'classnames/bind';

import EventCard from 'components/events/timeline/EventCard';
import TimelineEmpty from 'components/events/timeline/TimelineEmpty';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import {
  DaySection,
  emptyDayAction,
} from 'components/events/calendar/utils/calendarDay';
import { formatKoDay } from 'components/events/calendar/utils/calendarMonth';
import { DOW, weekdayOf } from 'lib/utils/timeline/kst';
import { Event } from 'model/event';

import style from './DayPanel.module.scss';

const cn = classNames.bind(style);

const PRIORITY_COUNT = 3;

interface DayPanelProps {
  month: number;
  selectedKey: string | null;
  sections: DaySection[];
  prevKey: string | null;
  nextKey: string | null;
  failed: boolean;
  showTodayAction: boolean;
  isFavorite: (eventId: string) => boolean;
  onToggleFavorite: (event: Event) => void;
  onSelectDay: (key: string) => void;
  onToday: () => void;
}

function DayPanel({
  month,
  selectedKey,
  sections,
  prevKey,
  nextKey,
  failed,
  showTodayAction,
  isFavorite,
  onToggleFavorite,
  onSelectDay,
  onToday,
}: DayPanelProps) {
  if (failed) {
    return (
      <section className={cn('panel')} aria-label="고른 날의 행사">
        <TimelineEmpty title="이벤트 정보를 불러오는데 문제가 발생했습니다!" />
      </section>
    );
  }

  if (selectedKey === null) {
    return (
      <section className={cn('panel')} aria-label="고른 날의 행사">
        <TimelineEmpty
          title={`${month}월에는 조건에 맞는 행사가 없어요`}
          desc="다른 달을 고르거나 오늘로 돌아가 보세요."
          actionLabel={showTodayAction ? '오늘로 돌아가기' : undefined}
          onAction={onToday}
        />
      </section>
    );
  }

  const dow = weekdayOf(selectedKey);
  const action = emptyDayAction(prevKey, nextKey);
  let order = 0;

  return (
    <section className={cn('panel')} aria-label="고른 날의 행사">
      <div className={cn('head')}>
        <div className={cn('heading')} aria-live="polite">
          <h2 className={cn('title')}>
            {formatKoDay(selectedKey)}{' '}
            <span className={cn('dow', { sun: dow === 0, sat: dow === 6 })}>
              {DOW[dow]}요일
            </span>
          </h2>
        </div>
        <div className={cn('nav')}>
          <button
            type="button"
            className={cn('arrow')}
            disabled={!prevKey}
            aria-label={
              prevKey
                ? `${formatKoDay(prevKey)}, 이전 행사가 있는 날`
                : '이전 행사가 있는 날'
            }
            onClick={() => prevKey && onSelectDay(prevKey)}
          >
            <TimelineIcon name="back" size={16} />
          </button>
          <button
            type="button"
            className={cn('arrow')}
            disabled={!nextKey}
            aria-label={
              nextKey
                ? `${formatKoDay(nextKey)}, 다음 행사가 있는 날`
                : '다음 행사가 있는 날'
            }
            onClick={() => nextKey && onSelectDay(nextKey)}
          >
            <TimelineIcon name="chevron" size={16} />
          </button>
        </div>
      </div>
      {sections.length === 0 ? (
        <TimelineEmpty
          title="이날은 조건에 맞는 행사가 없어요"
          desc="달력에서 색이 칠해진 날짜를 눌러 보세요."
          actionLabel={action ? action.label : undefined}
          onAction={action ? () => onSelectDay(action.key) : undefined}
        />
      ) : (
        sections.map((section) => (
          <div key={section.id}>
            <h3 className={cn('group')}>{section.title}</h3>
            <div className={cn('list')}>
              {section.items.map((item) => {
                const priority = order < PRIORITY_COUNT;
                order += 1;
                return (
                  <EventCard
                    key={item.event.id}
                    item={item}
                    favorite={isFavorite(item.event.id)}
                    onToggleFavorite={onToggleFavorite}
                    priority={priority}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default DayPanel;
