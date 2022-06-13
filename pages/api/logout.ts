// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import cookie, { serialize } from 'cookie';

type Data = {
  message: string;
};

export default function logout(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.setHeader('Set-Cookie', [
    serialize('access_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: -1,
      path: '/',
    }),
    serialize('refresh_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: -1,
      path: '/',
    }),
  ]);

  res.status(200).json({ message: 'SUCCESS' });
}
