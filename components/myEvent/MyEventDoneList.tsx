import Item from 'components/common/item/Item';
import { deleteMyEventApi } from 'lib/api/delete';
import { useMyEvent } from 'lib/hooks/useSWR';
import { DateUtil } from 'lib/utils/dateUtil';
import * as ga from 'lib/utils/gTag';
import { MyEvent, EventDate } from 'model/event';
import style from 'styles/MyEvent.module.scss';
import { mutate } from 'swr';
import React, { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/router';
import MyEventEmpty from './MyEventEmpty';

const cn = classNames.bind(style);

const MyEventDoneList = () => {
  const param = { filter: '' };
  const { myEvent, isLoading, isError } = useMyEvent(param, true);
  const [oldEvent, setOldEvent] = useState(new Array<MyEvent>());

  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [sharedEvent, setSharedEvent] = useState({});

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

  useEffect(() => {
    if (myEvent) {
      const filtered = myEvent.filter((event) =>
        checkEventDone({
          endDate: getEventEndDate({
            start_date_time: event.dev_event.start_date_time,
            end_date_time: event.dev_event.end_date_time,
            use_start_date_time_yn: event.dev_event.use_start_date_time_yn,
            use_end_date_time_yn: event.dev_event.use_end_date_time_yn,
          }),
        })
      );
      setOldEvent(filtered);
    }
  }, [myEvent]);

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    return DateUtil.isDone(endDate);
  };

  if (isError) {
    return (
      <div className={cn('null-container')}>
        내 이벤트 정보를 불러오는데 문제가 발생했습니다!
      </div>
    );
  }

  const deleteMyEvent = async ({ favoriteId }: { favoriteId: number }) => {
    if (favoriteId && myEvent) {
      const filteredEvent = myEvent.filter(
        (event) => event.favorite_id !== favoriteId
      );
      mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);

      const result = await deleteMyEventApi(
        `/front/v1/favorite/events/${favoriteId}`,
        {
          favoriteId: favoriteId,
        }
      );
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

  const router = useRouter();
  const [tabMenu, setTabMenu] = useState({
    ongoing: false,
    done: false,
  });

  useEffect(() => {
    setTabMenu({
      ongoing: router.query.tab === 'ongoing' || router.query.tab == null,
      done: router.query.tab === 'done',
    });
  }, [router.query.tab]);

  return (
    <>
      <div className={cn('section__list')}>
        <div className={cn('wrapper')}>
          <div className={cn('wrapper__status')}>
            <div className={cn('wrapper__status__count')}>
              {oldEvent.length}개
            </div>
            <div
              className={cn('wrapper__status__type')}
              onClick={() => {
                setTabMenu({ ongoing: true, done: false });
                router.push('/myevent');
                ga.event({
                  action: 'web_event_진행중인행사탭클릭',
                  event_category: 'web_myevent',
                  event_label: '내이벤트',
                });
              }}
            >
              <Image
                className={cn('check_box_done')}
                src={'/icon/check_box.svg'}
                alt="done event"
                priority={true}
                width={18}
                height={18}
              />
              <div className={cn('wrapper__status__txt')}>진행중인 행사 보기</div>
            </div>
          </div>
        </div>

        {/* 로딩중 */}
        {!myEvent && !isError && oldEvent && (
          <div className={cn('null-container')}>
            <ThreeDots color="#479EF1" height={60} width={60} />
          </div>
        )}

        {/* 행사 카드가 없을떄 */}
        {myEvent && oldEvent && oldEvent.length === 0 && (
          <div className={cn('emptyevent-container')}>
            <MyEventEmpty />
          </div>
        )}

        {/* 행사 카드 */}
        <div className={cn('list')}>
          {myEvent &&
            !isError &&
            oldEvent &&
            oldEvent.map((event: MyEvent) => {
              return (
                <>
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
                </>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default MyEventDoneList;
