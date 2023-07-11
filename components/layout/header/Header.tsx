import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useState } from 'react';
import Link from 'next/link';
import LoginModal from 'components/common/modal/LoginModal';
import { AuthContext } from 'context/auth';
import Profile from './Profile';
import Logo from 'components/common/logo/Logo';
import Login from 'components/features/login/Login'
import ThemeToggle from 'components/features/ThemeToggle/ThemeToggle';

const cn = classNames.bind(style);

function Header() {
  const authContext = React.useContext(AuthContext);

  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  return (
    <header className={cn('header')}>
      <div className={cn('header__inner')}>
        <Link href="/" passHref>
          <div className={cn('header__logo')}>
            <Logo />
          </div>
        </Link>
        <div className={cn('header__buttons')}>
          <span className={cn('wrapper')}>
            {authContext.isLoggedIn ? (
              <Profile />
            ) : (
              <Login
              setLoginModalIsOpen={setLoginModalIsOpen}
              />
            )}
          </span>
          <ThemeToggle />
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
    </header>
  );
}

export default Header;
