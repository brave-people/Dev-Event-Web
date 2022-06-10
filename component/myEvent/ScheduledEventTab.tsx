import React from 'react';
import style from 'styles/myevent.module.scss';
import classNames from 'classnames/bind';
import Item from 'component/common/item/Item';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';

const cn = classNames.bind(style);

const ScheduledEventTab = () => {
  const events = [
    {
      cover_image_link: 'string',
      description: '이벤트 세부 내용',
      display_sequence: 0,
      end_date_time: '2021-12-12 15:30',
      end_day_week: 'string',
      end_time: 'string',
      event_link: 'https://www.naver.com/',
      id: 0,
      organizer: '주최자',
      start_date_time: '2021-12-12 15:30',
      start_day_week: 'string',
      start_time: 'string',
      tags: [
        {
          id: 0,
          tag_name: 'string',
        },
      ],
      title: '이벤트 이름',
    },
  ];
  return (
    <div className={cn('tab__body')}>
      <article className={cn('today-event')}>
        <div className={cn('today-event__list')}>
          {events.map((event: any) => {
            return <div className={cn('wrapper')}>{/* <Item key={event.id} data={event} /> */}</div>;
          })}
        </div>
      </article>
      <section className={cn('section')}>
        <div className={cn('section__header')}>
          <span className={cn('section__header__title')}>2022년 3월</span>
        </div>
        <div className={cn('section__list')}>
          {events.map((event: any) => {
            return <div className={cn('wrapper')}>{/* <Item key={event.id} data={event} /> */}</div>;
          })}
        </div>
      </section>
    </div>
  );
};

export default ScheduledEventTab;
