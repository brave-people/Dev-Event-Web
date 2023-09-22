// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookie, { serialize } from 'cookie';
import dayjs from 'dayjs';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function autoLogin(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.setHeader('Set-Cookie', [
    serialize('access_token', String(req.body.param.result.access_token), {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(req.body.param.result.access_token_expired_at),
      secure: true,
      path: '/',
    }),
    serialize('refresh_token', String(req.body.param.result.refresh_token), {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      expires: new Date(req.body.param.result.refresh_token_expired_at),
      path: '/',
    }),
  ]);

  res.status(200).json({ message: 'SUCCESS' });
}
