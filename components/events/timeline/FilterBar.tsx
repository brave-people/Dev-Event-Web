import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import { EventContext } from 'context/event';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { eventType } from 'components/features/filters/eventType';
import { jobGroups } from 'components/features/filters/jobGroup';
import * as ga from 'lib/utils/gTag';
import { isEnterKey } from 'lib/utils/searchUtil';
import { TimelineFilters } from 'lib/utils/timeline/filters';
import { initUrl, parseUrl } from 'lib/utils/UrlUtil';
import style from './FilterBar.module.scss';

const cn = classNames.bind(style);

const LOCATION_CHIPS = ['온라인', '오프라인'];
const COAST_CHIPS = ['무료', '유료'];
const TYPE_OPTIONS = eventType.filter((type) => type !== '전체');

interface FilterBarProps {
  filters: TimelineFilters;
  searchOpen: boolean;
  newCount: number;
  pastCount: number;
  hidePastChip?: boolean;
  asPath?: string;
  onNavigate?: (url: string) => void;
  variant?: 'timeline' | 'calendar';
}

function FilterBar({
  filters,
  searchOpen,
  newCount,
  pastCount,
  hidePastChip,
  asPath,
  onNavigate,
  variant = 'timeline',
}: FilterBarProps) {
  const router = useRouter();
  const path = asPath ?? router.asPath;
  const {
    newOnly,
    handleNewOnly,
    showPast,
    handleShowPast,
    replaceJobGroupList,
    handleEventType,
    handleLocation,
    handleCoast,
    handleSearch,
  } = useContext(EventContext);
  const [input, setInput] = useState<string>(filters.kwd ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { tags, type, location, coast, kwd } = filters;
  const showNewChip = newCount > 0 || newOnly;
  const showPastChip = pastCount > 0 && !hidePastChip;

  // 주소의 필터를 context에 맞춘다 (결과 없음 화면의 추천 태그가 context를 읽는다)
  useEffect(() => {
    replaceJobGroupList(tags);
    handleEventType(type);
    handleLocation(location);
    handleCoast(coast);
    handleSearch(kwd);
  }, [path]);

  useEffect(() => {
    setInput(kwd ?? '');
  }, [kwd]);

  // 마운트 때는 포커스를 주지 않는다 (검색 아이콘으로 열었을 때만)
  const firstSearchOpenRef = useRef(true);
  useEffect(() => {
    if (firstSearchOpenRef.current) {
      firstSearchOpenRef.current = false;
      return;
    }
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const go = (url: string) => {
    if (onNavigate) {
      onNavigate(url);
      return;
    }
    router.push(url, undefined, { scroll: false });
  };

  const pickTag = (name: string) => {
    go(parseUrl(path, 'tag', name, tags));
  };

  const pickAll = () => {
    if (tags.length === 0) return;
    go(initUrl(path, 'tag', tags, type, location, coast));
  };

  const pickLocation = (value: string) => {
    ga.event({
      action: 'web_event_참여방법',
      event_category: 'web_event',
      event_label: '검색',
    });
    go(
      location === value
        ? initUrl(path, 'location', tags, type, location, coast)
        : parseUrl(path, 'location', value, tags)
    );
  };

  const pickCoast = (value: string) => {
    ga.event({
      action: 'web_event_비용',
      event_category: 'web_event',
      event_label: '검색',
    });
    go(
      coast === value
        ? initUrl(path, 'coast', tags, type, location, coast)
        : parseUrl(path, 'coast', value, tags)
    );
  };

  // 키보드로 옮기는 중인 행사 유형. 방향키마다 주소가 바뀌지 않게 Enter나 다른 곳으로 옮겨 갈 때 적용한다
  const [typeDraft, setTypeDraft] = useState<string | null>(null);
  const typeByKeyRef = useRef(false);
  useEffect(() => setTypeDraft(null), [type]);

  const applyType = (value: string) => {
    setTypeDraft(null);
    if (value !== (type ?? '전체')) pickType(value);
  };

  const pickType = (value: string) => {
    ga.event({
      action: 'web_event_행사유형',
      event_category: 'web_event',
      event_label: '검색',
    });
    go(
      value === '전체'
        ? initUrl(path, 'type', tags, type, location, coast)
        : parseUrl(path, 'type', value, tags)
    );
  };

  const submit = () => {
    const keyword = input.trim();
    if (keyword) {
      ga.event({
        action: 'web_event_키워드검색엔터클릭',
        event_category: 'web_event',
        event_label: '검색',
      });
      go(parseUrl(path, 'kwd', keyword, tags));
    } else if (kwd) {
      go(initUrl(path, 'kwd', tags, type, location, coast));
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isEnterKey(event)) return;
    event.preventDefault();
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    submit();
  };

  const clearInput = () => {
    setInput('');
    inputRef.current?.focus();
    if (kwd) {
      go(initUrl(path, 'kwd', tags, type, location, coast));
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className={cn('bar', { calendar: variant === 'calendar' })}>
      <form
        className={cn('search', { open: searchOpen })}
        role="search"
        onSubmit={onSubmit}
      >
        <label className={cn('field')}>
          <TimelineIcon name="search" size={18} />
          <input
            ref={inputRef}
            type="search"
            placeholder="행사명, 주최로 검색"
            aria-label="행사 검색"
            autoComplete="off"
            enterKeyHint="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
          />
          {input && (
            <button
              type="button"
              className={cn('clear')}
              aria-label="검색어 지우기"
              onClick={clearInput}
            >
              <TimelineIcon name="x" size={16} />
            </button>
          )}
        </label>
      </form>
      <div className={cn('chips')}>
        {jobGroups.map((group) => {
          const isAll = group.tag_id === 0;
          const on = isAll ? tags.length === 0 : tags.includes(group.tag_name);
          return (
            <button
              key={group.tag_id}
              type="button"
              className={cn('chip', { on })}
              aria-pressed={on}
              onClick={() => (isAll ? pickAll() : pickTag(group.tag_name))}
            >
              {group.tag_name}
            </button>
          );
        })}
        <i className={cn('sep')} aria-hidden="true" />
        {LOCATION_CHIPS.map((value) => (
          <button
            key={value}
            type="button"
            className={cn('chip', { on: location === value })}
            aria-pressed={location === value}
            onClick={() => pickLocation(value)}
          >
            {value}
          </button>
        ))}
        {COAST_CHIPS.map((value) => (
          <button
            key={value}
            type="button"
            className={cn('chip', { on: coast === value })}
            aria-pressed={coast === value}
            onClick={() => pickCoast(value)}
          >
            {value}
          </button>
        ))}
        <span className={cn('select', { on: !!type })}>
          <select
            aria-label="행사 유형"
            value={typeDraft ?? type ?? '전체'}
            onPointerDown={() => {
              typeByKeyRef.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && typeDraft !== null) {
                event.preventDefault();
                applyType(typeDraft);
                return;
              }
              typeByKeyRef.current = true;
            }}
            onChange={(event) => {
              // 마우스·터치로 고르면 바로, 키보드로 옮기면 값만 바꿔 둔다
              if (typeByKeyRef.current) setTypeDraft(event.target.value);
              else pickType(event.target.value);
            }}
            onBlur={() => {
              if (typeDraft !== null) applyType(typeDraft);
            }}
          >
            <option value="전체">행사 유형</option>
            {TYPE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <TimelineIcon name="chevron" size={14} className={cn('arrow')} />
        </span>
        {(showNewChip || showPastChip) && (
          <i className={cn('sep')} aria-hidden="true" />
        )}
        {showNewChip && (
          <button
            type="button"
            className={cn('chip', { on: newOnly })}
            aria-pressed={newOnly}
            onClick={() => handleNewOnly(!newOnly)}
          >
            <span className={cn('dot')} aria-hidden="true" />
            {`새로 올라온 행사 ${newCount}`}
          </button>
        )}
        {showPastChip && (
          <button
            type="button"
            className={cn('chip', 'past', { on: showPast })}
            aria-pressed={showPast}
            onClick={() => handleShowPast(!showPast)}
          >
            {showPast ? '지난 행사 숨기기' : `지난 행사 ${pastCount}건 보기`}
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
