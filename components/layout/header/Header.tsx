import Logo from 'components/common/logo/Logo';
import LoginModal from 'components/common/modal/LoginModal';
import NoticeModal from 'components/common/modal/NoticeModal';
import ThemeToggle from 'components/common/theme-toggle/ThemeToggle';
import Login from 'components/features/login/Login';
import style from 'components/layout/header/Header.module.scss';
import Profile from 'components/layout/header/Profile';
import { AuthContext } from 'context/auth';
import React, { useContext, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';

const cn = classNames.bind(style);

function Header() {
  const { isLoggedIn } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  return (
    <header className={cn('header')}>
      <NoticeModal />
      <div className={cn('header__inner')}>
        <nav className={cn('header__inner__nav')}>
          <div className={cn('header__logo')}>
            <Logo />
          </div>
          <Link href="/about">
            <a className={cn('header__about-link')}>데브이벤트 소개</a>
          </Link>
        </nav>
        <div className={cn('header__buttons')}>
          <ThemeToggle />
          <span className={cn('wrapper')}>
            {isLoggedIn ? (
              <div>
                <Profile />
              </div>
            ) : (
              <div className={cn('login')}>
                <Login setLoginModalIsOpen={setLoginModalIsOpen} />
              </div>
            )}
          </span>
        </div>
      </div>
      <LoginModal
        isOpen={loginModalIsOpen}
        onClose={() => setLoginModalIsOpen(false)}
      ></LoginModal>
    </header>
  );
}

export default Header;
