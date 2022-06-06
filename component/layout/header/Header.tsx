import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FiSearch, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import TextButton from 'component/common/buttons/TextButton';
import SearchModal from 'component/common/modal/SearchModal';
import LoginModal from 'component/common/modal/LoginModal';

const cn = classNames.bind(style);

function Header() {
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
            <TextButton label="로그인" onClick={() => setLoginModalIsOpen(true)}></TextButton>
          </span>
          <div className={cn('header__search')}>
            <button
              className={cn('search-button')}
              onClick={() => {
                setSearchModalIsOpen(!searchModalIsOpen);
              }}
            >
              <FiSearch color="#e8e8e8" size={20} />
            </button>
          </div>
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClick={() => setLoginModalIsOpen(false)}></LoginModal>
      <SearchModal isOpen={searchModalIsOpen} onClick={() => setSearchModalIsOpen(false)} />
    </header>
  );
}

export default Header;
