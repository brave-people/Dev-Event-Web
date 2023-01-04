import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/common/layout/index';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Myinfo.module.scss';
import DeleteAccountModal from 'component/common/modal/DeleteAccountModal';
import { useUser } from 'lib/hooks/useSWR';
import dayjs from 'dayjs';
import { deleteAccountApi } from 'lib/api/delete';
import { AuthContext } from 'context/auth';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import cookie from 'cookie';
import Head from 'next/head';
import Image from 'next/image';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const MyInfo = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [DeleteAccountModalIsOpen, setDeleteAccountIsOpen] = useState(false);

  const authContext = React.useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
  }, [isLoggedIn]);

  const { user, isLoading, isError } = useUser();

  if (isError) {
    return <div className={cn('null-container')}>내 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const deleteAccount = async () => {
    const result = await deleteAccountApi(`/front/v1/users/witdraw`);
    if (result.status_code === 200) {
      logout();
    }
    ga.event({
      action: 'web_event_탈퇴진행버튼클릭',
      event_category: 'web_myinfo',
      event_label: '탈퇴',
    });
  };

  const logout = async () => {
    const result = await axios.post('/api/logout');
    if (result.data.message === 'SUCCESS') {
      authContext.logout();
      router.push('/');
    }
  };

  return (
    <>
      <div className={cn('info-container')}>
        <div className={cn('info-container__inner')}>
          <header className={cn('sub-header')}>
            <div className={cn('sub-header__inner')}>
              <div className={cn('sub-header__content')}>
                <h1>내 정보</h1>
                <Image
                  src={user && user.profile_image_link ? user.profile_image_link : '/icon/profile.svg'}
                  width={48}
                  height={48}
                  className={cn('profile')}
                />
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
                ga.event({
                  action: 'web_event_탈퇴버튼클릭',
                  event_category: 'web_myinfo',
                  event_label: '탈퇴',
                });
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
            ga.event({
              action: 'web_event_탈퇴취소버튼클릭',
              event_category: 'web_myinfo',
              event_label: '탈퇴',
            });
          }}
          onClick={deleteAccount}
        />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  if (cookies) {
    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.access_token;
    if (token) {
      return {
        props: {
          isLoggedIn: true,
        },
      };
    }
  }
  return {
    redirect: {
      destination: '/events',
      permanent: false,
    },
    props: {},
  };
};

MyInfo.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default MyInfo;
