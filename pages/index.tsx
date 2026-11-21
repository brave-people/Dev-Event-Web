import type { GetServerSideProps } from 'next';
import { exchangeLoginCodeOnServer } from 'lib/api/loginServer';
import { tokenCookies } from 'lib/auth/tokenCookies';

const Index = () => null;

const queryValue = (value: string | string[] | undefined): string | null =>
  typeof value === 'string' && value ? value : null;

// 간편 로그인을 마치면 API 서버가 /?code=… 로 돌려보낸다 (#377).
// 일회용 코드를 서버끼리 토큰으로 바꿔 httpOnly 쿠키로 심고 /events 로 보낸다.
// 토큰을 주소에 싣던 예전 방식(/?accessToken=…&refreshToken=…)은 받지 않는다.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = queryValue(context.query.code);

  const tokens = code ? await exchangeLoginCodeOnServer(code) : null;
  if (tokens) context.res.setHeader('Set-Cookie', tokenCookies(tokens));

  // 로그인하고 돌아온 요청은 영구 이동으로 두지 않는다
  return {
    redirect: {
      destination: '/events',
      permanent: !code,
    },
  };
};

export default Index;
