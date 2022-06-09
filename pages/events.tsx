import React, { useEffect, useState } from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import FillButton from 'component/common/buttons/FillButton';
import { GetServerSideProps } from 'next';
import EventHeader from 'component/events/EventHeader';
import EventBody from 'component/events/EventBody';
import autoLogin from 'pages/api/autoLogin';
import cookie from 'cookie';
import { AuthContext } from 'lib/context/auth';
import router from 'next/router';
import LoginModal from 'component/common/modal/LoginModal';
const cn = classNames.bind(style);

const Events = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    }
  }, []);

  return (
    <>
      <div className={cn('banner')}>
        <span className={cn('banner__title')}>
          개발자 행사는
          <br /> 모두 Dev. Event에서
        </span>
        <span className={cn('banner__desc')}>진행 중인 행사부터 종료된 행사까지, 여기서 모두. </span>
        <span className={cn('banner__button')}>
          <FillButton
            size="large"
            color="primary"
            label="내 이벤트 보기"
            onClick={() => {
              isLoggedIn ? router.push('/myevent') : setLoginModalIsOpen(true);
            }}
          />{' '}
        </span>
      </div>
      <section className={cn('section')}>
        <EventHeader />
        <EventBody />
      </section>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';

  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.access_token;

    const result = await autoLogin({ token: token });
    if (result === 'SUCCESS') {
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

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
