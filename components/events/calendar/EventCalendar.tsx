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
import LoginModal from 'components/common/modal/LoginModal';
import DayPanel from 'components/events/calendar/DayPanel';
import HeatMonth from 'components/events/calendar/HeatMonth';
import ViewToggle from 'components/events/calendar/ViewToggle';
import { buildCalendarView } from 'components/events/calendar/utils/buildCalendarView';
import {
  calendarHref,
  listPathOf,
  readDayParam,
} from 'components/events/calendar/utils/calendarUrl';
import FilterBar from 'components/events/timeline/FilterBar';
import { EventContext } from 'context/event';
import { useFavorite } from 'lib/hooks/useFavorite';
import { useNow } from 'lib/hooks/useNow';
import { MonthParam } from 'lib/utils/timeline/dateStrip';
import { readFilters } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';
import style from './EventCalendar.module.scss';

const cn = classNames.bind(style);

interface EventCalendarProps {
  year: number;
  month: number; // 1~12
  events: Event[] | undefined;
  isError: boolean;
  now: string; // 서버가 그린 시각 (한국 시간)
}

const NAV_OPTIONS = { scroll: false };
const SHALLOW_OPTIONS = { shallow: true, scroll: false };

function EventCalendar({
  year,
  month,
  events,
  isError,
  now: serverNow,
}: EventCalendarProps) {
  const router = useRouter();
  const { newOnly } = useContext(EventContext);
  const { isFavorite, toggleFavorite, loginModalIsOpen, closeLoginModal } =
    useFavorite();

  const now = useNow(serverNow);
  const todayKey = now.slice(0, 10);
  const thisMonthKey = todayKey.slice(0, 7);

  const listPath = useMemo(() => listPathOf(router.query), [router.query]);
  const filters = useMemo(() => readFilters(listPath), [listPath]);
  const wanted = useMemo(
    () => readDayParam(router.query, year, month),
    [router.query, year, month]
  );

  const list = useMemo(() => (Array.isArray(events) ? events : []), [events]);
  const view = useMemo(
    () =>
      buildCalendarView({
        events: list,
        filters,
        newOnly,
        year,
        month,
        wanted,
        now,
      }),
    [list, filters, newOnly, year, month, wanted, now]
  );

  const failed =
    list.length === 0 &&
    (isError || (events !== undefined && !Array.isArray(events)));

  const yearRange = useMemo(() => {
    const thisYear = Number(todayKey.slice(0, 4));
    return {
      min: Math.min(thisYear - 1, year),
      max: Math.max(thisYear + 1, year),
    };
  }, [todayKey, year]);

  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const selectDay = useCallback(
    (key: string) => {
      if (pendingRef.current) return;
      router
        .replace(
          calendarHref({ year, month, day: key }, listPath),
          undefined,
          SHALLOW_OPTIONS
        )
        .catch(() => undefined);
    },
    [router, year, month, listPath]
  );

  const goMonth = useCallback(
    (target: MonthParam) => {
      if (pendingRef.current) return;
      if (target.year === year && target.month === month) return;
      pendingRef.current = true;
      setPending(true);
      router
        .push(
          calendarHref({ year: target.year, month: target.month }, listPath),
          undefined,
          NAV_OPTIONS
        )
        .catch(() => undefined)
        .then(() => {
          pendingRef.current = false;
          if (mountedRef.current) setPending(false);
        });
    },
    [router, year, month, listPath]
  );

  const goToday = useCallback(() => {
    if (view.monthKey !== thisMonthKey) {
      goMonth({
        year: Number(thisMonthKey.slice(0, 4)),
        month: Number(thisMonthKey.slice(5, 7)),
      });
      return;
    }
    if (pendingRef.current || wanted === null) return;
    router
      .replace(
        calendarHref({ year, month }, listPath),
        undefined,
        SHALLOW_OPTIONS
      )
      .catch(() => undefined);
  }, [
    view.monthKey,
    thisMonthKey,
    goMonth,
    router,
    year,
    month,
    listPath,
    wanted,
  ]);

  const navigateFilter = useCallback(
    (url: string) => {
      if (pendingRef.current) return;
      router
        .push(
          calendarHref({ year, month, day: wanted }, url),
          undefined,
          SHALLOW_OPTIONS
        )
        .catch(() => undefined);
    },
    [router, year, month, wanted]
  );

  return (
    <div className={cn('calendar')}>
      <div className={cn('top')}>
        <div className={cn('switch')}>
          <ViewToggle
            current="calendar"
            dayKey={view.selectedKey ?? undefined}
          />
        </div>
        <FilterBar
          variant="calendar"
          filters={filters}
          asPath={listPath}
          onNavigate={navigateFilter}
          searchOpen
          newCount={view.newCount}
          pastCount={0}
          hidePastChip
        />
      </div>
      <div className={cn('body')}>
        <aside className={cn('aside')} aria-label="월 달력">
          <HeatMonth
            year={year}
            month={month}
            weeks={view.weeks}
            keys={view.keys}
            selectedKey={view.selectedKey}
            thisMonthKey={thisMonthKey}
            yearRange={yearRange}
            busy={pending}
            onSelectDay={selectDay}
            onPickMonth={goMonth}
            onToday={goToday}
          />
        </aside>
        <div
          className={cn('pane', { 'is-busy': pending })}
          aria-busy={pending ? true : undefined}
        >
          <span className={cn('sr-only')} role="status">
            {pending ? '행사를 불러오는 중이에요' : ''}
          </span>
          <DayPanel
            month={month}
            selectedKey={view.selectedKey}
            sections={view.sections}
            prevKey={view.prevKey}
            nextKey={view.nextKey}
            failed={failed}
            showTodayAction={view.monthKey !== thisMonthKey}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectDay={selectDay}
            onToday={goToday}
          />
        </div>
      </div>
      <LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
    </div>
  );
}

export default EventCalendar;
