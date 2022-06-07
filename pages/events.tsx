import React, { useEffect, useState } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import FillButton from 'component/common/buttons/FillButton';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import EventHeader from 'component/events/EventHeader';
import EventBody from 'component/events/EventBody';
import cookie from 'cookie';

const cn = classNames.bind(style);

const Events = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <>
      <div className={cn('banner')}>
        <span className={cn('banner__title')}>
          개발자 행사는
          <br /> 모두 Dev. Event에서
        </span>
        <span className={cn('banner__desc')}>진행 중인 행사부터 종료된 행사까지, 여기서 모두. </span>
        <span className={cn('banner__button')}>
          <Link href="/myevent">
            <FillButton size="large" color="primary" label="내 이벤트 보기" />
          </Link>
        </span>
      </div>
      <section className={cn('section')}>
        <EventHeader />
        <EventBody />
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  //쿠키 여부 확인
  let hasToken = false;
  if (context.req.headers.cookie) {
    const parsedCookies = cookie.parse(context.req.headers.cookie);
    if (parsedCookies.access_token) {
      hasToken = true;
    }
  }

  return {
    props: {
      isLoggedIn: hasToken,
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
