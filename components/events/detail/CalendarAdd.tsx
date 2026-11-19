import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { openInCalendar, CalendarTarget } from 'lib/utils/calendar';
import { useToast } from 'context/toast';
import style from './CalendarAdd.module.scss';

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

interface CalendarAddProps {
  event: Event;
  triggerClassName?: string;
  children: React.ReactNode;
}

function CalendarAdd({ event, triggerClassName, children }: CalendarAddProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { pushToast } = useToast();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const first =
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    first?.focus();

    const handleMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(true);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, close]);

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );
    if (!items.length) return;
    if (e.key === 'Home' || e.key === 'End') {
      items[e.key === 'Home' ? 0 : items.length - 1].focus();
      return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement);
    const step = e.key === 'ArrowDown' ? 1 : -1;
    const next = (current + step + items.length) % items.length;
    items[next].focus();
  };

  const handleSelect = (target: CalendarTarget) => {
    close(true);
    try {
      openInCalendar(target, event, window.location.origin);
      if (target === 'apple' || target === 'outlook') {
        pushToast('캘린더 파일을 다운로드했어요');
      }
    } catch (err) {
      console.error('[calendar-export]', err);
      pushToast('캘린더 추가에 실패했어요', 'plain');
    }
  };

  return (
    <div ref={wrapperRef} className={cn('wrap')}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="캘린더에 추가"
        onClick={() => setOpen((prev) => !prev)}
      >
        {children}
      </button>
      {open && (
        <div
          ref={menuRef}
          className={cn('menu')}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          <div className={cn('head')}>캘린더 선택</div>
          {OPTIONS.map((opt) => (
            <button
              key={opt.target}
              type="button"
              role="menuitem"
              className={cn('item')}
              onClick={() => handleSelect(opt.target)}
            >
              <span
                className={cn('swatch')}
                style={{ background: opt.swatch }}
                aria-hidden="true"
              >
                {opt.initial}
              </span>
              <span className={cn('name')}>{opt.label}</span>
              <span className={cn('hint')}>{opt.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CalendarAdd;
