import { useState } from 'react';
import React, { useEffect } from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Myevent.module.scss';
import { useRouter } from 'next/router';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const EventTab = ({}: any) => {
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
        className={cn('tab__header--menu', tabMenu.ongoing === true ? 'selected' : null)}
        onClick={(event) => {
          setTabMenu({ ongoing: true, done: false });
          router.replace('/myevent?tab=ongoing');
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
        className={cn('tab__header--menu', tabMenu.done === true ? 'selected' : null)}
        onClick={(event) => {
          setTabMenu({ ongoing: false, done: true });
          router.replace('/myevent?tab=done');
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

EventTab.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default EventTab;
