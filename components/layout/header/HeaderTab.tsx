import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import styles from './HeaderTab.module.scss';
import React, { useMemo } from 'react';
import Link from 'next/link';

const cn = classNames.bind(styles);

const HeaderTab = () => {
  return (
    <div className={cn('container')}>
      <Link href={'https://programmer-humor.github.io'}>
        <div className={cn('tab')}>
          <span className={cn('tab-text', 'active')}>
            개발자 유머
            <span className={cn('new-badge')}>NEW</span>
          </span>
        </div>
      </Link>
    </div>
  );
};

export default HeaderTab;
