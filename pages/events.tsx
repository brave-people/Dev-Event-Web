import React, { useEffect, useContext, useState } from 'react';
import Layout from 'components/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import LoginModal from 'components/common/modal/LoginModal';
import { EventResponse } from 'model/event';
import ScheduledEventList from 'components/events/ScheduledEventList';
import Head from 'next/head';
import Banner from 'components/common/banner/banner';
import Letter from 'components/features/letter/Letter';
import { EventContext } from 'context/event';
import MonthlyEventList from 'components/events/MonthlyEventList';
import { getCurrentDate } from 'lib/utils/dateUtil';

const cn = classNames.bind(style);

type Props = {
  isLoggedIn: boolean;
  fallbackData: EventResponse[]
}

const Events = ({ isLoggedIn, fallbackData }: Props) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { date } = useContext(EventContext);

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
        <title>Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!</title>
        <meta
          name="description"
          content="데브이벤트 웹에서 개발자 행사를 놓치지 마세요! 개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다."
        />
        <meta
          name="keywords"
          content="데브이벤트 웹, Dev Event, 데브이벤트, 개발자 행사, 용감한 친구들, 개발자, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT"
        />
        <meta
          property="og:image"
          content="https://drive.google.com/uc?export=download&id=1-Jqapt5h4XtxXQbgX07kI3ipgk3V6ESE"
        />
        <meta property="og:title" content="Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!" />
        <meta
          property="og:description"
          content="개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다."
        />
      </Head>
      <Banner />
      <section className={cn('section')}>
        {(date === undefined || date === getCurrentDate())
          ? (<ScheduledEventList
              fallbackData={fallbackData}
            />
          ) : (
            <MonthlyEventList
              fallbackData={fallbackData}
              date={date}
            />
          ) 
        }
      </section>
      <Letter />
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  const res = await fetch(`${process.env.BASE_SERVER_URL}/front/v2/events/current`);
  const events = await res.json();

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

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
