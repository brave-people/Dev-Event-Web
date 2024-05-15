import React, { useState } from 'react';
import classNames from 'classnames/bind';
import style from 'components/common/item/List.module.scss';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'components/common/item/Item';
import dayjs from 'dayjs';
import { Event, EventDate } from 'model/event';
import { mutate } from 'swr';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import LoginModal from 'components/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import * as ga from 'lib/utils/gTag';
import { DateUtil } from 'lib/utils/dateUtil';

const cn = classNames.bind(style);

type Props = {
  data: Event[];
  parentLast: boolean;
};

const List = ({ data, parentLast }: Props) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const param = { filter: '' };
  const { myEvent } = useMyEvent(param, authContext.isLoggedIn);

  const checkEventNew = ({ createdDate }: { createdDate: string }) => {
    const todayDate = dayjs();
    const createDate = dayjs(createdDate);

    return createDate.diff(todayDate, 'day') < 1 &&
      createDate.diff(todayDate, 'day') > -1
      ? true
      : false;
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
        const filteredEvent = myEvent.concat({
          favorite_id: favoriteId,
          dev_event: item,
        });
        mutate([`/front/v1/favorite/events`, param], filteredEvent, false);
        const result = await createMyEvent({ eventId: item.id });
      } else {
        const filteredEvent = myEvent.filter(
          (event) => event.favorite_id !== favoriteId
        );
        mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);

        const result = await deleteMyEvent({ favoriteId: favoriteId });
      }
      mutate([`/front/v1/favorite/events`, param]);
    }
  };

  const createMyEvent = async ({ eventId }: { eventId: String }) => {
    if (eventId) {
      const result = await createMyEventApi(
        `/front/v1/favorite/events/${eventId}`,
        {
          eventId: Number(eventId),
        }
      );
      if (
        result.status_code === 200 &&
        result.status === 'FRONT_FAVORITE_201_01'
      ) {
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
      const result = await deleteMyEventApi(
        `/front/v1/favorite/events/${favoriteId}`,
        {
          favoriteId: favoriteId,
        }
      );
      if (
        result.status_code === 200 &&
        result.status === 'FRONT_FAVORITE_200_01'
      ) {
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
      {data.map((item: Event, index: number) => {
        const isLast = index === data.length - 1;
        return (
          <Item
            key={index}
            childLast={isLast}
            parentLast={parentLast}
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
                return getFavoriteId({id: item.id}) !== 0;
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
          />
        );
      })}
      <div className={cn('skeleton')} />
      <LoginModal
        isOpen={loginModalIsOpen}
        onClose={() => setLoginModalIsOpen(false)}
      ></LoginModal>
    </div>
  );
};

export default List;
