import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import EventNull from 'components/common/modal/EventNull';
import LoginModal from 'components/common/modal/LoginModal';
import DateNav from 'components/events/timeline/DateNav';
import FilterBar from 'components/events/timeline/FilterBar';
import TimelineEmpty from 'components/events/timeline/TimelineEmpty';
import TimelineList, {
  dayElementId,
} from 'components/events/timeline/TimelineList';
import TimelineSkeleton from 'components/events/timeline/TimelineSkeleton';
import { EventContext } from 'context/event';
import { useFavorite } from 'lib/hooks/useFavorite';
import { useMonthlyEvent } from 'lib/hooks/useSWR';
import { useNow } from 'lib/hooks/useNow';
import { buildTimelineView } from 'lib/utils/timeline/buildView';
import {
  monthKey,
  monthTotals as buildMonthTotals,
  MonthParam,
  readMonthParam,
} from 'lib/utils/timeline/dateStrip';
import { EMPTY_FILTERS, readFilters } from 'lib/utils/timeline/filters';
import { findTargetKey, flattenEvents } from 'lib/utils/timeline/groupByDay';
import { EventResponse } from 'model/event';
import style from './EventTimeline.module.scss';

const cn = classNames.bind(style);

const FAR_DISTANCE = 1600;
const SMOOTH_LOCK_MS = 1000;
const INSTANT_LOCK_MS = 150;
const SPY_OFFSET = 24;

interface EventTimelineProps {
  events: EventResponse[] | undefined;
  isError: boolean;
  now: string;
  mode: 'events' | 'search';
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function EventTimeline({
  events,
  isError,
  now: serverNow,
  mode,
}: EventTimelineProps) {
  const router = useRouter();
  const {
    newOnly,
    handleNewOnly,
    showPast,
    handleShowPast,
    focusDay,
    handleFocusDay,
  } = useContext(EventContext);
  const { isFavorite, toggleFavorite, loginModalIsOpen, closeLoginModal } =
    useFavorite();

  const now = useNow(serverNow);
  const todayKey = now.slice(0, 10);

  const current = useMemo(() => flattenEvents(events), [events]);
  const filters = useMemo(
    () => (mode === 'search' ? readFilters(router.asPath) : EMPTY_FILTERS),
    [mode, router.asPath]
  );
  const totals = useMemo(() => buildMonthTotals(events), [events]);

  const queryYear = router.query.year;
  const queryMonth = router.query.month;
  const month = useMemo<MonthParam | null>(() => {
    if (mode !== 'events') return null;
    const param = readMonthParam({ year: queryYear, month: queryMonth });
    if (!param) return null;
    return totals[monthKey(param.year, param.month)] === undefined
      ? param
      : null;
  }, [mode, queryYear, queryMonth, totals]);

  const monthly = useMonthlyEvent({ param: month });

  const view = useMemo(
    () =>
      buildTimelineView({
        events: month ? monthly.monthlyEvent ?? [] : current,
        current,
        filters,
        newOnly,
        showPast,
        month,
        now,
      }),
    [month, monthly.monthlyEvent, current, filters, newOnly, showPast, now]
  );

  const [activeKey, setActiveKey] = useState(
    () => findTargetKey(view.visible, todayKey) ?? todayKey
  );
  const [navH, setNavH] = useState(130);
  const [searchOpen, setSearchOpen] = useState(Boolean(filters.kwd));

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navHRef = useRef(navH);
  navHRef.current = navH;
  const pendingRef = useRef<string | null>(null);
  const lockedRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipPastScrollRef = useRef(false);
  const pickerOpenRef = useRef(false);
  const onPickerOpenChange = useCallback((open: boolean) => {
    pickerOpenRef.current = open;
  }, []);

  const title: MonthParam = month ?? {
    year: Number(activeKey.slice(0, 4)),
    month: Number(activeKey.slice(5, 7)),
  };

  const yearRange = useMemo(() => {
    const thisYear = Number(todayKey.slice(0, 4));
    let lastYear = thisYear;
    Object.keys(totals).forEach((key) => {
      const year = Number(key.slice(0, 4));
      if (!Number.isNaN(year) && year > lastYear) lastYear = year;
    });
    return { min: thisYear - 1, max: Math.max(thisYear, lastYear) };
  }, [totals, todayKey]);

  const unlock = useCallback(() => {
    lockedRef.current = false;
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const lockFor = (ms: number) => {
    unlock();
    lockedRef.current = true;
    lockTimerRef.current = setTimeout(unlock, ms);
  };

  // 날짜 이동: 멀면 바로, 가까우면 부드럽게. 이동하는 동안 스크롤 연동을 잠근다.
  const scrollToY = (top: number) => {
    const y = Math.max(0, top);
    const far = Math.abs(y - window.scrollY) > FAR_DISTANCE;
    if (far || prefersReducedMotion()) {
      lockFor(INSTANT_LOCK_MS);
      window.scrollTo({ top: y, behavior: 'auto' });
    } else {
      lockFor(SMOOTH_LOCK_MS);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const absoluteTop = (el: Element) =>
    el.getBoundingClientRect().top + window.scrollY;

  // 가려는 날짜의 묶음이 그려졌으면 이동한다. 아직이면 pending을 남겨 둔다.
  const flush = () => {
    const wanted = pendingRef.current;
    if (wanted === null) return;
    if (month && monthly.isLoading) return;
    const target = findTargetKey(view.groups, wanted);
    if (target === null) {
      pendingRef.current = null;
      return;
    }
    // 오늘 이후를 찾는데 오늘 이후 묶음이 없어 지난 묶음이 나오면 지난 행사를 켜지 않는다
    if (wanted >= todayKey && target < todayKey && !showPast && !month) {
      pendingRef.current = null;
      return;
    }
    if (target < todayKey && !showPast && !month) {
      skipPastScrollRef.current = true;
      handleShowPast(true);
      return;
    }
    const el = document.getElementById(dayElementId(target));
    if (!el) return;
    pendingRef.current = null;
    setActiveKey(target);
    scrollToY(absoluteTop(el) - navHRef.current - 4);
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // 지금 그려진 목록 안에서 날짜로 이동한다
  const go = (key: string) => {
    pendingRef.current = key;
    flush();
  };

  // 다른 달 보기면 /events로 돌아온 뒤 이동하고, 아니면 바로 이동한다
  const goBack = (key: string) => {
    if (!month) {
      go(key);
      return;
    }
    pendingRef.current = key;
    router.push('/events', undefined, { shallow: true, scroll: false });
  };

  const onPickMonth = ({ year, month: m }: MonthParam) => {
    const key = monthKey(year, m);
    if (totals[key] !== undefined) {
      goBack(key === todayKey.slice(0, 7) ? todayKey : `${key}-01`);
      return;
    }
    router
      .push({ pathname: '/events', query: { year, month: m } }, undefined, {
        shallow: true,
        scroll: false,
      })
      .then(() => {
        if (rootRef.current) {
          window.scrollTo({
            top: absoluteTop(rootRef.current),
            behavior: 'auto',
          });
        }
      })
      .catch(() => undefined);
  };

  // 묶음이 새로 그려진 뒤에 기다리던 이동을 마친다
  useEffect(() => {
    if (pendingRef.current !== null) flushRef.current();
  }, [view.visible]);

  // 보기 전환으로 넘어온 날짜: 마운트 때 한 번 받아 쓰고 비운다.
  // 날짜 띠 높이를 잰 뒤에 이동하도록 다음 프레임에 부른다.
  useEffect(() => {
    if (focusDay === null) return undefined;
    pendingRef.current = focusDay;
    handleFocusDay(null);
    const frame = window.requestAnimationFrame(() => flushRef.current());
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // 다른 달 보기: 활성 날짜가 그 달에 없으면 첫 묶음으로
  useEffect(() => {
    if (!month || view.visible.length === 0) return;
    if (!view.visible.some((group) => group.key === activeKey)) {
      setActiveKey(view.visible[0].key);
    }
  }, [month, view.visible, activeKey]);

  // 보고 있는 날짜 묶음을 activeKey에 맞춘다
  const syncActive = () => {
    const list = listRef.current;
    if (!list || lockedRef.current || pickerOpenRef.current) return;
    const nodes = list.querySelectorAll<HTMLElement>('section[data-key]');
    if (nodes.length === 0) return;
    const line = navHRef.current + SPY_OFFSET;
    let key = nodes[0].dataset.key as string;
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].getBoundingClientRect().top <= line) {
        key = nodes[i].dataset.key as string;
      } else {
        break;
      }
    }
    setActiveKey(key);
  };
  const syncActiveRef = useRef(syncActive);
  syncActiveRef.current = syncActive;

  // 스크롤 없이 목록이 바뀌었을 때(자정, 뒤로 가기, 필터)도 다시 맞춘다
  const firstVisibleRef = useRef(true);
  useEffect(() => {
    if (firstVisibleRef.current) {
      firstVisibleRef.current = false;
      return;
    }
    if (pendingRef.current === null) syncActiveRef.current();
  }, [view.visible]);

  // 스크롤과 날짜 띠 연동
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      syncActiveRef.current();
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', unlock);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', unlock);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      unlock();
    };
  }, [unlock]);

  // 지난 행사 칩을 켜고 끌 때: 목록 위쪽으로
  const firstPastRef = useRef(true);
  useEffect(() => {
    if (firstPastRef.current) {
      firstPastRef.current = false;
      return;
    }
    if (skipPastScrollRef.current) {
      skipPastScrollRef.current = false;
      return;
    }
    if (listRef.current) {
      lockFor(INSTANT_LOCK_MS);
      window.scrollTo({
        top: Math.max(0, absoluteTop(listRef.current) - navHRef.current - 4),
        behavior: 'auto',
      });
    }
  }, [showPast]);

  // 새로 올라온 행사를 켰을 때: 목록 위쪽으로 부드럽게
  const firstNewRef = useRef(true);
  useEffect(() => {
    if (firstNewRef.current) {
      firstNewRef.current = false;
      return;
    }
    if (!newOnly || !listRef.current) return;
    lockFor(prefersReducedMotion() ? INSTANT_LOCK_MS : SMOOTH_LOCK_MS);
    window.scrollTo({
      top: Math.max(0, absoluteTop(listRef.current) - navHRef.current - 70),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [newOnly]);

  const renderBody = () => {
    if (isError || (month && monthly.isError)) {
      return (
        <TimelineEmpty title="이벤트 정보를 불러오는데 문제가 발생했습니다!" />
      );
    }
    if (month && monthly.isLoading) return <TimelineSkeleton />;
    if (view.visible.length === 0) {
      if (month) {
        return (
          <TimelineEmpty
            title={`${month.month}월에는 조건에 맞는 행사가 없어요`}
            desc="다른 달을 고르거나 오늘로 돌아가 보세요."
            actionLabel="오늘로 돌아가기"
            onAction={() => goBack(todayKey)}
          />
        );
      }
      if (newOnly) {
        return (
          <TimelineEmpty
            title="조건에 맞는 행사가 없어요"
            desc="검색어나 필터를 바꿔 보세요."
            actionLabel="필터 초기화"
            onAction={() => {
              handleNewOnly(false);
              if (mode === 'search') router.push('/events');
            }}
          />
        );
      }
      return <EventNull events={current} />;
    }
    return (
      <TimelineList
        groups={view.visible}
        todayKey={todayKey}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        endnote={mode === 'events' && !month}
      />
    );
  };

  return (
    <div
      ref={rootRef}
      className={cn('timeline')}
      style={{ '--de-navh': `${navH}px` } as React.CSSProperties}
    >
      <DateNav
        days={view.days}
        activeKey={activeKey}
        title={title}
        monthTotals={totals}
        thisMonthKey={todayKey.slice(0, 7)}
        yearRange={yearRange}
        lockUnknownMonths={mode === 'search'}
        view="list"
        searchOpen={searchOpen}
        onPickDay={go}
        onPickMonth={onPickMonth}
        onToday={() => goBack(todayKey)}
        onToggleSearch={() => setSearchOpen((prev) => !prev)}
        onPickerOpenChange={onPickerOpenChange}
        onHeightChange={setNavH}
      />
      <FilterBar
        filters={filters}
        searchOpen={searchOpen}
        newCount={view.newCount}
        pastCount={view.pastCount}
        hidePastChip={Boolean(month)}
      />
      {mode === 'search' && filters.kwd && (
        <div className={cn('search-head')}>
          <h2 className={cn('search-title')}>
            <em>‘{filters.kwd}’</em> 검색 결과<i>{view.visibleCount}</i>
          </h2>
        </div>
      )}
      <div ref={listRef} className={cn('list')}>
        {renderBody()}
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
    </div>
  );
}

export default EventTimeline;
