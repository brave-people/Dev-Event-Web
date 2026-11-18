import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import HeatLegend from 'components/events/calendar/HeatLegend';
import { MonthCell } from 'components/events/calendar/utils/calendarMonth';
import { moveByArrow } from 'components/events/calendar/utils/calendarDay';
import { shiftMonth } from 'components/events/calendar/utils/calendarUrl';
import MonthPicker from 'components/events/timeline/MonthPicker';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import { MonthParam } from 'lib/utils/timeline/dateStrip';
import { DOW } from 'lib/utils/timeline/kst';
import style from './HeatMonth.module.scss';

const cn = classNames.bind(style);

const LEGEND_ID = 'calendar-legend';
const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

interface HeatMonthProps {
  year: number;
  month: number; // 1~12
  weeks: MonthCell[][];
  keys: string[]; // 행사 있는 날 (방향키와 Tab이 멈추는 칸)
  selectedKey: string | null;
  thisMonthKey: string; // 오늘이 속한 달 'YYYY-MM'
  yearRange: { min: number; max: number };
  busy?: boolean;
  onSelectDay: (key: string) => void;
  onPickMonth: (month: MonthParam) => void;
  onToday: () => void;
}

// Tab이 멈추는 칸 하나
const pickTabKey = (keys: string[], selectedKey: string | null) => {
  if (keys.length === 0) return null;
  if (!selectedKey) return keys[0];
  if (keys.indexOf(selectedKey) >= 0) return selectedKey;
  const after = keys.filter((k) => k > selectedKey)[0];
  return after || keys[keys.length - 1];
};

function HeatMonth({
  year,
  month,
  weeks,
  keys,
  selectedKey,
  thisMonthKey,
  yearRange,
  busy,
  onSelectDay,
  onPickMonth,
  onToday,
}: HeatMonthProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [tail, setTail] = useState(126);

  const monthBtnRef = useRef<HTMLButtonElement>(null);
  const infoBtnRef = useRef<HTMLButtonElement>(null);
  const monthAnchorRef = useRef<HTMLDivElement>(null);
  const infoAnchorRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const movedByArrow = useRef(false);

  const closeAll = () => {
    setPickerOpen(false);
    setLegendOpen(false);
  };

  // 바깥을 눌러 닫을 때는 포커스를 건드리지 않는다
  const closePickerOutside = useCallback(() => setPickerOpen(false), []);
  const closeLegendOutside = useCallback(() => setLegendOpen(false), []);

  useOnClickOutside({
    ref: monthAnchorRef,
    handler: closePickerOutside,
    mouseEvent: 'mousedown',
  });
  useOnClickOutside({
    ref: infoAnchorRef,
    handler: closeLegendOutside,
    mouseEvent: 'mousedown',
  });

  const closePickerWithFocus = useCallback(() => {
    setPickerOpen(false);
    if (monthBtnRef.current) monthBtnRef.current.focus();
  }, []);

  const closeLegendWithFocus = useCallback(() => {
    setLegendOpen(false);
    if (infoBtnRef.current) infoBtnRef.current.focus();
  }, []);

  const togglePicker = () => {
    setLegendOpen(false);
    setPickerOpen((prev) => !prev);
  };

  const toggleLegend = () => {
    setPickerOpen(false);
    if (!legendOpen && infoBtnRef.current) {
      const btn = infoBtnRef.current;
      setTail(btn.offsetLeft + btn.offsetWidth / 2 - 6);
    }
    setLegendOpen((prev) => !prev);
  };

  const handlePickMonth = (next: MonthParam) => {
    movedByArrow.current = false;
    setPickerOpen(false);
    if (monthBtnRef.current) monthBtnRef.current.focus();
    onPickMonth(next);
  };

  const shift = (delta: number) => {
    movedByArrow.current = false;
    closeAll();
    onPickMonth(shiftMonth(year, month, delta));
  };

  const handleToday = () => {
    movedByArrow.current = false;
    closeAll();
    onToday();
  };

  const handleSelect = (key: string) => {
    closeAll();
    onSelectDay(key);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    const target = event.target as HTMLElement;
    if (!target.matches || !target.matches('button[data-key]')) return;
    if (ARROWS.indexOf(event.key) < 0) return;
    event.preventDefault();
    if (busy) return;
    const from = target.getAttribute('data-key') as string;
    const next = moveByArrow(keys, from, event.key);
    if (!next || next === from) return;
    movedByArrow.current = true;
    onSelectDay(next);
  };

  // 방향키로 옮겼다면 고른 날이 바뀐 뒤 그 칸에 포커스를 준다
  useEffect(() => {
    if (!movedByArrow.current) return;
    movedByArrow.current = false;
    if (!selectedKey || !tbodyRef.current) return;
    const cell = tbodyRef.current.querySelector<HTMLButtonElement>(
      `button[data-key="${selectedKey}"]`
    );
    if (cell) cell.focus({ preventScroll: true });
  }, [selectedKey]);

  const tabKey = pickTabKey(keys, selectedKey);
  const prevDisabled = year <= yearRange.min && month === 1;
  const nextDisabled = year >= yearRange.max && month === 12;

  return (
    <div className={cn('month')}>
      <div className={cn('head')}>
        <div ref={monthAnchorRef} className={cn('anchor')}>
          <button
            ref={monthBtnRef}
            type="button"
            className={cn('title', { 'is-open': pickerOpen })}
            aria-expanded={pickerOpen}
            aria-haspopup="dialog"
            aria-label={`${year}년 ${month}월, 다른 달 고르기`}
            onClick={togglePicker}
          >
            {year}년 {month}월
            <TimelineIcon name="chevron" size={16} />
          </button>
          {pickerOpen && (
            <MonthPicker
              className={cn('picker')}
              title={{ year, month }}
              monthTotals={{}}
              thisMonthKey={thisMonthKey}
              yearRange={yearRange}
              onPickMonth={handlePickMonth}
              onClose={closePickerWithFocus}
            />
          )}
        </div>
        <div ref={infoAnchorRef} className={cn('anchor')}>
          <button
            ref={infoBtnRef}
            type="button"
            className={cn('info', { 'is-open': legendOpen })}
            aria-expanded={legendOpen}
            aria-controls={LEGEND_ID}
            aria-label="달력의 색과 숫자가 무엇을 뜻하는지 보기"
            onClick={toggleLegend}
          >
            <TimelineIcon name="info" size={20} />
          </button>
          {legendOpen && (
            <HeatLegend
              id={LEGEND_ID}
              tail={tail}
              onClose={closeLegendWithFocus}
            />
          )}
        </div>
        <span className={cn('nav')}>
          <button
            type="button"
            className={cn('arrow')}
            aria-label="이전 달"
            disabled={prevDisabled}
            onClick={() => shift(-1)}
          >
            <TimelineIcon name="back" size={16} />
          </button>
          <button type="button" className={cn('today')} onClick={handleToday}>
            오늘
          </button>
          <button
            type="button"
            className={cn('arrow')}
            aria-label="다음 달"
            disabled={nextDisabled}
            onClick={() => shift(1)}
          >
            <TimelineIcon name="chevron" size={16} />
          </button>
        </span>
      </div>
      <table
        className={cn('grid', { 'is-busy': busy })}
        role="grid"
        aria-label={`${year}년 ${month}월 행사 달력`}
        aria-busy={busy ? 'true' : undefined}
      >
        <thead>
          <tr role="row">
            {DOW.map((name, index) => (
              <th
                key={name}
                role="columnheader"
                scope="col"
                abbr={`${name}요일`}
                className={cn({ sun: index === 0, sat: index === 6 })}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tbodyRef} onKeyDown={handleKeyDown}>
          {weeks.map((week) => (
            <tr key={week[0].key} role="row">
              {week.map((cell) => {
                if (!cell.inMonth) {
                  return (
                    <td key={cell.key} role="gridcell" aria-hidden="true" />
                  );
                }
                const weekend = {
                  sun: cell.weekday === 0,
                  sat: cell.weekday === 6,
                };
                return (
                  <td
                    key={cell.key}
                    role="gridcell"
                    aria-selected={cell.key === selectedKey}
                  >
                    <button
                      type="button"
                      className={cn('cell', `lv${cell.level}`, {
                        'is-past': cell.isPast,
                        'is-today': cell.isToday,
                        'is-on': cell.key === selectedKey,
                      })}
                      data-key={cell.key}
                      data-tip={cell.tip || undefined}
                      disabled={cell.count === 0}
                      tabIndex={cell.key === tabKey ? 0 : -1}
                      aria-label={cell.label}
                      aria-current={cell.isToday ? 'date' : undefined}
                      onClick={() => handleSelect(cell.key)}
                    >
                      <b className={cn(weekend)}>{cell.day}</b>
                      <small>{cell.count > 0 ? cell.count : ''}</small>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HeatMonth;
