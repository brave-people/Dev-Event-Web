import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TextButton from 'component/common/buttons/TextButton';
import SearchModal from 'component/common/modal/SearchModal';
import LoginModal from 'component/common/modal/LoginModal';
import SearchIcon from 'public/icon/search_outlined_regular.svg';
import { AuthContext } from 'lib/context/auth';
import Profile from './Profile';

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
            <Image src="/logo/logo.png" alt="logo" layout="fill" quality={100}></Image>
          </div>
        </Link>
        <div className={cn('header__buttons')}>
          <TextButton label="행사등록" onClick={() => setLoginModalIsOpen(true)}></TextButton>
          <span className={cn('wrapper')}>
            {authContext.isLoggedIn ? (
              <Profile />
            ) : (
              <TextButton label="로그인" onClick={() => setLoginModalIsOpen(true)}></TextButton>
            )}
          </span>
          <span className={cn('wrapper')}>
            <button
              className={cn('search-button')}
              onClick={() => {
                setSearchModalIsOpen(!searchModalIsOpen);
              }}
            >
              <SearchIcon />
            </button>
          </span>
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
      <SearchModal isOpen={searchModalIsOpen} onClick={() => setSearchModalIsOpen(false)} />
    </header>
  );
}

export default Header;
