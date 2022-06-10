import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/layout/index';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Myinfo.module.scss';
import OutlineButton from 'component/common/buttons/OutlineButton';
import DeleteAccountModal from 'component/common/modal/DeleteAccountModal';
import { useUser } from 'lib/hooks/useSWR';
import dayjs from 'dayjs';

const cn = classNames.bind(style);

const MyInfo = () => {
  const [DeleteAccountModalIsOpen, setDeleteAccountIsOpen] = useState(false);
  const { user, isLoading, isError } = useUser();

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
        <div className={cn('delete-button')}>
          <OutlineButton
            label="탈퇴하기"
            color="primary"
            size="regular"
            onClick={() => {
              setDeleteAccountIsOpen(true);
            }}
          ></OutlineButton>
        </div>
      </div>
      <DeleteAccountModal
        isOpen={DeleteAccountModalIsOpen}
        onClick={() => {
          setDeleteAccountIsOpen(false);
        }}
      />
    </div>
  );
};

MyInfo.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MyInfo;
