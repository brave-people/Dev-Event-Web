import React, { useState } from 'react';
import style from 'styles/Myevent.module.scss';
import classNames from 'classnames/bind';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';
import { deleteMyEventApi } from 'lib/api/delete';
import { MyEvent, EventDate } from 'model/event';
import { mutate } from 'swr';
import { ThreeDots } from 'react-loader-spinner';
import * as ga from 'lib/utils/gTag';
import ShareModal from 'component/common/modal/ShareModal';
import { DateUtil } from 'lib/utils/dateUtil';
import { useEffect } from 'react';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const param = { filter: '' };
  const { myEvent, isError } = useMyEvent(param, true);
  const [futureEvent, setFutureEvent] = useState(new Array<MyEvent>());
  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [sharedEvent, setSharedEvent] = useState({});

  useEffect(() => {
    if (myEvent) {
      const filtered = myEvent.filter(
        (event) =>
          !checkEventDone({
            endDate: getEventEndDate({
              start_date_time: event.dev_event.start_date_time,
              end_date_time: event.dev_event.end_date_time,
              use_start_date_time_yn: event.dev_event.use_start_date_time_yn,
              use_end_date_time_yn: event.dev_event.use_end_date_time_yn,
            }),
          })
      );
      setFutureEvent(filtered);
    }
  }, [myEvent]);

  const handleShareInMobileSize = (data: Event) => {
    setSharedEvent(data);
    setShareModalIsOpen(true);
  };

  if (isError) {
    return <div className={cn('null-container')}>내 이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

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

  const deleteMyEvent = async ({ favoriteId }: { favoriteId: Number }) => {
    if (favoriteId && myEvent) {
      const filteredEvent = myEvent.filter((event) => event.favorite_id !== favoriteId);
      mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);
      await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
        favoriteId: favoriteId,
      });
    } else {
      alert('이벤트 정보가 없습니다!');
    }
    mutate([`/front/v1/favorite/events`, param]);
    ga.event({
      action: 'web_event_관심행사삭제버튼클릭',
      event_category: 'web_myevent',
      event_label: '관심행사',
    });
  };

  return (
    <div className={cn('tab__body')}>
      <section className={cn('section')}>
        <div className={cn('section__list')}>
          {myEvent && !isError && futureEvent ? (
            futureEvent.length !== 0 ? (
              <div className={cn('section__list__items')}>
                {futureEvent.map((event: MyEvent) => {
                  return (
                    <div className={cn('wrapper')}>
                      <Item
                        key={event.dev_event.id}
                        data={event.dev_event}
                        isEventDone={() => {
                          return false;
                        }}
                        isFavorite={() => {
                          return true;
                        }}
                        onClickFavorite={() => {
                          deleteMyEvent({ favoriteId: event.favorite_id });
                        }}
                        onClickShareInMobileSize={handleShareInMobileSize}
                      />
                    </div>
                  );
                })}{' '}
              </div>
            ) : (
              <div className={cn('null-container')}>내가 찜한 개발자 행사가 없어요 📂</div>
            )
          ) : (
            <div className={cn('null-container')}>
              <ThreeDots color="#479EF1" height={60} width={60} />
            </div>
          )}
        </div>
      </section>
      <ShareModal isOpen={shareModalIsOpen} onClick={() => setShareModalIsOpen(false)} data={sharedEvent}></ShareModal>
    </div>
  );
};

export default ScheduledEventList;
