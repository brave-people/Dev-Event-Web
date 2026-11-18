import Logo from 'components/common/logo/Logo';
import LoginModal from 'components/common/modal/LoginModal';
import NoticeModal from 'components/common/modal/NoticeModal';
import ThemeToggle from 'components/common/theme-toggle/ThemeToggle';
import Login from 'components/features/login/Login';
import style from 'components/layout/header/Header.module.scss';
import Profile from 'components/layout/header/Profile';
import { AuthContext } from 'context/auth';
import { REGISTER_FORM_URL } from 'lib/links';
import * as ga from 'lib/utils/gTag';
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const EVENTS_PATHNAMES = ['/events', '/search', '/event/detail/[eventId]'];

function Header() {
  const { isLoggedIn, isChecked } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { pathname, push } = useRouter();
  // 확인이 끝나기 전에 누른 "관심 행사"는 끝난 뒤 한 번만 처리한다
  const pendingMyEvent = useRef(false);

  useEffect(() => {
    if (!isChecked || !pendingMyEvent.current) return;
    pendingMyEvent.current = false;
    if (isLoggedIn) {
      push('/myevent');
    } else {
      setLoginModalIsOpen(true);
    }
  }, [isChecked, isLoggedIn, push]);

  const isEvents = EVENTS_PATHNAMES.includes(pathname);
  const isMyEvent = pathname === '/myevent';
  const isAbout = pathname === '/about';

  return (
    <header className={cn('header')}>
      <NoticeModal />
      <div className={cn('header__inner')}>
        <div className={cn('header__logo')}>
          <Logo />
        </div>
        <nav className={cn('nav')} aria-label="주요 메뉴">
          <Link href="/events">
            <a
              className={cn('nav__item', { 'nav__item--on': isEvents })}
              aria-current={isEvents ? 'page' : undefined}
            >
              행사 일정
            </a>
          </Link>
          {isChecked && isLoggedIn ? (
            <Link href="/myevent">
              <a
                className={cn('nav__item', 'nav__item--desktop', {
                  'nav__item--on': isMyEvent,
                })}
                aria-current={isMyEvent ? 'page' : undefined}
              >
                관심 행사
              </a>
            </Link>
          ) : (
            <button
              type="button"
              className={cn('nav__item', 'nav__item--desktop')}
              onClick={() => {
                if (!isChecked) {
                  pendingMyEvent.current = true;
                  return;
                }
                setLoginModalIsOpen(true);
              }}
            >
              관심 행사
            </button>
          )}
          <Link href="/about">
            <a
              className={cn('nav__item', 'nav__item--desktop', {
                'nav__item--on': isAbout,
              })}
              aria-current={isAbout ? 'page' : undefined}
            >
              데브이벤트 소개
            </a>
          </Link>
        </nav>
        <div className={cn('header__right')}>
          <ThemeToggle />
          <a
            className={cn('register-button')}
            href={REGISTER_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              ga.event({
                action: 'web_event_행사등록버튼클릭',
                event_category: 'web_event',
                event_label: '행사등록',
              });
            }}
          >
            행사 등록 요청
          </a>
          {!isChecked ? (
            <span className={cn('auth-slot')} aria-hidden="true" />
          ) : isLoggedIn ? (
            <Profile />
          ) : (
            <Login setLoginModalIsOpen={setLoginModalIsOpen} />
          )}
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
