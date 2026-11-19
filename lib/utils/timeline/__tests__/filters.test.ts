import {
  applyFilters,
  EMPTY_FILTERS,
  readFilters,
} from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const event = (id: string, title: string, tagNames: string[]): Event => ({
  id,
  title,
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '수',
  start_date_time: '2026-11-19T19:00',
  end_day_week: '수',
  end_date_time: '2026-11-19T21:00',
  tags: tagNames.map((tag_name, index) => ({
    id: index + 1,
    tag_name,
    tag_color: '#0043FF',
    category: null,
  })),
  create_date_time: '2026-11-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
});

const enc = encodeURIComponent;

describe('readFilters', () => {
  it('행사 일정 화면은 주소에 무엇이 있든 거르지 않는다', () => {
    expect(readFilters('/events')).toEqual(EMPTY_FILTERS);
    expect(readFilters('/events?tag=AI&kwd=x')).toEqual(EMPTY_FILTERS);
    expect(readFilters('/events?year=2026&month=10')).toEqual(EMPTY_FILTERS);
  });

  it('검색 화면의 주소에서 필터를 읽는다', () => {
    const path =
      `/search?tag=AI&tag=${enc('클라우드')}&type=${enc('대회')}` +
      `&location=${enc('온라인')}&coast=${enc('무료')}&kwd=${enc(
        '카카오 테크'
      )}`;
    expect(readFilters(path)).toEqual({
      tags: ['AI', '클라우드'],
      type: '대회',
      location: '온라인',
      coast: '무료',
      kwd: '카카오 테크',
    });
  });

  it('인코딩하지 않은 한글 주소도 읽는다', () => {
    expect(readFilters('/search?tag=클라우드&coast=유료')).toEqual({
      tags: ['클라우드'],
      coast: '유료',
    });
  });

  it('목록에 없는 값과 빈 검색어는 받지 않는다', () => {
    const path = `/search?type=${enc('없는유형')}&location=${enc(
      '전체'
    )}&coast=${enc('공짜')}&kwd=`;
    expect(readFilters(path)).toEqual(EMPTY_FILTERS);
  });

  it('잘못된 % 인코딩이 와도 깨지지 않는다', () => {
    expect(readFilters('/search?kwd=50%').kwd).toBe('50%');
  });
});

describe('applyFilters', () => {
  const events = [
    event('1', 'Kubernetes 밋업', ['온라인', '무료', '모임', '클라우드']),
    event('2', 'AI 해커톤', ['오프라인', '유료', '대회', 'AI']),
    event('3', '보안 컨퍼런스', ['오프라인', '무료', '세미나', '보안']),
  ];
  const ids = (list: Event[]) => list.map((e) => e.id);

  it('필터가 없으면 전부', () => {
    expect(ids(applyFilters(events, EMPTY_FILTERS))).toEqual(['1', '2', '3']);
  });

  it('직군 태그는 고른 것 가운데 하나라도 붙어 있으면 통과', () => {
    expect(ids(applyFilters(events, { tags: ['AI', '보안'] }))).toEqual([
      '2',
      '3',
    ]);
  });

  it('직군·참여 방법·비용은 서로 "또는"이다 (지금 동작)', () => {
    expect(
      ids(applyFilters(events, { tags: ['AI'], location: '온라인' }))
    ).toEqual(['1', '2']);
    expect(ids(applyFilters(events, { tags: [], coast: '유료' }))).toEqual([
      '2',
    ]);
  });

  it('검색어는 "그리고"로 붙고, 대소문자와 띄어쓰기를 가리지 않는다', () => {
    expect(ids(applyFilters(events, { tags: [], kwd: 'kubernetes' }))).toEqual([
      '1',
    ]);
    expect(
      ids(applyFilters(events, { tags: [], kwd: '보안컨퍼런스' }))
    ).toEqual(['3']);
    expect(
      ids(applyFilters(events, { tags: ['AI'], kwd: 'kubernetes' }))
    ).toEqual([]);
  });
});
