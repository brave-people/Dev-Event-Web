import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useState } from 'react';
import Link from 'next/link';
import TextButton from 'component/common/buttons/TextButton';
import SearchModal from 'component/common/modal/SearchModal';
import LoginModal from 'component/common/modal/LoginModal';
import SearchIcon from 'public/icon/search_outlined_regular.svg';
import { AuthContext } from 'context/auth';
import Profile from './Profile';
import Logo from 'public/logo/logo.svg';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

function Header() {
  const authContext = React.useContext(AuthContext);

  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [searchModalIsOpen, setSearchModalIsOpen] = useState(false);

  return (
    <header className={cn('header')}>
      <div className={cn('header__inner')}>
        <Link href="/" passHref>
          <div className={cn('header__logo')}>
            <Logo />
          </div>
        </Link>
        <div className={cn('header__buttons')}>
          <Link href={'https://forms.gle/UUjUVg1tTrKhemKu9'}>
            <a>
              <TextButton
                label="행사등록"
                onClick={() => {
                  ga.event({
                    action: 'web_event_행사등록버튼클릭',
                    event_category: 'web_event',
                    event_label: '행사등록',
                  });
                }}
              ></TextButton>
            </a>
          </Link>

          <span className={cn('wrapper')}>
            {authContext.isLoggedIn ? (
              <Profile />
            ) : (
              <TextButton
                label="로그인"
                onClick={() => {
                  setLoginModalIsOpen(true);
                  setSearchModalIsOpen(false);
                  ga.event({
                    action: 'web_event_로그인버튼클릭',
                    event_category: 'web_event',
                    event_label: '로그인',
                  });
                }}
              ></TextButton>
            )}
          </span>
          <span className={cn('wrapper')}>
            <button
              className={cn('search-button')}
              onClick={() => {
                setSearchModalIsOpen(!searchModalIsOpen);
                setLoginModalIsOpen(false);
                ga.event({
                  action: 'web_event_키워드검색버튼클릭',
                  event_category: 'web_event',
                  event_label: '검색',
                });
              }}
            >
              <SearchIcon />
            </button>
          </span>
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClose={() => setLoginModalIsOpen(false)}></LoginModal>
      <SearchModal isOpen={searchModalIsOpen} onClick={() => setSearchModalIsOpen(false)} />
    </header>
  );
}

export default Header;
