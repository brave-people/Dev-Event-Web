// 테스트용 JWT. 서명 검사는 하지 않으므로 exp만 담은 모양이면 된다
export const fakeJwt = (exp: number): string => {
  const part = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `${part({ alg: 'HS256', typ: 'JWT' })}.${part({ exp })}.sig`;
};
