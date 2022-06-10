import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useState } from 'react';
import ProfileIcon from 'public/icon/profile_outlined_regular.svg';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const Profile = () => {
  const [profileMenuIsOpen, setProfileMenuIsOpen] = useState(false);
  const router = useRouter();

  const logout = async () => {};
  return (
    <div className={cn(`profile`)}>
      <button
        className={cn(`profile-button`)}
        onClick={() => {
          setProfileMenuIsOpen(!profileMenuIsOpen);
        }}
      >
        <ProfileIcon />
      </button>
      {profileMenuIsOpen ? (
        <div className={cn('profile-menu')}>
          <div
            className={cn('profile-menu__item')}
            onClick={() => {
              router.push('/myevent');
              setProfileMenuIsOpen(false);
            }}
          >
            내 이벤트
          </div>
          <div
            className={cn('profile-menu__item')}
            onClick={() => {
              router.push('/myinfo');
              setProfileMenuIsOpen(false);
            }}
          >
            내 정보
          </div>
          <div className={cn('profile-menu__item')} onClick={logout}>
            로그아웃
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
