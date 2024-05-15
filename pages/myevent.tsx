import Layout from 'components/layout';
import MyEventBody from 'components/myEvent/MyEventBody';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import style from 'styles/MyEvent.module.scss';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';

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
            <h1>북마크</h1>
          </div>
        </div>
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
