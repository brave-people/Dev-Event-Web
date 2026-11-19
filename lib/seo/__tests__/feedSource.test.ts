import {
  FEED_TIMEOUT_MS,
  fetchFeedEvents,
  sendFeedUnavailable,
} from 'lib/seo/feedSource';

const originalFetch = global.fetch;
const originalBase = process.env.BASE_SERVER_URL;
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  (global as { fetch: unknown }).fetch = mockFetch;
  process.env.BASE_SERVER_URL = 'http://api.test';
});

afterEach(() => {
  jest.useRealTimers();
  (global as { fetch: unknown }).fetch = originalFetch;
  if (originalBase === undefined) delete process.env.BASE_SERVER_URL;
  else process.env.BASE_SERVER_URL = originalBase;
});

const respond = (body: unknown, ok = true) => ({
  ok,
  json: () => Promise.resolve(body),
});

const group = (ids: number[]) => ({
  metadata: { total: ids.length, year: 2026, month: 11 },
  dev_event: ids.map((id) => ({ id, title: `행사 ${id}` })),
});

describe('fetchFeedEvents', () => {
  it('현재 행사 목록을 signal 과 함께 한 번 부르고 펼쳐서 돌려준다', async () => {
    mockFetch.mockResolvedValue(respond([group([1, 2]), group([3])]));
    const events = await fetchFeedEvents();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(
      'http://api.test/front/v2/events/current'
    );
    expect(mockFetch.mock.calls[0][1]).toHaveProperty('signal');
    expect(events?.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it('응답이 실패면 null (빈 목록과 구별한다)', async () => {
    mockFetch.mockResolvedValue(respond({}, false));
    expect(await fetchFeedEvents()).toBeNull();
  });

  it('행사가 정말 없으면 빈 배열', async () => {
    mockFetch.mockResolvedValue(respond([]));
    expect(await fetchFeedEvents()).toEqual([]);
  });

  it('요청이 던지거나 JSON 이 깨지면 null', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    expect(await fetchFeedEvents()).toBeNull();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('bad json')),
    });
    expect(await fetchFeedEvents()).toBeNull();
  });

  it(`${FEED_TIMEOUT_MS}ms 안에 답이 없으면 끊고 null`, async () => {
    jest.useFakeTimers();
    let signal: AbortSignal | undefined;
    mockFetch.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal = init.signal;
          init.signal.addEventListener('abort', () =>
            reject(new Error('aborted'))
          );
        })
    );
    const promise = fetchFeedEvents();
    jest.advanceTimersByTime(FEED_TIMEOUT_MS - 1);
    expect(signal?.aborted).toBe(false);
    jest.advanceTimersByTime(1);
    expect(await promise).toBeNull();
    expect(signal?.aborted).toBe(true);
  });

  it('Vercel 함수 제한(10초)보다 먼저 끊는다', () => {
    expect(FEED_TIMEOUT_MS).toBeLessThan(10000);
  });

  it('성공한 뒤 남은 타이머가 없다', async () => {
    jest.useFakeTimers();
    mockFetch.mockResolvedValue(respond([]));
    await fetchFeedEvents();
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('sendFeedUnavailable', () => {
  it('503 으로 답하고 캐시에 남기지 않는다', () => {
    const headers: Record<string, string> = {};
    const res = {
      statusCode: 200,
      setHeader: jest.fn((k: string, v: string) => {
        headers[k] = v;
      }),
      end: jest.fn(),
    };
    sendFeedUnavailable(res as never);
    expect(res.statusCode).toBe(503);
    expect(headers['Cache-Control']).toBe('no-store');
    expect(headers['Retry-After']).toBeDefined();
    expect(res.end).toHaveBeenCalled();
  });
});
