import { layoutMultiDayEvents, EventSegment } from '../layoutMultiDayEvents';
import { buildCalendarMatrix } from '../buildCalendarMatrix';
import { Event } from 'model/event';

const baseEvent = (overrides: Partial<Event>): Event => ({
  id: '1', title: 'Test', description: '', organizer: 'Org',
  event_link: '', cover_image_link: '', display_sequence: 0,
  event_time_type: 'DATE', start_day_week: '월', end_day_week: '월',
  start_date_time: '', end_date_time: '',
  tags: [], create_date_time: '',
  use_end_date_time_yn: 'Y', use_start_date_time_yn: 'Y',
  ...overrides,
});

describe('layoutMultiDayEvents', () => {
  const matrix2026May = buildCalendarMatrix(2026, 5);

  it('produces single segment for single-day event', () => {
    const events = [baseEvent({ id: '1', start_date_time: '2026-05-12T10:00:00', end_date_time: '2026-05-12T18:00:00' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    const allSegments = result.flat();
    expect(allSegments).toHaveLength(1);
    expect(allSegments[0]).toMatchObject({ isStart: true, isEnd: true, eventId: '1' });
  });

  it('produces single segment for multi-day event within one week', () => {
    // 5/5 (화) ~ 5/7 (목) — all in week starting 5/3 (일)
    const events = [baseEvent({ id: '1', start_date_time: '2026-05-05T00:00:00', end_date_time: '2026-05-07T23:59:59' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    const segments = result.flat();
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ isStart: true, isEnd: true, startCol: 2, endCol: 4, weekIndex: 1 });
  });

  it('splits multi-day event crossing week boundary into two segments', () => {
    // 5/15 (금) ~ 5/18 (월) — crosses sat→sun boundary
    const events = [baseEvent({ id: 'cross', start_date_time: '2026-05-15T00:00:00', end_date_time: '2026-05-18T23:59:59' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    const segments = result.flat();
    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ isStart: true, isEnd: false });
    expect(segments[1]).toMatchObject({ isStart: false, isEnd: true });
  });

  it('includes outside cells when event spans month boundary', () => {
    // 5/30 (토) ~ 6/1 (월) — last segment is in outside cells of week 5
    const events = [baseEvent({ id: 'border', start_date_time: '2026-05-30T00:00:00', end_date_time: '2026-06-01T23:59:59' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    const segments = result.flat();
    expect(segments.length).toBeGreaterThanOrEqual(1);
    const hasOutside = segments.some((s) => s.isOutside);
    expect(hasOutside).toBe(true);
  });

  it('skips events with event_time_type=RECRUIT', () => {
    const events = [baseEvent({ id: 'r', event_time_type: 'RECRUIT', start_date_time: '2026-05-12T00:00:00', end_date_time: '2026-05-12T23:59:59' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    expect(result.flat()).toHaveLength(0);
  });

  it('skips events with use_start_date_time_yn=N', () => {
    const events = [baseEvent({ id: 'n', start_date_time: '2026-05-12T00:00:00', end_date_time: '2026-05-12T23:59:59', use_start_date_time_yn: 'N' })];
    const result = layoutMultiDayEvents(events, matrix2026May);
    expect(result.flat()).toHaveLength(0);
  });

  it('sorts overlapping events by display_sequence then start_date_time', () => {
    const events = [
      baseEvent({ id: 'B', display_sequence: 2, start_date_time: '2026-05-12T10:00:00', end_date_time: '2026-05-12T12:00:00' }),
      baseEvent({ id: 'A', display_sequence: 1, start_date_time: '2026-05-12T11:00:00', end_date_time: '2026-05-12T13:00:00' }),
    ];
    const result = layoutMultiDayEvents(events, matrix2026May);
    const segs = result.flat();
    expect(segs[0].eventId).toBe('A');
    expect(segs[1].eventId).toBe('B');
  });
});
