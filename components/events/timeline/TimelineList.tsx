import { Fragment, memo } from 'react';
import classNames from 'classnames/bind';

import EventCard from 'components/events/timeline/EventCard';
import { DayGroup } from 'lib/utils/timeline/groupByDay';
import { DOW, formatMd, weekdayOf } from 'lib/utils/timeline/kst';
import { Event } from 'model/event';

import style from './TimelineList.module.scss';

const cn = classNames.bind(style);

export const dayElementId = (key: string): string => `d-${key}`;

const headingId = (key: string): string => `dh-${key}`;

const monthOf = (key: string): number => Number(key.slice(5, 7));

interface TimelineListProps {
  groups: DayGroup[];
  todayKey: string;
  isFavorite: (eventId: string) => boolean;
  onToggleFavorite: (event: Event) => void;
  eagerCount?: number;
  endnote?: boolean;
}

function TimelineList({
  groups,
  todayKey,
  isFavorite,
  onToggleFavorite,
  eagerCount = 4,
  endnote = false,
}: TimelineListProps) {
  let order = 0;

  return (
    <div className={cn('list')}>
      {groups.map((group, index) => {
        const weekday = weekdayOf(group.key);
        const showMonth =
          index > 0 && monthOf(groups[index - 1].key) !== monthOf(group.key);

        return (
          <Fragment key={group.key}>
            {showMonth && (
              <h2 className={cn('month')}>{`${monthOf(group.key)}월`}</h2>
            )}
            <section
              id={dayElementId(group.key)}
              data-key={group.key}
              aria-labelledby={headingId(group.key)}
              className={cn('day', { 'is-past': group.key < todayKey })}
            >
              <div className={cn('rail')}>
                <div className={cn('head')}>
                  <h3 id={headingId(group.key)} className={cn('title')}>
                    <b className={cn('date')}>{formatMd(group.key)}</b>
                    <span
                      className={cn('dow', {
                        sun: weekday === 0,
                        sat: weekday === 6,
                      })}
                    >
                      {`${DOW[weekday]}요일`}
                    </span>
                  </h3>
                  <small
                    className={cn('count')}
                  >{`${group.items.length}건`}</small>
                </div>
              </div>
              <div className={cn('items')}>
                {group.items.map((item) => {
                  const priority = order < eagerCount;
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
            </section>
          </Fragment>
        );
      })}
      {endnote && groups.length > 0 && (
        <p className={cn('endnote')}>여기까지가 지금 등록된 행사예요.</p>
      )}
    </div>
  );
}

export default memo(TimelineList);
