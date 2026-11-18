import {
  focusAfter,
  INITIAL_LOGIN_STATE,
  loginError,
  LoginState,
  nextLoginState,
  signUpError,
  SOCIAL_LABEL,
  SOCIAL_MORE,
  SOCIAL_PRIMARY,
  socialLoginUrl,
} from 'components/common/modal/login/loginFlow';

const MAIN: LoginState = { view: 'main', moreOpen: false };
const MAIN_OPEN: LoginState = { view: 'main', moreOpen: true };
const EMAIL: LoginState = { view: 'email', moreOpen: false };
const JOIN: LoginState = { view: 'join', moreOpen: false };

// 지금 코드(LoginModal.tsx)의 알림 문구 그대로
const NO_ID = '아이디를 입력해주세요!';
const NO_PW = '비밀번호를 입력해주세요!';
const NOT_ALL = '모두 입력해주세요!';
const PW_LENGTH = '비밀번호는 6에서 15자로 입력해주세요!';

describe('화면 전환', () => {
  it('처음에는 처음 화면이고 다른 방법은 접혀 있다', () => {
    expect(INITIAL_LOGIN_STATE).toEqual(MAIN);
  });

  it('"이메일로 로그인"은 로그인 입력 화면으로 간다', () => {
    expect(nextLoginState(MAIN, 'openEmail')).toEqual(EMAIL);
  });

  it('"이메일로 가입"은 처음 화면과 로그인 입력 화면에서 가입 화면으로 간다', () => {
    expect(nextLoginState(MAIN, 'openJoin')).toEqual(JOIN);
    expect(nextLoginState(EMAIL, 'openJoin')).toEqual(JOIN);
  });

  it('"다른 방법으로"·"간편 로그인으로"는 처음 화면으로 돌아간다', () => {
    expect(nextLoginState(EMAIL, 'back')).toEqual(MAIN);
    expect(nextLoginState(JOIN, 'back')).toEqual(MAIN);
  });

  it('가입이 끝나면 로그인 입력 화면으로 간다 (지금 코드와 같다)', () => {
    expect(nextLoginState(JOIN, 'joined')).toEqual(EMAIL);
  });

  it('"다른 방법으로 로그인"은 누를 때마다 펼치고 접는다', () => {
    expect(nextLoginState(MAIN, 'toggleMore')).toEqual(MAIN_OPEN);
    expect(nextLoginState(MAIN_OPEN, 'toggleMore')).toEqual(MAIN);
  });

  it('펼친 채로 입력 화면에 다녀와도 펼쳐져 있다', () => {
    const email = nextLoginState(MAIN_OPEN, 'openEmail');
    expect(email).toEqual({ view: 'email', moreOpen: true });
    expect(nextLoginState(email, 'back')).toEqual(MAIN_OPEN);
  });

  it('입력 화면에서는 펼치기가 듣지 않는다', () => {
    expect(nextLoginState(EMAIL, 'toggleMore')).toEqual(EMAIL);
    expect(nextLoginState(JOIN, 'toggleMore')).toEqual(JOIN);
  });

  it('넘겨받은 상태를 고치지 않는다', () => {
    const before: LoginState = { view: 'main', moreOpen: false };
    nextLoginState(before, 'toggleMore');
    nextLoginState(before, 'openEmail');
    expect(before).toEqual({ view: 'main', moreOpen: false });
  });
});

describe('화면이 바뀐 뒤 포커스가 갈 곳', () => {
  it('입력 화면으로 가면 첫 입력란', () => {
    expect(focusAfter('openEmail', EMAIL)).toBe('emailFirstInput');
    expect(focusAfter('joined', EMAIL)).toBe('emailFirstInput');
    expect(focusAfter('openJoin', JOIN)).toBe('joinFirstInput');
  });

  it('처음 화면으로 돌아오면 "이메일로 로그인" 버튼', () => {
    expect(focusAfter('back', MAIN)).toBe('emailButton');
  });

  it('펼치면 펼쳐진 첫 버튼, 접으면 옮기지 않는다', () => {
    expect(focusAfter('toggleMore', MAIN_OPEN)).toBe('moreFirstButton');
    expect(focusAfter('toggleMore', MAIN)).toBeNull();
  });
});

describe('이메일 로그인 검사', () => {
  it('아이디가 비면 아이디 문구가 먼저다', () => {
    expect(loginError({ user_id: '', password: '' })).toBe(NO_ID);
    expect(loginError({ user_id: '', password: 'abcdef' })).toBe(NO_ID);
  });

  it('비밀번호가 비면 비밀번호 문구', () => {
    expect(loginError({ user_id: 'dev', password: '' })).toBe(NO_PW);
  });

  it('둘 다 있으면 통과한다 (길이와 공백은 보지 않는다)', () => {
    expect(loginError({ user_id: 'dev', password: '1' })).toBeNull();
    expect(loginError({ user_id: ' ', password: ' ' })).toBeNull();
  });
});

describe('이메일 가입 검사', () => {
  const ok = {
    name: '홍길동',
    user_id: 'dev',
    email: 'dev@example.com',
    password: 'abcdef',
  };

  it('네 칸이 다 차고 비밀번호가 6~15자면 통과한다', () => {
    expect(signUpError(ok)).toBeNull();
    expect(signUpError({ ...ok, password: 'a'.repeat(15) })).toBeNull();
  });

  it('하나라도 비면 "모두 입력해주세요!"', () => {
    expect(signUpError({ ...ok, name: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, user_id: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, email: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, password: '' })).toBe(NOT_ALL);
  });

  it('빈 칸 문구가 길이 문구보다 먼저다', () => {
    expect(signUpError({ ...ok, name: '', password: 'abc' })).toBe(NOT_ALL);
  });

  it('비밀번호가 5자 이하이거나 16자 이상이면 길이 문구', () => {
    expect(signUpError({ ...ok, password: 'abcde' })).toBe(PW_LENGTH);
    expect(signUpError({ ...ok, password: 'a'.repeat(16) })).toBe(PW_LENGTH);
  });

  it('이메일 형식과 공백은 보지 않는다', () => {
    expect(signUpError({ ...ok, email: 'not-an-email' })).toBeNull();
    expect(signUpError({ ...ok, name: ' ' })).toBeNull();
  });
});

describe('간편 로그인', () => {
  it('카카오가 먼저 보이고 나머지 셋은 펼친 묶음에 이 순서로 있다', () => {
    expect(SOCIAL_PRIMARY).toBe('kakao');
    expect(SOCIAL_MORE).toEqual(['google', 'naver', 'github']);
  });

  it('버튼 문구는 목업과 같다', () => {
    expect(SOCIAL_LABEL).toEqual({
      kakao: '카카오 로그인',
      google: 'Google 계정으로 로그인',
      naver: '네이버 로그인',
      github: 'GitHub 로그인',
    });
  });

  it('보내는 주소는 지금 코드와 같다', () => {
    const base = 'https://api.example.com';
    expect(socialLoginUrl(base, 'kakao')).toBe(`${base}/auth/login/kakao`);
    expect(socialLoginUrl(base, 'google')).toBe(`${base}/auth/login/google`);
    expect(socialLoginUrl(base, 'naver')).toBe(`${base}/auth/login/naver`);
    expect(socialLoginUrl(base, 'github')).toBe(`${base}/auth/login/github`);
  });
});
