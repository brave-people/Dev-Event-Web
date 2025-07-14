import classNames from 'classnames/bind';
import styles from './HeaderTab.module.scss';
import React from 'react';
import Link from 'next/link';

const cn = classNames.bind(styles);

const HeaderTab = () => {
  return (
    <div className={cn('container')}>
      <div className={cn('tab')}>
        {/*<Link href={'https://programmer-humor.github.io'}>*/}
        {/*  <span className={cn('tab-text', 'active')}>*/}
        {/*    개발자 유머*/}
        {/*    <span className={cn('new-badge')}>NEW</span>*/}
        {/*  </span>*/}
        {/*</Link>*/}
      </div>
    </div>
  );
};

export default HeaderTab;
