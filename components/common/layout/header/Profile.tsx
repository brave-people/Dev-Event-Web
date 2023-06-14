import classNames from 'classnames/bind';
import style from './Header.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import ProfileIcon from 'public/icon/profile_outlined_regular.svg';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from 'context/auth';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import * as ga from 'lib/utils/gTag';

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
              ga.event({
                action: 'web_event_내이벤트메뉴클릭',
                event_category: 'web_event',
                event_label: '내이벤트이동',
              });
              router.push('/myevent');
              setProfileMenuIsOpen(false);
            }}
          >
            내 이벤트
          </div>
          <div
            className={cn('profile-menu__item')}
            onClick={() => {
              ga.event({
                action: 'web_event_내정보보기버튼클릭',
                event_category: 'web_event',
                event_label: '내정보이동',
              });
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
