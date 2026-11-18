import React, { useEffect, useRef, useState } from 'react';
import router from 'next/router';

import {
  focusAfter,
  INITIAL_LOGIN_STATE,
  LoginAction,
  LoginFocus,
  loginError,
  LoginState,
  nextLoginState,
  signUpError,
  SocialType,
  socialLoginUrl,
} from 'components/common/modal/login/loginFlow';
import {
  LoginEmailForm,
  LoginJoinForm,
} from 'components/common/modal/login/LoginForms';
import LoginMain from 'components/common/modal/login/LoginMain';
import { loginByEmail, signUpByEmail } from 'lib/api/post';
import * as ga from 'lib/utils/gTag';
import { AuthProp, SignUpProps } from 'model/auth';

interface LoginPanelProps {
  onClose: () => void;
}

function LoginPanel({ onClose }: LoginPanelProps) {
  const [state, setState] = useState<LoginState>(INITIAL_LOGIN_STATE);
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
    const message = loginError(user);
    if (message) {
      alert(message);
      return;
    }
    try {
      const tokens = await loginByEmail('/front/v1/users/login', user);
      if (tokens) {
        router.push(
          `/?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`
        );
        onClose();
      }
    } catch (e) {
      // 알림·로그아웃·이동은 lib/api의 인터셉터가 한다
    }
  };

  const requestSignUpByEmail = async (user: SignUpProps) => {
    ga.event({
      action: 'web_event_회원가입버튼클릭',
      event_category: 'web_event',
      event_label: '회원가입',
    });
    const message = signUpError(user);
    if (message) {
      alert(message);
      return;
    }
    try {
      const result = await signUpByEmail('/front/v1/users/register', user);
      if (result.status_code === 200) {
        alert('회원가입이 완료되셨습니다!');
        if (mounted.current) act('joined');
      }
    } catch (e) {
      // 알림·로그아웃·이동은 lib/api의 인터셉터가 한다
    }
  };

  if (state.view === 'email') {
    return (
      <LoginEmailForm
        onSubmit={requestLoginByEmail}
        onBack={() => act('back')}
        onJoin={() => act('openJoin')}
        firstInputRef={emailInputRef}
      />
    );
  }
  if (state.view === 'join') {
    return (
      <LoginJoinForm
        onSubmit={requestSignUpByEmail}
        onBack={() => act('back')}
        firstInputRef={joinInputRef}
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
