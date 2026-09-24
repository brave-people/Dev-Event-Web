import {
  buildRssXml,
  buildSitemapXml,
  escapeXml,
  flattenEvents,
} from 'lib/seo/feeds';
import { SITE_URL } from 'lib/seo/site';
import { Event, EventResponse } from 'model/event';

const ev = (id: string, title: string): Event => ({
  id,
  title,
  description: '',
  organizer: 'OpenAI',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '수',
  start_date_time: '2026-08-19T00:00',
  end_day_week: '금' as any, // WeekType이 '월'|'화'|'수'만 허용 (model/calender.ts) — 브리프 그대로면 컴파일 실패해 최소 캐스트로 우회

  end_date_time: '2026-09-04T23:59',
  tags: [],
  create_date_time: '2026-08-19T09:47',
  use_start_date_time_yn: 'N',
  use_end_date_time_yn: 'N',
});

describe('escapeXml', () => {
  it('&, <, >, ", \' 를 이스케이프한다', () => {
    expect(escapeXml(`A & B <c> "d" 'e'`)).toBe(
      'A &amp; B &lt;c&gt; &quot;d&quot; &apos;e&apos;'
    );
  });
});

describe('flattenEvents', () => {
  it('월 그룹을 평탄화하고 id 중복을 제거한다', () => {
    const res: EventResponse[] = [
      {
        metadata: { total: 1, year: 2026, month: 9 } as any,
        dev_event: [ev('1', 'a')],
      },
      {
        metadata: { total: 1, year: 2026, month: 10 } as any,
        dev_event: [ev('1', 'a'), ev('2', 'b')],
      },
    ];
    expect(flattenEvents(res).map((e) => e.id)).toEqual(['1', '2']);
  });
});

describe('buildSitemapXml', () => {
  it('고정 URL 2개 + 행사 URL, lastmod는 create_date_time 날짜', () => {
    const xml = buildSitemapXml([ev('3212', 'x & y')]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(`<loc>${SITE_URL}/events</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/about</loc>`);
    expect(xml).toContain(
      `<url><loc>${SITE_URL}/event/detail/3212</loc><lastmod>2026-08-19</lastmod></url>`
    );
  });

  it('create_date_time이 빈 문자열이면 lastmod 없이 loc만 넣는다', () => {
    const xml = buildSitemapXml([{ ...ev('3212', 'x'), create_date_time: '' }]);
    expect(xml).toContain(
      `<url><loc>${SITE_URL}/event/detail/3212</loc></url>`
    );
    expect(xml).not.toContain('lastmod');
  });
});

describe('buildRssXml', () => {
  it('요약 전용 item을 만든다 (본문 미포함, 링크는 상세 페이지)', () => {
    const xml = buildRssXml([
      { ...ev('3212', 'OpenAI <DevDay>'), description: '본문 전체 텍스트' },
    ]);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(
      `<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>`
    );
    expect(xml).toContain('<title>OpenAI &lt;DevDay&gt;</title>');
    expect(xml).toContain(`<link>${SITE_URL}/event/detail/3212</link>`);
    expect(xml).toContain(
      `<guid isPermaLink="true">${SITE_URL}/event/detail/3212</guid>`
    );
    expect(xml).toContain('<pubDate>Wed, 19 Aug 2026 00:47:00 GMT</pubDate>');
    expect(xml).not.toContain('본문 전체 텍스트');
  });

  it('create_date_time이 파싱 불가능하면 pubDate 없이 item을 만든다', () => {
    const xml = buildRssXml([
      { ...ev('3212', 'OpenAI DevDay'), create_date_time: 'garbage' },
    ]);
    expect(xml).toContain('<item>');
    expect(xml).not.toContain('<pubDate>');
    expect(xml).not.toContain('Invalid Date');
  });

  // W3C Feed Validator 기준 (#155). 문자열 비교가 아니라 실제 XML·HTML 파서로 해석해 검증한다.
  const DC_NS = 'http://purl.org/dc/elements/1.1/';

  const parseXml = (xml: string): Document => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const error = doc.getElementsByTagName('parsererror')[0];
    if (error) throw new Error(`XML 파싱 실패: ${error.textContent}`);
    return doc;
  };

  it('주최자는 dc:creator로 내보내고, 이메일 전용인 author는 쓰지 않는다 (InvalidContact)', () => {
    const doc = parseXml(
      buildRssXml([
        {
          ...ev('3353', '쿤텍 AI 보안 세미나'),
          organizer: '한빛미디어 & 파트너스',
        },
      ])
    );
    const item = doc.getElementsByTagName('item')[0];

    expect(item.getElementsByTagNameNS(DC_NS, 'creator')[0]?.textContent).toBe(
      '한빛미디어 & 파트너스'
    );
    expect(item.getElementsByTagName('author')).toHaveLength(0);
  });

  it('description을 HTML로 해석해도 꺾쇠가 든 제목이 그대로 보인다 (NotHtml)', () => {
    const title = '<AI Agent> 실전 & <클로드 코드 마스터> 세미나';
    const doc = parseXml(buildRssXml([ev('3354', title)]));
    const item = doc.getElementsByTagName('item')[0];
    const descriptionHtml =
      item.getElementsByTagName('description')[0].textContent ?? '';

    const rendered = new DOMParser().parseFromString(
      descriptionHtml,
      'text/html'
    ).body;

    expect(rendered.textContent).toContain(title);
    expect(rendered.children).toHaveLength(0);
  });
});
