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

type Props = {
  hostId: number;
  fallbackHost: HostDetail;
};

const HostPage = ({ hostId, fallbackHost }: Props) => {
  const { host } = useHostDetail(hostId, fallbackHost);
  const detail = host ?? fallbackHost;

  return (
    <>
      <Head>
        <title>{`${detail.host_name} 주최 행사 모음 | Dev Event`}</title>
        <meta
          name="description"
          content={`${detail.host_name}이(가) 주최한 개발자 행사를 한 번에 모아 보세요. 진행중 ${detail.ongoing_events.length}건 · 지난 ${detail.past_events.length}건.`}
        />
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

      <main className={cn('main')}>
        <div>
          <HostEventList
            ongoing={detail.ongoing_events}
            past={detail.past_events}
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
  const hostId = typeof raw === 'string' ? Number(raw) : NaN;

  if (!Number.isFinite(hostId)) {
    return { notFound: true };
  }

  const fallbackHost = await getHostDetailApi(`/front/v2/hosts/${hostId}`);

  return {
    props: { hostId, fallbackHost },
  };
};

HostPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HostPage;
