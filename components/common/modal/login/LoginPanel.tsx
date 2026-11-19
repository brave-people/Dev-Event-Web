import React, { useContext, useEffect, useRef, useState } from 'react';
import router from 'next/router';

import {
  authFailure,
  clearFieldError,
  failureErrors,
  finishEmailLogin,
  focusAfter,
  FormErrors,
  FormFieldName,
  hasFormErrors,
  INITIAL_LOGIN_STATE,
  joinFieldErrors,
  LoginAction,
  LoginFocus,
  loginFieldErrors,
  LoginState,
  nextLoginState,
  NO_FORM_ERRORS,
  SocialType,
  socialLoginUrl,
} from 'components/common/modal/login/loginFlow';
import {
  LoginEmailForm,
  LoginJoinForm,
} from 'components/common/modal/login/LoginForms';
import LoginMain from 'components/common/modal/login/LoginMain';
import { AuthContext } from 'context/auth';
import { loginByEmail, signUpByEmail } from 'lib/api/post';
import * as ga from 'lib/utils/gTag';
import { AuthProp, SignUpProps } from 'model/auth';

interface LoginPanelProps {
  onClose: () => void;
}

function LoginPanel({ onClose }: LoginPanelProps) {
  const { login } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>(INITIAL_LOGIN_STATE);
  // 입력 확인(빈칸·비밀번호 길이)과 서버 거절. 칸 아래나 제출 버튼 위에 보여 준다(화면을 바꾸면 지우고, 칸을 고치면 그 칸 것을 지운다)
  const [errors, setErrors] = useState<FormErrors>(NO_FORM_ERRORS);
  const mounted = useRef(true);
  const pendingFocus = useRef<LoginFocus>(null);
  const emailButtonRef = useRef<HTMLButtonElement>(null);
  const moreFirstRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const joinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const act = (action: LoginAction) => {
    const next = nextLoginState(state, action);
    pendingFocus.current = focusAfter(action, next);
    setErrors(NO_FORM_ERRORS);
    setState(next);
  };

  useEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (!target) return;
    const element = {
      emailFirstInput: emailInputRef.current,
      joinFirstInput: joinInputRef.current,
      emailButton: emailButtonRef.current,
      moreFirstButton: moreFirstRef.current,
    }[target];
    element?.focus({ preventScroll: true });
  }, [state]);

  const requestSocialLogin = (type: SocialType) => {
    ga.event({
      action: 'web_event_sns로그인버튼클릭',
      event_category: 'web_event',
      event_label: '로그인',
    });
    const url = socialLoginUrl(process.env.BASE_SERVER_URL, type);
    router.push(url);
  };

  const requestLoginByEmail = async (user: AuthProp) => {
    ga.event({
      action: 'web_event_이메일로그인버튼클릭',
      event_category: 'web_event',
      event_label: '로그인',
    });
    const invalid = loginFieldErrors(user);
    if (hasFormErrors(invalid)) {
      setErrors(invalid);
      return;
    }
    // 같은 이유로 다시 실패해도 화면 읽기 프로그램이 다시 읽도록 먼저 비운다
    setErrors(NO_FORM_ERRORS);
    try {
      const tokens = await loginByEmail('/front/v1/users/login', user);
      if (tokens) {
        await finishEmailLogin(tokens, {
          push: (url) => router.push(url),
          login,
          close: onClose,
        });
      }
    } catch (e) {
      if (mounted.current) setErrors(failureErrors(authFailure('login', e)));
    }
  };

  const requestSignUpByEmail = async (user: SignUpProps) => {
    ga.event({
      action: 'web_event_회원가입버튼클릭',
      event_category: 'web_event',
      event_label: '회원가입',
    });
    const invalid = joinFieldErrors(user);
    if (hasFormErrors(invalid)) {
      setErrors(invalid);
      return;
    }
    setErrors(NO_FORM_ERRORS);
    try {
      const result = await signUpByEmail('/front/v1/users/register', user);
      if (result.status_code === 200) {
        alert('회원가입이 완료되셨습니다!');
        if (mounted.current) act('joined');
      }
    } catch (e) {
      if (mounted.current) setErrors(failureErrors(authFailure('join', e)));
    }
  };

  const clearError = (name: FormFieldName) =>
    setErrors((prev) => clearFieldError(prev, name));

  if (state.view === 'email') {
    return (
      <LoginEmailForm
        onSubmit={requestLoginByEmail}
        onBack={() => act('back')}
        onJoin={() => act('openJoin')}
        firstInputRef={emailInputRef}
        errors={errors}
        onEdit={clearError}
      />
    );
  }
  if (state.view === 'join') {
    return (
      <LoginJoinForm
        onSubmit={requestSignUpByEmail}
        onBack={() => act('back')}
        firstInputRef={joinInputRef}
        errors={errors}
        onEdit={clearError}
      />
    );
  }
  return (
    <LoginMain
      moreOpen={state.moreOpen}
      onSocial={requestSocialLogin}
      onEmail={() => act('openEmail')}
      onToggleMore={() => act('toggleMore')}
      onJoin={() => act('openJoin')}
      emailButtonRef={emailButtonRef}
      moreFirstRef={moreFirstRef}
    />
  );
}

export default LoginPanel;
