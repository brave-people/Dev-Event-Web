import React, { useState } from 'react';
import classNames from 'classnames/bind';
import style from 'component/common/list/list.module.scss';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';
import dayjs from 'dayjs';
import { Event, EventDate } from 'model/event';
import { mutate } from 'swr';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import LoginModal from 'component/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import * as ga from 'lib/utils/gTag';
import ShareModal from 'component/common/modal/ShareModal';
import { DateUtil } from 'lib/utils/dateUtil';

const cn = classNames.bind(style);

const List = ({ data }: { data: any }) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [sharedEvent, setSharedEvent] = useState({});
  const param = { filter: '' };
  const { myEvent, isError } = useMyEvent(param, authContext.isLoggedIn);

  const handleShareInMobileSize = (data: Event) => {
    setSharedEvent(data);
    setShareModalIsOpen(true);
  };

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 && createDate.diff(todayDate, 'day') > -1 ? true : false;
  };

  const getEventEndDate = (EventDate: EventDate) => {
    if (EventDate.use_start_date_time_yn && EventDate.use_end_date_time_yn) {
      return EventDate.end_date_time;
    }
    if (EventDate.use_start_date_time_yn && !EventDate.use_end_date_time_yn) {
      return EventDate.start_date_time;
    }
    if (!EventDate.use_start_date_time_yn && EventDate.use_end_date_time_yn) {
      return EventDate.end_date_time;
    }
    return EventDate.end_date_time;
  };

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    return DateUtil.isDone(endDate);
  };

  const getFavoriteId = ({ id }: { id: string }) => {
    if (myEvent) {
      const result = myEvent.find((item) => {
        return item.dev_event.id === id;
      });
      return result ? result.favorite_id : 0;
    }

    return 0;
  };

  const onClickFavorite = async ({ item }: { item: Event }) => {
    if (myEvent) {
      const favoriteId = getFavoriteId({ id: item.id });

      if (favoriteId === 0) {
        const filteredEvent = myEvent.concat({ favorite_id: favoriteId, dev_event: item });
        mutate([`/front/v1/favorite/events`, param], filteredEvent, false);
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const filteredEvent = myEvent.filter((event) => event.favorite_id !== favoriteId);
        mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);

        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
      mutate([`/front/v1/favorite/events`, param]);
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
                return checkEventDone({
                  endDate: getEventEndDate({
                    start_date_time: item.start_date_time,
                    end_date_time: item.end_date_time,
                    use_start_date_time_yn: item.use_start_date_time_yn,
                    use_end_date_time_yn: item.use_end_date_time_yn,
                  }),
                });
              }}
              isFavorite={() => {
                if (authContext.isLoggedIn) {
                  return getFavoriteId({ id: item.id }) !== 0 ? true : false;
                }
                return false;
              }}
              onClickFavorite={() => {
                if (authContext.isLoggedIn) {
                  return onClickFavorite({ item: item });
                } else {
                  setLoginModalIsOpen(true);
                }
              }}
              onClickShareInMobileSize={handleShareInMobileSize}
            />
          </div>
        );
      })}
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
      <ShareModal isOpen={shareModalIsOpen} onClick={() => setShareModalIsOpen(false)} data={sharedEvent}></ShareModal>
    </div>
  );
};

export default List;
