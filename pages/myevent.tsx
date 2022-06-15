import React, { useEffect } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/myevent.module.scss';
import Link from 'next/link';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import EventBody from 'component/myEvent/EventBody';
import cookie from 'cookie';
import EventTab from 'component/myEvent/EventTab';
import { GetServerSideProps } from 'next';
import { AuthContext } from 'lib/context/auth';

const cn = classNames.bind(style);

const MyEvent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    }
  }, []);

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.access_token;
    if (token) {
      return {
        props: {
          isLoggedIn: true,
        },
      };
    }
  }

  return {
    redirect: {
      destination: '/events',
      permanent: false,
    },
    props: {},
  };
};

MyEvent.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default MyEvent;
