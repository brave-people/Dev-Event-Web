import {
  costOf,
  ddayLabel,
  describeApply,
  formatRemain,
} from 'lib/utils/detail/applyCard';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일. 목업의 고정 시각과 같다

const tags = (...names: string[]) =>
  names.map((tag_name, id) => ({
    id,
    tag_name,
    tag_color: '',
    category: null,
  }));

// 목업 #detail/3489 (AWS Community Day)
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
  tags: tags('오프라인', '유료', '세미나', '클라우드', 'AI'),
  create_date_time: '2026-10-19T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const date = (over: Partial<Event>): Event =>
  ev({
    event_time_type: 'DATE',
    tags: tags('온라인', '무료', '세미나'),
    ...over,
  });

const MIN = 60000;
const HOUR = 60 * MIN;

describe('formatRemain', () => {
  it('하루 이상 남으면 "N일 N시간"', () => {
    expect(formatRemain(6 * 24 * HOUR + 8 * HOUR)).toBe('6일 8시간');
    expect(formatRemain(24 * HOUR + 59 * MIN)).toBe('1일');
    expect(formatRemain(48 * HOUR)).toBe('2일');
  });

  it('하루가 안 남으면 "N시간 N분"', () => {
    expect(formatRemain(23 * HOUR + 59 * MIN)).toBe('23시간 59분');
    expect(formatRemain(7 * HOUR + 30 * MIN)).toBe('7시간 30분');
    expect(formatRemain(7 * HOUR)).toBe('7시간');
  });

  it('한 시간이 안 남으면 "N분", 1분보다 적으면 "1분"', () => {
    expect(formatRemain(59 * MIN + 59000)).toBe('59분');
    expect(formatRemain(MIN)).toBe('1분');
    expect(formatRemain(30000)).toBe('1분');
    expect(formatRemain(0)).toBe('1분');
  });
});

describe('costOf', () => {
  it('무료·유료 태그 가운데 먼저 나온 것', () => {
    expect(costOf(tags('오프라인', '유료', '세미나'))).toBe('유료');
    expect(costOf(tags('무료', '유료'))).toBe('무료');
    expect(costOf(tags('온라인', 'AI'))).toBe('');
    expect(costOf([])).toBe('');
  });

  it('tags가 null·undefined여도 예외 없이 빈 문자열', () => {
    expect(costOf(null)).toBe('');
    expect(costOf(undefined)).toBe('');
  });
});

describe('describeApply — 접수형', () => {
  it('접수 중: 상태, 남은 시간, 진행 막대 (목업 #detail/3489)', () => {
    expect(describeApply(ev(), NOW)).toEqual({
      phase: 'recruiting',
      state: '접수 중 · 유료',
      status: '마감까지 6일 8시간',
      tone: 'orange',
      progress: {
        percent: 80,
        startLabel: '10.19(월) 접수 시작',
        endLabel: '11.19(목) 18:00 마감',
      },
      canApply: true,
    });
  });

  it('마감이 24시간 안이면 시간과 분으로 적는다', () => {
    const r = describeApply(ev({ end_date_time: '2026-11-13T17:30' }), NOW);
    expect(r.phase).toBe('recruiting');
    expect(r.status).toBe('마감까지 7시간 30분');
    expect(r.tone).toBe('orange');
  });

  it('마감하는 바로 그 분에는 "1분"으로 적고 아직 신청할 수 있다', () => {
    const r = describeApply(ev({ end_date_time: '2026-11-13T10:00' }), NOW);
    expect(r.phase).toBe('recruiting');
    expect(r.status).toBe('마감까지 1분');
    expect(r.canApply).toBe(true);
    expect(r.progress?.percent).toBe(100);
  });

  it('기간의 끝이 시작보다 앞서 있으면 진행 막대는 0이다', () => {
    const r = describeApply(
      ev({
        start_date_time: '2026-11-15T18:00',
        end_date_time: '2026-11-14T18:00',
      }),
      NOW
    );
    expect(r.progress?.percent).toBe(0);
  });

  it('마감에 시각이 없으면 날짜로만 센다', () => {
    const e = ev({
      end_date_time: '2026-11-20T23:59',
      use_end_date_time_yn: 'N',
    });
    const r = describeApply(e, NOW);
    expect(r.status).toBe('마감까지 7일');
    expect(r.progress?.endLabel).toBe('11.20(금) 마감');
    expect(describeApply(e, '2026-11-20T09:00').status).toBe('오늘 마감');
    expect(describeApply(e, '2026-11-20T23:59').phase).toBe('recruiting');
    expect(describeApply(e, '2026-11-21T00:00').phase).toBe('ended');
  });

  it('접수가 아직 시작되지 않았으면 "접수 전"이고 막대는 0%', () => {
    const r = describeApply(
      ev({
        start_date_time: '2026-11-16T09:00',
        end_date_time: '2026-11-30T18:00',
        tags: tags('온라인', '무료'),
      }),
      NOW
    );
    expect(r.phase).toBe('before');
    expect(r.state).toBe('접수 전 · 무료');
    expect(r.status).toBe('마감까지 17일 8시간');
    expect(r.progress).toEqual({
      percent: 0,
      startLabel: '11.16(월) 접수 시작',
      endLabel: '11.30(월) 18:00 마감',
    });
    expect(r.canApply).toBe(true);
  });

  it('끝났으면 버튼이 눌리지 않고 막대가 없다 (목업 #detail/3470)', () => {
    expect(
      describeApply(
        ev({
          start_date_time: '2026-10-17T17:00',
          end_date_time: '2026-11-01T15:00',
          tags: tags('오프라인', '유료', '모임', '블록체인'),
        }),
        NOW
      )
    ).toEqual({
      phase: 'ended',
      state: '종료 · 유료',
      status: '종료된 행사예요',
      tone: 'gray',
      progress: null,
      canApply: false,
    });
  });

  it('비용 태그가 없으면 상태만 적는다', () => {
    expect(describeApply(ev({ tags: tags('오프라인', 'AI') }), NOW).state).toBe(
      '접수 중'
    );
  });

  it('접수 시작일을 읽을 수 없으면 막대를 그리지 않는다', () => {
    const r = describeApply(ev({ start_date_time: '' }), NOW);
    expect(r.phase).toBe('recruiting');
    expect(r.status).toBe('마감까지 6일 8시간');
    expect(r.progress).toBeNull();
  });
});

describe('describeApply — 일시형', () => {
  it('예정: D-day', () => {
    expect(
      describeApply(
        date({
          start_date_time: '2026-11-19T19:00',
          end_date_time: '2026-11-19T20:30',
        }),
        NOW
      )
    ).toEqual({
      phase: 'upcoming',
      state: '예정 · 무료',
      status: 'D-6',
      tone: 'blue',
      progress: null,
      canApply: true,
    });
  });

  it('오늘 시작하면 "오늘 열려요"', () => {
    const r = describeApply(
      date({
        start_date_time: '2026-11-13T19:00',
        end_date_time: '2026-11-13T21:00',
      }),
      NOW
    );
    expect(r.phase).toBe('upcoming');
    expect(r.status).toBe('오늘 열려요');
  });

  it('진행 중 (목업 #detail/3523)', () => {
    expect(
      describeApply(
        date({
          start_date_time: '2026-11-09T14:00',
          end_date_time: '2026-11-13T15:00',
        }),
        NOW
      )
    ).toEqual({
      phase: 'ongoing',
      state: '진행 중 · 무료',
      status: '지금 진행 중',
      tone: 'blue',
      progress: null,
      canApply: true,
    });
  });

  it('끝남', () => {
    const r = describeApply(
      date({
        start_date_time: '2026-11-11T18:30',
        end_date_time: '2026-11-11T21:00',
      }),
      NOW
    );
    expect(r.phase).toBe('ended');
    expect(r.state).toBe('종료 · 무료');
    expect(r.status).toBe('종료된 행사예요');
    expect(r.canApply).toBe(false);
  });

  it('날짜를 읽을 수 없으면 비용만 적고 신청은 열어 둔다', () => {
    expect(
      describeApply(date({ start_date_time: '', end_date_time: '' }), NOW)
    ).toEqual({
      phase: 'unknown',
      state: '무료',
      status: '',
      tone: 'blue',
      progress: null,
      canApply: true,
    });
  });
});

describe('ddayLabel — 같은 날 다른 행사 줄에 쓰는 짧은 문구', () => {
  it('접수형: "마감 D-6", 마감일에는 "오늘 마감"', () => {
    expect(ddayLabel(ev(), NOW)).toBe('마감 D-6');
    expect(ddayLabel(ev({ end_date_time: '2026-11-13T17:00' }), NOW)).toBe(
      '오늘 마감'
    );
  });

  it('일시형: "D-6", 시작일에는 "오늘", 시작한 뒤에는 "진행 중"', () => {
    const e = date({
      start_date_time: '2026-11-19T19:00',
      end_date_time: '2026-11-20T18:00',
    });
    expect(ddayLabel(e, NOW)).toBe('D-6');
    expect(ddayLabel(e, '2026-11-19T09:00')).toBe('오늘');
    expect(ddayLabel(e, '2026-11-19T19:00')).toBe('진행 중');
  });

  it('끝났으면 "종료", 날짜를 읽을 수 없으면 빈 문자열', () => {
    expect(ddayLabel(ev({ end_date_time: '2026-11-01T15:00' }), NOW)).toBe(
      '종료'
    );
    expect(ddayLabel(ev({ start_date_time: '', end_date_time: '' }), NOW)).toBe(
      ''
    );
  });
});
