import React, { useEffect, useState } from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, EventDate } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { DateUtil } from 'lib/utils/dateUtil';
import EventFilter from 'components/features/filters/EventFilter';

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
      <EventFilter />
    </>
  )
};
export default ScheduledEventList;
