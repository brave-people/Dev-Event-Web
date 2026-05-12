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
    return (
      <div className={cx('null-container')}>
        내 정보를 불러오는데 문제가 발생했습니다!
      </div>
    );
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
      <main className={cx('container')}>
        <div className={cx('inner')}>
          <header className={cx('sub-header')}>
            <h1>내 정보</h1>
          </header>

          <section className={cx('profile-card')}>
            <div
              className={cx('profile-card__avatar', {
                'profile-card__avatar--placeholder':
                  !user?.profile_image_link,
              })}
            >
              {user?.profile_image_link ? (
                <Image
                  src={user.profile_image_link}
                  width={96}
                  height={96}
                  alt="프로필 이미지"
                />
              ) : (
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M24 24C26.7625 24 29 21.7625 29 19C29 16.2375 26.7625 14 24 14C21.2375 14 19 16.2375 19 19C19 21.7625 21.2375 24 24 24Z"
                    fill="currentColor"
                  />
                  <path
                    d="M24 26.5C20.6625 26.5 14 28.175 14 31.5V32.75C14 33.4375 14.5625 34 15.25 34H32.75C33.4375 34 34 33.4375 34 32.75V31.5C34 28.175 27.3375 26.5 24 26.5Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
            <div className={cx('profile-card__meta')}>
              <div className={cx('profile-card__name')}>{user?.username}</div>
              {user?.register_date && (
                <div className={cx('profile-card__since')}>
                  <span className={cx('profile-card__since-date')}>
                    {dayjs(user?.register_date).format('YYYY년 MM월 DD일')}
                  </span>
                  <span className={cx('profile-card__since-chip')}>
                    가입일 🎉
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className={cx('info-card')}>
            <h2 className={cx('info-card__title')}>계정 정보</h2>
            <ul className={cx('info-list')}>
              <li className={cx('info-row')}>
                <span className={cx('info-row__label')}>가입계정</span>
                <span className={cx('info-row__value')}>
                  <span className={cx('info-row__icon')}>
                    <Image
                      src={'/icon/email.svg'}
                      width={16}
                      height={16}
                      alt="email"
                    />
                  </span>
                  <span className={cx('info-row__text')}>{user?.email}</span>
                </span>
              </li>
            </ul>
          </section>

          <section className={cx('danger-card')}>
            <div className={cx('danger-card__text')}>
              <h3 className={cx('danger-card__title')}>회원 탈퇴</h3>
              <p className={cx('danger-card__desc')}>
                탈퇴 시 내 정보와 북마크가 모두 삭제되며 복구할 수 없어요.
              </p>
            </div>
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
          </section>
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
      </main>
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
