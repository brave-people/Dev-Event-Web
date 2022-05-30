import { useEvents } from 'lib/hooks/useSWR';
import { useState } from 'react';
import React, { useEffect } from 'react';
import Item from 'component/common/item/Item';
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
import { EventResponse, Event } from 'model/event';
const cn = classNames.bind(style);

const Home = ({ isLoggedIn }: any) => {
  const router = useRouter();

  useEffect(() => {
    if (router.query) {
      localStorage.setItem('token', String(router.query.accessToken));
      router.replace('/');
    }
  }, []);

  const { events, isLoading, isError } = useEvents();

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
      {events &&
        events.map((event: EventResponse) => {
          return (
            <section className={cn('section')}>
              <div className={cn('section__header')}>
                <span
                  className={cn('section__header__title')}
                >{`${event.metadata.year}년 ${event.metadata.month}월`}</span>
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
                {event &&
                  event.dev_event.map((item: Event) => {
                    return (
                      <div className={cn('wrapper')}>
                        <Item key={item.id} data={item} />
                      </div>
                    );
                  })}
              </div>
            </section>
          );
        })}
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

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Home;
