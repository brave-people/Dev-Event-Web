import { serialize } from 'cookie';
import jwt_decode from 'jwt-decode';
import type { GetServerSideProps } from 'next';

const Index = () => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.query.accessToken && context.query.refreshToken) {
    const { exp: access_token_expired_at } = jwt_decode(
      String(context.query.accessToken)
    ) as { exp: number };
    const { exp: refresh_token_expired_at } = jwt_decode(
      String(context.query.refreshToken)
    ) as { exp: number };

    context.res.setHeader('Set-Cookie', [
      serialize('access_token', String(context.query.accessToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(access_token_expired_at * 1000),
        path: '/',
      }),
      serialize('refresh_token', String(context.query.refreshToken), {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        expires: new Date(refresh_token_expired_at * 1000),
        path: '/',
      }),
    ]);
  }

  return {
    redirect: {
      destination: '/events',
      permanent: false,
    },
  };
};

export default Index;
