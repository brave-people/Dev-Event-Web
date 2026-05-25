import HostEventCard from 'components/hosts/HostEventCard';
import style from 'components/hosts/HostEventList.module.scss';
import { Event } from 'model/event';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Tab = 'ongoing' | 'past' | 'all';

type Props = {
  ongoing: Event[];
  past: Event[];
};

const colorFor = (idx: number): 1 | 2 | 3 | 4 | 5 =>
  (((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5);

const HostEventList = ({ ongoing, past }: Props) => {
  const [tab, setTab] = useState<Tab>('ongoing');

  const ongoingCount = ongoing.length;
  const pastCount = past.length;
  const totalCount = ongoingCount + pastCount;

  const visible = useMemo(() => {
    if (tab === 'ongoing') return { ongoing, past: [] as Event[] };
    if (tab === 'past') return { ongoing: [] as Event[], past };
    return { ongoing, past };
  }, [tab, ongoing, past]);

  return (
    <>
      <div className={cn('tabs')} role="tablist">
        <button
          className={cn(tab === 'ongoing' ? 'tab__active' : 'tab')}
          role="tab"
          aria-selected={tab === 'ongoing'}
          onClick={() => setTab('ongoing')}
        >
          진행중<span className={cn('tab__count')}>{ongoingCount}</span>
        </button>
        <button
          className={cn(tab === 'past' ? 'tab__active' : 'tab')}
          role="tab"
          aria-selected={tab === 'past'}
          onClick={() => setTab('past')}
        >
          지난 행사<span className={cn('tab__count')}>{pastCount}</span>
        </button>
        <button
          className={cn(tab === 'all' ? 'tab__active' : 'tab')}
          role="tab"
          aria-selected={tab === 'all'}
          onClick={() => setTab('all')}
        >
          전체<span className={cn('tab__count')}>{totalCount}</span>
        </button>
      </div>

      {visible.ongoing.length > 0 && (
        <section className={cn('section')}>
          <div className={cn('section__head')}>
            <h2 className={cn('section__title')}>
              진행중인 행사<b>{ongoingCount}</b>
            </h2>
            <span className={cn('section__sub')}>신청 마감 임박 순</span>
          </div>
          <div className={cn('list')}>
            {visible.ongoing.map((event, idx) => (
              <HostEventCard
                key={event.id}
                event={event}
                isDone={false}
                colorVariant={colorFor(idx)}
              />
            ))}
          </div>
        </section>
      )}

      {visible.past.length > 0 && (
        <section className={cn('section')}>
          <div className={cn('section__head')}>
            <h2 className={cn('section__title')}>
              지난 행사<b>{pastCount}</b>
            </h2>
            <span className={cn('section__sub')}>최근 순</span>
          </div>
          <div className={cn('list')}>
            {visible.past.map((event, idx) => (
              <HostEventCard
                key={event.id}
                event={event}
                isDone
                colorVariant={colorFor(idx + 2)}
              />
            ))}
          </div>
        </section>
      )}

      {visible.ongoing.length === 0 && visible.past.length === 0 && (
        <div className={cn('empty')}>표시할 행사가 없어요.</div>
      )}
    </>
  );
};

export default HostEventList;
