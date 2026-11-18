import Banner from 'components/common/banner/banner';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import EventTimeline from 'components/events/timeline/EventTimeline';
import Layout from 'components/layout';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { fetchTopBannersOnServer } from 'lib/api/topBannerServer';
import { toKstNaive } from 'lib/utils/timeline/kst';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_URL } from 'lib/seo/site';
import { TopBanner } from 'model/banner';
import { EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import { useEffect, useContext, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

const cn = classNames.bind(style);

type Props = {
  fallbackData: EventResponse[];
  banners: TopBanner[];
  now: string;
};

const toLabel = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const Search = ({ fallbackData, banners, now }: Props) => {
  const { search, date } = useContext(EventContext);
  const { modalState } = useContext(WindowContext);
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);
  const router = useRouter();
  const { tag, type, location: loc, coast: coastQuery, kwd } = router.query;
  const searchLabel =
    [
      ...toLabel(tag),
      ...toLabel(type),
      ...toLabel(loc),
      ...toLabel(coastQuery),
      ...toLabel(kwd),
    ]
      .filter(Boolean)
      .join(', ') || '개발자';
  const searchTitle = `${searchLabel} 행사 검색 | 데브이벤트`;
  const searchDescription = `${searchLabel} 관련 개발자 행사를 데브이벤트에서 찾아보세요.`;

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalState.currentModal !== 0) {
      document.body.style.position = 'fixed';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.position = 'relative';
      document.body.style.overflow = 'unset';
      bodyRef.current?.removeEventListener('wheel', blockMouseScroll);
    };
  }, [modalState, search, date]);

  return (
    <main ref={bodyRef} className={cn('main')}>
      <Head>
        <title>{searchTitle}</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content={searchDescription} />
        <link rel="canonical" href={`${SITE_URL}/events`} />
        <meta property="og:title" content={searchTitle} />
        <meta property="og:description" content={searchDescription} />
        <meta
          property="og:image"
          content={absoluteUrl(DEFAULT_OG_IMAGE_PATH)}
        />
        <meta property="og:url" content={`${SITE_URL}/events`} />
      </Head>
      {modalState.currentModal === 0 ? (
        <>
          <Banner fallbackData={banners} />
          <EventTimeline
            events={scheduledEvents}
            isError={Boolean(isError)}
            now={now}
            mode="search"
          />
        </>
      ) : null}
      {isModalOpen(modalState.currentModal, 1) && (
        <FilterSearchModal events={scheduledEvents} isError={isError} />
      )}
      {isModalOpen(modalState.currentModal, 2) && <FilterTagModal />}
      {isModalOpen(modalState.currentModal, 3) && <FilterDateModal />}
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  );
  const bannersPromise = fetchTopBannersOnServer();
  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v2/events/current`
  );
  const events = await res.json();
  const banners = await bannersPromise;
  return {
    props: {
      fallbackData: events,
      banners,
      now: toKstNaive(Date.now()),
    },
  };
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
