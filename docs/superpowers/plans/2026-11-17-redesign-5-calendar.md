# 리디자인 5단계 — 캘린더 보기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/events?view=calendar`의 캘린더 보기를 "행사 이름 막대 달력(PC) · 점 달력(모바일)"에서 "색 농도 달력 한 달 + 고른 날의 행사 목록" 두 칸으로 바꾼다. 필터와 검색이 달력에도 적용되게 하고, 타임라인과 오갈 때 보던 날짜를 유지한다.

**Architecture:** 색 단계·달력 칸·고를 날·방향키·하루의 두 묶음·주소 만들기는 `components/events/calendar/utils/`의 순수 함수로 빼고 테스트를 먼저 쓴다. 시간 계산과 "행사가 놓이는 날"은 3단계의 `lib/utils/timeline/`을 불러 쓰고 다시 구현하지 않는다. 화면은 `components/events/calendar/`에 새 이름의 부품(`HeatMonth`·`HeatLegend`, `DayPanel`)을 만들어 `EventCalendar` 하나로 조립하고, 마지막 작업에서 `pages/events.tsx`의 캘린더 분기가 그것을 쓰게 바꾼다. 옛 부품(`CalendarView`, `CalendarHeader`, `CalendarGrid`, `CalendarDotGrid`, `DayDetailSheet`)은 고치지 않는다. 한 달의 데이터는 지금처럼 `getServerSideProps`가 월별 조회로 받아 넘긴다. 고른 날은 주소의 `day`에, 필터는 지금과 같은 키(`tag`·`type`·`location`·`coast`·`kwd`)로 캘린더 주소에 둔다. 필터 줄·행사 카드·월 선택·빈 화면은 3단계 부품을 그대로 쓰고, 필요한 곳에만 "넘기지 않으면 지금과 같은" 선택 속성을 더한다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / jest (ts-jest)

**Spec:** `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/index.html`의 `cal`·`state` 절, 움직이는 목업 `detail-design/app.html`(`app.js`, `app.css`). 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`, 3단계가 만든 것은 `2026-11-17-redesign-3-timeline.md`와 **실제 파일**(`lib/utils/timeline/`, `components/events/timeline/`). 계획과 실제 파일이 다르면 실제 파일이 기준이다.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm start`·`pnpm dev`로 화면을 띄우지 않는다. **`pnpm build`는 작업 9에서 한 번만 돌린다**(같은 폴더의 빌드 결과물을 다른 작업이 쓰고 있다). 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다(작업 9).

## Global Constraints

- **주소·API 경로·SSR·캐시 헤더·SEO는 지금 그대로.** 주소는 `/events?view=calendar&year=&month=`, 데이터는 `getServerSideProps`가 `/front/v2/events/{year}/{month}`로 받아 `useMonthlyEvent`의 `fallbackData`로 넘긴다. `Cache-Control`, `<Head>`, `/calender` 리다이렉트(`pages/calender.tsx`)는 건드리지 않는다. 주소에 더하는 것은 선택 값 `day=YYYY-MM-DD` 하나와, 지금도 따라오던 필터 키뿐이다.
- **건수 기준은 타임라인과 같다.** 행사가 놓이는 날은 3단계의 `describeEvent(event, now).dateKey`다(접수형은 마감일, 일시형은 시작일, 진행 중은 오늘, 끝났으면 끝난 날). 여러 날에 걸친 행사를 날마다 세지 않는다. 옛 캘린더의 "접수형과 시작 시각 없는 행사는 뺀다"(`layoutMultiDayEvents.ts:16-21`, `CalendarDotGrid.tsx:28-32`, `DayDetailSheet.tsx:23-31`)는 옮기지 않는다.
- **시간은 한국 시간 벽시계.** `lib/utils/timeline/kst.ts`의 함수만 쓴다. 새 파일에서 `dayjs`·`new Date(문자열)`을 쓰지 않는다(`buildCalendarMatrix` 안의 `dayjs`는 그대로 둔다. 연·월로 만든 날짜만 다뤄 시간대와 무관하다). "지금"은 서버가 만든 `now`를 props로 받아 `useNow(now)`의 처음 값으로 쓴다(`pages/events.tsx`의 목록 분기와 같은 방식).
- 필터·검색 규칙은 다시 구현하지 않는다. `lib/utils/timeline/filters.ts`의 `readFilters`·`applyFilters`, `lib/utils/UrlUtil.tsx`의 `parseUrl`·`initUrl`을 그대로 부른다(`UrlUtil.tsx`는 고치지 않는다).
- 색은 `--de-*` 변수만. 고정 색 값은 아래만 허용한다(목업 `app.css:309-310`, `:338-339`). `HeatMonth.module.scss`의 `.month`에 지역 변수로 두고 어두운 화면 값은 `:global(html[data-theme='dark']) &`로 덮는다(3단계 `EventThumb.module.scss:22`와 같은 방식).

  | 쓰임 | 지역 변수 | 밝은 화면 | 어두운 화면 |
  |---|---|---|---|
  | 1단계(1~2건) 칸 바탕 | `--heat-1` | `#e3ebff` | `#1a2750` |
  | 2단계(3~4건) | `--heat-2` | `#b9ccff` | `#24388a` |
  | 3단계(5~7건) | `--heat-3` | `#7b9bff` | `#3558d6` |
  | 4단계(8건 이상) | `--heat-4` | `var(--de-blue)` (`#0043ff`) | `var(--de-blue)` (`#5b86ff`) |
  | 1·2단계 칸의 건수 글자 | `--heat-num` | `#3f5fc4` | `#9db6ff` |
  | 3단계 칸의 글자 | — | `#fff` | `#fff` |
  | 4단계 칸의 글자 | `--heat-on` | `#fff` | `#0b1020` |

  목업의 `--h0`(행사 없는 칸)은 `--de-surface`와 같은 값이고, 행사 없는 칸은 늘 비활성이라 바탕이 `none`이다. 따로 두지 않는다.
- 크기는 px. 내용 폭은 `de-container`. 폭이 바뀌는 자리: **1040px**(달력 칸 372 → 320px, 썸네일 264 → 200px. `@media (max-width: 1040px)`로 직접 쓴다), **860px**(`de-mobile`), **621~860px**(`de-tablet`. 두 칸을 유지한다), **620px 이하**(달력이 위, 목록이 아래. `@media (max-width: 620px)`로 직접 쓴다), **360px 이하**(`de-narrow`). 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수는 새 파일에서 쓰지 않는다.
- SCSS에서 공용 파일은 전체 파일명과 물결표, 변수 먼저: `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`
- import는 프로젝트 루트 기준 절대 경로.
- 브레이크포인트는 CSS 미디어쿼리로만. `window.innerWidth`·`WindowContext.windowX`로 갈라지는 코드를 쓰지 않는다(지금 `CalendarView.tsx:11,24`가 그렇게 해서 서버가 그린 모습과 첫 모습이 어긋난다).
- 모달 게이팅(`modalState.currentModal === 0`일 때만 본문)은 페이지에 그대로 둔다. 새 모달은 만들지 않는다.
- `prefers-reduced-motion: reduce`에서는 이 단계의 transition·animation을 끈다(`de-reduced-motion`).
- 문구는 이 계획에 적힌 그대로(해요체, 목업의 문구). **건수를 요약하는 문구를 새로 만들지 않는다.** 숫자는 목업에 있는 자리에만 둔다: 달력 칸 안의 건수, 칸에 올렸을 때의 한 줄 설명, 범례의 단계("1~2건" …), 날짜 제목 아래 한 줄, "새로 올라온 행사 N" 칩.
- `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다. `Map`·`Set`을 `[...x]`나 `for…of`로 돌리지 않는다. 소스 코드에서는 `Array.prototype.flat`도 쓰지 않는다(테스트 코드에서는 써도 된다).
- 데이터는 SWR 훅으로(`lib/hooks/useSWR.tsx`). 부품 안에서 `fetch`를 부르지 않는다.
- **3단계 파일은 "추가만" 한다.** 고칠 수 있는 3단계 파일과 범위는 작업 4·7에 적힌 것이 전부다. 더한 속성·변수를 넘기지 않으면 모양과 동작이 지금과 같아야 한다.
- 건드리지 않는 것: 배너(`components/common/banner/`. 4단계), 헤더·소식 받기·푸터, 상세 화면(`pages/event/detail/*`, `styles/EventDetail.module.scss`. 6단계가 같은 때에 다룬다), 소개 화면, 옛 캘린더 부품과 그 테스트.
- 파일을 지우지 않는다. 쓰지 않게 된 것은 이 문서 끝의 "9단계에서 지울 것"에 적는다.
- `pnpm lint`는 쓰지 않는다. 작업마다의 확인 명령은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일>`이고 `pnpm build`는 작업 9에서 한 번이다. `npx eslint`에는 **파일을 하나씩 적는다**: `components/events/calendar/utils` 폴더째로 돌리면 고치지 않는 옛 파일(`buildCalendarMatrix.ts` 등)의 포맷 오류 46개가 함께 나온다. `context/event.tsx`에는 이 단계 전부터 오류 13개(빈 함수 12, 안 쓰는 변수 1)가 있다. 테스트 파일도 `.prettierrc.cjs`의 포맷을 지킨다(이 문서의 테스트 코드는 그 포맷으로 적었다). SCSS는 `tsc`가 보지 않으므로, SCSS를 만들거나 고친 작업은 아래 명령으로 문법을 확인한다(빌드 결과물을 건드리지 않는다. 이 문서에서 "SCSS 확인"이라고 부른다).

```bash
node -e "const sass=require('sass');const imp={findFileUrl(u){return u.startsWith('~')?new URL('file://'+process.cwd()+'/'+u.slice(1)):null}};process.argv.slice(1).forEach(f=>{sass.compile(f,{importers:[imp],logger:sass.Logger.silent});console.log('ok',f)})" <scss 파일들>
```

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **달력이 화면에 붙지 않거나, 붙은 달력 안에서 풍선·테두리가 잘린다** — `position: sticky`는 두 칸 격자가 `align-items: start`가 아니거나 조상에 `overflow`가 걸리면 듣지 않는다. 목업은 붙는 칸에 `overflow-y: auto`를 걸어 두어(`app.css:314`, `:453`) 861~1040px에서 둘째·여섯째 열의 한 줄 설명이 잘리고, 네 줄짜리 달(2026년 2월)에서는 월 선택 풍선의 아래가 잘린다. 목록이 달력보다 짧은 날, 621~860px(두 칸), 620px 이하(붙지 않음)도 본다. (작업 5, 작업 8)
2. **자정, 달이 바뀌는 순간, 오래된 캐시** — `/events?view=calendar`의 HTML은 CDN에 5분+1시간 남는다. 어제 만든 HTML을 받거나 탭을 밤새 열어 두면 "오늘" 알약과 기본으로 고른 날이 어제로 그려진다. 화면이 뜬 뒤 실제 오늘로 고쳐지고 하이드레이션 경고가 없어야 한다. 서버(UTC)가 `dayjs()`로 기본 연·월을 정하던 것(`pages/events.tsx:161-169`)도 한국 시간으로 바꾼다(매달 1일 0~9시에 지난달이 열리던 문제). (작업 8)
3. **필터를 누르면 캘린더에서 튕겨 나가거나, 뒤로 가기가 날짜마다 걸린다** — `parseUrl`은 주소에 `/event`가 들어 있으면 다른 값을 모두 버리고 `/search?…`를 돌려준다(`UrlUtil.tsx:52-53`). 캘린더 주소를 그대로 넘기면 칩을 누르는 순간 검색 화면으로 나간다. 날짜를 누를 때마다 방문 기록이 쌓이면 뒤로 가기를 여러 번 눌러야 캘린더를 벗어난다. 검색어의 띄어쓰기·`&`·`+`가 주소를 오가며 깨지지 않아야 한다. (작업 3의 테스트, 작업 4, 작업 8)
4. **보기를 바꿀 때 날짜가 따라오지 않거나, 따라오면 안 될 때 따라온다** — 타임라인에서 보던 날이 캘린더에서 골라져 있고, 캘린더에서 고른 날로 타임라인이 이동해야 한다. 반대로 헤더의 "행사 일정"을 눌러 타임라인에 왔을 때나 상세에 다녀왔을 때 예전에 넘겨 둔 날짜로 튀면 안 된다. 지난 달·지난 날에서 넘어올 때(월별 조회가 끝나기 전, "지난 행사"가 접혀 있을 때)도 본다. (작업 7)
5. **달을 바꾸는 동안, 그리고 키보드** — 달 이동은 서버를 한 번 거친다(지금과 같음). 느린 연결에서 그 사이 ‹ ›를 여러 번 누르거나 옛 달의 날짜를 눌렀을 때 엉뚱한 달·날짜로 가지 않아야 한다. 방향키로 날짜를 옮긴 뒤 다시 그려지면서 포커스가 사라지지 않아야 하고, 필터 때문에 고른 날이 비었을 때도 Tab으로 달력에 들어갈 칸이 있어야 한다. (작업 5, 작업 8)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 옵션은 `app.js:1-4`, `:83`의 주석이 기준입니다(`view=cal`, `day=YYYY-MM-DD`, `info=1`, `only=new`, `q=`, `theme=dark`, `banner=none`).

| 목업 | 주소 | 실제 화면 |
|---|---|---|
| 캘린더 보기 | `app.html?view=cal#main` | `/events?view=calendar` |
| 배너 빼고 | `app.html?view=cal&banner=none#main` | (배너는 4단계라 그대로 둠) |
| 날짜를 고른 모습 | `app.html?view=cal&day=2026-11-20&banner=none#main` | `/events?view=calendar&year=2026&month=11&day=2026-11-20` |
| 지난 날짜 | `app.html?view=cal&day=2026-11-06&banner=none#main` | `…&day=2026-11-06` |
| (i)를 누른 모습 | `app.html?view=cal&info=1&banner=none#main` | 달력 제목 옆 (i) 누름 |
| 새 행사만 | `app.html?view=cal&only=new&banner=none#main` | "새로 올라온 행사" 누름 |
| 어두운 화면 | `app.html?view=cal&theme=dark#main`, `app.html?view=cal&info=1&theme=dark&banner=none#main` | 헤더의 테마 버튼 |
| 빈 달 | `app.html?view=cal&banner=none#main`에서 ›를 두 번(2027년 1월) | 행사가 없는 달 |
| 필터로 빈 날 | `app.html?view=cal&day=2026-11-14&banner=none#main`에서 그날 행사에 없는 주제의 칩 | 날짜를 고른 뒤 맞지 않는 칩을 누름 |

목업의 변수 `--bg`, `--ink`, `--sub` …는 실제 코드에서 `--de-bg`, `--de-ink`, `--de-sub` …입니다. 목업의 `--h1`~`--h4`, `--h-num`은 Global Constraints의 지역 변수입니다.

목업은 "지금"이 2026-11-13 10:00으로 고정되어 있고 11~12월 데이터만 있습니다. 스냅샷 기준으로 11월 6일 11건, 13일 6건(접수 마감 4, 열림 2), 20일 10건(접수 마감 9, 열림 1)입니다.

---

## File Structure

**새로 만드는 파일**

- `components/events/calendar/utils/calendarMonth.ts` — 색 단계, 범례 문구, 달력 칸(줄·건수·오늘·읽어 주는 문구)
- `components/events/calendar/utils/calendarDay.ts` — 달을 열었을 때 고를 날, 방향키로 갈 날, 앞뒤 행사일, 하루의 두 묶음, 날짜 제목 아래 문구
- `components/events/calendar/utils/calendarUrl.ts` — 캘린더 주소 읽기·만들기, 보기 전환의 주소
- `components/events/calendar/utils/buildCalendarView.ts` — 위의 것을 모아 화면에 필요한 값 한 벌을 만든다
- `components/events/calendar/utils/__tests__/` — `calendarMonth.test.ts`, `calendarDay.test.ts`, `calendarUrl.test.ts`, `buildCalendarView.test.ts`
- `components/events/calendar/` — 부품마다 `Foo.tsx`와 `Foo.module.scss`
  - `HeatMonth`(달력 한 달), `HeatLegend`((i) 풍선)
  - `DayPanel`(고른 날의 행사)
  - `EventCalendar`(조립)

**고치는 파일**

- 3단계 파일에 "추가만"(작업 4): `components/events/timeline/EventCard.module.scss`, `TimelineEmpty.module.scss`, `TimelineIcon.tsx`, `MonthPicker.tsx`, `FilterBar.tsx`, `FilterBar.module.scss`, `lib/hooks/useSWR.tsx`
- 보기 전환(작업 7): `components/events/calendar/ViewToggle.tsx`, `context/event.tsx`, `components/events/timeline/DateNav.tsx`, `EventTimeline.tsx`
- `pages/events.tsx`(작업 8)

**고치지 않고 두는 파일** (쓰는 곳이 없어짐. 문서 끝 "9단계에서 지울 것"): `components/events/calendar/CalendarView.tsx`·`CalendarHeader.tsx`·`CalendarGrid.tsx`·`CalendarDotGrid.tsx`·`DayDetailSheet.tsx`·`CalendarView.module.scss`, `utils/layoutMultiDayEvents.ts`·`tagColor.ts`와 그 테스트. `utils/buildCalendarMatrix.ts`와 그 테스트는 **그대로 쓴다**.

**작업 순서와 같은 파일을 고치는 작업이 겹치지 않는지**

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 색 단계, 달력 칸 (순수 함수) | — |
| 2 | 고를 날, 방향키, 하루의 두 묶음 (순수 함수) | — |
| 3 | 주소 읽기·만들기, 화면 값 조립 (순수 함수) | — |
| 4 | 3단계 부품에 선택 속성 더하기 | `EventCard.module.scss`, `TimelineEmpty.module.scss`, `TimelineIcon.tsx`, `MonthPicker.tsx`, `FilterBar.*`, `useSWR.tsx` |
| 5 | 달력 한 달, (i) 풍선 | — |
| 6 | 고른 날의 행사 | — |
| 7 | 보기 전환에서 날짜 넘겨주기 | `ViewToggle.tsx`, `context/event.tsx`, `DateNav.tsx`, `EventTimeline.tsx` |
| 8 | 조립, `/events?view=calendar` 바꾸기 | `pages/events.tsx` |
| 9 | 전체 확인 (`pnpm build` 한 번) | — |

작업 1~6이 끝난 상태에서는 화면이 예전 그대로입니다(새 부품은 아직 어디에도 걸리지 않고, 작업 4가 더한 속성은 넘기는 곳이 없습니다). 작업 7 뒤에는 보기 전환이 날짜를 넘기지만 캘린더는 옛 모양이라 `day`를 읽지 않습니다(동작에는 문제가 없습니다). 작업 8 뒤에 캘린더 보기가 새 모양입니다.

---

### Task 1: 색 단계 · 달력 칸 (순수 함수)

목업 기준: `app.js:250`의 `heat`, `:252-257`의 범례 문구, `:258-264`의 `calMonth`(칸의 건수·`aria-label`·`data-tip`).

**Files:**
- Create: `components/events/calendar/utils/calendarMonth.ts`
- Create: `components/events/calendar/utils/__tests__/calendarMonth.test.ts`

**Interfaces:**
- Consumes: `buildCalendarMatrix`·`CalendarCell`(`components/events/calendar/utils/buildCalendarMatrix.ts`. 고치지 않는다), `DOW`(`lib/utils/timeline/kst.ts`)
- Produces:

```ts
export type HeatLevel = 0 | 1 | 2 | 3 | 4;
export const HEAT_STEPS: readonly number[];                 // [2, 4, 7]. 색 단계의 기준은 이 한 곳에서만 바꾼다
export const heatLevel: (count: number, steps?: readonly number[]) => HeatLevel;
export const heatLegend: (steps?: readonly number[]) => string[];   // ['1~2건', '3~4건', '5~7건', '8건 이상']

export interface MonthCell {
  key: string;        // 'YYYY-MM-DD'
  day: number;        // 1~31
  weekday: number;    // 0=일 … 6=토
  inMonth: boolean;   // 이 달의 날인지. 아니면 빈칸으로 그린다
  count: number;      // 그날 놓인 행사 수 (빈칸은 0)
  level: HeatLevel;
  isToday: boolean;
  isPast: boolean;
  label: string;      // 읽어 주는 문구: '11월 20일 금요일, 행사 10건' (오늘이면 뒤에 ', 오늘'). 빈칸은 ''
  tip: string;        // 올렸을 때의 한 줄: '11월 20일 금요일 · 행사 10건'. 0건이면 ''
}
export const formatKoDay: (key: string) => string;          // '11월 20일'
export const buildMonthCells: (
  year: number,
  month: number,                      // 1~12
  counts: Record<string, number>,     // 날짜 키 → 건수 (3단계의 countByDay 결과)
  todayKey: string
) => MonthCell[][];                   // 한 줄에 7칸. 일요일부터
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `heatLevel`: `count`가 0 이하이거나 숫자가 아니면 0. `steps`를 넘기지 않으면 `HEAT_STEPS`.
- `heatLegend`: 아래 끝과 위 끝이 같으면 `'1건'`처럼 하나만 적는다.
- `buildMonthCells`: `buildCalendarMatrix(year, month)`(6줄)에서 **이 달의 날이 하나도 없는 줄은 뺀다**(목업은 그 달의 날만 그린다. 4~6줄). 다른 달의 날은 `inMonth: false`, 건수 0, `isToday`·`isPast` 거짓, `label`·`tip` 빈 문자열.
- 날짜 키의 비교는 문자열 비교(`key < todayKey`)로 한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/events/calendar/utils/__tests__/calendarMonth.test.ts`

```ts
import {
  buildMonthCells,
  formatKoDay,
  HEAT_STEPS,
  heatLegend,
  heatLevel,
  MonthCell,
} from 'components/events/calendar/utils/calendarMonth';

const TODAY = '2026-11-13'; // 금요일. 목업의 고정 날짜와 같다

describe('색 단계', () => {
  it('기준은 2·4·7건이다 (2026-11-13 데이터에 맞춘 값)', () => {
    expect(HEAT_STEPS).toEqual([2, 4, 7]);
  });

  it('0건은 0, 1~2건은 1, 3~4건은 2, 5~7건은 3, 8건 이상은 4단계', () => {
    expect([0, 1, 2, 3, 4, 5, 7, 8, 11].map((n) => heatLevel(n))).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4,
    ]);
  });

  it('범례의 문구는 기준에서 만든다', () => {
    expect(heatLegend()).toEqual(['1~2건', '3~4건', '5~7건', '8건 이상']);
  });

  it('기준을 바꾸면 단계와 범례가 함께 바뀐다', () => {
    expect(heatLevel(3, [3, 6, 10])).toBe(1);
    expect(heatLevel(11, [3, 6, 10])).toBe(4);
    expect(heatLegend([3, 6, 10])).toEqual([
      '1~3건',
      '4~6건',
      '7~10건',
      '11건 이상',
    ]);
    expect(heatLegend([1, 2, 3])).toEqual(['1건', '2건', '3건', '4건 이상']);
  });
});

describe('buildMonthCells', () => {
  // 목업 스냅샷의 11월 6일(11건), 13일(6건), 14일(1건), 20일(10건)
  const counts = {
    '2026-11-06': 11,
    '2026-11-13': 6,
    '2026-11-14': 1,
    '2026-11-20': 10,
    '2026-12-02': 2,
  };
  const weeks = buildMonthCells(2026, 11, counts, TODAY);
  const cell = (key: string): MonthCell =>
    weeks.flat().filter((c) => c.key === key)[0];

  it('2026년 11월은 다섯 줄이다 (1일이 일요일. 이 달의 날이 없는 줄은 뺀다)', () => {
    expect(weeks).toHaveLength(5);
    weeks.forEach((week) => expect(week).toHaveLength(7));
    expect(weeks[0][0].key).toBe('2026-11-01');
    expect(weeks[0][0].weekday).toBe(0);
    expect(weeks[4][1].key).toBe('2026-11-30');
  });

  it('줄 수는 달마다 다르다', () => {
    expect(buildMonthCells(2026, 2, {}, TODAY)).toHaveLength(4);
    expect(buildMonthCells(2026, 8, {}, TODAY)).toHaveLength(6);
    expect(buildMonthCells(2026, 12, {}, TODAY)).toHaveLength(5);
  });

  it('다른 달의 날은 빈칸이다 (건수가 있어도 세지 않는다)', () => {
    const dec2 = cell('2026-12-02');
    expect(dec2.inMonth).toBe(false);
    expect(dec2.count).toBe(0);
    expect(dec2.level).toBe(0);
    expect(dec2.label).toBe('');
    expect(dec2.tip).toBe('');
  });

  it('칸마다 건수와 색 단계', () => {
    expect(cell('2026-11-06')).toMatchObject({ day: 6, count: 11, level: 4 });
    expect(cell('2026-11-13')).toMatchObject({ day: 13, count: 6, level: 3 });
    expect(cell('2026-11-14')).toMatchObject({ day: 14, count: 1, level: 1 });
    expect(cell('2026-11-02')).toMatchObject({ day: 2, count: 0, level: 0 });
  });

  it('오늘과 지난 날', () => {
    expect(cell('2026-11-12')).toMatchObject({ isToday: false, isPast: true });
    expect(cell('2026-11-13')).toMatchObject({ isToday: true, isPast: false });
    expect(cell('2026-11-14')).toMatchObject({ isToday: false, isPast: false });
  });

  it('읽어 주는 문구와 올렸을 때의 한 줄 설명', () => {
    expect(cell('2026-11-20').label).toBe('11월 20일 금요일, 행사 10건');
    expect(cell('2026-11-20').tip).toBe('11월 20일 금요일 · 행사 10건');
    expect(cell('2026-11-13').label).toBe('11월 13일 금요일, 행사 6건, 오늘');
    expect(cell('2026-11-02').label).toBe('11월 2일 월요일, 행사 0건');
    expect(cell('2026-11-02').tip).toBe('');
  });
});

describe('formatKoDay', () => {
  it("날짜 키를 'N월 N일'로 적는다", () => {
    expect(formatKoDay('2026-11-20')).toBe('11월 20일');
    expect(formatKoDay('2026-12-02')).toBe('12월 2일');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- calendarMonth`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `calendarMonth.ts`를 구현한다.** `dayjs`를 직접 부르지 않는다(`buildCalendarMatrix`가 준 `date`·`day`·`dow`·`isOutside`만 쓴다).

- [ ] **Step 4: 확인**

Run: `pnpm test -- components/events/calendar && npx tsc --noEmit && npx eslint components/events/calendar/utils/calendarMonth.ts components/events/calendar/utils/__tests__/calendarMonth.test.ts`
Expected: PASS (calendarMonth 11개. 옛 테스트 `buildCalendarMatrix`·`layoutMultiDayEvents`·`tagColor`도 그대로 통과), 타입·린트 오류 없음

Run: `TZ=UTC pnpm test -- calendarMonth && TZ=America/Los_Angeles pnpm test -- calendarMonth`
Expected: 같은 결과(시간대가 달라도 통과)

관리자가 화면에서 볼 것: 없음.

---

### Task 2: 고를 날 · 방향키 · 하루의 두 묶음 (순수 함수)

목업 기준: `app.js:296-301`의 `setMonth`(달을 바꿨을 때 고를 날), `:551-558`(방향키), `:270-283`의 `calDay`(앞뒤 행사일, 두 묶음, 제목 아래 한 줄, 빈 날의 버튼).

**Files:**
- Create: `components/events/calendar/utils/calendarDay.ts`
- Create: `components/events/calendar/utils/__tests__/calendarDay.test.ts`

**Interfaces:**
- Consumes: `TimelineEvent`·`describeEvent`(`lib/utils/timeline/describeEvent.ts`), `addDays`(`lib/utils/timeline/kst.ts`), `formatKoDay`(Task 1)
- Produces. `keys`는 늘 "이 달에서 (필터를 건 뒤) 행사가 있는 날"을 오름차순으로 늘어놓은 배열이다.

```ts
export const pickDefaultDay: (keys: string[], monthKey: string, todayKey: string) => string | null;
export const resolveDay: (opts: {
  wanted: string | null;    // 주소의 day (이 달의 날짜이거나 null)
  keys: string[];
  monthKey: string;         // 'YYYY-MM'
  todayKey: string;
}) => string | null;
export const moveByArrow: (keys: string[], from: string, arrow: string) => string | null;   // arrow: KeyboardEvent.key
export const neighborDays: (keys: string[], key: string) => { prev: string | null; next: string | null };

export type DaySectionId = 'deadline' | 'open';
export interface DaySection {
  id: DaySectionId;
  title: string;
  items: TimelineEvent[];
}
export const splitDay: (items: TimelineEvent[], key: string, todayKey: string) => DaySection[];
export const daySummary: (sections: DaySection[], isPast: boolean) => string;
export const emptyDayAction: (prev: string | null, next: string | null) => { key: string; label: string } | null;
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `pickDefaultDay`(목업 `setMonth`와 같다): 행사가 없으면 `null`. 이번 달이 아니면 첫 행사일. 이번 달이면 오늘(행사가 있을 때) → 오늘 뒤의 첫 행사일 → 그것도 없으면 이 달의 첫 행사일.
- `resolveDay`: `keys`가 비어 있으면 `null`(빈 달 안내를 그린다). `wanted`가 이 달의 날짜면 **그날 행사가 없어도** 그대로 돌려준다(필터 때문에 고른 날이 빈 모습을 그린다). 그 밖에는 `pickDefaultDay`.
- `moveByArrow`: `ArrowLeft` −1일, `ArrowRight` +1일, `ArrowUp` −7일, `ArrowDown` +7일. 가려는 날에 행사가 없으면 **그 방향으로** 가장 가까운 행사 있는 날(앞으로 갈 때는 가려는 날 이후의 첫 날, 뒤로 갈 때는 가려는 날 이전의 마지막 날). 없으면 `null`. 방향키가 아니어도 `null`. `from`이 `keys`에 없어도 된다.
- `splitDay`: 접수형(`event.event_time_type === 'RECRUIT'`)은 `'deadline'`, 나머지는 `'open'`. 받은 순서를 지킨다. 빈 묶음은 넣지 않는다. 제목은 목업 `app.js:280` 그대로:
  - `'deadline'`: 지난 날이면 `'이날 접수를 마감했어요'`, 아니면 `'이날 접수를 마감해요'`
  - `'open'`: 지난 날이면 `'이날 열렸어요'`, 오늘이면 `'오늘 열리거나 진행 중이에요'`, 그 밖에는 `'이날 열려요'`
- `daySummary`(목업 `app.js:277`): 묶음이 없으면 `'등록된 행사가 없어요'`. 있으면 `'접수 마감 N건'`과 `'열리는 행사 N건'`(지난 날은 `'열린 행사 N건'`)을 ` · `로 잇는다.
- `emptyDayAction`(목업 `app.js:281`): 다음 행사일이 있으면 `'다음 행사가 있는 11월 21일 보기'`, 없고 이전 행사일이 있으면 `'이전 행사가 있는 11월 6일 보기'`, 둘 다 없으면 `null`.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/events/calendar/utils/__tests__/calendarDay.test.ts`

```ts
import {
  daySummary,
  emptyDayAction,
  moveByArrow,
  neighborDays,
  pickDefaultDay,
  resolveDay,
  splitDay,
} from 'components/events/calendar/utils/calendarDay';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일
const TODAY = '2026-11-13';
// 이 달에서 행사가 있는 날
const KEYS = [
  '2026-11-06',
  '2026-11-13',
  '2026-11-14',
  '2026-11-20',
  '2026-11-30',
];

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
  start_date_time: '2026-11-01T00:00',
  end_day_week: '수',
  end_date_time: '2026-11-20T17:00',
  tags: [],
  create_date_time: '2026-10-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});
const item = (over: Partial<Event>) => describeEvent(ev(over), NOW);
const ids = (section: { items: { event: Event }[] }) =>
  section.items.map((i) => i.event.id);

describe('pickDefaultDay — 달을 열었을 때 고를 날', () => {
  it('이번 달이고 오늘 행사가 있으면 오늘', () => {
    expect(pickDefaultDay(KEYS, '2026-11', TODAY)).toBe('2026-11-13');
  });

  it('오늘 행사가 없으면 오늘 뒤의 첫 행사일', () => {
    expect(pickDefaultDay(KEYS, '2026-11', '2026-11-15')).toBe('2026-11-20');
  });

  it('오늘 뒤에 행사가 없으면 이 달의 첫 행사일', () => {
    expect(pickDefaultDay(['2026-11-06', '2026-11-10'], '2026-11', TODAY)).toBe(
      '2026-11-06'
    );
  });

  it('다른 달이면 그 달의 첫 행사일', () => {
    expect(pickDefaultDay(['2026-12-02', '2026-12-03'], '2026-12', TODAY)).toBe(
      '2026-12-02'
    );
    expect(pickDefaultDay(['2026-10-05', '2026-10-20'], '2026-10', TODAY)).toBe(
      '2026-10-05'
    );
  });

  it('행사가 없는 달이면 고른 날이 없다', () => {
    expect(pickDefaultDay([], '2026-11', TODAY)).toBeNull();
  });
});

describe('resolveDay — 주소의 날짜와 기본 날짜', () => {
  const base = { keys: KEYS, monthKey: '2026-11', todayKey: TODAY };

  it('주소의 날짜가 이 달이면 그날을 고른다', () => {
    expect(resolveDay({ ...base, wanted: '2026-11-20' })).toBe('2026-11-20');
  });

  it('필터 때문에 그날 행사가 없어도 그대로 둔다', () => {
    expect(resolveDay({ ...base, wanted: '2026-11-12' })).toBe('2026-11-12');
  });

  it('주소에 날짜가 없거나 다른 달의 날짜면 기본 날짜', () => {
    expect(resolveDay({ ...base, wanted: null })).toBe('2026-11-13');
    expect(resolveDay({ ...base, wanted: '2026-12-02' })).toBe('2026-11-13');
  });

  it('이 달에 행사가 하나도 없으면 고른 날이 없다', () => {
    expect(resolveDay({ ...base, keys: [], wanted: '2026-11-12' })).toBeNull();
  });
});

describe('moveByArrow — 방향키로 갈 날', () => {
  it('좌우는 하루. 행사 없는 날은 건너뛴다', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowRight')).toBe('2026-11-14');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowRight')).toBe('2026-11-20');
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowLeft')).toBe('2026-11-06');
  });

  it('위아래는 한 주. 그날 행사가 없으면 그 방향으로 가장 가까운 날', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowDown')).toBe('2026-11-20');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowDown')).toBe('2026-11-30');
    expect(moveByArrow(KEYS, '2026-11-20', 'ArrowUp')).toBe('2026-11-13');
    expect(moveByArrow(KEYS, '2026-11-14', 'ArrowUp')).toBe('2026-11-06');
  });

  it('그 방향에 행사 있는 날이 없으면 움직이지 않는다', () => {
    expect(moveByArrow(KEYS, '2026-11-30', 'ArrowRight')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-30', 'ArrowDown')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-06', 'ArrowLeft')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-13', 'ArrowUp')).toBe('2026-11-06');
    expect(moveByArrow(KEYS, '2026-11-06', 'ArrowUp')).toBeNull();
    expect(moveByArrow([], '2026-11-13', 'ArrowRight')).toBeNull();
  });

  it('방향키가 아니면 움직이지 않는다', () => {
    expect(moveByArrow(KEYS, '2026-11-13', 'Enter')).toBeNull();
    expect(moveByArrow(KEYS, '2026-11-13', 'Tab')).toBeNull();
  });
});

describe('neighborDays — 날짜 제목 옆 ‹ ›', () => {
  it('앞뒤의 행사 있는 날', () => {
    expect(neighborDays(KEYS, '2026-11-14')).toEqual({
      prev: '2026-11-13',
      next: '2026-11-20',
    });
  });

  it('끝에서는 없다', () => {
    expect(neighborDays(KEYS, '2026-11-06').prev).toBeNull();
    expect(neighborDays(KEYS, '2026-11-30').next).toBeNull();
  });

  it('고른 날에 행사가 없어도(필터) 앞뒤를 찾는다', () => {
    expect(neighborDays(KEYS, '2026-11-12')).toEqual({
      prev: '2026-11-06',
      next: '2026-11-13',
    });
  });
});

describe('splitDay — 하루의 두 묶음', () => {
  const recruitA = item({ id: 'a', end_date_time: '2026-11-20T17:00' });
  const recruitB = item({ id: 'b', end_date_time: '2026-11-20T23:59' });
  const open = item({
    id: 'c',
    event_time_type: 'DATE',
    start_date_time: '2026-11-20T19:00',
    end_date_time: '2026-11-20T21:00',
  });

  it('접수형과 일시형으로 나눈다. 받은 순서는 그대로', () => {
    const sections = splitDay([recruitA, open, recruitB], '2026-11-20', TODAY);
    expect(sections.map((s) => s.id)).toEqual(['deadline', 'open']);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '이날 열려요',
    ]);
    expect(ids(sections[0])).toEqual(['a', 'b']);
    expect(ids(sections[1])).toEqual(['c']);
  });

  it('오늘이면 "오늘 열리거나 진행 중이에요"', () => {
    const sections = splitDay([recruitA, open], TODAY, TODAY);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '오늘 열리거나 진행 중이에요',
    ]);
  });

  it('지난 날이면 "마감했어요", "열렸어요"', () => {
    const sections = splitDay([recruitA, open], '2026-11-06', TODAY);
    expect(sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감했어요',
      '이날 열렸어요',
    ]);
  });

  it('한쪽만 있으면 그 묶음만, 없으면 빈 배열', () => {
    expect(splitDay([open], '2026-11-20', TODAY).map((s) => s.id)).toEqual([
      'open',
    ]);
    expect(splitDay([], '2026-11-20', TODAY)).toEqual([]);
  });
});

describe('daySummary · emptyDayAction — 목업의 문구', () => {
  const recruit = item({ id: 'a' });
  const open = item({
    id: 'c',
    event_time_type: 'DATE',
    start_date_time: '2026-11-20T19:00',
    end_date_time: '2026-11-20T21:00',
  });

  it('날짜 제목 아래 한 줄', () => {
    const both = splitDay([recruit, recruit, open], '2026-11-20', TODAY);
    expect(daySummary(both, false)).toBe('접수 마감 2건 · 열리는 행사 1건');
    expect(daySummary(both, true)).toBe('접수 마감 2건 · 열린 행사 1건');
    expect(daySummary(splitDay([open], '2026-11-20', TODAY), false)).toBe(
      '열리는 행사 1건'
    );
    expect(daySummary([], false)).toBe('등록된 행사가 없어요');
  });

  it('고른 날이 비었을 때의 버튼: 다음 날이 먼저, 없으면 이전 날', () => {
    expect(emptyDayAction('2026-11-06', '2026-11-21')).toEqual({
      key: '2026-11-21',
      label: '다음 행사가 있는 11월 21일 보기',
    });
    expect(emptyDayAction('2026-11-06', null)).toEqual({
      key: '2026-11-06',
      label: '이전 행사가 있는 11월 6일 보기',
    });
    expect(emptyDayAction(null, null)).toBeNull();
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- calendarDay`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `calendarDay.ts`를 구현한다.** 날짜 더하기는 `addDays`, 비교는 날짜 키의 문자열 비교.

- [ ] **Step 4: 확인**

Run: `pnpm test -- components/events/calendar && npx tsc --noEmit && npx eslint components/events/calendar/utils/calendarDay.ts components/events/calendar/utils/__tests__/calendarDay.test.ts`
Expected: PASS (calendarDay 22개), 타입·린트 오류 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 3: 주소 읽기·만들기 · 화면 값 조립 (순수 함수)

목업 기준: `app.js:284-288`의 `calHtml`(걸러진 행사로 건수를 센다), `:302-309`의 `setView`(보기를 바꿀 때 날짜를 넘긴다). 주소 규칙은 목업에 없다. 지금 코드(`ViewToggle.tsx:16-33`, `UrlUtil.tsx`, `lib/utils/timeline/filters.ts`)가 기준이다.

**Files:**
- Create: `components/events/calendar/utils/calendarUrl.ts`, `components/events/calendar/utils/buildCalendarView.ts`
- Create: `components/events/calendar/utils/__tests__/calendarUrl.test.ts`, `components/events/calendar/utils/__tests__/buildCalendarView.test.ts`

**Interfaces:**
- Consumes: Task 1·2의 것. 3단계의 `readMonthParam`·`monthKey`·`MonthParam`(`dateStrip.ts`), `dayKey`·`keyToMs`·`parseNaive`(`kst.ts`), `TimelineFilters`·`applyFilters`(`filters.ts`), `toTimeline`·`groupByDay`·`countByDay`·`countNew`(`groupByDay.ts`), `Event`
- Produces (`calendarUrl.ts`):

```ts
export type UrlQuery = Record<string, string | string[] | undefined>;   // router.query를 그대로 넘길 수 있다
export interface CalendarTarget {
  year: number;
  month: number;            // 1~12
  day?: string | null;      // 고른 날. 없으면 주소에 넣지 않는다
}

// 주소의 필터만 뽑아 목록 화면의 주소로 만든다. 필터가 없으면 '/events', 있으면 '/search?tag=…&type=…&location=…&coast=…&kwd=…'
export const listPathOf: (query: UrlQuery) => string;
// 주소의 day가 보고 있는 달의 실제 날짜일 때만 돌려준다
export const readDayParam: (query: UrlQuery, year: number, month: number) => string | null;
// '/events?view=calendar&year=2026&month=11[&day=2026-11-20][&목록 화면 주소의 필터]'
export const calendarHref: (target: CalendarTarget, listPath: string) => string;
export const shiftMonth: (year: number, month: number, delta: number) => MonthParam;
// 보기 전환: 타임라인 → 캘린더
export const toCalendarHref: (opts: { query: UrlQuery; dayKey?: string | null; todayKey: string }) => string;
// 보기 전환: 캘린더 → 타임라인
export const toTimelineHref: (opts: { query: UrlQuery; todayKey: string }) => string;
```

- Produces (`buildCalendarView.ts`):

```ts
export interface CalendarViewModel {
  todayKey: string;
  monthKey: string;              // 'YYYY-MM'
  weeks: MonthCell[][];          // 달력 칸 (필터·새 행사만을 건 뒤의 건수)
  keys: string[];                // 이 달에서 행사가 있는 날 (오름차순)
  selectedKey: string | null;    // 고른 날. 이 달에 맞는 행사가 없으면 null
  isPastDay: boolean;            // 고른 날이 오늘보다 앞인지
  prevKey: string | null;        // 앞의 행사 있는 날 (이 달 안에서)
  nextKey: string | null;
  sections: DaySection[];        // 고른 날의 묶음. 그날 행사가 없으면 []
  summary: string;               // 날짜 제목 아래 한 줄
  newCount: number;              // "새로 올라온 행사 N"의 N
}
export const buildCalendarView: (input: {
  events: Event[];               // 월별 조회의 응답
  filters: TimelineFilters;
  newOnly: boolean;
  year: number;
  month: number;
  wanted: string | null;         // readDayParam의 결과
  now: string;                   // 'YYYY-MM-DDTHH:mm' (한국 시간)
}) => CalendarViewModel;
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `listPathOf`: 순서는 `tag`(여러 개) → `type` → `location` → `coast` → `kwd`. 값은 모두 `encodeURIComponent`로 넣는다. `tag` 말고는 배열로 와도 첫 값만 쓴다. 문자열이 아니거나 빈 값은 뺀다. 다른 키(`view`, `year`, `month`, `day` …)는 보지 않는다.
  - **필터가 없을 때 `/search`가 아니라 `/events`를 돌려주는 이유:** `parseUrl('/search', 'tag', 'AI', [])`는 `/search&tag=AI`라는 깨진 주소를 만든다(`UrlUtil.tsx:89`). `/events`를 넘기면 `UrlUtil.tsx:52-53`의 분기로 `/search?tag=AI`가 나온다.
  - **`router.asPath`가 아니라 `router.query`에서 만드는 이유:** 보기 전환은 `router.push({ pathname, query })`로 가는데 이때 Next가 띄어쓰기를 `+`로 적는다. `readFilters`는 `decodeURIComponent`로 읽어 `+`를 띄어쓰기로 되돌리지 못한다. `router.query`는 Next가 이미 풀어 준 값이다.
- `readDayParam`: `YYYY-MM-DD` 형식이고 실제로 있는 날짜이며(`2026-11-31`은 버린다) 그 달일 때만.
- `calendarHref`: `listPath`의 경로가 `/search`일 때만 `?` 뒤를 그대로 붙인다(다시 인코딩하지 않는다. `parseUrl`이 만든 주소를 그대로 받는다).
- `toCalendarHref`: `dayKey`가 올바른 날짜면 **그 날짜의 연·월**을 열고 `day`로 넣는다(주소의 `year`·`month`보다 먼저다. 타임라인은 스크롤로 다음 달까지 내려갈 수 있다). `dayKey`가 없으면 주소의 `year`·`month`(`readMonthParam`), 그것도 없으면 `todayKey`의 달. 필터는 `listPathOf(query)`로 따라간다.
- `toTimelineHref`: 필터가 있으면 `listPathOf(query)`(`/search?…`). 없으면 보고 있던 달이 이번 달보다 앞일 때만 `/events?year=&month=`(3단계의 "다른 달 보기"), 그 밖에는 `/events`.
- `buildCalendarView`:
  1. `events`에 필터를 걸고(`applyFilters`) `toTimeline`으로 바꾼 뒤, **`dateKey`가 이 달인 것만** 남긴다. `newOnly`면 `isNew`만 남긴다.
  2. `groupByDay`로 묶는다(같은 날 안의 순서가 타임라인과 같아진다). `keys`는 묶음의 키, 칸의 건수는 `countByDay`.
  3. `selectedKey = resolveDay({ wanted, keys, monthKey, todayKey })`. 고른 날의 묶음을 `splitDay`로 나눈다.
  4. `newCount`는 **필터를 걸지 않은** `events` 가운데 이 달에 놓이는 새 행사 수다(3단계의 `newCount`가 필터와 무관한 것과 같다).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/events/calendar/utils/__tests__/calendarUrl.test.ts`

```ts
import {
  calendarHref,
  listPathOf,
  readDayParam,
  shiftMonth,
  toCalendarHref,
  toTimelineHref,
} from 'components/events/calendar/utils/calendarUrl';
import { readFilters } from 'lib/utils/timeline/filters';
import { initUrl, parseUrl } from 'lib/utils/UrlUtil';

const enc = encodeURIComponent;
const TODAY = '2026-11-13';
const CAL = { view: 'calendar', year: '2026', month: '11' };

describe('listPathOf — 주소의 필터를 목록 화면 주소로', () => {
  it('필터가 없으면 /events (보기·연·월·날짜는 필터가 아니다)', () => {
    expect(listPathOf({})).toBe('/events');
    expect(listPathOf({ ...CAL, day: '2026-11-20' })).toBe('/events');
  });

  it('필터를 정해진 순서(tag, type, location, coast, kwd)로 적는다', () => {
    expect(
      listPathOf({
        ...CAL,
        kwd: '카카오 테크',
        coast: '무료',
        location: '온라인',
        type: '대회',
        tag: ['AI', '클라우드'],
      })
    ).toBe(
      `/search?tag=AI&tag=${enc('클라우드')}&type=${enc('대회')}` +
        `&location=${enc('온라인')}&coast=${enc('무료')}&kwd=${enc(
          '카카오 테크'
        )}`
    );
  });

  it('태그가 하나면 문자열로 온다. 빈 값은 뺀다', () => {
    expect(listPathOf({ tag: 'AI' })).toBe('/search?tag=AI');
    expect(listPathOf({ tag: '', kwd: '' })).toBe('/events');
  });

  it('만든 주소를 readFilters가 그대로 읽는다', () => {
    const path = listPathOf({
      ...CAL,
      tag: ['AI', '대회/공모전'],
      coast: '무료',
      kwd: 'C++ & Rust 50%',
    });
    expect(readFilters(path)).toEqual({
      tags: ['AI', '대회/공모전'],
      coast: '무료',
      kwd: 'C++ & Rust 50%',
    });
  });

  it('필터 줄이 쓰는 parseUrl·initUrl에 넣으면 지금과 같은 주소가 나온다', () => {
    expect(parseUrl(listPathOf(CAL), 'tag', 'AI', [])).toBe('/search?tag=AI');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: 'AI' }), 'tag', '클라우드', ['AI'])
    ).toBe('/search?tag=AI&tag=클라우드');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: ['AI', '클라우드'] }), 'tag', 'AI', [
        'AI',
        '클라우드',
      ])
    ).toBe('/search?tag=클라우드');
    expect(
      initUrl(
        listPathOf({ ...CAL, tag: 'AI' }),
        'tag',
        ['AI'],
        undefined,
        undefined,
        undefined
      )
    ).toBe('/events');
    expect(
      parseUrl(listPathOf({ ...CAL, tag: 'AI' }), 'kwd', '카카오 테크', ['AI'])
    ).toBe(`/search?tag=AI&kwd=${enc('카카오 테크')}`);
  });
});

describe('readDayParam — 주소의 고른 날', () => {
  it('보고 있는 달의 날짜만 받는다', () => {
    expect(readDayParam({ day: '2026-11-20' }, 2026, 11)).toBe('2026-11-20');
    expect(readDayParam({ day: '2026-12-02' }, 2026, 11)).toBeNull();
  });

  it('없는 날짜나 형식이 다른 값은 버린다', () => {
    expect(readDayParam({ day: '2026-11-31' }, 2026, 11)).toBeNull();
    expect(readDayParam({ day: '2026-11-1' }, 2026, 11)).toBeNull();
    expect(
      readDayParam({ day: ['2026-11-20', '2026-11-21'] }, 2026, 11)
    ).toBeNull();
    expect(readDayParam({}, 2026, 11)).toBeNull();
  });
});

describe('calendarHref — 캘린더 보기의 주소', () => {
  it('연·월만', () => {
    expect(calendarHref({ year: 2026, month: 11 }, '/events')).toBe(
      '/events?view=calendar&year=2026&month=11'
    );
  });

  it('고른 날이 있으면 day를 붙인다', () => {
    expect(
      calendarHref({ year: 2026, month: 11, day: '2026-11-20' }, '/events')
    ).toBe('/events?view=calendar&year=2026&month=11&day=2026-11-20');
  });

  it('목록 화면 주소의 필터를 뒤에 그대로 붙인다', () => {
    expect(
      calendarHref(
        { year: 2026, month: 11, day: '2026-11-20' },
        '/search?tag=AI&kwd=x'
      )
    ).toBe(
      '/events?view=calendar&year=2026&month=11&day=2026-11-20&tag=AI&kwd=x'
    );
    expect(
      calendarHref({ year: 2026, month: 12, day: null }, '/search?tag=클라우드')
    ).toBe('/events?view=calendar&year=2026&month=12&tag=클라우드');
  });
});

describe('shiftMonth', () => {
  it('해를 넘어간다', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2026, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});

describe('toCalendarHref — 타임라인에서 캘린더로', () => {
  it('보던 날짜가 있는 달을 열고 그날을 고른다', () => {
    expect(
      toCalendarHref({ query: {}, dayKey: '2026-11-20', todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=11&day=2026-11-20');
    expect(
      toCalendarHref({ query: {}, dayKey: '2026-12-02', todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=12&day=2026-12-02');
  });

  it('검색 화면의 필터가 따라간다', () => {
    expect(
      toCalendarHref({
        query: { tag: 'AI', kwd: '카카오 테크' },
        dayKey: '2026-11-20',
        todayKey: TODAY,
      })
    ).toBe(
      `/events?view=calendar&year=2026&month=11&day=2026-11-20&tag=AI&kwd=${enc(
        '카카오 테크'
      )}`
    );
  });

  it('보던 날짜를 모르면 주소의 연·월, 그것도 없으면 이번 달', () => {
    expect(
      toCalendarHref({ query: { year: '2026', month: '10' }, todayKey: TODAY })
    ).toBe('/events?view=calendar&year=2026&month=10');
    expect(toCalendarHref({ query: {}, todayKey: TODAY })).toBe(
      '/events?view=calendar&year=2026&month=11'
    );
  });
});

describe('toTimelineHref — 캘린더에서 타임라인으로', () => {
  it('이번 달과 그 뒤의 달은 /events', () => {
    expect(
      toTimelineHref({ query: { ...CAL, day: '2026-11-20' }, todayKey: TODAY })
    ).toBe('/events');
    expect(
      toTimelineHref({ query: { ...CAL, month: '12' }, todayKey: TODAY })
    ).toBe('/events');
  });

  it('지난 달은 그 달의 타임라인', () => {
    expect(
      toTimelineHref({ query: { ...CAL, month: '10' }, todayKey: TODAY })
    ).toBe('/events?year=2026&month=10');
  });

  it('필터가 걸려 있으면 검색 화면', () => {
    expect(
      toTimelineHref({
        query: { ...CAL, day: '2026-11-20', tag: 'AI' },
        todayKey: TODAY,
      })
    ).toBe('/search?tag=AI');
  });

  it('연·월이 없으면 /events', () => {
    expect(
      toTimelineHref({ query: { view: 'calendar' }, todayKey: TODAY })
    ).toBe('/events');
  });
});
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `components/events/calendar/utils/__tests__/buildCalendarView.test.ts`

```ts
import { buildCalendarView } from 'components/events/calendar/utils/buildCalendarView';
import { MonthCell } from 'components/events/calendar/utils/calendarMonth';
import { EMPTY_FILTERS } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일

const event = (over: Partial<Event> & { tagNames?: string[] }): Event => {
  const { tagNames = [], ...rest } = over;
  return {
    id: '1',
    title: '행사',
    description: '',
    organizer: '주최',
    event_link: 'https://example.com',
    cover_image_link: '',
    display_sequence: 0,
    event_time_type: 'RECRUIT',
    start_day_week: '수',
    start_date_time: '2026-11-01T00:00',
    end_day_week: '수',
    end_date_time: '2026-11-13T17:00',
    tags: tagNames.map((tag_name, index) => ({
      id: index + 1,
      tag_name,
      tag_color: '#0043FF',
      category: null,
    })),
    create_date_time: '2026-10-01T09:00',
    use_start_date_time_yn: 'Y',
    use_end_date_time_yn: 'Y',
    ...rest,
  };
};
const date = (over: Partial<Event> & { tagNames?: string[] }): Event =>
  event({ event_time_type: 'DATE', ...over });

const EVENTS: Event[] = [
  // 1: 오늘 17시에 접수 마감
  event({ id: '1', tagNames: ['AI', '온라인'] }),
  // 2: 오늘 저녁에 열림
  date({
    id: '2',
    start_date_time: '2026-11-13T19:00',
    end_date_time: '2026-11-13T21:00',
    tagNames: ['클라우드'],
  }),
  // 3: 어제 시작해 내일 끝남 (진행 중 → 오늘)
  date({
    id: '3',
    start_date_time: '2026-11-12T09:00',
    end_date_time: '2026-11-14T18:00',
    tagNames: ['AI'],
  }),
  // 4: 20일 접수 마감, 어제 등록 (새 행사)
  event({
    id: '4',
    end_date_time: '2026-11-20T23:59',
    create_date_time: '2026-11-12T09:00',
    tagNames: ['AI'],
  }),
  // 5: 20~22일 사흘짜리 (시작일에만 센다)
  date({
    id: '5',
    start_date_time: '2026-11-20T10:00',
    end_date_time: '2026-11-22T18:00',
  }),
  // 6: 6일에 끝난 행사
  date({
    id: '6',
    start_date_time: '2026-11-06T19:00',
    end_date_time: '2026-11-06T21:00',
    tagNames: ['AI'],
  }),
  // 7: 10월에 접수를 시작해 12월 2일 마감 (11월에는 놓이지 않는다), 어제 등록
  event({
    id: '7',
    start_date_time: '2026-10-20T00:00',
    end_date_time: '2026-12-02T18:00',
    create_date_time: '2026-11-12T09:00',
  }),
  // 8: 10일에 접수가 끝난 행사
  event({ id: '8', end_date_time: '2026-11-10T18:00', tagNames: ['보안'] }),
];

const build = (over: Partial<Parameters<typeof buildCalendarView>[0]> = {}) =>
  buildCalendarView({
    events: EVENTS,
    filters: EMPTY_FILTERS,
    newOnly: false,
    year: 2026,
    month: 11,
    wanted: null,
    now: NOW,
    ...over,
  });
const cell = (weeks: MonthCell[][], key: string): MonthCell =>
  weeks.flat().filter((c) => c.key === key)[0];
const ids = (section: { items: { event: Event }[] }) =>
  section.items.map((i) => i.event.id);

describe('buildCalendarView — 날짜별 건수', () => {
  const view = build();

  it('접수형은 마감일, 일시형은 시작일, 진행 중은 오늘에 센다', () => {
    expect(cell(view.weeks, '2026-11-13').count).toBe(3);
    expect(cell(view.weeks, '2026-11-20').count).toBe(2);
    expect(cell(view.weeks, '2026-11-06').count).toBe(1);
    expect(cell(view.weeks, '2026-11-10').count).toBe(1);
  });

  it('여러 날에 걸친 행사를 날마다 세지 않는다', () => {
    expect(cell(view.weeks, '2026-11-12').count).toBe(0);
    expect(cell(view.weeks, '2026-11-14').count).toBe(0);
    expect(cell(view.weeks, '2026-11-21').count).toBe(0);
    expect(cell(view.weeks, '2026-11-22').count).toBe(0);
  });

  it('이 달에 놓이지 않는 행사는 빼고, 행사 있는 날을 순서대로 준다', () => {
    expect(view.monthKey).toBe('2026-11');
    expect(view.keys).toEqual([
      '2026-11-06',
      '2026-11-10',
      '2026-11-13',
      '2026-11-20',
    ]);
  });
});

describe('buildCalendarView — 고른 날', () => {
  it('주소에 날짜가 없으면 오늘을 고르고 두 묶음으로 나눈다', () => {
    const view = build();
    expect(view.todayKey).toBe('2026-11-13');
    expect(view.selectedKey).toBe('2026-11-13');
    expect(view.isPastDay).toBe(false);
    expect(view.sections.map((s) => s.title)).toEqual([
      '이날 접수를 마감해요',
      '오늘 열리거나 진행 중이에요',
    ]);
    expect(ids(view.sections[0])).toEqual(['1']);
    expect(ids(view.sections[1])).toEqual(['3', '2']); // 타임라인과 같은 순서: 진행 중이 먼저
    expect(view.summary).toBe('접수 마감 1건 · 열리는 행사 2건');
    expect(view.prevKey).toBe('2026-11-10');
    expect(view.nextKey).toBe('2026-11-20');
  });

  it('주소의 날짜가 지난 날이면 "열렸어요"로 바뀐다', () => {
    const view = build({ wanted: '2026-11-06' });
    expect(view.selectedKey).toBe('2026-11-06');
    expect(view.isPastDay).toBe(true);
    expect(view.sections.map((s) => s.title)).toEqual(['이날 열렸어요']);
    expect(view.sections[0].items[0].status).toBe('ended');
    expect(view.summary).toBe('열린 행사 1건');
    expect(view.prevKey).toBeNull();
    expect(view.nextKey).toBe('2026-11-10');
  });

  it('다른 달은 그 달의 첫 행사일을 고른다', () => {
    const view = build({ year: 2026, month: 12 });
    expect(view.keys).toEqual(['2026-12-02']);
    expect(view.selectedKey).toBe('2026-12-02');
    expect(view.sections.map((s) => s.title)).toEqual(['이날 접수를 마감해요']);
  });
});

describe('buildCalendarView — 필터와 새 행사', () => {
  it('필터를 걸면 달력의 건수도 걸러진 값이다', () => {
    const view = build({ filters: { tags: ['AI'] } });
    expect(cell(view.weeks, '2026-11-13').count).toBe(2);
    expect(cell(view.weeks, '2026-11-20').count).toBe(1);
    expect(cell(view.weeks, '2026-11-10').count).toBe(0);
    expect(view.keys).toEqual(['2026-11-06', '2026-11-13', '2026-11-20']);
  });

  it('검색어도 같이 건다', () => {
    const view = build({
      events: [
        event({ id: '1', title: '카카오 테크 밋업' }),
        event({ id: '2', title: '다른 행사' }),
      ],
      filters: { tags: [], kwd: '카카오테크' },
    });
    expect(cell(view.weeks, '2026-11-13').count).toBe(1);
  });

  it('필터 때문에 고른 날이 비면 묶음이 없고 앞뒤 날짜는 알려 준다', () => {
    const view = build({ filters: { tags: ['AI'] }, wanted: '2026-11-10' });
    expect(view.selectedKey).toBe('2026-11-10');
    expect(view.sections).toEqual([]);
    expect(view.summary).toBe('등록된 행사가 없어요');
    expect(view.prevKey).toBe('2026-11-06');
    expect(view.nextKey).toBe('2026-11-13');
  });

  it('새 행사만 보면 새 행사가 있는 날만 남고, 그 가운데서 날을 고른다', () => {
    const view = build({ newOnly: true });
    expect(view.keys).toEqual(['2026-11-20']);
    expect(view.selectedKey).toBe('2026-11-20');
    expect(cell(view.weeks, '2026-11-13').count).toBe(0);
  });

  it('조건에 맞는 행사가 이 달에 없으면 고른 날이 없다', () => {
    const view = build({
      filters: { tags: ['블록체인'] },
      wanted: '2026-11-13',
    });
    expect(view.keys).toEqual([]);
    expect(view.selectedKey).toBeNull();
    expect(view.sections).toEqual([]);
    expect(view.prevKey).toBeNull();
    expect(view.nextKey).toBeNull();
  });

  it('newCount는 이 달에 놓인 새 행사 수다 (필터와 무관, 다른 달에 놓인 것은 뺀다)', () => {
    expect(build().newCount).toBe(1);
    expect(build({ filters: { tags: ['보안'] } }).newCount).toBe(1);
    expect(build({ year: 2026, month: 12 }).newCount).toBe(1);
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- calendarUrl buildCalendarView`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 4: `calendarUrl.ts`, `buildCalendarView.ts`를 구현한다.** 필터·검색·묶기·건수는 3단계 함수를 부르고 같은 규칙을 다시 쓰지 않는다.

- [ ] **Step 5: 확인**

Run: `pnpm test -- components/events/calendar && npx tsc --noEmit && npx eslint components/events/calendar/utils/calendarUrl.ts components/events/calendar/utils/buildCalendarView.ts components/events/calendar/utils/__tests__/calendarUrl.test.ts components/events/calendar/utils/__tests__/buildCalendarView.test.ts`
Expected: PASS (calendarUrl 18개, buildCalendarView 12개), 타입·린트 오류 없음

Run: `TZ=UTC pnpm test -- components/events/calendar`
Expected: 같은 결과

Run: `grep -rn "dayjs\|new Date(" components/events/calendar/utils/calendarMonth.ts components/events/calendar/utils/calendarDay.ts components/events/calendar/utils/calendarUrl.ts components/events/calendar/utils/buildCalendarView.ts`
Expected: 결과 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 4: 3단계 부품에 선택 속성 더하기

캘린더가 3단계 부품을 그대로 쓰는 데 필요한 것만 더한다. **넘기지 않으면 모양과 동작이 지금과 같아야 한다.** 이 작업이 끝난 시점에는 더한 것을 쓰는 곳이 없다.

목업 기준: `app.css:360`, `:363`(캘린더 안의 카드 크기), `:361`, `:375`(빈 화면 여백), `app.js:42`(`info` 아이콘), `app.css:319`(달력 안의 월 선택 위치), `:448-458`(캘린더의 윗줄: 검색칸이 보기 전환과 같은 줄, 칩은 아랫줄).

**Files:**
- Modify: `components/events/timeline/EventCard.module.scss:29-30`, `:105`
- Modify: `components/events/timeline/TimelineEmpty.module.scss:5`
- Modify: `components/events/timeline/TimelineIcon.tsx:1-9`, `:50-51`
- Modify: `components/events/timeline/MonthPicker.tsx:11-29`, `:46`
- Modify: `components/events/timeline/FilterBar.tsx:20-34`, `:54-60`, `:76-78`, `:81`, `:86`, `:97-98`, `:110-111`, `:123-124`, `:136`, `:138`, `:153`, `:162`
- Modify: `components/events/timeline/FilterBar.module.scss` (끝에 추가)
- Modify: `lib/hooks/useSWR.tsx:11-29` (`useScheduledEvents`)

**Interfaces:**
- Consumes: 없음
- Produces:

```ts
// EventCard.module.scss — 바깥 요소에서 줄 수 있는 CSS 변수. 주지 않으면 지금 값. 860px 이하의 값은 변수를 보지 않는다
//   --de-card-thumb (320px)  썸네일 칸의 폭
//   --de-card-gap   (24px)   썸네일과 글 사이
//   --de-card-title (20px)   제목 글자 크기
// TimelineEmpty.module.scss
//   --de-empty-pad  (80px 0) 위아래 여백

// TimelineIcon.tsx
type IconName = … | 'info';

// MonthPicker.tsx
interface MonthPickerProps {
  …                       // 지금의 일곱 개 그대로
  className?: string;     // 바깥 요소(.picker)에 더할 클래스
}

// FilterBar.tsx
interface FilterBarProps {
  …                                     // 지금의 다섯 개 그대로
  asPath?: string;                      // 주소를 만들 때 기준으로 삼을 경로. 기본 router.asPath
  onNavigate?: (url: string) => void;   // 만든 주소로 가는 방법. 기본 router.push(url, undefined, { scroll: false })
  variant?: 'timeline' | 'calendar';    // 기본 'timeline'
}

// useSWR.tsx
const useScheduledEvents: (fallbackData?: EventResponse[], enabled?: boolean) => {
  scheduledEvents: EventResponse[] | undefined; isLoading: boolean; isError: any;
};   // enabled 기본 true. false면 요청하지 않는다
```

- [ ] **Step 0: 고치기 전의 사본을 둔다.** 3단계 파일은 아직 커밋되지 않아 `git diff`로는 바뀐 줄을 볼 수 없다. 확인이 끝나면 지운다.

```bash
mkdir -p /tmp/s5-task4 && cp components/events/timeline/FilterBar.tsx components/events/timeline/MonthPicker.tsx components/events/timeline/TimelineIcon.tsx components/events/timeline/EventCard.module.scss components/events/timeline/TimelineEmpty.module.scss components/events/timeline/FilterBar.module.scss /tmp/s5-task4/
```

- [ ] **Step 1: `EventCard.module.scss`에 변수 셋을 넣는다.** 값 세 군데만 바꾼다.
  - `:29` `grid-template-columns: 320px minmax(0, 1fr);` → `grid-template-columns: var(--de-card-thumb, 320px) minmax(0, 1fr);`
  - `:30` `gap: 24px;` → `gap: var(--de-card-gap, 24px);`
  - `:105` `font-size: 20px;` → `font-size: var(--de-card-title, 20px);`
  - `de-mobile` 안의 값(`1fr`, `12px`, `17.5px`)은 그대로 둔다. 목업도 860px 이하에서는 캘린더와 타임라인의 카드가 같다(`app.css:374`).

- [ ] **Step 2: `TimelineEmpty.module.scss:5`** `padding: 80px 0;` → `padding: var(--de-empty-pad, 80px 0);`

- [ ] **Step 3: `TimelineIcon.tsx`에 `info`를 더한다.** `IconName`에 `'info'`, `renderShape`에 아래를 더한다(목업 `app.js:42`).

```tsx
case 'info':
  return (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11.2v5.3" />
      <circle cx="12" cy="7.9" r=".7" fill="currentColor" />
    </>
  );
```

- [ ] **Step 4: `MonthPicker.tsx`에 `className`을 더한다.** `:46`의 `className={cn('picker')}` → `className={cn('picker', className)}`. 다른 줄은 건드리지 않는다.

- [ ] **Step 5: `FilterBar.tsx`에 `asPath`·`onNavigate`·`variant`를 더한다.**
  - 함수 맨 위에서 `const path = asPath ?? router.asPath;`
  - `router.asPath`를 쓰던 열한 군데(`:81`, `:86`, `:97`, `:98`, `:110`, `:111`, `:123`, `:124`, `:136`, `:138`, `:153`)와 context를 맞추는 `useEffect`의 의존 배열(`:60`)을 `path`로 바꾼다.
  - `go`(`:76-78`): `onNavigate`가 있으면 `onNavigate(url)`, 없으면 지금처럼 `router.push(url, undefined, { scroll: false })`.
  - 바깥 `<div>`(`:162`): `className={cn('bar', { calendar: variant === 'calendar' })}`.
  - 칩의 순서·문구·측정 이벤트·`hidePastChip`은 건드리지 않는다.

- [ ] **Step 6: `FilterBar.module.scss` 끝에 캘린더 배치를 더한다.** 기존 규칙은 고치지 않는다.

| 부분 | PC | 860px 이하 | 480px 이하 |
|---|---|---|---|
| `.bar.calendar` | `padding-top: 14px;` | `padding-top: 11px;` | 같음 |
| `.bar.calendar .search` | `width: 300px; max-width: calc(100% - 170px);` | `display: block; width: calc(100% - 84px); max-width: none;` (늘 보인다) | 같음 |
| `.bar.calendar .field` | `width: 100%;` | 같음 | 같음 |
| `.bar.calendar .chips` | `flex-basis: 100%;` | 같음 | `flex-basis: auto;` |

  - 위 여백 14px·11px은 목업의 겹침을 풀어 쓴 값이다: 윗줄 위 여백 16px(모바일 12px) + 보기 전환 36px − 끌어올림 38px(모바일 37px). 오른쪽의 170px·84px은 보기 전환이 놓일 자리다.
  - 480px 이하에서 `flex-basis`를 걸지 않는 이유: 그 폭에서 칩 줄은 `width: calc(100% + 40px)`로 화면 끝까지 넘긴다(`FilterBar.module.scss:111-128`). `flex-basis: 100%`가 걸리면 그 폭을 덮어써 오른쪽이 40px 모자란다. 걸지 않아도 폭이 100%를 넘어 다음 줄로 내려간다.

- [ ] **Step 7: `useScheduledEvents`에 `enabled`를 더한다.** 둘째 인자 `enabled = true`. `useSWR`의 키를 `enabled ? '/front/v2/events/current' : null`로, `isLoading`을 `enabled && !error && !events`로 바꾼다. 지금 부르는 곳(`pages/events.tsx:62-64`, `pages/search.tsx`)은 그대로 컴파일된다.

- [ ] **Step 8: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/events/timeline lib/hooks/useSWR.tsx`
Expected: 오류 없음, 테스트 수는 작업 3 뒤와 같다

Run: SCSS 확인 — `components/events/timeline/EventCard.module.scss components/events/timeline/TimelineEmpty.module.scss components/events/timeline/FilterBar.module.scss`
Expected: 세 줄 모두 `ok`

Run: `grep -n "router.asPath" components/events/timeline/FilterBar.tsx`
Expected: `const path = asPath ?? router.asPath;` 한 줄만

Run: `for f in FilterBar.tsx MonthPicker.tsx TimelineIcon.tsx EventCard.module.scss TimelineEmpty.module.scss FilterBar.module.scss; do echo "== $f"; diff /tmp/s5-task4/$f components/events/timeline/$f | grep "^<"; done; rm -r /tmp/s5-task4`
Expected: 없어진 줄(`<`)이 위에 적은 자리뿐이다 — `FilterBar.tsx`는 `router.asPath`를 쓰던 줄, `go`의 본문, 바깥 `<div>`, props 구조 분해. `MonthPicker.tsx`는 `:46`과 props 구조 분해. `EventCard.module.scss`는 세 줄, `TimelineEmpty.module.scss`는 한 줄. `TimelineIcon.tsx`와 `FilterBar.module.scss`는 없다(더하기만 했다).

관리자가 화면에서 볼 것(작업 9에서. 비교 대상은 **이 단계 전의 모습**):
  1. `/events`와 `/search?kwd=AI`의 카드 크기(썸네일 320px, 제목 20px), 빈 화면의 여백, 필터 줄의 배치, 월 선택 풍선의 위치가 전과 같다.
  2. `/events`에서 "AI" 칩 → `/search?tag=AI`, "전체" → `/events`. 검색어 Enter → `/search?kwd=…`. 3단계의 동작 그대로다.

---

### Task 5: 달력 한 달 · (i) 풍선

목업 기준: `app.js:252-257`의 `infoPop`, `:258-269`의 `calMonth`, `:325`(풍선 꼬리의 위치), `:521-522`(풍선 바깥 누름), `:530`·`:535-537`·`:547`(월 선택, (i), 달 이동, 오늘), `:550`(Esc), `:551-558`(방향키). 스타일 `app.css:309-310`(색), `:316-351`, `:362`(움직임 줄이기), `:369`, `:371-372`(860px 이하), `:402`(360px), `:423`(621~860px), `:444`. 목업 주소 `app.html?view=cal&banner=none#main`, `app.html?view=cal&info=1&banner=none#main`.

**Files:**
- Create: `components/events/calendar/HeatMonth.tsx`, `HeatMonth.module.scss`
- Create: `components/events/calendar/HeatLegend.tsx`, `HeatLegend.module.scss`

**Interfaces:**
- Consumes: `MonthCell`·`heatLegend`(Task 1), `moveByArrow`(Task 2), `shiftMonth`(Task 3), `MonthParam`(`lib/utils/timeline/dateStrip.ts`), `DOW`(`kst.ts`), `MonthPicker`(`className`)·`TimelineIcon`(`info`)(Task 4), `useOnClickOutside`(`lib/hooks/useOnClickOutside.tsx`), 믹스인 `de-button-reset`·`de-focus-ring`·`de-press`·`de-mobile`·`de-tablet`·`de-narrow`·`de-reduced-motion`
- Produces:

```ts
// HeatMonth.tsx
function HeatMonth(props: {
  year: number;
  month: number;                              // 1~12
  weeks: MonthCell[][];
  keys: string[];                             // 행사 있는 날 (방향키와 Tab이 멈추는 칸)
  selectedKey: string | null;
  thisMonthKey: string;                       // 오늘이 속한 달 'YYYY-MM' (월 선택에 넘긴다)
  yearRange: { min: number; max: number };    // 넘길 수 있는 해 (월 선택과 ‹ ›가 함께 쓴다)
  busy?: boolean;                             // 달을 불러오는 중
  onSelectDay: (key: string) => void;
  onPickMonth: (month: MonthParam) => void;   // ‹ ›와 월 선택
  onToday: () => void;
}): JSX.Element;

// HeatLegend.tsx — HeatMonth 안에서만 쓴다
function HeatLegend(props: {
  id: string;            // (i) 버튼의 aria-controls가 가리킨다
  tail: number;          // 꼬리의 왼쪽 위치(px)
  onClose: () => void;   // 닫기(×)와 Esc
}): JSX.Element;
```

**마크업**

```
<div class="month">                                         ← 색 단계의 지역 변수가 여기 있다
  <div class="head">                                        ← position: relative (두 풍선의 기준)
    <div class="anchor">                                    ← display: contents. 월 선택의 바깥 누름 판정
      <button class="title" aria-expanded aria-haspopup="dialog"
              aria-label="2026년 11월, 다른 달 고르기">2026년 11월 <TimelineIcon chevron 16 /></button>
      [열렸을 때] <MonthPicker className="picker" … />
    </div>
    <div class="anchor">                                    ← (i) 풍선의 바깥 누름 판정
      <button class="info" aria-expanded aria-controls="calendar-legend"
              aria-label="달력의 색과 숫자가 무엇을 뜻하는지 보기"><TimelineIcon info 20 /></button>
      [열렸을 때] <HeatLegend id="calendar-legend" … />
    </div>
    <span class="nav">
      <button class="arrow" aria-label="이전 달"><TimelineIcon back 16 /></button>
      <button class="today">오늘</button>
      <button class="arrow" aria-label="다음 달"><TimelineIcon chevron 16 /></button>
    </span>
  </div>
  <table class="grid" role="grid" aria-label="2026년 11월 행사 달력" [aria-busy="true"]>
    <thead><tr role="row">
      <th role="columnheader" scope="col" abbr="일요일" class="sun">일</th> … <th … abbr="토요일" class="sat">토</th>
    </tr></thead>
    <tbody onKeyDown>
      <tr role="row">                                       ← 한 주
        <td role="gridcell" aria-selected={고른 날인지}>     ← 이 달의 날
          <button class="cell lv{N} [is-past] [is-today] [is-on]" data-key data-tip
                  disabled={0건} tabIndex={0 또는 -1} aria-label={cell.label} [aria-current="date"]>
            <b class="[sun|sat]">20</b><small>10</small>     ← 0건이면 small은 비운다
          </button>
        </td>
        <td role="gridcell" aria-hidden="true"></td>         ← 다른 달의 날(빈칸)
      </tr>
    </tbody>
  </table>
</div>
```

- 표 요소에 `display`를 바꿔 격자로 놓으므로(아래) 역할을 **모두 직접 적는다**(`grid`, `row`, `columnheader`, `gridcell`). `display`를 바꾸면 표의 뜻을 잃는 브라우저가 있다.
- `MonthPicker`에 넘기는 `className`은 `HeatMonth` 모듈의 `picker` 클래스다(`className={cn('picker')}`). `MonthPicker` 쪽의 `cn`은 자기 모듈에 없는 이름을 그대로 통과시킨다.
- 월 버튼의 `aria-label`은 3단계 `DateNav.tsx:118`과 같은 꼴이다. 목업의 `aria-label`에는 "행사 N건"이 들어 있는데(`app.js:265`) 건수를 요약하는 말이라 넣지 않는다.
- 칸의 `aria-label`·`data-tip`은 `MonthCell.label`·`tip`을 그대로 쓴다. `tip`이 빈 문자열이면 `data-tip` 속성을 넣지 않는다.
- 고른 날은 칸(`td`)의 `aria-selected="true"`, 오늘은 버튼의 `aria-current="date"`. 목업의 `aria-pressed`는 쓰지 않는다(표 안에서는 `aria-selected`가 맞다).

**동작**

- **월 버튼**: 월 선택을 열고 닫는다. 열 때 (i) 풍선은 닫는다. `MonthPicker`에는 `title={{ year, month }}`, `monthTotals={{}}`(달 이름만 보인다. "정한 것" 6), `thisMonthKey`, `yearRange`, `onPickMonth`, `onClose`를 넘긴다. 달을 고르면 닫고 포커스를 월 버튼으로 돌린 뒤 `onPickMonth`를 부른다. Esc는 `MonthPicker`가 처리한다(`onClose` → 닫고 포커스를 월 버튼으로). 바깥을 누르면 닫는다(`useOnClickOutside`, `mouseEvent: 'mousedown'`. `DateNav.tsx:100-106`과 같은 방식. 포커스는 건드리지 않는다).
- **(i) 버튼**: 풍선을 열고 닫는다. **누를 때만 열린다**(올리는 것으로는 열리지 않는다). 열 때 월 선택은 닫고, 꼬리 위치를 잰다: `버튼의 offsetLeft + offsetWidth / 2 − 6`. 바깥을 누르면 닫는다. 닫기(×)나 Esc로 닫으면 포커스를 (i) 버튼으로 돌린다. Esc는 `HeatLegend`가 `document`의 `keydown`으로 듣는다(`MonthPicker.tsx:37-43`과 같은 방식).
- **‹ ›**: `onPickMonth(shiftMonth(year, month, ∓1))`. `yearRange.min`년 1월에서 ‹, `yearRange.max`년 12월에서 ›는 `disabled`. **오늘**: `onToday()`. 셋 다 누르면 두 풍선을 닫는다.
- **칸**: 누르면 `onSelectDay(cell.key)`, 두 풍선을 닫는다. 0건인 칸은 `disabled`라 눌리지 않는다.
- **Tab이 멈추는 칸은 하나**(roving tabindex): 고른 날에 행사가 있으면 그 칸. 없으면(필터로 빈 날) `keys`에서 고른 날 이후의 첫 날, 그것도 없으면 `keys`의 마지막 날. 고른 날이 없으면 `keys`의 첫 날. 나머지 칸은 `tabIndex={-1}`.
- **방향키**(`tbody`의 `onKeyDown`. 누른 곳이 `button[data-key]`일 때만): 네 방향키면 `preventDefault`(끝에 닿아도 화면이 스크롤되지 않게). `moveByArrow(keys, 그 칸의 키, event.key)`가 날짜를 주면 `onSelectDay`를 부르고, **고른 날이 바뀐 뒤 그 칸에 포커스를 준다**(Review Focus 5). "방향키로 옮겼다"는 표시를 `ref`에 적어 두고, `selectedKey`가 바뀐 뒤의 `useEffect`에서 `button[data-key="…"]`에 `focus({ preventScroll: true })`.
- `busy`가 참이면 표에 `aria-busy="true"`와 `is-busy`를 붙인다. **버튼을 `disabled`로 바꾸지는 않는다**(포커스가 사라진다). 누름을 막는 것은 부모의 몫이다(작업 8).

**값** (`app.css` 기준)

| 부분 | 값 | 860px 이하 | 360px 이하 |
|---|---|---|---|
| 머리(`.head`) | `position: relative; display: flex; align-items: center; gap: 6px; height: 36px; margin-bottom: 12px;` | 같음 | 같음 |
| 월 버튼 | `de-button-reset`, `de-focus-ring`, `display: flex; align-items: center; gap: 4px; margin-left: -6px; padding: 4px 4px 4px 6px; border-radius: 10px; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; white-space: nowrap;` 올리거나 열려 있으면 `background: var(--de-hover)`. 아이콘은 `transform: rotate(90deg); color: var(--de-hint);` | `font-size: 18px` | `font-size: 17px` |
| (i) 버튼 | `de-button-reset`, `margin-left: -2px; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: var(--de-hint);` 올리거나 열려 있으면 `background: var(--de-surface); color: var(--de-ink);` | 같음 | 같음 |
| 오른쪽 묶음(`.nav`) | `display: flex; align-items: center; margin-left: auto; gap: 4px;` | 같음 | 같음 |
| ‹ › | `de-button-reset`, `de-focus-ring`, `width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--de-line); display: grid; place-items: center; color: var(--de-sub);` 올리면 `--de-hover`. `disabled`는 `opacity: 0.35; cursor: default; background: none;` | 같음 | `30×30px` |
| 오늘 | `de-button-reset`, `de-focus-ring`, `de-press`, `flex: none; height: 32px; padding: 0 11px; border-radius: 999px; border: 1px solid var(--de-line); font-size: 13px; font-weight: 700; color: var(--de-sub); white-space: nowrap;` 올리면 `--de-hover` | 같음 | `padding: 0 9px` |
| 월 선택의 위치 | `.head .picker { top: 44px; }` (클래스 둘로 적어 `MonthPicker.module.scss`의 `top: 48px`보다 앞서게 한다) | `MonthPicker`의 규칙(`left: 0; right: 0; width: auto`)이 그대로 듣는다 | 같음 |

**달력 격자**

- `table`·`thead`·`tbody`는 `display: block`, `tr`은 `display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px;`, `th`·`td`는 `display: block; padding: 0;`. 줄 사이는 `tbody tr + tr { margin-top: 4px; }`. 860px 이하에서는 `gap`과 줄 사이가 `3px`.
- 요일(`th`): `padding-bottom: 5px; text-align: center; font-size: 11.5px; font-weight: 700; color: var(--de-hint);` 일요일 `--de-sun`, 토요일 `--de-sat`.
- 칸(`.cell`): `de-button-reset`, `position: relative; display: grid; align-content: center; justify-items: center; gap: 1px; width: 100%; aspect-ratio: 1; border-radius: 11px; transition: transform 0.12s;`
  - 860px 이하 `border-radius: 10px`. **620px 이하에서만** `aspect-ratio: 1 / 0.86`(621~860px은 `1`. `app.css:371`, `:423`).
  - 날짜 숫자 `<b>`: `font-size: 14.5px; font-weight: 700; line-height: 1.15;` 일요일 `--de-sun`, 토요일 `--de-sat`.
  - 건수 `<small>`: `height: 13px; font-size: 11px; font-weight: 700; line-height: 13px; color: var(--heat-num);`
  - 색: `lv1` `background: var(--heat-1)`, `lv2` `--heat-2`, `lv3` `--heat-3`, `lv4` `--heat-4`. `lv3`의 숫자·건수는 `#fff`, `lv4`는 `var(--heat-on)`(요일 색보다 앞선다).
  - 행사 없는 날(`lv0`. 늘 `disabled`): `background: none; cursor: default;` 숫자 `font-weight: 500; color: var(--de-hint);`(일·토요일도 같은 색이고 `opacity: 0.7`).
  - 지난 날(`is-past`): `opacity: 0.42`. 올리거나 고른 날이면 `opacity: 1`.
  - 오늘(`is-today`): 숫자에 `padding: 1px 7px; margin: -1px 0; border-radius: 999px; background: var(--de-ink); color: var(--de-bg);`(색 단계·요일 색보다 앞선다).
  - 고른 날(`is-on`): `box-shadow: 0 0 0 2px var(--de-bg), 0 0 0 4.5px var(--de-ink); z-index: 2; opacity: 1;`
  - 올리면(비활성 아닐 때): `transform: scale(1.06); z-index: 4;`
  - 포커스: `&:focus-visible { outline: 2.5px solid var(--de-blue); outline-offset: 2px; }` (i) 버튼과 풍선의 닫기도 같은 값.
- **칸에 올렸을 때의 한 줄 설명** — `@media (hover: hover)` 안에서만:
  - `.cell[data-tip]:hover::after { content: attr(data-tip); position: absolute; left: 50%; bottom: calc(100% + 7px); transform: translateX(-50%); padding: 6px 9px; border-radius: 8px; background: var(--de-ink); color: var(--de-bg); font-size: 12px; font-weight: 600; line-height: 1.2; white-space: nowrap; pointer-events: none; z-index: 5; }`
  - `.cell[data-tip]:hover::before { content: ''; position: absolute; left: 50%; bottom: calc(100% + 2px); width: 8px; height: 8px; margin-left: -4px; background: var(--de-ink); transform: rotate(45deg); z-index: 5; }`
  - 첫 열(`td:first-child .cell`)은 `&::after { left: 0; transform: none; }`, 끝 열(`td:last-child .cell`)은 `&::after { left: auto; right: 0; transform: none; }`
- 불러오는 중(`.grid.is-busy`): `opacity: 0.45; pointer-events: none; transition: opacity 0.15s;`
- `de-reduced-motion`: 칸의 transition, 풍선의 animation, 불러오는 중의 transition 없음.

**(i) 풍선 (`HeatLegend`)**

```
<div class="legend" id role="dialog" aria-label="달력 보는 법" style="--tail: {tail}px">
  <b>달력 보는 법</b>
  <p>칸의 색이 진할수록 그날 행사가 많아요.</p>
  <div class="scale" aria-hidden="true"><span>적음</span><i class="lv1" /><i class="lv2" /><i class="lv3" /><i class="lv4" /><span>많음</span></div>
  <div class="steps"><span>1~2건</span><span>3~4건</span><span>5~7건</span><span>8건 이상</span></div>   ← heatLegend()로 그린다
  <p>숫자는 그날 <em>접수를 마감하거나 열리는</em> 행사 수예요.</p>
  <button type="button" class="close" aria-label="설명 닫기"><TimelineIcon x 16 /></button>
</div>
```

- 바깥: `position: absolute; left: 0; top: 44px; z-index: 12; width: 276px; padding: 16px 18px 15px; border-radius: 16px; background: var(--de-bg); border: 1px solid var(--de-line); box-shadow: var(--de-shadow); font-size: 13.5px; line-height: 1.55; color: var(--de-sub);` 860px 이하 `width: min(276px, calc(100vw - 40px))`.
- 나타날 때: `animation: 0.16s ease-out`, `from { opacity: 0; transform: translateY(-4px); }`(키프레임은 이 모듈 안에 둔다).
- 꼬리: `&::before { content: ''; position: absolute; left: var(--tail, 126px); top: -6px; width: 11px; height: 11px; background: var(--de-bg); border-left: 1px solid var(--de-line); border-top: 1px solid var(--de-line); transform: rotate(45deg); }`
- 제목 `<b>`: `display: block; margin-bottom: 6px; font-size: 14.5px; color: var(--de-ink);` 문단 `<p>`: `margin: 0;` 강조 `<em>`: `font-style: normal; font-weight: 700; color: var(--de-ink);`
- 색 줄(`.scale`): `display: grid; grid-template-columns: auto repeat(4, 1fr) auto; align-items: center; gap: 4px; margin: 11px 0 3px; font-size: 12px; font-weight: 600; color: var(--de-hint);` 색 칸 `<i>`: `height: 18px; border-radius: 5px;` 바탕은 `var(--heat-1)` … `var(--heat-4)`. **이 변수는 `HeatMonth.module.scss`의 `.month`에서 내려온다**(풍선이 `.month` 안에 그려진다). 그 사실을 주석으로 적어 둔다.
- 단계 줄(`.steps`): `display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 0 30px 11px; font-size: 10.5px; font-weight: 600; color: var(--de-hint); text-align: center; white-space: nowrap;`
- 닫기: `de-button-reset`, `position: absolute; right: 8px; top: 8px; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; color: var(--de-hint);` 올리면 `background: var(--de-surface); color: var(--de-ink);`

- [ ] **Step 1: `HeatLegend.tsx`와 스타일을 만든다.**

- [ ] **Step 2: `HeatMonth.tsx`와 스타일을 만든다.** 색 단계의 지역 변수는 Global Constraints의 표 그대로 `.month`에 둔다. 이 시점에는 어느 화면도 이 부품을 쓰지 않는다.

- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/events/calendar/HeatMonth.tsx components/events/calendar/HeatLegend.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss`
Expected: 두 줄 모두 `ok`

Run: `grep -n "innerWidth\|windowX\|dayjs\|onMouseEnter\|onMouseOver" components/events/calendar/HeatMonth.tsx components/events/calendar/HeatLegend.tsx`
Expected: 결과 없음 (폭은 CSS로만, 풍선은 올리는 것으로 열리지 않는다)

Run: `grep -nE "#[0-9a-fA-F]{3,6}\b" components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss`
Expected: `HeatMonth.module.scss`의 `.month`에 있는 지역 변수 값(`#e3ebff`, `#b9ccff`, `#7b9bff`, `#3f5fc4`, `#1a2750`, `#24388a`, `#3558d6`, `#9db6ff`, `#0b1020`)과 `#fff`뿐이다. `HeatLegend.module.scss`에는 없다.

관리자가 화면에서 볼 것(작업 8 뒤. 비교: `app.html?view=cal&banner=none#main`, `…&info=1…`, `…&theme=dark…`. 1280px과 390px, 밝게·어둡게):
  1. 달력 머리에 "2026년 11월 ⌄", (i), 오른쪽에 ‹ 오늘 ›. 칸의 색이 건수에 따라 네 단계이고 칸 안에 날짜와 건수가 있다. 오늘은 숫자가 검정 알약, 고른 날은 칸 둘레에 검정 테두리(오늘이면서 고른 날이면 둘 다). 행사 없는 날은 옅은 숫자만이고 눌리지 않는다. 지난 날은 흐리다.
  2. (i)에 마우스를 올리기만 하면 아무것도 뜨지 않는다. 누르면 꼬리가 (i)를 가리키는 풍선이 뜨고, 바깥·×·Esc로 닫힌다. ×와 Esc로 닫으면 포커스가 (i)로 돌아온다. 어두운 화면에서 네 색이 구분된다.
  3. 칸에 올리면 "11월 20일 금요일 · 행사 10건"이 칸 위에 뜬다. **첫 열과 끝 열, 그리고 1040px 폭의 둘째·여섯째 열에서 풍선이 잘리지 않는다**(Review Focus 1). 고른 날 옆 칸의 풍선이 고른 날 테두리 뒤로 들어가지 않는다.
  4. "2026년 11월"을 누르면 열두 달이 뜬다(달 이름만, 건수 없음). 이번 달에 파란 테두리, 보고 있는 달에 검정 바탕. Esc로 닫히고 포커스가 버튼으로 돌아온다. **2026년 2월(네 줄짜리 달)에서도 풍선의 아래가 잘리지 않는다**(Review Focus 1).
  5. 키보드: Tab으로 월 버튼 → (i) → ‹ → 오늘 → › → 달력의 **칸 하나**(고른 날) → 날짜 제목 옆 ‹ ›. 칸에서 →·←는 하루, ↑·↓는 한 주를 옮기고 행사 없는 날은 건너뛴다. **옮긴 뒤 포커스 테두리가 새 칸에 있다**(Review Focus 5). 달의 끝에서 더 누르면 그대로 있고 화면이 스크롤되지 않는다.
  6. 390px: 칸이 조금 납작하고(가로가 더 길다) 숫자와 건수가 읽힌다. 360px에서도 머리 한 줄에 "2026년 11월 ⌄ (i) ‹ 오늘 ›"가 들어간다.

---

### Task 6: 고른 날의 행사

목업 기준: `app.js:270-283`의 `calDay`, `app.css:352-361`, `:363`(1040px), `:373-375`(860px 이하), `:423`(621~860px). 목업 주소 `app.html?view=cal&day=2026-11-20&banner=none#main`, `…&day=2026-11-06…`(지난 날).

**Files:**
- Create: `components/events/calendar/DayPanel.tsx`, `DayPanel.module.scss`

**Interfaces:**
- Consumes: `DaySection`·`emptyDayAction`(Task 2), `formatKoDay`(Task 1), `DOW`·`weekdayOf`(`kst.ts`), `EventCard`(`item`, `favorite`, `onToggleFavorite`, `priority`)·`TimelineEmpty`(`title`, `desc`, `actionLabel`, `onAction`)·`TimelineIcon`, Task 4의 CSS 변수(`--de-card-thumb`, `--de-card-gap`, `--de-card-title`, `--de-empty-pad`)
- Produces:

```ts
function DayPanel(props: {
  month: number;                    // 빈 달 문구의 'N월'
  selectedKey: string | null;
  sections: DaySection[];
  summary: string;
  prevKey: string | null;
  nextKey: string | null;
  failed: boolean;                  // 월별 조회에 실패해 그릴 것이 없다
  showTodayAction: boolean;         // 빈 달 안내에 "오늘로 돌아가기"를 보일지 (이번 달이 아닐 때)
  isFavorite: (eventId: string) => boolean;
  onToggleFavorite: (event: Event) => void;
  onSelectDay: (key: string) => void;
  onToday: () => void;
}): JSX.Element;
```

**무엇을 그리나** (위에서부터 먼저 맞는 것)

| 조건 | 그리는 것 |
|---|---|
| `failed` | `TimelineEmpty` 제목 `이벤트 정보를 불러오는데 문제가 발생했습니다!` (지금 문구 그대로. `EventTimeline.tsx:335`) |
| `selectedKey === null` (이 달에 맞는 행사가 없음) | `TimelineEmpty` 제목 `{month}월에는 조건에 맞는 행사가 없어요`, 설명 `다른 달을 고르거나 오늘로 돌아가 보세요.`, 버튼 `오늘로 돌아가기`(`showTodayAction`일 때만) → `onToday` |
| `sections`가 비어 있음 (필터 때문에 고른 날이 빔) | 날짜 제목 줄 + `TimelineEmpty` 제목 `이날은 조건에 맞는 행사가 없어요`, 설명 `달력에서 색이 칠해진 날짜를 눌러 보세요.`, 버튼은 `emptyDayAction(prevKey, nextKey)`의 문구(없으면 버튼 없음) → `onSelectDay(그 날짜)` |
| 그 밖 | 날짜 제목 줄 + 묶음마다 제목과 카드 |

**마크업**

```
<section class="panel" aria-label="고른 날의 행사">
  <div class="head">
    <div class="heading" aria-live="polite">
      <h2 class="title">11월 20일 <span class="[sun|sat]">금요일</span></h2>
      <p class="summary">접수 마감 9건 · 열리는 행사 1건</p>
    </div>
    <div class="nav">
      <button class="arrow" disabled={prevKey 없음} aria-label="11월 19일, 이전 행사가 있는 날"><TimelineIcon back 16 /></button>
      <button class="arrow" disabled={nextKey 없음} aria-label="11월 21일, 다음 행사가 있는 날"><TimelineIcon chevron 16 /></button>
    </div>
  </div>
  <h3 class="group">이날 접수를 마감해요</h3>
  <div class="list"><EventCard … /> …</div>
  <h3 class="group">이날 열려요</h3>
  <div class="list"><EventCard … /> …</div>
</section>
```

- 배너에 `h1`이 있어 날짜 제목은 `h2`, 묶음 제목은 `h3`.
- `aria-live`는 **제목과 한 줄에만** 건다(목업은 칸 전체에 걸어 날짜를 바꿀 때마다 카드를 모두 읽는다).
- ‹ ›의 `aria-label`: 갈 날이 있으면 `'{formatKoDay(key)}, 이전 행사가 있는 날'` / `'…, 다음 행사가 있는 날'`, 없으면 날짜 없이 `'이전 행사가 있는 날'` / `'다음 행사가 있는 날'`이고 `disabled`.
- 카드의 `key`는 행사 id. `favorite={isFavorite(item.event.id)}`. `priority`는 두 묶음을 통틀어 앞에서 3장까지.
- 끝난 행사는 `EventCard`가 스스로 흐리게 그린다(`item.status === 'ended'`). 여기서 따로 하지 않는다.
- 카드의 관심·공유·상세 이동은 `EventCard` 그대로다.

**값**

| 부분 | PC | 1040px 이하 | 860px 이하 |
|---|---|---|---|
| 칸(`.panel`) | `min-width: 0;` | 같음 | 620px 이하에서만 `margin-top: 22px` |
| 제목 줄(`.head`) | `display: flex; align-items: flex-start; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--de-line);` | 같음 | `padding-bottom: 14px` |
| 날짜 제목 | `margin: 0; font-size: 25px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2;` 요일 `font-weight: 700;` 일요일 `--de-sun`, 토요일 `--de-sat` | 같음 | 621~860px `22px`, 620px 이하 `21px` |
| 한 줄(`.summary`) | `margin: 5px 0 0; font-size: 14.5px; font-weight: 500; color: var(--de-hint);` | 같음 | 같음 |
| ‹ › 묶음 | `margin-left: auto; display: flex; gap: 6px; flex: none;` | 같음 | 같음 |
| ‹ › | `de-button-reset`, `de-focus-ring`, `width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--de-line); display: grid; place-items: center; color: var(--de-sub);` 올리면 `--de-hover`. `disabled`는 `opacity: 0.35; cursor: default; background: none;` | 같음 | 같음 |
| 묶음 제목(`.group`) | `margin: 22px 0 0; font-size: 13.5px; font-weight: 800; color: var(--de-hint);` | 같음 | 같음 |
| 카드 목록(`.list`) | `display: grid; gap: 2px; min-width: 0; padding: 8px 0 0; --de-card-thumb: 264px; --de-card-gap: 20px; --de-card-title: 18.5px;` | `--de-card-thumb: 200px; --de-card-gap: 16px;` | `padding-top: 12px; gap: 14px;` (카드는 `EventCard`의 모바일 모양) |
| 빈 화면 | 칸에 `--de-empty-pad: 70px 0 60px;` | 같음 | `--de-empty-pad: 44px 0 36px;` |

- [ ] **Step 1: `DayPanel.tsx`와 스타일을 만든다.** 이 시점에는 어느 화면도 이 부품을 쓰지 않는다.

- [ ] **Step 2: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/events/calendar/DayPanel.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/events/calendar/DayPanel.module.scss`
Expected: `ok`

Run: `grep -n "key={" components/events/calendar/DayPanel.tsx`
Expected: 카드의 key가 `item.event.id`, 묶음의 key가 `section.id`. `index`를 key로 쓴 줄이 없다.

관리자가 화면에서 볼 것(작업 8 뒤. `now`를 목업과 맞췄을 때. 작업 9 Step 4):
  1. 11월 20일: 제목 "11월 20일 금요일", 아래에 "접수 마감 9건 · 열리는 행사 1건", "이날 접수를 마감해요" 9장과 "이날 열려요" 1장. 썸네일 264px, 제목 18.5px. 1040px 아래로 줄이면 썸네일 200px.
  2. 11월 13일(오늘): 둘째 묶음의 제목이 "오늘 열리거나 진행 중이에요".
  3. 11월 6일(지난 날): "이날 접수를 마감했어요", "이날 열렸어요", "열린 행사 N건". 카드가 흐리고 칩이 "접수 종료"·"행사 종료".
  4. 날짜 제목 옆 ‹ ›는 행사 있는 날만 넘긴다. 이 달의 첫 행사일에서 ‹, 마지막 행사일에서 ›가 흐리고 눌리지 않는다.
  5. 카드의 어디를 눌러도 상세로 가고, 북마크·공유는 상세로 가지 않는다(3단계 카드 그대로).
  6. 토요일은 파랑, 일요일은 빨강.

---

### Task 7: 보기 전환에서 날짜 넘겨주기

목업 기준: `app.js:302-309`의 `setView`(캘린더로 갈 때 `cday = active`, 타임라인으로 갈 때 `go(cday)`).

**어디에 날짜를 두는가**

- **타임라인 → 캘린더: 주소의 `day`.** 캘린더의 고른 날은 주소에 있어야 상세에 다녀오거나 새로 고쳐도 그대로다(설명 페이지: "상세에서 돌아오면 캘린더와 고른 날짜가 그대로"). 보기 전환은 그 주소를 만들어 가기만 하면 된다.
- **캘린더 → 타임라인: `EventContext`의 `focusDay`(한 번 쓰고 비운다).** 타임라인의 "보고 있는 날"은 스크롤을 따라 바뀌는 값이라 주소에 둘 수 없다(`/events?day=…`로 두면 스크롤할수록 주소와 어긋나고, 날짜마다 CDN 캐시가 따로 생긴다). 보기 전환 버튼을 누른 순간에만 넘기고 타임라인이 받자마자 비우므로, 헤더의 "행사 일정"으로 들어오거나 상세에 다녀왔을 때는 따라오지 않는다(Review Focus 4).

**Files:**
- Modify: `context/event.tsx:4-26`(인터페이스), `:28-50`(기본값), `:64-65` 아래(상태), `:126-128` 아래(메서드), `:130-152`(`contextValue`)
- Modify: `components/events/calendar/ViewToggle.tsx:1-33`(import, props, `switchTo`)
- Modify: `components/events/timeline/DateNav.tsx:153`
- Modify: `components/events/timeline/EventTimeline.tsx:62-63`, `:169-171`(`flush`), `:235-237` 아래

**Interfaces:**
- Consumes: `toCalendarHref`·`toTimelineHref`(Task 3), `toKstNaive`(`kst.ts`)
- Produces:

```ts
// context/event.tsx — 값 둘 추가
focusDay: string | null;                       // 타임라인이 열리자마자 이동할 날. 처음 값 null
handleFocusDay: (key: string | null) => void;

// ViewToggle.tsx
export type ViewMode = 'list' | 'calendar';    // 그대로
const ViewToggle: (props: {
  current: ViewMode;
  dayKey?: string;      // 지금 보고 있는(고른) 날. 넘기지 않으면 날짜 없이 전환한다
}) => JSX.Element;
```

- [ ] **Step 0: 고치기 전의 사본을 둔다**(작업 4와 같은 이유). `mkdir -p /tmp/s5-task7 && cp components/events/timeline/EventTimeline.tsx components/events/timeline/DateNav.tsx /tmp/s5-task7/`

- [ ] **Step 1: `context/event.tsx`에 `focusDay`·`handleFocusDay`를 더한다.** 인터페이스, `defaultValue`(`focusDay: null`, 빈 함수), `useState<string | null>(null)`, `contextValue`. 기존 값과 메서드는 건드리지 않는다.

- [ ] **Step 2: `ViewToggle.tsx`의 `switchTo`를 바꾼다.** 마크업(`:35-58`)과 스타일은 건드리지 않는다. `dayjs` import(`:2`)를 지우고 `useContext`·`EventContext`·`toKstNaive`·`toCalendarHref`·`toTimelineHref`를 가져온다.

```ts
const switchTo = (mode: ViewMode) => {
  if (mode === current) return;
  const todayKey = toKstNaive(Date.now()).slice(0, 10);
  if (mode === 'list') {
    handleFocusDay(dayKey ?? null);
    router.push(toTimelineHref({ query: router.query, todayKey }));
  } else {
    router.push(toCalendarHref({ query: router.query, dayKey, todayKey }));
  }
};
```

  - 지금과 달라지는 것 세 가지: ① 캘린더로 갈 때 연·월이 보던 날짜의 달이 되고 `day`가 붙는다. ② 타임라인으로 갈 때, 지난 달을 보고 있었으면 `/events?year=&month=`(3단계의 "다른 달 보기")로 간다. 지금은 늘 `/events`다. ③ 타임라인으로 갈 때 필터가 걸려 있으면 `/search?…`로 간다. 지금은 `/events?tag=…`로 가서 주소에는 필터가 남지만 화면에서는 풀려 보인다("확인이 필요한 것" 3).
  - `ViewToggle`을 쓰는 다른 두 곳(`CalendarHeader.tsx:40`, 죽은 코드 `EventFilter.tsx:48`)은 `dayKey` 없이 그대로 컴파일된다.

- [ ] **Step 3: `DateNav.tsx:153`** `<ViewToggle current={view} />` → `<ViewToggle current={view} dayKey={activeKey} />`. 다른 줄은 건드리지 않는다.

- [ ] **Step 4: `EventTimeline.tsx`가 `focusDay`를 받아 이동하게 한다.** 세 군데에 더하기만 한다.
  - `:62-63`의 `useContext(EventContext)`에서 `focusDay`, `handleFocusDay`도 꺼낸다.
  - `flush`(`:169-192`)의 `if (wanted === null) return;` 바로 아래에 `if (month && monthly.isLoading) return;`을 넣는다. 다른 달의 행사를 불러오는 동안 묶음이 비어 있어 가려는 날짜가 버려지는 것을 막는다(불러온 뒤 `:235-237`의 `useEffect`가 다시 부른다).
  - `:235-237`의 `useEffect` **아래에** 마운트 때 한 번 도는 `useEffect`를 넣는다: `focusDay`가 있으면 `pendingRef.current = focusDay`, `handleFocusDay(null)`, 그리고 `requestAnimationFrame`으로 **다음 프레임에** `flushRef.current()`(날짜 띠의 높이를 잰 뒤에 이동해야 자리가 맞는다). 정리 함수에서 `cancelAnimationFrame`. 의존 배열은 `[]`.
  - `:235-237`보다 위에 두면 그 `useEffect`가 같은 차례에 먼저 `flush`를 불러 띠 높이를 재기 전에 이동한다. 순서를 지킨다.
  - 지난 날짜로 넘어오면 `flush`가 지금처럼 "지난 행사"를 펼친 뒤 이동한다(`:182-186`). 새로 쓸 것이 없다.

- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/events/calendar/ViewToggle.tsx components/events/timeline/DateNav.tsx components/events/timeline/EventTimeline.tsx`
Expected: 오류 없음 (`ViewToggle.tsx`에 있던 "안 쓰는 변수" 오류 3개는 `switchTo`를 바꾸면서 없어진다)

Run: `npx eslint context/event.tsx | grep -c " error "`
Expected: `14` — 이 단계 전부터 있던 13개에 `defaultValue`의 빈 함수 `handleFocusDay` 하나가 더해진 것뿐이다(다른 기본값과 같은 꼴). 다른 종류의 오류가 늘지 않았다

Run: `grep -n "dayjs" components/events/calendar/ViewToggle.tsx`
Expected: 결과 없음

Run: `for f in EventTimeline.tsx DateNav.tsx; do echo "== $f"; diff /tmp/s5-task7/$f components/events/timeline/$f | grep "^<"; done; rm -r /tmp/s5-task7`
Expected: 없어진 줄(`<`)이 `DateNav.tsx`의 `<ViewToggle current={view} />` 한 줄과 `EventTimeline.tsx`의 `useContext` 구조 분해 줄뿐이다(나머지는 더한 줄)

관리자가 화면에서 볼 것(작업 8 뒤. Review Focus 4):
  1. `/events`에서 스크롤해 11월 20일 묶음을 보다가 "캘린더" → 주소가 `/events?view=calendar&year=2026&month=11&day=2026-11-20`이고 20일이 골라져 있다. 12월 묶음을 보다가 누르면 12월 달력이 열린다.
  2. 캘린더에서 25일을 고르고 "타임라인" → `/events`로 가서 25일 묶음이 날짜 띠 바로 아래에 온다. 띠의 선택도 25일이다.
  3. 캘린더에서 지난 날(오늘보다 앞)을 고르고 "타임라인" → "지난 행사"가 펼쳐지고 그날로 이동한다.
  4. 캘린더에서 지난 달(‹)로 가 날짜를 고르고 "타임라인" → `/events?year=…&month=…`로 가서 뼈대가 잠깐 보인 뒤 그날 묶음으로 이동한다.
  5. **따라오면 안 되는 경우:** 캘린더에서 날짜를 고른 뒤 헤더의 "행사 일정"이나 로고로 `/events`에 가면 맨 위(오늘)에 있다. 2번을 한 뒤 다른 날짜로 스크롤하고, 카드를 눌러 상세에 갔다가 뒤로 오면 떠나기 전 자리다(25일로 튀지 않는다).
  6. `/search?kwd=AI`에서 "캘린더" → `/events?view=calendar&…&day=…&kwd=AI`이고 달력의 건수가 검색 결과만 센 값이다. 다시 "타임라인" → `/search?kwd=AI`.
  7. 검색어에 띄어쓰기가 있을 때(`/search?kwd=카카오%20테크`) 캘린더에 갔다 와도 검색칸의 글자와 결과가 같다(Review Focus 3).

---

### Task 8: 조립 · `/events?view=calendar` 바꾸기

목업 기준: `app.js:198`(캘린더의 윗줄에는 보기 전환만), `:209-213`의 `chipsHtml`(`:212`: 캘린더에서는 "지난 행사" 칩 없음), `:284-301`의 `calHtml`·`setCday`·`setMonth`, `app.css:313-315`, `:363`, `:367-368`, `:421-422`, `:448-458`.

**Files:**
- Create: `components/events/calendar/EventCalendar.tsx`, `EventCalendar.module.scss`
- Modify: `pages/events.tsx:6`(import), `:11`(`dayjs` import 지움), `:47-52`(`CalendarProps`), `:62-64`(목록 조회), `:126-133`(캘린더 분기의 본문), `:160-182`(`getServerSideProps`의 캘린더 분기)

**Interfaces:**
- Consumes: Task 1~7의 모든 것. `useNow`(`lib/hooks/useNow.ts`), `useFavorite`(`lib/hooks/useFavorite.tsx`), `readFilters`(`lib/utils/timeline/filters.ts`), `EventContext`의 `newOnly`, `LoginModal`(`isOpen`, `onClose`)
- Produces:

```ts
function EventCalendar(props: {
  year: number;
  month: number;                 // 1~12
  events: Event[] | undefined;   // /front/v2/events/{year}/{month} 의 응답
  isError: boolean;
  now: string;                   // 서버가 그린 시각 (한국 시간, 'YYYY-MM-DDTHH:mm')
}): JSX.Element;
```

- Produces (`pages/events.tsx`): 캘린더 보기의 props에 `now: string` 추가.

**값 만들기** (그릴 때마다 계산. `useMemo`로 묶는다)

1. `now = useNow(props.now)`, `todayKey = now.slice(0, 10)`, `thisMonthKey = todayKey.slice(0, 7)`.
2. `listPath = listPathOf(router.query)`, `filters = readFilters(listPath)`.
3. `wanted = readDayParam(router.query, year, month)`.
4. `list = Array.isArray(events) ? events : []`. 서버가 오류 본문(객체)을 주면 배열이 아니다(예: 서버가 받지 않는 연도. "확인이 필요한 것" 6).
5. `view = buildCalendarView({ events: list, filters, newOnly, year, month, wanted, now })` (`newOnly`는 `EventContext`).
6. `failed = list.length === 0 && (isError || (events !== undefined && !Array.isArray(events)))`.
7. `yearRange = { min: Math.min(올해 − 1, year), max: Math.max(올해 + 1, year) }` (올해는 `todayKey`의 연도. 아래쪽은 3단계 타임라인과 같다).
8. `pending`(상태. 달을 불러오는 중).

**구성**

```
<div class="calendar">                                   ← de-container
  <div class="top">                                      ← position: relative
    <div class="switch"><ViewToggle current="calendar" dayKey={view.selectedKey ?? undefined} /></div>
    <FilterBar variant="calendar" filters={filters} asPath={listPath} onNavigate={…}
               searchOpen newCount={view.newCount} pastCount={0} hidePastChip />
  </div>
  <div class="body">                                     ← 두 칸
    <aside class="aside" aria-label="월 달력"><HeatMonth … busy={pending} /></aside>
    <div class="pane [is-busy]" [aria-busy="true"]>
      [pending일 때] <span class="sr-only" role="status">행사를 불러오는 중이에요</span>
      <DayPanel … />
    </div>
  </div>
  <LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
</div>
```

- 날짜 띠(`DateNav`)는 그리지 않는다. 보기 전환을 마크업에서 필터 줄보다 앞에 둔다(목업의 순서. Tab: 보기 전환 → 검색칸 → 칩).
- `HeatMonth`: `year`, `month`, `weeks={view.weeks}`, `keys={view.keys}`, `selectedKey={view.selectedKey}`, `thisMonthKey`, `yearRange`, `busy={pending}`, 아래 "동작"의 함수.
- `DayPanel`: `month`, `selectedKey`, `sections`, `summary`, `prevKey`, `nextKey`는 `view`에서, `failed`, `showTodayAction={view.monthKey !== thisMonthKey}`, `useFavorite()`의 `isFavorite`·`toggleFavorite`, 아래의 함수.
- `FilterBar`의 `searchOpen`은 늘 참(캘린더에서는 모바일에서도 검색칸이 윗줄에 늘 보인다. 검색 아이콘이 없다).

**동작**

- **날짜 고르기** `selectDay(key)` (달력의 칸, 방향키, 날짜 제목 옆 ‹ ›, 빈 날의 버튼이 함께 쓴다): `pending`이면 아무것도 하지 않는다. `router.replace(calendarHref({ year, month, day: key }, listPath), undefined, { shallow: true, scroll: false })`.
  - **`push`가 아니라 `replace`다**(Review Focus 3). 날짜를 누를 때마다 방문 기록이 쌓이지 않아 뒤로 가기 한 번에 캘린더를 벗어나고, 상세에 다녀오면 마지막에 고른 날이 그대로다.
  - `shallow`라 서버를 거치지 않는다(같은 달의 데이터를 그대로 쓴다).
  - 고른 날은 **주소에서만 읽는다**(`wanted` → `view.selectedKey`). 상태로 따로 들고 있지 않는다.
- **달 바꾸기** `goMonth({ year, month })` (‹ ›, 월 선택): 지금 달과 같거나 `pending`이면 아무것도 하지 않는다. `pending`을 켜고 `router.push(calendarHref({ year, month }, listPath), undefined, { scroll: false })`. 끝나면(성공이든 실패든) `pending`을 끈다. 언마운트된 뒤에는 상태를 바꾸지 않는다(마운트 여부를 `ref`로 본다).
  - **`day`를 넣지 않는다.** 새 달의 데이터가 오면 `resolveDay`가 그 달의 첫 행사일(이번 달이면 오늘)을 고른다.
  - `shallow`가 아니다. 지금처럼 `getServerSideProps`가 그 달을 받아 온다(Review Focus 5: 그 사이 달력과 목록이 흐려지고 눌리지 않는다).
- **오늘** `goToday()`: 이번 달이 아니면 `goMonth(이번 달)`. 이번 달이면 주소에 `day`가 있을 때만 `router.replace(calendarHref({ year, month }, listPath), undefined, { shallow: true, scroll: false })`로 `day`를 뺀다(오늘, 오늘 행사가 없으면 그 뒤 첫 행사일이 골라진다).
- **필터·검색** `FilterBar`의 `onNavigate(url)`: `router.push(calendarHref({ year, month, day: wanted }, url), undefined, { shallow: true, scroll: false })`. `FilterBar`는 `asPath={listPath}`(`/events` 또는 `/search?…`)를 기준으로 지금과 같은 주소(`/events`, `/search?…`)를 만들고, 그것을 캘린더 주소로 바꿔 간다. **캘린더를 벗어나지 않는다**(Review Focus 3).
  - `day`는 주소에 있던 것(`wanted`)만 넘긴다. 사용자가 날짜를 고른 적이 있으면 필터를 바꿔도 그날이 유지되고(비면 "이날은 조건에 맞는 행사가 없어요"), 고른 적이 없으면 걸러진 행사 가운데서 기본 날짜를 다시 고른다. "새로 올라온 행사" 칩(`EventContext`의 `newOnly`)도 같은 규칙으로 움직인다.
- 관심: `useFavorite()`를 한 번 부르고 `LoginModal`을 하나 그린다(`EventTimeline`과 같다).

**값** (`EventCalendar.module.scss`)

| 부분 | PC | 1040px 이하 | 621~860px | 620px 이하 |
|---|---|---|---|---|
| 바깥(`.calendar`) | `de-container`, `padding-bottom: 64px;` **`overflow`를 걸지 않는다** | 같음 | 같음 | 같음 |
| 윗줄(`.top`) | `position: relative;` | 같음 | 같음 | 같음 |
| 보기 전환(`.switch`) | `position: absolute; right: 0; top: 16px; z-index: 1;` | 같음 | `top: 12px` | `top: 12px` |
| 두 칸(`.body`) | `display: grid; grid-template-columns: 372px minmax(0, 1fr); gap: 48px; align-items: start; padding: 24px 0 8px;` | `grid-template-columns: 320px minmax(0, 1fr); gap: 32px;` | `grid-template-columns: 300px minmax(0, 1fr); gap: 26px; padding-top: 18px;` | `display: block; padding-top: 14px;` |
| 달력 칸(`.aside`) | `position: sticky; top: 20px;` | 같음 | `top: 14px` | `position: static` |
| 목록 칸(`.pane`) | `min-width: 0;` 불러오는 중(`is-busy`)에는 `opacity: 0.45; pointer-events: none; transition: opacity 0.15s;` | 같음 | 같음 | 같음 |
| 화면에 보이지 않는 글자(`.sr-only`) | `position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;` | | | |

- **달력을 화면에 붙이는 자리(Review Focus 1):** 헤더는 스크롤하면 올라가고(1단계) 캘린더에는 날짜 띠가 없으므로 `top`은 띠 높이 없이 20px(621~860px은 14px)이다. 목업의 마지막 값과 같다(`app.css:453`, `:458`).
- **목업의 `max-height: calc(100vh - 36px); overflow-y: auto;`는 화면 높이가 낮을 때만 건다:** `@media (min-width: 861px) and (max-height: 520px) { .aside { max-height: calc(100vh - 36px); overflow-y: auto; scrollbar-width: none; padding: 3px; margin: -3px; &::-webkit-scrollbar { display: none; } } }`. 늘 걸어 두면 달력 칸이 스크롤 영역이 되어 칸의 한 줄 설명·고른 날 테두리·월 선택 풍선이 잘린다(Review Focus 1). 달력의 높이는 400px 안팎이라 보통 화면에서는 필요 없다.
- `de-reduced-motion`: `.pane`의 transition 없음.
- 1단계의 안내(토스트)는 화면 위쪽에 고정으로 떠서 붙어 있는 달력의 머리를 잠깐 덮는다. 타임라인의 날짜 띠와 같은 일이고 9단계에서 함께 다듬는다.

- [ ] **Step 1: `EventCalendar`와 스타일을 만든다.** 이 시점에는 아직 어느 페이지도 이 부품을 쓰지 않는다.

**`pages/events.tsx`**

- [ ] **Step 2: `getServerSideProps`의 캘린더 분기(`:160-182`)를 고친다.** 기본 연·월을 한국 시간으로 정하고 `now`를 내려 준다. 월별 조회와 `Cache-Control`은 그대로다.

```ts
if (view === 'calendar') {
  const now = toKstNaive(Date.now());
  const yearParam = Number(context.query.year);
  const monthParam = Number(context.query.month);
  const year =
    Number.isFinite(yearParam) && yearParam > 0
      ? yearParam
      : Number(now.slice(0, 4));
  const month =
    Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
      ? monthParam
      : Number(now.slice(5, 7));
  // fetch와 return은 지금과 같고, props에 now를 더한다
}
```

  - `CalendarProps`(`:47-52`)에 `now: string`. `dayjs` import(`:11`)는 쓰는 곳이 없어지므로 지운다(Review Focus 2).

- [ ] **Step 3: 목록 조회(`:62-64`)가 캘린더 보기에서 나가지 않게 한다.** `useScheduledEvents(props.view === 'list' ? props.fallbackData : undefined, props.view === 'list')`. 지금은 캘린더 보기에서도 쓰지 않는 목록을 한 번 받아 온다.

- [ ] **Step 4: 캘린더 분기의 본문(`:126-133`)을 바꾼다.** `modalState.currentModal === 0` 게이팅과 `<Banner />`는 그대로 두고, `<section className={cn('section')}>`과 `<CalendarView />` 대신 아래를 그린다(`.section`은 옛 폭과 옛 여백을 쓴다. 타임라인 분기와 같이 밖에 둔다).

```tsx
<EventCalendar
  year={props.year}
  month={props.month}
  events={calendarSWR.monthlyEvent}
  isError={Boolean(calendarSWR.isError)}
  now={props.now}
/>
```

  - `CalendarView` import(`:6`)를 `EventCalendar`로 바꾼다. `CalendarView.tsx`는 남긴다.
  - 모달 셋의 렌더, `body` 스타일을 만지는 `useEffect`, `<Head>`는 그대로 둔다.

- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint pages/events.tsx components/events/calendar/EventCalendar.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/events/calendar/EventCalendar.module.scss`
Expected: `ok`

Run: `grep -n "dayjs\|CalendarView\|cn('section')" pages/events.tsx`
Expected: 결과 없음

Run: `grep -rn "innerWidth\|windowX\|new Date(\|dayjs\|fetch(" components/events/calendar/EventCalendar.tsx components/events/calendar/HeatMonth.tsx components/events/calendar/HeatLegend.tsx components/events/calendar/DayPanel.tsx`
Expected: 결과 없음

Run: `grep -n "router.push\|router.replace" components/events/calendar/EventCalendar.tsx`
Expected: 날짜 고르기와 오늘은 `replace`(+`shallow: true`), 필터는 `push`(+`shallow: true`), 달 바꾸기는 `push`(`shallow` 없음). 모두 `scroll: false`.

관리자가 화면에서 볼 것(`/events?view=calendar`. 비교: `app.html?view=cal#main`, `…&theme=dark…`. 1280×900과 390×844, 밝게·어둡게):
  1. 윗줄 왼쪽에 검색칸(300px), 오른쪽에 "타임라인 | 캘린더", 그 아랫줄에 칩. 날짜 띠와 구분선이 없다. "지난 행사 N건 보기" 칩이 없다. 그 아래 왼쪽에 달력, 오른쪽에 그날의 행사.
  2. **목록을 내리면 달력이 화면 위 20px 자리에 붙어 따라온다**(Review Focus 1). 행사가 한두 건뿐인 날에도 달력이 제자리에 있고 푸터와 겹치지 않는다. 700px 폭에서는 두 칸(달력 300px)이고 달력이 붙는다. 390px에서는 달력이 위, 목록이 아래이고 붙지 않는다. 390px에서 보기 전환은 아이콘 두 개이고 검색칸이 그 왼쪽에 늘 보인다.
  3. 날짜를 누르면 주소에 `day=`가 붙고 오른쪽이 바뀐다. 네트워크 탭에 요청이 없다. 날짜를 여러 번 바꾼 뒤 **뒤로 가기를 한 번** 누르면 캘린더에 오기 전 화면이다(Review Focus 3). 카드를 눌러 상세에 갔다가 뒤로 오면 같은 달, 같은 날이다.
  4. ›를 누르면 달력과 목록이 잠깐 흐려졌다가 다음 달이 열리고 그 달의 첫 행사일이 골라진다. "오늘"을 누르면 이번 달과 오늘(오늘 행사가 없으면 그 뒤 첫 행사일). 주소는 `year`·`month`만 바뀌고 `day`가 없다. **네트워크를 느리게(Slow 3G) 하고 ›를 빠르게 세 번 눌러도 한 달만 넘어가고**, 흐려진 동안 날짜가 눌리지 않는다(Review Focus 5).
  5. "AI" 칩을 누르면 **캘린더에 머문 채**(주소는 `/events?view=calendar&…&tag=AI`) 달력의 색과 숫자가 AI 행사만 센 값으로 바뀐다(Review Focus 3). "전체"를 누르면 돌아온다. 검색칸에 `카카오 테크`를 넣고 Enter → 달력이 걸러지고, 새로 고쳐도 같은 모습이다(서버가 보낸 HTML부터 걸러져 있다).
  6. 날짜를 하나 고른 뒤 그날 행사에 없는 주제의 칩을 누르면 "이날은 조건에 맞는 행사가 없어요"와 "다음 행사가 있는 N월 N일 보기"가 나오고, 누르면 그날로 간다. 이때도 Tab으로 달력의 칸 하나에 들어갈 수 있다(Review Focus 5).
  7. "새로 올라온 행사 N"을 켜면 달력에 새 행사가 있는 날만 색이 남는다. 행사가 없는 달(먼 달)로 가면 "N월에는 조건에 맞는 행사가 없어요"와 "오늘로 돌아가기"가 나온다. 이번 달이 비어 있을 때는 버튼이 없다.
  8. `/events?view=calendar`를 처음 열 때 네트워크 탭에 `/front/v2/events/current` 요청이 없다.
  9. 콘솔에 하이드레이션 경고가 없다. 컴퓨터의 시계를 23:59로 맞추고 화면을 열어 둔 채 1~2분 기다리면 "오늘" 알약이 다음 날로 옮겨 간다(Review Focus 2).
  10. `/calender?year=2026&month=11`(옛 주소)로 들어오면 새 캘린더가 열린다.
  11. 작업 5·6·7의 확인 항목.

---

### Task 9: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인** (`pnpm build`는 여기서 한 번만)

Run:
```bash
npx tsc --noEmit
pnpm test
npx eslint pages/events.tsx lib/hooks/useSWR.tsx components/events/timeline components/events/calendar/ViewToggle.tsx components/events/calendar/EventCalendar.tsx components/events/calendar/HeatMonth.tsx components/events/calendar/HeatLegend.tsx components/events/calendar/DayPanel.tsx components/events/calendar/utils/calendarMonth.ts components/events/calendar/utils/calendarDay.ts components/events/calendar/utils/calendarUrl.ts components/events/calendar/utils/buildCalendarView.ts components/events/calendar/utils/__tests__/calendarMonth.test.ts components/events/calendar/utils/__tests__/calendarDay.test.ts components/events/calendar/utils/__tests__/calendarUrl.test.ts components/events/calendar/utils/__tests__/buildCalendarView.test.ts
pnpm build
```
Expected: 모두 통과. 테스트는 이 단계에서 63개가 늘어난다(calendarMonth 11, calendarDay 22, calendarUrl 18, buildCalendarView 12). `context/event.tsx`는 작업 7의 확인(오류 14개, 종류는 전과 같음)으로 본다.

Run: `TZ=UTC pnpm test -- components/events/calendar lib/utils/timeline`
Expected: 통과(서버와 같은 시간대에서도 같은 결과)

Run: SCSS 확인 — `components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss components/events/calendar/DayPanel.module.scss components/events/calendar/EventCalendar.module.scss components/events/timeline/FilterBar.module.scss components/events/timeline/EventCard.module.scss components/events/timeline/TimelineEmpty.module.scss`
Expected: 모두 `ok`

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지**

Run: `grep -nE "var\(--(primary|gray-|vapor-|ktb-|toggle-)|@include (mobile|tablet|laptop)\b|#[0-9a-fA-F]{3,6}\b" components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss components/events/calendar/DayPanel.module.scss components/events/calendar/EventCalendar.module.scss`
Expected: `HeatMonth.module.scss`의 색 단계 값(Global Constraints의 표)과 `#fff`만 나온다.

Run: `grep -n "rem\b" components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss components/events/calendar/DayPanel.module.scss components/events/calendar/EventCalendar.module.scss`
Expected: 결과 없음(크기는 px)

Run: `head -2 components/events/calendar/HeatMonth.module.scss components/events/calendar/HeatLegend.module.scss components/events/calendar/DayPanel.module.scss components/events/calendar/EventCalendar.module.scss | grep import`
Expected: 파일마다 `@import '~styles/_variables.scss';`, `@import '~styles/_mixin.scss';` 순서

Run: `grep -rn "CalendarView\|CalendarHeader\|CalendarGrid\|CalendarDotGrid\|DayDetailSheet\|layoutMultiDayEvents\|tagColor" pages components --include='*.tsx' --include='*.ts' | grep -v "^components/events/calendar/\(CalendarView\|CalendarHeader\|CalendarGrid\|CalendarDotGrid\|DayDetailSheet\)\.tsx\|^components/events/calendar/utils/"`
Expected: 결과 없음(옛 부품을 쓰는 곳이 옛 부품끼리뿐이다)

Run: `git status --short | grep "^ D\|^D "`
Expected: 결과 없음(지운 파일이 없다)

이 단계에서 만들거나 고친 파일이 File Structure에 적힌 것뿐인지 본다. `pages/event/detail/*`, `styles/EventDetail.module.scss`, `components/common/banner/*`, `lib/utils/UrlUtil.tsx`, `lib/utils/timeline/*`, 옛 캘린더 부품은 이 단계에서 열어 고치지 않는다(다른 단계가 바꾼 것은 그대로 둔다).

- [ ] **Step 3: 설명 페이지의 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

| 설명 페이지 `cal` 절 | 요구 | 맡은 작업 |
|---|---|---|
| 규칙 1 | 왼쪽 달력 한 달(목록을 내려도 붙음), 오른쪽 고른 날의 행사 | 5, 6, 8 |
| 규칙 1 | 색이 진할수록 행사가 많음(1~2, 3~4, 5~7, 8건 이상), 칸 안의 숫자가 건수 | 1, 3, 5 |
| (i) | 눌렀을 때만 뜨고 바깥·닫기·Esc로 닫힘, 꼬리가 (i)를 가리킴 | 5 |
| 규칙 2 | 달 이동은 달력 안에서: ‹ 오늘 ›, "2026년 11월"을 누르면 열두 달 | 4, 5, 8 |
| 규칙 2 | 달을 바꾸면 그 달의 첫 행사일(이번 달이면 오늘)이 골라짐 | 2, 3, 8 |
| 규칙 3 | 윗줄은 검색칸과 보기 전환, 칩은 아랫줄, 구분선과 날짜 띠 없음 | 4, 8 |
| 규칙 4 | 행사를 누르면 상세로, 썸네일 264px | 4, 6 |
| 규칙 4 | 상세에서 돌아오면 캘린더와 고른 날짜가 그대로 | 3, 8 (주소의 `day`) |
| 규칙 5 | 두 묶음, 지난 날짜면 "마감했어요"·"열렸어요", 끝난 행사는 흐리게 | 2, 6 |
| 규칙 6 | 오늘은 검정 알약, 고른 날은 검정 테두리, 다른 날을 골라도 오늘 표시는 남음 | 5 |
| 규칙 7 | 행사 없는 날은 옅고 눌리지 않음, 날짜 제목 옆 ‹ ›는 행사 있는 날만 | 2, 5, 6 |
| 규칙 7 | 필터 때문에 고른 날이 비면 안내와 다음 행사일로 가는 버튼 | 2, 3, 6, 8 |
| 규칙 8 | 칸에 올리면 "11월 20일 금요일 · 행사 10건" | 1, 5 |
| 규칙 9 | 필터와 검색이 달력에도 적용, "지난 행사 보기" 칩은 숨김 | 3, 4, 8 |
| 규칙 10 | 타임라인과 오갈 때 보던 날짜를 유지 | 3, 7 |
| 규칙 11 | 모바일: 달력이 위, 목록이 아래. 보기 전환은 아이콘 둘 | 5, 6, 8 (아이콘은 3단계에서 이미) |
| 규칙 12 | 방향키로 날짜 이동(좌우 하루, 위아래 한 주, 행사 없는 날은 건너뜀) | 2, 5 |
| 챙길 것 1 | 이름 막대·점 달력을 색 농도 달력 하나로, 주소는 그대로 | 8 |
| 챙길 것 2 | 월별 조회를 그대로, 달마다의 건수는 없음 | 5, 8 ("정한 것" 6) |
| 챙길 것 3 | 건수는 타임라인과 같은 기준, 여러 날 행사를 날마다 세지 않음 | 3 |
| 챙길 것 4 | 색 단계의 기준을 한 곳에서 바꿀 수 있게 | 1 (`HEAT_STEPS`) |
| 챙길 것 5 | 데이터가 없는 달은 빈 달력 | 6 (빈 달 안내) |
| 챙길 것 6 | 좁은 화면에서 숫자가 읽히는지 | 아래 Step 4에서 360px로 본다 |
| `state` | 어두운 화면 | 5 (색 단계의 어두운 값), 나머지는 `--de-*` |
| `state` | 새 행사만 | 3, 8 |
| `state` | 불러오는 중 | 5, 8 (달을 바꾸는 동안 흐리게) |

- [ ] **Step 4: 관리자가 화면에서 볼 것을 한 번에 모은다.** 작업 4~8의 "관리자가 화면에서 볼 것"과 Review Focus 다섯 가지를 한 목록으로 묶어 보고한다. 프로덕션 빌드(`pnpm build` 뒤 `pnpm start`)로, 1280×900·1040×900·700×900·390×844·360×800에서, 밝게·어둡게.
  - 데이터는 `redesign-mock-api`(목업의 2026-11-13 스냅샷)를 쓰면 목업과 같은 행사로 비교할 수 있다. **그 전에 가짜 API의 월별 경로를 서버와 같게 고쳐야 한다**: 지금은 "시작이 그 달인 행사"만 주는데, 서버는 "시작 또는 종료가 그 달인 행사"를 준다("정한 것" 7). 고치지 않으면 11월에 99건이 아니라 33건만 보인다(20일이 10건이 아니라 3건).
  - "오늘"은 실제 날짜라 스냅샷의 행사는 모두 지난 행사로 보인다. 목업과 날짜까지 맞춰 보려면 `EventCalendar`에 넘기는 `now`를 잠깐 `'2026-11-13T10:00'`으로 고정하고(그리고 `useNow`가 덮어쓰지 않게) 본 뒤 되돌린다. 이때 11월 6일 11건, 13일 6건, 20일 10건이면 목업과 같다.

**이 단계가 끝난 뒤의 모습:** `/events?view=calendar`가 새 모양입니다. 그 위의 배너는 옛 모양(4단계)이고, 상세 화면은 6단계가 따로 바꿉니다.

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

**쓰는 곳이 없어진 파일**
- `components/events/calendar/CalendarView.tsx`, `CalendarHeader.tsx`, `CalendarGrid.tsx`, `CalendarDotGrid.tsx`, `DayDetailSheet.tsx`
- `components/events/calendar/CalendarView.module.scss` (3단계가 남겨 둔 `.viewToggle*` 포함)
- `components/events/calendar/utils/layoutMultiDayEvents.ts`, `tagColor.ts`와 테스트 `__tests__/layoutMultiDayEvents.test.ts`, `__tests__/tagColor.test.ts`
- `docs/superpowers/plans/2026-05-12-events-calendar-view.md`가 설명하는 옛 구조(문서는 남긴다. `CLAUDE.md`의 "캘린더 기능" 절은 9단계에서 새 구조로 고쳐 쓴다)

**쓰는 곳이 없어진 스타일·변수**
- `styles/Home.module.scss`의 `.section`과 `styles/_common.scss`의 `%section-container` (캘린더 분기가 마지막 사용처였다)
- `styles/Theme.scss`의 `--toggle-track-bg`, `--toggle-active-bg` (쓰는 곳이 `CalendarView.module.scss`뿐이다)

**남겨 두는 것**
- `components/events/calendar/utils/buildCalendarMatrix.ts`와 테스트 — 새 달력이 쓴다.
- `pages/calender.tsx` — 옛 주소 리다이렉트. 기본 연·월을 서버 시간(`dayjs()`)으로 정하는 것은 그대로 두었다(연·월이 없는 옛 주소로 매달 1일 0~9시에 들어올 때만 지난달이 열린다). 9단계에서 `toKstNaive`로 바꿀 수 있다.
- `dayjs` — `buildCalendarMatrix`와 다른 화면이 쓴다.

**이 단계에서 미룬 다듬기**
- 안내(토스트)가 화면에 붙은 달력의 머리를 잠깐 덮는 것(3단계의 날짜 띠와 함께).
- `aspect-ratio`를 모르는 브라우저(Safari 14 이하)에서는 달력 칸이 납작해진다.
- 달력 칸에 키보드로 들어갔을 때는 한 줄 설명이 뜨지 않는다(읽어 주는 문구는 `aria-label`에 있다).

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **새 부품은 새 이름으로 만들고 옛 캘린더 부품은 고치지 않는다.** 마지막 작업에서 페이지가 쓰는 부품만 바꾼다. 작업마다 화면이 동작하는 상태로 남는다.
2. **고른 날은 주소의 `day`에 둔다(캘린더 안에서는 `replace`).** 상세에 다녀오거나 새로 고쳐도 그대로이고, 날짜마다 방문 기록이 쌓이지 않는다. 서버가 보낸 HTML에도 고른 날의 행사가 들어 있다. `EventContext`에 두면 헤더로 다시 들어왔을 때 예전 날짜가 남는다.
3. **캘린더에서 타임라인으로 넘기는 날짜는 `EventContext`의 `focusDay`에 두고 한 번 쓰고 비운다.** 타임라인의 "보고 있는 날"은 스크롤 값이라 주소에 둘 수 없다. `EventTimeline`에는 값 읽기, 마운트 때의 `useEffect` 하나, `flush`의 한 줄을 더했다.
4. **필터·검색은 캘린더 주소에 지금과 같은 키로 둔다**(`/events?view=calendar&year=&month=&tag=AI&kwd=…`). 지금도 검색 화면에서 캘린더로 갈 때 이 키들이 따라온다. 바뀌는 것은 캘린더가 그것을 **읽는다**는 것과, 캘린더 안에서 칩을 눌렀을 때 `/search`로 나가지 않고 캘린더 주소 안에서 바뀐다는 것이다. `FilterBar`의 주소 계산(`parseUrl`·`initUrl`)은 그대로 쓰고, 기준 경로와 이동 방법만 밖에서 넣을 수 있게 했다. 타임라인에서는 지금처럼 `/search`로 간다.
5. **달 이동은 지금처럼 서버를 거친다**(`getServerSideProps`가 그 달을 받아 온다). 그 사이 달력과 목록을 흐리게 하고 누름을 막는다. 날짜 고르기와 필터는 서버를 거치지 않는다.
6. **캘린더 보기에서는 목록 조회(`/front/v2/events/current`)를 부르지 않는다.** 그래서 월 선택 풍선에는 **달 이름만** 보이고(받은 결정: 응답에 없는 달은 이름만), "새로 올라온 행사 N"의 N은 **보고 있는 달에 놓인** 새 행사 수다. 달력에 필요한 행사는 월별 조회에 다 들어 있고(아래 7), 목록 조회는 월 선택의 건수 말고는 쓸 곳이 없다. 지금 코드가 캘린더 보기에서도 목록을 받아 오던 것은 없앴다. 타임라인에서 넘어온 사용자는 월 선택에서 건수를 보다가 캘린더에서는 보지 못한다.
7. **월별 조회는 "시작 또는 종료가 그 달인 행사"를 준다고 보았다.** 서버 저장소(`Dev-Event-Server`, 로컬 `feature/image-opt-260924`)의 `DevEventQueryRepository.findDevEventByYearAndMonth`를 읽어 확인했다. 앞 달에 접수를 시작해 이번 달에 마감하는 행사는 들어온다. 이 기준으로 목업 스냅샷을 세면 11월의 날짜별 건수가 목업과 모두 같다(99건). 계획은 받은 것 가운데 그 달에 놓이는 것만 그린다. 운영 응답은 직접 확인하지 않았다("확인이 필요한 것" 5).
8. **방향키와 날짜 제목 옆 ‹ ›는 보고 있는 달 안에서만 움직인다.** 목업은 달을 넘어가지만(전체 데이터를 들고 있다) 실제로는 한 달치만 받는다. 달의 끝에서는 달력의 ›로 다음 달을 연다(그 달의 첫 행사일이 골라진다).
9. **"오늘" 버튼은 이번 달을 열고 기본 날짜를 고른다**(오늘, 오늘 행사가 없으면 그 뒤 첫 행사일). 목업은 행사가 없어도 오늘을 골라 빈 날 안내를 보여 준다.
10. **필터를 바꿔도 사용자가 고른 날은 유지한다.** 고른 적이 없으면(주소에 `day`가 없으면) 걸러진 행사 가운데서 기본 날짜를 다시 고른다.
11. **621~860px에서는 두 칸을 유지하고(달력 300px), 620px 이하에서 위아래로 놓는다.** 목업의 CSS가 그렇다(`app.css:416-424`, 2026-11-16). 카드·보기 전환·검색칸은 860px에서 모바일 모양으로 바뀐다("확인이 필요한 것" 2).
12. **불러오는 중은 뼈대가 아니라 흐리게.** 달을 바꾸는 동안에는 이전 달이 화면에 남아 있어, 뼈대로 바꿔 그리는 것보다 덜 흔들린다. 처음 열 때는 서버가 데이터를 넣어 보내므로 불러오는 모습이 없다.
13. **목업을 고쳐 옮긴 것**
    - 달력 칸의 `max-height`·`overflow-y: auto`를 화면 높이가 낮을 때만 건다(풍선·테두리가 잘리는 문제).
    - 월 버튼의 `aria-label`에서 "행사 N건"을 뺐다(건수 요약).
    - 빈 달 안내의 "오늘로 돌아가기"는 이번 달이 아닐 때만 보인다(이번 달에서는 눌러도 달라지는 것이 없다).
    - 480px 이하에서 칩 줄에 `flex-basis: 100%`를 걸지 않는다(화면 끝까지 넘기는 폭과 부딪친다).
    - 달력은 `aria-pressed` 버튼 묶음이 아니라 표(`role="grid"`)이고, 고른 날은 `aria-selected`, 오늘은 `aria-current="date"`, Tab이 멈추는 칸은 하나다.
    - `aria-live`를 날짜 제목과 한 줄에만 건다.
14. **하루의 묶음 제목은 목업의 세 가지를 그대로 쓴다.** 오늘은 "오늘 열리거나 진행 중이에요"(진행 중인 행사가 오늘에 놓이기 때문이다).
15. **같은 날 안의 카드 순서는 타임라인과 같다**(3단계의 `groupByDay`). 목업의 캘린더는 끝나는 시각 순이라 진행 중인 행사의 자리가 조금 다르다.
16. **캘린더로 넘어갈 때 화면은 맨 위로 간다**(Next의 기본 동작). 목업은 날짜 줄보다 아래에 있었을 때만 날짜 줄 자리로 옮긴다.
17. **기본 연·월은 한국 시간으로 정한다**(`getServerSideProps`, `ViewToggle`). 지금은 서버 시간(UTC)이라 매달 1일 0~9시에 지난달이 열린다.
18. **색 단계의 고정 색은 `HeatMonth.module.scss`의 지역 변수로 둔다.** `styles/Theme.scss`에 넣으면 `styles/__tests__/deTokens.test.ts`의 변수 목록을 함께 고쳐야 하고, 쓰는 곳이 이 부품 하나뿐이다.
19. **3단계 부품에 더한 것**: `EventCard`·`TimelineEmpty`의 CSS 변수 넷, `TimelineIcon`의 `info`, `MonthPicker`의 `className`, `FilterBar`의 `asPath`·`onNavigate`·`variant`, `useScheduledEvents`의 `enabled`, `DateNav`가 `ViewToggle`에 넘기는 `dayKey`, `EventTimeline`의 `focusDay` 받기. 넘기지 않으면 지금과 같다.

### 확인이 필요한 것

1. **날짜 제목 아래의 한 줄("접수 마감 9건 · 열리는 행사 1건").** 목업에 있어 그대로 넣었다(`app.js:277`). 다만 윗줄의 "접수 중 68건 · 오늘 마감 4건"을 빼 달라고 하신 것과 같은 성격의 문구다. 빼려면 `DayPanel`의 `<p>` 하나와 `daySummary`(테스트 한 묶음)를 지우면 된다.
2. **621~860px의 구성.** 설명 페이지와 요청은 "860px 이하는 달력이 위, 목록이 아래"인데 목업의 CSS는 621~860px에서 두 칸을 유지한다. 계획은 목업의 CSS를 따랐다(1280px과 390px의 비교에는 영향이 없다). 860px에서 바로 위아래로 놓으려면 `EventCalendar.module.scss`의 621~860px 규칙을 지우고 620px 규칙의 폭을 860px로 바꾸면 된다(`HeatMonth`의 칸 비율, `DayPanel`의 제목 크기·위 여백도 같은 폭으로).
3. **캘린더에서 타임라인으로 갈 때 필터가 걸려 있으면 `/search?…`로 간다.** 지금은 `/events?tag=…`로 가서 필터가 풀려 보인다. 캘린더가 필터를 적용하게 된 뒤로는 풀려 보이는 쪽이 어색해 바꿨다. 지금 동작을 지키려면 `toTimelineHref`에서 필터 분기(와 테스트 하나)를 빼면 된다.
4. **월 선택의 건수와 "새로 올라온 행사 N"**("정한 것" 6). 타임라인과 같은 숫자를 보이려면 캘린더 보기에서도 목록 조회를 불러야 한다(타임라인에서 넘어온 경우에는 이미 받아 둔 것을 쓰므로 요청이 늘지 않고, 캘린더 주소로 바로 들어온 경우에만 한 번 나간다). 그렇게 하려면 `pages/events.tsx`에서 `enabled`를 빼고 `EventCalendar`에 `monthTotals`와 전체 `newCount`를 넘기면 된다.
5. **월별 조회로 받지 못하는 행사.** 서버 기준("정한 것" 7)으로는 **앞 달에 시작해 다음 달 이후에 끝나는, 지금 진행 중인 일시형 행사**가 이번 달 응답에 없다. 타임라인에서는 오늘 묶음에 보이는데 캘린더의 오늘 칸에는 세지 않는다(한 달 넘게 이어지는 일시형 행사만 해당한다). 운영 서버가 로컬 코드와 같은지도 응답으로 확인하지 않았다. 월별 조회가 시작 월만 본다면 이번 달 달력에서 "앞 달에 접수를 시작해 이번 달에 마감하는 행사"가 모두 빠진다(스냅샷으로는 99건 가운데 66건).
6. **서버가 받는 연도.** 로컬 서버 코드는 월별 조회의 연도를 2021~2027로 막는다(`DevEventControllerV2`의 `@Min(2021) @Max(2027)`). 계획의 월 선택·‹ ›는 "작년 1월 ~ 내년 12월"이라 지금(2026년)은 범위 안이다. 2027년이 되면 2028년으로 넘길 수 있게 되는데 서버가 거절한다(화면에는 불러오기 오류 문구가 나온다). 서버의 상한을 올려야 한다.
7. **달 이동의 빠르기**("정한 것" 5). 서버를 거치지 않고 브라우저가 월별 조회를 직접 부르게 하면(3단계 타임라인의 다른 달 보기와 같은 방식) 더 빠르지만, 연·월이 props가 아니라 주소에서 오게 되어 페이지의 구조가 달라진다. 지금 구조를 지키는 쪽으로 두었다.
8. **색 단계의 기준(2·4·7건).** 2026-11-13 데이터에 맞춘 값이다. 운영 데이터에서 대부분의 날이 한 단계에 몰리면 `HEAT_STEPS`를 바꾼다(범례의 문구가 따라 바뀐다).
9. **모바일에서 날짜를 눌렀을 때** 화면은 그대로 있고 달력 아래의 목록만 바뀐다(목업과 같다). 390×844에서는 날짜 제목이 화면 안에 들어오지만, 배너가 큰 경우나 여섯 줄짜리 달에서는 목록이 화면 아래로 밀린다. 눌렀을 때 목록으로 옮겨 줄지는 화면을 보고 정한다.
10. **6단계와 겹칠 수 있는 파일.** 이 계획은 `components/events/timeline/EventCard.module.scss`의 세 줄을 CSS 변수로 바꾼다. 6단계(상세의 "같은 날 다른 행사")가 같은 파일을 고치면 합칠 때 맞춰야 한다.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 붙어 있는 달력 칸에 `overflow-y: auto`가 걸려 있어(`app.css:314`, `:453`) 861~1040px에서 둘째·여섯째 열의 한 줄 설명이 잘린다. 네 줄짜리 달에서는 월 선택 풍선의 아래도 잘린다.
- 날짜 제목 아래 한 줄과 월 버튼의 `aria-label`에 건수 요약이 남아 있다(`app.js:277`, `:265`).
- 설명 페이지는 "모바일은 달력이 위, 목록이 아래"라고 적었는데 CSS는 621~860px에서 두 칸이다.
- 캘린더를 처음 열면 오늘에 행사가 없어도 오늘이 골라진다(`app.js:80`). 달을 바꿀 때의 규칙(`setMonth`)과 다르다.
- 이번 달이 비어 있을 때 "오늘로 돌아가기"를 눌러도 달라지는 것이 없다.
- 480px 이하에서 `.chips { flex-basis: 100% }`(`app.css:452`)가 화면 끝까지 넘기는 칩 줄의 폭(`calc(100% + 40px)`)을 덮어쓴다.
- 끝난 여러 날짜 행사는 끝난 날의 "이날 열렸어요" 아래에 놓인다(그날 열린 것이 아니라 끝난 것이다). 목업 그대로 두었다.
- 달력 칸이 `aria-pressed` 버튼이고 모두 Tab 정지점이다(한 달에 최대 31번).

**지금 코드**
- `pages/events.tsx:161-169`, `pages/calender.tsx:9-15`, `ViewToggle.tsx:22-29`가 `dayjs()`로 기본 연·월을 정한다. 서버는 UTC라 매달 1일 0~9시(한국 시간)에 지난달이 열린다.
- `useScheduledEvents`가 캘린더 보기에서도 불려 쓰지 않는 목록을 받아 온다(`pages/events.tsx:62-64`).
- `ViewToggle`이 `router.push({ pathname, query })`로 가서 검색어의 띄어쓰기가 `+`가 된다. `readFilters`는 `+`를 띄어쓰기로 되돌리지 못한다(지금은 그 주소를 읽는 곳이 없어 드러나지 않았다).
- `parseUrl('/search', …)`(쿼리가 없는 `/search`)는 `/search&tag=AI`라는 깨진 주소를 만든다(`UrlUtil.tsx:89`).
- `EventTimeline`의 `flush`는 다른 달을 불러오는 동안 불리면 가려는 날짜를 버린다(`EventTimeline.tsx:172-176`).
- `getServerSideProps`가 월별 조회의 실패를 보지 않는다. 서버가 오류 본문을 주면 그것이 `fallbackData`가 되어 옛 캘린더는 `.filter`에서 깨진다(`pages/events.tsx:170-173`). 새 캘린더는 배열이 아니면 오류 문구를 보여 준다.
- `fallbackData`로 받은 월별 데이터는 SWR 캐시에 들어가지 않는다. 캘린더에서 본 지난 달을 타임라인으로 넘기면 같은 달을 한 번 더 받아 온다.
- `/events?view=calendar`(연·월 없음)의 HTML이 CDN에 5분+1시간 남아, 달이 바뀐 직후에는 지난달이 열릴 수 있다. 보기 전환은 늘 연·월을 붙여서 가므로 직접 그 주소로 들어올 때만 해당한다.
- 옛 캘린더는 접수형 행사와 시작 시각이 없는 행사를 빼는 조건이 세 곳에 중복되어 있다. 새 캘린더는 접수형도 마감일에 센다.
- 화면 확인용 가짜 API(`redesign-mock-api`)의 월별 경로가 시작 월만 본다. 서버는 시작 또는 종료 월이다.
