import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import DateStrip from 'components/events/timeline/DateStrip';
import MonthPicker from 'components/events/timeline/MonthPicker';
import ViewToggle, { ViewMode } from 'components/events/calendar/ViewToggle';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import { MonthParam, StripDay } from 'lib/utils/timeline/dateStrip';
import style from './DateNav.module.scss';

const cn = classNames.bind(style);

// 안내(토스트)가 뜨는 자리의 아래 끝(위에서 168px, ToastStack.module.scss)에 여유를 더한 값.
// 날짜 띠의 위쪽이 이보다 위에 있으면 안내와 겹칠 수 있다
const TOAST_ZONE = 180;
const STUCK_BOTTOM = '--de-stuck-bottom';

interface DateNavProps {
  days: StripDay[];
  activeKey: string;
  title: MonthParam;
  monthTotals: Record<string, number>;
  thisMonthKey: string;
  yearRange: { min: number; max: number };
  lockUnknownMonths?: boolean;
  view: ViewMode;
  searchOpen: boolean;
  onPickDay: (key: string) => void;
  onPickMonth: (month: MonthParam) => void;
  onToday: () => void;
  onToggleSearch: () => void;
  onHeightChange: (px: number) => void;
  onPickerOpenChange?: (open: boolean) => void;
}

function DateNav({
  days,
  activeKey,
  title,
  monthTotals,
  thisMonthKey,
  yearRange,
  lockUnknownMonths,
  view,
  searchOpen,
  onPickDay,
  onPickMonth,
  onToday,
  onToggleSearch,
  onHeightChange,
  onPickerOpenChange,
}: DateNavProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const monthBtnRef = useRef<HTMLButtonElement>(null);
  const heightCallbackRef = useRef(onHeightChange);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  heightCallbackRef.current = onHeightChange;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const report = () => heightCallbackRef.current(el.offsetHeight);
    report();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(report);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', report);
    return () => window.removeEventListener('resize', report);
  }, []);

  // 날짜 띠가 화면 위쪽(안내가 뜨는 자리)에 걸쳐 있으면 그 아랫선을 <html>에 알린다.
  // 안내는 이 값보다 아래에 뜬다(ToastStack.module.scss)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (rect.top < TOAST_ZONE && rect.bottom > 0) {
        root.style.setProperty(STUCK_BOTTOM, `${Math.round(rect.bottom)}px`);
      } else {
        root.style.removeProperty(STUCK_BOTTOM);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : null;
    observer?.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      root.style.removeProperty(STUCK_BOTTOM);
    };
  }, []);

  const pickerCallbackRef = useRef(onPickerOpenChange);
  pickerCallbackRef.current = onPickerOpenChange;
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current && pickerCallbackRef.current) {
      pickerCallbackRef.current(open);
    }
    mountedRef.current = true;
  }, [open]);

  // 풍선이 열린 채로 언마운트되면 열림 상태를 되돌린다
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(
    () => () => {
      if (openRef.current && pickerCallbackRef.current) {
        pickerCallbackRef.current(false);
      }
    },
    []
  );

  // Esc로 닫거나 달을 골라 닫을 때만 포커스를 월 버튼으로 돌린다
  const closeWithFocus = useCallback(() => {
    setOpen(false);
    if (monthBtnRef.current) monthBtnRef.current.focus();
  }, []);

  // 바깥을 눌러 닫을 때는 포커스를 건드리지 않는다
  const closeOutside = useCallback(() => setOpen(false), []);

  useOnClickOutside({
    ref: anchorRef,
    handler: closeOutside,
    mouseEvent: 'mousedown',
  });

  return (
    <div ref={rootRef} className={cn('nav')}>
      <div className={cn('top')}>
        <div ref={anchorRef} className={cn('anchor')}>
          <button
            ref={monthBtnRef}
            type="button"
            className={cn('monthBtn')}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label={`${title.year}년 ${title.month}월, 다른 달 고르기`}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className={cn('year')}>{title.year}년 </span>
            {title.month}월
            <TimelineIcon name="chevron" size={18} className={cn('caret')} />
          </button>
          {open && (
            <MonthPicker
              title={title}
              monthTotals={monthTotals}
              thisMonthKey={thisMonthKey}
              yearRange={yearRange}
              lockUnknownMonths={lockUnknownMonths}
              onPickMonth={(month) => {
                onPickMonth(month);
                closeWithFocus();
              }}
              onClose={closeWithFocus}
            />
          )}
        </div>
        <div className={cn('right')}>
          <button
            type="button"
            className={cn('searchBtn')}
            aria-label="행사 검색"
            aria-expanded={searchOpen}
            onClick={onToggleSearch}
          >
            <TimelineIcon name="search" size={20} />
          </button>
          <button type="button" className={cn('today')} onClick={onToday}>
            오늘
          </button>
          <ViewToggle current={view} dayKey={activeKey} />
        </div>
      </div>
      <DateStrip days={days} activeKey={activeKey} onPickDay={onPickDay} />
    </div>
  );
}

export default DateNav;
