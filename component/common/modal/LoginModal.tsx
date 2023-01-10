import classNames from 'classnames/bind';
import React, { useState } from 'react';
import style from './LoginModal.module.scss';
import Modal from 'react-modal';
import { MdClose } from 'react-icons/md';
import GoogleIcon from 'public/icon/google.svg';
import KakaoIcon from 'public/icon/kakao.svg';
import GithubIcon from 'public/icon/github.svg';
import NaverIcon from 'public/icon/naver.svg';
import EmailIcon from 'public/icon/email.svg';
import AppleIcon from 'public/icon/apple.svg';
import ArrowBackIcon from 'public/icon/arrow_back_regular.svg';
import router from 'next/router';
import * as ga from 'lib/utils/gTag';
import { loginByEmail, signUpByEmail } from 'lib/api/post';

const cx = classNames.bind(style);

const pageState = {
  social: 'social',
  email: 'email',
  signUp: 'signUp',
  close: 'close',
};

function LoginModal({ isOpen, onClose }: any) {
  const [state, setState] = useState(pageState.social);

  const onChangeState = (value: any) => {
    if (value === 'close') {
      onClose();
    }
    setState(value);
  };
  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClose}>
      <span className={cx('modal__buttons')}>
        <button
          className={cx('button', state === pageState.social ? 'hidden' : null)}
          onClick={() => {
            if (pageState.signUp || pageState.email) {
              onChangeState(pageState.social);
            }
          }}
        >
          <ArrowBackIcon />
        </button>
        <button
          className={cx('button')}
          onClick={() => {
            setState(pageState.social);
            onClose();
          }}
        >
          <MdClose size={24} />
        </button>
      </span>
      {state === pageState.social && <SocialLoginContainer onChangeState={onChangeState} />}
      {state === pageState.email && <LoginByEmailContainer onChangeState={onChangeState} />}
      {state === pageState.signUp && <SignUpByEmailContainer onChangeState={onChangeState} />}
    </Modal>
  );
}

const SocialLoginContainer = ({ onChangeState }: any) => {
  const requestSocialLogin = async (type: String) => {
    ga.event({
      action: 'web_event_sns로그인버튼클릭',
      event_category: 'web_event',
      event_label: '로그인',
    });
    const url = `${process.env.BASE_SERVER_URL}/auth/login/${type}`;
    router.push(url);
  };

  return (
    <>
      <div className={cx('modal__inner')}>
        <span className={cx('modal__title')}>
          관심있는 개발자 행사를 <br /> 내 이벤트에서 관리해보세요!
        </span>
        <div className={cx('login-form')}>
          <button
            className={cx('login-form__button', 'kakao')}
            onClick={() => {
              requestSocialLogin('kakao');
            }}
          >
            <KakaoIcon />
            <span> 카카오 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'google')}
            onClick={() => {
              requestSocialLogin('google');
            }}
          >
            <GoogleIcon />
            <span> 구글 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'naver')}
            onClick={() => {
              requestSocialLogin('naver');
            }}
          >
            <NaverIcon />
            <span>네이버 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'github')}
            onClick={() => {
              requestSocialLogin('github');
            }}
          >
            <GithubIcon />
            <span> github 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'apple')}
            onClick={() => {
              requestSocialLogin('apple');
            }}
          >
            <AppleIcon />
            <span>애플 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'email')}
            onClick={() => {
              onChangeState(pageState.email);
            }}
          >
            <EmailIcon />
            <span>아이디 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'signup')}
            onClick={() => {
              onChangeState(pageState.signUp);
            }}
          >
            <span> 회원가입</span>
          </button>
        </div>
      </div>
    </>
  );
};

const LoginByEmailContainer = ({ onChangeState }: any) => {
  const [user, setUser] = useState({ user_id: '', password: '' });

  const checkValid = () => {
    if (!user.user_id) {
      alert('아이디를 입력해주세요!');
      return 'invalid';
    } else if (!user.password) {
      alert('비밀번호를 입력해주세요!');
      return 'invalid';
    } else {
      return 'valid';
    }
  };

  const requestLoginByEmail = async () => {
    ga.event({
      action: 'web_event_이메일로그인버튼클릭',
      event_category: 'web_event',
      event_label: '로그인',
    });
    if (checkValid() === 'valid') {
      const tokens = await loginByEmail('/front/v1/users/login', user);
      if (tokens) {
        alert('로그인이 완료되었습니다!');
        router.push(`/?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`);
        onChangeState('close');
      }
    }
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <div className={cx('modal__inner', 'sub')}>
      <span className={cx('modal__title')}>로그인</span>
      <div className={cx('login-form')}>
        <div className={cx('login-form__item')}>
          <span>아이디</span>
          <input
            name="user_id"
            className={cx('input', 'size--small')}
            placeholder="아이디 입력"
            onChange={onChangeInput}
          ></input>
        </div>
        <div className={cx('login-form__item')}>
          <span>비밀번호</span>
          <input
            name="password"
            type="password"
            className={cx('input', 'size--small')}
            placeholder="비밀번호 입력"
            onChange={onChangeInput}
          ></input>
        </div>
      </div>
      <div style={{ height: '55px' }}></div>
      <button
        className={cx('login-form__button', 'login')}
        onClick={() => {
          requestLoginByEmail();
        }}
      >
        <span>로그인</span>
      </button>
      <div style={{ height: '42px' }}></div>
    </div>
  );
};

const SignUpByEmailContainer = ({ onChangeState }: any) => {
  const [user, setUser] = useState({ user_id: '', email: '', password: '', name: '' });

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setUser({ ...user, [name]: value });
  };

  const checkValid = () => {
    if (user.user_id && user.email && user.password && user.name) {
      if (user.password.length >= 6 && user.password.length <= 15) {
        return 'valid';
      } else {
        alert('비밀번호는 6에서 15자로 입력해주세요!');
        return 'invalid';
      }
    } else {
      alert('모두 입력해주세요!');
      return 'invalid';
    }
  };

  const requestSignUpByEmail = async () => {
    ga.event({
      action: 'web_event_회원가입버튼클릭',
      event_category: 'web_event',
      event_label: '회원가입',
    });

    if (checkValid() === 'valid') {
      const result = await signUpByEmail('/front/v1/users/register', user);
      if (result.status_code === 200) {
        alert('회원가입이 완료되셨습니다!');
        onChangeState(pageState.email);
      }
    }
  };

  return (
    <div className={cx('modal__inner')}>
      <span className={cx('modal__title')}>회원가입</span>
      <div className={cx('login-form')}>
        <div className={cx('login-form__item')}>
          <span>이름</span>
          <input
            name="name"
            className={cx('input', 'size--small')}
            placeholder="이름 입력"
            onChange={onChangeInput}
          ></input>
        </div>
        <div className={cx('login-form__item')}>
          <span>아이디</span>
          <input
            name="user_id"
            className={cx('input', 'size--small')}
            placeholder="아이디 입력"
            onChange={onChangeInput}
          ></input>
        </div>
        <div className={cx('login-form__item')}>
          <span>이메일</span>
          <input
            name="email"
            className={cx('input', 'size--small')}
            placeholder="이메일 입력"
            onChange={onChangeInput}
          ></input>
        </div>
        <div className={cx('login-form__item')}>
          <span>비밀번호</span>
          <input
            name="password"
            type="password"
            className={cx('input', 'size--small')}
            placeholder="비밀번호 입력 (6~15자)"
            onChange={onChangeInput}
          ></input>
        </div>
      </div>
      <div style={{ height: '25px' }}></div>
      <button
        className={cx('login-form__button', 'login')}
        onClick={() => {
          requestSignUpByEmail();
        }}
      >
        <span>가입하기</span>
      </button>
      <div style={{ height: '41px' }}></div>
    </div>
  );
};

export default LoginModal;
