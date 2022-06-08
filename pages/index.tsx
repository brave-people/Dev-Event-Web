import React from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const Home = () => {
  return (
    <Head>
      <title>Dev Event</title>
    </Head>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.accessToken || context.query.refreshToken) {
    context.res.setHeader('set-cookie', [
      `access_token=${String(context.query.accessToken)}`,
      `refresh_token=${String(context.query.refreshToken)}`,
      'foo=bar; HttpOnly Secure',
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
