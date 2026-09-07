import { buildEventMetaDescription, getEventOgImage } from 'lib/seo/eventMeta';
import { eventDetailUrl, SITE_NAME, SITE_URL } from 'lib/seo/site';
import { Event } from 'model/event';

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dev Event',
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/default/favicon.png`,
  description:
    '개발자 컨퍼런스, 밋업, 해커톤과 네트워킹 일정을 큐레이션하는 개발자 행사 정보 서비스입니다.',
  sameAs: [
    'https://github.com/brave-people/Dev-Event',
    'https://www.instagram.com/dev.event.official/',
    'https://www.threads.com/@dev.event.official',
    'https://play.google.com/store/apps/details?id=com.bravepeople.devevent.android.app',
    'https://apps.apple.com/kr/app/id6502765233',
  ],
};

export const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: 'Dev Event',
  url: SITE_URL,
  inLanguage: 'ko-KR',
  publisher: { '@type': 'Organization', name: 'Dev Event', url: SITE_URL },
};

const KST = '+09:00';

/** API 값 "2026-07-13T10:00" → 시간 사용 시 "2026-07-13T10:00+09:00", 아니면 "2026-07-13" */
const toSchemaDate = (value: string, useTime: 'Y' | 'N' | null): string => {
  const [date, time] = value.split('T');
  if (useTime === 'Y' && time) return `${date}T${time.slice(0, 5)}${KST}`;
  return date;
};

const hasTag = (e: Event, name: string): boolean =>
  (e.tags ?? []).some((t) => t.tag_name === name);

const buildOrganizers = (organizer: string) => {
  const list = organizer
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ '@type': 'Organization', name }));
  return list.length === 1 ? list[0] : list;
};

export const buildEventJsonLd = (e: Event): Record<string, unknown> | null => {
  // 방어 1: RECRUIT는 접수 기간이라 행사 일시가 아니다 → 생략
  if (e.event_time_type !== 'DATE' || !e.start_date_time) return null;

  const online = hasTag(e, '온라인');
  const offline = hasTag(e, '오프라인');
  const attendanceMode =
    online && offline
      ? 'https://schema.org/MixedEventAttendanceMode'
      : online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode';

  const locations: Record<string, unknown>[] = [];
  if (offline || !online) {
    locations.push({
      '@type': 'Place',
      name: e.organizer,
      address: { '@type': 'PostalAddress', addressCountry: 'KR' },
    });
  }
  if (online) {
    locations.push({
      '@type': 'VirtualLocation',
      url: e.event_link || eventDetailUrl(e.id),
    });
  }

  // 방어 2: 무료가 명시된 경우만 offers. 유료·불명은 생략
  const offers = hasTag(e, '무료')
    ? {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
        availability: 'https://schema.org/InStock',
        url: e.event_link || eventDetailUrl(e.id),
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    description: buildEventMetaDescription(e),
    url: eventDetailUrl(e.id),
    image: [getEventOgImage(e)],
    startDate: toSchemaDate(e.start_date_time, e.use_start_date_time_yn),
    ...(e.end_date_time
      ? { endDate: toSchemaDate(e.end_date_time, e.use_end_date_time_yn) }
      : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: attendanceMode,
    location: locations.length === 1 ? locations[0] : locations,
    organizer: buildOrganizers(e.organizer),
    ...(offers ? { offers } : {}),
  };
};

export const buildBreadcrumbJsonLd = (e: Event): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '개발자 행사',
      item: `${SITE_URL}/events`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: e.title,
      item: eventDetailUrl(e.id),
    },
  ],
});

/** <script type="application/ld+json"> 안에 넣을 문자열. `<`를 이스케이프해 태그 탈출을 막는다. */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');
