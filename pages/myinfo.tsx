import axios from 'axios';
import DeleteAccountModal from 'components/common/modal/DeleteAccountModal';
import Layout from 'components/layout/index';
import ProfileCard from 'components/myInfo/ProfileCard';
import { AuthContext } from 'context/auth';
import cookie from 'cookie';
import { deleteAccountApi } from 'lib/api/delete';
import { useUser } from 'lib/hooks/useSWR';
import * as ga from 'lib/utils/gTag';
import style from 'styles/Myinfo.module.scss';
import { useRef, useState } from 'react';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

const cx = classNames.bind(style);

const MyInfo = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [DeleteAccountModalIsOpen, setDeleteAccountIsOpen] = useState(false);
  const withdrawing = useRef(false);

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
      <main className={cx('page')}>
        <p className={cx('message')}>
          내 정보를 불러오는데 문제가 발생했습니다!
        </p>
      </main>
    );
  }

  const deleteAccount = async () => {
    if (withdrawing.current) return;
    withdrawing.current = true;
    // 성공하면 화면이 넘어가는 동안에도 막아 둔다
    let succeeded = false;
    try {
      const result = await deleteAccountApi(`/front/v1/users/witdraw`);
      if (result.status_code === 200) {
        succeeded = true;
        logout();
      }
      ga.event({
        action: 'web_event_탈퇴진행버튼클릭',
        event_category: 'web_myinfo',
        event_label: '탈퇴',
      });
    } catch (error) {
      // 알림·로그아웃은 axios 인터셉터가 처리한다. 창은 열린 채 둔다.
    } finally {
      if (!succeeded) withdrawing.current = false;
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
    <main className={cx('page')}>
      <ProfileCard
        user={user}
        onWithdraw={() => {
          setDeleteAccountIsOpen(true);
          ga.event({
            action: 'web_event_탈퇴버튼클릭',
            event_category: 'web_myinfo',
            event_label: '탈퇴',
          });
        }}
      />
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
