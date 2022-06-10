// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  access_token: string;
};

export default function getToken(req: NextApiRequest, res: NextApiResponse<Data>) {
  const access_token = String(req.cookies.access_token);
  res.status(200).json({ access_token: access_token });
}
