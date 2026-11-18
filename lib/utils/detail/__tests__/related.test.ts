import {
  aliveRelated,
  pickRelated,
  relatedMeta,
  slimEvent,
} from 'lib/utils/detail/related';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일. 목업의 고정 시각과 같다

const tags = (...names: string[]) =>
  names.map((tag_name, id) => ({
    id,
    tag_name,
    tag_color: '',
    category: null,
  }));

// 접수형, 11.19(목) 18:00 마감
const ev = (id: string, over: Partial<Event> = {}): Event => ({
  id,
  title: `행사 ${id}`,
  description: '아주 긴 본문',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '월',
  start_date_time: '2026-10-19T18:00',
  end_day_week: '수',
  end_date_time: '2026-11-19T18:00',
  tags: tags('오프라인', '무료', '세미나', 'AI'),
  create_date_time: '2026-10-19T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const ids = (events: Event[] | undefined) => (events || []).map((e) => e.id);

describe('pickRelated — 같은 날 다른 행사', () => {
  it('타임라인에서 같은 날에 놓이는 행사를 응답 순서대로 고른다', () => {
    const current = ev('1');
    const r = pickRelated(
      current,
      [
        ev('2', { end_date_time: '2026-11-20T18:00' }), // 다른 날 마감
        current, // 자기 자신
        ev('3'), // 같은 날 마감
        ev('4', {
          event_time_type: 'DATE', // 같은 날 시작
          start_date_time: '2026-11-19T19:00',
          end_date_time: '2026-11-19T21:00',
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('같은 날 다른 행사');
    expect(ids(r?.events)).toEqual(['3', '4']);
  });

  it('네 건까지만', () => {
    const r = pickRelated(
      ev('1'),
      ['2', '3', '4', '5', '6', '7'].map((id) => ev(id)),
      NOW
    );
    expect(ids(r?.events)).toEqual(['2', '3', '4', '5']);
  });

  it('진행 중인 행사는 오늘에 놓이므로 오늘 마감하는 행사가 같은 날이다 (목업 #detail/3523)', () => {
    const current = ev('3523', {
      event_time_type: 'DATE',
      start_date_time: '2026-11-09T14:00',
      end_date_time: '2026-11-13T15:00',
    });
    const r = pickRelated(
      current,
      [ev('3508', { end_date_time: '2026-11-13T17:00' }), ev('3489')],
      NOW
    );
    expect(r?.title).toBe('같은 날 다른 행사');
    expect(ids(r?.events)).toEqual(['3508']);
  });

  it('id가 숫자로 와도 자기 자신을 뺀다', () => {
    const current = ev('7');
    const same = ev('8');
    const numeric = { ...current, id: 7 as unknown as string };
    expect(ids(pickRelated(current, [numeric, same], NOW)?.events)).toEqual([
      '8',
    ]);
  });

  it('넘기는 행사는 본문을 비운다', () => {
    const r = pickRelated(ev('1'), [ev('2')], NOW);
    expect(r?.events[0].description).toBe('');
    expect(r?.events[0].title).toBe('행사 2');
    expect(r?.events[0].tags).toHaveLength(4);
  });
});

describe('pickRelated — 같은 날이 없으면 비슷한 행사', () => {
  it('분야 태그가 하나라도 겹치는 예정 행사', () => {
    const r = pickRelated(
      ev('1', { tags: tags('오프라인', '유료', '세미나', '클라우드', 'AI') }),
      [
        ev('2', {
          end_date_time: '2026-11-20T18:00',
          tags: tags('온라인', '무료', '보안'),
        }),
        ev('3', {
          end_date_time: '2026-11-21T18:00',
          tags: tags('온라인', '무료', 'AI'),
        }),
        ev('4', {
          end_date_time: '2026-11-22T18:00',
          tags: tags('오프라인', '유료', '클라우드'),
        }),
        ev('5', {
          end_date_time: '2026-11-23T18:00',
          tags: tags('오프라인', '유료', '세미나'),
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('비슷한 행사');
    expect(ids(r?.events)).toEqual(['3', '4']);
  });

  it('유형·참여 방법·비용 태그만 겹치면 비슷한 행사가 아니다', () => {
    expect(
      pickRelated(
        ev('1', { tags: tags('오프라인', '무료', '세미나') }),
        [
          ev('2', {
            end_date_time: '2026-11-20T18:00',
            tags: tags('오프라인', '무료', '세미나'),
          }),
        ],
        NOW
      )
    ).toBeNull();
  });

  it('끝난 행사의 상세에서도 비슷한 예정 행사를 보여 준다 (목업 #detail/3470)', () => {
    const r = pickRelated(
      ev('3470', {
        start_date_time: '2026-10-17T17:00',
        end_date_time: '2026-11-01T15:00',
        tags: tags('오프라인', '유료', '모임', '블록체인'),
      }),
      [
        ev('3474', {
          end_date_time: '2026-11-13T17:00',
          tags: tags('오프라인', '무료', '대회', '블록체인'),
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('비슷한 행사');
    expect(ids(r?.events)).toEqual(['3474']);
  });

  it('끝난 행사는 고르지 않는다', () => {
    expect(
      pickRelated(
        ev('1'),
        [ev('2', { end_date_time: '2026-11-12T18:00' })],
        NOW
      )
    ).toBeNull();
  });

  it('후보가 없으면 null', () => {
    expect(pickRelated(ev('1'), [], NOW)).toBeNull();
  });
});

describe('slimEvent · aliveRelated · relatedMeta', () => {
  it('slimEvent는 본문만 비우고 원본은 그대로 둔다', () => {
    const original = ev('1');
    const slim = slimEvent(original);
    expect(slim.description).toBe('');
    expect(slim.organizer).toBe('주최');
    expect(original.description).toBe('아주 긴 본문');
  });

  it('aliveRelated는 그 사이에 끝난 행사를 뺀다 (오래된 캐시)', () => {
    const list = [ev('2', { end_date_time: '2026-11-13T17:00' }), ev('3')];
    expect(ids(aliveRelated(list, NOW))).toEqual(['2', '3']);
    expect(ids(aliveRelated(list, '2026-11-13T17:01'))).toEqual(['3']);
    expect(ids(aliveRelated(list, '2026-11-20T00:00'))).toEqual([]);
  });

  it('relatedMeta는 "주최 · 남은 날 · 비용" (목업 #detail/3489의 첫 줄)', () => {
    expect(
      relatedMeta(ev('3525', { organizer: 'GDG Busan · Elice Lab' }), NOW)
    ).toBe('GDG Busan · Elice Lab · 마감 D-6 · 무료');
    expect(
      relatedMeta(
        ev('3508', {
          organizer: 'C++ Korea',
          end_date_time: '2026-11-13T17:00',
        }),
        NOW
      )
    ).toBe('C++ Korea · 오늘 마감 · 무료');
  });

  it('비용 태그나 주최가 없으면 그 자리를 건너뛴다', () => {
    expect(relatedMeta(ev('2', { tags: tags('오프라인', 'AI') }), NOW)).toBe(
      '주최 · 마감 D-6'
    );
    expect(relatedMeta(ev('2', { organizer: '' }), NOW)).toBe(
      '마감 D-6 · 무료'
    );
  });
});

describe('pickRelated — 데이터가 비어 있을 때', () => {
  it('tags가 null인 후보가 섞여 있어도 예외 없이 고른다', () => {
    const current = ev('1', { end_date_time: '2026-11-25T18:00' });
    const broken = ev('2', {
      end_date_time: '2026-11-26T18:00',
      tags: null as unknown as Event['tags'],
    });
    const good = ev('3', { end_date_time: '2026-11-27T18:00' });
    const r = pickRelated(current, [broken, good], NOW);
    expect(r?.title).toBe('비슷한 행사');
    expect(ids(r?.events)).toEqual(['3']);
  });

  it('현재 행사의 날짜를 읽을 수 없으면 같은 날 묶음을 만들지 않는다', () => {
    const current = ev('1', {
      start_date_time: '',
      end_date_time: '',
    });
    const r = pickRelated(
      current,
      [ev('2', { end_date_time: '2026-11-19T18:00' })],
      NOW
    );
    expect(r?.title).not.toBe('같은 날 다른 행사');
  });
});
