import React, { useEffect, useState } from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import { AuthContext } from 'context/auth';
import LoginModal from 'component/common/modal/LoginModal';
import FilteredEventList from 'component/events/FilteredEventList';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Banner from 'component/common/banner/banner';

const cn = classNames.bind(style);

const Search = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);
  const router = useRouter();
  const isFilteredByTag = router.query.tag;
  const isFilteredBySearch = router.query.keyword;
  const keyword = router.query.tag || router.query.keyword;

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
        <title>{keyword} - 데브이벤트 행사 키워드 검색</title>
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
      <Banner />
      <section className={cn('section')}>
        {isFilteredByTag && <FilteredEventList type="tag" filter={String(isFilteredByTag)} />}
        {isFilteredBySearch && <FilteredEventList type="search" filter={String(isFilteredBySearch)} />}
      </section>
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const access_token = parsedCookies.access_token;
    const refrest_token = parsedCookies.refresh_token;

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

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Search;
