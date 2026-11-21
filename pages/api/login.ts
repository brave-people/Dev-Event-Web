import type { NextApiRequest, NextApiResponse } from 'next';
import { hasTokens, loginByEmailOnServer } from 'lib/api/loginServer';
import { tokenCookies } from 'lib/auth/tokenCookies';

// 이메일 로그인 (#377). API 서버에 로그인을 대신 요청하고, 받은 토큰은 브라우저로 넘기지 않고 바로 httpOnly 쿠키로 심는다.
// 실패하면 서버 응답(상태 코드와 본문)을 그대로 돌려준다. 로그인 창이 본문의 status로 문구를 고른다(loginFlow.ts의 authFailure).
export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({});
  }

  const { user_id, password } = req.body ?? {};
  const reply = await loginByEmailOnServer({
    user_id: String(user_id ?? ''),
    password: String(password ?? ''),
  });

  // 서버가 응답하지 않았거나, 성공인데 토큰이 없으면 502(로그인 창은 "잠시 뒤 다시 시도" 문구)
  if (!reply) return res.status(502).json({});
  if (reply.status < 200 || reply.status >= 300) {
    return res.status(reply.status).json(reply.body);
  }
  if (!hasTokens(reply.body)) return res.status(502).json({});

  res.setHeader('Set-Cookie', tokenCookies(reply.body));
  return res.status(200).json({ status_code: 200 });
}
