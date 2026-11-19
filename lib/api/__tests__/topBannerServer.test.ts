import {
  TOP_BANNER_TIMEOUT_MS,
  fetchTopBannersOnServer,
} from 'lib/api/topBannerServer';

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

describe('fetchTopBannersOnServer', () => {
  it('배너 주소를 signal과 함께 한 번 부른다', async () => {
    mockFetch.mockResolvedValue(respond([]));
    await fetchTopBannersOnServer();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe('http://api.test/banner/top');
    expect(mockFetch.mock.calls[0][1]).toHaveProperty('signal');
  });

  it('배열을 거른다', async () => {
    mockFetch.mockResolvedValue(
      respond([{ id: 1, title: 'a' }, { id: 2 }, { id: 3, title: 'c' }])
    );
    const result = await fetchTopBannersOnServer();
    expect(result.map((b) => b.id)).toEqual([1, 3]);
  });

  it('빈 배열과 배열이 아닌 본문은 []', async () => {
    mockFetch.mockResolvedValueOnce(respond([]));
    expect(await fetchTopBannersOnServer()).toEqual([]);
    mockFetch.mockResolvedValueOnce(respond({ message: 'x' }));
    expect(await fetchTopBannersOnServer()).toEqual([]);
  });

  it('ok가 아니면 []', async () => {
    mockFetch.mockResolvedValue(respond([{ id: 1, title: 'a' }], false));
    expect(await fetchTopBannersOnServer()).toEqual([]);
  });

  it('fetch가 거절되면 []', async () => {
    mockFetch.mockRejectedValue(new Error('network'));
    expect(await fetchTopBannersOnServer()).toEqual([]);
  });

  it('json()이 거절되면 []', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('html')),
    });
    expect(await fetchTopBannersOnServer()).toEqual([]);
  });

  it('2초에서 끊는다', async () => {
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
    let done = false;
    const promise = fetchTopBannersOnServer().then((r) => {
      done = true;
      return r;
    });
    expect(TOP_BANNER_TIMEOUT_MS).toBe(2000);

    jest.advanceTimersByTime(1999);
    await Promise.resolve();
    await Promise.resolve();
    expect(done).toBe(false);
    expect(signal?.aborted).toBe(false);

    jest.advanceTimersByTime(1);
    expect(await promise).toEqual([]);
    expect(signal?.aborted).toBe(true);
  });

  it('성공한 뒤 남은 타이머가 없다', async () => {
    jest.useFakeTimers();
    mockFetch.mockResolvedValue(respond([]));
    await fetchTopBannersOnServer();
    expect(jest.getTimerCount()).toBe(0);
  });
});
