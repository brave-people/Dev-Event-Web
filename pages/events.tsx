import Banner from 'components/common/banner/banner';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import LoginModal from 'components/common/modal/LoginModal';
import ScheduledEventList from 'components/events/ScheduledEventList';
import CalendarView from 'components/events/calendar/CalendarView';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { AuthContext } from 'context/auth';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import cookie from 'cookie';
import dayjs from 'dayjs';
import { useScheduledEvents, useMonthlyEvent } from 'lib/hooks/useSWR';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import { Event, EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import React, { useEffect, useContext, useState, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const cn = classNames.bind(style);

type ListProps = {
  view: 'list';
  isLoggedIn: boolean;
  fallbackData: EventResponse[];
};

type CalendarProps = {
  view: 'calendar';
  year: number;
  month: number;
  isLoggedIn: boolean;
  fallbackData: Event[];
};

type Props = ListProps | CalendarProps;

const Events = (props: Props) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { modalState } = useContext(WindowContext);
  const { date } = useContext(EventContext);
  const bodyRef = useRef<HTMLDivElement>(null);

  const listSWR = useScheduledEvents(
    props.view === 'list' ? props.fallbackData : undefined
  );
  const calendarSWR = useMonthlyEvent({
    param: props.view === 'calendar'
      ? { year: props.year, month: props.month }
      : { year: 1970, month: 1 },
    fallbackData: props.view === 'calendar' ? props.fallbackData : [],
  });

  useEffect(() => {
    if (props.isLoggedIn) {
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
      setLoginModalIsOpen(false);
    };
  }, [props.isLoggedIn, modalState, date]);

  return (
    <main ref={bodyRef} className={cn('main')}>
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
        <meta property="og:image" content="/default/og_image.png" />
        <meta property="og:title" content="Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!" />
        <meta property="og:description" content="개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다." />
      </Head>
      {modalState.currentModal === 0 && (
        <>
          <Banner />
          <section className={cn('section')}>
            {props.view === 'list' ? (
              <ScheduledEventList events={listSWR.scheduledEvents} isError={listSWR.isError} />
            ) : (
              <CalendarView
                year={props.year}
                month={props.month}
                events={calendarSWR.monthlyEvent ?? []}
              />
            )}
          </section>
          <Letter />
        </>
      )}
      {isModalOpen(modalState.currentModal, 1) && props.view === 'list' && (
        <FilterSearchModal events={listSWR.scheduledEvents} isError={listSWR.isError} />
      )}
      {isModalOpen(modalState.currentModal, 2) && <FilterTagModal />}
      {isModalOpen(modalState.currentModal, 3) && <FilterDateModal />}
      <LoginModal
        isOpen={loginModalIsOpen}
        onClose={() => setLoginModalIsOpen(false)}
      />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  const view = context.query.view === 'calendar' ? 'calendar' : 'list';

  const parsedCookies = cookies ? cookie.parse(cookies) : {};
  const isLoggedIn = Boolean(parsedCookies.access_token && parsedCookies.refresh_token);

  if (view === 'calendar') {
    const now = dayjs();
    const yearParam = Number(context.query.year);
    const monthParam = Number(context.query.month);
    const year = Number.isFinite(yearParam) && yearParam > 0 ? yearParam : now.year();
    const month = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
      ? monthParam
      : now.month() + 1;
    const res = await fetch(`${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`);
    const events = await res.json();
    return {
      props: {
        view: 'calendar' as const,
        year,
        month,
        isLoggedIn,
        fallbackData: events,
      },
    };
  }

  const res = await fetch(`${process.env.BASE_SERVER_URL}/front/v2/events/current`);
  const events = await res.json();
  return {
    props: {
      view: 'list' as const,
      isLoggedIn,
      fallbackData: events,
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
