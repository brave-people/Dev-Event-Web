# 리디자인 3단계 — 메인 타임라인 · 검색 결과 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/events`의 행사 목록을 월별 묶음에서 "날짜 타임라인"(왼쪽 날짜, 오른쪽 그날의 행사 카드)으로 바꾸고, `/search`도 같은 목록을 쓰게 한다.

**Architecture:** 날짜 묶기·시각 줄·NEW·날짜 띠 범위 같은 계산은 `lib/utils/timeline/`의 순수 함수로 빼고 테스트를 먼저 쓴다. 화면은 `components/events/timeline/`에 새 부품(`EventThumb` → `EventCard` → `TimelineList`, `DateNav`, `FilterBar`)을 만들고 `EventTimeline` 하나로 조립해 `/events`와 `/search`가 함께 쓴다. 옛 부품(`Item`, `List`, `ItemList`, `EventFilter`, `DateBoard`)은 고치지 않고 쓰는 곳만 바꾼다(관심 행사 화면이 `Item`을 아직 쓴다). 필터는 지금처럼 URL(`/search?tag=&type=&location=&coast=&kwd=`)에 두고, 새 부품은 URL에서 읽어 그리며 `EventContext`도 함께 맞춘다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / jest (ts-jest)

**Spec:** `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/index.html`의 `main`·`date`·`thumb`·`new`·`state`·`search`·`impl` 절, 움직이는 목업 `detail-design/app.html`(`app.js`, `app.css`, `extra.js`, `extra.css`, `../shared/base.css`). 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`, 1단계가 만든 것은 `2026-11-17-redesign-1-shell.md`.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm start`·`pnpm dev`로 화면을 띄우지 않는다. 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다(작업 12).

## Global Constraints

- **기능·주소·API 경로·필터 동작·검색 규칙은 지금 그대로.** 바뀌는 것은 묶는 단위(월 → 날짜), 카드 모양, 날짜 이동 방식, 배치. 검색 규칙은 `lib/utils/searchUtil.tsx`, 필터 규칙은 `lib/utils/eventUtil.tsx`의 `checkCondition`이 기준이고 **다시 구현하지 않고 불러 쓴다.** 목업의 검색(그 자리에서 걸러짐, 단순 포함)은 따르지 않는다.
- 주소를 만드는 것은 `lib/utils/UrlUtil.tsx`의 `parseUrl`·`initUrl`을 그대로 쓴다(고치지 않는다). **함정:** `parseUrl`은 주소에 `/event`나 `/calender`가 들어 있으면 다른 필터를 모두 버리고 `/search?<키>=<값>`을 돌려준다(`UrlUtil.tsx:52-53`). `/events`에는 필터가 없으니 맞는 동작이지만, `/events?year=&month=`(다른 달 보기)에서 필터를 누르면 연·월이 사라진다. 의도한 동작으로 둔다(검색은 늘 지금 목록에서 한다).
- 색은 `--de-*` 변수만(1단계 계획 Task 1의 표). 고정 색 값은 이 계획에 적힌 것만 허용: 자동 표지의 그라데이션 10색과 글자 `#fff`, NEW 글자 `#fff`, 썸네일 테두리 `rgba(0,0,0,.07)`·`rgba(255,255,255,.08)`, 보기 전환의 그림자 `rgba(0,0,0,.1)`, 칩 줄 끝을 흐리게 하는 마스크의 `#000`.
- 크기는 px. 내용 폭은 `de-container`(1120px, 좌우 20px, 360px 이하 16px). PC·모바일 전환 폭 860px(`de-mobile`). 날짜 띠와 필터 칩만 620px·480px에서 한 번 더 바뀐다. 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수는 새 파일에서 쓰지 않는다.
- SCSS에서 공용 파일은 전체 파일명과 물결표, 변수 먼저: `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`
- import는 프로젝트 루트 기준 절대 경로.
- 브레이크포인트는 CSS 미디어쿼리로만 처리한다. JS에서 `window.innerWidth`로 갈라지는 코드를 새로 쓰지 않는다(`WindowContext.windowX`는 항상 0). 새 부품은 `JobGroupTag`·`BasicDropdown`·`SearchEvent`를 쓰지 않는다(이 셋에는 600px에서 주소 이동을 멈추는 코드가 있다: `JobGroupTag.tsx:52`, `BasicDropdown.tsx:88`, `SearchEvent.tsx:51,98`).
- 모달 게이팅(`modalState.currentModal === 0`일 때만 본문)은 페이지에 그대로 둔다. 새 모달은 만들지 않는다.
- `prefers-reduced-motion: reduce`에서는 이 단계의 transition·부드러운 스크롤을 끈다(CSS는 `de-reduced-motion`, JS의 `scrollTo`는 `behavior: 'auto'`).
- 문구는 이 계획에 적힌 그대로(해요체). **건수를 요약하는 문구를 새로 만들지 않는다.** 숫자는 목업에 있는 자리에만 둔다: 날짜 띠의 날짜별 건수, 날짜 제목 옆 "N건", 칩 안의 숫자, 검색 제목 옆 숫자, 월 선택의 "N건".
- `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다. `Map`·`Set`을 `[...x]`나 `for…of`로 돌리지 말고 `Array.from`을 쓴다.
- 시간은 **한국 시간 벽시계**로 계산한다. API의 날짜 문자열(`2026-11-13T17:00`)에는 시간대 표기가 없고 한국 시간이다. 문자열의 숫자를 그대로 읽고, "지금"은 `Date.now() + 9시간`의 UTC 필드로 읽는다(작업 1의 `kst.ts`). `new Date(문자열)`·`dayjs(문자열)`로 읽지 않는다(서버는 UTC라 9시간 어긋난다). 지금 코드(`dayjs` 로컬 파싱)와 한국 사용자에게는 같은 결과다.
- 배너(`components/common/banner/`)와 캘린더 보기의 달력(`components/events/calendar/` 중 `ViewToggle` 외)은 건드리지 않는다. 소개 화면도 건드리지 않는다.
- 파일을 지우지 않는다. 쓰지 않게 된 것은 이 문서 끝의 "9단계에서 지울 것"에 적는다.
- `pnpm lint`는 쓰지 않는다. 확인 명령은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일>`, `pnpm build`.

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **날짜 띠가 화면 위에 붙지 않는다** — 지금 `html, body { overflow-x: hidden }`(`styles/globals.scss:18`)과 `.main { overflow-y: scroll }`(`styles/Home.module.scss:8`)이 있어 `position: sticky`가 듣지 않는다. 고친 뒤 다른 화면에 가로 스크롤이 생기지 않아야 한다. (작업 10)
2. **자정 무렵과 오래된 캐시** — `/events`의 HTML은 CDN에 5분+1시간 남는다. 어제 만든 HTML을 받거나 탭을 밤새 열어 두면 "오늘"이 어제로 그려진다. 화면이 뜬 뒤 실제 오늘로 고쳐지고, 하이드레이션 경고가 없어야 한다. (작업 4의 `useNow`, 작업 10에서 확인)
3. **카드 안의 버튼** — 관심·공유를 누르면 상세로 넘어가지 않고, 카드의 나머지(썸네일, 제목 글자, 태그, 빈 곳)는 어디를 눌러도 상세로 간다. 관심 담기가 실패하면 북마크가 원래대로 돌아오고 안내가 뜬다. (작업 6, 작업 4)
4. **결과가 없거나 지난 날짜에만 있을 때** — 검색·필터 결과가 0건이거나 지난 날짜에만 있으면 빈 화면이 아니라 안내가 보인다. "새로 올라온 행사"를 켰는데 0건일 때도 같다. 날짜 띠의 칸이 모두 비활성이어도 띠가 깨지지 않는다. (작업 3의 테스트, 작업 10·11에서 확인)
5. **달이 넘어갈 때와 날짜를 눌러 이동할 때** — 스크롤로 12월에 들어가면 제목이 "2026년 12월"로 바뀌고 띠가 따라 넘어가며 1일 칸에 "12월"이 보인다. 날짜를 눌러 이동하는 동안 선택 표시가 지나가는 날짜로 깜빡이지 않는다. 띠를 끌어서 넘긴 직후 손을 뗀 자리의 날짜가 눌린 것으로 처리되지 않는다. (작업 8, 작업 10)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 옵션은 `app.js:1-4`, `:83`과 `extra.js:8`의 주석이 기준입니다.

| 목업 | 주소 | 실제 화면 |
|---|---|---|
| 메인 | `app.html#main` | `/events` |
| 메인, 배너 빼고 | `app.html?banner=none#main` | (배너는 4단계라 그대로 둠) |
| 지난 행사 펼침 | `app.html?past=1&banner=none#main` | `/events`에서 "지난 행사 N건 보기" 누름 |
| 새 행사만 | `app.html?only=new&banner=none#main` | `/events`에서 "새로 올라온 행사" 누름 |
| 결과 없음(메인) | `app.html?q=zzzz&banner=none#main` | 문구·버튼 모양만 비교(실제 검색은 `/search`로 간다) |
| 어두운 화면 | `app.html?theme=dark#main` | 헤더의 테마 버튼 |
| 카드만 | `app.html?bare=1#main` | 카드 크기 비교 |
| 검색 결과 | `app.html?nobn=1#search` (AI), `app.html?q=쿠버네티스&nobn=1#search` | `/search?kwd=AI` |
| 검색 결과 없음 | `app.html?none=1&nobn=1#search` | `/search?kwd=zzzz` |

목업의 변수 `--bg`, `--ink`, `--sub` …는 실제 코드에서 `--de-bg`, `--de-ink`, `--de-sub` …입니다. 목업 `.nw-new`의 어두운 화면 바탕 `#2f5fff`와 밝은 화면 `--blue`는 `--de-blue-fill` 하나로 씁니다.

---

## File Structure

**새로 만드는 파일**

- `lib/utils/timeline/kst.ts` — 한국 시간 벽시계 계산(문자열 읽기, 날짜 키, 표시 문구)
- `lib/utils/timeline/describeEvent.ts` — 행사 한 건의 상태·묶이는 날·시각 줄·NEW
- `lib/utils/timeline/groupByDay.ts` — 월 묶음 풀기, 날짜별 묶기, 건수
- `lib/utils/timeline/dateStrip.ts` — 날짜 띠에 넣을 날짜, 월별 건수, 주소의 연·월 읽기
- `lib/utils/timeline/filters.ts` — 주소에서 필터 읽기, 목록 거르기
- `lib/utils/timeline/buildView.ts` — 위의 것을 모아 화면에 필요한 값 한 벌을 만든다
- `lib/utils/timeline/cover.ts` — 커버 이미지를 쓸 수 있는지, 자동 표지의 유형·색
- `lib/utils/timeline/__tests__/` — `kst.test.ts`, `describeEvent.test.ts`, `groupByDay.test.ts`, `dateStrip.test.ts`, `filters.test.ts`, `buildView.test.ts`, `cover.test.ts`
- `lib/hooks/useNow.ts`, `lib/hooks/useFavorite.tsx`
- `components/events/timeline/` — 부품마다 `Foo.tsx`와 `Foo.module.scss`
  - `TimelineIcon.tsx` (스타일 파일 없음), `EventThumb`, `EventCard`
  - `TimelineList`, `TimelineEmpty`, `TimelineSkeleton`
  - `DateNav`, `DateStrip`, `MonthPicker`
  - `FilterBar`
  - `EventTimeline`
- `components/events/calendar/ViewToggle.module.scss`

**고치는 파일**

- `context/event.tsx` (값 다섯 개 추가), `lib/hooks/useSWR.tsx` (`useMonthlyEvent`), `styles/_mixin.scss` (믹스인 추가)
- `components/events/calendar/ViewToggle.tsx`
- `components/common/modal/EventNull.tsx`, `EventNull.module.scss`
- `pages/events.tsx`, `pages/search.tsx`, `styles/Home.module.scss`, `styles/globals.scss`

**고치지 않고 두는 파일** (쓰는 곳이 없어지거나 줄어듦. 문서 끝 "9단계에서 지울 것"): `components/common/item/*`, `components/common/tag/*`, `components/common/date/*`, `components/features/filters/**`, `components/events/ScheduledEventList.tsx`·`FilteredEventList.tsx`·`MonthlyEventList.tsx`, `components/common/modal/FilterSearchModal.*`·`FilterTagModal.*`·`FilterDateModal.*`, `components/common/dropdown/*`, `components/common/input/*`

**작업 순서와 같은 파일을 고치는 작업이 겹치지 않는지**

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 한국 시간 계산, 행사 한 건의 계산 (순수 함수) | — |
| 2 | 날짜별 묶기, 날짜 띠 날짜, 월 건수 (순수 함수) | — |
| 3 | 필터 읽기·거르기, 화면 값 조립 (순수 함수), 필터 상태 추가 | `context/event.tsx` |
| 4 | 훅: 지금 시각, 관심 담기, 월별 조회 | `lib/hooks/useSWR.tsx` |
| 5 | 썸네일·자동 표지, 아이콘, 공용 믹스인 | `styles/_mixin.scss` |
| 6 | 행사 카드 | — |
| 7 | 날짜별 목록, 빈 화면, 불러오는 중 | — |
| 8 | 날짜 띠·월 선택·보기 전환 | `ViewToggle.tsx` |
| 9 | 필터 줄(검색칸과 칩) | — |
| 10 | 조립, `/events` 바꾸기 | `pages/events.tsx`, `Home.module.scss`, `globals.scss` |
| 11 | `/search` 바꾸기, 결과 없음 화면 | `pages/search.tsx`, `EventNull.*`, 작업 10이 만든 `EventTimeline.*`(제목 줄 추가) |
| 12 | 전체 확인 | — |

작업 1~9가 끝난 상태에서는 화면이 예전 그대로입니다(새 부품은 아직 어디에도 걸리지 않음. 작업 8의 보기 전환만 새 모양). 작업 10 뒤에는 `/events`가 새 모양이고 `/search`는 옛 모양이며 둘 다 동작합니다. 작업 11 뒤에 둘 다 새 모양입니다.

---

### Task 1: 한국 시간 계산 · 행사 한 건의 계산 (순수 함수)

목업 기준: `app.js:49-76`의 `enrich`(상태, 묶이는 날 `keyDate`, 시각 줄 `slot`, `isNew`)와 `app.js:9-16`의 날짜 도우미.

**Files:**
- Create: `lib/utils/timeline/kst.ts`, `lib/utils/timeline/describeEvent.ts`
- Create: `lib/utils/timeline/__tests__/kst.test.ts`, `lib/utils/timeline/__tests__/describeEvent.test.ts`

**Interfaces:**
- Consumes: `Event` (`model/event.ts`)
- Produces (`lib/utils/timeline/kst.ts`). "벽시계 ms"는 문자열의 연·월·일·시·분을 `Date.UTC(...)`에 그대로 넣은 값이다. 날짜 키는 `'YYYY-MM-DD'`.

```ts
export const DOW: readonly string[];                       // ['일','월','화','수','목','금','토']
export const toKstNaive: (epochMs: number) => string;      // 실제 시각 → 'YYYY-MM-DDTHH:mm' (한국 시간)
export const parseNaive: (value: string) => number;        // API 문자열 → 벽시계 ms. 읽을 수 없으면 NaN
export const dayKey: (naiveMs: number) => string;          // 벽시계 ms → 날짜 키
export const keyToMs: (key: string) => number;             // 날짜 키 → 그날 0시의 벽시계 ms
export const addDays: (key: string, days: number) => string;
export const diffDays: (a: string, b: string) => number;   // a - b (일)
export const weekdayOf: (key: string) => number;           // 0=일 … 6=토
export const formatMd: (key: string) => string;            // '11.3'
export const formatMdw: (key: string) => string;           // '11.22(일)'
export const formatHm: (naiveMs: number) => string;        // '17:00'
```

- Produces (`lib/utils/timeline/describeEvent.ts`):

```ts
export type EventStatus = 'ended' | 'recruiting' | 'upcoming' | 'ongoing';
export type SlotTone = 'done' | 'dead' | 'open';
export interface EventSlot {
  tone: SlotTone;   // 칩 색: done 회색, dead 주황, open 파랑
  chip: string;     // '접수 종료' | '행사 종료' | '접수 마감' | '행사' | '진행 중'
  time: string;     // '17:00', '19:00 ~ 20:30' 또는 ''
  extra: string;    // '11.22(일)까지' 또는 ''
}
export interface TimelineEvent {
  event: Event;
  status: EventStatus;
  dateKey: string;  // 타임라인에서 놓이는 날
  sortAt: number;   // 같은 날 안의 순서 (벽시계 ms)
  endAt: number;    // 끝나는 때 (벽시계 ms)
  slot: EventSlot;
  isNew: boolean;
}
export const NEW_DAYS = 3;
export const describeEvent: (event: Event, now: string) => TimelineEvent;  // now: 'YYYY-MM-DDTHH:mm' (한국 시간)
```

**테스트·시그니처만으로 정해지지 않는 규칙** (`describeEvent`)

- 시작은 `start_date_time`, 없으면 `end_date_time`. 끝은 `end_date_time`, 없으면 `start_date_time`.
- "시각이 있다"는 `use_*_date_time_yn === 'Y'`일 때만이다. `'N'`과 `null`은 날짜만 있는 것으로 본다(`formatEventPeriod`와 같은 기준. `getEventEndDate`의 참/거짓 판정은 쓰지 않는다).
- `endAt`: 끝에 시각이 있으면 그 시각, 없으면 **그날의 마지막 순간**(다음 날 0시 − 1ms). 시작도 시각이 없으면 그날 0시로 본다.
- `status`: `now > endAt`이면 `ended`. 아니고 `RECRUIT`이면 `recruiting`. 아니고 시작이 `now`보다 뒤면 `upcoming`. 나머지는 `ongoing`.
- `dateKey`: `ended`·`recruiting`은 끝나는 날, `upcoming`은 시작하는 날, `ongoing`은 오늘(`now`의 날짜).
- `sortAt`: `ended`·`recruiting`은 `endAt`, `upcoming`은 시작, `ongoing`은 `now`.
- `slot`:
  - `ended` → `done`, `RECRUIT`이면 `'접수 종료'` 아니면 `'행사 종료'`, 시각·덧말 없음
  - `recruiting` → `dead`, `'접수 마감'`, 끝에 시각이 있으면 `HH:mm`
  - `upcoming` → `open`, `'행사'`. 시각: 시작에 시각이 있고 (하루짜리이거나 시작 시각이 `00:00`이 아니면) `HH:mm`, 하루짜리이고 끝에도 시각이 있으면 뒤에 `' ~ HH:mm'`. 덧말: 하루짜리가 아니면 `'<끝나는 날 M.D(요일)>까지'`
  - `ongoing` → `open`, `'진행 중'`, 시각 없음, 덧말 `'<끝나는 날 M.D(요일)>까지'`
- `isNew`: 끝나지 않았고, `now`의 날짜와 `create_date_time`의 날짜가 달력으로 3일 이내(`diffDays <= NEW_DAYS`). 등록일을 읽을 수 없으면 `false`.
- `parseNaive`는 `'2026-11-13'`, `'2026-11-13T17:00'`, `'2026-11-13T17:00:00'`, 뒤에 초·밀리초·`Z`가 붙은 것을 모두 받고, 앞의 연-월-일과 시:분만 읽는다(시간대 변환 없음).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/kst.test.ts`

```ts
import {
  addDays,
  dayKey,
  diffDays,
  formatHm,
  formatMd,
  formatMdw,
  parseNaive,
  toKstNaive,
  weekdayOf,
} from 'lib/utils/timeline/kst';

describe('한국 시간 벽시계 계산', () => {
  it('실제 시각을 한국 시간 문자열로 바꾼다 (실행 환경의 시간대와 무관)', () => {
    expect(toKstNaive(Date.UTC(2026, 10, 12, 15, 0, 30))).toBe('2026-11-13T00:00');
    expect(toKstNaive(Date.UTC(2026, 10, 13, 1, 0, 0))).toBe('2026-11-13T10:00');
  });

  it('시간대 표기가 없는 API 문자열을 글자 그대로 읽는다', () => {
    expect(dayKey(parseNaive('2026-11-13T17:00'))).toBe('2026-11-13');
    expect(formatHm(parseNaive('2026-11-13T17:00:00'))).toBe('17:00');
    expect(formatHm(parseNaive('2026-11-13T09:05:59.000Z'))).toBe('09:05');
    expect(dayKey(parseNaive('2026-11-13'))).toBe('2026-11-13');
  });

  it('읽을 수 없는 값은 NaN', () => {
    expect(Number.isNaN(parseNaive(''))).toBe(true);
    expect(Number.isNaN(parseNaive('없음'))).toBe(true);
  });

  it('날짜 키를 더하고 뺀다 (달과 해를 넘어간다)', () => {
    expect(addDays('2026-11-13', 13)).toBe('2026-11-26');
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-11-13', '2026-11-10')).toBe(3);
    expect(diffDays('2026-11-10', '2026-11-13')).toBe(-3);
  });

  it('요일과 표시 문구', () => {
    expect(weekdayOf('2026-11-13')).toBe(5);
    expect(formatMd('2026-11-03')).toBe('11.3');
    expect(formatMdw('2026-11-22')).toBe('11.22(일)');
    expect(formatMdw('2026-12-05')).toBe('12.5(토)');
  });
});
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/describeEvent.test.ts`

```ts
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

const date = (over: Partial<Event>): Event => ev({ event_time_type: 'DATE', ...over });

describe('describeEvent — 접수형', () => {
  it('마감일에 놓이고 "접수 마감 17:00"을 보여 준다', () => {
    const r = describeEvent(ev(), NOW);
    expect(r.status).toBe('recruiting');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({ tone: 'dead', chip: '접수 마감', time: '17:00', extra: '' });
  });

  it('마감에 시각이 없으면 시각을 적지 않는다', () => {
    const r = describeEvent(
      ev({ end_date_time: '2026-11-20T23:59', use_end_date_time_yn: 'N' }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-20');
    expect(r.slot).toEqual({ tone: 'dead', chip: '접수 마감', time: '', extra: '' });
  });

  it('오늘 이미 마감했으면 오늘에 "접수 종료"로 남는다', () => {
    const r = describeEvent(ev({ end_date_time: '2026-11-13T09:00' }), NOW);
    expect(r.status).toBe('ended');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({ tone: 'done', chip: '접수 종료', time: '', extra: '' });
  });
});

describe('describeEvent — 일시형', () => {
  it('하루짜리는 시작일에 놓이고 "행사 19:00 ~ 20:30"', () => {
    const r = describeEvent(
      date({ start_date_time: '2026-11-19T19:00', end_date_time: '2026-11-19T20:30' }),
      NOW
    );
    expect(r.status).toBe('upcoming');
    expect(r.dateKey).toBe('2026-11-19');
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '19:00 ~ 20:30', extra: '' });
  });

  it('여러 날이면 시작 시각과 "11.22(일)까지"', () => {
    const r = describeEvent(
      date({ start_date_time: '2026-11-20T10:00', end_date_time: '2026-11-22T18:00' }),
      NOW
    );
    expect(r.dateKey).toBe('2026-11-20');
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '10:00', extra: '11.22(일)까지' });
  });

  it('여러 날이고 시작 시각이 00:00이면 시각을 적지 않는다', () => {
    const r = describeEvent(
      date({ start_date_time: '2026-11-20T00:00', end_date_time: '2026-11-22T18:00' }),
      NOW
    );
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '', extra: '11.22(일)까지' });
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
    expect(r.slot).toEqual({ tone: 'open', chip: '행사', time: '19:00', extra: '' });
  });

  it('진행 중이면 오늘에 놓이고 "진행 중 … 11.14(토)까지"', () => {
    const r = describeEvent(
      date({ start_date_time: '2026-11-12T09:00', end_date_time: '2026-11-14T18:00' }),
      NOW
    );
    expect(r.status).toBe('ongoing');
    expect(r.dateKey).toBe('2026-11-13');
    expect(r.slot).toEqual({ tone: 'open', chip: '진행 중', time: '', extra: '11.14(토)까지' });
  });

  it('끝났으면 끝난 날에 "행사 종료"', () => {
    const r = describeEvent(
      date({ start_date_time: '2026-11-11T18:30', end_date_time: '2026-11-11T21:00' }),
      NOW
    );
    expect(r.status).toBe('ended');
    expect(r.dateKey).toBe('2026-11-11');
    expect(r.slot).toEqual({ tone: 'done', chip: '행사 종료', time: '', extra: '' });
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
    expect(describeEvent(ev({ create_date_time: '2026-11-10T23:59' }), NOW).isNew).toBe(true);
    expect(describeEvent(ev({ create_date_time: '2026-11-09T23:59' }), NOW).isNew).toBe(false);
  });

  it('끝난 행사는 NEW가 아니다', () => {
    const r = describeEvent(
      ev({ end_date_time: '2026-11-13T09:00', create_date_time: '2026-11-12T09:00' }),
      NOW
    );
    expect(r.isNew).toBe(false);
  });

  it('등록일을 읽을 수 없으면 NEW가 아니다', () => {
    expect(describeEvent(ev({ create_date_time: '' }), NOW).isNew).toBe(false);
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- lib/utils/timeline`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 4: `kst.ts`와 `describeEvent.ts`를 구현한다.** `dayjs`와 `Date`의 로컬 필드(`getHours` 등)를 쓰지 않는다. `Date.UTC`와 `getUTC*`만 쓴다.

- [ ] **Step 5: 확인**

Run: `pnpm test -- lib/utils/timeline && npx tsc --noEmit && npx eslint lib/utils/timeline`
Expected: PASS (kst 5개, describeEvent 16개), 타입·린트 오류 없음

Run: `TZ=America/Los_Angeles pnpm test -- lib/utils/timeline`
Expected: 같은 결과(시간대가 달라도 통과)

관리자가 화면에서 볼 것: 없음.

---

### Task 2: 날짜별 묶기 · 날짜 띠 날짜 · 월 건수 (순수 함수)

목업 기준: `app.js:93-97`의 `groups`(정렬과 묶기), `:183-194`의 `navHtml`(띠의 범위와 칸), `:204-208`의 `mpHtml`(월 선택), `:332-336`의 `go`(이동할 날 고르기).

**Files:**
- Create: `lib/utils/timeline/groupByDay.ts`, `lib/utils/timeline/dateStrip.ts`
- Create: `lib/utils/timeline/__tests__/groupByDay.test.ts`, `lib/utils/timeline/__tests__/dateStrip.test.ts`

**Interfaces:**
- Consumes: Task 1의 `describeEvent`, `TimelineEvent`, `addDays`, `weekdayOf`, `DOW`
- Produces (`groupByDay.ts`):

```ts
export interface DayGroup { key: string; items: TimelineEvent[]; }
export const flattenEvents: (responses: EventResponse[] | undefined) => Event[];
export const toTimeline: (events: Event[], now: string) => TimelineEvent[];
export const groupByDay: (items: TimelineEvent[]) => DayGroup[];
export const countByDay: (items: TimelineEvent[]) => Record<string, number>;
export const countPast: (items: TimelineEvent[], todayKey: string) => number;
export const countNew: (items: TimelineEvent[]) => number;
export const findTargetKey: (groups: DayGroup[], key: string) => string | null;
```

- Produces (`dateStrip.ts`):

```ts
export interface MonthParam { year: number; month: number; }   // month는 1~12
export interface StripDay {
  key: string;
  day: number;        // 1~31
  label: string;      // 요일 한 글자. 1일은 'N월'
  weekday: number;    // 0=일 … 6=토
  count: number;
  isToday: boolean;
  isPast: boolean;
  isFirst: boolean;   // 1일
}
export const STRIP_MIN_DAYS = 14;
export const monthKey: (year: number, month: number) => string;   // '2026-11'
export const stripRange: (opts: {
  keys: string[]; todayKey: string; showPast: boolean; month?: MonthParam | null;
}) => { from: string; to: string };
export const buildStripDays: (
  range: { from: string; to: string }, counts: Record<string, number>, todayKey: string
) => StripDay[];
export const stripDayLabel: (day: StripDay) => string;   // 칸의 aria-label
export const monthTotals: (responses: EventResponse[] | undefined) => Record<string, number>;
export const readMonthParam: (query: {
  year?: string | string[]; month?: string | string[];
}) => MonthParam | null;
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `flattenEvents`: `undefined`나 빈 칸(`null`)이 섞인 배열도 받는다(`ItemList.tsx:63`의 `.filter(Boolean)`과 같은 이유). **같은 `id`가 두 달 묶음에 들어 있으면 처음 것만 남긴다**(여러 달에 걸친 행사가 날짜 묶음에서 두 번 나오면 key가 겹친다).
- `groupByDay`: 날짜 키 오름차순. 한 날 안에서는 `sortAt`, 같으면 `endAt`, 그것도 같으면 들어온 순서.
- `findTargetKey`: `key` 이상인 첫 묶음의 키. 없으면 마지막 묶음의 키. 묶음이 없으면 `null`.
- `stripRange`: `month`가 있으면 그 달의 1일~말일. 없으면 시작은 오늘(`showPast`이고 `keys`의 가장 이른 날이 오늘보다 앞이면 그날), 끝은 `keys`의 가장 늦은 날과 "오늘+13일" 중 늦은 쪽.
- `monthTotals`: 응답의 `metadata`에서 `{ 'YYYY-MM': total }`을 만든다. 날짜별 건수를 더해서 만들지 않는다.
- `readMonthParam`: 둘 다 정수이고 `year`는 2000~2100, `month`는 1~12일 때만 값을 돌려준다. 배열이면 `null`.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/groupByDay.test.ts`

```ts
import {
  countByDay,
  countNew,
  countPast,
  findTargetKey,
  flattenEvents,
  groupByDay,
  toTimeline,
} from 'lib/utils/timeline/groupByDay';
import { Event, EventResponse } from 'model/event';

const NOW = '2026-11-13T10:00';

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

const EVENTS: Event[] = [
  ev({ id: 'a', end_date_time: '2026-11-13T17:00' }),
  ev({
    id: 'b',
    event_time_type: 'DATE',
    start_date_time: '2026-11-12T09:00',
    end_date_time: '2026-11-14T18:00',
  }),
  ev({ id: 'c', end_date_time: '2026-11-13T12:00' }),
  ev({
    id: 'd',
    event_time_type: 'DATE',
    start_date_time: '2026-11-13T19:00',
    end_date_time: '2026-11-13T21:00',
  }),
  ev({ id: 'e', end_date_time: '2026-11-13T09:00' }),
  ev({ id: 'f', end_date_time: '2026-11-20T18:00', create_date_time: '2026-11-12T09:00' }),
  ev({ id: 'g', end_date_time: '2026-11-11T18:00' }),
  ev({ id: 'h', end_date_time: '2026-11-13T12:00' }),
];

const ids = (items: { event: Event }[]) => items.map((i) => i.event.id).join('');

describe('flattenEvents', () => {
  const res = (month: number, events: Event[]): EventResponse => ({
    metadata: { total: events.length, year: 2026, month },
    dev_event: events,
  });

  it('월 묶음을 풀고, 두 달에 걸쳐 들어 있는 행사는 한 번만 남긴다', () => {
    const flat = flattenEvents([
      res(11, [ev({ id: '1' }), ev({ id: '2' })]),
      res(12, [ev({ id: '2' }), ev({ id: '3' })]),
    ]);
    expect(flat.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('응답이 없거나 빈 칸이 섞여 있어도 빈 배열부터 시작한다', () => {
    expect(flattenEvents(undefined)).toEqual([]);
    expect(
      flattenEvents([null as unknown as EventResponse, res(11, [ev({ id: '1' })])])
    ).toHaveLength(1);
  });
});

describe('groupByDay', () => {
  const groups = groupByDay(toTimeline(EVENTS, NOW));

  it('날짜순으로 묶는다', () => {
    expect(groups.map((g) => g.key)).toEqual(['2026-11-11', '2026-11-13', '2026-11-20']);
  });

  it('한 날 안에서는 시각순: 오늘 끝난 것, 진행 중(지금), 12시 마감 둘(들어온 순서), 17시 마감, 19시 시작', () => {
    expect(ids(groups[1].items)).toBe('ebchad');
  });
});

describe('건수', () => {
  const items = toTimeline(EVENTS, NOW);

  it('날짜별 건수', () => {
    expect(countByDay(items)).toEqual({ '2026-11-11': 1, '2026-11-13': 6, '2026-11-20': 1 });
  });

  it('오늘보다 앞 날짜에 놓인 것만 지난 행사로 센다 (오늘 끝난 것은 세지 않는다)', () => {
    expect(countPast(items, '2026-11-13')).toBe(1);
  });

  it('새로 올라온 행사 수', () => {
    expect(countNew(items)).toBe(1);
  });
});

describe('findTargetKey', () => {
  const groups = groupByDay(toTimeline(EVENTS, NOW));

  it('그날에 행사가 있으면 그날', () => {
    expect(findTargetKey(groups, '2026-11-13')).toBe('2026-11-13');
  });
  it('없으면 그 뒤의 첫 날', () => {
    expect(findTargetKey(groups, '2026-11-14')).toBe('2026-11-20');
  });
  it('뒤에도 없으면 마지막 날', () => {
    expect(findTargetKey(groups, '2026-12-01')).toBe('2026-11-20');
  });
  it('묶음이 없으면 null', () => {
    expect(findTargetKey([], '2026-11-13')).toBeNull();
  });
});
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/dateStrip.test.ts`

```ts
import {
  buildStripDays,
  monthKey,
  monthTotals,
  readMonthParam,
  stripDayLabel,
  stripRange,
} from 'lib/utils/timeline/dateStrip';
import { EventResponse } from 'model/event';

const TODAY = '2026-11-13';

describe('stripRange', () => {
  it('오늘부터, 적어도 14일', () => {
    expect(stripRange({ keys: [], todayKey: TODAY, showPast: false })).toEqual({
      from: '2026-11-13',
      to: '2026-11-26',
    });
  });

  it('행사가 더 뒤에 있으면 마지막 행사 날까지', () => {
    expect(
      stripRange({ keys: ['2026-11-01', '2026-12-28'], todayKey: TODAY, showPast: false })
    ).toEqual({ from: '2026-11-13', to: '2026-12-28' });
  });

  it('지난 행사를 펼치면 가장 이른 날부터', () => {
    expect(
      stripRange({ keys: ['2026-11-01', '2026-11-20'], todayKey: TODAY, showPast: true })
    ).toEqual({ from: '2026-11-01', to: '2026-11-26' });
  });

  it('펼쳐도 지난 행사가 없으면 오늘부터', () => {
    expect(stripRange({ keys: ['2026-11-20'], todayKey: TODAY, showPast: true }).from).toBe(
      '2026-11-13'
    );
  });

  it('다른 달을 볼 때는 그 달의 1일부터 말일까지', () => {
    expect(
      stripRange({ keys: [], todayKey: TODAY, showPast: false, month: { year: 2026, month: 10 } })
    ).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(
      stripRange({ keys: [], todayKey: TODAY, showPast: false, month: { year: 2028, month: 2 } })
    ).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });
});

describe('buildStripDays', () => {
  const days = buildStripDays(
    { from: '2026-11-29', to: '2026-12-02' },
    { '2026-11-30': 2, '2026-12-01': 1 },
    '2026-11-30'
  );

  it('하루에 한 칸', () => {
    expect(days.map((d) => d.key)).toEqual([
      '2026-11-29',
      '2026-11-30',
      '2026-12-01',
      '2026-12-02',
    ]);
  });

  it('지난 날, 오늘, 건수', () => {
    expect(days[0]).toEqual({
      key: '2026-11-29', day: 29, label: '일', weekday: 0,
      count: 0, isToday: false, isPast: true, isFirst: false,
    });
    expect(days[1]).toEqual({
      key: '2026-11-30', day: 30, label: '월', weekday: 1,
      count: 2, isToday: true, isPast: false, isFirst: false,
    });
  });

  it('1일에는 요일 대신 "12월"', () => {
    expect(days[2]).toEqual({
      key: '2026-12-01', day: 1, label: '12월', weekday: 2,
      count: 1, isToday: false, isPast: false, isFirst: true,
    });
  });

  it('칸을 읽어 주는 문구', () => {
    expect(stripDayLabel(days[1])).toBe('11월 30일 월요일, 행사 2건, 오늘');
    expect(stripDayLabel(days[3])).toBe('12월 2일 수요일, 행사 0건');
  });
});

describe('월 선택', () => {
  it('응답에 들어 있는 달의 건수는 metadata.total', () => {
    const responses: EventResponse[] = [
      { metadata: { total: 68, year: 2026, month: 11 }, dev_event: [] },
      { metadata: { total: 44, year: 2026, month: 12 }, dev_event: [] },
    ];
    expect(monthTotals(responses)).toEqual({ '2026-11': 68, '2026-12': 44 });
    expect(monthTotals(undefined)).toEqual({});
  });

  it('달의 키', () => {
    expect(monthKey(2026, 3)).toBe('2026-03');
  });

  it('주소의 연·월을 읽는다', () => {
    expect(readMonthParam({ year: '2026', month: '10' })).toEqual({ year: 2026, month: 10 });
  });

  it('잘못된 값은 받지 않는다', () => {
    expect(readMonthParam({})).toBeNull();
    expect(readMonthParam({ year: '2026' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '13' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '0' })).toBeNull();
    expect(readMonthParam({ year: '0', month: '10' })).toBeNull();
    expect(readMonthParam({ year: '2026', month: '10.5' })).toBeNull();
    expect(readMonthParam({ year: ['2026', '2025'], month: '10' })).toBeNull();
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- groupByDay dateStrip`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 4: 두 파일을 구현한다.** `Map`을 쓰면 `Array.from(map.values())`로 꺼낸다.

- [ ] **Step 5: 확인**

Run: `pnpm test -- lib/utils/timeline && npx tsc --noEmit && npx eslint lib/utils/timeline`
Expected: PASS (groupByDay 11개, dateStrip 13개 추가), 오류 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 3: 필터 읽기 · 화면 값 조립 (순수 함수) · 필터 상태 추가

**Files:**
- Create: `lib/utils/timeline/filters.ts`, `lib/utils/timeline/buildView.ts`
- Create: `lib/utils/timeline/__tests__/filters.test.ts`, `lib/utils/timeline/__tests__/buildView.test.ts`
- Modify: `context/event.tsx:4-21`(인터페이스), `:23-40`(기본값), `:44-123`(Provider)

**Interfaces:**
- Consumes: Task 1·2의 함수, `reflactUrlContext`·`safeDecode`(`lib/utils/UrlUtil.tsx`), `checkCondition`(`lib/utils/eventUtil.tsx`), `checkSearch`(`lib/utils/searchUtil.tsx`), `eventType`(`components/features/filters/eventType.ts`)
- Produces (`filters.ts`):

```ts
export interface TimelineFilters {
  tags: string[];       // 직군 태그 (여러 개)
  type?: string;        // 행사 유형
  location?: string;    // '온라인' | '오프라인'
  coast?: string;       // '유료' | '무료'
  kwd?: string;         // 검색어 (디코딩한 값)
}
export const EMPTY_FILTERS: TimelineFilters;                       // { tags: [] }
export const readFilters: (asPath: string) => TimelineFilters;
export const applyFilters: (events: Event[], filters: TimelineFilters) => Event[];
```

- Produces (`buildView.ts`):

```ts
export interface TimelineView {
  todayKey: string;
  groups: DayGroup[];      // 필터·새 행사만·월을 적용한 전체 묶음 (지난 날 포함)
  visible: DayGroup[];     // 화면에 그릴 묶음
  days: StripDay[];        // 날짜 띠의 칸
  pastCount: number;       // "지난 행사 N건 보기"의 N
  newCount: number;        // "새로 올라온 행사 N"의 N
  visibleCount: number;    // visible에 든 행사 수
}
export const buildTimelineView: (input: {
  events: Event[];              // 목록에 그릴 대상
  current: Event[];             // 새 행사 수를 셀 대상 (늘 지금 목록 전체)
  filters: TimelineFilters;
  newOnly: boolean;
  showPast: boolean;
  month: MonthParam | null;     // 다른 달을 볼 때
  now: string;
}) => TimelineView;
```

- Produces (`EventContext`에 추가):

```ts
newOnly: boolean;                              // "새로 올라온 행사" 칩. 처음 값 false
handleNewOnly: (value: boolean) => void;
showPast: boolean;                             // "지난 행사 보기" 칩. 처음 값 false
handleShowPast: (value: boolean) => void;
replaceJobGroupList: (list: string[]) => void; // 직군 목록을 통째로 바꾼다
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `readFilters`: 주소의 경로(`?` 앞)가 `/search`일 때만 읽는다. 그 밖의 주소는 `EMPTY_FILTERS`(지금도 `/events`는 주소에 무엇이 있든 거르지 않는다: `ScheduledEventList`가 필터를 넘기지 않고 `checkSearch`가 `/events`를 건너뛴다). 값은 `safeDecode`로 풀고, `type`은 `eventType` 목록(`'전체'` 제외)에, `location`은 `온라인`·`오프라인`, `coast`는 `유료`·`무료`에 있을 때만 받는다(지금 `FilterByEventType`·`FilterByLocation`·`FilterByCoast`의 검사와 같다). 빈 검색어는 없는 것으로 본다.
- `applyFilters`: 조건은 `checkCondition(tags가 있으면 tags.join(', ') 없으면 undefined, type, location, coast, event)`, 검색어가 있으면 `checkSearch(kwd, '', event)`를 함께 만족해야 한다. **지금 동작 그대로**: 직군·유형·참여 방법·비용은 "하나라도 맞으면 통과"이고(`eventUtil.tsx:63-69`), 검색어는 거기에 "그리고"로 붙는다.
- `buildTimelineView`:
  - `filters`로 거르고 → `describeEvent` → `month`가 있으면 `dateKey`가 그 달인 것만 → `newOnly`면 `isNew`인 것만. 이것을 묶은 것이 `groups`.
  - `visible`: `showPast`이거나 `month`가 있으면 `groups` 전부. 아니면 키가 오늘 이상인 묶음만.
  - `days`: 범위는 **거르기 전** `events`의 날짜 키로 정한다(`month`가 있으면 그 달 안의 것만). 건수는 `groups`에서 센다(필터를 걸면 띠의 숫자도 따라 바뀐다).
  - `pastCount`: `month`가 있으면 0. 아니면 `groups`에서 오늘보다 앞 날짜의 행사 수.
  - `newCount`: `current` 전체에서 `isNew`인 수(필터와 무관. 목업 `CNT.fresh`).
- `replaceJobGroupList`가 필요한 이유: 지금의 `updateJobGroupList(배열)`은 이미 값이 있을 때 한 번의 호출에서 마지막 하나만 더해지고(`context/event.tsx:64-70`), 빼는 방법이 없다. 기존 메서드는 고치지 않는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/filters.test.ts`

```ts
import { applyFilters, EMPTY_FILTERS, readFilters } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const event = (id: string, title: string, tagNames: string[]): Event => ({
  id,
  title,
  description: '',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '수',
  start_date_time: '2026-11-19T19:00',
  end_day_week: '수',
  end_date_time: '2026-11-19T21:00',
  tags: tagNames.map((tag_name, index) => ({
    id: index + 1,
    tag_name,
    tag_color: '#0043FF',
    category: null,
  })),
  create_date_time: '2026-11-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
});

const enc = encodeURIComponent;

describe('readFilters', () => {
  it('행사 일정 화면은 주소에 무엇이 있든 거르지 않는다', () => {
    expect(readFilters('/events')).toEqual(EMPTY_FILTERS);
    expect(readFilters('/events?tag=AI&kwd=x')).toEqual(EMPTY_FILTERS);
    expect(readFilters('/events?year=2026&month=10')).toEqual(EMPTY_FILTERS);
  });

  it('검색 화면의 주소에서 필터를 읽는다', () => {
    const path =
      `/search?tag=AI&tag=${enc('클라우드')}&type=${enc('대회')}` +
      `&location=${enc('온라인')}&coast=${enc('무료')}&kwd=${enc('카카오 테크')}`;
    expect(readFilters(path)).toEqual({
      tags: ['AI', '클라우드'],
      type: '대회',
      location: '온라인',
      coast: '무료',
      kwd: '카카오 테크',
    });
  });

  it('인코딩하지 않은 한글 주소도 읽는다', () => {
    expect(readFilters('/search?tag=클라우드&coast=유료')).toEqual({
      tags: ['클라우드'],
      coast: '유료',
    });
  });

  it('목록에 없는 값과 빈 검색어는 받지 않는다', () => {
    const path = `/search?type=${enc('없는유형')}&location=${enc('전체')}&coast=${enc('공짜')}&kwd=`;
    expect(readFilters(path)).toEqual(EMPTY_FILTERS);
  });

  it('잘못된 % 인코딩이 와도 깨지지 않는다', () => {
    expect(readFilters('/search?kwd=50%').kwd).toBe('50%');
  });
});

describe('applyFilters', () => {
  const events = [
    event('1', 'Kubernetes 밋업', ['온라인', '무료', '모임', '클라우드']),
    event('2', 'AI 해커톤', ['오프라인', '유료', '대회', 'AI']),
    event('3', '보안 컨퍼런스', ['오프라인', '무료', '세미나', '보안']),
  ];
  const ids = (list: Event[]) => list.map((e) => e.id);

  it('필터가 없으면 전부', () => {
    expect(ids(applyFilters(events, EMPTY_FILTERS))).toEqual(['1', '2', '3']);
  });

  it('직군 태그는 고른 것 가운데 하나라도 붙어 있으면 통과', () => {
    expect(ids(applyFilters(events, { tags: ['AI', '보안'] }))).toEqual(['2', '3']);
  });

  it('직군·참여 방법·비용은 서로 "또는"이다 (지금 동작)', () => {
    expect(ids(applyFilters(events, { tags: ['AI'], location: '온라인' }))).toEqual(['1', '2']);
    expect(ids(applyFilters(events, { tags: [], coast: '유료' }))).toEqual(['2']);
  });

  it('검색어는 "그리고"로 붙고, 대소문자와 띄어쓰기를 가리지 않는다', () => {
    expect(ids(applyFilters(events, { tags: [], kwd: 'kubernetes' }))).toEqual(['1']);
    expect(ids(applyFilters(events, { tags: [], kwd: '보안컨퍼런스' }))).toEqual(['3']);
    expect(ids(applyFilters(events, { tags: ['AI'], kwd: 'kubernetes' }))).toEqual([]);
  });
});
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/buildView.test.ts`

```ts
import { buildTimelineView } from 'lib/utils/timeline/buildView';
import { EMPTY_FILTERS } from 'lib/utils/timeline/filters';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00';

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

// e1: 11.10에 마감(지남) / e2: 오늘 17시 마감, 새 행사 / e3: 11.19 행사, 새 행사 / e4: 12.2 마감
const ALL: Event[] = [
  event({
    id: '1', title: 'Kubernetes 밋업', end_date_time: '2026-11-10T18:00',
    create_date_time: '2026-10-20T09:00', tagNames: ['AI', '온라인'],
  }),
  event({
    id: '2', title: 'AI 해커톤', end_date_time: '2026-11-13T17:00',
    create_date_time: '2026-11-12T09:00', tagNames: ['AI', '오프라인'],
  }),
  event({
    id: '3', title: '클라우드 세미나', event_time_type: 'DATE',
    start_date_time: '2026-11-19T19:00', end_date_time: '2026-11-19T20:30',
    create_date_time: '2026-11-11T09:00', tagNames: ['클라우드', '온라인'],
  }),
  event({ id: '4', title: '보안 컨퍼런스', end_date_time: '2026-12-02T12:00', tagNames: ['보안'] }),
];

const base = {
  events: ALL,
  current: ALL,
  filters: EMPTY_FILTERS,
  newOnly: false,
  showPast: false,
  month: null,
  now: NOW,
};
const keys = (groups: { key: string }[]) => groups.map((g) => g.key);

describe('buildTimelineView', () => {
  it('처음에는 오늘부터 보여 주고, 지난 날짜의 행사는 건수만 센다', () => {
    const v = buildTimelineView(base);
    expect(v.todayKey).toBe('2026-11-13');
    expect(keys(v.groups)).toEqual(['2026-11-10', '2026-11-13', '2026-11-19', '2026-12-02']);
    expect(keys(v.visible)).toEqual(['2026-11-13', '2026-11-19', '2026-12-02']);
    expect(v.pastCount).toBe(1);
    expect(v.newCount).toBe(2);
    expect(v.visibleCount).toBe(3);
  });

  it('날짜 띠는 오늘부터 마지막 행사 날까지이고, 12월 1일 칸에 "12월"을 적는다', () => {
    const v = buildTimelineView(base);
    expect(v.days).toHaveLength(20);
    expect(v.days[0]).toMatchObject({ key: '2026-11-13', count: 1, isToday: true });
    expect(v.days[v.days.length - 1].key).toBe('2026-12-02');
    expect(v.days.find((d) => d.key === '2026-12-01')?.label).toBe('12월');
  });

  it('지난 행사를 펼치면 목록도 띠도 가장 이른 날부터', () => {
    const v = buildTimelineView({ ...base, showPast: true });
    expect(keys(v.visible)).toEqual(['2026-11-10', '2026-11-13', '2026-11-19', '2026-12-02']);
    expect(v.days[0].key).toBe('2026-11-10');
    expect(v.days).toHaveLength(23);
    expect(v.visibleCount).toBe(4);
  });

  it('새 행사만 보면 띠의 범위는 그대로이고 건수만 바뀐다', () => {
    const v = buildTimelineView({ ...base, newOnly: true });
    expect(keys(v.groups)).toEqual(['2026-11-13', '2026-11-19']);
    expect(v.pastCount).toBe(0);
    expect(v.days).toHaveLength(20);
    expect(v.days.find((d) => d.key === '2026-12-02')?.count).toBe(0);
    expect(v.newCount).toBe(2);
  });

  it('필터를 걸면 띠의 건수도 걸러진 값이다', () => {
    const v = buildTimelineView({ ...base, filters: { tags: ['보안'] } });
    expect(keys(v.visible)).toEqual(['2026-12-02']);
    expect(v.days[0].count).toBe(0);
    expect(v.newCount).toBe(2);
  });

  it('결과가 지난 날짜에만 있으면 그릴 묶음은 없고 지난 행사 수만 남는다', () => {
    const v = buildTimelineView({ ...base, filters: { tags: [], kwd: 'kubernetes' } });
    expect(keys(v.groups)).toEqual(['2026-11-10']);
    expect(v.visible).toEqual([]);
    expect(v.visibleCount).toBe(0);
    expect(v.pastCount).toBe(1);
  });

  it('다른 달을 볼 때는 그 달에 놓인 행사만, 지난 것도 함께 보여 준다', () => {
    const v = buildTimelineView({ ...base, month: { year: 2026, month: 11 } });
    expect(keys(v.visible)).toEqual(['2026-11-10', '2026-11-13', '2026-11-19']);
    expect(v.days).toHaveLength(30);
    expect(v.days[0].key).toBe('2026-11-01');
    expect(v.pastCount).toBe(0);
  });

  it('행사가 없는 달도 띠는 한 달 치가 나온다', () => {
    const v = buildTimelineView({ ...base, events: [], month: { year: 2028, month: 2 } });
    expect(v.visible).toEqual([]);
    expect(v.days).toHaveLength(29);
    expect(v.days.every((d) => d.count === 0)).toBe(true);
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- filters buildView`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 4: `filters.ts`, `buildView.ts`를 구현한다.** `checkCondition`·`checkSearch`를 불러 쓰고 같은 규칙을 다시 쓰지 않는다.

- [ ] **Step 5: `context/event.tsx`에 Interfaces의 다섯 값을 추가한다.** 인터페이스, `defaultValue`(`newOnly: false`, `showPast: false`, 빈 함수), Provider의 `useState` 둘과 `contextValue`. `replaceJobGroupList`는 `setJobGroupList(list)` 한 줄. 기존 값과 메서드는 건드리지 않는다.

- [ ] **Step 6: 확인**

Run: `pnpm test && npx tsc --noEmit && npx eslint lib/utils/timeline context/event.tsx && pnpm build`
Expected: 모두 통과 (filters 9개, buildView 8개 추가). 기존 테스트도 그대로 통과.

관리자가 화면에서 볼 것: 없음(화면은 그대로).

---

### Task 4: 훅 — 지금 시각 · 관심 담기 · 월별 조회

**Files:**
- Create: `lib/hooks/useNow.ts`, `lib/hooks/useFavorite.tsx`
- Modify: `lib/hooks/useSWR.tsx:31-54` (`useMonthlyEvent`)

**Interfaces:**
- Consumes: `toKstNaive` (Task 1), `useMyEvent`, `createMyEventApi`(`lib/api/post.tsx`), `deleteMyEventApi`(`lib/api/delete.tsx`), `useToast`(`pushToast(message, kind?)`), `AuthContext`
- Produces:

```ts
// lib/hooks/useNow.ts
export const useNow: (initial: string) => string;
// 처음 그릴 때는 initial을 그대로 돌려준다(서버와 같은 값). 마운트된 뒤 실제 시각으로 바꾸고,
// 60초마다, 그리고 탭이 다시 보일 때(visibilitychange) 새로 읽는다. 값은 분 단위 문자열이라 분이 바뀔 때만 다시 그려진다.

// lib/hooks/useFavorite.tsx
export const useFavorite: () => {
  isFavorite: (eventId: string) => boolean;          // 로그인하지 않았으면 늘 false
  toggleFavorite: (event: Event) => Promise<void>;
  loginModalIsOpen: boolean;                          // 로그인하지 않고 눌렀을 때 true
  closeLoginModal: () => void;
};

// lib/hooks/useSWR.tsx
const useMonthlyEvent: (args: { param: Calender | null; fallbackData?: Event[] }) => {
  monthlyEvent: Event[] | undefined; isLoading: boolean; isError: any;
};
```

- [ ] **Step 1: `useMonthlyEvent`를 고친다.**
  - `param`이 `null`이면 SWR 키를 `null`로 넘겨 요청이 나가지 않게 한다. 이때 `isLoading`은 `false`.
  - `fallbackData`를 선택 값으로 바꾼다. **주의:** `fallbackData`에 `[]`를 넘기면 데이터가 이미 있는 것으로 보아 요청이 나가지 않는다(`revalidateIfStale: false`). 클라이언트에서 불러와야 하는 호출은 `fallbackData`를 넘기지 않는다.
  - `pages/events.tsx:63-69`의 지금 호출(`param` 객체와 `fallbackData` 배열)은 그대로 컴파일된다. 이 작업에서는 고치지 않는다(작업 10).

- [ ] **Step 2: `useNow`를 만든다.** `useState(initial)`, `useEffect` 안에서 `setNow(toKstNaive(Date.now()))`, `setInterval(…, 60000)`, `document.addEventListener('visibilitychange', …)`. 정리 함수에서 둘 다 푼다.

- [ ] **Step 3: `useFavorite`를 만든다.** `List.tsx:60-148`의 동작을 옮기되 아래를 바꾼다.
  - 키와 인자는 지금과 같다: `useMyEvent({ filter: '' }, isLoggedIn)`, `mutate(['/front/v1/favorite/events', { filter: '' }], …)`.
  - 로그인하지 않았으면 `loginModalIsOpen`을 `true`로 하고 끝낸다. `myEvent`가 아직 없으면 아무것도 하지 않는다(지금과 같음).
  - 순서: ① 지금 목록을 따로 잡아 둔다 → ② 화면을 먼저 바꾼다(`mutate(key, 바뀐 목록, false)`) → ③ API 호출 → ④ 성공하면 측정 이벤트를 보내고 안내를 띄운 뒤 `mutate(key)`로 다시 받는다.
  - **실패하면**(API가 예외를 던지면) `mutate(key, 잡아 둔 목록, false)`로 되돌리고 `pushToast('처리 중 오류가 발생했어요', 'plain')`를 띄운 뒤 `mutate(key)`. 문구는 상세 화면(`[eventId].tsx:156`)과 같다.
  - 측정 이벤트는 **성공했을 때** 보낸다: 담기 `web_event_관심행사추가버튼클릭`, 빼기 `web_event_관심행사삭제버튼클릭`(`event_category: 'web_event'`, `event_label: '관심행사'`). 지금은 성공하면 `return`이 먼저 걸려 보내지지 않는다(`List.tsx:110-123`, `:134-147`).
  - 안내 문구: `'관심 행사에 담았어요'`, `'관심 행사에서 뺐어요'`(종류는 기본값).
  - 같은 행사의 요청이 끝나기 전에 다시 누르면 무시한다(`useRef<Set<string>>`로 진행 중인 id를 기억).
  - `alert('이벤트 정보가 없습니다!')` 분기는 옮기지 않는다(id가 없는 행사는 목록에 없다).
  - API 주소·본문은 그대로: 담기 `POST /front/v1/favorite/events/{eventId}` `{ eventId: Number(id) }`, 빼기 `DELETE /front/v1/favorite/events/{favoriteId}` `{ favoriteId }`.

- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && npx eslint lib/hooks/useNow.ts lib/hooks/useFavorite.tsx lib/hooks/useSWR.tsx && pnpm test && pnpm build`
Expected: 오류 없음

관리자가 화면에서 볼 것(작업 10 뒤에 볼 수 있음. 로그인은 사용자가 직접 한다):
  1. 로그인한 상태에서 카드의 북마크를 누르면 바로 파랗게 채워지고 "관심 행사에 담았어요"가 뜬다. 다시 누르면 비워지고 "관심 행사에서 뺐어요".
  2. 개발자 도구에서 네트워크를 오프라인으로 바꾸고 북마크를 누르면, 채워졌다가 원래대로 돌아오고 "처리 중 오류가 발생했어요"가 뜬다(Review Focus 3).
  3. 로그인하지 않고 누르면 로그인 창이 뜬다.

---

### Task 5: 썸네일 · 자동 표지 · 아이콘 · 공용 믹스인

목업 기준: `../shared/base.css`의 `.k-thumb`, `.k-thumb__ph`, `.k-thumb > i`, `app.css:20-29`의 `.k-thumb::after`, `.k-auto*`, `app.js:99-102`의 `thumb`, `app.js:35-47`의 아이콘 경로.

**Files:**
- Create: `lib/utils/timeline/cover.ts`, `lib/utils/timeline/__tests__/cover.test.ts`
- Create: `components/events/timeline/TimelineIcon.tsx`, `components/events/timeline/EventThumb.tsx`, `EventThumb.module.scss`
- Modify: `styles/_mixin.scss` (156행 뒤에 추가)

**Interfaces:**
- Produces (`cover.ts`):

```ts
export const COVER_KINDS: readonly string[];   // ['세미나', '모임', '대회', '교육', '커뮤니티']
export interface AutoCover { index: number; kind: string; mode: string[]; }   // index 0~4
export const isUsableCover: (url: string | null | undefined) => boolean;
export const autoCover: (tags: { tag_name: string }[]) => AutoCover;
export const coverCaption: (cover: AutoCover) => string;   // '세미나 · 오프라인'
```

- Produces (부품):

```ts
// components/events/timeline/TimelineIcon.tsx
type IconName = 'bookmark' | 'share' | 'search' | 'chevron' | 'back' | 'rows' | 'calendar';
function TimelineIcon(props: { name: IconName; size?: number; className?: string }): JSX.Element;
// size 기본 20. viewBox 0 0 24 24, fill none, stroke currentColor, strokeWidth 1.8, 둥근 끝, aria-hidden

// components/events/timeline/EventThumb.tsx
function EventThumb(props: { event: Event; priority?: boolean; className?: string }): JSX.Element;
// 모서리 둥글기는 CSS 변수 --de-thumb-radius (기본 12px). 부모가 바꿔 쓴다.
```

- Produces (`styles/_mixin.scss`):

```scss
@mixin de-button-reset { appearance: none; border: 0; background: none; padding: 0; margin: 0;
  font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
@mixin de-focus-ring { &:focus-visible { outline: 2px solid var(--de-blue); outline-offset: 2px; } }
@mixin de-press { transition: transform 0.12s; &:active { transform: scale(0.97); }
  @include de-reduced-motion { transition: none; } }
@mixin de-chip { @include de-button-reset; @include de-focus-ring; display: inline-flex; align-items: center;
  gap: 6px; flex: none; height: 36px; padding: 0 13px; border-radius: 999px; background: var(--de-surface);
  font-size: 14px; font-weight: 600; color: var(--de-sub); white-space: nowrap;
  &:hover { background: var(--de-line); } }
@mixin de-tablet { @media (min-width: 621px) and (max-width: 860px) { @content; } }   // 날짜 띠 14일, 좁은 창
@mixin de-phone-wide { @media (min-width: 481px) and (max-width: 620px) { @content; } } // 날짜 띠 10일
@mixin de-phone { @media (max-width: 480px) { @content; } }                             // 날짜 띠 7일
@mixin de-narrow { @media (max-width: 360px) { @content; } }
```

**규칙**

- `isUsableCover`: 주소에 `brave-people-3.s3.ap-northeast-2.amazonaws.com`이 들어 있을 때만 `true`(지금 `Item.tsx:105-109`의 기준, `next.config.js`의 `images.domains` 첫 항목). 그 밖의 주소·빈 값·`null`은 `false`. 지금은 이때 기본 이미지(`/default/event-thumbnail-light.png`)를 보여 주는데, 새 부품은 **자동 표지**를 그린다.
- `autoCover`: `kind`는 태그 가운데 `COVER_KINDS`에 처음으로 걸리는 것, 없으면 `'행사'`. `index`는 `COVER_KINDS`에서의 순서, 없으면 0. `mode`는 `온라인`·`오프라인` 태그(태그에 나온 순서).
- `coverCaption`: `'<kind> · <mode를 가운뎃점으로 이은 것>'`. `mode`가 비면 `kind`만(목업은 이때 "세미나 · "처럼 점이 남는다).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/cover.test.ts`

```ts
import { autoCover, coverCaption, isUsableCover } from 'lib/utils/timeline/cover';

const tags = (...names: string[]) => names.map((tag_name) => ({ tag_name }));

describe('isUsableCover', () => {
  it('서비스의 S3 주소만 쓴다', () => {
    expect(
      isUsableCover('https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/a.jpg')
    ).toBe(true);
    expect(isUsableCover('https://example.com/a.png')).toBe(false);
    expect(isUsableCover('')).toBe(false);
    expect(isUsableCover(null)).toBe(false);
    expect(isUsableCover(undefined)).toBe(false);
  });
});

describe('autoCover', () => {
  it('유형 태그로 색을 고른다', () => {
    expect(autoCover(tags('오프라인', '유료', '모임', '블록체인'))).toEqual({
      index: 1, kind: '모임', mode: ['오프라인'],
    });
    expect(autoCover(tags('세미나')).index).toBe(0);
    expect(autoCover(tags('대회')).index).toBe(2);
    expect(autoCover(tags('교육')).index).toBe(3);
    expect(autoCover(tags('커뮤니티')).index).toBe(4);
  });

  it('유형 태그가 없으면 "행사", 첫 번째 색', () => {
    expect(autoCover(tags('온라인', '오프라인', '무료', 'AI'))).toEqual({
      index: 0, kind: '행사', mode: ['온라인', '오프라인'],
    });
  });

  it('표지 맨 윗줄 문구', () => {
    expect(coverCaption({ index: 0, kind: '세미나', mode: ['오프라인'] })).toBe('세미나 · 오프라인');
    expect(coverCaption({ index: 0, kind: '행사', mode: ['온라인', '오프라인'] })).toBe(
      '행사 · 온라인·오프라인'
    );
    expect(coverCaption({ index: 2, kind: '대회', mode: [] })).toBe('대회');
  });
});
```

- [ ] **Step 2: 실패를 확인하고 `cover.ts`를 구현한 뒤 통과를 확인한다.**

Run: `pnpm test -- cover`
Expected: 구현 전 FAIL, 구현 뒤 PASS (4개)

- [ ] **Step 3: `styles/_mixin.scss` 끝에 Interfaces의 믹스인 여덟 개를 추가한다.** 기존 것은 그대로 둔다.

- [ ] **Step 4: `TimelineIcon.tsx`를 만든다.** 경로(`d`)는 목업 `app.js:36-42`에서 그대로 옮긴다.

| 이름 | 내용 |
|---|---|
| `bookmark` | `<path d="M6.5 4h11v16.5l-5.5-3.8-5.5 3.8z"/>` |
| `share` | `<path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 13.5V20h14v-6.5"/>` |
| `search` | `<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>` |
| `chevron` | `<path d="M9 5l7 7-7 7"/>` (오른쪽 화살표. 아래로 쓸 때는 CSS로 90도 돌린다) |
| `back` | `<path d="M15 5l-7 7 7 7"/>` |
| `rows` | `<path d="M9 6.5h11M9 12h11M9 17.5h11"/>`와 점 셋 `<circle cx="4.6" cy="6.5" r=".8" fill="currentColor"/>` (cy 6.5, 12, 17.5) |
| `calendar` | `<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>` |

- [ ] **Step 5: `EventThumb`를 만든다.**

  **마크업**
  - 바깥 `<span>`(카드의 링크 안에 들어가므로 `div`를 쓰지 않는다): `position: relative; display: block; overflow: hidden; aspect-ratio: 16 / 9; background: var(--de-thumb-bg); border-radius: var(--de-thumb-radius, 12px);`
  - 테두리(흰 포스터가 바탕에 묻히지 않게): `&::after { content: ''; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.07); pointer-events: none; }`, 어두운 화면(`:global(html[data-theme='dark']) &::after`)은 `rgba(255, 255, 255, 0.08)`.
  - **커버가 있을 때**(`isUsableCover`가 참이고 이미지가 깨지지 않았을 때):
    - 자리 표시 글자 `<b aria-hidden>DEV.EVENT</b>`: `position: absolute; inset: 0; display: grid; place-items: center; font-weight: 800; letter-spacing: 0.04em; font-size: clamp(10px, 1.6vw, 15px); color: var(--de-thumb-fg);` 이미지가 뜨기 전까지 보인다.
    - 그 위에 `next/image`: `unoptimized`, `layout="fill"`, `objectFit="cover"`, `alt=""`(바로 옆에 제목이 있어 장식으로 둔다), `priority={priority}`, `onError`에서 "깨짐" 상태를 켠다.
  - **커버가 없거나 깨졌을 때** 자동 표지(`autoCover(event.tags)`):
    - 바깥에 `container-type: inline-size; background: linear-gradient(135deg, var(--c1), var(--c2)); color: #fff;`
    - 색(순서대로 `index` 0~4): `#000040 → #0043ff`, `#06493c → #12a47f`, `#8a2c08 → #f08c00`, `#3b1a8f → #845ef7`, `#7d1238 → #e64980`
    - 안쪽 `<span>`: `position: absolute; inset: 0; padding: 6.5cqw 7cqw; display: flex; flex-direction: column; justify-content: space-between;`
    - 윗줄 `<em>`(`coverCaption`): `font-style: normal; font-size: max(9px, 3.7cqw); font-weight: 700; opacity: 0.85;`
    - 제목 `<b>`: `font-size: max(11px, 6.3cqw); line-height: 1.34; font-weight: 800; letter-spacing: -0.02em;` 세 줄까지(`text-multiline-ellipsis(3)`)
    - 주최 `<small>`: `font-size: max(9px, 3.7cqw); font-weight: 600; opacity: 0.8;` 한 줄 말줄임
    - 컨테이너 단위(`cqw`)를 모르는 브라우저를 위해 같은 속성을 px로 한 번 먼저 적는다: 여백 `21px 22px`, 윗줄·주최 `12px`, 제목 `20px`. Sass가 `max(9px, 3.7cqw)`를 계산하려다 오류를 내면 `unquote('max(9px, 3.7cqw)')`로 적는다.
  - "깨짐" 상태는 `useState`로 두고, `event.cover_image_link`가 바뀌면 `useEffect`로 되돌린다.

- [ ] **Step 6: 확인**

Run: `pnpm test -- cover && npx tsc --noEmit && npx eslint lib/utils/timeline/cover.ts components/events/timeline && pnpm build`
Expected: 오류 없음. 빌드 로그에 Sass 경고(`cqw`, `max`)가 없는지 본다.

관리자가 화면에서 볼 것(작업 10 뒤. 비교: `app.html?bare=1#main`):
  1. 썸네일이 16:9이고 흰 포스터에 옅은 테두리가 보인다. 어두운 화면에서도 테두리가 보인다.
  2. 썸네일 없는 행사에 유형별 색 표지가 나오고, 윗줄·제목(세 줄까지)·주최가 목업과 같은 자리에 있다.
  3. 개발자 도구에서 이미지 주소 하나를 막고(Network → Block request URL) 새로 고치면 그 카드가 깨진 그림 대신 자동 표지로 보인다.

---

### Task 6: 행사 카드

목업 기준: `app.js:103`의 `tags`, `:214-230`의 `newMark`·`card`, `app.css:155-182`의 `.ev*`, `.slot*`, `.tags`, `.nw-new`, 860px 이하는 `app.css:291-294`. 목업 주소 `app.html?bare=1#main`.

**Files:**
- Create: `components/events/timeline/EventCard.tsx`, `EventCard.module.scss`

**Interfaces:**
- Consumes: `TimelineEvent`(Task 1), `EventThumb`·`TimelineIcon`·믹스인(Task 5), `useToast`, `lib/utils/gTag`
- Produces:

```ts
function EventCard(props: {
  item: TimelineEvent;
  favorite: boolean;
  onToggleFavorite: (event: Event) => void;
  priority?: boolean;   // 첫 화면에 보이는 카드의 썸네일을 먼저 받는다
}): JSX.Element;
```

**마크업** (누를 수 있는 것이 서로의 안에 들어가지 않게 한다)

```
<article class="card" [끝난 행사면 is-done]>
  <Link href="/event/detail/{id}"><a class="link">     ← 카드 전체가 링크
    <span class="thumb"><EventThumb /></span>
    <span class="body">
      <span class="slot"><i class="chip tone">{slot.chip}</i>[<span>{slot.time}</span>][<em>{slot.extra}</em>]</span>
      <strong class="title">[<i class="new">NEW</i>]{title}</strong>
      <span class="org">{organizer}</span>
      <span class="tags"><span>{tag_name}</span>…</span>     ← 버튼이 아니라 글자
    </span>
  </a></Link>
  <div class="actions">                                 ← 링크의 형제. 링크 위에 겹쳐 놓는다
    <button 관심 /> <button 공유 />
  </div>
</article>
```

- 지금 `Item.tsx:83-90`의 "누른 요소가 SPAN/DIV/IMG일 때만 이동"은 옮기지 않는다. 링크 안에는 버튼이 없으므로 막을 것이 없다.
- 링크의 `onClick`에서 측정 이벤트를 보낸다(지금과 같음): `web_event_이벤트클릭` / `web_event` / `이벤트클릭`.
- 끝났는지·새 행사인지는 `item.status === 'ended'`, `item.isNew`로 **그릴 때마다 계산된 값**을 쓴다. `useState`에 담아 두지 않는다(`Item.tsx:51-52`의 문제).
- 태그는 `event.tags`를 받은 순서대로 그린다(운영 데이터의 순서가 목업의 순서와 같다: 참여 방법, 비용, 유형, 주제).

**버튼**

| 버튼 | 내용 |
|---|---|
| 관심 | `<button type="button" aria-label="관심 행사에 담기" aria-pressed={favorite}>`, 아이콘 `bookmark` 20px. 누르면 `onToggleFavorite(item.event)` |
| 공유 | `<button type="button" aria-label="링크 복사">`, 아이콘 `share` 20px. 지금 `Item.tsx:56-71`과 같은 동작: `navigator.clipboard.writeText(event.event_link)` → 성공 `pushToast('링크가 복사되었어요')`, 실패 `pushToast('링크 복사에 실패했어요', 'plain')`, 측정 이벤트 `web_event_공유버튼클릭` / `web_event` / `공유` |

**카드의 공유는 외부 신청 링크(`event_link`)를 복사하고, 상세 화면의 공유는 페이지 주소를 복사한다. 지금 동작이고 바꾸지 않는다.**

**값** (`app.css` 기준)

| 부분 | PC | 860px 이하 |
|---|---|---|
| 카드 | `position: relative; border-radius: 20px; transition: background 0.15s;` 올리면 `background: var(--de-hover)` | `border-radius: 16px`, 올려도 바탕 없음 |
| 링크 | `display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 24px; padding: 12px; align-items: center; color: inherit;` | `grid-template-columns: 1fr; gap: 12px; padding: 0 0 8px;` |
| 썸네일 | `--de-thumb-radius: 14px` | 같음. 폭은 카드 폭 전체 |
| 글 영역 | `min-width: 0; padding-right: 48px;` | `padding-right: 44px` |
| 시각 줄 | `display: flex; align-items: center; gap: 8px; font-size: 14.5px; font-weight: 700;` | 같음 |
| 시각 줄의 칩 | `padding: 3px 8px; border-radius: 7px; font-size: 12px; font-weight: 700; font-style: normal;` | 같음 |
| 칩 색 | `dead`: 바탕 `--de-orange-soft` 글자 `--de-orange` / `open`: `--de-blue-soft`, `--de-blue` / `done`: `--de-surface`, `--de-hint` | 같음 |
| 덧말(`em`) | `font-style: normal; font-weight: 500; font-size: 13.5px; color: var(--de-hint);` | 같음 |
| 제목 | `display: block; margin-top: 9px; font-size: 20px; line-height: 1.4; font-weight: 700; letter-spacing: -0.015em;` 두 줄까지 | `font-size: 17.5px; margin-top: 7px;` |
| NEW | `display: inline-flex; align-items: center; height: 21px; padding: 0 7px; margin-right: 8px; border-radius: 6px; background: var(--de-blue-fill); color: #fff; font-size: 11.5px; font-weight: 800; font-style: normal; letter-spacing: 0.03em; vertical-align: 3px;` | 같음 |
| 주최 | `display: block; margin-top: 5px; font-size: 15px; color: var(--de-sub);` 한 줄 말줄임 | `font-size: 14px` |
| 태그 묶음 | `display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;` | 같음 |
| 태그 | `padding: 4px 9px; border-radius: 7px; background: var(--de-surface); font-size: 12.5px; font-weight: 500; color: var(--de-sub);` 카드에 올리면 `background: var(--de-line)` | 올려도 그대로 |
| 버튼 묶음 | `position: absolute; right: 14px; top: 14px; display: grid; gap: 2px;` | `top: auto; right: 0; bottom: 12px; display: block;` **공유 버튼은 숨긴다**(목업 `app.css:294`) |
| 버튼 | `de-button-reset`, `de-focus-ring`, `width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; color: var(--de-faint);` 올리면 `background: var(--de-line); color: var(--de-sub);` 담긴 상태는 `color: var(--de-blue)`이고 아이콘을 채운다(`svg { fill: currentColor; }`) | 같음 |
| 끝난 행사 | 썸네일 `opacity: 0.45; filter: grayscale(0.6);`, 제목·주최 `color: var(--de-hint)` | 같음 |

- 링크에는 `de-focus-ring`을 건다(`border-radius`는 카드와 같게).
- `de-reduced-motion`에서 transition 없음.

- [ ] **Step 1: `EventCard.tsx`와 스타일을 위 내용으로 만든다.**

- [ ] **Step 2: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/timeline/EventCard.tsx && pnpm build`
Expected: 오류 없음

Run: `grep -n "useState\|tagName" components/events/timeline/EventCard.tsx`
Expected: 결과 없음 (끝남·NEW를 상태에 담지 않고, 누른 요소의 태그 이름으로 가르지 않는다)

관리자가 화면에서 볼 것(작업 10 뒤. 비교: `app.html?bare=1#main`, 1280px과 390px, 밝게·어둡게):
  1. 썸네일 320px, 시각 줄, 제목 20px, 주최, 회색 태그의 크기와 간격이 목업과 같다. 모바일은 썸네일이 위에 화면 폭 전체로 놓이고 북마크만 오른쪽 아래에 있다.
  2. 썸네일·제목 글자·태그·카드의 빈 곳 어디를 눌러도 상세로 간다. 북마크·공유를 누르면 상세로 가지 않는다(Review Focus 3). 키보드 Tab 순서는 카드 → 북마크 → 공유.
  3. 공유를 누르면 "링크가 복사되었어요"가 뜨고, 붙여 넣으면 그 행사의 신청 주소(외부 링크)다.
  4. 제목이 아주 긴 행사(두 줄을 넘는 것)가 말줄임 되고 버튼과 겹치지 않는다. NEW가 붙은 제목이 두 줄로 넘어갈 때 줄 높이가 어긋나지 않는다.
  5. 끝난 행사(지난 행사를 펼쳤을 때)는 썸네일과 글자가 흐리고 "접수 종료"·"행사 종료" 칩이 회색이다.

---

### Task 7: 날짜별 목록 · 빈 화면 · 불러오는 중

목업 기준: `app.js:232-244`의 `listHtml`, `app.css:144-154`의 `.mdiv`, `.day*`, `:183-186`의 `.empty`, `.endnote`, 860px 이하 `:286-290`, 날짜 제목 크기 보정 `:437-441`.

**Files:**
- Create: `components/events/timeline/TimelineList.tsx`, `TimelineList.module.scss`
- Create: `components/events/timeline/TimelineEmpty.tsx`, `TimelineEmpty.module.scss`
- Create: `components/events/timeline/TimelineSkeleton.tsx`, `TimelineSkeleton.module.scss`

**Interfaces:**
- Consumes: `DayGroup`(Task 2), `formatMd`·`weekdayOf`·`DOW`(Task 1), `EventCard`(Task 6)
- Produces:

```ts
// TimelineList.tsx
export const dayElementId: (key: string) => string;   // 'd-2026-11-13'
function TimelineList(props: {
  groups: DayGroup[];                     // 그릴 묶음 (이미 걸러진 것)
  todayKey: string;
  isFavorite: (eventId: string) => boolean;
  onToggleFavorite: (event: Event) => void;
  eagerCount?: number;                    // 앞에서부터 몇 장의 썸네일을 먼저 받을지. 기본 4
  endnote?: boolean;                      // 맨 아래 "여기까지가 …" 문구. 기본 false
}): JSX.Element;

// TimelineEmpty.tsx
function TimelineEmpty(props: {
  title: string; desc?: string; actionLabel?: string; onAction?: () => void;
}): JSX.Element;

// TimelineSkeleton.tsx
function TimelineSkeleton(props: { count?: number }): JSX.Element;   // 기본 3
```

**`TimelineList`의 구성**

- 묶음마다 `<section id={dayElementId(key)} data-key={key} aria-labelledby=…>`. 키가 `todayKey`보다 앞이면 `is-past`. 날짜 제목의 id는 날짜 키로 만든다(예: `dh-2026-11-13`. React 17이라 `useId`가 없다).
- **달이 바뀌는 자리**(앞 묶음과 달이 다를 때. 첫 묶음 앞에는 넣지 않는다)에 `<h2>`로 `'12월'`: `margin: 28px 0 0; padding: 14px 0 0; border-top: 1px solid var(--de-line); font-size: 20px; font-weight: 800; letter-spacing: -0.02em;`
- 날짜 묶음: `display: grid; grid-template-columns: 116px minmax(0, 1fr);` 860px 이하 `1fr`.
- 왼쪽 레일: `position: relative; padding: 26px 0;`
  - 점선: `&::after { content: ''; position: absolute; right: 19px; top: 0; bottom: 0; border-right: 2px dotted var(--de-line); }`
  - 점: `&::before { content: ''; position: absolute; right: 14px; top: 36px; width: 12px; height: 12px; border-radius: 50%; background: var(--de-bg); border: 3px solid var(--de-ink); z-index: 1; }` 지난 날은 `border-color: var(--de-faint)`
  - 860px 이하: `padding: 20px 0 0;` 점선·점 없음
- 레일 안의 날짜 제목(스크롤해도 띠 아래에 붙는다): `position: sticky; top: calc(var(--de-navh, 130px) + 18px);` 860px 이하 `position: static; display: flex; align-items: baseline; gap: 8px;`
  - `<h3>` 안에 날짜 `<b>`(`formatMd` → `11.13`)와 요일 `<span>`(`금요일`). `h3` 자체는 `margin: 0; font: inherit;`
  - 날짜: `display: block; font-size: 25px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1;` 860px 이하 22px, 621~860px 24px
  - 요일: `font-size: 14px; font-weight: 600; color: var(--de-sub);` 일요일 `--de-sun`, 토요일 `--de-sat`. 860px 이하 15px
  - 건수 `<small>`(`4건`. 목업에 있는 숫자): `display: block; margin-top: 4px; font-size: 13.5px; font-weight: 600; color: var(--de-hint);` 860px 이하 `margin: 0 0 0 auto; font-size: 15px; color: var(--de-sub);`
- 오른쪽 목록: `padding: 14px 0 8px; display: grid; gap: 2px; min-width: 0;` 860px 이하 `padding-top: 10px; gap: 14px;`
- 카드의 `key`는 **행사 id**(`item.event.id`). 순번을 쓰지 않는다(`List.tsx:156`의 문제).
- `priority`: 전체 순서로 앞에서 `eagerCount`장까지 `true`(지금 `ItemList.tsx:143`의 `eagerCount`와 같은 목적: 첫 화면 그림을 먼저 받는다).
- `endnote`가 참이고 묶음이 있으면 맨 아래에 `<p>여기까지가 지금 등록된 행사예요.</p>`: `margin: 36px 0 0; padding: 22px; border-radius: 16px; background: var(--de-surface); text-align: center; font-size: 14.5px; color: var(--de-sub); line-height: 1.6;`

**`TimelineEmpty`**: `padding: 80px 0; text-align: center;` 제목 `<b>` 18px, 설명 `<p>` `margin: 8px 0 18px; font-size: 14.5px; color: var(--de-hint);`, 버튼(`actionLabel`이 있을 때만) `de-button-reset`·`de-focus-ring`·`de-press`, `height: 42px; padding: 0 18px; border-radius: 12px; background: var(--de-surface); font-weight: 700; font-size: 14.5px;`. 바깥에 `role="status"`.

**`TimelineSkeleton`** (목업에 그림이 없다. 설명 페이지의 "카드 자리에 같은 크기의 회색 뼈대"를 따른다)
- 바깥: `aria-busy="true"`, 안에 화면에 보이지 않는 글자 "행사를 불러오는 중이에요"(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0);`).
- 날짜 묶음 한 칸의 틀(왼쪽 116px 비움, 오른쪽에 카드 자리 `count`개). 카드 자리는 카드와 같은 격자(`320px minmax(0, 1fr)`, `gap: 24px`, `padding: 12px`, 860px 이하 한 칸).
- 회색 막대(`background: var(--de-surface); border-radius: 8px;`): 썸네일 자리 16:9(`border-radius: 14px`), 칩 `64×22px`, 제목 `70%×24px`(위 9px), 주최 `40%×16px`(위 9px).
- 움직임 없음(깜빡이는 애니메이션을 넣지 않는다).

- [ ] **Step 1: 세 부품과 스타일을 만든다.**

- [ ] **Step 2: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/timeline && pnpm build`
Expected: 오류 없음

Run: `grep -n "key={" components/events/timeline/TimelineList.tsx`
Expected: 카드의 key가 `item.event.id`, 묶음의 key가 `group.key`. `index`를 key로 쓴 줄이 없다.

관리자가 화면에서 볼 것(작업 10 뒤. 비교: `app.html?banner=none#main`):
  1. 왼쪽에 날짜(11.13 / 금요일 / 4건)와 점선·점, 오른쪽에 그날의 카드. 스크롤하면 날짜 제목이 날짜 띠 바로 아래에 붙어 따라온다.
  2. 12월의 첫 묶음 위에 "12월" 제목과 가로줄이 있다. 11월의 첫 묶음 위에는 없다.
  3. 토요일은 파랑, 일요일은 빨강.
  4. 390px에서는 날짜·요일·건수가 한 줄(건수는 오른쪽 끝)이고 점선이 없다.
  5. 맨 아래에 "여기까지가 지금 등록된 행사예요."

---

### Task 8: 날짜 띠 · 월 선택 · 보기 전환

목업 기준: `app.js:181-208`의 `navHtml`·`mpHtml`, `:313-324`의 `rbArrows`·`paintNav`, `:559-585`의 끌어서 넘기기. 스타일은 `app.css:88-123`(`.dn`, `.dn__top`, `.mbtn`, `.today`, `.vt`, `.rc*`, `.mp*`)과 **뒤에서 덮어쓴 값**인 `:379-393`(`.rbw`, `.rb`, `.rc`, `.rbn`), `:397-402`(360px), `:407-408`(끌기), `:414`(오늘 칸에 올렸을 때), `:418-425`(621~860px, 481~620px), `:365-366`(860px 이하 보기 전환).

**Files:**
- Create: `components/events/timeline/DateNav.tsx`, `DateNav.module.scss`, `DateStrip.tsx`, `DateStrip.module.scss`, `MonthPicker.tsx`, `MonthPicker.module.scss`
- Create: `components/events/calendar/ViewToggle.module.scss`
- Modify: `components/events/calendar/ViewToggle.tsx` (전체. 1-58행)

**Interfaces:**
- Consumes: `StripDay`·`MonthParam`·`stripDayLabel`·`monthKey`(Task 2), `TimelineIcon`·믹스인(Task 5), `useOnClickOutside`(`lib/hooks/useOnClickOutside.tsx`)
- Produces:

```ts
// DateNav.tsx — 화면 위에 붙는 줄 전체 (제목 줄 + 날짜 띠)
function DateNav(props: {
  days: StripDay[];
  activeKey: string;                        // 지금 보고 있는 날 (스크롤을 따라 바뀜)
  title: MonthParam;                        // 제목에 적을 연·월
  monthTotals: Record<string, number>;      // 응답에 들어 있는 달의 건수
  thisMonthKey: string;                     // 오늘이 속한 달 'YYYY-MM'
  yearRange: { min: number; max: number };  // 월 선택에서 넘길 수 있는 해
  lockUnknownMonths?: boolean;              // 참이면 응답에 없는 달은 누를 수 없다 (검색 화면)
  view: ViewMode;                           // 보기 전환에 넘길 값
  searchOpen: boolean;                      // 모바일 검색칸이 열려 있는지
  onPickDay: (key: string) => void;
  onPickMonth: (month: MonthParam) => void;
  onToday: () => void;
  onToggleSearch: () => void;
  onHeightChange: (px: number) => void;     // 이 줄의 높이가 바뀔 때마다
}): JSX.Element;

// ViewToggle.tsx — props는 그대로
export type ViewMode = 'list' | 'calendar';
const ViewToggle: (props: { current: ViewMode }) => JSX.Element;
```

`DateStrip`(`days`, `activeKey`, `onPickDay`)과 `MonthPicker`(`title`, `monthTotals`, `thisMonthKey`, `yearRange`, `lockUnknownMonths`, `onPickMonth`, `onClose`)는 `DateNav` 안에서만 쓴다.

**바깥 (`DateNav`)**

- `position: sticky; top: 0; z-index: 15; background: var(--de-bg); padding-top: 16px; border-bottom: 1px solid var(--de-line);` 860px 이하 `padding-top: 10px`.
- `ResizeObserver`로 자기 높이를 재서 `onHeightChange`로 알린다(마운트 때 한 번, 크기가 바뀔 때마다). `ResizeObserver`가 없으면 `resize` 이벤트로 잰다.

**제목 줄**: `display: flex; align-items: center; gap: 6px; position: relative;`

| 자리 | 내용 | 값 |
|---|---|---|
| 월 버튼 | `<button aria-expanded aria-haspopup="dialog" aria-label="2026년 11월, 다른 달 고르기">` 안에 `<span>2026년 </span>11월`과 아래 화살표(`chevron` 18px, 90도 회전, `--de-hint`) | `display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px 4px; border-radius: 12px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; white-space: nowrap;` 올리면 `--de-hover`. 860px 이하 20px. 360px 이하에서는 "2026년 "을 숨긴다 |
| 오른쪽 묶음 | 검색 버튼, 오늘, 보기 전환 | `margin-left: auto; display: flex; align-items: center; gap: 8px; flex: none;` 860px 이하 `gap: 6px`, 360px 이하 `gap: 4px` |
| 검색 버튼 | `<button aria-label="행사 검색" aria-expanded={searchOpen}>`, 아이콘 `search` 20px. **860px 이하에서만 보인다** | `width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: var(--de-sub);` 올리면 `--de-hover` |
| 오늘 | `<button>오늘</button>` | `height: 36px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--de-line); font-size: 13.5px; font-weight: 700; color: var(--de-sub); white-space: nowrap; flex: none;` 올리면 `--de-hover`. `de-press`. 860px 이하 `padding: 0 12px`, 360px 이하 `0 10px` |
| 보기 전환 | `<ViewToggle current={view} />` | 아래 |

**보기 전환 (`ViewToggle`)** — 동작(`switchTo`)은 그대로 두고 마크업과 스타일만 바꾼다.

- `<div role="group" aria-label="보기 방식">` 안에 버튼 둘. `role="tablist"`·`aria-selected`·이모지(📋 📅)는 뺀다.
- 버튼: `aria-pressed`, `aria-label="타임라인으로 보기"` / `"캘린더로 보기"`, 안에 아이콘(`rows` / `calendar` 18px)과 `<span>타임라인</span>` / `<span>캘린더</span>`. ("리스트"라는 말은 쓰지 않는다.)
- 바깥: `display: flex; flex: none; padding: 3px; border-radius: 12px; background: var(--de-surface); font-size: 13.5px; font-weight: 700;`
- 버튼: `de-button-reset`, `de-focus-ring`, `display: flex; align-items: center; gap: 5px; height: 30px; padding: 0 12px; border-radius: 9px; color: var(--de-hint);` 고른 쪽 `background: var(--de-bg); color: var(--de-ink); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`
- PC에서는 아이콘을 숨기고 글자만, 860px 이하에서는 글자를 숨기고 아이콘만(`width: 32px; height: 30px; padding: 0; justify-content: center;`).
- 스타일은 새 `ViewToggle.module.scss`에 둔다. `CalendarView.module.scss:1-26`의 `.viewToggle*`는 건드리지 않는다(쓰는 곳이 없어짐).
- `CalendarHeader`가 같은 부품을 쓰므로 캘린더 보기(`/events?view=calendar`)의 전환 버튼도 새 모양이 된다.

**날짜 띠 (`DateStrip`)**

- 줄: `display: flex; align-items: center; gap: 8px; padding: 10px 0 8px;` 860px 이하 `padding: 8px 0 6px`.
- 양끝 화살표 `<button aria-label="이전 날짜 보기">` / `"다음 날짜 보기"`(`back` / `chevron` 16px): `flex: none; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--de-line); display: grid; place-items: center; color: var(--de-sub); transition: opacity 0.15s;` 올리면 `--de-hover`. 더 넘길 곳이 없으면 `disabled`(`opacity: 0.28; cursor: default; background: none;`). **860px 이하에서는 숨긴다.**
  - 누르면 띠를 **보이는 폭의 절반**만큼 넘긴다(`scrollBy({ left: ±clientWidth / 2, behavior: 'smooth' })`). 화살표가 보이는 폭에서는 14칸이 보이므로 일주일이다.
  - 끝 판정: `scrollLeft <= 1`이면 이전 비활성, `scrollLeft + clientWidth >= scrollWidth - 1`이면 다음 비활성. 띠의 `scroll` 이벤트(passive)와 `days`가 바뀔 때 다시 계산한다.
- 띠 `<div role="group" aria-label="날짜 고르기">`: `position: relative; flex: 1; min-width: 0; display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; cursor: grab; user-select: none;` 스크롤바 숨김(`&::-webkit-scrollbar { display: none; }`).
- 칸 `<button>`(행사가 없으면 `disabled`): `flex: 0 0 calc(100% / 14); scroll-snap-align: start; padding: 4px 0 3px; border-radius: 10px; text-align: center;` `aria-label={stripDayLabel(day)}`, 오늘은 `aria-current="date"`, 고른 날은 `aria-pressed="true"`.
  - **한 화면에 보이는 칸 수:** 621px 이상 14칸, 481~620px(`de-phone-wide`) `calc(100% / 10)`, 480px 이하(`de-phone`) `calc(100% / 7)`.
  - 칸 안: 요일(`label`) → 날짜 숫자 → 건수(0이면 빈칸).

| | 861px 이상(PC) | 621~860px | 620px 이하 | 360px 이하 |
|---|---|---|---|---|
| 요일 | 13.5px / 600 / `--de-hint` | 12px | 12.5px | 12px |
| 날짜 숫자 | `44×44px` 원, `margin: 5px auto`, 20px / 700 | `38×38px`, `margin: 4px auto`, 17.5px | `40×40px`, `margin: 4px auto`, 18.5px | `36×36px`, 17px |
| 건수 | `height: 17px; line-height: 17px;` 13px / 700 / `--de-blue` | 12px | 12px | 11.5px |

  - 요일 색: 일요일 `--de-sun`, 토요일 `--de-sat`. **1일**(`isFirst`)은 요일 대신 "12월"을 적고 `color: var(--de-ink); font-weight: 800;`
  - 날짜 숫자: `display: grid; place-items: center; border-radius: 50%; transition: 0.12s;`
  - 행사 있는 칸에 올리면 숫자 바탕 `--de-hover`.
  - 행사 없는 칸: `cursor: default`, 숫자 `color: var(--de-faint); font-weight: 500;`, 건수 자리는 비워 두되 높이는 유지.
  - 지난 날: 숫자·건수 `--de-hint`.
  - 고른 날: 숫자에 `box-shadow: inset 0 0 0 2px var(--de-ink)`.
  - 오늘: 숫자 `background: var(--de-ink); color: var(--de-bg); box-shadow: none;` 올려도 그대로(`opacity: 0.86`만). 오늘이면서 고른 날: `box-shadow: 0 0 0 2px var(--de-bg), 0 0 0 4px var(--de-ink)`.
  - 칸에 `de-focus-ring`.
- **고른 날이 화면 밖이면 띠가 따라 넘어간다.** `activeKey`가 바뀐 뒤 그 칸이 띠의 보이는 범위 밖이면 `scrollTo({ left: 칸의 offsetLeft, behavior: 'smooth' })`. `days`의 첫 날이 바뀐 직후(지난 행사를 펼쳤을 때, 다른 달로 갔을 때)에는 부드럽게가 아니라 바로 옮긴다(고른 날이 없으면 오늘 칸, 그것도 없으면 맨 앞).
- **끌어서 넘기기**(마우스만. 터치와 트랙패드는 브라우저가 넘긴다):
  - `pointerdown`(`pointerType === 'mouse'`, 왼쪽 버튼)에서 시작. 5px 넘게 움직이면 끌기로 본다.
  - 끄는 동안: 띠에 `is-drag`(`cursor: grabbing; scroll-snap-type: none;`, 칸은 `pointer-events: none`), `scrollLeft = 처음 값 − 움직인 거리`.
  - 놓으면: 마지막 움직임에서 80ms가 지나지 않았으면 끌던 빠르기(px/ms)×220만큼 더 간 자리에서, 가장 가까운 칸 경계(칸 폭의 배수)로 부드럽게 맞춘다. `is-drag`는 420ms 뒤에 뗀다.
  - **끈 직후의 `click`은 날짜 누르기로 치지 않는다**(Review Focus 5). 끌기로 판정된 뒤 처음 오는 `click`을 캡처 단계에서 막는다.
  - `dragstart`는 `preventDefault`.
  - `pointermove`·`pointerup`·`pointercancel`은 끄는 동안에만 `window`에 걸고, 끝나면 푼다. 언마운트 때도 푼다.
- `de-reduced-motion`: transition 없음, JS의 `behavior`는 `'auto'`(`window.matchMedia('(prefers-reduced-motion: reduce)').matches`).

**월 선택 (`MonthPicker`)** — 월 버튼을 누르면 그 아래에 뜬다.

- `<div role="dialog" aria-label="월 선택">`: `position: absolute; left: 0; top: 48px; z-index: 30; width: 320px; padding: 16px; border-radius: 18px; background: var(--de-bg); border: 1px solid var(--de-line); box-shadow: var(--de-shadow);` 860px 이하 `left: 0; right: 0; width: auto;`
- 윗줄: `display: flex; align-items: center; justify-content: space-between; font-size: 16px; font-weight: 800; margin-bottom: 12px;` ‹ `2026년` ›. 화살표 `<button aria-label="이전 해">` / `"다음 해"`: `36×36px` 원, `border: 1px solid var(--de-line); color: var(--de-sub);` 올리면 `--de-hover`. `yearRange`를 벗어나면 `disabled`(`opacity: 0.28`).
  - 목업은 860px 이하에서 이 화살표가 숨는다(`app.css:278`의 `.arw { display: none }`이 함께 걸린 것). **모바일에서도 보이게 한다**(없으면 다른 해로 갈 수 없다).
  - 보이는 해는 `MonthPicker`의 상태다. 열 때 `title.year`로 시작한다.
- 열두 달: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;` 칸 `<button>`: `padding: 10px 0 8px; min-height: 52px; border-radius: 12px; font-size: 15px; font-weight: 700;` 올리면 `--de-hover`. `aria-label`은 건수가 있으면 `"11월, 행사 68건"`, 없으면 `"10월"`.
  - 칸 안: `11월`과, **응답에 들어 있는 달만** 아랫줄 `<small>68건</small>`(`display: block; margin-top: 1px; font-size: 11px; font-weight: 600; color: var(--de-hint);`). `monthTotals`에 없는 달은 **달 이름만** 적는다(건수 줄 없음). 건수가 0인 달은 `–`를 적고 글자색 `--de-faint`.
  - 지금 제목의 달(`title`): `background: var(--de-ink); color: var(--de-bg);` 건수는 `color: var(--de-bg); opacity: 0.7;`. `aria-current="true"`.
  - 이번 달(`thisMonthKey`)이면서 고른 달이 아닐 때: `box-shadow: inset 0 0 0 1.5px var(--de-blue)`.
  - `lockUnknownMonths`가 참이면 `monthTotals`에 없는 달은 `disabled`(글자색 `--de-faint`).
- 달을 누르면 `onPickMonth({ year, month })`를 부르고 닫는다.
- 닫기: 바깥을 누르거나(`useOnClickOutside`) Esc. Esc로 닫으면 포커스가 월 버튼으로 돌아간다. 열릴 때 포커스는 지금 제목의 달 칸으로 옮긴다.

- [ ] **Step 1: `ViewToggle.tsx`와 `ViewToggle.module.scss`를 위 내용으로 바꾼다.** `switchTo`의 본문은 한 글자도 바꾸지 않는다.

- [ ] **Step 2: `DateStrip`, `MonthPicker`, `DateNav`와 스타일을 만든다.**

- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/timeline components/events/calendar/ViewToggle.tsx && pnpm build`
Expected: 오류 없음

Run: `grep -rn "innerWidth\|windowX" components/events/timeline`
Expected: 결과 없음 (폭은 CSS로만 가른다)

관리자가 화면에서 볼 것(보기 전환은 이 작업 뒤 바로, 나머지는 작업 10 뒤. 비교: `app.html?banner=none#main`):
  1. 1280px: "2026년 11월 ⌄", 오늘, "타임라인 | 캘린더", 그 아래 띠에 14일. 오늘 칸은 검정 원, 행사 없는 날은 옅고 눌리지 않는다. 날짜 아래 숫자가 그날 카드 수와 같다.
  2. 폭을 줄여 가며 칸 수를 센다: 700px에서 14칸, 560px에서 10칸, 390px에서 7칸. 390px에서 좌우로 밀면 멈출 때 항상 7칸이 온전히 보인다(반쯤 잘린 칸이 없다).
  3. PC에서 띠를 마우스로 잡고 끌면 넘어가고, 놓으면 조금 더 가서 칸에 맞춰 멈춘다. **끌다가 날짜 위에서 손을 떼도 그 날짜로 이동하지 않는다**(Review Focus 5).
  4. ‹ ›를 누르면 7일씩 넘어가고, 끝에 닿으면 흐려진다.
  5. 12월 1일 칸에 요일 대신 "12월"이 진하게 적혀 있다.
  6. "2026년 11월"을 누르면 열두 달이 뜬다. 응답에 있는 달(이번 달과 그 뒤)에는 "N건"이 있고, 지난 달에는 달 이름만 있다. Esc로 닫히고 포커스가 버튼으로 돌아온다. 390px에서 화면 폭에 맞게 뜨고 ‹ ›로 해를 바꿀 수 있다.
  7. 390px: 보기 전환이 아이콘 두 개, 검색 아이콘이 보인다. 360px: "11월 ⌄"만 보이고 한 줄에 들어간다.
  8. 키보드: Tab으로 월 버튼 → 오늘 → 보기 전환 → 날짜 칸(행사 있는 날만)을 지나간다. 포커스 테두리가 보인다.
  9. `/events?view=calendar`의 전환 버튼도 새 모양이고, 눌러서 두 보기를 오갈 수 있다(달력 자체는 5단계라 옛 모양).

---

### Task 9: 필터 줄 — 검색칸과 칩

목업 기준: `app.js:209-213`의 `chipsHtml`, `:329-330`의 검색칸, `app.css:125-139`(`.ft`, `.q`, `.chips`, `.chip*`, `.sep`), `:283-285`(860px 이하), `:399`(360px), `:410-411`(간격), `:429-435`(481~860px 줄바꿈, 480px 이하 흐림).

**Files:**
- Create: `components/events/timeline/FilterBar.tsx`, `FilterBar.module.scss`

**Interfaces:**
- Consumes: `TimelineFilters`(Task 3), `EventContext`의 `newOnly`·`showPast`·`replaceJobGroupList`와 기존 `handleEventType`·`handleLocation`·`handleCoast`·`handleSearch`(Task 3), `parseUrl`·`initUrl`(`lib/utils/UrlUtil.tsx`), `jobGroups`(`components/features/filters/jobGroup.ts`), `eventType`(`eventType.ts`), `isEnterKey`(`lib/utils/searchUtil.tsx`), `de-chip` 등(Task 5)
- Produces:

```ts
function FilterBar(props: {
  filters: TimelineFilters;   // 주소에서 읽은 지금 필터 (칩의 켜짐·꺼짐은 이것으로 그린다)
  searchOpen: boolean;        // 860px 이하에서 검색칸을 펼칠지
  newCount: number;
  pastCount: number;
  hidePastChip?: boolean;     // 다른 달을 볼 때 참
}): JSX.Element;
```

**필터 항목은 지금 그대로다.** 목업의 칩(전체·AI·클라우드·블록체인·보안·기술일반 / 온라인·오프라인·무료)은 지금 서비스보다 적다. 지금 있는 것을 빼지 않는다.

| 묶음 | 지금 | 새 모양 | 주소의 키 |
|---|---|---|---|
| 직군 | 태그 9개, 여러 개 고름 (`jobGroup.ts`: 전체, AI, 클라우드, 블록체인, 보안, 교육, 기술일반, 모임, 대회/공모전) | 칩 9개, 여러 개 고름 | `tag` (여러 번) |
| 참여 방법 | 드롭다운(오프라인, 온라인, 전체) | 칩 둘: 온라인, 오프라인 (하나만. 켜진 것을 다시 누르면 꺼짐) | `location` |
| 비용 | 드롭다운(유료, 무료, 전체) | 칩 둘: 무료, 유료 (하나만) | `coast` |
| 행사 유형 | 드롭다운(`eventType.ts`의 11개) | `<select>` 하나를 칩 모양으로 | `type` |
| 검색어 | 입력칸, Enter | 입력칸, Enter | `kwd` |

**주소 만들기** — `asPath`는 `router.asPath`, `tags`는 `filters.tags`. 만든 주소는 `router.push(url, undefined, { scroll: false })`.

| 동작 | 주소 |
|---|---|
| 직군 칩(전체 아님) 누름 | `parseUrl(asPath, 'tag', 이름, tags)` (켜져 있으면 빠지고 꺼져 있으면 더해진다) |
| "전체" 누름 | `tags`가 비어 있으면 **아무것도 하지 않는다.** 아니면 `initUrl(asPath, 'tag', tags, type, location, coast)` |
| 참여 방법·비용 칩(꺼져 있음) | `parseUrl(asPath, 'location' 또는 'coast', 값, tags)` |
| 참여 방법·비용 칩(켜져 있음) | `initUrl(asPath, 'location' 또는 'coast', tags, type, location, coast)` |
| 행사 유형 고름 | 값이 `'전체'`면 `initUrl(asPath, 'type', …)`, 아니면 `parseUrl(asPath, 'type', 값, tags)` |
| 검색어 넣고 Enter | 앞뒤 공백을 뺀 값이 있으면 `parseUrl(asPath, 'kwd', 값, tags)`. 비어 있고 `filters.kwd`가 있으면 `initUrl(asPath, 'kwd', …)`. 둘 다 없으면 아무것도 하지 않는다 |

- "전체"를 `tags`가 빈 채로 누르면 지금은 `/events`로 가면서 검색어가 사라진다(`initUrl`이 검색어를 보지 않는다: `UrlUtil.tsx:24-25`). 그래서 막는다.
- `initUrl`·`parseUrl`의 `jobGroupList` 자리에는 context가 아니라 **주소에서 읽은 `filters.tags`**를 넘긴다. context는 한 박자 늦게 맞춰지기 때문이다.
- Enter 판정은 `isEnterKey`. 한글 조합 중(`event.nativeEvent.isComposing`)의 Enter는 무시한다.
- 측정 이벤트(지금과 같은 값, 모두 `event_category: 'web_event'`, `event_label: '검색'`): 검색 Enter `web_event_키워드검색엔터클릭`, 행사 유형 `web_event_행사유형`, 참여 방법 `web_event_참여방법`, 비용 `web_event_비용`.

**context 맞추기** — `useEffect`(의존: `router.asPath`)에서 주소의 필터를 context에 넣는다: `replaceJobGroupList(filters.tags)`, `handleEventType(filters.type)`, `handleLocation(filters.location)`, `handleCoast(filters.coast)`, `handleSearch(filters.kwd)`. 결과 없음 화면(`EventNull`)의 추천 태그가 context를 읽기 때문이다. 옛 부품이 하던 일(`FilterByJobGroup.tsx:28-32`, `FilterByCoast.tsx:18-29` 등)을 한 곳에서 한다.

**마크업과 값**

- 줄: `display: flex; align-items: center; flex-wrap: wrap; gap: 14px 8px; padding: 18px 0 0;` 860px 이하 `gap: 10px 8px; padding-top: 12px;`
- 검색칸 `<label>`: `display: flex; align-items: center; gap: 8px; width: 260px; height: 40px; padding: 0 14px; border-radius: 12px; background: var(--de-surface); color: var(--de-hint);` 안에 아이콘 `search` 18px와 `<input type="search" placeholder="행사명, 주최로 검색" aria-label="행사 검색" autoComplete="off">`(`flex: 1; min-width: 0; border: 0; outline: 0; background: none; font: inherit; font-size: 14.5px; color: var(--de-ink);` placeholder `--de-hint`). 포커스가 안에 있으면 `box-shadow: inset 0 0 0 1.5px var(--de-blue)`.
  - 처음 값은 `filters.kwd`(없으면 빈칸). `filters.kwd`가 바뀌면 입력값도 맞춘다.
  - 860px 이하: `width: 100%`이고 **`searchOpen`이 참일 때만 보인다.** 참으로 바뀌는 순간 입력칸에 포커스를 준다.
- 칩 묶음: `display: flex; flex-wrap: wrap; gap: 6px;`
  - 481~860px: 줄바꿈 유지, `row-gap: 8px`, 구분선 숨김.
  - 480px 이하: `flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 -20px; padding: 0 34px 0 20px; width: calc(100% + 40px);` 오른쪽 끝을 흐리게 `mask-image: linear-gradient(90deg, #000 calc(100% - 30px), transparent)`(`-webkit-mask-image`도). 360px 이하 `margin: 0 -16px; padding-left: 16px; width: calc(100% + 32px);`
- 칩 `<button type="button" aria-pressed>`: `de-chip`, `de-press`. 켜지면 `background: var(--de-ink); color: var(--de-bg);`
- 구분선 `<i aria-hidden>`: `width: 1px; height: 18px; background: var(--de-line); margin: 0 4px;`
- **순서:** 직군 칩 9개 → 구분선 → 온라인, 오프라인, 무료, 유료, 행사 유형 → 구분선 → 새로 올라온 행사 → 지난 행사.
- 행사 유형 `<select aria-label="행사 유형">`: `de-chip`과 같은 크기·색. `appearance: none; padding-right: 30px;` 오른쪽에 아래 화살표(`chevron` 14px, 90도 회전, `pointer-events: none`)를 겹친다. 옵션: 첫 줄 `<option value="전체">행사 유형</option>`, 이어서 `eventType`에서 `'전체'`를 뺀 열 개. 값이 골라져 있으면 켜진 칩의 색.
- "새로 올라온 행사" 칩: `<button aria-pressed={newOnly}>` 안에 빨간 점(`width: 7px; height: 7px; border-radius: 50%; background: var(--de-red);` 켜지면 `background: var(--de-bg)`)과 `새로 올라온 행사 {newCount}`. 누르면 `handleNewOnly(!newOnly)`.
- "지난 행사" 칩(`pastCount > 0`이고 `hidePastChip`이 아닐 때만): `<button aria-pressed={showPast}>`, 문구는 꺼져 있으면 `지난 행사 {pastCount}건 보기`, 켜져 있으면 `지난 행사 숨기기`. 모양: `background: none; box-shadow: inset 0 0 0 1px var(--de-line); color: var(--de-hint);` 켜지면 다른 칩과 같은 켜진 색. 누르면 `handleShowPast(!showPast)`.
  - 목업의 켜진 점 색은 `#fff`인데, 어두운 화면에서는 켜진 칩의 바탕이 밝아 점이 보이지 않는다. `--de-bg`로 쓴다.

- [ ] **Step 1: `FilterBar.tsx`와 스타일을 만든다.**

- [ ] **Step 2: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/timeline/FilterBar.tsx && pnpm build`
Expected: 오류 없음

Run: `grep -n "JobGroupTag\|BasicDropdown\|SearchEvent\|innerWidth\|handleModalState" components/events/timeline/FilterBar.tsx`
Expected: 결과 없음

관리자가 화면에서 볼 것(작업 10·11 뒤. 비교: `app.html?banner=none#main`):
  1. 1280px: 검색칸(260px)과 칩이 한 줄(넘치면 다음 줄). 칩 높이 36px, 켜진 칩은 검정 바탕.
  2. `/events`에서 "AI" 칩 → 주소가 `/search?tag=AI`. 이어서 "클라우드" → `/search?tag=AI&tag=클라우드`. "AI"를 다시 → `/search?tag=클라우드`. "전체" → `/events`.
  3. `/search?kwd=AI`에서 "무료" → `/search?kwd=AI&coast=무료`. "무료"를 다시 → `/search?kwd=AI`. 이 상태에서 "전체"를 눌러도 주소가 바뀌지 않는다.
  4. 행사 유형에서 "대회" → `type=대회`가 붙고 칩이 켜진 색. "행사 유형"(첫 줄)을 고르면 빠진다.
  5. 검색칸에 `카카오 테크`를 넣고 Enter → `/search?kwd=카카오%20테크`. 칸을 비우고 Enter → 검색어가 빠진다. 한글을 조합하는 중에 Enter를 눌러도 두 번 검색되지 않는다.
  6. 390px: 칩이 한 줄로 옆으로 넘어가고 오른쪽 끝이 흐리다. 검색 아이콘을 누르면 검색칸이 펼쳐지고 바로 입력할 수 있다. 600px: 칩이 여러 줄로 내려가고 구분선이 없다.
  7. 어두운 화면에서 "새로 올라온 행사"를 켰을 때 점이 보인다.

---

### Task 10: 조립 · `/events` 바꾸기

목업 기준: `app.js:327-360`의 `mainShell`·`go`·`jumpMonth`·`spy`, `:538-541`의 칩 동작.

**Files:**
- Create: `components/events/timeline/EventTimeline.tsx`, `EventTimeline.module.scss`
- Modify: `pages/events.tsx:6`(import), `:40-43`(`ListProps`), `:60-69`(훅 호출), `:114-132`(본문), `:180-189`(`getServerSideProps`)
- Modify: `styles/Home.module.scss:5-10`, `styles/globals.scss:9-24`

**Interfaces:**
- Consumes: Task 1~9의 모든 것. `LoginModal`(`isOpen`, `onClose`), `EventNull`(`events: Event[]`)
- Produces:

```ts
function EventTimeline(props: {
  events: EventResponse[] | undefined;   // /front/v2/events/current 의 응답
  isError: boolean;
  now: string;                            // 서버가 그린 시각 (한국 시간, 'YYYY-MM-DDTHH:mm')
  mode: 'events' | 'search';
}): JSX.Element;
```

- Produces (`pages/events.tsx`): 목록 보기의 props에 `now: string` 추가. `getServerSideProps`가 `toKstNaive(Date.now())`로 채운다.

**값 만들기** (그릴 때마다 계산. `useMemo`로 묶는다)

1. `now = useNow(props.now)`, `todayKey = now.slice(0, 10)`.
2. `current = flattenEvents(events)`.
3. `filters = mode === 'search' ? readFilters(router.asPath) : EMPTY_FILTERS`.
4. **다른 달 보기:** `mode === 'events'`이고 `readMonthParam(router.query)`가 값을 주고 그 달이 `monthTotals(events)`에 **없을 때**만 `month`로 삼는다. 응답에 있는 달이면 `month`는 `null`(보통 보기).
5. `monthly = useMonthlyEvent({ param: month })` — `month`가 `null`이면 요청이 나가지 않는다. `fallbackData`를 넘기지 않는다.
6. `view = buildTimelineView({ events: month ? monthly.monthlyEvent ?? [] : current, current, filters, newOnly, showPast, month, now })` (`newOnly`·`showPast`는 `EventContext`).
7. `activeKey`(상태. 처음 값 `todayKey`. 다른 달 보기에서는 그 달의 첫 묶음 키).
8. 제목의 연·월: `month`가 있으면 그것, 없으면 `activeKey`의 연·월.
9. `yearRange`: `{ min: 올해 − 1, max: 올해와 응답의 가장 늦은 달의 해 가운데 큰 쪽 }`. 아래쪽은 지금 `DateBoard`가 고를 수 있던 범위(작년 1월부터)와 같다.

**구성** (위에서 아래로)

```
<div class="timeline" style="--de-navh: {띠의 높이}px">     ← de-container
  <DateNav … />
  <FilterBar … />
  [검색 제목 줄]                 ← 작업 11
  목록 자리 (aria-live="polite")
  <LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
</div>
```

**부품에 넘기는 값**

- `DateNav`: `days={view.days}`, `activeKey`, `title`(8번), `monthTotals={monthTotals(events)}`, `thisMonthKey={todayKey.slice(0, 7)}`, `yearRange`(9번), `lockUnknownMonths={mode === 'search'}`, `view="list"`, `searchOpen`, 그리고 아래 "동작"의 함수들. `onHeightChange`로 받은 높이를 상태에 두고 바깥의 `--de-navh`에 넣는다.
- `FilterBar`: `filters`, `searchOpen`, `newCount={view.newCount}`, `pastCount={view.pastCount}`, `hidePastChip={Boolean(month)}`.

**목록 자리에 무엇을 그리나** (위에서부터 먼저 맞는 것)

| 조건 | 그리는 것 |
|---|---|
| `isError`, 또는 다른 달 보기에서 `monthly.isError` | `TimelineEmpty` 제목 `이벤트 정보를 불러오는데 문제가 발생했습니다!` (지금 문구 그대로. `ItemList.tsx:95`) |
| 다른 달 보기이고 불러오는 중 | `TimelineSkeleton` |
| 다른 달 보기이고 그릴 묶음이 없음 | `TimelineEmpty` 제목 `{M}월에는 조건에 맞는 행사가 없어요`, 설명 `다른 달을 고르거나 오늘로 돌아가 보세요.`, 버튼 `오늘로 돌아가기`(→ "오늘" 버튼과 같은 동작) |
| 그릴 묶음이 없고 `newOnly`가 켜져 있음 | `TimelineEmpty` 제목 `조건에 맞는 행사가 없어요`, 설명 `검색어나 필터를 바꿔 보세요.`, 버튼 `필터 초기화`(→ `handleNewOnly(false)`. `mode === 'search'`이면 `router.push('/events')`도 함께) |
| 그릴 묶음이 없음 | `<EventNull events={current} />` (지금과 같음: `ItemList.tsx:148-152`. 지금은 `events`가 없을 때 두 번 그려지는데 한 번만 그린다) |
| 그 밖 | `<TimelineList groups={view.visible} todayKey … endnote={mode === 'events' && !month} />` |

"그릴 묶음이 없음"은 `view.visible.length === 0`이다. 결과가 지난 날짜에만 있을 때도 여기에 든다(목업은 이때 빈 화면이 된다. Review Focus 4). 이때도 "지난 행사 N건 보기" 칩은 필터 줄에 남아 있다.

**동작**

- **날짜로 이동** `go(key)` (날짜 칸, 오늘 버튼, 월 선택이 함께 쓴다):
  1. `target = findTargetKey(view.groups, key)`. 없으면 끝.
  2. `target`이 오늘보다 앞이고 `showPast`가 꺼져 있으면 `handleShowPast(true)`를 먼저 한다(그 묶음이 그려진 다음 프레임에 이동).
  3. `activeKey = target`.
  4. 이동할 자리: `document.getElementById(dayElementId(target))`의 위쪽 − 띠의 높이 − 4px.
  5. 가려는 묶음이 아직 그려지지 않았으면(지난 행사를 막 펼쳤을 때, 다른 달 보기에서 막 돌아왔을 때) 가려는 키를 `ref`에 적어 두고, 묶음이 그려진 뒤의 `useEffect`에서 이동한다.
  6. **이동하는 동안 스크롤 연동을 잠근다**(Review Focus 5). 거리가 1600px을 넘으면 바로 이동(`behavior: 'auto'`)하고 150ms 뒤에 풀고, 아니면 부드럽게 이동하고 1000ms 뒤에 푼다. `scrollend` 이벤트가 오면 바로 푼다. 움직임 줄이기 설정이면 늘 바로 이동.
- **스크롤 연동**: `window`의 `scroll`(passive) → `requestAnimationFrame`으로 한 프레임에 한 번. 화면 위에서 "띠의 높이 + 24px" 지점을 지난 마지막 날짜 묶음(`[data-key]`)의 키를 `activeKey`로 한다. 아직 하나도 지나지 않았으면 첫 묶음의 키. 잠겨 있거나 월 선택이 열려 있으면 건너뛴다. 언마운트 때 리스너를 푼다.
- **오늘 버튼**: 다른 달 보기면 `router.push('/events', undefined, { shallow: true, scroll: false })`로 돌아온 뒤 `go(todayKey)`. 아니면 `go(todayKey)`.
- **월 선택에서 달을 고름** `onPickMonth({ year, month })`:
  - 그 달이 `monthTotals(events)`에 있으면: (다른 달 보기였다면 위처럼 `/events`로 돌아오고) 이번 달이면 `go(todayKey)`, 아니면 `go('<그 달>-01')`.
  - 없으면(지난 달 등): `router.push({ pathname: '/events', query: { year, month } }, undefined, { shallow: true, scroll: false })` 뒤에 화면을 타임라인의 맨 위(띠가 붙는 자리)로 옮긴다. **`/calender`를 거치지 않는다.**
  - `mode === 'search'`에서는 `DateNav`에 `lockUnknownMonths`를 넘겨 응답에 없는 달을 누를 수 없게 한다(검색은 지금 목록에서만 한다).
- **"지난 행사" 칩을 켜고 끌 때**(`showPast`가 바뀐 뒤): 화면을 목록의 위쪽 − 띠의 높이 − 4px로 옮긴다. 처음 그릴 때와, `go`가 `showPast`를 켠 경우(가려는 날짜가 따로 있다)에는 하지 않는다.
- **"새로 올라온 행사"를 켰을 때**(`newOnly`가 참으로 바뀐 뒤): 목록의 위쪽 − 띠의 높이 − 70px로 부드럽게 옮긴다. 처음 그릴 때(다른 화면에서 켠 채로 들어왔을 때)는 하지 않는다.
- 모바일 검색칸 열림(`searchOpen`)은 `EventTimeline`의 상태다. 처음 값은 `Boolean(filters.kwd)`.
- 관심: `useFavorite()`의 `isFavorite`·`toggleFavorite`를 `TimelineList`에 넘기고, `LoginModal`을 하나 그린다.

- [ ] **Step 1: `EventTimeline`과 스타일을 만든다.** 바깥은 `de-container`. `overflow`를 걸지 않는다(걸면 띠가 붙지 않고 월 선택이 잘린다). 이 시점에는 아직 어느 페이지도 이 부품을 쓰지 않는다.

**`pages/events.tsx`**

- [ ] **Step 2: `getServerSideProps`의 목록 분기(`:180-189`)에 `now: toKstNaive(Date.now())`를 더한다.** `ListProps`(`:40-43`)에 `now: string`. 캘린더 분기는 건드리지 않는다. `Cache-Control`도 그대로.
- [ ] **Step 3: 훅 호출(`:60-69`)을 고친다.** `useMonthlyEvent`에는 캘린더 보기일 때만 `param`을 넘기고 목록 보기에서는 `param: null`을 넘긴다(지금의 1970년 1월 더미 키를 없앤다). `fallbackData`는 캘린더 보기일 때만.
- [ ] **Step 4: 본문(`:114-132`)을 고친다.** `modalState.currentModal === 0` 게이팅과 `<Banner />`는 그대로 두고, 목록 보기일 때는 `<section className={cn('section')}>` 밖에서 `<EventTimeline events={listSWR.scheduledEvents} isError={Boolean(listSWR.isError)} now={props.now} mode="events" />`를 그린다(`.section`은 옛 폭 1104px과 옛 여백을 쓴다). 캘린더 보기는 지금처럼 `.section` 안의 `<CalendarView />`.
  - `ScheduledEventList` import(`:6`)를 지운다. 파일은 남긴다.
  - 모달 셋(`FilterSearchModal`, `FilterTagModal`, `FilterDateModal`)의 렌더(`:133-140`)와 `body` 스타일을 만지는 `useEffect`(`:71-83`)는 **그대로 둔다.** 새 화면에는 이 모달을 여는 곳이 없지만, 지우는 것은 9단계다.

**화면 위에 붙게 하기** (Review Focus 1)

- [ ] **Step 5: `styles/Home.module.scss`의 `.main`에서 `overflow-y: scroll`을 지운다.** 스크롤 영역이 하나 더 생겨 `sticky`가 그 안에 갇힌다.
- [ ] **Step 6: `styles/globals.scss`의 `html, body` 블록에서 `overflow-x: hidden`을 빼고, 블록 아래에 따로 적는다.**

```scss
// html의 값은 뷰포트로 넘어간다. body까지 hidden이면 body가 스크롤 영역이 되어
// position: sticky(날짜 띠)가 화면에 붙지 않는다. clip은 넘치는 것만 자르고 스크롤 영역을 만들지 않는다.
html {
  overflow-x: hidden;
}
body {
  overflow-x: hidden; // clip을 모르는 브라우저용
  overflow-x: clip;
}
```

- [ ] **Step 7: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint pages/events.tsx components/events/timeline && pnpm build`
Expected: 모두 통과

Run: `grep -n "1970\|ScheduledEventList\|calender" pages/events.tsx components/events/timeline/*.tsx`
Expected: 결과 없음

Run: `grep -rn "new Date(\|dayjs" components/events/timeline lib/utils/timeline lib/hooks/useNow.ts`
Expected: `Date.now()`와 `Date.UTC(…)` 말고는 없다(`new Date(벽시계 ms)`를 `getUTC*`로 읽는 것은 `kst.ts` 안에서만)

관리자가 화면에서 볼 것(`/events`. 비교: `app.html#main`, `app.html?past=1&banner=none#main`, `app.html?only=new&banner=none#main`, `app.html?theme=dark#main`. 1280×900과 390×844, 밝게·어둡게):
  1. **화면을 내리면 날짜 띠가 화면 맨 위에 붙어 따라온다.** 새로 고친 직후에도 붙는다(Review Focus 1). `/about`, 상세 화면, `/myevent`를 390px로 열어 가로 스크롤이 생기지 않는지 본다.
  2. 스크롤하면 띠의 선택 표시가 보고 있는 날짜를 따라가고, 보이는 2주 밖으로 나가면 띠가 저절로 넘어간다. 12월 묶음에 들어서면 제목이 "2026년 12월"이 된다(Review Focus 5).
  3. 띠에서 날짜를 누르면 그 날짜 묶음이 띠 바로 아래에 온다. **이동하는 동안 선택 표시가 중간 날짜들로 깜빡이지 않는다**(Review Focus 5). 아주 먼 날짜(한 달 뒤)는 바로 이동한다.
  4. "오늘"을 누르면 어디서든 오늘(없으면 그 뒤 첫 날)로 온다.
  5. "지난 행사 N건 보기" → 끝난 행사가 흐리게 펼쳐지고, 띠를 왼쪽으로 넘기면 지난 날짜가 나온다. 칩이 "지난 행사 숨기기"로 바뀐다. 다시 누르면 접힌다.
  6. "새로 올라온 행사 N" → NEW가 붙은 카드만 남고, 띠에서도 새 행사가 있는 날만 진하다. N이 NEW 카드 수와 같다.
  7. 월 선택에서 다음 달(응답에 있는 달) → 그 달의 첫 묶음으로 스크롤. 지난 달 → 주소가 `/events?year=2026&month=10`이 되고 뼈대가 잠깐 보인 뒤 그 달의 행사가 흐리게 나온다. 네트워크 탭에 `/front/v2/events/2026/10` 요청이 한 번 나간다. `/calender` 요청은 없다. "오늘"로 돌아오면 주소가 `/events`.
  8. `/events`를 처음 열 때 네트워크 탭에 `/front/v2/events/1970/1`이나 다른 월별 요청이 없다.
  9. 콘솔에 하이드레이션 경고가 없다. 컴퓨터의 시계를 23:59로 맞추고 화면을 열어 둔 채 1~2분 기다리면 띠의 "오늘"이 다음 날로 옮겨 간다(Review Focus 2).
  10. 카드의 북마크·공유(작업 4·6의 확인 항목).
  11. 새 행사가 하나도 없는 데이터(`redesign-mock-api`의 스냅샷은 지금 날짜로 보면 모두 끝난 행사다)에서 "새로 올라온 행사 0"을 켜면 "조건에 맞는 행사가 없어요"와 "필터 초기화"가 나오고, 누르면 칩이 꺼진다. 이때 날짜 띠의 칸이 모두 옅고 눌리지 않아도 띠의 모양과 좌우 넘기기는 그대로다(Review Focus 4).
  12. `/search?kwd=AI`는 아직 옛 모양이지만 열리고 동작한다. `/events`에서 칩을 눌러 `/search`로 갔다가 "전체"로 돌아올 수 있다.

---

### Task 11: `/search` 바꾸기 · 결과 없음 화면

목업 기준: `extra.js:111-125`의 `shead`·`sempty`·`sr1`, `extra.css:142-150`(`.sr-head`, `.sr-empty`, `.sr-tags`), `:300`(860px 이하), `mypage.css:31`의 `.my-empty__ic`. 목업 주소 `app.html?nobn=1#search`, `app.html?none=1&nobn=1#search`.

**Files:**
- Modify: `pages/search.tsx:6`(import), `:24-26`(Props), `:82-89`(본문), `:108-116`(`getServerSideProps`)
- Modify: `components/events/timeline/EventTimeline.tsx`, `EventTimeline.module.scss` (검색 제목 줄)
- Modify: `components/common/modal/EventNull.tsx`, `EventNull.module.scss`

**Interfaces:**
- Consumes: `EventTimeline`(Task 10)의 `mode="search"`, `view.visibleCount`, `filters.kwd`
- Produces: `pages/search.tsx`의 props에 `now: string`. `EventNull`의 props(`events: Event[]`)는 그대로.

**검색 화면의 구성** — 행사 일정 화면과 같은 틀에 필터만 걸린 모습이다: 배너(그대로) → 날짜 띠 → 필터 줄 → (검색어가 있으면) 제목 줄 → 타임라인. 목업의 `#search` 화면은 제목 줄과 타임라인만 그렸지만, 지금 검색 화면에는 필터가 있고 필터를 바꾸거나 푸는 곳이 필터 줄뿐이라 함께 둔다(문서 끝 "확인이 필요한 것" 1).

**검색 제목 줄** (`mode === 'search'`이고 `filters.kwd`가 있을 때만. 지금의 `ItemList.tsx:104-107`을 대신한다)

- `<h2>` 안에 `<em>‘{검색어}’</em> 검색 결과<i>{view.visibleCount}</i>`. 배너에 `h1`이 있어 `h2`로 둔다. 검색어는 React가 글자로 넣는다(HTML로 넣지 않는다).
- 줄: `margin-top: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--de-line);` 860px 이하 `margin-top: 20px; padding-bottom: 16px;`
- 제목: `margin: 0; font-size: 28px; line-height: 1.25; font-weight: 800; letter-spacing: -0.025em;` 860px 이하 23px. 검색어 `font-style: normal; color: var(--de-blue);`. 숫자 `margin-left: 10px; font-style: normal; font-size: 15px; font-weight: 700; color: var(--de-hint);`
- 목업은 이 줄 오른쪽에 검색칸이 있다. 검색칸은 필터 줄에 이미 있으므로 넣지 않는다.
- 검색어 없이 필터만 걸린 주소(`/search?tag=AI`)에는 제목 줄이 없다(지금도 없다).

**결과 없음 (`EventNull`)** — 동작은 그대로, 모양과 문구만 목업으로.

- 조건·추천 태그 고르기(`getRecommendableTags`, 마운트 뒤 `getRandomTag`로 3개)는 그대로 둔다.
- 마크업: 바깥 `role="status"`, `padding: 72px 0 64px; text-align: center;`
  - 아이콘 칸: `display: grid; place-items: center; width: 76px; height: 76px; margin: 0 auto 18px; border-radius: 24px; background: var(--de-surface); color: var(--de-faint);` 안에 `TimelineIcon`의 `search` 32px. 지금의 `/icon/none_event.svg`는 쓰지 않는다.
  - 제목 `<b>`: `찾으시는 행사 정보가 없어요` — 19px / 800
  - 설명 `<p>`(추천할 태그가 있을 때만): `추천 태그로 검색해 보세요` — `margin: 8px 0 16px; font-size: 14.5px; color: var(--de-hint);`
  - 태그 묶음: `display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;` 태그는 `<button type="button">`에 `de-chip`·`de-press`. 글자는 태그 이름만(지금의 `#`은 붙이지 않는다).
- 태그를 누르면 지금 `JobGroupTag`(`parent={false}`)가 하던 것과 같이 **필터는 그대로 두고 검색어만 바꾼다**: `router.push(parseUrl(router.asPath, 'kwd', 태그 이름, jobGroupList), undefined, { scroll: false })`. `JobGroupTag`는 쓰지 않는다. `handleSearch` 등 context는 `FilterBar`의 맞추기가 처리한다.
- 옛 색 변수와 옛 믹스인을 쓰던 `EventNull.module.scss`의 내용은 새 값으로 바꾼다.

- [ ] **Step 1: `pages/search.tsx`를 고친다.**
  - `getServerSideProps`(`:108-116`)에 `now: toKstNaive(Date.now())`, `Props`(`:24-26`)에 `now: string`.
  - 본문(`:82-89`): 게이팅과 `<Banner />`는 그대로, `<section className={cn('section')}>`과 `<FilteredEventList />` 대신 `<EventTimeline events={scheduledEvents} isError={Boolean(isError)} now={now} mode="search" />`.
  - `FilteredEventList` import(`:6`)를 지운다. 파일은 남긴다. 모달 셋의 렌더와 `useEffect`, `<Head>`(제목·`noindex`·canonical)는 그대로 둔다.

- [ ] **Step 2: `EventTimeline`에 검색 제목 줄을 넣는다.** 필터 줄과 목록 자리 사이.

- [ ] **Step 3: `EventNull.tsx`와 스타일을 위 내용으로 바꾼다.**

- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint pages/search.tsx components/events/timeline/EventTimeline.tsx components/common/modal/EventNull.tsx && pnpm build`
Expected: 모두 통과

Run: `grep -rn "FilteredEventList\|ScheduledEventList\|features/filters/EventFilter" pages components --include='*.tsx' | grep -v "^components/events/\(Filtered\|Scheduled\|Monthly\)EventList.tsx"`
Expected: 결과 없음

관리자가 화면에서 볼 것(비교: `app.html?nobn=1#search`, `app.html?none=1&nobn=1#search`. 1280px과 390px, 밝게·어둡게):
  1. `/search?kwd=AI`: 제목 "‘AI’ 검색 결과 N"(N은 보이는 카드 수), 그 아래 날짜별 카드. 날짜 띠의 건수가 검색 결과만 센 값이다.
  2. `/search?tag=AI`: 제목 줄이 없고 "AI" 칩이 켜져 있다. **페이지 소스(서버가 보낸 HTML)에도 걸러진 결과만 들어 있다**(지금은 전체 목록이 먼저 그려졌다가 걸러진다).
  3. `/search?kwd=zzzz`: 돋보기 칸, "찾으시는 행사 정보가 없어요", 추천 태그 세 개. 태그를 누르면 그 말로 검색된다(Review Focus 4).
  4. 지난 날짜에만 결과가 있는 검색어(끝난 행사의 제목 일부): 결과 없음 화면이 나오고 필터 줄에 "지난 행사 N건 보기"가 있다. 누르면 끝난 행사가 흐리게 나온다(Review Focus 4).
  5. `/search?kwd=AI`에서 "새로 올라온 행사"를 켜서 0건이 되면 "조건에 맞는 행사가 없어요"와 "필터 초기화"가 나오고, 누르면 `/events`로 간다.
  6. 검색 화면의 월 선택에서 지난 달은 눌리지 않는다.
  7. 뒤로 가기로 `/search` ↔ `/events`를 오가도 칩의 켜짐이 주소와 맞는다.

---

### Task 12: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인**

Run:
```bash
npx tsc --noEmit
pnpm test
npx eslint pages/events.tsx pages/search.tsx context/event.tsx lib/hooks lib/utils/timeline components/events/timeline components/events/calendar/ViewToggle.tsx components/common/modal/EventNull.tsx
pnpm build
```
Expected: 모두 통과. 테스트는 이 단계에서 66개가 늘어난다(kst 5, describeEvent 16, groupByDay 11, dateStrip 13, filters 9, buildView 8, cover 4).

Run: `TZ=UTC pnpm test -- lib/utils/timeline`
Expected: 통과(서버와 같은 시간대에서도 같은 결과)

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지**

Run: `grep -rnE "var\(--(primary|gray-|vapor-|ktb-)|@include (mobile|tablet|laptop)\b|#[0-9a-fA-F]{3,6}\b" components/events/timeline components/events/calendar/ViewToggle.module.scss components/common/modal/EventNull.module.scss`
Expected: `EventThumb.module.scss`의 자동 표지 10색과 `#fff`, `EventCard.module.scss`의 NEW 글자 `#fff`, `FilterBar.module.scss`의 `mask-image`에 쓴 `#000`만 나온다.

Run: `grep -rn "rem\b" components/events/timeline --include='*.scss'`
Expected: 결과 없음(크기는 px)

Run: `git status --short | grep "^ D\|^D "`
Expected: 결과 없음(지운 파일이 없다)

- [ ] **Step 3: 설명 페이지의 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

| 설명 페이지 | 요구 | 맡은 작업 |
|---|---|---|
| `main` | 썸네일 왼쪽 320px·16:9, 모바일은 위에 폭 전체 | 6 |
| `main` | 맨 윗줄에 "접수 마감 17:00" / "행사 19:00 ~ 20:30" | 1, 6 |
| `main` | 제목 20px, 주최, 회색 태그 | 6 |
| `main` | 관심·공유는 오른쪽 위에 옅게, 해요체 안내 | 4, 6 |
| `main` | 스크롤하면 띠의 선택이 따라가고 달이 넘어가면 제목의 월이 바뀜 | 10 |
| `date` | 오늘부터 시작, 14일 / 10일 / 7일 | 2, 8 |
| `date` | 날짜별 건수, 행사 없는 날은 옅고 눌리지 않음, 1일에 "12월" | 2, 8 |
| `date` | 끌어서 넘기기, 양끝 화살표로 일주일씩 | 8 |
| `date` | "2026년 11월"을 누르면 월 선택(달마다 건수) | 2, 8, 10 |
| `date` | 오늘 버튼 | 8, 10 |
| `date` | 띠가 화면 위에 붙음 | 8, 10 |
| `date` | 지난 행사는 칩을 눌렀을 때만, 그때 띠도 지난 날짜까지 | 3, 9, 10 |
| `date` | 일요일 빨강, 토요일 파랑 | 7, 8 |
| `date` | 다른 달은 월별 조회로 | 4, 10 |
| `thumb` | 썸네일이 없으면 유형별 색의 자동 표지 | 5 |
| `thumb` | 흰 포스터를 위한 옅은 테두리 | 5 |
| `new` | 제목 앞 파란 NEW, 등록 후 3일 | 1, 6 |
| `new` | "새로 올라온 행사 N" 칩 | 3, 9 |
| `state` | 끝난 행사는 흐리고 "접수 종료 / 행사 종료" | 1, 6 |
| `state` | 결과 없음 안내와 필터 초기화 | 7, 10 |
| `state` | 새 행사만 볼 때 띠도 새 행사가 있는 날만 진함 | 3 |
| `state` | 불러오는 중 뼈대 | 7, 10 |
| `state` | 어두운 화면 | 5~9(모두 `--de-*`) |
| `search` | 같은 타임라인, 결과 제목, 결과 없음과 추천 태그 | 11 |
| `impl` | 필터·검색의 상태는 그대로, 배치만 | 3, 9 |

  `thumb`의 "상세에서는 눌러서 크게"는 6단계, `main`의 배너는 4단계, `date`의 "캘린더 보기에서는 지난 날짜도 바로"는 5단계다.

- [ ] **Step 4: 관리자가 화면에서 볼 것을 한 번에 모은다.** 작업 4~11의 "관리자가 화면에서 볼 것"과 Review Focus 다섯 가지를 한 목록으로 묶어 보고한다. 프로덕션 빌드(`pnpm build` 뒤 `pnpm start`)로, 1280×900과 390×844, 밝게·어둡게. 데이터는 `redesign-mock-api`(목업의 2026-11-13 스냅샷)를 쓰면 목업과 같은 행사로 비교할 수 있다. 다만 "오늘"은 실제 날짜라, 스냅샷의 행사는 모두 지난 행사로 보인다. 목업과 날짜까지 맞춰 보려면 `EventTimeline`에 넘기는 `now`를 잠깐 `'2026-11-13T10:00'`으로 고정하고(그리고 `useNow`가 덮어쓰지 않게) 본 뒤 되돌린다.

**이 단계가 끝난 뒤의 모습:** `/events`와 `/search`의 목록은 새 모양이고, 그 위의 배너는 옛 모양(4단계), 캘린더 보기의 달력도 옛 모양(5단계)입니다. 관심 행사 화면은 옛 카드(`Item`)를 그대로 씁니다(8단계).

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어지거나, 열 길이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

**쓰는 곳이 없어진 파일**
- `components/events/ScheduledEventList.tsx`, `FilteredEventList.tsx` (이미 안 쓰던 `MonthlyEventList.tsx`, `ShareModal.*`과 함께)
- `components/features/filters/EventFilter.tsx`, `EventFilter.module.scss`
- `components/common/tag/JobGroupTag.*` (남은 사용처는 아래 모달 안의 `FilterByJobGroup`뿐)

**페이지에 렌더는 남아 있지만 여는 곳이 없어진 모달과, 그 안에서만 쓰는 것**
- `components/common/modal/FilterSearchModal.*`, `FilterTagModal.*`, `FilterDateModal.*`
- `pages/events.tsx`·`pages/search.tsx`의 모달 렌더, `isModalOpen` 호출, `body` 스타일을 만지는 `useEffect`, `bodyRef`, 쓰이지 않는 `loginModalIsOpen`과 `<LoginModal />`(새 목록이 자기 것을 그린다)
- `components/features/filters/searchEvent/*`, `ByJobGroup/*`, `ByEventType/*`, `ByLocation/*`, `ByCoast/*`
- `components/common/dropdown/BasicDropdown.*`, `components/common/input/BasicInput.*`
- `components/common/date/DateBoard.*`, `DateElement.*`
- `components/common/item/ItemList.*`, `List.*`
- `lib/utils/dateUtil.tsx`의 `getDateList`·`getStartDate`·`getEndDate`·`getCurrentDate`·`getMonth`·`removeDupDate`, `lib/utils/eventUtil.tsx`의 `isActive`·`getEventByDate`·`checkDate`, `EventContext`의 `date`·`handleDate`·`url`·`handleUrl`·`updateJobGroupList`·`deleteJobGroupList`·`initJobGroupList`
- `WindowContext`의 `modalState`·`handleModalState`(다른 화면에서 쓰는지 확인한 뒤), `lib/utils/windowUtil.tsx`
- `styles/globals.scss`·옛 스타일의 `body__no__scroll`

**아직 쓰는 곳이 남아 있어 그 단계에서 정리할 것**
- `components/common/item/Item.*` — 관심 행사 화면(`MyEventScheduledList`, `MyEventDoneList`)이 쓴다. 8단계.
- `components/common/tag/DdayTag.*`, `FilterTag.*` — `Item`과 상세 화면이 쓴다. 6·8단계.
- `components/events/calendar/CalendarView.module.scss:1-26`의 `.viewToggle*` — 5단계에서 그 파일을 다시 쓸 때.
- `styles/Home.module.scss`의 `.section`과 `styles/_common.scss`의 `%section-container` — 캘린더 보기가 쓴다. 5단계.
- `public/icon/none_event.svg`, `public/default/event-thumbnail-light.png` — 다른 곳에서 쓰는지 확인한 뒤.
- `lib/utils/eventUtil.tsx`의 `getEventEndDate`·`checkEventDone`, `lib/utils/dateUtil.tsx`의 `DateUtil.isDone` — `tagUtil.getRecommendableTags`와 관심 행사 화면이 쓴다. 8단계에서 `describeEvent`로 모을 수 있다.

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **시간은 한국 시간 벽시계로 계산한다.** 서버(UTC)와 브라우저가 같은 결과를 내야 하이드레이션이 어긋나지 않고, 테스트가 시간대에 기대지 않는다. 한국 사용자에게는 지금 코드와 같은 결과다.
2. **"끝났다"의 기준.** 끝에 시각이 있으면(`'Y'`) 그 시각, 없으면 그날이 다 지난 뒤. 목업은 날짜만 있는 종료를 그날 0시에 끝난 것으로 보는데(`app.js:51`), 그러면 마지막 날 하루 종일 "종료"로 보인다. `'Y'`가 아닌 값(`'N'`, `null`)은 모두 "시각 없음".
3. **처음에 숨기는 것은 "오늘보다 앞 날짜에 놓인 행사".** 오늘 이미 끝난 행사는 오늘 묶음에 흐리게 남는다(목업과 같음). 지금 코드가 일 단위로 끝난 행사를 숨기는 것(`DateUtil.isDone`)과 같은 결과다.
4. **같은 행사가 두 달 묶음에 들어 있으면 한 번만 그린다.**
5. **새 부품은 새 폴더(`components/events/timeline/`)에 만들고 `Item`·`List`·`ItemList`는 고치지 않는다.** 관심 행사 화면이 `Item`을 쓰고 있어, 그 자리에서 고치면 8단계 전까지 그 화면이 깨진다. 로드맵은 "`ItemList`·`Item`을 바꾼다"고 적었지만 결과는 같다.
6. **`DdayTag`는 고치지 않는다.** 새 카드에는 D-day 뱃지가 없고, 시각 줄의 칩이 "접수형·일시형을 나눠 보여 주는" 역할을 맡는다. `DdayTag`는 상세 화면이 아직 쓰므로 6단계에서 다룬다.
7. **필터 항목은 지금 그대로 둔다.** 직군 칩 9개(여러 개 고름), 참여 방법·비용은 칩 네 개, 행사 유형은 칩 모양의 `<select>`. 목업의 칩은 지금보다 적지만(직군 6개, 유료·행사 유형 없음) 지금 있는 기능을 빼지 않는다. 행사 유형을 칩 10개로 풀면 줄이 넘쳐 `<select>`로 두었다(좁은 화면의 옆으로 넘기는 줄 안에서도 잘리지 않는다).
8. **필터는 지금처럼 "하나라도 맞으면 통과"이고, 누르면 `/search`로 간다.** 목업처럼 그 자리에서 걸러지지 않는다. 검색도 Enter를 눌러 `/search?kwd=`로 간다.
9. **모바일에서도 칩과 검색칸을 바로 쓴다(목업).** 지금의 전체 화면 모달 셋(검색 1, 필터 2, 날짜 3)은 여는 곳이 없어진다. 페이지의 게이팅과 모달 파일은 그대로 둔다.
10. **새 부품은 필터를 주소에서 읽어 그리고, context도 함께 맞춘다.** 지금은 서버가 `/search?tag=AI`를 그릴 때 context가 비어 있어 전체 목록을 먼저 보냈다가 브라우저에서 걸러진다. 주소에서 읽으면 서버가 보낸 HTML부터 걸러져 있다. 주소와 context를 둘 다 두는 구조는 바꾸지 않았다.
11. **"새로 올라온 행사"와 "지난 행사 보기"의 켜짐은 `EventContext`에 둔다.** `/events`에서 켜고 필터를 눌러 `/search`로 가도, 상세에 다녀와도 유지된다. 주소에 넣지 않는다(`parseUrl`이 `/events`의 다른 값을 버린다).
12. **다른 달은 `/events?year=&month=`로 간다(주소만 바뀌고 서버를 다시 거치지 않음).** 응답에 들어 있는 달은 그 자리에서 스크롤하고, 없는 달만 월별 조회로 불러온다. 다른 달을 볼 때는 그 달에 놓인 행사만, 끝난 것도 함께 보여 주고, 날짜 띠는 그 달의 1일~말일이다. 이 주소로 바로 들어오면 서버는 뼈대를 그리고 브라우저가 불러온다.
13. **월 선택의 건수**: 응답에 들어 있는 달은 `metadata.total`, 없는 달은 달 이름만(받은 결정). 검색 화면에서는 응답에 없는 달을 누를 수 없게 했다. 넘길 수 있는 해는 작년부터 응답의 마지막 달이 있는 해까지.
14. **빈 화면의 규칙**(작업 10의 표). `/search`의 결과 없음은 지금의 `EventNull`, "새로 올라온 행사" 때문에 비면 목업의 "조건에 맞는 행사가 없어요", 다른 달이 비면 목업 캘린더 보기의 "N월에는 조건에 맞는 행사가 없어요". 결과가 지난 날짜에만 있을 때도 결과 없음을 보여 준다(지금 동작과 같다).
15. **"여기까지가 지금 등록된 행사예요."는 `/events`의 보통 보기에서만.** 검색 결과와 지난 달에는 맞지 않는 말이다.
16. **불러오는 중 뼈대**는 목업에 그림이 없어 카드와 같은 크기의 회색 막대로 정했다. 움직임은 넣지 않았다.
17. **불러오기 오류 문구**는 목업에 없어 지금 문구를 그대로 둔다.
18. **서버가 그린 시각(`now`)을 props로 내려 주고, 화면이 뜬 뒤 실제 시각으로 바꾼다.** HTML이 CDN에 남는 동안에도 서버와 브라우저의 첫 그림이 같아야 한다.
19. **`sticky`를 위해 `globals.scss`의 `overflow-x`와 `Home.module.scss`의 `overflow-y`를 고친다.** 모든 화면에 걸리는 변경이라 작업 10의 확인에 다른 화면을 넣었다.
20. **목업을 고쳐 옮긴 것**: 켜진 "새로 올라온 행사" 칩의 점 색(`#fff` → `--de-bg`), 모바일 월 선택의 연도 화살표(숨김 → 보임), 자동 표지의 윗줄에 참여 방법이 없을 때 남는 가운뎃점.
21. **카드의 태그는 글자(`span`)이고, 받은 순서대로 그린다.** 추천 태그에는 `#`을 붙이지 않는다(목업).
22. **검색 제목은 `h2`, 날짜 제목은 `h3`, 달 구분은 `h2`.** 배너에 `h1`이 있다.
23. **보기 전환의 말은 "타임라인 | 캘린더".** 주소(`view=calendar`)와 타입 이름(`'list'`)은 그대로다.

### 확인이 필요한 것

1. **검색 화면의 구성.** 목업 `#search`는 "‘AI’ 검색 결과 N"과 그 오른쪽 검색칸, 타임라인만 있고 날짜 띠와 필터 칩이 없다. 지금 검색 화면에는 필터가 있어, 계획은 **행사 일정 화면과 같은 틀(날짜 띠·필터 줄)에 제목 줄을 더한 모습**으로 정했다(설명 페이지도 "행사 일정 화면에서 검색했을 때와 같은 모습"이라고 적었다). 목업 화면과 나란히 놓으면 위쪽이 다르게 보인다. 날짜 띠를 검색 화면에서 빼려면 `EventTimeline`에서 `mode === 'search'`일 때 `DateNav`를 그리지 않으면 되지만, 그러면 보기 전환과 모바일 검색 버튼의 자리를 다시 정해야 한다.
2. **검색 제목 옆의 숫자.** 목업에도 지금 코드에도 있어 그대로 두었다. "건수를 요약하는 문구"로 보아 빼려면 `<i>` 하나를 지우면 된다.
3. **모바일 카드의 공유 버튼.** 목업은 860px 이하에서 북마크만 보여 준다. 지금은 모바일 카드에도 공유 버튼이 있다. 목업대로 숨겼다.
4. **모바일의 전체 화면 검색·필터 모달이 사라진다**(정한 것 9). 목업에 그 화면이 없어 그렇게 정했지만, 지금 모바일 사용자가 쓰던 화면이 바뀐다.
5. **필터 줄에 목업에 없는 것을 넣었다**: "유료" 칩, "행사 유형" 고르기, 직군 칩 셋(교육, 모임, 대회/공모전). 지금 기능을 지키려는 것이다. 칩이 목업보다 많아 PC에서 두 줄이 될 수 있다.
6. **운영 응답을 보지 못하고 가정한 것**(바깥 요청을 하지 않았다).
   - `/front/v2/events/current`에 이번 달의 이미 끝난 행사가 들어 있다고 보았다(`ItemList`가 끝난 행사를 걸러 내고 있고, 목업 스냅샷 112건 가운데 44건이 끝난 행사다). 들어 있지 않으면 "지난 행사 N건 보기" 칩이 나타나지 않을 뿐 나머지는 그대로 동작한다.
   - `metadata.total`이 무엇을 센 값인지(그 달 묶음의 행사 수인지, 끝난 것을 포함하는지) 모른다. 월 선택의 "N건"이 날짜 띠의 건수 합과 다를 수 있다.
   - `/front/v2/events/{year}/{month}`가 그 달에 걸친 행사를 모두 주는지. 계획은 받은 것 가운데 "그 달에 놓이는 것"만 그린다.
7. **진행 중인 하루짜리 행사의 문구.** 목업 규칙대로면 오늘 14~18시 행사가 15시에 "진행 중 · 11.13(금)까지"로 보인다(왼쪽 날짜와 같은 날을 다시 적는다). 목업 그대로 두었다. "18:00까지"로 바꾸려면 `describeEvent`의 한 줄과 테스트 하나다.
8. **관심 담기의 실패 판정.** API가 예외를 던질 때만 실패로 본다(상세 화면과 같음). 200으로 답하면서 상태 값이 다른 경우는 지금처럼 성공으로 친다.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 필터·검색 결과가 지난 날짜에만 있으면 빈 화면이 된다(`app.js:233-235`: 안내도 목록도 없다).
- 날짜만 있는 종료를 0시에 끝난 것으로 본다(`app.js:51`). 운영 데이터가 모두 `Y/Y`라 드러나지 않았다.
- 860px 이하에서 월 선택의 연도 화살표가 숨는다(`app.css:278`의 `.arw` 규칙이 함께 걸림).
- 어두운 화면에서 켜진 "새로 올라온 행사" 칩의 점이 보이지 않는다(`app.css:138`).
- 검색이 그 자리에서 걸러지고 단순 포함이라 실제 규칙과 다르다. 필터 칩도 지금 서비스보다 적다.

**지금 코드**
- `html, body { overflow-x: hidden }`과 `.main { overflow-y: scroll }` 때문에 `position: sticky`가 듣지 않는다.
- 서버(UTC)가 `dayjs(문자열)`로 날짜를 읽어, 한국 시간 0~9시에는 서버가 그린 "끝난 행사"가 브라우저와 다르다(`DateUtil.isDone`).
- `/search?tag=…`를 서버가 그릴 때 필터가 적용되지 않는다(context가 비어 있음). 전체 목록이 먼저 보였다가 걸러진다.
- 필터가 "또는"으로 동작한다(직군 AI + 참여 방법 온라인 → AI이거나 온라인인 행사). 그대로 두었다.
- `updateJobGroupList(배열)`은 값이 이미 있을 때 마지막 하나만 더한다(`context/event.tsx:64-70`).
- `initUrl`은 검색어만 걸려 있을 때 "전체"를 누르면 `/events`로 보내 검색어를 버린다(`UrlUtil.tsx:24-25`).
- 행사 유형 목록(`eventType.ts`: 스터디, 웨비나, 컨퍼런스 …)이 운영 태그(세미나 55건, 커뮤니티 2건 등)와 다르다. 직군 칩 "대회/공모전"은 태그 "대회"와 글자 포함으로 우연히 맞는다(`eventUtil.tsx:65`).
- `useScheduledEvents`는 캘린더 보기에서 `fallbackData` 없이 불려 쓰지 않는 목록을 한 번 더 요청한다(`events.tsx:60-62`). 5단계에서 볼 것.
- `ViewToggle`은 캘린더에서 타임라인으로 올 때 `year`·`month`를 버린다. "오갈 때 보던 날짜를 유지"는 5단계의 일이다.
- `List.tsx`의 관심 담기는 실패하면 처리되지 않은 예외로 끝나 북마크가 담긴 모습 그대로 남고, 측정 이벤트는 성공했을 때 나가지 않는다.
