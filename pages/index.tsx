import React from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { serialize } from 'cookie';

const Home = () => {
  return (
    <Head>
      <title>Dev Event</title>
    </Head>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.accessToken || context.query.refreshToken) {
    context.res.setHeader('Set-Cookie', [
      serialize('access_token', String(context.query.accessToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 30 * 60,
        path: '/',
      }),
      serialize('refresh_token', String(context.query.refreshToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 30 * 60,
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
