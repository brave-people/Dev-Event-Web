import { LoginTokens } from 'lib/auth/tokenCookies';

// 간편 로그인 토큰을 주소(쿼리)에 싣지 않으려고 웹 서버가 API 서버를 대신 부른다 (#377).
// 브라우저가 아니라 웹 서버(getServerSideProps)에서만 부른다.

export const LOGIN_SERVER_TIMEOUT_MS = 5000;
export const LOGIN_CODE_PATH = '/front/v1/auth/token';

export interface ServerReply {
  status: number;
  body: unknown;
}

// API 서버에 JSON을 POST한다. 응답이 없거나 늦으면 던지지 않고 null을 돌려준다.
const postJson = async (
  path: string,
  data: unknown,
  timeoutMs: number
): Promise<ServerReply | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${process.env.BASE_SERVER_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    const body: unknown = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const hasTokens = (body: unknown): body is LoginTokens =>
  typeof body === 'object' &&
  body !== null &&
  typeof (body as LoginTokens).access_token === 'string' &&
  typeof (body as LoginTokens).refresh_token === 'string';

// 간편 로그인: API 서버가 로그인 성공 주소(/?code=…)로 넘긴 일회용 코드를 토큰으로 바꾼다.
// 코드가 만료됐거나 이미 썼거나(400) 서버가 응답하지 않으면 null.
export const exchangeLoginCodeOnServer = async (
  code: string,
  timeoutMs: number = LOGIN_SERVER_TIMEOUT_MS
): Promise<LoginTokens | null> => {
  const reply = await postJson(LOGIN_CODE_PATH, { code }, timeoutMs);
  return reply && reply.status === 200 && hasTokens(reply.body)
    ? reply.body
    : null;
};
