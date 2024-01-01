import axios from 'axios';
import DeleteAccountModal from 'components/common/modal/DeleteAccountModal';
import Layout from 'components/layout/index';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import dayjs from 'dayjs';
import { deleteAccountApi } from 'lib/api/delete';
import { useUser } from 'lib/hooks/useSWR';
import * as ga from 'lib/utils/gTag';
import style from 'styles/Myinfo.module.scss';
import { useState } from 'react';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import WithdrawOkButton from '../components/common/buttons/WithdrawOkButton';
import Letter from '../components/features/letter/Letter';

const cx = classNames.bind(style);

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

  const { user, isError } = useUser();

  if (isError) {
    return <div className={cx('null-container')}>내 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  // 계정 탈퇴
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
      <div className={cx('info-container')}>
        <div className={cx('info-container__inner')}>
          <header className={cx('sub-header')}>
            <div className={cx('sub-header__inner')}>
              <div className={cx('sub-header__content')}>
                <h1 className={cx('notice-title')}>내 정보</h1>
                <div className={cx('notice-alert')}>
                  <div className={cx('notice-alert__box')}>Notice</div>
                  <div className={cx('notice-alert__txt')}>정보 수집은 추후 업데이트 예정이에요</div>
                </div>
                <div className={cx('underline')}></div>
              </div>
            </div>
          </header>

          {/* 사용자 상세 정보 */}
          <div className={cx('info-form')}>
            <div className={cx('info-form__profile_image_box')}>
              <Image
                src={user && user.profile_image_link ? user.profile_image_link : '/icon/profile.svg'}
                width={104}
                height={104}
                className={cx('profile')}
              />
            </div>
            <div className={cx('info-form__profile_txt_box')}>{user?.username}</div>
            {/* 사용자 상세 정보 */}
            <div className={cx('info-form__auth_box')}>
              <div className={cx('email_box')}>
                <div className={cx('txt')}>가입계정</div>
                {/*  가입 유형 이미지 */}
                <div className={cx('value')}>
                  <div className={cx('value__box')}>
                    <Image src={'/icon/email.svg'} width={16} height={16} />
                  </div>
                  {user?.email}
                </div>
              </div>
            </div>
            <div className={cx('info-form__register_date')}>
              {dayjs(user?.register_date).format('YYYY년 MM월 DD일')}
              <div className={cx('info-form__register-info-button')}>가입일 🎉</div>
            </div>
          </div>
          {/* // 사용자 상세 정보 */}
          <div className={cx('info-form__withdraw_box')}>
            <WithdrawOkButton
              onClick={() => {
                setDeleteAccountIsOpen(true);
                ga.event({
                  action: 'web_event_탈퇴버튼클릭',
                  event_category: 'web_myinfo',
                  event_label: '탈퇴',
                });
              }}
            />
          </div>
        </div>

        {/* 탈퇴 재확인 알림 팝업 */}
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
      <Letter />
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
