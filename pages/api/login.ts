import type { NextApiRequest, NextApiResponse } from 'next';
import { hasTokens } from 'lib/api/loginServer';
import { tokenCookies } from 'lib/auth/tokenCookies';

// 아이디 로그인 (#377). 브라우저가 API 서버에서 받은 토큰을 주소 대신 요청 본문으로 받아 httpOnly 쿠키로 심는다.
// 아이디·비밀번호는 브라우저가 API 서버로 바로 보내고 이 라우트(Vercel)를 거치지 않는다
// (개인정보 처리방침의 국외 이전 항목: Vercel에는 접속 기록과 로그인 유지 쿠키만 감).
// JSON 요청만 받는다. 다른 사이트의 폼이 남의 토큰을 심는 것(로그인 CSRF)을 막기 위해서다:
// 다른 출처의 JSON 요청은 브라우저가 사전 요청(preflight)에서 막는다.
export default function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({});
  }
  if (
    !String(req.headers['content-type'] ?? '').startsWith('application/json')
  ) {
    return res.status(415).json({});
  }

  const body: unknown = req.body;
  if (!hasTokens(body)) return res.status(400).json({});

  let cookies: string[];
  try {
    cookies = tokenCookies({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    });
  } catch {
    // JWT가 아니거나 exp가 없으면 쿠키 만료 시각을 정할 수 없다
    return res.status(400).json({});
  }

  res.setHeader('Set-Cookie', cookies);
  return res.status(200).json({ status_code: 200 });
}
