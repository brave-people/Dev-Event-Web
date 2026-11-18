import { Event } from 'model/event';
import { eventType } from 'components/features/filters/eventType';
import { checkCondition } from 'lib/utils/eventUtil';
import { checkSearch } from 'lib/utils/searchUtil';
import { reflactUrlContext, safeDecode } from 'lib/utils/UrlUtil';

export interface TimelineFilters {
  tags: string[]; // 직군 태그 (여러 개)
  type?: string; // 행사 유형
  location?: string; // '온라인' | '오프라인'
  coast?: string; // '유료' | '무료'
  kwd?: string; // 검색어 (디코딩한 값)
}

export const EMPTY_FILTERS: TimelineFilters = { tags: [] };

const LOCATIONS = ['온라인', '오프라인'];
const COASTS = ['유료', '무료'];

const decode = (value: string | undefined): string | undefined =>
  typeof value === 'string' ? safeDecode(value) : undefined;

// 검색 화면(/search)의 주소에서만 필터를 읽는다. 행사 일정(/events)은 거르지 않는다.
export const readFilters = (asPath: string): TimelineFilters => {
  if (asPath.split('?')[0] !== '/search') return { tags: [] };

  const ctx = reflactUrlContext(asPath);
  const filters: TimelineFilters = { tags: [] };

  ctx.tagList.forEach((raw) => {
    const tag = decode(raw);
    if (tag) filters.tags.push(tag);
  });

  const type = decode(ctx.type);
  if (type && type !== '전체' && eventType.includes(type)) filters.type = type;

  const location = decode(ctx.location);
  if (location && LOCATIONS.includes(location)) filters.location = location;

  const coast = decode(ctx.coast);
  if (coast && COASTS.includes(coast)) filters.coast = coast;

  const kwd = decode(ctx.kwd);
  if (kwd) filters.kwd = kwd;

  return filters;
};

export const applyFilters = (
  events: Event[],
  filters: TimelineFilters
): Event[] => {
  const jobGroups =
    filters.tags.length > 0 ? filters.tags.join(', ') : undefined;
  return events.filter((event) => {
    if (
      !checkCondition(
        jobGroups,
        filters.type,
        filters.location,
        filters.coast,
        event
      )
    ) {
      return false;
    }
    if (filters.kwd) return checkSearch(filters.kwd, '', event);
    return true;
  });
};
