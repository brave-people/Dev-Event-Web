import { serialize } from 'cookie';
import jwt_decode from 'jwt-decode';

export interface LoginTokens {
  access_token: string;
  refresh_token: string;
}

// 쿠키 만료 시각은 토큰(JWT)의 exp를 쓴다
const expiresAt = (token: string): Date => {
  const { exp } = jwt_decode(token) as { exp: number };
  return new Date(exp * 1000);
};

const tokenCookie = (name: string, token: string): string =>
  serialize(name, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    expires: expiresAt(token),
    path: '/',
  });

// 로그인 토큰을 httpOnly 쿠키로 심는 Set-Cookie 값.
// 간편 로그인(pages/index.tsx)과 이메일 로그인(pages/api/login.ts)이 같이 쓴다. 속성은 pages/index.tsx가 쓰던 그대로다.
export const tokenCookies = (tokens: LoginTokens): string[] => [
  tokenCookie('access_token', tokens.access_token),
  tokenCookie('refresh_token', tokens.refresh_token),
];
