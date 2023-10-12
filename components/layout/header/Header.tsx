import classNames from 'classnames/bind';
import style from 'components/layout/header/Header.module.scss';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import LoginModal from 'components/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import Profile from 'components/layout/header/Profile';
import Logo from 'components/common/logo/Logo';
import Login from 'components/features/login/Login'
import ThemeToggle from 'components/features/ThemeToggle/ThemeToggle';
import NoticeModal from 'components/common/modal/NoticeModal';

const cn = classNames.bind(style);

function Header() {

  const { isLoggedIn, login, logout } = useContext(AuthContext)
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  return (
    <header className={cn('header')}>
      <NoticeModal />
      <div className={cn('header__inner')}>
        <Link href="/" passHref>
          <div className={cn('header__logo')}>
            <Logo />
          </div>
        </Link>
        <div className={cn('header__buttons')}>
          <div className={cn('toggle__container')}>
            <ThemeToggle />
          </div>
          <span className={cn('wrapper')}>
            {isLoggedIn ? (
              <div onClick={() => logout()}>
                <Profile />
              </div>
            ) : (
              <div className={cn('login')} onClick={() => login()}>
                <Login
                  setLoginModalIsOpen={setLoginModalIsOpen}
                />
              </div>
            )}
          </span>
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
    </header>
  );
}

export default Header;
