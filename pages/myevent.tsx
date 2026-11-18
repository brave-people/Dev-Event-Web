import Layout from 'components/layout';
import SavedEvents from 'components/myEvent/SavedEvents';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import { toKstNaive } from 'lib/utils/timeline/kst';

const MyEvent = ({ isLoggedIn, now }: { isLoggedIn: boolean; now: string }) => {
  const authContext = React.useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
  }, [isLoggedIn]);

  return <SavedEvents now={now} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.access_token;
    if (token) {
      return {
        props: {
          isLoggedIn: true,
          now: toKstNaive(Date.now()),
        },
      };
    }
  }

  return {
    redirect: {
      destination: '/events',
      permanent: false,
    },
    props: {},
  };
};

MyEvent.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default MyEvent;
