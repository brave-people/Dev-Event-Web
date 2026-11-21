import {
  LOGIN_CODE_PATH,
  exchangeLoginCodeOnServer,
} from 'lib/api/loginServer';

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

const respond = (status: number, body: unknown) => ({
  status,
  json: () => Promise.resolve(body),
});

const TOKENS = {
  access_token: 'access',
  refresh_token: 'refresh',
  access_token_expired_at: 1,
  refresh_token_expired_at: 2,
};

describe('exchangeLoginCodeOnServer', () => {
  it('코드를 JSON으로 POST한다', async () => {
    mockFetch.mockResolvedValue(respond(200, TOKENS));
    await exchangeLoginCodeOnServer('abc');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`http://api.test${LOGIN_CODE_PATH}`);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body)).toEqual({ code: 'abc' });
  });

  it('성공하면 토큰을 돌려준다', async () => {
    mockFetch.mockResolvedValue(respond(200, TOKENS));
    await expect(exchangeLoginCodeOnServer('abc')).resolves.toEqual(TOKENS);
  });

  it('만료됐거나 이미 쓴 코드(400)면 null', async () => {
    mockFetch.mockResolvedValue(
      respond(400, { status_code: 400, status: 'FRONT_OAUTH_400_01' })
    );
    await expect(exchangeLoginCodeOnServer('abc')).resolves.toBeNull();
  });

  it('성공인데 토큰이 없으면 null', async () => {
    mockFetch.mockResolvedValue(respond(200, {}));
    await expect(exchangeLoginCodeOnServer('abc')).resolves.toBeNull();
  });

  it('서버가 응답하지 않으면 던지지 않고 null', async () => {
    mockFetch.mockRejectedValue(new TypeError('network'));
    await expect(exchangeLoginCodeOnServer('abc')).resolves.toBeNull();
  });

  it('늦으면 요청을 끊고 null', async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) =>
          init.signal.addEventListener('abort', () =>
            reject(new Error('aborted'))
          )
        )
    );
    const result = exchangeLoginCodeOnServer('abc', 100);
    jest.advanceTimersByTime(100);
    await expect(result).resolves.toBeNull();
  });
});
