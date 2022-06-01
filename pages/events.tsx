import React, { useEffect, useState } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';
import FillButton from 'component/common/buttons/FillButton';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import EventBody from 'component/events/EventBody';

const cn = classNames.bind(style);

const Events = ({ isLoggedIn }: any) => {
  const router = useRouter();
  const [filter, setFilter] = useState({ date: '전체', tag: '전체' });
  useEffect(() => {
    if (router.query) {
      localStorage.setItem('token', String(router.query.accessToken));
      router.replace('/');
    }
  }, []);

  const getDateList = () => {
    const array = ['전체'];
    let currentDate = dayjs().endOf('month');
    const startDate = dayjs('2022-01-01');
    while (startDate.isBefore(currentDate)) {
      array.push(currentDate.format('YYYY년 MM월'));
      currentDate = currentDate.subtract(1, 'M');
    }
    return array;
  };

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
            <FillButton size="large" color="primary" label="내 이벤트 보기" />
          </Link>
        </span>
      </div>
      <section className={cn('section')}>
        <div className={cn('section__header')}>
          <span>현재 150개의 개발자 행사 진행 중</span>
          <div className={cn('section__header__filters')}>
            <Dropdown
              options={getDateList()}
              placeholder="전체"
              value={filter.date}
              icon={<AiTwotoneCalendar size={16} />}
              onClick={(event: any) => {
                setFilter({ ...filter, date: event.target.innerText });
                if (event.target.innerText === '전체') {
                  router.replace(`/events`);
                } else {
                  const date = event.target.innerText.replace(/[\t\s]/g, '').split(/[년, 월]/);
                  router.replace(`/events?year=${date[0]}&month=${date[1]}`);
                }
              }}
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
        <EventBody />
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      isLoggedIn: false,
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
