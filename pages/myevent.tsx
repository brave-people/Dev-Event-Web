import Layout from 'components/layout';
import EventBody from 'components/myEvent/EventBody';
import EventTab from 'components/myEvent/EventTab';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import * as ga from 'lib/utils/gTag';
import style from 'styles/Myevent.module.scss';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

const cn = classNames.bind(style);

const MyEvent = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
  }, [isLoggedIn]);

  return (
    <>
      <header className={cn('sub-header')}>
        <div className={cn('sub-header__inner')}>
          <div className={cn('sub-header__content')}>
            <h1>내 이벤트</h1>
            <span>내가 찜한 개발자 행사 정보들을 한눈에 모아봐요</span>
          </div>
          <Link href="/myinfo">
            <span
              className={cn('sub-header__link')}
              onClick={() => {
                ga.event({
                  action: 'web_event_내정보보기버튼클릭',
                  event_category: 'web_myevent',
                  event_label: '내정보이동',
                });
              }}
            >
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
