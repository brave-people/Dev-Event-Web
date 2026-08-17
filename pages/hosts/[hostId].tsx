import HostBanner from 'components/hosts/HostBanner';
import HostEventList from 'components/hosts/HostEventList';
import HostHeader from 'components/hosts/HostHeader';
import HostSidebar from 'components/hosts/HostSidebar';
import HostTopicStrip from 'components/hosts/HostTopicStrip';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { getHostDetailApi } from 'lib/api/host';
import { useHostDetail } from 'lib/hooks/useSWR';
import { HostDetail } from 'model/host';
import style from 'styles/HostPage.module.scss';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactElement } from 'react';

const cn = classNames.bind(style);

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dev-event.vercel.app';

type Props = {
  hostId: number;
  fallbackHost: HostDetail;
};

const HostPage = ({ hostId, fallbackHost }: Props) => {
  const { host, isError } = useHostDetail(hostId, fallbackHost);
  const detail = host ?? fallbackHost;

  const pageTitle = `${detail.host_name} 주최 행사 모음 | Dev Event`;
  const pageDescription = `${detail.host_name}이(가) 주최한 개발자 행사를 한 번에 모아 보세요. 진행중 ${
    detail.ongoing_events_total ?? detail.ongoing_events.length
  }건 · 지난 ${detail.past_events_total ?? detail.past_events.length}건.`;
  // 배너 → 로고 → 기본 썸네일 순으로 폴백
  const ogImage =
    detail.banner_image_link ??
    detail.logo_image_link ??
    `${SITE_URL}/default/og_image.png`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_URL}/hosts/${detail.id}`} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <nav className={cn('breadcrumb')}>
        <Link href="/events">
          <a>행사</a>
        </Link>
        <span className={cn('breadcrumb__sep')}>›</span>
        <Link href="/hosts">
          <a>주최</a>
        </Link>
        <span className={cn('breadcrumb__sep')}>›</span>
        <span className={cn('breadcrumb__current')}>{detail.host_name}</span>
      </nav>

      <HostBanner bannerImageLink={detail.banner_image_link} />

      <HostHeader host={detail} />

      {isError && (
        <p className={cn('staleBanner')} role="status">
          최신 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <main className={cn('main')}>
        <div>
          <HostEventList
            hostId={detail.id}
            ongoing={detail.ongoing_events}
            past={detail.past_events}
            ongoingTotal={detail.ongoing_events_total ?? detail.ongoing_events.length}
            pastTotal={detail.past_events_total ?? detail.past_events.length}
          />
          <HostTopicStrip topics={detail.topics} />
        </div>
        <HostSidebar links={detail.links} summary={detail.summary} />
      </main>

      <Letter />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const raw = context.params?.hostId;

  // 라우팅 키는 서버 PK(양의 정수)다. '1.5' · '1e3' · ' 1 ' 같은 값이 Number()를 통과하지 않도록 정규식으로 막는다.
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    return { notFound: true };
  }

  const hostId = Number(raw);

  try {
    const fallbackHost = await getHostDetailApi(`/front/v2/hosts/${hostId}`);

    return {
      props: { hostId, fallbackHost },
    };
  } catch (error: any) {
    if (error?.status !== 404) {
      console.error(`[hosts/${hostId}] 주최자 상세 조회 실패`, error?.status ?? error);
    }
    return { notFound: true };
  }
};

HostPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HostPage;
