import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import ProfileIcon from 'public/icon/profile_outlined_regular.svg';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from 'context/auth';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
const cn = classNames.bind(style);

const Profile = () => {
  const [profileMenuIsOpen, setProfileMenuIsOpen] = useState(false);
  const router = useRouter();
  const authContext = React.useContext(AuthContext);
  const outsideRef = useRef(null);

  const handleClickProfile = () => {
    setProfileMenuIsOpen(!profileMenuIsOpen);
  };

  useOnClickOutside({ ref: outsideRef, handler: handleClickProfile, mouseEvent: 'click' });

  const logout = async () => {
    const result = await axios.post('/api/logout');
    if (result.data.message === 'SUCCESS') {
      authContext.logout();
      router.push('/');
    }
  };

  return (
    <div className={cn(`profile`)}>
      <button className={cn(`profile-button`)} onClick={handleClickProfile}>
        <ProfileIcon />
      </button>
      {profileMenuIsOpen ? (
        <div className={cn('profile-menu')} ref={outsideRef}>
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
