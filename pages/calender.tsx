import React, { useEffect, useState } from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import LoginModal from 'component/common/modal/LoginModal';
import MonthlyEventList from 'component/events/MonthlyEventList';
import { Event } from 'model/event';
import Head from 'next/head';
const cn = classNames.bind(style);

const Calender = ({ isLoggedIn, fallbackData }: { isLoggedIn: boolean; fallbackData: Event[] }) => {
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
      <div className={cn('banner')}>
        <h1 className={cn('banner__title')}>
          개발자 행사는
          <br /> 모두 Dev Event 웹에서
        </h1>
        <h3 className={cn('banner__desc')}>진행 중인 행사부터 종료된 행사까지, 놓치지 마세요! </h3>
      </div>
      <section className={cn('section')}>
        <MonthlyEventList fallbackData={fallbackData} />
      </section>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { year, month } = context.query;
  const res = await fetch(`https://real-brave-people.o-r.kr/front/v2/events/${year}/${month}`);
  const events = await res.json();

  const cookies = context.req.headers.cookie || '';

  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const access_token = parsedCookies.access_token;
    const refrest_token = parsedCookies.refresh_token;

    if (access_token && refrest_token) {
      return {
        props: {
          isLoggedIn: true,
          fallbackData: events,
        },
      };
    }
  }

  return {
    props: {
      isLoggedIn: false,
      fallbackData: events,
    },
  };
};

Calender.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Calender;
