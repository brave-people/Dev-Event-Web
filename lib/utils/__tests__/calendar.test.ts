import {
  buildIcsForEvent,
  buildGoogleCalendarUrl,
  isAllDayEvent,
} from '../calendar';
import { Event } from 'model/event';

const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '123',
  title: 'FEConf Korea 2026',
  description: '프론트엔드 컨퍼런스',
  organizer: '코엑스 그랜드볼룸',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 1,
  event_time_type: 'DATE',
  start_day_week: 'MON' as never,
  start_date_time: '2026-05-18T01:00:00.000Z',
  end_day_week: 'MON' as never,
  end_date_time: '2026-05-18T09:00:00.000Z',
  tags: [],
  create_date_time: '2026-01-01T00:00:00.000Z',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...overrides,
});

describe('isAllDayEvent', () => {
  it('treats use_start_date_time_yn === "N" as all-day', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'Y',
      })
    ).toBe(true);
  });

  it('treats use_end_date_time_yn === "N" as all-day', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'N',
      })
    ).toBe(true);
  });

  it('returns false when both Y', () => {
    expect(
      isAllDayEvent({
        use_start_date_time_yn: 'Y',
        use_end_date_time_yn: 'Y',
      })
    ).toBe(false);
  });
});

describe('buildIcsForEvent', () => {
  it('includes VCALENDAR/VEVENT envelopes', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('uses DTSTART/DTEND with UTC time for timed events', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
  });

  it('uses DATE form for all-day events and adds 1 local day to DTEND', () => {
    // Use TZ-naive date strings so getFullYear/Month/Date resolve to 5/18 in any locale.
    const ics = buildIcsForEvent(
      makeEvent({
        start_date_time: '2026-05-18T00:00:00',
        end_date_time: '2026-05-18T23:59:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      })
    );
    expect(ics).toContain('DTSTART;VALUE=DATE:20260518');
    expect(ics).toContain('DTEND;VALUE=DATE:20260519');
  });

  it('escapes commas, semicolons, and backslashes in summary/description', () => {
    const ics = buildIcsForEvent(
      makeEvent({
        title: 'A, B; C\\D',
        description: 'line1\nline2',
      })
    );
    expect(ics).toContain('SUMMARY:A\\, B\\; C\\\\D');
    expect(ics).toContain('line1\\nline2');
  });

  it('embeds a 30-minute VALARM', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(ics).toContain('END:VALARM');
  });

  it('embeds baseUrl link when given', () => {
    const ics = buildIcsForEvent(makeEvent(), 'https://dev-event.vercel.app');
    expect(ics).toContain('URL:https://dev-event.vercel.app/event/detail/123');
  });

  it('uses CRLF line endings per RFC 5545', () => {
    const ics = buildIcsForEvent(makeEvent());
    expect(ics).toMatch(/\r\n/);
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('returns a calendar.google.com TEMPLATE URL', () => {
    const url = buildGoogleCalendarUrl(makeEvent());
    expect(url).toMatch(
      /^https:\/\/calendar\.google\.com\/calendar\/render\?/
    );
    expect(url).toContain('action=TEMPLATE');
  });

  it('encodes the title in text param', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({ title: 'FEConf 2026' })
    );
    // URLSearchParams form-encodes spaces as '+'.
    expect(url).toContain('text=FEConf+2026');
  });

  it('uses UTC datetime range for timed events', () => {
    const url = buildGoogleCalendarUrl(makeEvent());
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/);
  });

  it('uses date-only range with exclusive end for all-day events', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({
        start_date_time: '2026-05-18T00:00:00',
        end_date_time: '2026-05-18T23:59:59',
        use_start_date_time_yn: 'N',
        use_end_date_time_yn: 'N',
      })
    );
    expect(url).toContain('dates=20260518%2F20260519');
  });

  it('passes organizer as location', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({ organizer: '코엑스' })
    );
    expect(decodeURIComponent(url)).toContain('location=코엑스');
  });

  it('uses UTC datetime for timed events regardless of host TZ', () => {
    const url = buildGoogleCalendarUrl(
      makeEvent({
        start_date_time: '2026-05-18T01:00:00.000Z',
        end_date_time: '2026-05-18T09:00:00.000Z',
      })
    );
    expect(url).toContain('dates=20260518T010000Z%2F20260518T090000Z');
  });
});
