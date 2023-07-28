import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import style from './ItemList.module.scss';
import { ThreeDots } from 'react-loader-spinner';
import { checkCondition, checkDate, checkEventDone, getEventEndDate } from 'lib/utils/eventUtil';
import EventFilter from 'components/features/filters/EventFilter';
import { EventResponse } from 'model/event';
import List from '../list/list';
import { checkSearch } from 'lib/utils/searchUtil';
import { EventContext } from 'context/event';
import EventNull from '../modal/EventNull';

const cn = classNames.bind(style);

type Props = {
  events: EventResponse[] | undefined;
  isError?: boolean;
  jobGroups?: string;
  eventType?: string;
  location?: string;
  coast?: string;
}

function ItemList({ events, isError, jobGroups, eventType, location, coast }: Props) {
  const [ totalCount, setTotalCount] = useState<number>(0);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const { search, date } = useContext(EventContext);


  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      composeTotalCount();
    }, 300);
  }, [search, totalCount, date]);

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const composeTotalCount = () => {
    if (events === undefined || events.length === 0){
      setTotalCount(0);
    } else {
      const result = events.reduce(function add(sum, currValue) {
        const filteredEvents = currValue.dev_event.filter((item) =>
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
      events && totalCount ? (
        events.map((event: EventResponse, index) => {
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
          return lists !== undefined && lists.length !== 0 ? (
            <div key={index}>
              <div className={cn('section__list')}>
                <div className={cn('section__list__title')}>
                  <span>{search !== undefined ? search : `${event.metadata.year}년 ${event.metadata.month}월`}</span>
                </div>
                <List data={lists} />
              </div>
              {index === events.length - 1 ? null : <hr className={cn('divider')} />}
            </div>
          ) : null;
        })
      ) : (
        <div>
          <EventNull
            search={search}
          />
        </div>
      ))}
    </>
  )
}

export default ItemList;