import React, { useEffect, useState } from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, EventDate } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import dayjs from 'dayjs';
import { ThreeDots } from 'react-loader-spinner';
import List from 'component/common/list/list';
import { DateUtil } from 'lib/utils/dateUtil';
import EventFilters from './EventFilters';
const cn = classNames.bind(style);

const ScheduledEventList = ({ fallbackData }: { fallbackData: EventResponse[] }) => {
  const [totalCount, setTotalCount] = useState(0);
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);

  useEffect(() => {
    composeTotalCount();
  }, [scheduledEvents]);

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const composeTotalCount = () => {
    if (scheduledEvents && !isError && scheduledEvents.length !== 0) {
      const result = scheduledEvents.reduce(function add(sum, currValue) {
        const filteredEvents = currValue.dev_event.filter(
          (item) =>
            checkEventDone({
              endDate: getEventEndDate({
                start_date_time: item.start_date_time,
                end_date_time: item.end_date_time,
                use_start_date_time_yn: item.use_start_date_time_yn,
                use_end_date_time_yn: item.use_end_date_time_yn,
              }),
            }) === false
        );
        return sum + filteredEvents.length;
      }, 0);
      setTotalCount(result);
    }
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

  return (
    <>
      <div className={cn('section__header')}>
        <span className={cn('section__header__desc')}>
          현재&nbsp;<span>{totalCount}개</span>의 개발자 행사 진행 중
        </span>
        <div className={cn('section__header__filters')}>
          <EventFilters />
        </div>
      </div>
      {scheduledEvents ? (
        scheduledEvents.length !== 0 ? (
          scheduledEvents
            // .filter((events) => !(dayjs().get('month') + 1 > events.metadata.month))
            .map((event: EventResponse, index) => {
              const lists =
                event &&
                event.dev_event.filter(
                  (item) =>
                    !checkEventDone({
                      endDate: getEventEndDate({
                        start_date_time: item.start_date_time,
                        end_date_time: item.end_date_time,
                        use_start_date_time_yn: item.use_start_date_time_yn,
                        use_end_date_time_yn: item.use_end_date_time_yn,
                      }),
                    })
                );

              return (
                <>
                  {index === 0 ? null : <hr className={cn('divider')} />}
                  <div className={cn('section__list')}>
                    <div className={cn('section__list__title')}>
                      <span>{`${event.metadata.year}년 ${event.metadata.month}월`}</span>
                    </div>
                    <List data={lists} />
                  </div>
                </>
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
    </>
  );
};
export default ScheduledEventList;
