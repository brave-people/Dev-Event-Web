import { useMyEvent } from 'lib/hooks/useSWR';
import { DateUtil } from 'lib/utils/dateUtil';
import * as ga from 'lib/utils/gTag';
import { MyEvent } from 'model/event';
import style from 'styles/MyEvent.module.scss';
import React, { useMemo } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const resolveEndDate = (event: MyEvent['dev_event']) => {
  if (event.use_start_date_time_yn && !event.use_end_date_time_yn) {
    return event.start_date_time;
  }
  return event.end_date_time;
};

const MyEventTabs = () => {
  const router = useRouter();
  const { myEvent } = useMyEvent({ filter: '' }, true);

  const activeTab = router.query.tab === 'done' ? 'done' : 'ongoing';

  const { ongoingCount, doneCount } = useMemo(() => {
    if (!myEvent) return { ongoingCount: 0, doneCount: 0 };
    let ongoing = 0;
    let done = 0;
    (myEvent as MyEvent[]).forEach((event) => {
      if (DateUtil.isDone(resolveEndDate(event.dev_event))) done += 1;
      else ongoing += 1;
    });
    return { ongoingCount: ongoing, doneCount: done };
  }, [myEvent]);

  const goOngoing = () => {
    if (activeTab === 'ongoing') return;
    ga.event({
      action: 'web_event_진행중인행사탭클릭',
      event_category: 'web_myevent',
      event_label: '내이벤트',
    });
    router.push('/myevent');
  };

  const goDone = () => {
    if (activeTab === 'done') return;
    ga.event({
      action: 'web_event_종료행사탭클릭',
      event_category: 'web_myevent',
      event_label: '내이벤트',
    });
    router.push('/myevent?tab=done');
  };

  return (
    <nav className={cn('tabs')} role="tablist" aria-label="북마크 행사 상태">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'ongoing'}
        onClick={goOngoing}
        className={cn('tab', activeTab === 'ongoing' && 'tab--active')}
      >
        진행중
        <span className={cn('tab__count')}>{ongoingCount}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'done'}
        onClick={goDone}
        className={cn('tab', activeTab === 'done' && 'tab--active')}
      >
        종료
        <span className={cn('tab__count')}>{doneCount}</span>
      </button>
    </nav>
  );
};

export default MyEventTabs;
