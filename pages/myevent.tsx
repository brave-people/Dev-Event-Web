import Layout from 'components/layout';
import MyEventBody from 'components/myEvent/MyEventBody';
import MyEventTab from 'components/myEvent/MyEventTab';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import * as ga from 'lib/utils/gTag';
import style from 'styles/MyEvent.module.scss';
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
          </div>
        </div>
        {/*<MyEventTab />*/} {/*  todo active me */}
      </header>
      <MyEventBody />
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
