import {
  buildIcsForEvent,
  buildGoogleCalendarUrl,
  isAllDayEvent,
} from '../calendar';
import { Event } from 'model/event';

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '123',
  title: 'FEConf Korea 2026',
  description: '프론트엔드 컨퍼런스',
  organizer: '코엑스 그랜드볼룸',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 1,
  event_time_type: 'DATE',
  start_day_week: 'MON' as never,
  start_date_time: '2026-05-18T01:00:00.000Z',
  end_day_week: 'MON' as never,
  end_date_time: '2026-05-18T09:00:00.000Z',
  tags: [],
  create_date_time: '2026-01-01T00:00:00.000Z',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...overrides,
});

describe('isAllDayEvent', () => {
  it('treats use_start_date_time_yn === "N" as all-day', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'Y',
      })
    ).toBe(true);
  });

  it('treats use_end_date_time_yn === "N" as all-day', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'N',
      })
    ).toBe(true);
  });

  it('returns false when both Y', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toBe(false);
  });
});

describe('buildIcsForEvent', () => {
  it('includes VCALENDAR/VEVENT envelopes', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('uses DTSTART/DTEND with UTC time for timed events', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
  });

  it('uses DATE form for all-day events and adds 1 local day to DTEND', () => {
    // Use TZ-naive date strings so getFullYear/Month/Date resolve to 5/18 in any locale.
    const ics = buildIcsForEvent(
      makeEvent({
        start_date_time: '2026-05-18T00:00:00',
        end_date_time: '2026-05-18T23:59:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      })
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:20260518');
    expect(ics).toContain('DTEND;VALUE=DATE:20260519');
  });

  it('escapes commas, semicolons, and backslashes in summary/description', () => {
    const ics = buildIcsForEvent(
      makeEvent({
        title: 'A, B; C\\D',
        description: 'line1\nline2',
      })
    );
    expect(ics).toContain('SUMMARY:A\\, B\\; C\\\\D');
    expect(ics).toContain('line1\\nline2');
  });

  it('embeds a 30-minute VALARM', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(ics).toContain('END:VALARM');
  });

  it('embeds baseUrl link when given', () => {
    const ics = buildIcsForEvent(makeEvent(), 'https://dev-event.vercel.app');
    expect(ics).toContain('URL:https://dev-event.vercel.app/event/detail/123');
  });

  it('uses CRLF line endings per RFC 5545', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toMatch(/\r\n/);
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('returns a calendar.google.com TEMPLATE URL', () => {
    const url = buildGoogleCalendarUrl(makeEvent());
    expect(url).toMatch(
      /^https:\/\/calendar\.google\.com\/calendar\/render\?/
    );
    expect(url).toContain('action=TEMPLATE');
  });

  it('encodes the title in text param', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({ title: 'FEConf 2026' })
    );
    // URLSearchParams form-encodes spaces as '+'.
    expect(url).toContain('text=FEConf+2026');
  });

  it('uses UTC datetime range for timed events', () => {
    const url = buildGoogleCalendarUrl(makeEvent());
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/);
  });

  it('uses date-only range with exclusive end for all-day events', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({
        start_date_time: '2026-05-18T00:00:00',
        end_date_time: '2026-05-18T23:59:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      })
    );
    expect(url).toContain('dates=20260518%2F20260519');
  });

  it('passes organizer as location', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({ organizer: '코엑스' })
    );
    expect(decodeURIComponent(url)).toContain('location=코엑스');
  });

  it('uses UTC datetime for timed events regardless of host TZ', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({
        start_date_time: '2026-05-18T01:00:00.000Z',
        end_date_time: '2026-05-18T09:00:00.000Z',
      })
    );
    expect(url).toContain('dates=20260518T010000Z%2F20260518T090000Z');
  });
});

// 등록 스크립트·어드민 에디터가 description에 넣는 본문 이미지와 같은 모양 (주소 106자)
const detailImage = (alt: string, seq = 1) =>
  `![${alt}](https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT_DETAIL/2026-10-09-14-30-120${seq}-1a2b3c4${seq}.jpg)`;

describe('캘린더 설명의 본문 이미지', () => {
  const BASE_URL = 'https://dev-event.vercel.app';

  const detailsOf = (description: string, baseUrl = '') =>
    new URL(
      buildGoogleCalendarUrl(makeEvent({ description }), baseUrl)
    ).searchParams.get('details');

  // 등록 스크립트 형식: 맨 위에 이미지마다 빈 줄로 띄운다. 한 줄 약 130자라 4장이면 500자를 넘는다.
  const leadingImages = [
    detailImage('행사 개요와 일정을 정리한 안내 포스터', 1),
    detailImage('세션별 발표 시간과 연사를 정리한 시간표', 2),
    detailImage('행사장 위치와 찾아오는 길을 그린 약도', 3),
    detailImage('참가 신청 방법과 경품 안내를 담은 이미지', 4),
  ];

  it('맨 위에 이미지가 여러 장 있어도 요약이 들어간다', () => {
    const description = [
      ...leadingImages,
      'AI 에이전트를 실무에 도입한 사례를 나누는 오프라인 밋업입니다.',
      '## 이런 분께 추천해요\n- LLM 서비스를 운영하는 백엔드 개발자',
    ].join('\n\n');

    expect(detailsOf(description)).toBe(
      'AI 에이전트를 실무에 도입한 사례를 나누는 오프라인 밋업입니다.\n\n' +
        '## 이런 분께 추천해요\n- LLM 서비스를 운영하는 백엔드 개발자'
    );
  });

  it('빈 줄 없이 한 줄에 하나씩 넣은 이미지도 지운다', () => {
    // 어드민 에디터 형식: 이미지마다 줄바꿈 하나, 바로 다음 줄에 글이 이어진다
    const description = [
      detailImage('포스터.png', 1),
      detailImage('타임테이블.png', 2),
      '프론트엔드 개발자를 위한 네트워킹 밋업입니다.',
      '저녁 식사가 제공됩니다.',
    ].join('\n');

    expect(detailsOf(description)).toBe(
      '프론트엔드 개발자를 위한 네트워킹 밋업입니다.\n저녁 식사가 제공됩니다.'
    );
  });

  it('글 사이에 섞인 이미지도 지운다', () => {
    const badge = detailImage('무료 배지', 1);
    const map = detailImage('약도.png', 2);
    const description = [
      `참가비는 무료입니다. ${badge} 선착순 100명까지 받습니다.`,
      `오시는 길 ${map}`,
      '주차는 지원하지 않습니다.',
    ].join('\n');

    expect(detailsOf(description)).toBe(
      '참가비는 무료입니다. 선착순 100명까지 받습니다.\n' +
        '오시는 길\n' +
        '주차는 지원하지 않습니다.'
    );
  });

  it('이미지를 지운 자리에 빈 줄을 남기지 않는다', () => {
    const description = [
      '첫 문단입니다.',
      '',
      detailImage('행사 사진', 1),
      '',
      '둘째 문단입니다.',
      `${detailImage('구분선.png', 2)} ${detailImage('구분선.png', 3)}`,
      '셋째 줄입니다.',
    ].join('\n');

    expect(detailsOf(description)).toBe(
      '첫 문단입니다.\n\n둘째 문단입니다.\n셋째 줄입니다.'
    );
  });

  it('설명에 대괄호나 역슬래시가 들어간 이미지도 지운다', () => {
    const description = [
      // 등록 스크립트는 설명 안의 [ ] \ 를 이스케이프한다
      detailImage('세션 \\[1부\\] 시간표', 1),
      detailImage('경로 C:\\\\', 2),
      // 어드민 에디터는 파일명을 그대로 넣는다
      detailImage('[포스터]행사 안내.png', 3),
      '본문입니다.',
    ].join('\n');

    expect(detailsOf(description)).toBe('본문입니다.');
  });

  it('본문이 이미지뿐이면 자세히 보기 링크만 남는다', () => {
    const description = leadingImages.join('\n\n');

    expect(detailsOf(description, BASE_URL)).toBe(
      '자세히 보기: https://dev-event.vercel.app/event/detail/123'
    );
  });

  it('500자 제한은 이미지를 뺀 글에 적용한다', () => {
    const description = [...leadingImages, '가'.repeat(600)].join('\n\n');

    expect(detailsOf(description)).toBe('가'.repeat(500));
  });

  it('ICS DESCRIPTION에도 이미지를 뺀 설명이 들어간다', () => {
    const event = makeEvent({
      description: [...leadingImages, '요약입니다.'].join('\n\n'),
    });
    const descriptionLine = buildIcsForEvent(event, BASE_URL)
      .split('\r\n')
      .find((line) => line.startsWith('DESCRIPTION:'));

    expect(descriptionLine).toBe(
      'DESCRIPTION:요약입니다.\\n\\n자세히 보기: https://dev-event.vercel.app/event/detail/123'
    );
  });
});
