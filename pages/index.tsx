import type { GetServerSideProps } from 'next';
import { exchangeLoginCodeOnServer } from 'lib/api/loginServer';
import { LoginTokens, tokenCookies } from 'lib/auth/tokenCookies';

const Index = () => null;

const queryValue = (value: string | string[] | undefined): string | null =>
  typeof value === 'string' && value ? value : null;

// 간편 로그인을 마치면 API 서버가 이 주소로 돌려보낸다. 토큰을 httpOnly 쿠키로 심고 /events 로 보낸다.
// - /?code=… : 일회용 코드를 서버끼리 토큰으로 바꾼다 (#377)
// - /?accessToken=…&refreshToken=… : 서버의 일회용 코드 설정(spring.security.oauth2.login-code.enabled)이 꺼져 있을 때의 예전 방식.
//   서버 설정을 켜고 간편 로그인을 확인한 뒤 이 분기를 지운다.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = queryValue(context.query.code);
  const accessToken = queryValue(context.query.accessToken);
  const refreshToken = queryValue(context.query.refreshToken);

  let tokens: LoginTokens | null = null;
  if (code) {
    tokens = await exchangeLoginCodeOnServer(code);
  } else if (accessToken && refreshToken) {
    tokens = { access_token: accessToken, refresh_token: refreshToken };
  }

  if (tokens) context.res.setHeader('Set-Cookie', tokenCookies(tokens));

  // 로그인하고 돌아온 요청은 영구 이동으로 두지 않는다
  const isLoginReturn = Boolean(code || (accessToken && refreshToken));
  return {
    redirect: {
      destination: '/events',
      permanent: !isLoginReturn,
    },
  };
};

export default Index;
