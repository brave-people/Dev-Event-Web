import type { GetServerSideProps } from 'next';
import { buildSitemapXml } from 'lib/seo/feeds';
import { fetchFeedEvents, sendFeedUnavailable } from 'lib/seo/feedSource';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const events = await fetchFeedEvents();
  if (!events) {
    // 빈 sitemap 을 캐시하면 검색 로봇이 한동안 행사 주소를 못 받는다
    console.error('sitemap: 행사 조회 실패');
    sendFeedUnavailable(res);
    return { props: {} };
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600, stale-while-revalidate=86400'
  );
  res.write(buildSitemapXml(events));
  res.end();
  return { props: {} };
};

const Sitemap = () => null;
export default Sitemap;
