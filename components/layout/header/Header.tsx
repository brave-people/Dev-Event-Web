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
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

function Header() {
  const { isLoggedIn } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const router = useRouter();
  const isAboutActive = router.pathname.startsWith('/about');
  const isHostsActive = router.pathname.startsWith('/hosts');
  return (
    <header className={cn('header')}>
      <NoticeModal />
      <div className={cn('header__inner')}>
        <nav className={cn('header__inner__nav')}>
          <div className={cn('header__logo')}>
            <Logo />
          </div>
          {/* DESIGN.md 13 이 로고 바로 뒤를 소개 링크 자리로 못박아서 주최자는 그 다음에 둔다 */}
          <Link href="/about">
            <a
              className={cn('header__nav-link', {
                'header__nav-link--active': isAboutActive,
              })}
              aria-label="데브이벤트 소개"
              aria-current={isAboutActive ? 'page' : undefined}
            >
              {/* 모바일은 폭이 빠듯해 라벨만 줄인다. 읽히는 이름은 aria-label 로 고정 */}
              <span className={cn('header__nav-link__full')} aria-hidden="true">
                데브이벤트 소개
              </span>
              <span className={cn('header__nav-link__short')} aria-hidden="true">
                소개
              </span>
            </a>
          </Link>
          <Link href="/hosts">
            <a
              className={cn('header__nav-link', {
                'header__nav-link--active': isHostsActive,
              })}
              aria-current={isHostsActive ? 'page' : undefined}
            >
              주최자
            </a>
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
