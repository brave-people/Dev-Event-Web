import Banner from 'components/common/banner/banner';
import EventCalendar from 'components/events/calendar/EventCalendar';
import EventTimeline from 'components/events/timeline/EventTimeline';
import Layout from 'components/layout';
import { useScheduledEvents, useMonthlyEvent } from 'lib/hooks/useSWR';
import { fetchTopBannersOnServer } from 'lib/api/topBannerServer';
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
import { readMonthParam } from 'lib/utils/timeline/dateStrip';
import { toKstNaive } from 'lib/utils/timeline/kst';
import { TopBanner } from 'model/banner';
import { Event, EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Router from 'next/router';

const cn = classNames.bind(style);

const EVENTS_URL = `${SITE_URL}/events`;
const EVENTS_DESCRIPTION =
  '개발자 컨퍼런스, 웨비나, 해커톤, 네트워킹 일정을 한곳에서. 매주 새로운 개발자 행사 소식을 데브이벤트에서 가장 먼저 확인하세요.';
const OG_IMAGE = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

type ListProps = {
  view: 'list';
  fallbackData: EventResponse[];
  banners: TopBanner[];
  now: string;
};

type CalendarProps = {
  view: 'calendar';
  year: number;
  month: number;
  fallbackData: Event[];
  banners: TopBanner[];
  now: string;
};

type Props = ListProps | CalendarProps;

const Events = (props: Props) => {
  const listSWR = useScheduledEvents(
    props.view === 'list' ? props.fallbackData : undefined,
    props.view === 'list'
  );
  const calendarSWR = useMonthlyEvent({
    param:
      props.view === 'calendar'
        ? { year: props.year, month: props.month }
        : null,
    fallbackData: props.view === 'calendar' ? props.fallbackData : undefined,
  });

  // 지금 화면이 그리고 있는 보기·달 (뒤로 가기 콜백이 읽는다)
  const shown = {
    view: props.view,
    year: props.view === 'calendar' ? props.year : 0,
    month: props.view === 'calendar' ? props.month : 0,
  };
  const shownRef = useRef(shown);
  shownRef.current = shown;

  // shallow로 남겨진 기록으로 돌아갈 때, 주소의 보기·달이 지금 props와 다르면
  // getServerSideProps를 다시 거친다 (Next는 shallow 기록이면 props를 그대로 쓴다)
  useEffect(() => {
    Router.beforePopState(({ as, options }) => {
      if (!options.shallow) return true;
      const [path, search = ''] = as.split('#')[0].split('?');
      if (path !== '/events') return true;
      const q = new URLSearchParams(search);
      const view = q.get('view') === 'calendar' ? 'calendar' : 'list';
      const cur = shownRef.current;
      const same =
        view === cur.view &&
        (view === 'list' ||
          (Number(q.get('year')) === cur.year &&
            Number(q.get('month')) === cur.month));
      if (same) return true;
      Router.replace(as, undefined, { scroll: false }).catch(() => undefined);
      return false;
    });
    return () => {
      Router.beforePopState(() => true);
    };
  }, []);

  return (
    <main className={cn('main')}>
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
      <Banner fallbackData={props.banners} />
      {props.view === 'list' ? (
        <EventTimeline
          events={listSWR.scheduledEvents}
          isError={Boolean(listSWR.isError)}
          now={props.now}
          mode="events"
        />
      ) : (
        <EventCalendar
          year={props.year}
          month={props.month}
          events={calendarSWR.monthlyEvent}
          isError={Boolean(calendarSWR.isError)}
          now={props.now}
        />
      )}
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  );
  const bannersPromise = fetchTopBannersOnServer();
  const view = context.query.view === 'calendar' ? 'calendar' : 'list';

  if (view === 'calendar') {
    const now = toKstNaive(Date.now());
    // 클라이언트(calendarUrl)와 같은 규칙: 정수 연(2000~2100)·월(1~12)이 아니면 이번 달
    const param = readMonthParam({
      year: context.query.year,
      month: context.query.month,
    });
    const year = param ? param.year : Number(now.slice(0, 4));
    const month = param ? param.month : Number(now.slice(5, 7));
    const res = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`
    );
    const events = await res.json();
    const banners = await bannersPromise;
    return {
      props: {
        view: 'calendar' as const,
        year,
        month,
        fallbackData: events,
        banners,
        now,
      },
    };
  }

  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v2/events/current`
  );
  const events = await res.json();
  const banners = await bannersPromise;
  return {
    props: {
      view: 'list' as const,
      fallbackData: events,
      banners,
      now: toKstNaive(Date.now()),
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
