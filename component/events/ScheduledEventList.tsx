import React from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';
import { createMyEventApi } from 'lib/api/post';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const { scheduledEvents, isLoading, isError } = useScheduledEvents();

  const createMyEvent = async ({ eventId }: { eventId: String }) => {
    const result = await createMyEventApi(`/front/v1/favorite/events${eventId}`, {
      eventId: Number(eventId),
    });
  };
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
                      <Item
                        key={item.id}
                        data={item}
                        isFavorite={true}
                        onClickFavorite={() => {
                          createMyEvent({ eventId: item.id });
                        }}
                      />
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
