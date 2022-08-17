import React, { useState } from 'react';
import classNames from 'classnames/bind';
import style from 'component/common/list/list.module.scss';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';
import dayjs from 'dayjs';
import { Event } from 'model/event';
import { mutate } from 'swr';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import LoginModal from 'component/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import * as ga from 'lib/utils/gTag';
import ShareModal from 'component/common/modal/ShareModal';

const cn = classNames.bind(style);

const List = ({ data }: { data: any }) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [sharedEvent, setSharedEvent] = useState({});
  const paramByOld = { filter: 'OLD' };
  const paramByFuture = { filter: 'FUTURE' };
  const { myEvent: myOldEvent, isError: isMyOldEventError } = useMyEvent(paramByOld, authContext.isLoggedIn);
  const { myEvent: myFutureEvent, isError: isMyFutureEventError } = useMyEvent(paramByFuture, authContext.isLoggedIn);

  const handleShareInMobileSize = (data: Event) => {
    setSharedEvent(data);
    setShareModalIsOpen(true);
  };

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 && createDate.diff(todayDate, 'day') > -1 ? true : false;
  };
  const checkEventDone = ({ endDate }: { endDate: string }) => {
    const todayDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    const eventDate = dayjs(endDate).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    return eventDate.diff(todayDate, 'day') > 0 ||
      (eventDate.diff(todayDate, 'day') === 0 && eventDate.get('day') === todayDate.get('day'))
      ? false
      : true;
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
    <div className={cn('list')}>
      {data.map((item: Event) => {
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
              onClickShareInMobileSize={handleShareInMobileSize}
            />
          </div>
        );
      })}
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
      <ShareModal isOpen={shareModalIsOpen} onClick={() => setShareModalIsOpen(false)} data={sharedEvent}></ShareModal>
    </div>
  );
};

export default List;
