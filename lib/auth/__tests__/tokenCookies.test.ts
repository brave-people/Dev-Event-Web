import { fakeJwt } from 'lib/auth/__tests__/fakeJwt';
import { tokenCookies } from 'lib/auth/tokenCookies';

describe('tokenCookies', () => {
  const ACCESS_EXP = 1_800_000_000;
  const REFRESH_EXP = 1_800_086_400;
  const access = fakeJwt(ACCESS_EXP);
  const refresh = fakeJwt(REFRESH_EXP);

  it('access·refresh 토큰을 쿠키 두 개로 만든다', () => {
    const [accessCookie, refreshCookie] = tokenCookies({
      access_token: access,
      refresh_token: refresh,
    });
    expect(accessCookie.startsWith(`access_token=${access};`)).toBe(true);
    expect(refreshCookie.startsWith(`refresh_token=${refresh};`)).toBe(true);
  });

  it('자바스크립트가 못 읽게 httpOnly로, 전과 같은 속성으로 심는다', () => {
    for (const cookie of tokenCookies({
      access_token: access,
      refresh_token: refresh,
    })) {
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
    }
  });

  it('만료 시각은 토큰의 exp를 쓴다', () => {
    const [accessCookie, refreshCookie] = tokenCookies({
      access_token: access,
      refresh_token: refresh,
    });
    expect(accessCookie).toContain(
      `Expires=${new Date(ACCESS_EXP * 1000).toUTCString()}`
    );
    expect(refreshCookie).toContain(
      `Expires=${new Date(REFRESH_EXP * 1000).toUTCString()}`
    );
  });
});
