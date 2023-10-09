import React, { useEffect, useState, useContext, useRef } from 'react';
import Layout from 'components/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import LoginModal from 'components/common/modal/LoginModal';
import Banner from 'components/common/banner/banner';
import FilteredEventList from 'components/events/FilteredEventList';
import { EventResponse } from 'model/event';
import Letter from 'components/features/letter/Letter';
import Head from "next/head";
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import { useScheduledEvents } from 'lib/hooks/useSWR';

const cn = classNames.bind(style);

type Props = {
  isLoggedIn: boolean;
  fallbackData: EventResponse[];
}

const Search = ({ isLoggedIn, fallbackData }: Props) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const { jobGroupList, eventType, location, coast, search } = useContext(EventContext)
  const { modalState } = useContext(WindowContext);
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);

  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyword(`
      ${(jobGroupList !== undefined && jobGroupList?.length !== 0) ? `${jobGroupList?.join(',')}` : ''} 
      ${eventType !== undefined ?  `${eventType},` : ''}
      ${location !== undefined ? `${location},` : ''} 
      ${coast !== undefined ? `${coast},` : ''} 
      ${search !== undefined ? `${search}` : ''}`)
      
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
    }
  }, [isLoggedIn, modalState, keyword]);

  return (
    <main
      ref={bodyRef}
      className={cn('main')}>
      <Head>
        <title>{keyword !== undefined ? `${keyword} - 데브이벤트 행사 키워드 검색` : '데브이벤트 행사 키워드 검색'}</title>
        <meta name="description" content={`${keyword} 행사, 데브이벤트에서 찾아보세요!`} />
        <meta
          name="keywords"
          content={`${keyword}, 데브이벤트 웹, 개발자 행사, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT`}
        />
        <meta
          property="og:image"
          content="https://drive.google.com/uc?export=download&id=1-Jqapt5h4XtxXQbgX07kI3ipgk3V6ESE"
        />
        <meta property="og:title" content={`${keyword} - 데브이벤트 행사 키워드 검색`} />
        <meta property="og:description" content={`${keyword} 개발자 행사, 데브이벤트에서 찾아보세요!`} />
      </Head>
      {modalState.currentModal === 0 && (
        <>
          <Banner />
          <section 
            className={cn('section')}>
            <FilteredEventList
              events={scheduledEvents}
              isError={isError}
              />
          </section>
          <Letter />
        </>
      )}
      {isModalOpen(modalState.currentModal, modalState.prevModal, 1) &&
      <FilterSearchModal
        events={scheduledEvents}
      />}
      {isModalOpen(modalState.currentModal, modalState.prevModal, 2) && 
        <FilterTagModal />}
      {isModalOpen(modalState.currentModal, modalState.prevModal, 3)  &&
        <FilterDateModal />}
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
    </main>
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
          fallbackData: events
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

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
