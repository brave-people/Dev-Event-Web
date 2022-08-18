import React from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { serialize } from 'cookie';
import jwt_decode from 'jwt-decode';

const Home = () => {
  return (
    <Head>
      <title>Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!</title>
    </Head>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.accessToken && context.query.refreshToken) {
    const { exp: access_token_expired_at } = jwt_decode(String(context.query.accessToken)) as {
      exp: number;
    };
    const { exp: refresh_token_expired_at } = jwt_decode(String(context.query.refreshToken)) as {
      exp: number;
    };

    context.res.setHeader('Set-Cookie', [
      serialize('access_token', String(context.query.accessToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(access_token_expired_at * 1000),
        path: '/',
      }),
      serialize('refresh_token', String(context.query.refreshToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(refresh_token_expired_at * 1000),
        path: '/',
      }),
    ]);
  }
  return {
    redirect: {
      destination: '/events',
      permanent: false,
    },
    props: {},
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Home;
