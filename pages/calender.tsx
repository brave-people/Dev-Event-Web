import React, { useContext, useEffect, useRef, useState } from 'react';
import Layout from 'components/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import LoginModal from 'components/common/modal/LoginModal';
import MonthlyEventList from 'components/events/MonthlyEventList';
import { Event } from 'model/event';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Banner from 'components/common/banner/banner';
import Letter from 'components/features/letter/Letter';
import { WindowContext } from 'context/window';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import FilterDateModal from 'components/common/modal/FilterDateModal';

const cn = classNames.bind(style);

const Calender = ({
  isLoggedIn,
  fallbackData,
}: {
  isLoggedIn: boolean;
  fallbackData: Event[];
}) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const router = useRouter();
  const filteredDate = {
    year: Number(router.query.year),
    month: Number(router.query.month),
  };
  const { modalState } = useContext(WindowContext);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
    if (modalState.currentModal !== 0) {
      document.body.style.position = 'fixed';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.position = 'relative';
      document.body.style.overflow = 'unset';
      bodyRef.current?.removeEventListener('wheel', blockMouseScroll);
    };
  }, [isLoggedIn, modalState]);

  return (
    <main ref={bodyRef} className={cn('main')}>
      <Head>
        <title>
          {filteredDate.year}년 {filteredDate.month}월 - 데브이벤트 행사 월별
          검색
        </title>
        <meta
          name="description"
          content={`${filteredDate.year}년 ${filteredDate.month}월에 진행되는 개발자 행사, 데브이벤트에서 찾아보세요!`}
        />
        <meta
          name="keywords"
          content="데브이벤트 웹, 개발자 행사, 월별, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT"
        />
        <meta
          property="og:image"
          content="https://drive.google.com/uc?export=download&id=1-Jqapt5h4XtxXQbgX07kI3ipgk3V6ESE"
        />
        <meta
          property="og:title"
          content={`${filteredDate.year}년 ${filteredDate.month}월 - 데브이벤트 행사 월별 검색`}
        />
        <meta
          property="og:description"
          content={`${filteredDate.year}년 ${filteredDate.month}월에 진행되는 개발자 행사, 데브이벤트에서 찾아보세요!`}
        />
      </Head>
      {modalState.currentModal === 0 ? (
        <>
          <Banner />
          <section className={cn('section')}>
            <MonthlyEventList events={fallbackData} date={filteredDate} />
          </section>
          <Letter />
        </>
      ) : null}
      {isModalOpen(modalState.currentModal, 2) && <FilterTagModal />}
      {isModalOpen(modalState.currentModal, 3) && <FilterDateModal />}
      <LoginModal
        isOpen={loginModalIsOpen}
        onClose={() => setLoginModalIsOpen(false)}
      ></LoginModal>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { year, month } = context.query;
  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`
  );
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
