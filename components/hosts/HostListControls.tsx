import style from 'components/hosts/HostListControls.module.scss';
import { classificationLabel, CLASSIFICATION_ORDER } from 'lib/host/logoFallback';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import * as ga from 'lib/utils/gTag';
import { HostCategory, HostSort } from 'model/host';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

const CATEGORIES: HostCategory[] = ['all', 'ongoing', ...CLASSIFICATION_ORDER];

const SORT_ORDER: HostSort[] = ['activity', 'recent', 'name'];

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
  /** Enter 로 확정했을 때 디바운스를 건너뛰고 즉시 검색 */
  onSearchSubmit?: (value: string) => void;
  sort: HostSort;
  onSortChange: (sort: HostSort) => void;
  category: HostCategory;
  onCategoryChange: (category: HostCategory) => void;
};

const HostListControls = ({
  search,
  onSearchChange,
  onSearchSubmit,
  sort,
  onSortChange,
  category,
  onCategoryChange,
}: Props) => {
  // 정렬은 세 가지라 순환 토글로는 원하는 값을 한 번에 고를 수 없어 드롭다운으로 연다.
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useOnClickOutside({
    ref: sortRef,
    handler: () => setSortOpen(false),
    mouseEvent: 'click',
  });

  // 열리면 현재 선택된 항목으로 포커스를 옮겨 키보드만으로도 바로 고를 수 있게 한다.
  useEffect(() => {
    if (!sortOpen) return;
    const idx = SORT_ORDER.indexOf(sort);
    optionRefs.current[idx === -1 ? 0 : idx]?.focus();
  }, [sortOpen, sort]);

  const closeSort = (focusTrigger = true) => {
    setSortOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const selectSort = (next: HostSort) => {
    ga.event({
      action: 'host_sort_change',
      event_category: 'web_host',
      event_label: next,
    });
    onSortChange(next);
    closeSort();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSortOpen(true);
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const last = SORT_ORDER.length - 1;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSort();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      optionRefs.current[idx === last ? 0 : idx + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      optionRefs.current[idx === 0 ? last : idx - 1]?.focus();
    } else if (e.key === 'Tab') {
      // 메뉴 밖으로 포커스가 나가면 열어둘 이유가 없다
      setSortOpen(false);
    }
  };

  const handleCategory = (c: HostCategory) => {
    ga.event({
      action: 'host_category_click',
      event_category: 'web_host',
      event_label: c,
    });
    onCategoryChange(c);
  };

  return (
    <>
      <div className={cn('controls')}>
        <form
          className={cn('search')}
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            ga.event({
              action: 'host_search_submit',
              event_category: 'web_host',
              event_label: search,
            });
            onSearchSubmit?.(search);
          }}
        >
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
        </form>

        <div className={cn('sort')} ref={sortRef}>
          <button
            ref={triggerRef}
            type="button"
            className={cn('sort__btn')}
            onClick={() => setSortOpen((open) => !open)}
            onKeyDown={handleTriggerKeyDown}
            aria-label={`정렬 기준: ${SORT_LABEL[sort]}. 변경하려면 누르세요`}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            {SORT_LABEL[sort]}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {sortOpen && (
            <div className={cn('sort__menu')} role="listbox" aria-label="정렬 기준">
              {SORT_ORDER.map((option, idx) => (
                <button
                  key={option}
                  ref={(el) => {
                    optionRefs.current[idx] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={option === sort}
                  className={cn(
                    'sort__option',
                    option === sort && 'sort__option--active'
                  )}
                  onClick={() => selectSort(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                >
                  {SORT_LABEL[option]}
                  {option === sort && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={cn('cats')}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(c === category ? 'cat__active' : 'cat')}
            onClick={() => handleCategory(c)}
          >
            {CATEGORY_LABEL(c)}
          </button>
        ))}
      </div>
    </>
  );
};

export default HostListControls;
