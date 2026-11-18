import React, { useState } from 'react';
import classNames from 'classnames/bind';

import LoginButton from 'components/common/modal/login/LoginButton';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { AuthProp, SignUpProps } from 'model/auth';

import style from './LoginPanel.module.scss';

const cn = classNames.bind(style);

interface BackButtonProps {
  onBack: () => void;
}

function BackButton({ onBack }: BackButtonProps) {
  return (
    <button type="button" className={cn('back')} onClick={onBack}>
      <TimelineIcon name="back" size={20} />
      <span>다른 방법으로</span>
    </button>
  );
}

interface LoginEmailFormProps {
  onSubmit: (fields: AuthProp) => void;
  onBack: () => void;
  onJoin: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

export function LoginEmailForm({
  onSubmit,
  onBack,
  onJoin,
  firstInputRef,
}: LoginEmailFormProps) {
  const [user, setUser] = useState<AuthProp>({ user_id: '', password: '' });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(user);
  };

  return (
    <div className={cn('pane')}>
      <BackButton onBack={onBack} />
      <h2 className={cn('title')}>이메일로 로그인</h2>
      <form
        className={cn('form')}
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <label className={cn('field')}>
          <span className={cn('label')}>아이디</span>
          <input
            ref={firstInputRef}
            name="user_id"
            type="text"
            autoComplete="username"
            className={cn('input')}
            placeholder="아이디 입력"
            onChange={onChangeInput}
          />
        </label>
        <label className={cn('field')}>
          <span className={cn('label')}>비밀번호</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className={cn('input')}
            placeholder="비밀번호 입력"
            onChange={onChangeInput}
          />
        </label>
        <LoginButton variant="go" type="submit">
          로그인
        </LoginButton>
      </form>
      <p className={cn('foot')}>
        이메일 계정이 없으신가요?{' '}
        <button type="button" className={cn('link')} onClick={onJoin}>
          이메일로 가입
        </button>
      </p>
    </div>
  );
}

interface LoginJoinFormProps {
  onSubmit: (fields: SignUpProps) => void;
  onBack: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

export function LoginJoinForm({
  onSubmit,
  onBack,
  firstInputRef,
}: LoginJoinFormProps) {
  const [user, setUser] = useState<SignUpProps>({
    user_id: '',
    email: '',
    password: '',
    name: '',
  });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(user);
  };

  return (
    <div className={cn('pane')}>
      <BackButton onBack={onBack} />
      <h2 className={cn('title')}>이메일로 가입</h2>
      <form
        className={cn('form')}
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <label className={cn('field')}>
          <span className={cn('label')}>이름</span>
          <input
            ref={firstInputRef}
            name="name"
            type="text"
            autoComplete="name"
            className={cn('input')}
            placeholder="이름 입력"
            onChange={onChangeInput}
          />
        </label>
        <label className={cn('field')}>
          <span className={cn('label')}>아이디</span>
          <input
            name="user_id"
            type="text"
            autoComplete="username"
            className={cn('input')}
            placeholder="아이디 입력"
            onChange={onChangeInput}
          />
        </label>
        <label className={cn('field')}>
          <span className={cn('label')}>이메일</span>
          <input
            name="email"
            type="text"
            inputMode="email"
            autoComplete="email"
            className={cn('input')}
            placeholder="이메일 입력"
            onChange={onChangeInput}
          />
        </label>
        <label className={cn('field')}>
          <span className={cn('label')}>비밀번호</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            {...{ passwordrules: 'minlength: 6; maxlength: 15;' }}
            className={cn('input')}
            placeholder="비밀번호 입력 (6~15자)"
            onChange={onChangeInput}
          />
        </label>
        <LoginButton variant="go" type="submit">
          가입하기
        </LoginButton>
      </form>
      <p className={cn('foot')}>
        간편 로그인은 가입 없이 바로 시작할 수 있어요.{' '}
        <button type="button" className={cn('link')} onClick={onBack}>
          간편 로그인으로
        </button>
      </p>
    </div>
  );
}
