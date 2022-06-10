import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/myevent.module.scss';
import Link from 'next/link';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import EventBody from 'component/myEvent/EventBody';
import { useRouter } from 'next/router';
import EventTab from 'component/myEvent/EventTab';

const cn = classNames.bind(style);

const MyEvent = () => {
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
        <EventTab />
      </header>
      <EventBody />
    </>
  );
};

MyEvent.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MyEvent;
