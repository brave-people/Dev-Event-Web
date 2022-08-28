import React, { useEffect, useState } from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import router from 'next/router';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import List from 'component/common/list/list';
import EventFilters from './EventFilters';

const cn = classNames.bind(style);

const FilteredEventList = ({ filter, type }: { filter?: string; type?: string }) => {
  const [filteredEvents, setFilteredEvents] = useState(Array<Event>(0));
  const { scheduledEvents, isError } = useScheduledEvents();

  useEffect(() => {
    let events = Array<Event>(0);

    scheduledEvents &&
      scheduledEvents.map((event: EventResponse) => {
        events.push(...event.dev_event);
      });

    if (type === 'tag') {
      setFilteredEvents(events.filter((item) => filterByTag(item)));
    }
    if (type === 'search') {
      setFilteredEvents(events.filter((item) => filterBySearch(item)));
    }
  }, [scheduledEvents, filter]);

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const filterByTag = (item: Event) => {
    return item.tags.some((item) => {
      return item.tag_name === filter;
    });
  };

  const filterBySearch = (item: Event) => {
    return item.title.includes(String(filter));
  };

  return (
    <>
      <div className={cn('section__header')}>
        <span className={cn('section__header__desc')}>
          <span>검색결과</span>
        </span>
        <div className={cn('section__header__filters')}>
          <EventFilters />
        </div>
      </div>
      <div className={cn('section__list')}>
        <div className={cn('section__list__title')}>
          <span>#{filter}</span>
          <div
            className={cn('reset-button')}
            onClick={(event) => {
              router.replace(`/events`);
            }}
          >
            <MdClose size={20} color="#676767" />
          </div>
        </div>
        {filteredEvents && !isError ? (
          filteredEvents.length !== 0 ? (
            <List data={filteredEvents.sort((a, b) => +new Date(b.end_date_time) - +new Date(a.end_date_time))} />
          ) : (
            <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
          )
        ) : (
          <div className={cn('null-container')}>
            <ThreeDots color="#479EF1" height={60} width={60} />
          </div>
        )}
      </div>
    </>
  );
};

export default FilteredEventList;
