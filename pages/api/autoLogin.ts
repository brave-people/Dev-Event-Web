import jwt_decode from 'jwt-decode';

export default async function autoLogin({ token }: { token: string }) {
  if (token) {
    const { exp } = jwt_decode(token) as {
      exp: number;
    };
    if (exp < Date.now() / 1000) {
      //토큰 만료 시 리프레시 토큰 재발급
    } else {
      return 'SUCCESS';
    }
  }
  return 'FAILURE';
}
