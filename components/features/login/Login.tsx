import * as ga from 'lib/utils/gTag';
import React, { Dispatch, SetStateAction } from 'react';
import classNames from 'classnames/bind';
import style from 'components/layout/header/Header.module.scss';

const cn = classNames.bind(style);

type Props = {
  setLoginModalIsOpen: Dispatch<SetStateAction<boolean>>;
};

function Login({ setLoginModalIsOpen }: Props) {
  return (
    <button
      type="button"
      className={cn('login-button')}
      onClick={() => {
        setLoginModalIsOpen(true);
        ga.event({
          action: 'web_event_로그인버튼클릭',
          event_category: 'web_event',
          event_label: '로그인',
        });
      }}
    >
      로그인
    </button>
  );
}

export default Login;
