import React, { useState } from 'react';
import Layout from 'component/common/layout';
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
import LoginModal from 'component/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const MonthlyEventList = () => {
  const router = useRouter();
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };
  const param = { year: Number(router.query.year), month: Number(router.query.month) };
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);

  const { monthlyEvent, isError } = useMonthlyEvent({
    param: param,
  });
  const { myEvent: myOldEvent, isError: isMyOldEventError } = useMyEvent(paramByOld, authContext.isLoggedIn);
  const { myEvent: myFutureEvent, isError: isMyFutureEventError } = useMyEvent(paramByFuture, authContext.isLoggedIn);

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }
  if (isMyOldEventError || isMyFutureEventError) {
    return <div className={cn('null-container')}>내 이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 && createDate.diff(todayDate, 'day') > -3 ? true : false;
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
    ga.event({
      action: 'web_event_관심행사추가버튼클릭',
      event_category: 'web_event',
      event_label: '관심행사',
    });
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
    ga.event({
      action: 'web_event_관심행사삭제버튼클릭',
      event_category: 'web_event',
      event_label: '관심행사',
    });
  };

  return (
    <>
      <div className={cn('section__list')}>
        <div className={cn('section__list__title')}>
          <span>{`${router.query.year}년 ${router.query.month}월`}</span>
          <div
            className={cn('reset-button')}
            onClick={(event) => {
              router.replace(`/events`);
            }}
          >
            <MdClose size={20} color="#676767" />
          </div>
        </div>
        {monthlyEvent && !isError ? (
          monthlyEvent.length !== 0 ? (
            monthlyEvent.map((item: any) => {
              return (
                <div className={cn('wrapper')}>
                  {
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
                  }
                </div>
              );
            })
          ) : (
            <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
          )
        ) : (
          <div className={cn('null-container')}>
            <ThreeDots color="#479EF1" height={60} width={60} />
          </div>
        )}
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

MonthlyEventList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MonthlyEventList;
