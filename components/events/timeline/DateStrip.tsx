import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { StripDay, stripDayLabel } from 'lib/utils/timeline/dateStrip';
import style from './DateStrip.module.scss';

const cn = classNames.bind(style);

const DRAG_THRESHOLD = 5;
const STILL_MS = 80;
const INERTIA_MS = 220;
const DRAG_CLASS_MS = 420;

interface DateStripProps {
  days: StripDay[];
  activeKey: string;
  onPickDay: (key: string) => void;
}

interface DragState {
  x: number;
  left: number;
  moved: boolean;
  lastX: number;
  lastT: number;
  v: number;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const behaviorOf = (): ScrollBehavior =>
  prefersReducedMotion() ? 'auto' : 'smooth';

function DateStrip({ days, activeKey, onPickDay }: DateStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const cleanupDragRef = useRef<(() => void) | null>(null);
  const dragClassTimerRef = useRef<number | null>(null);
  const prevFirstRef = useRef<string | null>(null);
  const prevActiveRef = useRef<string | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [dragging, setDragging] = useState(false);

  const updateArrows = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    setCanPrev(strip.scrollLeft > 1);
    setCanNext(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    strip.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
    return () => {
      strip.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    updateArrows();
  }, [days, updateArrows]);

  // 고른 날이 화면 밖이면 띠가 따라간다. 첫 날이 바뀐 직후에는 바로 옮긴다.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || days.length === 0) return;
    const first = days[0].key;
    const firstChanged = prevFirstRef.current !== first;
    prevFirstRef.current = first;

    const findCell = (key: string) =>
      strip.querySelector<HTMLElement>(`[data-key="${key}"]`);
    const activeCell = findCell(activeKey);
    const activeChanged = prevActiveRef.current !== activeKey;
    // 고른 날의 칸이 아직 없으면 기억을 갱신하지 않는다 (나중에 days가 오면 따라간다)
    if (activeCell) prevActiveRef.current = activeKey;

    if (firstChanged) {
      const target =
        activeCell ||
        strip.querySelector<HTMLElement>('[aria-current="date"]') ||
        null;
      strip.scrollTo({
        left: target ? target.offsetLeft : 0,
        behavior: 'auto',
      });
      return;
    }
    if (!activeChanged || !activeCell) return;
    const left = activeCell.offsetLeft;
    const visible =
      left >= strip.scrollLeft - 1 &&
      left + activeCell.offsetWidth <= strip.scrollLeft + strip.clientWidth + 1;
    if (!visible) strip.scrollTo({ left, behavior: behaviorOf() });
  }, [days, activeKey]);

  useEffect(
    () => () => {
      if (cleanupDragRef.current) cleanupDragRef.current();
      if (dragClassTimerRef.current !== null) {
        window.clearTimeout(dragClassTimerRef.current);
      }
    },
    []
  );

  const scrollByHalf = (direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: (direction * strip.clientWidth) / 2,
      behavior: behaviorOf(),
    });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const found = stripRef.current;
    if (!found || event.pointerType !== 'mouse' || event.button !== 0) return;
    const strip: HTMLDivElement = found;
    if (cleanupDragRef.current) cleanupDragRef.current();
    // 관성으로 움직이는 중이면 그 자리에서 멈춘다
    strip.scrollTo({ left: strip.scrollLeft, behavior: 'auto' });

    const state: DragState = {
      x: event.clientX,
      left: strip.scrollLeft,
      moved: false,
      lastX: event.clientX,
      lastT: event.timeStamp,
      v: 0,
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.buttons === 0) {
        onEnd(ev);
        return;
      }
      const dx = ev.clientX - state.x;
      if (!state.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!state.moved) {
        state.moved = true;
        if (dragClassTimerRef.current !== null) {
          window.clearTimeout(dragClassTimerRef.current);
          dragClassTimerRef.current = null;
        }
        setDragging(true);
      }
      strip.scrollLeft = state.left - dx;
      const dt = ev.timeStamp - state.lastT;
      if (dt > 0) {
        state.v = (ev.clientX - state.lastX) / dt;
        state.lastX = ev.clientX;
        state.lastT = ev.timeStamp;
      }
    };

    const detach = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      cleanupDragRef.current = null;
    };

    function onEnd(ev: PointerEvent) {
      detach();
      if (!state.moved) return;
      const cell = strip.querySelector<HTMLElement>('button');
      const cellWidth = cell ? cell.getBoundingClientRect().width : 0;
      const still = ev.timeStamp - state.lastT > STILL_MS;
      const want =
        strip.scrollLeft -
        (still || prefersReducedMotion() ? 0 : state.v * INERTIA_MS);
      const max = strip.scrollWidth - strip.clientWidth;
      const snapped =
        cellWidth > 0 ? Math.round(want / cellWidth) * cellWidth : want;
      strip.scrollTo({
        left: Math.max(0, Math.min(max, snapped)),
        behavior: behaviorOf(),
      });
      dragClassTimerRef.current = window.setTimeout(() => {
        dragClassTimerRef.current = null;
        setDragging(false);
      }, DRAG_CLASS_MS);
      // 끈 직후에 오는 click은 날짜 누르기가 아니다
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    cleanupDragRef.current = detach;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <div className={cn('row')}>
      <button
        type="button"
        className={cn('arrow')}
        aria-label="이전 날짜 보기"
        disabled={!canPrev}
        onClick={() => scrollByHalf(-1)}
      >
        <TimelineIcon name="back" size={16} />
      </button>
      <div
        ref={stripRef}
        className={cn('strip', { 'is-drag': dragging })}
        role="group"
        aria-label="날짜 고르기"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        onDragStart={(event) => event.preventDefault()}
      >
        {days.map((day) => (
          <button
            key={day.key}
            type="button"
            data-key={day.key}
            className={cn('cell', {
              'is-today': day.isToday,
              'is-on': day.key === activeKey,
              'is-empty': day.count === 0,
              'is-past': day.isPast,
              'is-first': day.isFirst,
              sun: day.weekday === 0,
              sat: day.weekday === 6,
            })}
            disabled={day.count === 0}
            aria-label={stripDayLabel(day)}
            aria-current={day.isToday ? 'date' : undefined}
            aria-pressed={day.key === activeKey ? 'true' : undefined}
            onClick={() => onPickDay(day.key)}
          >
            <span className={cn('dow')}>{day.label}</span>
            <b className={cn('num')}>{day.day}</b>
            <small className={cn('cnt')}>{day.count || ''}</small>
          </button>
        ))}
      </div>
      <button
        type="button"
        className={cn('arrow')}
        aria-label="다음 날짜 보기"
        disabled={!canNext}
        onClick={() => scrollByHalf(1)}
      >
        <TimelineIcon name="chevron" size={16} />
      </button>
    </div>
  );
}

export default DateStrip;
