import { getRandomTag, getRecommendableTags } from 'lib/utils/tagUtil';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';

// 운영 태그 API의 실제 id
const TAG_IDS: Record<string, number> = {
  오프라인: 5,
  대회: 7,
  온라인: 11,
  유료: 15,
  해커톤: 29,
  AI: 40,
  클라우드: 43,
  무료: 46,
  보안: 49,
  세미나: 64,
};

const tag = (tag_name: string): TagResponse => ({
  id: TAG_IDS[tag_name],
  tag_name,
  tag_color: '#0043FF',
  category: null,
});

const event = (
  tagNames: string[],
  endDateTime = '2999-12-31T23:59'
): Event => ({
  id: tagNames.join('-'),
  title: '행사',
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '수',
  start_date_time: '2026-10-01T10:00',
  end_day_week: '수',
  end_date_time: endDateTime,
  tags: tagNames.map(tag),
  create_date_time: '2026-09-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
});

const names = (tags: TagResponse[]) => tags.map((t) => t.tag_name).sort();

describe('getRecommendableTags', () => {
  it('종료된 행사에만 붙은 태그는 추천하지 않는다', () => {
    const events = [event(['세미나']), event(['해커톤'], '2000-01-01T00:00')];
    expect(
      names(
        getRecommendableTags(events, undefined, undefined, undefined, undefined)
      )
    ).toEqual(['세미나']);
  });

  it('여러 행사에 붙은 같은 태그는 한 번만 추천한다', () => {
    const events = [event(['AI', '무료']), event(['AI', '세미나'])];
    expect(
      names(
        getRecommendableTags(events, undefined, undefined, undefined, undefined)
      )
    ).toEqual(['AI', '무료', '세미나'].sort());
  });

  it('고른 필터를 통과한 행사의 태그만 추천한다', () => {
    const events = [
      event(['유료', '세미나', '오프라인']),
      event(['무료', '대회', '온라인']),
    ];
    expect(
      names(
        getRecommendableTags(events, undefined, undefined, undefined, '유료')
      )
    ).toEqual(['세미나', '오프라인'].sort());
  });

  it('이미 고른 필터와 같은 태그는 추천하지 않는다', () => {
    const events = [event(['온라인', '무료'])];
    expect(
      names(
        getRecommendableTags(events, undefined, undefined, '온라인', undefined)
      )
    ).toEqual(['무료']);
  });

  it('직군 필터를 통과한 행사의 태그만 추천한다', () => {
    const events = [event(['AI', '세미나']), event(['클라우드', '대회'])];
    expect(
      names(getRecommendableTags(events, 'AI', undefined, undefined, undefined))
    ).toEqual(['세미나']);
  });

  it('필터를 통과한 행사가 없으면 추천할 태그도 없다', () => {
    const events = [event(['AI', '세미나'])];
    expect(
      getRecommendableTags(events, '보안', undefined, undefined, undefined)
    ).toEqual([]);
  });
});

describe('getRandomTag', () => {
  const pool = () => ['AI', '세미나', '무료', '대회', '클라우드'].map(tag);

  it('후보가 3개보다 많으면 서로 다른 3개를 후보 안에서 고른다', () => {
    const candidates = pool();
    for (let i = 0; i < 20; i++) {
      const picked = getRandomTag(candidates);
      expect(picked).toHaveLength(3);
      expect(new Set(picked.map((t) => t.tag_name)).size).toBe(3);
      picked.forEach((t) => expect(candidates).toContain(t));
    }
  });

  it('후보 목록의 순서를 바꾸지 않는다', () => {
    const candidates = pool();
    getRandomTag(candidates);
    expect(candidates.map((t) => t.tag_name)).toEqual([
      'AI',
      '세미나',
      '무료',
      '대회',
      '클라우드',
    ]);
  });

  it('후보가 3개보다 적으면 있는 만큼만 고른다', () => {
    expect(names(getRandomTag(['AI', '세미나'].map(tag)))).toEqual(
      ['AI', '세미나'].sort()
    );
  });

  it('후보가 없으면 빈 목록을 돌려준다', () => {
    expect(getRandomTag([])).toEqual([]);
  });
});
