import React from 'react';
import { useMyEvent, useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import { mutate } from 'swr';
import dayjs from 'dayjs';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };

  const { scheduledEvents, isLoading, isError } = useScheduledEvents();
  const { myEvent: myOldEvent, isLoading: isMyOldEventLoading, isError: isMyOldEventError } = useMyEvent(paramByOld);
  const {
    myEvent: myFutureEvent,
    isLoading: isMyFutureEventLoading,
    isError: isMyFutureEventError,
  } = useMyEvent(paramByFuture);

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    const todayDate = dayjs();
    const eventDate = dayjs(endDate);
    return eventDate.diff(todayDate, 'day') > 0 ? false : true;
  };

  const onClickFavoriteOldEvent = async ({ item }: { item: Event }) => {
    if (myOldEvent) {
      const favoriteId = getFavoriteOldEventId({ id: item.id });

      if (favoriteId === 0) {
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
      mutate(`/front/v1/events/current`);
      mutate([`/front/v1/favorite/events`, paramByOld]);
    }
  };

  const onClickFavoriteFutureEvent = async ({ item }: { item: Event }) => {
    if (myFutureEvent) {
      const favoriteId = getFavoriteFutureEventId({ id: item.id });

      if (favoriteId === 0) {
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
      mutate(`/front/v1/events/current`);
      mutate([`/front/v1/favorite/events`, paramByFuture]);
    }
  };

  const getFavoriteOldEventId = ({ id }: { id: string }) => {
    if (myOldEvent) {
      const result = myOldEvent.find((item) => {
        return item.dev_event.id === id;
      });
      return result ? result.favorite_id : 0;
    }

    return 0;
  };

  const getFavoriteFutureEventId = ({ id }: { id: string }) => {
    if (myFutureEvent) {
      const result = myFutureEvent.find((item) => {
        return item.dev_event.id === id;
      });
      return result ? result.favorite_id : 0;
    }
    return 0;
  };

  const createMyEvent = async ({ eventId }: { eventId: String }) => {
    const result = await createMyEventApi(`/front/v1/favorite/events/${eventId}`, {
      eventId: Number(eventId),
    });
  };

  const deleteMyEvent = async ({ favoriteId }: { favoriteId: number }) => {
    const result = await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
      favoriteId: favoriteId,
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
                        isEventDone={() => {
                          return checkEventDone({ endDate: item.end_date_time });
                        }}
                        isFavorite={({ filter }: { filter: string }) => {
                          if (filter === 'OLD') {
                            return getFavoriteOldEventId({ id: item.id }) !== 0 ? true : false;
                          } else {
                            return getFavoriteFutureEventId({ id: item.id }) !== 0 ? true : false;
                          }
                        }}
                        onClickFavorite={({ filter }: { filter: string }) => {
                          if (filter === 'OLD') {
                            return onClickFavoriteOldEvent({ item: item });
                          } else {
                            return onClickFavoriteFutureEvent({ item: item });
                          }
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
