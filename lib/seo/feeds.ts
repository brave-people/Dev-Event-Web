import { buildEventMetaDescription } from 'lib/seo/eventMeta';
import { eventDetailUrl, SITE_NAME, SITE_URL } from 'lib/seo/site';
import { Event, EventResponse } from 'model/event';

export const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** /front/v2/events/current 응답(월 그룹 배열)을 행사 배열로 평탄화. id 중복 제거. */
export const flattenEvents = (res: EventResponse[]): Event[] => {
  const seen = new Set<string>();
  const out: Event[] = [];
  for (const group of res ?? []) {
    for (const e of group?.dev_event ?? []) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(e);
    }
  }
  return out;
};

/** "2026-08-19T09:47" → "2026-08-19" */
const toLastmod = (createDateTime: string): string =>
  createDateTime.slice(0, 10);

export const buildSitemapXml = (events: Event[]): string => {
  const urls = [
    `<url><loc>${SITE_URL}/events</loc><changefreq>daily</changefreq></url>`,
    `<url><loc>${SITE_URL}/about</loc><changefreq>monthly</changefreq></url>`,
    ...events.map((e) => {
      const loc = eventDetailUrl(e.id);
      if (
        typeof e.create_date_time === 'string' &&
        e.create_date_time.length >= 10
      ) {
        return `<url><loc>${loc}</loc><lastmod>${toLastmod(
          e.create_date_time
        )}</lastmod></url>`;
      }
      return `<url><loc>${loc}</loc></url>`;
    }),
  ];
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls.join('') +
    '</urlset>'
  );
};

export const buildRssXml = (events: Event[]): string => {
  const items = events
    .map((e) => {
      const url = eventDetailUrl(e.id);
      let pubDateTag = '';
      if (
        typeof e.create_date_time === 'string' &&
        e.create_date_time.length >= 16
      ) {
        const d = new Date(`${e.create_date_time}:00+09:00`);
        if (!Number.isNaN(d.getTime())) {
          pubDateTag = `<pubDate>${d.toUTCString()}</pubDate>`;
        }
      }
      return (
        '<item>' +
        `<title>${escapeXml(e.title)}</title>` +
        `<link>${url}</link>` +
        `<guid isPermaLink="true">${url}</guid>` +
        pubDateTag +
        `<description>${escapeXml(
          buildEventMetaDescription(e)
        )}</description>` +
        (e.organizer ? `<author>${escapeXml(e.organizer)}</author>` : '') +
        (e.tags ?? [])
          .map((t) => `<category>${escapeXml(t.tag_name)}</category>`)
          .join('') +
        '</item>'
      );
    })
    .join('');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' +
    '<channel>' +
    `<title>${escapeXml(SITE_NAME)} - 예정 개발자 행사</title>` +
    `<link>${SITE_URL}/events</link>` +
    `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>` +
    '<description>개발자 컨퍼런스, 웨비나, 해커톤, 네트워킹 일정을 큐레이션하는 데브이벤트의 예정 행사 피드</description>' +
    '<language>ko</language>' +
    items +
    '</channel></rss>'
  );
};
