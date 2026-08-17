import style from 'components/hosts/HostPagination.module.scss';
import React from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const WINDOW = 5;

/** 현재 페이지 주변으로 최대 5개 번호만 보여준다. */
const buildPageNumbers = (page: number, totalPages: number): number[] => {
  const half = Math.floor(WINDOW / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(totalPages, start + WINDOW);
  start = Math.max(0, end - WINDOW);
  return Array.from({ length: end - start }, (_, i) => start + i);
};

const HostPagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);
  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;

  return (
    <nav className={cn('pagination')} aria-label="주최자 목록 페이지">
      <button
        type="button"
        className={cn('nav')}
        onClick={() => onChange(page - 1)}
        disabled={isFirst}
        aria-label="이전 페이지"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={cn(p === page ? 'page__active' : 'page')}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p + 1}
        </button>
      ))}

      <button
        type="button"
        className={cn('nav')}
        onClick={() => onChange(page + 1)}
        disabled={isLast}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
};

export default HostPagination;
