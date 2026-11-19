import type { ServerResponse } from 'http';
import { flattenEvents } from 'lib/seo/feeds';
import { Event } from 'model/event';

// Vercel 함수 제한 시간(기본 10초)보다 먼저 끊어서, 시간 초과(504) 대신 우리가 정한 실패 응답을 낸다
export const FEED_TIMEOUT_MS = 8000;

// rss.xml·sitemap.xml 이 쓰는 현재 행사 목록. 실패하면 null 을 돌려준다.
// 빈 배열(정말 행사가 없음)과 구별해야, 실패한 결과가 빈 피드로 캐시되지 않는다.
export const fetchFeedEvents = async (
  timeoutMs: number = FEED_TIMEOUT_MS
): Promise<Event[] | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/current`,
      { signal: controller.signal }
    );
    if (!response.ok) return null;
    return flattenEvents(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

// 목록을 못 받았을 때: 503 으로 답하고 CDN·브라우저 캐시에 남기지 않는다.
// 피드 리더와 검색 로봇은 나중에 다시 오고, CDN 은 그동안 예전 피드를 계속 줄 수 있다.
export const sendFeedUnavailable = (
  res: Pick<ServerResponse, 'statusCode' | 'setHeader' | 'end'>
): void => {
  res.statusCode = 503;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Retry-After', '120');
  res.end();
};
