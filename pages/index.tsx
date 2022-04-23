import { useEventSWR } from 'lib/hooks/useEventSWR';
import { useState } from 'react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import Item from 'component/common/item/Item';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';
import FillButton from 'component/common/buttons/FillButton';

import Link from 'next/link';

const cn = classNames.bind(style);

const Home = () => {
  const [date, setDate] = useState({ year: 2022, month: 3 });
  // const { events, isLoading, isError } = useEventSWR(date);
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
    <>
      <div className={cn('banner')}>
        <span className={cn('banner__title')}>
          개발자 행사는
          <br /> 모두 Dev. Event에서
        </span>
        <span className={cn('banner__desc')}>
          현재 <span className={cn('banner__desc--bold')}>150</span>개의 개발자 행사 진행 중
        </span>
        <span className={cn('banner__button')}>
          <Link href="/myevent">
            <FillButton color="primary" label="내 이벤트 보기" />
          </Link>
        </span>
      </div>

      <section className={cn('section')}>
        <div className={cn('section__header')}>
          <span className={cn('section__header__title')}>2022년 3월</span>
          <div className={cn('section__header__filters')}>
            <Dropdown
              options={['옵션1', '옵션2', '옵션3']}
              placeholder="전체"
              icon={<AiTwotoneCalendar size={16} />}
            ></Dropdown>
            <span className={cn('wrapper')}>
              <Dropdown
                options={['옵션1', '옵션2', '옵션3']}
                placeholder="태그"
                icon={<AiTwotoneCalendar size={16} />}
              ></Dropdown>
            </span>
          </div>
        </div>
        <div className={cn('section__list')}>
          {events.map((event: any) => {
            return (
              <div className={cn('wrapper')}>
                <Item key={event.id} data={event} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Home;
