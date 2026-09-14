import Banner from 'components/common/banner/banner';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import LoginModal from 'components/common/modal/LoginModal';
import FilteredEventList from 'components/events/FilteredEventList';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_URL } from 'lib/seo/site';
import { EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import { useEffect, useState, useContext, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

const cn = classNames.bind(style);

type Props = {
  fallbackData: EventResponse[];
};

const toLabel = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

const Search = ({ fallbackData }: Props) => {
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
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
      setLoginModalIsOpen(false);
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
          <Banner />
          <section className={cn('section')}>
            <FilteredEventList events={scheduledEvents} isError={isError} />
          </section>
          <Letter />
        </>
      ) : null}
      {isModalOpen(modalState.currentModal, 1) && (
        <FilterSearchModal events={scheduledEvents} isError={isError} />
      )}
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
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  );
  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v2/events/current`
  );
  const events = await res.json();
  return {
    props: {
      fallbackData: events,
    },
  };
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
