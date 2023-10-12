import React, { useState, useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import style from 'components/common/item/ItemList.module.scss'
import { ThreeDots } from 'react-loader-spinner';
import { checkCondition, checkEventDone, getEventEndDate } from 'lib/utils/eventUtil';
import { Event, EventResponse } from 'model/event';
import List from 'components/common/item/List';
import { checkSearch } from 'lib/utils/searchUtil';
import EventNull from '../modal/EventNull';
import { WindowContext } from 'context/window';

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
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ searchRes, setSearchRes] = useState<Event[] | undefined>();undefined
  const { modalState } = useContext(WindowContext);
  let eventCount = 0;

  useEffect(() => {
    setIsLoading(true);
    setEventList();
    setTimeout(() => {
      setIsLoading(false);
      composeTotalCount();
    }, 300);
    return () => {
      setIsLoading(false);
      setSearchRes(undefined);
    }
  }, []);
  
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

  const setEventList = () => {
    let res: Event[] = [];
    events && events.map((event: EventResponse) => {
      event && event.dev_event.filter((item) => {
          if (!checkEventDone({
              endDate: getEventEndDate({
                start_date_time: item.start_date_time,
                end_date_time: item.end_date_time,
                use_start_date_time_yn: item.use_start_date_time_yn,
                use_end_date_time_yn: item.use_end_date_time_yn,
              }),
            }) && (checkCondition(jobGroups, eventType, location, coast, search, item) || checkSearch(search, item))) {
              res.push(item)
            }
        })
    })
    setSearchRes(res)
  }

  if (isError) {
    return (<div className={cn('null-container')}>
      이벤트 정보를 불러오는데 문제가 발생했습니다!
    </div>)
  }
  return (
    <>
      {search && modalState.currentModal === 0 && searchRes && (
        <>
          <div className={cn('search__header')}>
            <span className={cn('list__title')}>{`${search}`}</span>
            <span className={cn('total__count')}>{totalCount}</span>
          </div>
          <div className={cn('search__list')}>
            <List
                data={searchRes}
                parentLast={true}
              />
          </div>
        </>
      )}
      {search && modalState.currentModal === 1 && searchRes && (
      <>
        <div className={cn('search__header__modal')}>
          <div className={cn('list__title')}>`{`${search}`}` 검색결과</div>
          <div className={cn('total__count')}>{totalCount}개</div>
        </div>
        <div className={cn('search__list')}>
          <List
            data={searchRes}
            parentLast={false}
          />
        </div>
      </>
      )}
      {isLoading ? (
        <div className={cn('null-container')}>
          <ThreeDots color="#479EF1" height={60} width={60} />
        </div>
      ) : ( 
      events && totalCount !== 0 ? (
        events.map((event: EventResponse, index) => {
          if (!search) {
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
            )
          }})
      ) : (
        <EventNull />
      ))}
    </>
  )
}

export default ItemList;