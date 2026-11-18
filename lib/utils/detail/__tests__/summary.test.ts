import {
  describeHow,
  describeWhen,
  organizerInitial,
} from 'lib/utils/detail/summary';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일. 목업의 고정 시각과 같다

const tags = (...names: string[]) =>
  names.map((tag_name, id) => ({
    id,
    tag_name,
    tag_color: '',
    category: null,
  }));

const ev = (over: Partial<Event> = {}): Event => ({
  id: '3489',
  title: '행사',
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '월',
  start_date_time: '2026-10-19T18:00',
  end_day_week: '수',
  end_date_time: '2026-11-19T18:00',
  tags: [],
  create_date_time: '2026-10-19T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const date = (over: Partial<Event>): Event =>
  ev({ event_time_type: 'DATE', ...over });

describe('describeWhen — 접수형은 마감일을 달력에 올린다', () => {
  it('목업 #detail/3489', () => {
    expect(describeWhen(ev(), NOW)).toEqual({
      month: '11월',
      day: '19',
      headline: '11월 19일 목요일 18:00 접수 마감',
      range: '접수 기간 10.19(월) 18:00 ~ 11.19(목) 18:00',
    });
  });

  it('끝난 뒤에도 같은 문장이다 (목업 #detail/3470)', () => {
    expect(
      describeWhen(
        ev({
          start_date_time: '2026-10-17T17:00',
          end_date_time: '2026-11-01T15:00',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '1',
      headline: '11월 1일 일요일 15:00 접수 마감',
      range: '접수 기간 10.17(토) 17:00 ~ 11.1(일) 15:00',
    });
  });

  it('마감에 시각이 없으면 시각을 적지 않는다', () => {
    expect(
      describeWhen(
        ev({
          start_date_time: '2026-11-07T00:00',
          end_date_time: '2026-11-20T23:59',
          use_start_date_time_yn: 'N',
          use_end_date_time_yn: 'N',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '20',
      headline: '11월 20일 금요일 접수 마감',
      range: '접수 기간 11.7(토) ~ 11.20(금)',
    });
  });
});

describe('describeWhen — 일시형은 시작일을 달력에 올린다', () => {
  it('하루짜리 예정 행사', () => {
    expect(
      describeWhen(
        date({
          start_date_time: '2026-11-19T19:00',
          end_date_time: '2026-11-19T20:30',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '19',
      headline: '11월 19일 목요일 19:00 ~ 20:30',
      range: '11.19(목) 19:00 ~ 20:30',
    });
  });

  it('여러 날 예정 행사는 시작 시각만 문장에 적는다', () => {
    expect(
      describeWhen(
        date({
          start_date_time: '2026-11-20T10:00',
          end_date_time: '2026-11-22T18:00',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '20',
      headline: '11월 20일 금요일 10:00',
      range: '11.20(금) 10:00 ~ 11.22(일) 18:00',
    });
  });

  it('진행 중이면 문장에 시각이 없고 기간 줄에만 있다 (목업 #detail/3523)', () => {
    expect(
      describeWhen(
        date({
          start_date_time: '2026-11-09T14:00',
          end_date_time: '2026-11-13T15:00',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '9',
      headline: '11월 9일 월요일',
      range: '11.9(월) 14:00 ~ 11.13(금) 15:00',
    });
  });

  it("시각을 쓰지 않는 행사('N')는 날짜만", () => {
    expect(
      describeWhen(
        date({
          start_date_time: '2026-11-25T00:00',
          end_date_time: '2026-11-25T23:59',
          use_start_date_time_yn: 'N',
          use_end_date_time_yn: 'N',
        }),
        NOW
      )
    ).toEqual({
      month: '11월',
      day: '25',
      headline: '11월 25일 수요일',
      range: '11.25(수)',
    });
  });

  it('해를 넘기는 달도 그 달 이름으로', () => {
    const r = describeWhen(
      date({
        start_date_time: '2027-01-05T10:00',
        end_date_time: '2027-01-05T12:00',
      }),
      NOW
    );
    expect(r?.month).toBe('1월');
    expect(r?.day).toBe('5');
    expect(r?.headline).toBe('1월 5일 화요일 10:00 ~ 12:00');
  });

  it('날짜를 읽을 수 없으면 null', () => {
    expect(
      describeWhen(date({ start_date_time: '', end_date_time: '' }), NOW)
    ).toBeNull();
  });
});

describe('describeHow — 참여 방법', () => {
  it('오프라인이 있으면 장소 안내', () => {
    expect(describeHow(tags('오프라인', '유료', '세미나'))).toEqual({
      icon: 'pin',
      headline: '오프라인 진행',
      note: '장소는 아래 행사 소개에서 확인해 주세요',
    });
  });

  it('온라인만 있으면 접속 안내', () => {
    expect(describeHow(tags('온라인', '무료'))).toEqual({
      icon: 'globe',
      headline: '온라인 진행',
      note: '접속 방법은 신청 후 안내돼요',
    });
  });

  it('둘 다 있으면 태그에 나온 순서대로 잇는다', () => {
    expect(describeHow(tags('온라인', '오프라인', '무료'))).toEqual({
      icon: 'pin',
      headline: '온라인 · 오프라인 진행',
      note: '장소는 아래 행사 소개에서 확인해 주세요',
    });
  });

  it('참여 방법 태그가 없으면 null (블록을 그리지 않는다)', () => {
    expect(describeHow(tags('무료', 'AI'))).toBeNull();
    expect(describeHow([])).toBeNull();
  });

  it('tags가 null·undefined여도 예외 없이 null', () => {
    expect(describeHow(null)).toBeNull();
    expect(describeHow(undefined)).toBeNull();
  });
});

describe('organizerInitial', () => {
  it('앞의 괄호와 공백을 건너뛴 첫 글자', () => {
    expect(organizerInitial('AWS한국사용자모임')).toBe('A');
    expect(organizerInitial('[한빛미디어] 세미나')).toBe('한');
    expect(organizerInitial('(주)우리테크')).toBe('주');
    expect(organizerInitial('  GDG Busan')).toBe('G');
  });

  it('비어 있으면 물음표', () => {
    expect(organizerInitial('')).toBe('?');
    expect(organizerInitial('[ (')).toBe('?');
  });
});
