import Logo from 'components/common/logo/Logo';
import LoginModal from 'components/common/modal/LoginModal';
import NoticeModal from 'components/common/modal/NoticeModal';
import Login from 'components/features/login/Login';
import style from 'components/layout/header/Header.module.scss';
import Profile from 'components/layout/header/Profile';
import { AuthContext } from 'context/auth';
import React, { useContext, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import HeaderTab from './HeaderTab';

const cn = classNames.bind(style);

function Header() {
  const { isLoggedIn } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  return (
    <header className={cn('header')}>
      <NoticeModal />
      <div className={cn('header__inner')}>
        <nav className={cn('header__inner__nav')}>
          <Link href="/" passHref>
            <div className={cn('header__logo')}>
              <Logo />
            </div>
          </Link>
          <HeaderTab />
        </nav>
        <div className={cn('header__buttons')}>
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
