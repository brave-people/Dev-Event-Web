import { parseNaive } from 'lib/utils/timeline/kst';
import { readEventPeriod } from 'lib/utils/timeline/period';

const DAY = 86400000;

describe('readEventPeriod', () => {
  it('시각이 있으면 그 시각을 쓴다', () => {
    expect(
      readEventPeriod({
        start_date_time: '2026-10-19T18:00',
        end_date_time: '2026-11-19T18:00',
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toEqual({
      startAt: parseNaive('2026-10-19T18:00'),
      endAt: parseNaive('2026-11-19T18:00'),
      startDay: '2026-10-19',
      endDay: '2026-11-19',
      startHasTime: true,
      endHasTime: true,
      oneDay: false,
      startKnown: true,
    });
  });

  it("'Y'가 아니면 시각이 없다 — 시작은 그날 0시, 끝은 그날의 마지막 순간", () => {
    const p = readEventPeriod({
      start_date_time: '2026-11-25T14:00',
      end_date_time: '2026-11-25T18:00',
      use_start_date_time_yn: 'N',
      use_end_date_time_yn: null,
    });
    expect(p).not.toBeNull();
    expect(p?.startHasTime).toBe(false);
    expect(p?.endHasTime).toBe(false);
    expect(p?.startAt).toBe(parseNaive('2026-11-25'));
    expect(p?.endAt).toBe(parseNaive('2026-11-25') + DAY - 1);
    expect(p?.oneDay).toBe(true);
  });

  it('시작을 읽을 수 없으면 끝으로 대신하고 startKnown이 false', () => {
    const p = readEventPeriod({
      start_date_time: '',
      end_date_time: '2026-11-19T18:00',
      use_start_date_time_yn: 'Y',
      use_end_date_time_yn: 'Y',
    });
    expect(p?.startKnown).toBe(false);
    expect(p?.startDay).toBe('2026-11-19');
    expect(p?.endDay).toBe('2026-11-19');
  });

  it('끝을 읽을 수 없으면 시작으로 대신한다', () => {
    const p = readEventPeriod({
      start_date_time: '2026-11-19T19:00',
      end_date_time: '',
      use_start_date_time_yn: 'Y',
      use_end_date_time_yn: null,
    });
    expect(p?.startKnown).toBe(true);
    expect(p?.endDay).toBe('2026-11-19');
    expect(p?.endHasTime).toBe(false);
  });

  it('둘 다 읽을 수 없으면 null', () => {
    expect(
      readEventPeriod({
        start_date_time: '',
        end_date_time: '없음',
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toBeNull();
  });
});
