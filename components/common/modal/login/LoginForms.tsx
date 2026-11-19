import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';

import LoginButton from 'components/common/modal/login/LoginButton';
import {
  FormErrors,
  FormFieldName,
} from 'components/common/modal/login/loginFlow';
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

// 입력란 하나: 이름표·입력란, 문제가 있으면 칸 아래 빨간 문구.
// 문구는 label 밖에 두어 입력란 이름에 섞이지 않게 하고, aria-describedby로 이어 포커스가 오면 함께 읽힌다.
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: FormFieldName;
  error?: string;
  idPrefix: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

function Field({ label, error, idPrefix, inputRef, ...input }: FieldProps) {
  const errorId = `${idPrefix}-${input.name}-error`;
  return (
    <div className={cn('field')}>
      <label className={cn('fieldLabel')}>
        <span className={cn('label')}>{label}</span>
        <input
          ref={inputRef}
          className={cn('input')}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...input}
        />
      </label>
      {error && (
        <p id={errorId} className={cn('fieldError')}>
          {error}
        </p>
      )}
    </div>
  );
}

// 칸을 가리키지 않는 서버 거절(틀린 비밀번호, 서버 오류). 제출 버튼 바로 위.
function FormMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className={cn('error')} role="alert">
      {message}
    </p>
  );
}

// 제출 뒤 errors.focus가 가리키는 칸으로 포커스를 옮긴다(칸을 고칠 때는 focus가 null이라 옮기지 않는다).
const useFocusOnError = (
  errors: FormErrors,
  refs: Partial<Record<FormFieldName, React.RefObject<HTMLInputElement>>>
) => {
  useEffect(() => {
    if (!errors.focus) return;
    refs[errors.focus]?.current?.focus();
    // refs는 화면마다 고정된 묶음이라 errors가 바뀔 때만 본다
  }, [errors]);
};

interface LoginEmailFormProps {
  onSubmit: (fields: AuthProp) => void;
  onBack: () => void;
  onJoin: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
  errors: FormErrors;
  onEdit: (name: FormFieldName) => void;
}

export function LoginEmailForm({
  onSubmit,
  onBack,
  onJoin,
  firstInputRef,
  errors,
  onEdit,
}: LoginEmailFormProps) {
  const [user, setUser] = useState<AuthProp>({ user_id: '', password: '' });
  const passwordRef = useRef<HTMLInputElement>(null);
  useFocusOnError(errors, { user_id: firstInputRef, password: passwordRef });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
    onEdit(name as FormFieldName);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(user);
  };

  return (
    <div className={cn('pane')}>
      <BackButton onBack={onBack} />
      <h2 className={cn('title')}>아이디로 로그인</h2>
      <form
        className={cn('form')}
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <Field
          label="아이디"
          idPrefix="login"
          inputRef={firstInputRef}
          name="user_id"
          type="text"
          autoComplete="username"
          placeholder="아이디 입력"
          onChange={onChangeInput}
          error={errors.fields.user_id}
        />
        <Field
          label="비밀번호"
          idPrefix="login"
          inputRef={passwordRef}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          onChange={onChangeInput}
          error={errors.fields.password}
        />
        <FormMessage message={errors.form} />
        <LoginButton variant="go" type="submit">
          로그인
        </LoginButton>
      </form>
      <p className={cn('foot')}>
        아이디가 없으신가요?{' '}
        <button type="button" className={cn('link')} onClick={onJoin}>
          아이디로 가입
        </button>
      </p>
    </div>
  );
}

interface LoginJoinFormProps {
  onSubmit: (fields: SignUpProps) => void;
  onBack: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
  errors: FormErrors;
  onEdit: (name: FormFieldName) => void;
}

export function LoginJoinForm({
  onSubmit,
  onBack,
  firstInputRef,
  errors,
  onEdit,
}: LoginJoinFormProps) {
  const [user, setUser] = useState<SignUpProps>({
    user_id: '',
    email: '',
    password: '',
    name: '',
  });
  const userIdRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  useFocusOnError(errors, {
    name: firstInputRef,
    user_id: userIdRef,
    email: emailRef,
    password: passwordRef,
  });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
    onEdit(name as FormFieldName);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(user);
  };

  return (
    <div className={cn('pane')}>
      <BackButton onBack={onBack} />
      <h2 className={cn('title')}>아이디로 가입</h2>
      <form
        className={cn('form')}
        method="post"
        noValidate
        onSubmit={handleSubmit}
      >
        <Field
          label="이름"
          idPrefix="join"
          inputRef={firstInputRef}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="이름 입력"
          onChange={onChangeInput}
          error={errors.fields.name}
        />
        <Field
          label="아이디"
          idPrefix="join"
          inputRef={userIdRef}
          name="user_id"
          type="text"
          autoComplete="username"
          placeholder="아이디 입력"
          onChange={onChangeInput}
          error={errors.fields.user_id}
        />
        <Field
          label="이메일"
          idPrefix="join"
          inputRef={emailRef}
          name="email"
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="이메일 입력"
          onChange={onChangeInput}
          error={errors.fields.email}
        />
        <Field
          label="비밀번호"
          idPrefix="join"
          inputRef={passwordRef}
          name="password"
          type="password"
          autoComplete="new-password"
          {...{ passwordrules: 'minlength: 6; maxlength: 15;' }}
          placeholder="비밀번호 입력 (6~15자)"
          onChange={onChangeInput}
          error={errors.fields.password}
        />
        <FormMessage message={errors.form} />
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
