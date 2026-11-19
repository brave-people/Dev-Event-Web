import type { GetServerSideProps } from 'next';
import { buildRssXml } from 'lib/seo/feeds';
import { fetchFeedEvents, sendFeedUnavailable } from 'lib/seo/feedSource';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const events = await fetchFeedEvents();
  if (!events) {
    // 빈 피드를 캐시하면 피드 리더가 한동안 "행사 0개"를 받는다
    console.error('rss: 행사 조회 실패');
    sendFeedUnavailable(res);
    return { props: {} };
  }
  // 최신 등록 순
  events.sort((a, b) => (a.create_date_time < b.create_date_time ? 1 : -1));
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  res.write(buildRssXml(events));
  res.end();
  return { props: {} };
};

const Rss = () => null;
export default Rss;
