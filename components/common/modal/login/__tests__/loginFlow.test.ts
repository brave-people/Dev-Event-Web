import {
  authFailure,
  clearFieldError,
  failureErrors,
  finishEmailLogin,
  focusAfter,
  hasFormErrors,
  INITIAL_LOGIN_STATE,
  joinFieldErrors,
  loginFieldErrors,
  LoginState,
  nextLoginState,
  NO_FORM_ERRORS,
  SOCIAL_LABEL,
  SOCIAL_MORE,
  SOCIAL_PRIMARY,
  socialLoginUrl,
} from 'components/common/modal/login/loginFlow';

const MAIN: LoginState = { view: 'main', moreOpen: false };
const MAIN_OPEN: LoginState = { view: 'main', moreOpen: true };
const EMAIL: LoginState = { view: 'email', moreOpen: false };
const JOIN: LoginState = { view: 'join', moreOpen: false };

// 지금 코드(LoginModal.tsx)의 알림 문구에서 "!"를 뺐고, "모두 입력해주세요!"는 칸마다 나눴다
const NO_NAME = '이름을 입력해주세요.';
const NO_ID = '아이디를 입력해주세요.';
const NO_EMAIL = '이메일을 입력해주세요.';
const NO_PW = '비밀번호를 입력해주세요.';
const PW_LENGTH = '비밀번호는 6에서 15자로 입력해주세요.';
const NO_AGREE = '만 14세 이상인지 확인하고 약관에 동의해주세요.';

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

describe('아이디 로그인 입력 확인', () => {
  it('비어 있는 칸마다 칸 아래 문구를 두고, 첫 빈칸으로 포커스를 보낸다', () => {
    expect(loginFieldErrors({ user_id: '', password: '' })).toEqual({
      fields: { user_id: NO_ID, password: NO_PW },
      form: null,
      focus: 'user_id',
    });
    expect(loginFieldErrors({ user_id: 'dev', password: '' })).toEqual({
      fields: { password: NO_PW },
      form: null,
      focus: 'password',
    });
  });

  it('둘 다 있으면 문제 없음 (지금 코드처럼 공백·길이는 보지 않는다)', () => {
    expect(
      hasFormErrors(loginFieldErrors({ user_id: 'dev', password: '1' }))
    ).toBe(false);
    expect(
      hasFormErrors(loginFieldErrors({ user_id: ' ', password: ' ' }))
    ).toBe(false);
  });
});

describe('아이디 가입 입력 확인', () => {
  const ok = {
    name: '개발자',
    user_id: 'dev',
    email: 'dev@example.com',
    password: 'abcdef',
  };

  it('모두 채우고 비밀번호가 6~15자면 문제 없음', () => {
    expect(joinFieldErrors(ok, true)).toEqual(NO_FORM_ERRORS);
    expect(
      hasFormErrors(joinFieldErrors({ ...ok, password: 'a'.repeat(15) }, true))
    ).toBe(false);
  });

  it('빈칸은 칸마다 문구, 포커스는 화면 순서(이름→아이디→이메일→비밀번호)의 첫 칸', () => {
    expect(
      joinFieldErrors({ name: '', user_id: '', email: '', password: '' }, true)
    ).toEqual({
      fields: {
        name: NO_NAME,
        user_id: NO_ID,
        email: NO_EMAIL,
        password: NO_PW,
      },
      form: null,
      focus: 'name',
    });
    expect(joinFieldErrors({ ...ok, email: '', password: '' }, true)).toEqual({
      fields: { email: NO_EMAIL, password: NO_PW },
      form: null,
      focus: 'email',
    });
  });

  it('비밀번호 길이는 빈칸이 있어도 함께 알려 준다', () => {
    expect(joinFieldErrors({ ...ok, name: '', password: 'abc' }, true)).toEqual(
      {
        fields: { name: NO_NAME, password: PW_LENGTH },
        form: null,
        focus: 'name',
      }
    );
    expect(
      joinFieldErrors({ ...ok, password: 'a'.repeat(16) }, true).fields
    ).toEqual({ password: PW_LENGTH });
  });

  it('동의하지 않으면 동의 칸 문구, 다른 칸이 비어 있으면 포커스는 그 칸이 먼저', () => {
    expect(joinFieldErrors(ok, false)).toEqual({
      fields: { agree: NO_AGREE },
      form: null,
      focus: 'agree',
    });
    expect(joinFieldErrors({ ...ok, password: '' }, false)).toEqual({
      fields: { password: NO_PW, agree: NO_AGREE },
      form: null,
      focus: 'password',
    });
  });

  it('동의 칸을 바꾸면 그 칸 문구만 지운다', () => {
    const errors = joinFieldErrors({ ...ok, name: '' }, false);
    expect(clearFieldError(errors, 'agree')).toEqual({
      fields: { name: NO_NAME },
      form: null,
      focus: null,
    });
  });

  it('이메일 형식과 공백은 지금처럼 서버가 본다', () => {
    expect(
      hasFormErrors(joinFieldErrors({ ...ok, email: 'not-an-email' }, true))
    ).toBe(false);
    expect(hasFormErrors(joinFieldErrors({ ...ok, name: ' ' }, true))).toBe(
      false
    );
  });
});

describe('서버 거절을 칸·창 문구로', () => {
  it('가리키는 칸이 있으면 그 칸 아래에 두고 그 칸으로 포커스', () => {
    expect(
      failureErrors({
        message: '이미 존재하는 아이디입니다.',
        field: 'user_id',
      })
    ).toEqual({
      fields: { user_id: '이미 존재하는 아이디입니다.' },
      form: null,
      focus: 'user_id',
    });
  });

  it('가리키는 칸이 없으면 제출 버튼 위에 두고 포커스는 그대로', () => {
    expect(
      failureErrors({
        message: '아이디 혹은 비밀번호가 잘못되었습니다.',
        field: null,
      })
    ).toEqual({
      fields: {},
      form: '아이디 혹은 비밀번호가 잘못되었습니다.',
      focus: null,
    });
  });
});

describe('칸을 고치면', () => {
  it('그 칸의 문구와 창 문구만 지우고 다른 칸 문구는 남긴다, 포커스는 옮기지 않는다', () => {
    const before = {
      fields: { name: NO_NAME, email: NO_EMAIL },
      form: '가입 중 문제가 발생했습니다.',
      focus: 'name' as const,
    };
    expect(clearFieldError(before, 'email')).toEqual({
      fields: { name: NO_NAME },
      form: null,
      focus: null,
    });
  });

  it('지울 것이 없으면 같은 값을 돌려준다 (다시 그리지 않게)', () => {
    expect(clearFieldError(NO_FORM_ERRORS, 'name')).toBe(NO_FORM_ERRORS);
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

describe('finishEmailLogin', () => {
  const tokens = { access_token: 'AAA', refresh_token: 'RRR' };

  it('창을 닫고 토큰을 쿠키로 바꾸는 주소로 옮겨 간다', async () => {
    const close = jest.fn();
    const push = jest.fn().mockResolvedValue(true);
    await finishEmailLogin(tokens, { push, login: jest.fn(), close });
    expect(close).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/?accessToken=AAA&refreshToken=RRR');
  });

  it('옮겨 가기가 끝난 뒤(쿠키가 심긴 뒤)에 로그인 상태를 바꾼다', async () => {
    let finish: (moved: boolean) => void = () => undefined;
    const push = jest.fn(
      () => new Promise<boolean>((resolve) => (finish = resolve))
    );
    const login = jest.fn();
    const done = finishEmailLogin(tokens, { push, login, close: jest.fn() });
    expect(login).not.toHaveBeenCalled();
    finish(true);
    await done;
    expect(login).toHaveBeenCalledTimes(1);
  });

  it('옮겨 가기가 취소되면 로그인 상태를 바꾸지 않는다', async () => {
    const login = jest.fn();
    await finishEmailLogin(tokens, {
      push: jest.fn().mockResolvedValue(false),
      login,
      close: jest.fn(),
    });
    expect(login).not.toHaveBeenCalled();
  });
});

describe('authFailure', () => {
  // post.tsx는 실패하면 axios 응답(또는 응답이 없을 때 undefined)을 던진다
  const rejected = (data: unknown) => ({ status: 400, data });

  it('틀린 아이디·비밀번호는 지금 알림 문구에서 "다시 로그인 해주세요!"만 뺀다', () => {
    expect(
      authFailure(
        'login',
        rejected({ status_code: 400, status: 'AUTH_400_01', message: 'x' })
      )
    ).toEqual({
      message: '아이디 혹은 비밀번호가 잘못되었습니다.',
      field: null,
    });
  });

  it('없는 아이디(AUTH_400_02)도 같은 문구로, 아이디가 있는지 알려 주지 않는다', () => {
    expect(
      authFailure('login', rejected({ status: 'AUTH_400_02' })).message
    ).toBe('아이디 혹은 비밀번호가 잘못되었습니다.');
  });

  it('그 밖의 로그인 실패·응답 없음은 다시 시도하라는 문구', () => {
    const retry = {
      message: '로그인에 문제가 발생했습니다. 잠시 뒤 다시 시도해 주세요.',
      field: null,
    };
    expect(
      authFailure(
        'login',
        rejected({ status_code: 500, status: 'AUTH_500_03' })
      )
    ).toEqual(retry);
    expect(authFailure('login', undefined)).toEqual(retry);
    expect(authFailure('login', new Error('Network Error'))).toEqual(retry);
    expect(authFailure('login', { status: 502, data: '<html>' })).toEqual(
      retry
    );
  });

  it('가입: 이미 있는 아이디·이메일은 지금 알림 문구 그대로, 해당 입력란을 가리킨다', () => {
    expect(authFailure('join', rejected({ status: 'AUTH_400_05' }))).toEqual({
      message: '이미 존재하는 아이디입니다.',
      field: 'user_id',
    });
    expect(authFailure('join', rejected({ status: 'AUTH_400_04' }))).toEqual({
      message: '이미 존재하는 이메일입니다.',
      field: 'email',
    });
  });

  it('가입: 이메일 형식 오류는 서버의 두 가지 응답 모두 이메일 입력란을 가리킨다', () => {
    const format = { message: '이메일 형식이 아닙니다.', field: 'email' };
    expect(authFailure('join', rejected({ status: 'AUTH_400_03' }))).toEqual(
      format
    );
    expect(
      authFailure(
        'join',
        rejected({
          status: 'COMMON_REQUEST_BODY_MISSING_400_02',
          errors: ['email: must be a well-formed email address'],
        })
      )
    ).toEqual(format);
  });

  it('가입: 그 밖의 실패는 다시 시도하라는 문구', () => {
    const retry = {
      message: '가입 중 문제가 발생했습니다. 잠시 뒤 다시 시도해 주세요.',
      field: null,
    };
    expect(
      authFailure(
        'join',
        rejected({
          status: 'COMMON_REQUEST_BODY_MISSING_400_02',
          errors: ['password: size must be between 6 and 15'],
        })
      )
    ).toEqual(retry);
    expect(authFailure('join', undefined)).toEqual(retry);
  });

  it('로그인 화면에서는 가입 코드가 와도 로그인 문구를 쓴다', () => {
    expect(
      authFailure('login', rejected({ status: 'AUTH_400_05' })).message
    ).toBe('로그인에 문제가 발생했습니다. 잠시 뒤 다시 시도해 주세요.');
  });
});
