import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/myevent.module.scss';
import Link from 'next/link';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import MyEventTabBody from 'component/myEventTab/MyEventTabBody';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const MyEvent = ({}: any) => {
  const [date, setDate] = useState({ year: 2022, month: 3 });
  const router = useRouter();
  const [tabMenu, setTabMenu] = useState({ ongoing: true, done: false });
  // const { events, isLoading, isError } = useEventSWR(date);

  return (
    <>
      <header className={cn('sub-header')}>
        <div className={cn('sub-header__inner')}>
          <div className={cn('sub-header__content')}>
            <h1>마이 Dev Event 리스트</h1>
            <span>내가 찜한 개발자 행사 정보들을 한눈에 모아봐요</span>
          </div>
          <Link href="/myinfo">
            <span className={cn('sub-header__link')}>
              <span>내 정보 보기 </span>
              <MdOutlineArrowForwardIos size={16} />
            </span>
          </Link>
        </div>
        <div className={cn('tab__header')}>
          <div
            className={cn('tab__header--menu', tabMenu.ongoing === true ? 'selected' : null)}
            onClick={(event) => {
              setTabMenu({ ongoing: true, done: false });
              router.replace('/myevent?tab=ongoing');
            }}
          >
            진행 중인 행사
          </div>

          <div
            className={cn('tab__header--menu', tabMenu.done === true ? 'selected' : null)}
            onClick={(event) => {
              setTabMenu({ ongoing: false, done: true });
              router.replace('/myevent?tab=done');
            }}
          >
            종료된 행사
          </div>
        </div>
      </header>
      <MyEventTabBody />
    </>
  );
};

MyEvent.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MyEvent;
