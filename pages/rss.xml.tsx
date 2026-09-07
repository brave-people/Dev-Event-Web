import type { GetServerSideProps } from 'next';
import { buildRssXml, flattenEvents } from 'lib/seo/feeds';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let events: ReturnType<typeof flattenEvents> = [];
  try {
    const r = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/current`
    );
    if (r.ok) events = flattenEvents(await r.json());
  } catch (e) {
    console.error('rss: 행사 조회 실패', e);
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
