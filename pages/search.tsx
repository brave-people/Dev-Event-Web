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

const cn = classNames.bind(style);

const Search = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);
  const router = useRouter();
  const isFilteredByTag = router.query.tag;
  const isFilteredBySearch = router.query.keyword;

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
        {isFilteredByTag && <FilteredEventList type="tag" filter={String(isFilteredByTag)} />}
        {isFilteredBySearch && <FilteredEventList type="search" filter={String(isFilteredBySearch)} />}
      </section>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
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
