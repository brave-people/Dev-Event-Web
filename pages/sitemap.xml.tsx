import type { GetServerSideProps } from 'next';
import { buildSitemapXml, flattenEvents } from 'lib/seo/feeds';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let events: ReturnType<typeof flattenEvents> = [];
  try {
    const r = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/current`
    );
    if (r.ok) events = flattenEvents(await r.json());
  } catch (e) {
    console.error('sitemap: 행사 조회 실패', e);
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
