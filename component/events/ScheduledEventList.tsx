import React from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const { scheduledEvents, isLoading, isError } = useScheduledEvents();

  return (
    <>
      {scheduledEvents &&
        scheduledEvents.map((event: EventResponse) => {
          return (
            <div className={cn('section__list')}>
              <span className={cn('section__header__title')}>
                {`${event.metadata.year}년 ${event.metadata.month}월`}
              </span>
              {event &&
                event.dev_event.map((item: Event) => {
                  return (
                    <div className={cn('wrapper')}>
                      <Item key={item.id} data={item} isSelected={false} />
                    </div>
                  );
                })}
            </div>
          );
        })}
    </>
  );
};

export default ScheduledEventList;
