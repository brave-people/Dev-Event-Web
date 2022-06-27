import React from 'react';
import style from 'styles/Myevent.module.scss';
import classNames from 'classnames/bind';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';
import { deleteMyEventApi } from 'lib/api/delete';
import { MyEvent } from 'model/event';
import { mutate } from 'swr';
import { ThreeDots } from 'react-loader-spinner';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const param = { filter: 'FUTURE' };
  const { myEvent, isLoading, isError } = useMyEvent(param, true);

  const deleteMyEvent = async ({ favoriteId }: { favoriteId: Number }) => {
    if (favoriteId && myEvent) {
      const filteredEvent = myEvent.filter((event) => event.favorite_id !== favoriteId);
      mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);

      const result = await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
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
          {myEvent ? (
            myEvent.length !== 0 ? (
              myEvent.map((event: MyEvent) => {
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
                    />
                  </div>
                );
              })
            ) : (
              <div className={cn('null-container')}>내가 찜한 개발자 행사가 없어요 📂</div>
            )
          ) : (
            <div className={cn('null-container')}>
              <ThreeDots color="#479EF1" height={60} width={60} />;
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ScheduledEventList;
