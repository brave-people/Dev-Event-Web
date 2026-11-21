import type { GetServerSidePropsContext } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { fakeJwt } from 'lib/auth/__tests__/fakeJwt';
import login from 'pages/api/login';
import { getServerSideProps } from 'pages/index';

// 간편 로그인이 돌아오는 / (pages/index.tsx)와 이메일 로그인 라우트(pages/api/login.ts) (#377)

const originalFetch = global.fetch;
const originalBase = process.env.BASE_SERVER_URL;
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  (global as { fetch: unknown }).fetch = mockFetch;
  process.env.BASE_SERVER_URL = 'http://api.test';
});

afterEach(() => {
  (global as { fetch: unknown }).fetch = originalFetch;
  if (originalBase === undefined) delete process.env.BASE_SERVER_URL;
  else process.env.BASE_SERVER_URL = originalBase;
});

const respond = (status: number, body: unknown) => ({
  status,
  json: () => Promise.resolve(body),
});

const ACCESS = fakeJwt(1_800_000_000);
const REFRESH = fakeJwt(1_800_086_400);
const TOKENS = { access_token: ACCESS, refresh_token: REFRESH };

const setCookieOf = (setHeader: jest.Mock): string[] | undefined =>
  setHeader.mock.calls.find(([name]) => name === 'Set-Cookie')?.[1];

describe('/ (간편 로그인 성공 주소)', () => {
  const visit = (query: Record<string, string>) => {
    const setHeader = jest.fn();
    const context = {
      query,
      res: { setHeader },
    } as unknown as GetServerSidePropsContext;
    return { setHeader, result: getServerSideProps(context) };
  };

  it('code를 서버끼리 토큰으로 바꿔 쿠키로 심고 /events 로 보낸다', async () => {
    mockFetch.mockResolvedValue(respond(200, TOKENS));
    const { setHeader, result } = visit({ code: 'abc' });

    expect(await result).toEqual({
      redirect: { destination: '/events', permanent: false },
    });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      code: 'abc',
    });
    const cookies = setCookieOf(setHeader);
    expect(cookies?.[0]).toContain(`access_token=${ACCESS};`);
    expect(cookies?.[1]).toContain(`refresh_token=${REFRESH};`);
  });

  it('만료됐거나 이미 쓴 code면 쿠키 없이 /events 로 보낸다', async () => {
    mockFetch.mockResolvedValue(respond(400, {}));
    const { setHeader, result } = visit({ code: 'used' });

    expect(await result).toEqual({
      redirect: { destination: '/events', permanent: false },
    });
    expect(setCookieOf(setHeader)).toBeUndefined();
  });

  it('예전 방식(accessToken·refreshToken 쿼리)도 전환 기간 동안 받는다', async () => {
    const { setHeader, result } = visit({
      accessToken: ACCESS,
      refreshToken: REFRESH,
    });

    expect(await result).toEqual({
      redirect: { destination: '/events', permanent: false },
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(setCookieOf(setHeader)?.[0]).toContain(`access_token=${ACCESS};`);
  });

  it('로그인 쿼리가 없으면 쿠키 없이 영구 이동한다', async () => {
    const { setHeader, result } = visit({});

    expect(await result).toEqual({
      redirect: { destination: '/events', permanent: true },
    });
    expect(setCookieOf(setHeader)).toBeUndefined();
  });
});

describe('/api/login (아이디 로그인 토큰을 쿠키로)', () => {
  const call = (
    method: string,
    body?: unknown,
    contentType = 'application/json'
  ) => {
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    login(
      {
        method,
        body,
        headers: { 'content-type': contentType },
      } as unknown as NextApiRequest,
      res as unknown as NextApiResponse
    );
    return res;
  };

  it('본문의 토큰을 쿠키로 심고, 응답 본문에는 토큰을 넣지 않는다', () => {
    const res = call('POST', TOKENS);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status_code: 200 });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain(ACCESS);
    const cookies = setCookieOf(res.setHeader);
    expect(cookies?.[0]).toContain(`access_token=${ACCESS};`);
    expect(cookies?.[1]).toContain(`refresh_token=${REFRESH};`);
  });

  it('API 서버를 부르지 않는다(아이디·비밀번호는 이 라우트를 거치지 않음)', () => {
    call('POST', TOKENS);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('JSON이 아닌 요청(다른 사이트의 폼)은 415로 거절한다', () => {
    const res = call('POST', TOKENS, 'application/x-www-form-urlencoded');

    expect(res.status).toHaveBeenCalledWith(415);
    expect(setCookieOf(res.setHeader)).toBeUndefined();
  });

  it('토큰이 없으면 400', () => {
    const res = call('POST', { user_id: 'me', password: 'pw' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(setCookieOf(res.setHeader)).toBeUndefined();
  });

  it('JWT가 아니면(만료 시각을 못 읽으면) 400', () => {
    const res = call('POST', { access_token: 'x', refresh_token: 'y' });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(setCookieOf(res.setHeader)).toBeUndefined();
  });

  it('POST가 아니면 405', () => {
    const res = call('GET');

    expect(res.status).toHaveBeenCalledWith(405);
    expect(setCookieOf(res.setHeader)).toBeUndefined();
  });
});
