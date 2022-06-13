import React from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { useRouter } from 'next/router';
import { useMonthlyEvent, useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';
import dayjs from 'dayjs';
import { Event } from 'model/event';
import { mutate } from 'swr';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';

const cn = classNames.bind(style);

const MonthlyEventList = () => {
  const router = useRouter();
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };
  const param = { year: Number(router.query.year), month: Number(router.query.month) };

  const { monthlyEvent, isLoading, isError } = useMonthlyEvent({
    param: param,
  });
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
      <section className={cn('section')}>
        <div className={cn('section__header')}>
          <span className={cn('section__header__title')}>{`${router.query.year}년 ${router.query.month}월`}</span>
        </div>
        <div className={cn('section__list')}>
          {monthlyEvent &&
            monthlyEvent.map((item: any) => {
              return (
                <div className={cn('wrapper')}>
                  {
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
                  }
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
};

MonthlyEventList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MonthlyEventList;
