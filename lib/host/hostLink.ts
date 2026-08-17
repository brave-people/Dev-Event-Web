import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';
import type { NextRouter } from 'next/router';

/**
 * 행사에 연결된 첫 번째 주최자의 id.
 * 라우팅 키는 숫자 PK다 — 이름 문자열로 push 하면 상세가 무조건 404 다.
 */
export const getHostIdFromEvent = (event: Pick<Event, 'hosts'>): number | null => {
  const id = event.hosts?.[0]?.id;
  return typeof id === 'number' ? id : null;
};

/** 목록 카드와 행사 상세가 같은 이동 로직·같은 GA 이벤트를 쓰도록 한 곳에 모은다. */
export const pushHostDetail = (
  router: NextRouter,
  event: Pick<Event, 'hosts'>
): boolean => {
  const hostId = getHostIdFromEvent(event);
  if (hostId === null) return false;

  router.push(`/hosts/${hostId}`);
  ga.event({
    action: 'web_event_주최클릭',
    event_category: 'web_event',
    event_label: '주최클릭',
  });
  return true;
};
