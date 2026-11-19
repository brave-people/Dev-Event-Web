import React from 'react';
import classNames from 'classnames/bind';

import style from './LoginButton.module.scss';

const cn = classNames.bind(style);

export type LoginButtonVariant =
  | 'kakao'
  | 'email'
  | 'google'
  | 'naver'
  | 'github'
  | 'more'
  | 'go';

interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: LoginButtonVariant;
}

const LoginButton = React.forwardRef<HTMLButtonElement, LoginButtonProps>(
  ({ variant, className, type = 'button', children, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cn('button', variant, className)}
    >
      {children}
    </button>
  )
);

LoginButton.displayName = 'LoginButton';

export default LoginButton;
