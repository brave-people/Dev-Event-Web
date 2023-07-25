import React, { useState, useEffect, useContext } from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import classNames from 'classnames/bind';
import style from './ItemList.module.scss';
import { ThreeDots } from 'react-loader-spinner';
import { checkCondition, checkDate, checkEventDone, getEventEndDate } from 'lib/utils/eventUtil';
import EventFilter from 'components/features/filters/EventFilter';
import { Event, EventResponse } from 'model/event';
import List from '../list/list';
import { checkSearch } from 'lib/utils/searchUtil';
import { EventContext } from 'context/event';

const cn = classNames.bind(style);

type Props = {
  fallbackData: EventResponse[];
  jobGroups?: string;
  eventType?: string;
  location?: string;
  coast?: string;
}

function ItemList({ fallbackData, jobGroups, eventType, location, coast }: Props) {
  const [ totalCount, setTotalCount] = useState<number>(0);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);
  const { search, date } = useContext(EventContext);

  useEffect(() => {
    console.log(fallbackData)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      composeTotalCount();
    }, 300);
  }, [scheduledEvents, search, totalCount, date]);

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const composeTotalCount = () => {
    if (scheduledEvents && !isError && scheduledEvents.length !== 0) {
      const result = scheduledEvents?.reduce(function add(sum, currValue) {
        const filteredEvents = currValue.dev_event.filter(
          (item) =>
            !checkEventDone({
              endDate: getEventEndDate({
                start_date_time: item.start_date_time,
                end_date_time: item.end_date_time,
                use_start_date_time_yn: item.use_start_date_time_yn,
                use_end_date_time_yn: item.use_end_date_time_yn,
              }),
            }) && (checkCondition(jobGroups, eventType, location, coast, item))
              && checkSearch(search, item) && checkDate(date, item)
            ) 
        return sum + filteredEvents.length;
      }, 0);
      setTotalCount(result);
    }
  };

  return (
    <>
      <EventFilter />
      {isLoading ? (
        <div className={cn('null-container')}>
          <ThreeDots color="#479EF1" height={60} width={60} />
        </div>
      ) : (
      scheduledEvents && totalCount !== 0 ? (
        scheduledEvents.map((event: EventResponse, index) => {
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
                }) && (
                  checkCondition(jobGroups, eventType, location, coast, item)
                  && checkSearch(search, item) && checkDate(date, item)
                ) 
            );
          return lists.length > 0 ? (
            <div key={index}>
              <div className={cn('section__list')}>
                <div className={cn('section__list__title')}>
                  <span>{`${event.metadata.year}년 ${event.metadata.month}월`}</span>
                </div>
                <List data={lists} />
              </div>
              {index === scheduledEvents.length - 1 ? null : <hr className={cn('divider')} />}
            </div>
          ) : null;
        })
      ) : (
        <div className={cn('null-container')}>조건에 맞는 개발자 행사를 찾을 수 없습니다 📂</div>
      ))}
    </>
  )
}

export default ItemList;