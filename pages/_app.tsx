import { AuthProvider } from 'context/auth';
import { EventProvider } from 'context/event';
import { WindowProvider } from 'context/window';
import * as gtag from 'lib/utils/gTag';
import { ReactElement, ReactNode, useEffect } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import '../styles/globals.scss';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    const handleRouteChange = (url: URL) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <title>Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!</title>
      </Head>
      <AuthProvider>
        <WindowProvider>
          <EventProvider>{getLayout(<Component {...pageProps} />)}</EventProvider>
        </WindowProvider>
      </AuthProvider>
    </>
  );
}
