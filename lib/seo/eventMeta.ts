import { absoluteUrl, DEFAULT_EVENT_THUMBNAIL_PATH } from 'lib/seo/site';
import { formatEventPeriod, getEventTimeLabel } from 'lib/utils/eventDate';
import { Event } from 'model/event';

export const getEventPageTitle = (e: Event): string => `${e.title} | DEV EVENT`;

export const getEventOgImage = (e: Event): string =>
  absoluteUrl(e.cover_image_link || DEFAULT_EVENT_THUMBNAIL_PATH);

const periodSentence = (e: Event): string => {
  const period = formatEventPeriod(e);
  if (!period) return '';
  return e.event_time_type === 'DATE'
    ? `${period}에 열립니다.`
    : `${period} 참가 신청을 받습니다.`;
};

/** <meta name="description">용. 본문 유무와 무관하게 사실 기반 템플릿을 쓴다. */
export const buildEventMetaDescription = (e: Event): string =>
  [
    `${e.organizer} 주최 '${e.title}'.`,
    periodSentence(e),
    '자세한 내용과 참가 방법은 데브이벤트에서 확인하세요.',
  ]
    .filter(Boolean)
    .join(' ');

/** description이 비어 있을 때 본문에 렌더할 자동 요약 (H-6①). */
export const buildEventPlaceholderSummary = (e: Event): string => {
  const tags = (e.tags ?? []).map((t) => t.tag_name).join(' · ');
  const period = formatEventPeriod(e);
  const label = getEventTimeLabel(e.event_time_type);
  return [
    `${e.organizer} 주최 '${e.title}'${tags ? ` (${tags})` : ''} 행사입니다.`,
    period ? `${label}: ${period}.` : '',
    "자세한 프로그램과 참가 방법은 '참여하기' 버튼을 눌러 주최 측 페이지에서 확인해 주세요.",
  ]
    .filter(Boolean)
    .join(' ');
};
