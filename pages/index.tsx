import React from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const cn = classNames.bind(style);

const Home = ({ isLoggedIn }: any) => {
  return (
    <Head>
      <title>Dev Event</title>
    </Head>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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
