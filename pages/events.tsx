import Banner from 'components/common/banner/banner';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import LoginModal from 'components/common/modal/LoginModal';
import ScheduledEventList from 'components/events/ScheduledEventList';
import CalendarView from 'components/events/calendar/CalendarView';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import dayjs from 'dayjs';
import { useScheduledEvents, useMonthlyEvent } from 'lib/hooks/useSWR';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE_PATH,
  SITE_TITLE,
  SITE_URL,
} from 'lib/seo/site';
import {
  ORGANIZATION_JSON_LD,
  serializeJsonLd,
  WEBSITE_JSON_LD,
} from 'lib/seo/jsonLd';
import { Event, EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import { useEffect, useContext, useState, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const cn = classNames.bind(style);

const EVENTS_URL = `${SITE_URL}/events`;
const EVENTS_DESCRIPTION =
  '개발자 컨퍼런스, 웨비나, 해커톤, 네트워킹 일정을 한곳에서. 매주 새로운 개발자 행사 소식을 데브이벤트에서 가장 먼저 확인하세요.';
const OG_IMAGE = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

type ListProps = {
  view: 'list';
  fallbackData: EventResponse[];
};

type CalendarProps = {
  view: 'calendar';
  year: number;
  month: number;
  fallbackData: Event[];
};

type Props = ListProps | CalendarProps;

const Events = (props: Props) => {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { modalState } = useContext(WindowContext);
  const { date } = useContext(EventContext);
  const bodyRef = useRef<HTMLDivElement>(null);

  const listSWR = useScheduledEvents(
    props.view === 'list' ? props.fallbackData : undefined
  );
  const calendarSWR = useMonthlyEvent({
    param:
      props.view === 'calendar'
        ? { year: props.year, month: props.month }
        : { year: 1970, month: 1 },
    fallbackData: props.view === 'calendar' ? props.fallbackData : [],
  });

  useEffect(() => {
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
  }, [modalState, date]);

  return (
    <main ref={bodyRef} className={cn('main')}>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={EVENTS_DESCRIPTION} />
        <meta
          name="keywords"
          content="데브이벤트 웹, Dev Event, 데브이벤트, 개발자 행사, 용감한 친구들, 개발자, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT"
        />
        <link rel="canonical" href={EVENTS_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={EVENTS_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:url" content={EVENTS_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={EVENTS_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(WEBSITE_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(ORGANIZATION_JSON_LD),
          }}
        />
      </Head>
      {modalState.currentModal === 0 && (
        <>
          <Banner />
          <section className={cn('section')}>
            {props.view === 'list' ? (
              <ScheduledEventList
                events={listSWR.scheduledEvents}
                isError={listSWR.isError}
              />
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
        <FilterSearchModal
          events={listSWR.scheduledEvents}
          isError={listSWR.isError}
        />
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
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  );
  const view = context.query.view === 'calendar' ? 'calendar' : 'list';

  if (view === 'calendar') {
    const now = dayjs();
    const yearParam = Number(context.query.year);
    const monthParam = Number(context.query.month);
    const year =
      Number.isFinite(yearParam) && yearParam > 0 ? yearParam : now.year();
    const month =
      Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
        ? monthParam
        : now.month() + 1;
    const res = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`
    );
    const events = await res.json();
    return {
      props: {
        view: 'calendar' as const,
        year,
        month,
        fallbackData: events,
      },
    };
  }

  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v2/events/current`
  );
  const events = await res.json();
  return {
    props: {
      view: 'list' as const,
      fallbackData: events,
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
