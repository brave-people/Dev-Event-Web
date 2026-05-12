import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import style from './ToastStack.module.scss';

const cx = classNames.bind(style);

export interface ToastItem {
  id: number;
  message: string;
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
  duration?: number;
}

function ToastRow({
  toast,
  onDismiss,
  duration,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
  duration: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss, duration]);

  return (
    <div className={cx('toast')}>
      <span className={cx('toast__text')}>{toast.message}</span>
    </div>
  );
}

function ToastStack({ toasts, onDismiss, duration = 2400 }: ToastStackProps) {
  return (
    <div className={cx('stack')} aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastRow
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          duration={duration}
        />
      ))}
    </div>
  );
}

export default ToastStack;
