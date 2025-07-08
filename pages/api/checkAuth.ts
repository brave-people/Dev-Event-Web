import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type Data = {
  isLoggedIn: boolean;
  message?: string;
};

export default function checkAuth(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // 쿠키에서 access_token 확인
    const cookies = cookie.parse(req.headers.cookie || '');
    const accessToken = cookies.access_token;
    
    if (accessToken) {
      res.status(200).json({ 
        isLoggedIn: true, 
        message: 'User is logged in' 
      });
    } else {
      res.status(200).json({ 
        isLoggedIn: false, 
        message: 'User is not logged in' 
      });
    }
  } catch (error) {
    res.status(200).json({ 
      isLoggedIn: false, 
      message: 'Error checking auth status' 
    });
  }
} 