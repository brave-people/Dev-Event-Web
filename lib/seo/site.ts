// 서비스 절대 URL. Vercel 환경변수 NEXT_PUBLIC_BASE_URL이 없으면 운영 도메인을 쓴다.
// (2026-09-07 기준 Vercel에 NEXT_PUBLIC_BASE_URL이 설정돼 있지 않아 og:url이 "undefined/..."로 렌더됐다.)
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://dev-event.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = '데브이벤트';
export const SITE_TITLE = 'Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!';
export const DEFAULT_OG_IMAGE_PATH = '/default/og_image.png';
export const DEFAULT_EVENT_THUMBNAIL_PATH =
  '/default/event-thumbnail-light.png';

export const absoluteUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) return `${SITE_URL}${DEFAULT_EVENT_THUMBNAIL_PATH}`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

export const eventDetailUrl = (id: string | number): string =>
  `${SITE_URL}/event/detail/${id}`;
