import classNames from 'classnames/bind';
import styles from './HeaderTab.module.scss';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const cn = classNames.bind(styles);

const HeaderTab = () => {
  const router = useRouter();
  const isHostsActive = router.pathname.startsWith('/hosts');

  return (
    <div className={cn('container')}>
      <div className={cn('tab')}>
        <Link href="/hosts">
          <a className={cn('tab-text', { active: isHostsActive })}>주최자</a>
        </Link>
      </div>
    </div>
  );
};

export default HeaderTab;
