import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { openInCalendar, CalendarTarget } from 'lib/utils/calendar';
import { useToast } from 'context/toast';
import style from './CalendarExportButton.module.scss';

const cn = classNames.bind(style);

interface Option {
  target: CalendarTarget;
  label: string;
  hint: string;
  initial: string;
  swatch: string;
}

const OPTIONS: Option[] = [
  {
    target: 'apple',
    label: 'Apple 캘린더',
    hint: '.ics',
    initial: '',
    swatch: '#0E0E14',
  },
  {
    target: 'google',
    label: 'Google 캘린더',
    hint: '새 탭 열기',
    initial: 'G',
    swatch: '#4285F4',
  },
  {
    target: 'outlook',
    label: 'Outlook',
    hint: '.ics',
    initial: 'O',
    swatch: '#0078D4',
  },
];

interface CalendarExportButtonProps {
  event: Event;
  className?: string;
}

const CalendarExportButton: React.FC<CalendarExportButtonProps> = ({
  event,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const handleSelect = (target: CalendarTarget) => {
    setOpen(false);
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : '';
    try {
      openInCalendar(target, event, baseUrl);
      if (target === 'apple' || target === 'outlook') {
        pushToast('캘린더 파일을 다운로드했어요');
      }
    } catch (err) {
      console.error('[calendar-export]', err);
      pushToast('캘린더 추가에 실패했어요');
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('wrapper', className)}
    >
      <button
        type="button"
        className={cn('trigger', { 'is-open': open })}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="내 캘린더에 추가"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x={3} y={4} width={18} height={18} rx={2} />
          <line x1={16} y1={2} x2={16} y2={6} />
          <line x1={8} y1={2} x2={8} y2={6} />
          <line x1={3} y1={10} x2={21} y2={10} />
          <line x1={12} y1={14} x2={12} y2={18} />
          <line x1={10} y1={16} x2={14} y2={16} />
        </svg>
      </button>

      {open && (
        <div className={cn('menu')} role="menu">
          <div className={cn('menu__head')}>캘린더 선택</div>
          {OPTIONS.map((opt) => (
            <button
              key={opt.target}
              type="button"
              role="menuitem"
              className={cn('menu__item')}
              onClick={() => handleSelect(opt.target)}
            >
              <span
                className={cn('menu__swatch')}
                style={{ background: opt.swatch }}
                aria-hidden
              >
                {opt.initial}
              </span>
              <span className={cn('menu__label')}>{opt.label}</span>
              <span className={cn('menu__hint')}>{opt.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarExportButton;
