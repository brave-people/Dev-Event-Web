// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  refresh_token: string;
};

export default function getRefreshToken(req: NextApiRequest, res: NextApiResponse<Data>) {
  const refresh_token = String(req.cookies.refresh_token);
  res.status(200).json({ refresh_token: refresh_token });
}
