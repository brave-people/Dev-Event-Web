import React, { useState } from 'react';
import { useMyEvent, useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import { mutate } from 'swr';
import dayjs from 'dayjs';
import { AuthContext } from 'context/auth';
import LoginModal from 'component/common/modal/LoginModal';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);

  const { scheduledEvents, isLoading, isError } = useScheduledEvents();
  const {
    myEvent: myOldEvent,
    isLoading: isMyOldEventLoading,
    isError: isMyOldEventError,
  } = useMyEvent(paramByOld, authContext.isLoggedIn);
  const {
    myEvent: myFutureEvent,
    isLoading: isMyFutureEventLoading,
    isError: isMyFutureEventError,
  } = useMyEvent(paramByFuture, authContext.isLoggedIn);

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 && createDate.diff(todayDate, 'day') > -3 ? true : false;
  };

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    const todayDate = dayjs();
    const eventDate = dayjs(endDate);
    return eventDate.diff(todayDate, 'day') > 0 ||
      (eventDate.diff(todayDate, 'day') === 0 && eventDate.get('day') === todayDate.get('day'))
      ? false
      : true;
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
      {scheduledEvents && scheduledEvents.length !== 0 ? (
        scheduledEvents.map((event: EventResponse, index) => {
          return (
            <>
              {index === 0 ? null : <hr className={cn('divider')} />}
              <div className={cn('section__list')}>
                <div className={cn('section__list__title')}>
                  <span>{`${event.metadata.year}년 ${event.metadata.month}월`}</span>
                </div>
                {event &&
                  event.dev_event
                    .filter((item) => checkEventDone({ endDate: item.end_date_time }) === false)
                    .concat(event.dev_event.filter((item) => checkEventDone({ endDate: item.end_date_time }) === true))
                    .map((item: Event) => {
                      return (
                        <div className={cn('wrapper')}>
                          <Item
                            key={item.id}
                            data={item}
                            isEventNew={() => {
                              return checkEventNew({ createdDate: item.create_date_time });
                            }}
                            isEventDone={() => {
                              return checkEventDone({ endDate: item.end_date_time });
                            }}
                            isFavorite={({ filter }: { filter: string }) => {
                              if (authContext.isLoggedIn) {
                                if (filter === 'OLD') {
                                  return getFavoriteOldEventId({ id: item.id }) !== 0 ? true : false;
                                } else {
                                  return getFavoriteFutureEventId({ id: item.id }) !== 0 ? true : false;
                                }
                              } else {
                                return false;
                              }
                            }}
                            onClickFavorite={({ filter }: { filter: string }) => {
                              if (authContext.isLoggedIn) {
                                if (filter === 'OLD') {
                                  return onClickFavoriteOldEvent({ item: item });
                                } else {
                                  return onClickFavoriteFutureEvent({ item: item });
                                }
                              } else {
                                setLoginModalIsOpen(true);
                              }
                            }}
                          />
                        </div>
                      );
                    })}
              </div>
              <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
            </>
          );
        })
      ) : (
        <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
      )}
    </>
  );
};

export default ScheduledEventList;
