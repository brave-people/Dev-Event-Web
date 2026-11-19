import { getServerSideProps as rssProps } from 'pages/rss.xml';
import { getServerSideProps as sitemapProps } from 'pages/sitemap.xml';
import { buildRssXml, buildSitemapXml, flattenEvents } from 'lib/seo/feeds';

const originalFetch = global.fetch;
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  (global as { fetch: unknown }).fetch = mockFetch;
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  (global as { fetch: unknown }).fetch = originalFetch;
  jest.restoreAllMocks();
});

const fakeRes = () => {
  const headers: Record<string, string> = {};
  let body = '';
  const res = {
    statusCode: 200,
    setHeader: (k: string, v: string) => {
      headers[k] = v;
    },
    write: (chunk: string) => {
      body += chunk;
    },
    end: jest.fn(),
  };
  return { res, headers, body: () => body };
};

const DATA = [
  {
    metadata: { total: 2, year: 2026, month: 11 },
    dev_event: [
      { id: 2, title: '둘', create_date_time: '2026-11-02T00:00:00', tags: [] },
      {
        id: 1,
        title: '하나',
        create_date_time: '2026-11-03T00:00:00',
        tags: [],
      },
    ],
  },
];

describe.each([
  ['rss.xml', rssProps, 'application/rss+xml; charset=utf-8'],
  ['sitemap.xml', sitemapProps, 'application/xml; charset=utf-8'],
])('%s', (_name, props, type) => {
  it('행사 목록을 못 받으면 503·no-store 로 답하고 피드를 쓰지 않는다', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });
    const { res, headers, body } = fakeRes();
    await props({ res } as never);
    expect(res.statusCode).toBe(503);
    expect(headers['Cache-Control']).toBe('no-store');
    expect(headers['Content-Type']).toBeUndefined();
    expect(body()).toBe('');
    expect(res.end).toHaveBeenCalled();
  });

  it('받으면 지금처럼 1시간 캐시하는 피드를 쓴다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(DATA),
    });
    const { res, headers, body } = fakeRes();
    await props({ res } as never);
    expect(res.statusCode).toBe(200);
    expect(headers['Content-Type']).toBe(type);
    expect(headers['Cache-Control']).toBe(
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
    expect(body().length).toBeGreaterThan(0);
  });
});

it('rss.xml 본문은 최신 등록 순으로 만든 buildRssXml 결과와 같다', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(DATA) });
  const { res, body } = fakeRes();
  await rssProps({ res } as never);
  const sorted = flattenEvents(DATA as never).sort((a, b) =>
    a.create_date_time < b.create_date_time ? 1 : -1
  );
  expect(body()).toBe(buildRssXml(sorted));
});

it('sitemap.xml 본문은 buildSitemapXml 결과와 같다', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(DATA) });
  const { res, body } = fakeRes();
  await sitemapProps({ res } as never);
  expect(body()).toBe(buildSitemapXml(flattenEvents(DATA as never)));
});
