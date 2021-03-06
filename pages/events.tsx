import React, { useEffect, useState } from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import FillButton from 'component/common/buttons/FillButton';
import { GetServerSideProps } from 'next';
import EventHeader from 'component/events/EventHeader';
import EventBody from 'component/events/EventBody';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import router from 'next/router';
import LoginModal from 'component/common/modal/LoginModal';
import Head from 'next/head';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const Events = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
  }, [isLoggedIn]);

  return (
    <>
      <Head>
        <title>Dev Event</title>
      </Head>
      <div className={cn('banner')}>
        <h2 className={cn('banner__title')}>
          개발자 행사는
          <br /> 모두 Dev Event에서
        </h2>
        <h3 className={cn('banner__desc')}>진행 중인 행사부터 종료된 행사까지, 여기서 모두. </h3>
        <span className={cn('banner__button')}>
          <FillButton
            size="large"
            color="primary"
            label="내 이벤트 보기"
            onClick={() => {
              authContext.isLoggedIn ? router.push('/myevent') : setLoginModalIsOpen(true);
              ga.event({
                action: 'web_event_내이벤트버튼클릭',
                event_category: 'web_event',
                event_label: '내이벤트이동',
              });
            }}
          />{' '}
        </span>
      </div>
      <section className={cn('section')}>
        <EventHeader />
        <EventBody />
      </section>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const access_token = parsedCookies.access_token;
    const refrest_token = parsedCookies.refresh_token;
    console.log(parsedCookies);

    if (access_token && refrest_token) {
      return {
        props: {
          isLoggedIn: true,
        },
      };
    }
  }
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
