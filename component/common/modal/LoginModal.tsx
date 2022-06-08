import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './LoginModal.module.scss';
import Modal from 'react-modal';
import { MdClose } from 'react-icons/md';
import GoogleIcon from 'public/icon/google.svg';
import KakaoIcon from 'public/icon/kakao.svg';
import GithubIcon from 'public/icon/github.svg';
import NaverIcon from 'public/icon/naver.svg';
import router from 'next/router';

const cx = classNames.bind(style);

function LoginModal({ isOpen, onClick }: any) {
  const requestLogin = async (type: String) => {
    const url = `${process.env.BASE_SERVER_URL}/auth/login/${type}`;
    router.push(url);
  };

  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClick}>
      <button className={cx('modal__close-button')} onClick={onClick}>
        <MdClose size={35} />
      </button>
      <div className={cx('modal__inner')}>
        <span className={cx('modal__title')}>
          관심있는 개발자 행사를 <br /> 내 이벤트에서 관리해보세요!
        </span>

        <div className={cx('login-form')}>
          <button
            className={cx('login-form__button', 'kakao')}
            onClick={() => {
              requestLogin('kakao');
            }}
          >
            <KakaoIcon />
            <span> 카카오톡 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'google')}
            onClick={() => {
              requestLogin('google');
            }}
          >
            <GoogleIcon />
            <span> 구글 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'github')}
            onClick={() => {
              requestLogin('github');
            }}
          >
            <GithubIcon />
            <span> github 로그인</span>
          </button>
          <button
            className={cx('login-form__button', 'naver')}
            onClick={() => {
              requestLogin('naver');
            }}
          >
            <NaverIcon />
            <span>네이버 로그인</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LoginModal;
