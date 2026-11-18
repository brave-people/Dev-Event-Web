import { AuthContext } from 'context/auth';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import * as ga from 'lib/utils/gTag';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';
import { useRouter } from 'next/router';
import style from './Header.module.scss';

const cn = classNames.bind(style);

const Profile = () => {
  const [profileMenuIsOpen, setProfileMenuIsOpen] = useState(false);
  const router = useRouter();
  const authContext = React.useContext(AuthContext);
  const outsideRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setProfileMenuIsOpen(false);

  useOnClickOutside({
    ref: outsideRef,
    handler: closeMenu,
    mouseEvent: 'click',
  });

  useEffect(() => {
    if (!profileMenuIsOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [profileMenuIsOpen]);

  const logout = async () => {
    setProfileMenuIsOpen(false);
    await authContext.logout();
    router.push('/');
  };

  return (
    <div className={cn('profile')} ref={outsideRef}>
      <button
        type="button"
        ref={buttonRef}
        className={cn('profile-button')}
        onClick={() => setProfileMenuIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={profileMenuIsOpen}
        aria-label="프로필 메뉴 열기"
      >
        <svg
          viewBox="0 0 24 24"
          width={20}
          height={20}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </svg>
      </button>
      {profileMenuIsOpen ? (
        <div className={cn('profile-menu')} role="menu">
          <Link href="/myevent">
            <a
              role="menuitem"
              className={cn('profile-menu__item')}
              onClick={() => {
                ga.event({
                  action: 'web_event_내이벤트메뉴클릭',
                  event_category: 'web_event',
                  event_label: '내이벤트이동',
                });
                closeMenu();
              }}
            >
              관심 행사
            </a>
          </Link>
          <Link href="/myinfo">
            <a
              role="menuitem"
              className={cn('profile-menu__item')}
              onClick={() => {
                ga.event({
                  action: 'web_event_내정보보기버튼클릭',
                  event_category: 'web_event',
                  event_label: '내정보이동',
                });
                closeMenu();
              }}
            >
              내 정보
            </a>
          </Link>
          <button
            type="button"
            role="menuitem"
            className={cn('profile-menu__item', 'profile-menu__item--logout')}
            onClick={logout}
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
