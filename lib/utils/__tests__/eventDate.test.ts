import { formatEventPeriod, getEventTimeLabel } from 'lib/utils/eventDate';

describe('formatEventPeriod', () => {
  it('시작·종료 모두 시간 정보가 있으면 날짜+시간을 둘 다 표시한다', () => {
    expect(
      formatEventPeriod({
        start_date_time: '2026-07-13T00:00',
        end_date_time: '2026-09-07T10:00',
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toBe('2026.07.13 (월) 00:00 ~ 2026.09.07 (월) 10:00');
  });

  it('시간 정보가 없으면 날짜만 표시한다', () => {
    expect(
      formatEventPeriod({
        start_date_time: '2026-08-19T00:00',
        end_date_time: '2026-09-04T23:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      })
    ).toBe('2026.08.19 (수) ~ 2026.09.04 (금)');
  });

  it('같은 날이면 종료는 시간만 표시한다', () => {
    expect(
      formatEventPeriod({
        start_date_time: '2026-08-19T10:00',
        end_date_time: '2026-08-19T12:00',
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toBe('2026.08.19 (수) 10:00 ~ 12:00');
  });

  it('종료만 있으면 "까지"를 붙인다', () => {
    expect(
      formatEventPeriod({
        start_date_time: '',
        end_date_time: '2026-09-04T23:59',
        use_start_date_time_yn: null,
        use_end_date_time_yn: 'N',
      })
    ).toBe('2026.09.04 (금) 까지');
  });

  it('둘 다 없으면 빈 문자열', () => {
    expect(
      formatEventPeriod({
        start_date_time: '',
        end_date_time: '',
        use_start_date_time_yn: null,
        use_end_date_time_yn: null,
      })
    ).toBe('');
  });
});

describe('getEventTimeLabel', () => {
  it('DATE는 일시, RECRUIT는 접수', () => {
    expect(getEventTimeLabel('DATE')).toBe('일시');
    expect(getEventTimeLabel('RECRUIT')).toBe('접수');
  });
});
