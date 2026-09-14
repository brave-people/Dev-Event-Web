import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  ORGANIZATION_JSON_LD,
  serializeJsonLd,
  WEBSITE_JSON_LD,
} from 'lib/seo/jsonLd';
import { SITE_URL } from 'lib/seo/site';
import { Event } from 'model/event';

const dateEvent: Event = {
  id: '100',
  title: '테스트 컨퍼런스',
  description: '',
  organizer: '부산일보 / 비온미디어',
  event_link: 'https://example.com/apply',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '월',
  start_date_time: '2026-07-13T10:00',
  end_day_week: '월',
  end_date_time: '2026-07-13T18:00',
  tags: [
    { id: 1, tag_name: '온라인', tag_color: '#000', category: null },
    { id: 2, tag_name: '오프라인', tag_color: '#000', category: null },
    { id: 3, tag_name: '무료', tag_color: '#000', category: null },
  ],
  create_date_time: '2026-07-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
};

describe('buildEventJsonLd', () => {
  it('RECRUIT 행사는 null', () => {
    expect(
      buildEventJsonLd({ ...dateEvent, event_time_type: 'RECRUIT' })
    ).toBeNull();
  });

  it('start_date_time이 없으면 null', () => {
    expect(buildEventJsonLd({ ...dateEvent, start_date_time: '' })).toBeNull();
  });

  it('DATE 행사는 Event 스키마를 만든다 (시간 포함, Mixed, 무료, 복수 주최)', () => {
    const ld = buildEventJsonLd(dateEvent) as any;
    expect(ld['@type']).toBe('Event');
    expect(ld.name).toBe('테스트 컨퍼런스');
    expect(ld.url).toBe(`${SITE_URL}/event/detail/100`);
    expect(ld.startDate).toBe('2026-07-13T10:00+09:00');
    expect(ld.endDate).toBe('2026-07-13T18:00+09:00');
    expect(ld.eventAttendanceMode).toBe(
      'https://schema.org/MixedEventAttendanceMode'
    );
    expect(ld.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(Array.isArray(ld.location)).toBe(true);
    expect(ld.location).toHaveLength(2);
    expect(ld.image[0]).toBe(`${SITE_URL}/default/event-thumbnail-light.png`);
    expect(ld.organizer).toEqual([
      { '@type': 'Organization', name: '부산일보' },
      { '@type': 'Organization', name: '비온미디어' },
    ]);
    expect(ld.offers).toEqual({
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: 'https://example.com/apply',
    });
  });

  it('시간 정보가 없으면 날짜만 넣는다', () => {
    const ld = buildEventJsonLd({
      ...dateEvent,
      use_start_date_time_yn: 'N',
      use_end_date_time_yn: 'N',
    }) as any;
    expect(ld.startDate).toBe('2026-07-13');
    expect(ld.endDate).toBe('2026-07-13');
  });

  it('온라인 태그만 있으면 Online + VirtualLocation', () => {
    const ld = buildEventJsonLd({
      ...dateEvent,
      tags: [{ id: 1, tag_name: '온라인', tag_color: '#000', category: null }],
    }) as any;
    expect(ld.eventAttendanceMode).toBe(
      'https://schema.org/OnlineEventAttendanceMode'
    );
    expect(ld.location).toEqual({
      '@type': 'VirtualLocation',
      url: 'https://example.com/apply',
    });
  });

  it('온라인 태그가 없으면 Offline + Place', () => {
    const ld = buildEventJsonLd({
      ...dateEvent,
      organizer: 'OpenAI',
      tags: [{ id: 2, tag_name: '유료', tag_color: '#000', category: null }],
    }) as any;
    expect(ld.eventAttendanceMode).toBe(
      'https://schema.org/OfflineEventAttendanceMode'
    );
    expect(ld.location).toEqual({
      '@type': 'Place',
      name: 'OpenAI',
      address: { '@type': 'PostalAddress', addressCountry: 'KR' },
    });
  });

  it('유료이거나 가격을 모르면 offers를 생략한다', () => {
    const paid = buildEventJsonLd({
      ...dateEvent,
      tags: [{ id: 2, tag_name: '유료', tag_color: '#000', category: null }],
    }) as any;
    expect(paid.offers).toBeUndefined();
    const unknown = buildEventJsonLd({ ...dateEvent, tags: [] }) as any;
    expect(unknown.offers).toBeUndefined();
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('홈 → 행사 2단계', () => {
    const ld = buildBreadcrumbJsonLd(dateEvent) as any;
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: '개발자 행사',
        item: `${SITE_URL}/events`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '테스트 컨퍼런스',
        item: `${SITE_URL}/event/detail/100`,
      },
    ]);
  });
});

describe('사이트 전역 스키마', () => {
  it('Organization', () => {
    expect(ORGANIZATION_JSON_LD['@type']).toBe('Organization');
    expect(ORGANIZATION_JSON_LD.url).toBe(SITE_URL);
    expect(ORGANIZATION_JSON_LD.sameAs).toContain(
      'https://github.com/brave-people/Dev-Event'
    );
  });
  it('WebSite', () => {
    expect(WEBSITE_JSON_LD['@type']).toBe('WebSite');
    expect(WEBSITE_JSON_LD.inLanguage).toBe('ko-KR');
  });
});

describe('serializeJsonLd', () => {
  it('<를 이스케이프해 script 탈출을 막는다', () => {
    expect(serializeJsonLd({ a: '</script><b>' })).toBe(
      '{"a":"\\u003c/script>\\u003cb>"}'
    );
  });
});
