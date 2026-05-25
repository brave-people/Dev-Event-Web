import style from 'components/hosts/HostListControls.module.scss';
import { classificationLabel, CLASSIFICATION_ORDER } from 'lib/host/logoFallback';
import { HostCategory, HostSort } from 'model/host';
import React from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

const CATEGORIES: HostCategory[] = ['all', 'ongoing', ...CLASSIFICATION_ORDER];

const CATEGORY_LABEL = (c: HostCategory): string => {
  if (c === 'all') return '전체';
  if (c === 'ongoing') return '행사 진행중';
  return classificationLabel(c);
};

const SORT_LABEL: Record<HostSort, string> = {
  activity: '활동 많은 순',
  recent: '최근 행사 순',
  name: '가나다순',
};

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: HostSort;
  onSortChange: (sort: HostSort) => void;
  category: HostCategory;
  onCategoryChange: (category: HostCategory) => void;
};

const HostListControls = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
}: Props) => {
  const cycleSort = () => {
    const order: HostSort[] = ['activity', 'recent', 'name'];
    const idx = order.indexOf(sort);
    onSortChange(order[(idx + 1) % order.length]);
  };

  return (
    <>
      <div className={cn('controls')}>
        <div className={cn('search')}>
          <svg
            className={cn('search__icon')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            className={cn('search__input')}
            type="search"
            placeholder="주최자 이름 검색 (예: 당근, AWSKRUG)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={cn('sort')}>
          <button
            type="button"
            className={cn('sort__btn')}
            onClick={cycleSort}
            aria-label="정렬 기준 변경"
          >
            {SORT_LABEL[sort]}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className={cn('cats')}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(c === category ? 'cat__active' : 'cat')}
            onClick={() => onCategoryChange(c)}
          >
            {CATEGORY_LABEL(c)}
          </button>
        ))}
      </div>
    </>
  );
};

export default HostListControls;
