import Layout from 'components/layout';
import * as ga from 'lib/utils/gTag';
import style from 'styles/MyEvent.module.scss';
import { useState } from 'react';
import React, { useEffect } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const MyEventTab = () => {
  const router = useRouter();
  const [tabMenu, setTabMenu] = useState({
    ongoing: false,
    done: false,
  });

  useEffect(() => {
    setTabMenu({
      ongoing: router.query.tab === 'ongoing' || router.query.tab == null,
      done: router.query.tab === 'done',
    });
  }, [router.query.tab]);

  return (
    <div className={cn('tab__header')}>
      <div
        className={cn('tab__header--menu', tabMenu.ongoing ? 'selected' : null)}
        onClick={() => {
          setTabMenu({ ongoing: true, done: false });
          router.push('/myevent?tab=ongoing');
          ga.event({
            action: 'web_event_진행중인행사탭클릭',
            event_category: 'web_myevent',
            event_label: '내이벤트',
          });
        }}
      >
        진행 중인 행사
      </div>

      <div
        className={cn('tab__header--menu', tabMenu.done ? 'selected' : null)}
        onClick={(event) => {
          setTabMenu({ ongoing: false, done: true });
          router.push('/myevent?tab=done');
          ga.event({
            action: 'web_event_종료된행사탭클릭',
            event_category: 'web_myevent',
            event_label: '내이벤트',
          });
        }}
      >
        종료된 행사
      </div>
    </div>
  );
};

MyEventTab.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default MyEventTab;
