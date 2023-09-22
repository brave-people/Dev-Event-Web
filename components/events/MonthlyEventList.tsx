import style from 'components/common/item/ItemList.module.scss';
import List from 'components/common/item/List';
import EventNull from 'components/common/modal/EventNull';
import EventFilter from 'components/features/filters/EventFilter';
import { EventContext } from 'context/event';
import { Calender } from 'model/calender';
import { Event } from 'model/event';
import React, { useState, useContext, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  events: Event[];
  date: Calender;
};

function MonthlyEventList({ events, date }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { search } = useContext(EventContext);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [search, date]);

  return (
    <>
      <EventFilter />
      {isLoading ? (
        <div className={cn('null-container')}>
          <ThreeDots color="#479EF1" height={60} width={60} />
        </div>
      ) : events !== undefined && events.length !== 0 ? (
        <div className={cn('section__list')}>
          <div className={cn('list__title')}>
            <span>{search !== undefined ? search : `${date.year}년 ${date.month}월`}</span>
          </div>
          <List data={events} parentLast={true} />
        </div>
      ) : (
        <div>
          <EventNull />
        </div>
      )}
    </>
  );
}

export default MonthlyEventList;
