import HostEventCard from 'components/hosts/HostEventCard';
import style from 'components/hosts/HostEventList.module.scss';
import { getHostEventsApi } from 'lib/api/host';
import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';
import React, { useState, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Tab = 'ongoing' | 'past' | 'all';

type Props = {
  hostId: number;
  ongoing: Event[];
  past: Event[];
  /** 서버가 내려주는 총건수. ongoing/past 배열은 20건으로 캡되어 있다. */
  ongoingTotal: number;
  pastTotal: number;
};

const PAGE_SIZE = 20;

/** 진행중 행사가 하나도 없으면 지난 행사 탭으로 착지시킨다. */
const initialTab = (ongoingTotal: number, pastTotal: number): Tab => {
  if (ongoingTotal > 0) return 'ongoing';
  if (pastTotal > 0) return 'past';
  return 'ongoing';
};

const HostEventList = ({
  hostId,
  ongoing,
  past,
  ongoingTotal,
  pastTotal,
}: Props) => {
  const [tab, setTab] = useState<Tab>(() => initialTab(ongoingTotal, pastTotal));

  // SSR 로 받은 목록을 0페이지 초기값으로 두고, '더보기'로 이어붙인다.
  const [extraOngoing, setExtraOngoing] = useState<Event[]>([]);
  const [extraPast, setExtraPast] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const allOngoing = useMemo(
    () => [...ongoing, ...extraOngoing],
    [ongoing, extraOngoing]
  );
  const allPast = useMemo(() => [...past, ...extraPast], [past, extraPast]);

  const totalCount = ongoingTotal + pastTotal;

  const visible = useMemo(() => {
    if (tab === 'ongoing') return { ongoing: allOngoing, past: [] as Event[] };
    if (tab === 'past') return { ongoing: [] as Event[], past: allPast };
    return { ongoing: allOngoing, past: allPast };
  }, [tab, allOngoing, allPast]);

  const loadedCount = tab === 'past' ? allPast.length : allOngoing.length;
  const tabTotal = tab === 'past' ? pastTotal : ongoingTotal;
  const hasMore = tab !== 'all' && loadedCount < tabTotal;

  const loadMore = useCallback(async () => {
    if (loading || tab === 'all') return;
    setLoading(true);
    setLoadError(false);
    try {
      const page = Math.floor(loadedCount / PAGE_SIZE);
      const res = await getHostEventsApi(`/front/v2/hosts/${hostId}/events`, {
        status: tab,
        page,
        size: PAGE_SIZE,
      });
      if (tab === 'past') setExtraPast((prev) => [...prev, ...res.events]);
      else setExtraOngoing((prev) => [...prev, ...res.events]);
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [hostId, tab, loadedCount, loading]);

  const renderTab = (value: Tab, label: string, count: number) => (
    <button
      className={cn(tab === value ? 'tab__active' : 'tab', {
        tab__empty: count === 0,
      })}
      role="tab"
      id={`host-tab-${value}`}
      aria-selected={tab === value}
      aria-controls={`host-tabpanel-${value}`}
      onClick={() => {
        ga.event({
          action: 'host_tab_change',
          event_category: 'web_host',
          event_label: value,
        });
        setTab(value);
      }}
    >
      {label}
      <span className={cn('tab__count')}>{count}</span>
    </button>
  );

  return (
    <>
      <div className={cn('tabs')} role="tablist">
        {renderTab('ongoing', '진행중', ongoingTotal)}
        {renderTab('past', '지난 행사', pastTotal)}
        {renderTab('all', '전체', totalCount)}
      </div>

      <div
        id={`host-tabpanel-${tab}`}
        role="tabpanel"
        aria-labelledby={`host-tab-${tab}`}
      >
        {visible.ongoing.length > 0 && (
          <section className={cn('section')}>
            <div className={cn('section__head')}>
              <h2 className={cn('section__title')}>
                진행중인 행사<b>{ongoingTotal}</b>
              </h2>
            </div>
            <div className={cn('list')}>
              {visible.ongoing.map((event) => (
                <HostEventCard
                  key={event.id}
                  event={event}
                  isDone={false}
                />
              ))}
            </div>
          </section>
        )}

        {visible.past.length > 0 && (
          <section className={cn('section')}>
            <div className={cn('section__head')}>
              <h2 className={cn('section__title')}>
                지난 행사<b>{pastTotal}</b>
              </h2>
            </div>
            <div className={cn('list')}>
              {visible.past.map((event) => (
                <HostEventCard
                  key={event.id}
                  event={event}
                  isDone
                />
              ))}
            </div>
          </section>
        )}

        {visible.ongoing.length === 0 && visible.past.length === 0 && (
          <div className={cn('empty')}>표시할 행사가 없어요.</div>
        )}

        {loadError && (
          <p className={cn('loadError')} role="status">
            행사를 더 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            className={cn('more')}
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? '불러오는 중…' : `더보기 (${loadedCount}/${tabTotal})`}
          </button>
        )}
      </div>
    </>
  );
};

export default HostEventList;
