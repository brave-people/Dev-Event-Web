import { AuthProp, SignUpProps, TokenResponse } from 'model/auth';

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

// 입력 확인과 서버 거절을 창 안에 보여 줄 모양.
// fields: 칸 아래 문구, form: 제출 버튼 위 문구(칸을 가리키지 않는 거절), focus: 제출 뒤 포커스를 보낼 칸.
export type LoginFieldName = 'user_id' | 'password';
export type JoinFieldName = 'name' | 'user_id' | 'email' | 'password';
export type FormFieldName = LoginFieldName | JoinFieldName;

export interface FormErrors {
  fields: Partial<Record<FormFieldName, string>>;
  form: string | null;
  focus: FormFieldName | null;
}

export const NO_FORM_ERRORS: FormErrors = {
  fields: {},
  form: null,
  focus: null,
};

export const hasFormErrors = (errors: FormErrors): boolean =>
  errors.form !== null || Object.keys(errors.fields).length > 0;

// 칸마다 검사해 화면 순서대로 모은다. 첫 칸이 포커스를 받는다.
const collect = (checks: [FormFieldName, string | null][]): FormErrors => {
  const fields: FormErrors['fields'] = {};
  let focus: FormFieldName | null = null;
  for (const [name, message] of checks) {
    if (!message) continue;
    fields[name] = message;
    if (!focus) focus = name;
  }
  return focus ? { fields, form: null, focus } : NO_FORM_ERRORS;
};

// 문구는 지금 알림(LoginModal.tsx의 checkValid)에서 "!"를 뺐고, 가입의 "모두 입력해주세요!"는 칸마다 나눴다.
// 지금 코드처럼 공백만 있는 값과 이메일 형식은 보지 않는다(이메일 형식은 서버가 거절하면 authFailure가 보여 준다).
export const loginFieldErrors = (fields: AuthProp): FormErrors =>
  collect([
    ['user_id', fields.user_id ? null : '아이디를 입력해주세요.'],
    ['password', fields.password ? null : '비밀번호를 입력해주세요.'],
  ]);

const passwordProblem = (password: string): string | null => {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 6 || password.length > 15) {
    return '비밀번호는 6에서 15자로 입력해주세요.';
  }
  return null;
};

export const joinFieldErrors = (fields: SignUpProps): FormErrors =>
  collect([
    ['name', fields.name ? null : '이름을 입력해주세요.'],
    ['user_id', fields.user_id ? null : '아이디를 입력해주세요.'],
    ['email', fields.email ? null : '이메일을 입력해주세요.'],
    ['password', passwordProblem(fields.password)],
  ]);

// 칸을 고치면 그 칸의 문구와 창 문구를 지운다. 다른 칸 문구는 남기고 포커스는 옮기지 않는다.
export const clearFieldError = (
  errors: FormErrors,
  name: FormFieldName
): FormErrors => {
  if (!(name in errors.fields) && errors.form === null) return errors;
  const fields = { ...errors.fields };
  delete fields[name];
  return { fields, form: null, focus: null };
};

// 서버가 로그인·가입을 거절했을 때 창 안에 보여 줄 문구와 가리킬 입력란.
// 아는 코드의 문구는 lib/api/error.tsx의 알림 문구에서 "다시 로그인 해주세요!"만 뺀 것이다.
// 없는 아이디(AUTH_400_02)는 아이디가 있는지 드러내지 않도록 틀린 비밀번호와 같은 문구를 쓴다.
// thrown은 lib/api/post.tsx가 던진 값(axios 응답, 응답이 없으면 undefined)이다.
export type AuthKind = 'login' | 'join';
export type AuthField = 'user_id' | 'email' | null;
export interface AuthFailure {
  message: string;
  field: AuthField;
}

const LOGIN_RETRY = '로그인에 문제가 발생했습니다. 잠시 뒤 다시 시도해 주세요.';
const JOIN_RETRY = '가입 중 문제가 발생했습니다. 잠시 뒤 다시 시도해 주세요.';
const EMAIL_FORMAT: AuthFailure = {
  message: '이메일 형식이 아닙니다.',
  field: 'email',
};

const readBody = (thrown: unknown): { status?: unknown; errors?: unknown } => {
  if (!thrown || typeof thrown !== 'object' || !('data' in thrown)) return {};
  const data = (thrown as { data: unknown }).data;
  return data && typeof data === 'object' ? data : {};
};

export const authFailure = (kind: AuthKind, thrown: unknown): AuthFailure => {
  const { status, errors } = readBody(thrown);
  if (kind === 'login') {
    if (status === 'AUTH_400_01' || status === 'AUTH_400_02') {
      return { message: '아이디 혹은 비밀번호가 잘못되었습니다.', field: null };
    }
    return { message: LOGIN_RETRY, field: null };
  }
  if (status === 'AUTH_400_05') {
    return { message: '이미 존재하는 아이디입니다.', field: 'user_id' };
  }
  if (status === 'AUTH_400_04') {
    return { message: '이미 존재하는 이메일입니다.', field: 'email' };
  }
  if (status === 'AUTH_400_03') return EMAIL_FORMAT;
  // 입력 검사(@Email 등)에 걸리면 서버는 "필드: 이유" 목록을 준다
  if (
    Array.isArray(errors) &&
    errors.some((e) => typeof e === 'string' && e.startsWith('email'))
  ) {
    return EMAIL_FORMAT;
  }
  return { message: JOIN_RETRY, field: null };
};

// 서버 거절: 가리키는 칸이 있으면 그 칸 아래(포커스도 그 칸), 없으면 제출 버튼 위.
export const failureErrors = (failure: AuthFailure): FormErrors =>
  failure.field
    ? {
        fields: { [failure.field]: failure.message },
        form: null,
        focus: failure.field,
      }
    : { fields: {}, form: failure.message, focus: null };

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

// 이메일 로그인이 성공한 뒤: 창을 닫고, 토큰을 쿠키로 바꾸는 / 를 거쳐 /events 로 옮겨 간다.
// 새로고침 없이 옮겨 가서 처음 열 때 한 번 하는 로그인 확인(AuthContext)이 다시 돌지 않으므로
// 로그인 상태는 여기서 바꾼다. 쿠키가 심긴 뒤여야 하므로 옮겨 가기가 끝난 다음에 바꾼다.
export const finishEmailLogin = async (
  tokens: Pick<TokenResponse, 'access_token' | 'refresh_token'>,
  deps: {
    push: (url: string) => Promise<boolean>;
    login: () => void;
    close: () => void;
  }
): Promise<void> => {
  deps.close();
  const moved = await deps.push(
    `/?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`
  );
  if (moved) deps.login();
};
