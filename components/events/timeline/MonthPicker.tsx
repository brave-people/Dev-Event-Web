import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { MonthParam, monthKey } from 'lib/utils/timeline/dateStrip';
import style from './MonthPicker.module.scss';

const cn = classNames.bind(style);

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

interface MonthPickerProps {
  title: MonthParam;
  monthTotals: Record<string, number>;
  thisMonthKey: string;
  yearRange: { min: number; max: number };
  lockUnknownMonths?: boolean;
  onPickMonth: (month: MonthParam) => void;
  onClose: () => void;
  className?: string;
}

function MonthPicker({
  title,
  monthTotals,
  thisMonthKey,
  yearRange,
  lockUnknownMonths,
  onPickMonth,
  onClose,
  className,
}: MonthPickerProps) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const [year, setYear] = useState(title.year);

  useEffect(() => {
    if (currentRef.current) currentRef.current.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className={cn('picker', className)} role="dialog" aria-label="월 선택">
      <div className={cn('year')}>
        <button
          type="button"
          className={cn('yearBtn')}
          aria-label="이전 해"
          disabled={year <= yearRange.min}
          onClick={() => setYear(year - 1)}
        >
          <TimelineIcon name="back" size={16} />
        </button>
        {year}년
        <button
          type="button"
          className={cn('yearBtn')}
          aria-label="다음 해"
          disabled={year >= yearRange.max}
          onClick={() => setYear(year + 1)}
        >
          <TimelineIcon name="chevron" size={16} />
        </button>
      </div>
      <div className={cn('grid')}>
        {MONTHS.map((month) => {
          const key = monthKey(year, month);
          const total = monthTotals[key];
          const known = total !== undefined;
          const selected = year === title.year && month === title.month;
          const label =
            known && total > 0 ? `${month}월, 행사 ${total}건` : `${month}월`;
          return (
            <button
              key={key}
              ref={selected ? currentRef : undefined}
              type="button"
              className={cn('month', {
                'is-on': selected,
                'is-now': key === thisMonthKey && !selected,
                'is-zero': known && total === 0,
                'is-locked': !!lockUnknownMonths && !known,
              })}
              disabled={!!lockUnknownMonths && !known}
              aria-label={label}
              aria-current={selected ? 'true' : undefined}
              onClick={() => onPickMonth({ year, month })}
            >
              {month}월
              {known && <small>{total > 0 ? `${total}건` : '–'}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MonthPicker;
