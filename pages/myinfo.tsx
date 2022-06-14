import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/layout/index';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Myinfo.module.scss';
import DeleteAccountModal from 'component/common/modal/DeleteAccountModal';
import { useUser } from 'lib/hooks/useSWR';
import dayjs from 'dayjs';
import { deleteAccountApi } from 'lib/api/delete';
import { AuthContext } from 'lib/context/auth';
import { useRouter } from 'next/router';
import axios from 'axios';

const cn = classNames.bind(style);

const MyInfo = () => {
  const [DeleteAccountModalIsOpen, setDeleteAccountIsOpen] = useState(false);
  const { user, isLoading, isError } = useUser();
  const authContext = React.useContext(AuthContext);
  const router = useRouter();

  const deleteAccount = async () => {
    const result = await deleteAccountApi(`/front/v1/users/witdraw`);
    if (result.status_code === 200) {
      logout();
    }
  };

  const logout = async () => {
    const result = await axios.post('/api/logout');
    if (result.data.message === 'SUCCESS') {
      authContext.logout();
      router.push('/');
    }
  };

  return (
    <div className={cn('info-container')}>
      <div className={cn('info-container__inner')}>
        <header className={cn('sub-header')}>
          <div className={cn('sub-header__inner')}>
            <div className={cn('sub-header__content')}>
              <h1>내 정보</h1>
            </div>
          </div>
        </header>
        <div className={cn('info-form')}>
          <div className={cn('info-form__item')}>
            <span>이름</span>
            <input className={cn('input', 'size--small')} disabled value={user?.username}></input>
          </div>
          <div className={cn('info-form__item')}>
            <span>이메일</span>
            <input className={cn('input', 'size--regular')} disabled value={user?.email}></input>
          </div>
          <div className={cn('info-form__item')}>
            <span>가입일</span>
            <input
              className={cn('input', 'size--small')}
              disabled
              value={dayjs(user?.register_date).format('YYYY. MM. DD')}
            ></input>
          </div>
        </div>
        <div className={cn('delete-button', 'primary')}>
          <button
            data-hover="탈퇴하기 🥺"
            onClick={() => {
              setDeleteAccountIsOpen(true);
            }}
          >
            탈퇴하기
          </button>
        </div>
      </div>
      <DeleteAccountModal
        isOpen={DeleteAccountModalIsOpen}
        onCancel={() => {
          setDeleteAccountIsOpen(false);
        }}
        onClick={deleteAccount}
      />
    </div>
  );
};

MyInfo.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MyInfo;
