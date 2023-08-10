import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import style from 'components/common/item/ItemList.module.scss'
import { ThreeDots } from 'react-loader-spinner';
import { checkCondition, checkEventDone, getEventEndDate } from 'lib/utils/eventUtil';
import EventFilter from 'components/features/filters/EventFilter';
import { EventResponse } from 'model/event';
import List from 'components/common/item/List';
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
  search?: string;
}

function ItemList({ events, isError, jobGroups, eventType, location, coast, search }: Props) {
  const [ totalCount, setTotalCount] = useState<number>(0);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const { date } = useContext(EventContext);
  let eventCount = 0;

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
    if (events === undefined || events.length === 0) {
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
            }) && (checkCondition(jobGroups, eventType, location, coast, search, item) || checkSearch(search, item))
            ) 
        return sum + filteredEvents.length;
      }, 0);
      setTotalCount(result);
    }
  };

  return (
    <>
      <EventFilter />
      {search && (
        <div className={cn('search__header')}>
          <span className={cn('list__title')}>{search}</span>
        </div>
      )}
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
                }) && (checkCondition(jobGroups, eventType, location, coast, search, item) || checkSearch(search, item)) 
            );
          eventCount += lists.length;
          const isLast = eventCount === totalCount ? true : false;
          return  (
            <div key={index}>
              {lists !== undefined && lists.length !== 0
                ? ( <div className={cn(`${search ? 'search__list' : 'section__list'}`)}>
                      {search === undefined &&
                       <div className={cn('list__title')}>
                        <span>{search || `${event.metadata.year}년 ${event.metadata.month}월`}</span>
                      </div>}
                      <List
                        data={lists}
                        parentLast={search ? isLast : false}
                      />
                    </div>
                ) : null
              }
            </div>
        )})
      ) : (
        <div>
          <EventNull />
        </div>
      ))}
    </>
  )
}

export default ItemList;