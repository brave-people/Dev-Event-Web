import React from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';

const cn = classNames.bind(style);

const FilteredEventList = ({ filter }: { filter?: string }) => {
  const { scheduledEvents, isLoading, isError } = useScheduledEvents();

  return (
    <>
      {scheduledEvents &&
        scheduledEvents.map((event: EventResponse) => {
          return (
            <div className={cn('section__list')}>
              <span className={cn('section__header__title')}>#{filter}</span>
              {event &&
                event.dev_event
                  .filter((item) => {
                    return item.tags.some((item) => {
                      return item.tag_name === filter;
                    });
                  })
                  .map((item: Event) => {
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

export default FilteredEventList;
