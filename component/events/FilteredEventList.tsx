import React, { useEffect, useState } from 'react';
import { useMyEvent, useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Item from 'component/common/item/Item';
import { createMyEventApi } from 'lib/api/post';
import dayjs from 'dayjs';
import { mutate } from 'swr';
import { deleteMyEventApi } from 'lib/api/delete';
import { AuthContext } from 'context/auth';
import LoginModal from 'component/common/modal/LoginModal';
import router from 'next/router';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';

const cn = classNames.bind(style);

const FilteredEventList = ({ filter, type }: { filter?: string; type?: string }) => {
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };
  const [filteredEvents, setFilteredEvents] = useState(Array<Event>(0));
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);

  const { scheduledEvents, isLoading, isError } = useScheduledEvents();
  const { myEvent: myOldEvent, isError: isMyOldEventError } = useMyEvent(paramByOld, authContext.isLoggedIn);
  const { myEvent: myFutureEvent, isError: isMyFutureEventError } = useMyEvent(paramByFuture, authContext.isLoggedIn);

  useEffect(() => {
    let events = Array<Event>(0);
    scheduledEvents &&
      scheduledEvents.map((event: EventResponse) => {
        events.push(...event.dev_event);
      });

    if (type === 'tag') {
      setFilteredEvents(events.filter((item) => filterByTag(item)));
    }
    if (type === 'search') {
      setFilteredEvents(events.filter((item) => filterBySearch(item)));
    }
  }, [filter]);

  const filterByTag = (item: Event) => {
    return item.tags.some((item) => {
      return item.tag_name === filter;
    });
  };

  const filterBySearch = (item: Event) => {
    return item.title.includes(String(filter));
  };

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 && createDate.diff(todayDate, 'day') > -2 ? true : false;
  };

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    const todayDate = dayjs();
    const eventDate = dayjs(endDate);
    return eventDate.diff(todayDate, 'day') > 0 ? false : true;
  };

  const onClickFavoriteOldEvent = async ({ item }: { item: Event }) => {
    if (myOldEvent) {
      const favoriteId = getFavoriteOldEventId({ id: item.id });

      if (favoriteId === 0) {
        const filteredEvent = myOldEvent.concat({ favorite_id: favoriteId, dev_event: item });
        mutate([`/front/v1/favorite/events`, paramByOld], filteredEvent, false);
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const filteredEvent = myOldEvent.filter((event) => event.favorite_id !== favoriteId);
        mutate([`/front/v1/favorite/events`, paramByOld], [...filteredEvent], false);

        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
      mutate([`/front/v1/favorite/events`, paramByOld]);
    }
  };

  const onClickFavoriteFutureEvent = async ({ item }: { item: Event }) => {
    if (myFutureEvent) {
      const favoriteId = getFavoriteFutureEventId({ id: item.id });

      if (favoriteId === 0) {
        const filteredEvent = myFutureEvent.concat({ favorite_id: favoriteId, dev_event: item });
        mutate([`/front/v1/favorite/events`, paramByFuture], filteredEvent, false);
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const filteredEvent = myFutureEvent.filter((event) => event.favorite_id !== favoriteId);
        mutate([`/front/v1/favorite/events`, paramByFuture], [...filteredEvent], false);

        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
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
    if (eventId) {
      const result = await createMyEventApi(`/front/v1/favorite/events/${eventId}`, {
        eventId: Number(eventId),
      });
      if (result.status_code === 200 && result.status === 'FRONT_FAVORITE_201_01') {
        return 'SUCCESS';
      }
    } else {
      alert('이벤트 정보가 없습니다!');
    }
  };

  const deleteMyEvent = async ({ favoriteId }: { favoriteId: number }) => {
    if (favoriteId) {
      const result = await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
        favoriteId: favoriteId,
      });
      if (result.status_code === 200 && result.status === 'FRONT_FAVORITE_200_01') {
        return 'SUCCESS';
      }
    } else {
      alert('이벤트 정보가 없습니다!');
    }
  };

  return (
    <>
      <div className={cn('section__list')}>
        <div className={cn('section__list__title')}>
          <span>#{filter}</span>
          <div
            className={cn('reset-button')}
            onClick={(event) => {
              router.replace(`/events`);
            }}
          >
            <MdClose size={20} color="#676767" />
          </div>
        </div>
        {filteredEvents ? (
          filteredEvents.length !== 0 ? (
            filteredEvents
              .sort((a, b) => +new Date(b.end_date_time) - +new Date(a.end_date_time))
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
              })
          ) : (
            <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
          )
        ) : (
          <div className={cn('null-container')}>
            <ThreeDots color="#479EF1" height={60} width={60} />;
          </div>
        )}
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export default FilteredEventList;
