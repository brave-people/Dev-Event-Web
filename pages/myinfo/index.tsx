import { useEventSWR } from 'lib/hooks/useEventSWR';
import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/layout/index';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Myinfo.module.scss';
import OutlineButton from 'component/common/buttons/OutlineButton';
import DeleteAccountModal from 'component/common/modal/DeleteAccountModal';

const cn = classNames.bind(style);

const MyInfo = () => {
  const [DeleteAccountModalIsOpen, setDeleteAccountIsOpen] = useState(false);

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
            <input className={cn('input', 'size--small')} disabled></input>
          </div>
          <div className={cn('info-form__item')}>
            <span>이메일</span>
            <input className={cn('input', 'size--regular')} disabled></input>
          </div>
          <div className={cn('info-form__item')}>
            <span>가입일</span>
            <input className={cn('input', 'size--small')} disabled></input>
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
