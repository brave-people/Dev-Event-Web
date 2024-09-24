import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import styles from './HeaderTab.module.scss';
import React, { useMemo } from 'react';
import Link from 'next/link';

const cn = classNames.bind(styles);

const HeaderTab = () => {
  const router = useRouter();

  const isEvent = useMemo(() => {
    return router.pathname === '/events';
  }, [router.pathname]);

  const isReview = useMemo(() => {
    return router.pathname === '/reviews';
  }, [router.pathname]);

  return (
    <div className={cn('container')}>
      <Link href={'/events'}>
        <div className={cn('tab')}>
          <span className={cn('tab-text', { active: isEvent })}>
            개발자행사
          </span>
        </div>
      </Link>
      <Link href={'/events'}>
        <div className={cn('tab')}>
          <span className={cn('tab-text', { active: isReview })}>다시보기</span>
        </div>
      </Link>
    </div>
  );
};

export default HeaderTab;
