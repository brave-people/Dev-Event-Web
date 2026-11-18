import { describeEvent } from 'lib/utils/timeline/describeEvent';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일. 목업의 고정 시각과 같다

const ev = (over: Partial<Event> = {}): Event => ({
  id: '1',
  title: '행사',
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '수',
  start_date_time: '2026-11-07T00:00',
  end_day_week: '수',
  end_date_time: '2026-11-13T17:00',
  tags: [],
  create_date_time: '2026-11-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const date = (over: Partial<Event>): Event =>
  ev({ event_time_type: 'DATE', ...over });

describe('describeEvent — 접수형', () => {
  it('마감일에 놓이고 "접수 마감 17:00"을 보여 준다', () => {
    const r = describeEvent(ev(), NOW);
    expect(r.status).toBe('recruiting');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({
      tone: 'dead',
      chip: '접수 마감',
      time: '17:00',
      extra: '',
    });
  });

  it('마감에 시각이 없으면 시각을 적지 않는다', () => {
    const r = describeEvent(
      ev({ end_date_time: '2026-11-20T23:59', use_end_date_time_yn: 'N' }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-20');
    expect(r.slot).toEqual({
      tone: 'dead',
      chip: '접수 마감',
      time: '',
      extra: '',
    });
  });

  it('오늘 이미 마감했으면 오늘에 "접수 종료"로 남는다', () => {
    const r = describeEvent(ev({ end_date_time: '2026-11-13T09:00' }), NOW);
    expect(r.status).toBe('ended');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({
      tone: 'done',
      chip: '접수 종료',
      time: '',
      extra: '',
    });
  });
});

describe('describeEvent — 일시형', () => {
  it('하루짜리는 시작일에 놓이고 "행사 19:00 ~ 20:30"', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-19T19:00',
        end_date_time: '2026-11-19T20:30',
      }),
      NOW
    );
    expect(r.status).toBe('upcoming');
    expect(r.dateKey).toBe('2026-11-19');
    expect(r.slot).toEqual({
      tone: 'open',
      chip: '행사',
      time: '19:00 ~ 20:30',
      extra: '',
    });
  });

  it('여러 날이면 시작 시각과 "11.22(일)까지"', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-20T10:00',
        end_date_time: '2026-11-22T18:00',
      }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-20');
    expect(r.slot).toEqual({
      tone: 'open',
      chip: '행사',
      time: '10:00',
      extra: '11.22(일)까지',
    });
  });

  it('여러 날이고 시작 시각이 00:00이면 시각을 적지 않는다', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-20T00:00',
        end_date_time: '2026-11-22T18:00',
      }),
      NOW
    );
    expect(r.slot).toEqual({
      tone: 'open',
      chip: '행사',
      time: '',
      extra: '11.22(일)까지',
    });
  });

  it("시각을 쓰지 않는 행사('N')는 칩만 보여 준다", () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-25T00:00',
        end_date_time: '2026-11-25T23:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      }),
      NOW
    );
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '', extra: '' });
  });

  it('끝에만 시각이 없으면 시작 시각만 적는다', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-25T14:00',
        end_date_time: '2026-11-25T23:59',
        use_end_date_time_yn: 'N',
      }),
      NOW
    );
    expect(r.slot.time).toBe('14:00');
  });

  it("null은 'N'과 같이 다룬다", () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-19T19:00',
        end_date_time: '2026-11-19T20:30',
        use_start_date_time_yn: null,
        use_end_date_time_yn: null,
      }),
      NOW
    );
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '', extra: '' });
  });

  it('끝나는 날짜가 비어 있으면 시작일 하루짜리로 본다', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-19T19:00',
        end_date_time: '',
        use_end_date_time_yn: null,
      }),
      NOW
    );
    expect(r.status).toBe('upcoming');
    expect(r.dateKey).toBe('2026-11-19');
    expect(r.slot).toEqual({
      tone: 'open',
      chip: '행사',
      time: '19:00',
      extra: '',
    });
  });

  it('진행 중이면 오늘에 놓이고 "진행 중 … 11.14(토)까지"', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-12T09:00',
        end_date_time: '2026-11-14T18:00',
      }),
      NOW
    );
    expect(r.status).toBe('ongoing');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({
      tone: 'open',
      chip: '진행 중',
      time: '',
      extra: '11.14(토)까지',
    });
  });

  it('끝났으면 끝난 날에 "행사 종료"', () => {
    const r = describeEvent(
      date({
        start_date_time: '2026-11-11T18:30',
        end_date_time: '2026-11-11T21:00',
      }),
      NOW
    );
    expect(r.status).toBe('ended');
    expect(r.dateKey).toBe('2026-11-11');
    expect(r.slot).toEqual({
      tone: 'done',
      chip: '행사 종료',
      time: '',
      extra: '',
    });
  });

  it('끝에 시각이 없으면 그날이 다 지나야 끝난 것으로 본다', () => {
    const e = date({
      start_date_time: '2026-11-10T00:00',
      end_date_time: '2026-11-13T00:00',
      use_start_date_time_yn: 'N',
      use_end_date_time_yn: 'N',
    });
    expect(describeEvent(e, '2026-11-13T10:00').status).toBe('ongoing');
    expect(describeEvent(e, '2026-11-13T23:59').status).toBe('ongoing');
    const after = describeEvent(e, '2026-11-14T00:00');
    expect(after.status).toBe('ended');
    expect(after.dateKey).toBe('2026-11-13');
  });
});

describe('describeEvent — NEW', () => {
  it('등록하고 3일째까지 NEW', () => {
    expect(
      describeEvent(ev({ create_date_time: '2026-11-10T23:59' }), NOW).isNew
    ).toBe(true);
    expect(
      describeEvent(ev({ create_date_time: '2026-11-09T23:59' }), NOW).isNew
    ).toBe(false);
  });

  it('끝난 행사는 NEW가 아니다', () => {
    const r = describeEvent(
      ev({
        end_date_time: '2026-11-13T09:00',
        create_date_time: '2026-11-12T09:00',
      }),
      NOW
    );
    expect(r.isNew).toBe(false);
  });

  it('등록일을 읽을 수 없으면 NEW가 아니다', () => {
    expect(describeEvent(ev({ create_date_time: '' }), NOW).isNew).toBe(false);
  });
});

describe('읽을 수 없는 날짜', () => {
  it('시작이 읽을 수 없으면 끝 날짜로 계산한다', () => {
    const r = describeEvent(
      date({ start_date_time: 'abc', end_date_time: '2026-11-19T20:30' }),
      NOW
    );
    expect(r.dateKey).not.toContain('NaN');
    expect(r.dateKey).toBe('2026-11-19');
    expect(r.status).toBe('upcoming');
  });

  it('둘 다 비어 있으면 오늘에 시각 없이 보여 준다', () => {
    const r = describeEvent(
      date({ start_date_time: '', end_date_time: '' }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.status).toBe('ongoing');
    expect(r.slot.time).toBe('');
    const json = JSON.stringify(r);
    expect(json).not.toContain('NaN');
    expect(json).not.toContain('undefined');
  });

  it('둘 다 null이어도 예외 없이 같은 결과', () => {
    const r = describeEvent(
      date({
        start_date_time: null as unknown as string,
        end_date_time: null as unknown as string,
      }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.status).toBe('ongoing');
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '', extra: '' });
    const json = JSON.stringify(r);
    expect(json).not.toContain('NaN');
    expect(json).not.toContain('undefined');
  });
});
