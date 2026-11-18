import { AuthProp, SignUpProps } from 'model/auth';

export type LoginView = 'main' | 'email' | 'join';

export interface LoginState {
  view: LoginView;
  moreOpen: boolean; // "다른 방법으로 로그인"이 펼쳐져 있는지
}

export type LoginAction =
  | 'openEmail'
  | 'openJoin'
  | 'back'
  | 'toggleMore'
  | 'joined';

export type LoginFocus =
  | 'emailFirstInput'
  | 'joinFirstInput'
  | 'emailButton'
  | 'moreFirstButton'
  | null;

export const INITIAL_LOGIN_STATE: LoginState = {
  view: 'main',
  moreOpen: false,
};

export const nextLoginState = (
  state: LoginState,
  action: LoginAction
): LoginState => {
  switch (action) {
    case 'openEmail':
      return { ...state, view: 'email' };
    case 'openJoin':
      return { ...state, view: 'join' };
    case 'back':
      return { ...state, view: 'main' };
    case 'joined':
      return { ...state, view: 'email' };
    case 'toggleMore':
      return state.view === 'main'
        ? { ...state, moreOpen: !state.moreOpen }
        : { ...state };
    default:
      return { ...state };
  }
};

export const focusAfter = (
  action: LoginAction,
  next: LoginState
): LoginFocus => {
  switch (action) {
    case 'openEmail':
    case 'joined':
      return 'emailFirstInput';
    case 'openJoin':
      return 'joinFirstInput';
    case 'back':
      return 'emailButton';
    case 'toggleMore':
      return next.view === 'main' && next.moreOpen ? 'moreFirstButton' : null;
    default:
      return null;
  }
};

// 알림 문구는 LoginModal.tsx의 checkValid 그대로. alert는 부르는 쪽이 한다.
export const loginError = (fields: AuthProp): string | null => {
  if (!fields.user_id) return '아이디를 입력해주세요!';
  if (!fields.password) return '비밀번호를 입력해주세요!';
  return null;
};

export const signUpError = (fields: SignUpProps): string | null => {
  if (!(fields.user_id && fields.email && fields.password && fields.name)) {
    return '모두 입력해주세요!';
  }
  if (fields.password.length < 6 || fields.password.length > 15) {
    return '비밀번호는 6에서 15자로 입력해주세요!';
  }
  return null;
};

export type SocialType = 'kakao' | 'google' | 'naver' | 'github';

export const SOCIAL_PRIMARY: SocialType = 'kakao';
export const SOCIAL_MORE: readonly SocialType[] = ['google', 'naver', 'github'];

export const SOCIAL_LABEL: Record<SocialType, string> = {
  kakao: '카카오 로그인',
  google: 'Google 계정으로 로그인',
  naver: '네이버 로그인',
  github: 'GitHub 로그인',
};

// baseUrl은 부르는 쪽이 process.env.BASE_SERVER_URL을 글자 그대로 적어 넘긴다.
export const socialLoginUrl = (
  baseUrl: string | undefined,
  type: SocialType
): string => `${baseUrl}/auth/login/${type}`;
