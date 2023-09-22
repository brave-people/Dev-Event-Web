// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookie, { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

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
