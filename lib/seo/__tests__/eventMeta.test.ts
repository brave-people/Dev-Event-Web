import {
  buildEventMetaDescription,
  buildEventPlaceholderSummary,
  getEventOgImage,
  getEventPageTitle,
} from 'lib/seo/eventMeta';
import { SITE_URL } from 'lib/seo/site';
import { Event } from 'model/event';

// NOTE: model/calender.ts의 WeekType이 '월'|'화'|'수'만 정의하고 있어 (기존 버그, 이 브리프
// 범위 밖) 브리프 원문의 '금'을 그대로 쓰면 tsc가 실패한다. 값 표시용 필드라 로직에 영향이
// 없으므로 최소 침습으로 캐스팅만 한다.
const base: Event = {
  id: '3212',
  title: 'OpenAI DevDay Exchange 2026 - 서울',
  description: '',
  organizer: 'OpenAI',
  event_link: 'https://events.openai.com/devdayexchange2026/',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '수',
  start_date_time: '2026-08-19T00:00',
  end_day_week: '금' as Event['end_day_week'],
  end_date_time: '2026-09-04T23:59',
  tags: [
    { id: 5, tag_name: '오프라인', tag_color: '#F0977B', category: null },
    { id: 46, tag_name: '무료', tag_color: '#6DC670', category: null },
    { id: 64, tag_name: '세미나', tag_color: '#667CF1', category: null },
  ],
  create_date_time: '2026-08-19T09:47',
  use_start_date_time_yn: 'N',
  use_end_date_time_yn: 'N',
};

describe('eventMeta', () => {
  it('RECRUIT 행사 description은 접수 기간 문장', () => {
    expect(buildEventMetaDescription(base)).toBe(
      "OpenAI 주최 'OpenAI DevDay Exchange 2026 - 서울'. 2026.08.19 (수) ~ 2026.09.04 (금) 참가 신청을 받습니다. 자세한 내용과 참가 방법은 데브이벤트에서 확인하세요."
    );
  });

  it('DATE 행사 description은 개최 문장', () => {
    expect(
      buildEventMetaDescription({ ...base, event_time_type: 'DATE' })
    ).toContain('2026.08.19 (수) ~ 2026.09.04 (금)에 열립니다.');
  });

  it('플레이스홀더 요약은 주최·태그·기간을 담고 "준비중" 문구가 없다', () => {
    const s = buildEventPlaceholderSummary(base);
    expect(s).toContain('OpenAI');
    expect(s).toContain('오프라인 · 무료 · 세미나');
    expect(s).toContain('2026.08.19 (수) ~ 2026.09.04 (금)');
    expect(s).not.toContain('준비중');
  });

  it('og 이미지는 항상 절대 URL', () => {
    expect(getEventOgImage(base)).toBe(
      `${SITE_URL}/default/event-thumbnail-light.png`
    );
    const s3 = 'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/x.png';
    expect(getEventOgImage({ ...base, cover_image_link: s3 })).toBe(s3);
  });

  it('페이지 title', () => {
    expect(getEventPageTitle(base)).toBe(
      'OpenAI DevDay Exchange 2026 - 서울 | DEV EVENT'
    );
  });
});
