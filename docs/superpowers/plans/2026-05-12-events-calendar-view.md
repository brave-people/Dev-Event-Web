# `/events` 캘린더 보기 추가 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/events` 페이지에 리스트 ↔ 캘린더 뷰 토글을 추가하고, 한 달치 이벤트를 시각적 격자(데스크탑) 또는 점 캘린더(모바일)로 보여준다.

**Architecture:** 새 컴포넌트들은 `components/events/calendar/` 아래에 모은다. 순수 계산 로직(`buildCalendarMatrix`, `layoutMultiDayEvents`, `tagColor`)은 `utils/`로 분리해 단위 테스트한다. URL 쿼리(`?view=calendar&year=&month=`)가 상태의 진실 근원이며 `pages/events.tsx`의 SSR이 모드별로 API를 분기 호출한다. 기존 `useMonthlyEvent` 훅과 `WindowContext`를 재사용한다.

**Tech Stack:** Next.js 12 (page router) · React 17 · TypeScript · SWR · dayjs · SCSS modules · react-modal · Jest + ts-jest (이번에 셋업)

**관련 스펙:** `docs/superpowers/specs/2026-05-12-events-calendar-view-design.md`

---

## 파일 구조 매핑

**신규 생성**
- `components/events/calendar/CalendarView.tsx` — 뷰 진입, viewport 분기, 선택일 상태
- `components/events/calendar/CalendarHeader.tsx` — 월 네비 + "오늘"
- `components/events/calendar/CalendarGrid.tsx` — 데스크탑 7×6 그리드
- `components/events/calendar/CalendarDotGrid.tsx` — 모바일 점 캘린더
- `components/events/calendar/DayDetailSheet.tsx` — 선택일 이벤트 모달/시트
- `components/events/calendar/ViewToggle.tsx` — 리스트/캘린더 세그먼트
- `components/events/calendar/CalendarView.module.scss`
- `components/events/calendar/utils/buildCalendarMatrix.ts`
- `components/events/calendar/utils/layoutMultiDayEvents.ts`
- `components/events/calendar/utils/tagColor.ts`
- `components/events/calendar/utils/__tests__/buildCalendarMatrix.test.ts`
- `components/events/calendar/utils/__tests__/layoutMultiDayEvents.test.ts`
- `components/events/calendar/utils/__tests__/tagColor.test.ts`
- `jest.config.js`, `jest.setup.ts` (루트)

**변경**
- `pages/events.tsx` — SSR 분기, 뷰 분기 렌더, `ViewToggle` 마운트
- `pages/calender.tsx` — 컴포넌트 본체 제거, 307 redirect만
- `package.json` — Jest 의존성 + `test` 스크립트

**삭제 없음** (`MonthlyEventList` 등 기존 컴포넌트는 유지 — 다른 곳 영향 회피)

---

## Task 0: Jest 테스트 셋업

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`, `jest.setup.ts`

- [ ] **Step 1: Jest + ts-jest 설치**

```bash
pnpm add -D jest@29 ts-jest@29 @types/jest@29 jest-environment-jsdom@29
```

- [ ] **Step 2: `jest.config.js` 작성**

루트에 새 파일:
```js
// jest.config.js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/__mocks__/styleMock.js',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
```

- [ ] **Step 3: `jest.setup.ts` + 스타일 목업 생성**

```ts
// jest.setup.ts
import '@testing-library/jest-dom';
```

```js
// __mocks__/styleMock.js
module.exports = {};
```

> 참고: 유틸 함수만 테스트할 거라면 `@testing-library/jest-dom`은 생략 가능. 일단 셋업만 두고 사용 안 함.

- [ ] **Step 4: `package.json`에 test 스크립트 추가**

`scripts` 블록에 추가:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: 빈 sanity 테스트로 확인**

```ts
// components/events/calendar/utils/__tests__/sanity.test.ts
describe('jest setup', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```

Run: `pnpm test`
Expected: PASS, 1 test passed

- [ ] **Step 6: sanity 테스트 삭제 후 커밋**

```bash
rm components/events/calendar/utils/__tests__/sanity.test.ts
git add package.json pnpm-lock.yaml jest.config.js jest.setup.ts __mocks__/styleMock.js
git commit -m "chore: add jest + ts-jest test setup"
```

---

## Task 1: `buildCalendarMatrix` 유틸 (TDD)

캘린더 그리드의 6주×7일 행렬을 만드는 순수 함수.

**Files:**
- Create: `components/events/calendar/utils/buildCalendarMatrix.ts`
- Test: `components/events/calendar/utils/__tests__/buildCalendarMatrix.test.ts`

- [ ] **Step 1: 테스트 작성 (failing)**

```ts
// components/events/calendar/utils/__tests__/buildCalendarMatrix.test.ts
import { buildCalendarMatrix, CalendarCell } from '../buildCalendarMatrix';

describe('buildCalendarMatrix', () => {
  it('returns 6 weeks × 7 days = 42 cells', () => {
    const matrix = buildCalendarMatrix(2026, 5);
    expect(matrix).toHaveLength(6);
    matrix.forEach((week) => expect(week).toHaveLength(7));
  });

  it('marks outside-month cells with isOutside=true (2026-05)', () => {
    const matrix = buildCalendarMatrix(2026, 5);
    // 2026/5/1 is Friday — first row has 5 outside cells (4/26~4/30)
    expect(matrix[0][0]).toEqual<CalendarCell>({
      date: '2026-04-26', year: 2026, month: 4, day: 26, dow: 0, isOutside: true,
    });
    expect(matrix[0][5]).toEqual<CalendarCell>({
      date: '2026-05-01', year: 2026, month: 5, day: 1, dow: 5, isOutside: false,
    });
  });

  it('handles year boundary (2025-12 → 2026-01 outside cells)', () => {
    const matrix = buildCalendarMatrix(2025, 12);
    const last = matrix[matrix.length - 1];
    const outsideAfter = last.filter((c) => c.isOutside && c.year === 2026);
    expect(outsideAfter.length).toBeGreaterThan(0);
    expect(outsideAfter[0].month).toBe(1);
  });

  it('handles leap year February 2024 correctly', () => {
    const matrix = buildCalendarMatrix(2024, 2);
    const inMonth = matrix.flat().filter((c) => !c.isOutside);
    expect(inMonth).toHaveLength(29);
    expect(inMonth[inMonth.length - 1].day).toBe(29);
  });
});
```

- [ ] **Step 2: 테스트 실행 → FAIL 확인**

Run: `pnpm test -- buildCalendarMatrix`
Expected: FAIL (`Cannot find module '../buildCalendarMatrix'`)

- [ ] **Step 3: 최소 구현**

```ts
// components/events/calendar/utils/buildCalendarMatrix.ts
import dayjs from 'dayjs';

export interface CalendarCell {
  date: string;     // 'YYYY-MM-DD'
  year: number;
  month: number;    // 1~12
  day: number;
  dow: number;      // 0=Sun ... 6=Sat
  isOutside: boolean;
}

export function buildCalendarMatrix(year: number, month: number): CalendarCell[][] {
  const firstOfMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const startDow = firstOfMonth.day(); // 0~6
  const gridStart = firstOfMonth.subtract(startDow, 'day');

  const matrix: CalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = gridStart.add(w * 7 + d, 'day');
      week.push({
        date: cur.format('YYYY-MM-DD'),
        year: cur.year(),
        month: cur.month() + 1,
        day: cur.date(),
        dow: cur.day(),
        isOutside: cur.month() + 1 !== month || cur.year() !== year,
      });
    }
    matrix.push(week);
  }
  return matrix;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- buildCalendarMatrix`
Expected: PASS, 4 tests passed

- [ ] **Step 5: 커밋**

```bash
git add components/events/calendar/utils/buildCalendarMatrix.ts \
        components/events/calendar/utils/__tests__/buildCalendarMatrix.test.ts
git commit -m "feat(calendar): add buildCalendarMatrix util with tests"
```

---

## Task 2: `tagColor` 유틸 (TDD)

태그 이름 → KTB 색 매핑.

**Files:**
- Create: `components/events/calendar/utils/tagColor.ts`
- Test: `components/events/calendar/utils/__tests__/tagColor.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// components/events/calendar/utils/__tests__/tagColor.test.ts
import { tagColor, DEFAULT_TAG_COLOR } from '../tagColor';

describe('tagColor', () => {
  it('maps 컨퍼런스 to KTB Blue', () => {
    expect(tagColor(['컨퍼런스'])).toBe('#0043FF');
  });
  it('maps 웨비나 to Success green', () => {
    expect(tagColor(['웨비나'])).toBe('#08785E');
  });
  it('maps 해커톤 to Warning orange', () => {
    expect(tagColor(['해커톤'])).toBe('#B45209');
  });
  it('maps 네트워킹 to Violet', () => {
    expect(tagColor(['네트워킹'])).toBe('#7A0CFF');
  });
  it('returns default color when no tag matches', () => {
    expect(tagColor(['알수없는태그'])).toBe(DEFAULT_TAG_COLOR);
  });
  it('returns default color for empty tags', () => {
    expect(tagColor([])).toBe(DEFAULT_TAG_COLOR);
  });
  it('uses first matching tag when multiple tags', () => {
    expect(tagColor(['알수없음', '컨퍼런스', '웨비나'])).toBe('#0043FF');
  });
});
```

- [ ] **Step 2: 테스트 실행 → FAIL 확인**

Run: `pnpm test -- tagColor`
Expected: FAIL

- [ ] **Step 3: 최소 구현**

```ts
// components/events/calendar/utils/tagColor.ts
export const DEFAULT_TAG_COLOR = '#525463';

const COLOR_MAP: Array<{ keywords: string[]; color: string }> = [
  { keywords: ['컨퍼런스', 'conference', 'conf'],         color: '#0043FF' },
  { keywords: ['웨비나', '세미나', 'webinar', 'seminar'], color: '#08785E' },
  { keywords: ['해커톤', '공모전', 'hackathon'],           color: '#B45209' },
  { keywords: ['네트워킹', '밋업', 'meetup'],              color: '#7A0CFF' },
];

export function tagColor(tagNames: string[]): string {
  for (const tagName of tagNames) {
    const lower = tagName.toLowerCase();
    const match = COLOR_MAP.find(({ keywords }) =>
      keywords.some((k) => lower.includes(k.toLowerCase()))
    );
    if (match) return match.color;
  }
  return DEFAULT_TAG_COLOR;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- tagColor`
Expected: PASS, 7 tests passed

- [ ] **Step 5: 커밋**

```bash
git add components/events/calendar/utils/tagColor.ts \
        components/events/calendar/utils/__tests__/tagColor.test.ts
git commit -m "feat(calendar): add tagColor util with tests"
```

---

## Task 3: `layoutMultiDayEvents` 유틸 (TDD)

이벤트들을 받아서 주차별 segment로 배치하는 핵심 로직.

**Files:**
- Create: `components/events/calendar/utils/layoutMultiDayEvents.ts`
- Test: `components/events/calendar/utils/__tests__/layoutMultiDayEvents.test.ts`

- [ ] **Step 1: 테스트 작성**

```ts
// components/events/calendar/utils/__tests__/layoutMultiDayEvents.test.ts
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
    // 5/14 (목) ~ 5/16 (토) — single week
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
```

- [ ] **Step 2: 테스트 실행 → FAIL 확인**

Run: `pnpm test -- layoutMultiDayEvents`
Expected: FAIL (module not found)

- [ ] **Step 3: 구현**

```ts
// components/events/calendar/utils/layoutMultiDayEvents.ts
import dayjs from 'dayjs';
import { Event } from 'model/event';
import { CalendarCell } from './buildCalendarMatrix';

export interface EventSegment {
  eventId: string;
  event: Event;
  weekIndex: number;   // 0~5
  startCol: number;    // 0~6 (inclusive)
  endCol: number;      // 0~6 (inclusive)
  isStart: boolean;    // true if this is the original start day
  isEnd: boolean;      // true if this is the original end day
  isOutside: boolean;  // segment falls in outside cells of the matrix
}

function isRenderable(e: Event): boolean {
  if (e.event_time_type !== 'DATE') return false;
  if (e.use_start_date_time_yn === 'N') return false;
  if (!e.start_date_time) return false;
  return true;
}

export function layoutMultiDayEvents(
  events: Event[],
  matrix: CalendarCell[][],
): EventSegment[][] {
  const segmentsByWeek: EventSegment[][] = matrix.map(() => []);

  const sorted = [...events]
    .filter(isRenderable)
    .sort((a, b) => {
      const ds = a.display_sequence - b.display_sequence;
      if (ds !== 0) return ds;
      return a.start_date_time.localeCompare(b.start_date_time);
    });

  const gridStart = dayjs(matrix[0][0].date);
  const gridEnd   = dayjs(matrix[5][6].date);

  for (const event of sorted) {
    const start = dayjs(event.start_date_time);
    const end   = event.end_date_time ? dayjs(event.end_date_time) : start;

    // clip to grid
    const clipStart = start.isBefore(gridStart) ? gridStart : start;
    const clipEnd   = end.isAfter(gridEnd)      ? gridEnd   : end;
    if (clipEnd.isBefore(clipStart)) continue;

    // walk weeks: find which (week, col) clipStart and clipEnd fall in
    for (let w = 0; w < matrix.length; w++) {
      const weekStart = dayjs(matrix[w][0].date);
      const weekEnd   = dayjs(matrix[w][6].date);

      if (clipEnd.isBefore(weekStart) || clipStart.isAfter(weekEnd)) continue;

      const segStart = clipStart.isBefore(weekStart) ? weekStart : clipStart;
      const segEnd   = clipEnd.isAfter(weekEnd)      ? weekEnd   : clipEnd;
      const startCol = segStart.diff(weekStart, 'day');
      const endCol   = segEnd.diff(weekStart, 'day');

      const segmentIsOutside =
        matrix[w][startCol].isOutside && matrix[w][endCol].isOutside;

      segmentsByWeek[w].push({
        eventId: event.id,
        event,
        weekIndex: w,
        startCol,
        endCol,
        isStart: segStart.isSame(start, 'day'),
        isEnd:   segEnd.isSame(end, 'day'),
        isOutside: segmentIsOutside,
      });
    }
  }

  return segmentsByWeek;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test -- layoutMultiDayEvents`
Expected: PASS, 7 tests passed

- [ ] **Step 5: 커밋**

```bash
git add components/events/calendar/utils/layoutMultiDayEvents.ts \
        components/events/calendar/utils/__tests__/layoutMultiDayEvents.test.ts
git commit -m "feat(calendar): add layoutMultiDayEvents util with tests"
```

---

## Task 4: `ViewToggle` 컴포넌트

리스트 ↔ 캘린더 세그먼트 컨트롤.

**Files:**
- Create: `components/events/calendar/ViewToggle.tsx`
- Create: `components/events/calendar/CalendarView.module.scss` (이 task에서 초기 생성, 다음 task들이 추가)

- [ ] **Step 1: SCSS 모듈 초기화**

```scss
// components/events/calendar/CalendarView.module.scss
@import 'styles/variables';

.viewToggle {
  display: inline-flex;
  background: #F0F0F5;
  padding: 4px;
  border-radius: 10px;
}

.viewToggle__btn {
  border: 0;
  background: transparent;
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #6C6E7E;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &.on {
    background: #fff;
    color: #2B2D36;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
}
```

- [ ] **Step 2: `ViewToggle.tsx` 구현**

```tsx
// components/events/calendar/ViewToggle.tsx
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);

export type ViewMode = 'list' | 'calendar';

type Props = { current: ViewMode };

const ViewToggle = ({ current }: Props) => {
  const router = useRouter();

  const switchTo = (mode: ViewMode) => {
    if (mode === current) return;
    if (mode === 'list') {
      const { view, year, month, ...rest } = router.query;
      router.push({ pathname: '/events', query: rest }, undefined, { shallow: true });
    } else {
      const now = dayjs();
      router.push(
        {
          pathname: '/events',
          query: {
            ...router.query,
            view: 'calendar',
            year: router.query.year ?? now.year(),
            month: router.query.month ?? now.month() + 1,
          },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  return (
    <div className={cn('viewToggle')} role="tablist" aria-label="보기 전환">
      <button
        type="button"
        role="tab"
        aria-selected={current === 'list'}
        className={cn('viewToggle__btn', { on: current === 'list' })}
        onClick={() => switchTo('list')}
      >
        📋 리스트
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={current === 'calendar'}
        className={cn('viewToggle__btn', { on: current === 'calendar' })}
        onClick={() => switchTo('calendar')}
      >
        📅 캘린더
      </button>
    </div>
  );
};

export default ViewToggle;
```

- [ ] **Step 3: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공 (이 컴포넌트는 아직 어디서도 import되지 않음)

- [ ] **Step 4: 커밋**

```bash
git add components/events/calendar/CalendarView.module.scss \
        components/events/calendar/ViewToggle.tsx
git commit -m "feat(calendar): add ViewToggle component"
```

---

## Task 5: `CalendarHeader` 컴포넌트

월 네비 + "오늘" 버튼.

**Files:**
- Create: `components/events/calendar/CalendarHeader.tsx`
- Modify: `components/events/calendar/CalendarView.module.scss` (append)

- [ ] **Step 1: SCSS 추가**

`CalendarView.module.scss` 끝에 추가:

```scss
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__monthLabel {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.012em;
}

.header__navBtn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #E1E1E8;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  color: #6C6E7E;
  &:hover { border-color: #CDCED6; }
}

.header__todayBtn {
  margin-left: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #E1E1E8;
  background: #fff;
  color: #2B2D36;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
```

- [ ] **Step 2: `CalendarHeader.tsx` 구현**

```tsx
// components/events/calendar/CalendarHeader.tsx
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);

type Props = { year: number; month: number };

const CalendarHeader = ({ year, month }: Props) => {
  const router = useRouter();

  const navigate = (deltaMonths: number | 'today') => {
    let nextYear = year;
    let nextMonth = month;
    if (deltaMonths === 'today') {
      const now = dayjs();
      nextYear = now.year();
      nextMonth = now.month() + 1;
    } else {
      const next = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).add(deltaMonths, 'month');
      nextYear = next.year();
      nextMonth = next.month() + 1;
    }
    router.push(
      { pathname: '/events', query: { ...router.query, view: 'calendar', year: nextYear, month: nextMonth } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className={cn('header__nav')}>
      <button type="button" className={cn('header__navBtn')} aria-label="이전 달" onClick={() => navigate(-1)}>‹</button>
      <span className={cn('header__monthLabel')}>{year}년 {month}월</span>
      <button type="button" className={cn('header__navBtn')} aria-label="다음 달" onClick={() => navigate(1)}>›</button>
      <button type="button" className={cn('header__todayBtn')} onClick={() => navigate('today')}>오늘</button>
    </div>
  );
};

export default CalendarHeader;
```

- [ ] **Step 3: 빌드 확인 & 커밋**

```bash
pnpm build
git add components/events/calendar/CalendarHeader.tsx \
        components/events/calendar/CalendarView.module.scss
git commit -m "feat(calendar): add CalendarHeader with month navigation"
```

---

## Task 6: `CalendarGrid` (데스크탑)

7×6 셀 그리드 + 다중일 이벤트 segment 렌더.

**Files:**
- Create: `components/events/calendar/CalendarGrid.tsx`
- Modify: `components/events/calendar/CalendarView.module.scss`

- [ ] **Step 1: SCSS 추가**

`CalendarView.module.scss` 끝에 추가:

```scss
.grid__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;

  div {
    font-size: 12px;
    font-weight: 600;
    color: #6C6E7E;
    text-align: center;
    padding: 8px 0;
  }
  div:first-child { color: #D91C29; }
  div:last-child  { color: #1D6CE0; }
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #E8E8EE;
  border: 1px solid #E8E8EE;
  border-radius: 8px;
  overflow: hidden;
}

.grid__cell {
  background: #fff;
  min-height: 110px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  position: relative;
  &:hover { background: #F7F7FA; }

  &.outside { background: #F7F7FA; color: #8C8F9F; }
}

.grid__num {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 4px;

  &.sun { color: #D91C29; }
  &.sat { color: #1D6CE0; }
  &.outside { color: #8C8F9F; }
}

.grid__numToday {
  background: #0043FF;
  color: #fff !important;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.grid__chip {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  line-height: 1.3;
}
.grid__chip--start { border-radius: 4px 0 0 4px; margin-right: -9px; padding-right: 12px; }
.grid__chip--mid   { border-radius: 0; margin-left: -9px; margin-right: -9px; padding-left: 12px; padding-right: 12px; }
.grid__chip--end   { border-radius: 0 4px 4px 0; margin-left: -9px; padding-left: 12px; }

.grid__more {
  font-size: 11px;
  color: #6C6E7E;
  padding: 2px 6px;
}
```

- [ ] **Step 2: `CalendarGrid.tsx` 구현**

```tsx
// components/events/calendar/CalendarGrid.tsx
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { buildCalendarMatrix } from './utils/buildCalendarMatrix';
import { layoutMultiDayEvents, EventSegment } from './utils/layoutMultiDayEvents';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';
import { useMemo } from 'react';

const cn = classNames.bind(style);

const MAX_CHIPS_PER_CELL = 2;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  year: number;
  month: number;
  events: Event[];
  onSelectDate: (dateISO: string) => void;
};

const CalendarGrid = ({ year, month, events, onSelectDate }: Props) => {
  const matrix = useMemo(() => buildCalendarMatrix(year, month), [year, month]);
  const segmentsByWeek = useMemo(
    () => layoutMultiDayEvents(events, matrix),
    [events, matrix]
  );
  const todayISO = dayjs().format('YYYY-MM-DD');

  // For each cell, decide which segments to display and overflow count
  const renderWeek = (weekIdx: number) => {
    const week = matrix[weekIdx];
    const weekSegments = segmentsByWeek[weekIdx];

    // For each cell column, count segments occupying it
    const segmentsByCol: EventSegment[][] = Array.from({ length: 7 }, () => []);
    weekSegments.forEach((seg) => {
      for (let c = seg.startCol; c <= seg.endCol; c++) {
        segmentsByCol[c].push(seg);
      }
    });

    return week.map((cell, col) => {
      const isToday = cell.date === todayISO && !cell.isOutside;
      const segsHere = segmentsByCol[col];
      const visibleSegs = segsHere.slice(0, MAX_CHIPS_PER_CELL);
      const overflow = segsHere.length - visibleSegs.length;

      return (
        <div
          key={cell.date}
          className={cn('grid__cell', { outside: cell.isOutside })}
          role="button"
          tabIndex={0}
          aria-label={`${cell.month}월 ${cell.day}일 행사 ${segsHere.length}건`}
          onClick={() => onSelectDate(cell.date)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelectDate(cell.date); }}
        >
          <span
            className={cn('grid__num', {
              sun: cell.dow === 0 && !cell.isOutside,
              sat: cell.dow === 6 && !cell.isOutside,
              outside: cell.isOutside,
            })}
          >
            <span className={cn({ grid__numToday: isToday })}>{cell.day}</span>
          </span>
          {visibleSegs.map((seg) => {
            // Only render chip in startCol of this segment (one chip per segment)
            if (seg.startCol !== col) return null;
            const color = tagColor(seg.event.tags.map((t: TagResponse) => t.tag_name));
            const isStartChip = seg.isStart;
            const isEndChip   = seg.isEnd;
            const isPureSpanMid = !isStartChip && !isEndChip;
            return (
              <div
                key={`${seg.eventId}-${seg.weekIndex}-${seg.startCol}`}
                className={cn(
                  'grid__chip',
                  {
                    'grid__chip--start': !isStartChip || (seg.endCol > seg.startCol && isStartChip && !isEndChip),
                    'grid__chip--mid':   isPureSpanMid,
                    'grid__chip--end':   !isEndChip && seg.endCol > seg.startCol,
                  }
                )}
                style={{
                  background: hexToBg(color, 0.08),
                  color,
                  borderLeft: `2px solid ${color}`,
                  gridColumn: `span ${seg.endCol - seg.startCol + 1}`,
                }}
                title={seg.event.title}
              >
                {seg.event.title}
              </div>
            );
          })}
          {overflow > 0 && (
            <span className={cn('grid__more')}>+{overflow} 더보기</span>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className={cn('grid__weekdays')}>
        {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className={cn('grid')}>
        {matrix.map((_, w) => renderWeek(w))}
      </div>
    </>
  );
};

function hexToBg(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default CalendarGrid;
```

> 참고: segment를 셀별로 펼치는 방식은 CSS Grid의 `grid-column: span N` 을 사용해서 한 칩이 여러 셀에 걸치게 한다. 위 코드의 chip은 시작 셀에서만 렌더하고, span으로 너비를 늘린다. (`MonthlyEventList`의 기존 색감/스타일과는 독립이며 KTB DESIGN.md 토큰을 따른다.)

- [ ] **Step 3: 빌드 확인 & 시각 확인용 스토리 페이지 (선택)**

Run: `pnpm build`
Expected: 빌드 성공 (아직 마운트 안 됨)

- [ ] **Step 4: 커밋**

```bash
git add components/events/calendar/CalendarGrid.tsx \
        components/events/calendar/CalendarView.module.scss
git commit -m "feat(calendar): add CalendarGrid (desktop) with multi-day segments"
```

---

## Task 7: `CalendarDotGrid` (모바일)

점 캘린더 + 선택일 표시.

**Files:**
- Create: `components/events/calendar/CalendarDotGrid.tsx`
- Modify: `components/events/calendar/CalendarView.module.scss`

- [ ] **Step 1: SCSS 추가**

`CalendarView.module.scss` 끝에 추가:

```scss
.dot__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dot__cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  gap: 2px;
  cursor: pointer;
  position: relative;

  &.outside { color: #8C8F9F; }
  &.today   { background: #0043FF; color: #fff; }
  &.selected { outline: 2px solid #0043FF; outline-offset: -2px; }
  &.sun:not(.today):not(.outside) { color: #D91C29; }
  &.sat:not(.today):not(.outside) { color: #1D6CE0; }
}

.dot__dots {
  display: flex;
  gap: 1.5px;

  i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    display: inline-block;
  }
  i.plus { background: #8C8F9F; }
}
```

- [ ] **Step 2: `CalendarDotGrid.tsx` 구현**

```tsx
// components/events/calendar/CalendarDotGrid.tsx
import { useMemo } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { buildCalendarMatrix } from './utils/buildCalendarMatrix';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const MAX_DOTS = 3;

type Props = {
  year: number;
  month: number;
  events: Event[];
  selectedDate: string | null;
  onSelectDate: (dateISO: string) => void;
};

const CalendarDotGrid = ({ year, month, events, selectedDate, onSelectDate }: Props) => {
  const matrix = useMemo(() => buildCalendarMatrix(year, month), [year, month]);
  const todayISO = dayjs().format('YYYY-MM-DD');

  // events-by-date map (DATE-typed, with start date)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events
      .filter((e) =>
        e.event_time_type === 'DATE' &&
        e.use_start_date_time_yn !== 'N' &&
        e.start_date_time
      )
      .forEach((e) => {
        const start = dayjs(e.start_date_time);
        const end   = e.end_date_time ? dayjs(e.end_date_time) : start;
        let cursor = start;
        while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
          const iso = cursor.format('YYYY-MM-DD');
          if (!map.has(iso)) map.set(iso, []);
          map.get(iso)!.push(e);
          cursor = cursor.add(1, 'day');
        }
      });
    return map;
  }, [events]);

  return (
    <div className={cn('dot__grid')}>
      {matrix.flat().map((cell) => {
        const isToday = cell.date === todayISO && !cell.isOutside;
        const isSelected = cell.date === selectedDate;
        const dayEvents = eventsByDate.get(cell.date) ?? [];
        const visible = dayEvents.slice(0, MAX_DOTS);
        const overflow = dayEvents.length - visible.length;

        return (
          <div
            key={cell.date}
            className={cn('dot__cell', {
              outside: cell.isOutside,
              today: isToday,
              selected: isSelected,
              sun: cell.dow === 0,
              sat: cell.dow === 6,
            })}
            role="button"
            tabIndex={0}
            aria-label={`${cell.month}월 ${cell.day}일 행사 ${dayEvents.length}건`}
            onClick={() => onSelectDate(cell.date)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectDate(cell.date); }}
          >
            <span>{cell.day}</span>
            {(visible.length > 0 || overflow > 0) && (
              <div className={cn('dot__dots')}>
                {visible.map((e, i) => (
                  <i
                    key={`${e.id}-${i}`}
                    style={{ background: tagColor(e.tags.map((t: TagResponse) => t.tag_name)) }}
                  />
                ))}
                {overflow > 0 && <i className={cn('plus')} />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDotGrid;
```

- [ ] **Step 3: 빌드 & 커밋**

```bash
pnpm build
git add components/events/calendar/CalendarDotGrid.tsx \
        components/events/calendar/CalendarView.module.scss
git commit -m "feat(calendar): add CalendarDotGrid (mobile)"
```

---

## Task 8: `DayDetailSheet` 컴포넌트

선택일의 이벤트 목록 (데스크탑: react-modal, 모바일: 하단 시트).

**Files:**
- Create: `components/events/calendar/DayDetailSheet.tsx`
- Modify: `components/events/calendar/CalendarView.module.scss`

- [ ] **Step 1: SCSS 추가**

`CalendarView.module.scss` 끝에 추가:

```scss
.sheet__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  max-width: 480px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
}

.sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sheet__title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.012em;
}

.sheet__close {
  background: none;
  border: 0;
  font-size: 18px;
  cursor: pointer;
  color: #6C6E7E;
}

.sheet__empty {
  text-align: center;
  color: #6C6E7E;
  padding: 32px 0;
  font-size: 13px;
}

.sheet__item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F5;
  cursor: pointer;

  &:last-child { border-bottom: 0; }

  .sheet__bar { width: 3px; flex-shrink: 0; border-radius: 2px; }
  .sheet__body {
    .sheet__itemTitle { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .sheet__itemMeta  { font-size: 12px; color: #6C6E7E; }
  }
}

// mobile bottom-sheet variant
@media (max-width: 720px) {
  .sheet {
    align-self: flex-end;
    max-width: 100vw;
    width: 100vw;
    border-radius: 16px 16px 0 0;
    max-height: 70vh;
  }
  .sheet__overlay { align-items: flex-end; }
}
```

- [ ] **Step 2: `DayDetailSheet.tsx` 구현**

```tsx
// components/events/calendar/DayDetailSheet.tsx
import Modal from 'react-modal';
import dayjs from 'dayjs';
import Link from 'next/link';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  isOpen: boolean;
  selectedDate: string | null;
  events: Event[];
  onClose: () => void;
};

const DayDetailSheet = ({ isOpen, selectedDate, events, onClose }: Props) => {
  if (!selectedDate) return null;
  const d = dayjs(selectedDate);
  const dayEvents = events.filter((e) => {
    if (e.event_time_type !== 'DATE') return false;
    if (e.use_start_date_time_yn === 'N') return false;
    if (!e.start_date_time) return false;
    const start = dayjs(e.start_date_time);
    const end = e.end_date_time ? dayjs(e.end_date_time) : start;
    return (d.isSame(start, 'day') || d.isAfter(start, 'day')) &&
           (d.isSame(end, 'day')   || d.isBefore(end, 'day'));
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={cn('sheet')}
      overlayClassName={cn('sheet__overlay')}
      ariaHideApp={false}
    >
      <div className={cn('sheet__header')}>
        <span className={cn('sheet__title')}>
          {d.month() + 1}월 {d.date()}일 ({DOW[d.day()]}) · 행사 {dayEvents.length}건
        </span>
        <button type="button" className={cn('sheet__close')} aria-label="닫기" onClick={onClose}>✕</button>
      </div>

      {dayEvents.length === 0 ? (
        <div className={cn('sheet__empty')}>이 날은 등록된 행사가 없어요</div>
      ) : (
        <div>
          {dayEvents.map((e) => {
            const color = tagColor(e.tags.map((t: TagResponse) => t.tag_name));
            const start = dayjs(e.start_date_time);
            const end   = e.end_date_time ? dayjs(e.end_date_time) : start;
            const isMulti = !start.isSame(end, 'day');
            const meta = isMulti
              ? `${start.format('M/D')} ~ ${end.format('M/D')} · ${e.organizer}`
              : `${start.format('M월 D일 HH:mm')} · ${e.organizer}`;
            return (
              <Link href={`/event/detail/${e.id}`} key={e.id}>
                <a className={cn('sheet__item')}>
                  <div className={cn('sheet__bar')} style={{ background: color }} />
                  <div className={cn('sheet__body')}>
                    <div className={cn('sheet__itemTitle')}>{e.title}</div>
                    <div className={cn('sheet__itemMeta')}>{meta}</div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default DayDetailSheet;
```

- [ ] **Step 3: 빌드 & 커밋**

```bash
pnpm build
git add components/events/calendar/DayDetailSheet.tsx \
        components/events/calendar/CalendarView.module.scss
git commit -m "feat(calendar): add DayDetailSheet for selected-day events"
```

---

## Task 9: `CalendarView` 진입점

뷰포트 분기 + 선택일 상태 + 헤더/그리드/시트 조립.

**Files:**
- Create: `components/events/calendar/CalendarView.tsx`
- Modify: `components/events/calendar/CalendarView.module.scss`

- [ ] **Step 1: SCSS 추가 (컨테이너)**

`CalendarView.module.scss` 끝에 추가:

```scss
.container {
  background: #fff;
  border: 1px solid #E1E1E8;
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
}

@media (max-width: 720px) {
  .container {
    padding: 12px;
    margin: 8px 0;
  }
}
```

- [ ] **Step 2: `CalendarView.tsx` 구현**

```tsx
// components/events/calendar/CalendarView.tsx
import { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { WindowContext } from 'context/window';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import CalendarDotGrid from './CalendarDotGrid';
import DayDetailSheet from './DayDetailSheet';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const MOBILE_BREAKPOINT = 720;

type Props = {
  year: number;
  month: number;
  events: Event[];
};

const CalendarView = ({ year, month, events }: Props) => {
  const { windowX } = useContext(WindowContext);
  const isMobile = windowX > 0 && windowX <= MOBILE_BREAKPOINT;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className={cn('container')}>
      <CalendarHeader year={year} month={month} />
      {isMobile ? (
        <CalendarDotGrid
          year={year}
          month={month}
          events={events}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          events={events}
          onSelectDate={(d) => setSelectedDate(d)}
        />
      )}
      <DayDetailSheet
        isOpen={!!selectedDate}
        selectedDate={selectedDate}
        events={events}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
};

export default CalendarView;
```

- [ ] **Step 3: 빌드 & 커밋**

```bash
pnpm build
git add components/events/calendar/CalendarView.tsx \
        components/events/calendar/CalendarView.module.scss
git commit -m "feat(calendar): add CalendarView entry component with viewport split"
```

---

## Task 10: `pages/events.tsx` SSR 분기 & 토글 마운트

캘린더 컴포넌트들을 실제 페이지에 wiring.

**Files:**
- Modify: `pages/events.tsx`

- [ ] **Step 1: 현재 `pages/events.tsx` 백업하고 새 버전 작성**

```tsx
// pages/events.tsx (full replacement)
import Banner from 'components/common/banner/banner';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import LoginModal from 'components/common/modal/LoginModal';
import ScheduledEventList from 'components/events/ScheduledEventList';
import CalendarView from 'components/events/calendar/CalendarView';
import CalendarHeader from 'components/events/calendar/CalendarHeader';
import ViewToggle, { ViewMode } from 'components/events/calendar/ViewToggle';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { AuthContext } from 'context/auth';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import cookie from 'cookie';
import dayjs from 'dayjs';
import { useScheduledEvents, useMonthlyEvent } from 'lib/hooks/useSWR';
import { blockMouseScroll, isModalOpen } from 'lib/utils/windowUtil';
import { Event, EventResponse } from 'model/event';
import style from 'styles/Home.module.scss';
import React, { useEffect, useContext, useState, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

const cn = classNames.bind(style);

type ListProps = {
  view: 'list';
  isLoggedIn: boolean;
  fallbackData: EventResponse[];
};

type CalendarProps = {
  view: 'calendar';
  year: number;
  month: number;
  isLoggedIn: boolean;
  fallbackData: Event[];
};

type Props = ListProps | CalendarProps;

const Events = (props: Props) => {
  const authContext = React.useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { modalState } = useContext(WindowContext);
  const { date } = useContext(EventContext);
  const bodyRef = useRef<HTMLDivElement>(null);

  // list mode SWR
  const listSWR = useScheduledEvents(
    props.view === 'list' ? props.fallbackData : undefined
  );
  // calendar mode SWR
  const calendarSWR = useMonthlyEvent({
    param: props.view === 'calendar'
      ? { year: props.year, month: props.month }
      : { year: 1970, month: 1 }, // unused, but hook needs stable param
    fallbackData: props.view === 'calendar' ? props.fallbackData : [],
  });

  useEffect(() => {
    if (props.isLoggedIn) {
      authContext.login();
    } else {
      authContext.logout();
    }
    if (modalState.currentModal !== 0) {
      document.body.style.position = 'fixed';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.position = 'relative';
      document.body.style.overflow = 'unset';
      bodyRef.current?.removeEventListener('wheel', blockMouseScroll);
      setLoginModalIsOpen(false);
    };
  }, [props.isLoggedIn, modalState, date]);

  return (
    <main ref={bodyRef} className={cn('main')}>
      <Head>
        <title>Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!</title>
        <meta name="description" content="데브이벤트 웹에서 개발자 행사를 놓치지 마세요! 개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다." />
        <meta name="keywords" content="데브이벤트 웹, Dev Event, 데브이벤트, 개발자 행사, 용감한 친구들, 개발자, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT" />
        <meta property="og:image" content="/default/og_image.png" />
        <meta property="og:title" content="Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!" />
        <meta property="og:description" content="개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다." />
      </Head>
      {modalState.currentModal === 0 && (
        <>
          <Banner />
          <section className={cn('section')}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
              <ViewToggle current={props.view} />
            </div>
            {props.view === 'list' ? (
              <ScheduledEventList events={listSWR.scheduledEvents} isError={listSWR.isError} />
            ) : (
              <CalendarView
                year={props.year}
                month={props.month}
                events={calendarSWR.monthlyEvent ?? []}
              />
            )}
          </section>
          <Letter />
        </>
      )}
      {isModalOpen(modalState.currentModal, 1) && props.view === 'list' && (
        <FilterSearchModal events={listSWR.scheduledEvents} isError={listSWR.isError} />
      )}
      {isModalOpen(modalState.currentModal, 2) && <FilterTagModal />}
      {isModalOpen(modalState.currentModal, 3) && <FilterDateModal />}
      <LoginModal
        isOpen={loginModalIsOpen}
        onClose={() => setLoginModalIsOpen(false)}
      />
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookies = context.req.headers.cookie || '';
  const view = context.query.view === 'calendar' ? 'calendar' : 'list';

  const parsedCookies = cookies ? cookie.parse(cookies) : {};
  const isLoggedIn = Boolean(parsedCookies.access_token && parsedCookies.refresh_token);

  if (view === 'calendar') {
    const now = dayjs();
    const yearParam = Number(context.query.year);
    const monthParam = Number(context.query.month);
    const year = Number.isFinite(yearParam) && yearParam > 0 ? yearParam : now.year();
    const month = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
      ? monthParam
      : now.month() + 1;
    const res = await fetch(`${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`);
    const events = await res.json();
    return {
      props: {
        view: 'calendar' as const,
        year,
        month,
        isLoggedIn,
        fallbackData: events,
      },
    };
  }

  const res = await fetch(`${process.env.BASE_SERVER_URL}/front/v2/events/current`);
  const events = await res.json();
  return {
    props: {
      view: 'list' as const,
      isLoggedIn,
      fallbackData: events,
    },
  };
};

Events.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default Events;
```

- [ ] **Step 2: 빌드 + 타입 체크**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 3: 수동 확인**

Run: `pnpm dev`
- `http://localhost:5000/events` → 기존 리스트 그대로
- 우측에 "📋 리스트 / 📅 캘린더" 토글 보임
- 캘린더 클릭 → URL이 `?view=calendar&year=&month=` 로 바뀌고 캘린더 그리드 표시
- 리스트 클릭 → 다시 리스트로 복귀
- 모바일 (Chrome DevTools 360px) → 점 캘린더 노출
- 셀 클릭 → DayDetailSheet 열림, 카드 클릭 시 상세 페이지 이동
- 월 네비 ‹ › → URL 변경 + 데이터 페치

- [ ] **Step 4: 커밋**

```bash
git add pages/events.tsx
git commit -m "feat(events): wire calendar view toggle into /events page"
```

---

## Task 11: `pages/calender.tsx` 리디렉트

기존 `/calender?year=&month=` 북마크 보호.

**Files:**
- Modify: `pages/calender.tsx`

- [ ] **Step 1: 파일 전체 교체**

```tsx
// pages/calender.tsx (full replacement)
import { GetServerSideProps } from 'next';
import dayjs from 'dayjs';

// This page only exists for backward compatibility.
// It permanently redirects /calender?year=&month= → /events?view=calendar&year=&month=
const Calender = () => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const now = dayjs();
  const yearParam = Number(context.query.year);
  const monthParam = Number(context.query.month);
  const year = Number.isFinite(yearParam) && yearParam > 0 ? yearParam : now.year();
  const month = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
    ? monthParam
    : now.month() + 1;

  return {
    redirect: {
      destination: `/events?view=calendar&year=${year}&month=${month}`,
      permanent: false, // 307 — keep until SEO confirms safe to use 308
    },
  };
};

export default Calender;
```

- [ ] **Step 2: 빌드 & 수동 확인**

Run: `pnpm dev`
- `http://localhost:5000/calender?year=2026&month=5` 접속 → `/events?view=calendar&year=2026&month=5`로 리디렉트 확인
- `http://localhost:5000/calender` (쿼리 없음) → 현재 년/월로 리디렉트 확인

- [ ] **Step 3: 커밋**

```bash
git add pages/calender.tsx
git commit -m "feat(calender): redirect legacy /calender to /events?view=calendar"
```

---

## Task 12: 수동 QA 체크리스트 통과

전체 동작 확인 후 PR 작성 준비.

- [ ] **Step 1: dev 서버 실행**

Run: `pnpm dev`

- [ ] **Step 2: 데스크탑 (1280px) 체크리스트**

- [ ] `/events` 진입 시 기존 리스트 카드 정상
- [ ] 우측 "📅 캘린더" 클릭 → URL `?view=calendar&...` 변화, 그리드 표시
- [ ] 캘린더 그리드: 일요일 빨강, 토요일 파랑, 오늘 파란 원
- [ ] outside 셀이 회색 배경
- [ ] 다중일 이벤트(테스트 데이터에 5/14~5/16 또는 비슷한 게 있다면) 연속 막대로 표시
- [ ] 같은 날 이벤트 3개 이상 → `+N 더보기` 표시
- [ ] 셀 클릭 → `DayDetailSheet` 모달 열림
- [ ] 모달에서 이벤트 카드 클릭 → `/event/detail/{id}` 정상 이동
- [ ] ‹ › 월 네비 → URL 변경 + 데이터 갱신
- [ ] "오늘" 버튼 → 현재 월로 복귀
- [ ] "📋 리스트" 클릭 → 기존 리스트 복귀, 월 네비 사라짐

- [ ] **Step 3: 모바일 (DevTools 375px) 체크리스트**

- [ ] 점 캘린더 노출
- [ ] 셀당 점 최대 3개 + "+" 회색 점 확인
- [ ] 오늘 셀 파란 배경
- [ ] 셀 탭 → 시트가 하단에서 슬라이드 인
- [ ] 선택 셀 outline 표시
- [ ] 시트 닫기 → 그리드로 복귀

- [ ] **Step 4: 리디렉트 / 엣지 케이스**

- [ ] `/calender?year=2026&month=5` → `/events?view=calendar&year=2026&month=5`
- [ ] `/calender` (쿼리 없음) → 현재 년/월로 리디렉트
- [ ] `/events?view=calendar&year=abc&month=99` → 현재 년/월로 폴백
- [ ] 뒤로가기/앞으로가기 정상

- [ ] **Step 5: 단위 테스트 전체 재실행**

Run: `pnpm test`
Expected: 모든 utils 테스트 PASS

- [ ] **Step 6: 린트**

Run: `pnpm lint`
Expected: 에러 없음 (경고는 기존 코드 수준)

- [ ] **Step 7: 최종 PR 본문 작성용 스크린샷 캡쳐**
- 데스크탑 리스트 모드, 데스크탑 캘린더 모드, 모바일 점 캘린더, DayDetailSheet 4종

---

## 자체 점검 (writing-plans self-review)

**1. Spec 커버리지**

| Spec 결정 | 구현 위치 |
|---|---|
| D1 옵션 A 토글 | Task 4 ViewToggle, Task 10 events.tsx wiring |
| D2 모바일 점 캘린더 | Task 7 CalendarDotGrid, Task 9 CalendarView 분기 |
| D3 셀 클릭 → 시트 | Task 8 DayDetailSheet, Task 6/7 onSelectDate |
| D4 기본 리스트 | Task 10 SSR 분기 (`view !== 'calendar'` → list) |
| D5 URL 상태 | Task 4 ViewToggle, Task 5 CalendarHeader, Task 10 getServerSideProps |
| D6 필터 칩 모드 간 유지 | EventFilter 그대로 사용 (Task 10에서 ScheduledEventList 내부에 마운트 유지) |
| D7 `/calender` 리디렉트 | Task 11 |
| D8 RECRUIT 제외 | Task 3 layoutMultiDayEvents `isRenderable`, Task 7 dot grid 필터 |
| D9 다중일 연속 막대 | Task 3 segment 알고리즘, Task 6 chip span CSS |
| D10 `+N 더보기` | Task 6 overflow 처리 (데스크탑), Task 7 plus dot (모바일) |
| D11 기존 API 재사용 | Task 10 `useMonthlyEvent` 활용 |
| 단위 테스트 (buildCalendarMatrix / layoutMultiDayEvents / tagColor) | Task 1, 2, 3 |
| 6주(42칸) 고정 | Task 1 구현 명시 |
| 월 경계 이벤트 segment | Task 3 테스트 케이스 |
| dayjs `Asia/Seoul` | Task 0~3 모두 dayjs 사용 (TZ 명시는 추후 timezone 플러그인 도입 시 적용 — 현 시점은 호스트 TZ가 KST임을 전제, 별도 후속 작업 가능) |

**2. Placeholder 스캔** — "TBD", "TODO" 없음. 모든 단계에 코드/명령어/예상 결과 포함.

**3. 타입/메서드 일관성**
- `CalendarCell`: Task 1에서 정의 → Task 3, 6, 7에서 그대로 사용 ✓
- `EventSegment`: Task 3에서 정의 → Task 6에서 사용 ✓
- `useMonthlyEvent`: `lib/hooks/useSWR.tsx`의 실제 export 이름 사용 ✓
- `WindowContext.windowX`: 실제 컨텍스트 필드 일치 ✓
- `Event` 모델 필드명(`event_time_type`, `start_date_time`, `use_start_date_time_yn`) — `model/event.ts` 정의와 일치 ✓
- `tagColor` 인자: 태그명 배열로 통일 (Task 2 정의, Task 6/7/8에서 `e.tags.map(t => t.tag_name)` 으로 호출) ✓

**4. 위험/주의 사항**
- `react-modal`은 `ariaHideApp={false}`로 일단 둠 (다른 모달들도 동일 패턴). 운영 시 `Modal.setAppElement('#__next')` 처리는 별도 작업.
- `next/router`의 `shallow: true`는 같은 경로일 때만 동작 — `/events` 안의 토글이므로 OK. 다만 SSR 데이터가 SWR fallbackData로만 전달되므로 첫 토글 시 클라이언트에서 한 번 fetch 발생.
- `useMonthlyEvent` 훅이 fallbackData 인자를 매번 받지만 SWR 키가 `[year, month]`로 다르면 새로 페치하므로 동작 OK.
- Jest 셋업이 기존에 없어 Task 0이 다소 무겁다 — 팀이 향후 테스트 작성 의지가 없다면 Task 0과 utils 테스트는 건너뛰고 수동 QA로만 갈 수도 있음 (스펙 권장 사항이며 강제 아님).

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-events-calendar-view.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 각 Task마다 새 서브에이전트 dispatch + 사이 리뷰. 빠른 반복.

**2. Inline Execution** — 현재 세션에서 executing-plans로 배치 실행 + 체크포인트.

어떤 방식으로 진행하시겠어요?
