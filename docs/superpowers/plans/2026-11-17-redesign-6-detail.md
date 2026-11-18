# 리디자인 6단계 — 상세 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/event/detail/[eventId]`를 "왼쪽 320px 칸(포스터·신청 카드)을 화면에 붙이고 오른쪽에 712px 본문"으로 바꾸고, 860px 이하에서는 한 칸에 신청 버튼을 화면 아래에 붙인다. 포스터와 본문 그림은 누르면 크게 보이고, 본문 아래에 같은 날 다른 행사를 보여 준다.

**Architecture:** 신청 카드의 상태·남은 시간·진행 막대, 달력 한 장 옆의 문장, 같은 날 다른 행사 고르기는 `lib/utils/detail/`의 순수 함수로 빼고 테스트를 먼저 쓴다(시간은 3단계의 `lib/utils/timeline/kst.ts`·`describeEvent.ts`로 계산). 화면은 `components/events/detail/`에 새 부품(`DetailPoster`, `Lightbox`, `ApplyCard`, `CalendarAdd`, `MobileApplyBar`, `DetailHead`, `DetailBody`, `RelatedEvents`)을 만들고 `EventDetailView` 하나로 조립한다. 지금의 `pages/event/detail/[eventId].tsx`는 마지막 작업(작업 8)에서 `<Head>`·`getServerSideProps`만 남기고 본문을 `EventDetailView`로 바꾼다. 그 전까지 화면은 예전 그대로다. 서버가 그린 시각(`now`)과 같은 날 다른 행사(네 건까지, 본문을 비운 것)를 props로 내려 주고, 화면이 뜬 뒤 `useNow`가 실제 시각으로 바꾼다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / react-modal 3.x(이미 설치됨) / marked 4.x / jest (ts-jest)

**Spec:** `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/index.html`의 `detail`(`:223-239`)·`thumb`(`:296-307`)·`state`(`:570-580`)·`impl`(`:582-595`) 절, 움직이는 목업 `detail-design/app.html`(`app.js:362-398`의 `detail`, `:516-518`·`:550`의 크게 보기, `app.css:212-259`·`:297-304`, `../shared/base.css:40-57`의 `.k-prose`). 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`, 3단계가 만든 것은 `2026-11-17-redesign-3-timeline.md`와 실제 파일(`lib/utils/timeline/`, `lib/hooks/useNow.ts`, `lib/hooks/useFavorite.tsx`, `components/events/timeline/`).

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm start`·`pnpm dev`로 화면을 띄우지 않는다. 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다(작업 9).

## Global Constraints

- **기능·주소·API 경로는 지금 그대로.** 신청 링크(`event_link`, 새 탭), 관심 담기·빼기(`/front/v1/favorite/events`), 캘린더 내보내기(Google은 새 탭, Apple·Outlook은 `.ics` 내려받기. `lib/utils/calendar.ts`의 `openInCalendar`를 **고치지 않고** 불러 쓴다), 공유(상세는 **페이지 주소** `window.location.href`를 복사한다. 카드의 공유는 `event_link`를 복사한다. 둘 다 지금 동작), SEO(`<Head>`, canonical, JSON-LD), `getServerSideProps`의 404 처리와 캐시 헤더(`s-maxage=3600, stale-while-revalidate=86400`, 없는 행사는 `s-maxage=60`).
- 구성은 정해져 있다: 왼쪽 **320px** 칸을 `position: sticky`로 붙이고 간격 48px, 오른쪽 본문(내용 폭 1120px 안에서 712px). 860px 이하는 한 칸이고 신청 버튼이 화면 아래에 붙는다.
- 색은 `--de-*` 변수만. 본문(마크다운)에 쓰는 다섯 색은 이 단계에서 `--de-prose-*`로 추가한다(작업 3). 고정 색 값은 이 계획에 적힌 것만 허용: 신청 버튼의 글자 `#fff`, "크게 보기" 딱지와 크게 보기의 닫기 버튼 `rgba(0, 0, 0, 0.6)`·`#fff`, 크게 보기의 바탕 `rgba(0, 0, 0, 0.86)`, 캘린더 메뉴의 상표 색 셋(`#0E0E14`, `#4285F4`, `#0078D4`)과 그 위 글자 `#fff`.
- 크기는 px. 내용 폭은 `de-container`(1120px, 좌우 20px, 360px 이하 16px). PC·모바일 전환 폭 860px(`de-mobile`) 하나. 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수(`--vapor-*`, `--ktb-*`, `--gray-*`, `--primary`, `--glass-overlay*`)는 새 파일에서 쓰지 않는다.
- SCSS에서 공용 파일은 전체 파일명과 물결표, 변수 먼저: `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`
- **CSS Module은 `pure` 모드다.** 선택자에 그 파일의 클래스가 하나는 들어 있어야 한다. `:global(html…)`만으로 된 규칙은 빌드 오류다. 어두운 화면 전용 규칙이 필요하면 3단계처럼 `:global(html[data-theme='dark']) &`를 클래스 안에 넣는다(이 단계는 색 변수만으로 충분해 쓸 일이 없다).
- import는 프로젝트 루트 기준 절대 경로.
- 브레이크포인트는 CSS 미디어쿼리로만 처리한다. JS에서 `window.innerWidth`를 읽지 않는다. PC용 버튼과 모바일용 버튼은 둘 다 그리고 CSS로 하나를 숨긴다.
- `prefers-reduced-motion: reduce`에서는 이 단계의 transition을 끈다(`de-press`가 이미 처리한다. 새 transition을 넣으면 `de-reduced-motion`으로 끈다).
- 문구는 이 계획에 적힌 그대로(해요체). **건수를 요약하는 문구를 새로 만들지 않는다.** 이 화면에는 건수가 나오는 자리가 없다.
- `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다. `Map`·`Set`을 `[...x]`나 `for…of`로 돌리지 말고 `Array.from`을 쓴다.
- 시간은 **한국 시간 벽시계**로 계산한다. `new Date(문자열)`·`dayjs(문자열)`로 읽지 않는다. `lib/utils/timeline/kst.ts`의 `parseNaive`·`dayKey`·`diffDays`·`formatMdw`·`formatHm`과 `describeEvent`만 쓴다. `'Y'`가 아닌 `use_*_date_time_yn`(`'N'`, `null`)은 "시각 없음"이다.
- **본문 HTML을 만드는 곳은 `lib/utils/renderDescription.ts` 하나, 부르는 곳은 `components/events/detail/DetailBody.tsx` 하나다.** 걸러내기(XSS 방지)는 이 단계에서 구현하지 않는다. 다른 브랜치(`claude/frosty-murdock-4b230c`)가 같은 경로·같은 시그니처로 걸러내는 버전을 갖고 있어, 합칠 때 그쪽 파일로 통째로 바꾸면 된다.
- 3단계 부품은 "추가만" 한다: `TimelineIcon`에 아이콘 넷, `EventThumb`에 선택 props 둘, `cover.ts`에 함수 하나, `describeEvent.ts`는 기간을 읽는 부분을 `period.ts`로 꺼내 부르게만 바꾼다(결과는 같다). 기존 테스트가 그대로 통과해야 한다.
- 헤더·소식 받기·푸터(`Layout`)는 건드리지 않는다. 상세는 본문에서 `<Layout>`을 직접 감싼다(그대로).
- `components/events/calendar/*`와 `pages/events.tsx`는 건드리지 않는다(5단계가 같은 때에 진행 중).
- 파일을 지우지 않는다. 쓰지 않게 된 것은 이 문서 끝의 "9단계에서 지울 것"에 적는다.
- `pnpm lint`는 쓰지 않는다. 확인 명령은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일>`이고, **`pnpm build`는 작업 9에서 한 번만 돌린다**(같은 폴더의 빌드 결과물을 다른 작업이 쓰고 있다). SCSS의 오류(Sass 문법, `pure` 모드 위반)는 `tsc`·`eslint`가 잡지 못하고 빌드에서만 드러나므로, 작업 9의 빌드가 실패하면 그 파일을 만든 작업으로 돌려보낸다. **`pnpm test`는 타입을 보지 않는다**(`isolatedModules`). 테스트 파일의 타입 오류는 `npx tsc --noEmit`에서만 잡힌다.

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **오래된 HTML의 "지금"** — 상세의 HTML은 CDN에 1시간, 길게는 하루 더 남는다. 어제 만든 HTML을 받으면 남은 시간이 하루 전 값이고, 그 사이 끝난 행사에 "신청하러 가기"가 그려져 있다. 화면이 뜬 뒤 실제 시각으로 고쳐지고(끝났으면 "종료된 행사예요"), 하이드레이션 경고가 없어야 한다. 같은 날 다른 행사도 그 사이 끝난 것은 빠진다. (작업 1·2의 계산이 `now`를 인자로 받음, 작업 7의 `aliveRelated`, 작업 8의 `useNow`)
2. **왼쪽 칸이 화면에 붙지 않거나, 붙은 채로 잘린다** — 조상에 `overflow`가 걸리면 `position: sticky`가 듣지 않는다. 창 높이가 낮으면 붙은 칸의 아래쪽(관심·캘린더·공유)이 화면 밖에 걸린 채 따라와 누를 수 없다. 캘린더 메뉴가 칸 밖으로 잘리지 않아야 한다. (작업 5, 작업 8)
3. **모바일 아래 고정 버튼이 가리는 것** — 푸터의 마지막 줄까지 스크롤해 볼 수 있어야 하고, 캘린더 메뉴는 버튼 위로 열려야 하고, 로그인 창·크게 보기·안내(토스트)는 버튼보다 위에 떠야 한다. (작업 5, 작업 8)
4. **본문의 그림·표·긴 글자** — 링크 안의 그림은 링크로 가고 그 밖의 그림만 크게 보인다. PC에서 표는 본문 칸을 다 채우고, 모바일에서 넓은 표·코드는 그 안에서만 옆으로 넘겨지고 화면 전체를 밀지 않는다. 긴 주소가 칸을 넘지 않는다. 그림이나 제목으로 시작하는 본문 위에 빈 자리가 크게 생기지 않는다. (작업 6, 작업 8의 `minmax(0, 1fr)`)
5. **상세에서 상세로 넘어갈 때와 크게 보기** — 같은 날 다른 행사를 누르면 같은 페이지 컴포넌트에 props만 바뀐다. 앞 행사의 크게 보기·"포스터가 깨졌다"는 상태·열린 캘린더 메뉴가 남으면 안 된다. 크게 보기는 Esc·바깥·그림·닫기 버튼으로 닫히고, 닫히면 누른 자리로 포커스가 돌아오고, 열린 동안 뒤 화면이 스크롤되지 않는다. (작업 4, 작업 8의 `key`)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 목업의 "지금"은 2026-11-13(금) 10:00으로 고정되어 있습니다(`app.js:6`).

| 목업 | 주소 | 무엇을 볼 때 |
|---|---|---|
| 접수 중 | `app.html#detail/3489` | 기본 화면. "접수 중 · 유료", "마감까지 6일 8시간", 진행 막대 80%, 같은 날 다른 행사 2건 |
| 마감 임박 | `app.html#detail/3508` | 24시간 안 마감(목업은 "마감까지 7시간 0분", 구현은 "마감까지 7시간") |
| 진행 중인 일시형 | `app.html#detail/3523` | "진행 중 · 무료", "지금 진행 중", 썸네일 없는 자동 표지, 표가 있는 본문, 같은 날 다른 행사 4건 |
| 예정인 일시형 | `app.html#detail/3555` | "예정 · 무료", "D-5", "11월 18일 수요일 19:00 ~ 20:30" |
| 끝난 행사 | `app.html#detail/3470` | "종료 · 유료", "종료된 행사예요", 그림으로 시작하는 본문, "비슷한 행사" |
| 어두운 화면 | `app.html?theme=dark#detail/3489` | 색 |
| 공지 띠 없이 | `app.html?x=1#detail/3489` | 설명 페이지가 쓰는 주소. 위쪽 띠를 빼고 비교할 때 |

`?dw=w400`·`?dw=a`는 결정되지 않은 폭(왼쪽 400px·360px)을 비교하던 옵션이라 쓰지 않습니다.

목업의 변수 `--bg`, `--ink`, `--sub`, `--hint`, `--line`, `--surface`, `--hover`, `--blue`, `--orange` …는 실제 코드에서 `--de-bg`, `--de-ink` …입니다. 목업 `.go`의 어두운 화면 바탕 `#2f5fff`와 밝은 화면 `--blue`는 `--de-blue-fill` 하나로 씁니다. 목업의 `--prose-*`는 작업 3에서 `--de-prose-*`로 추가합니다(`--prose-head`는 `--de-ink`와 값이 같아 따로 만들지 않습니다).

---

## File Structure

**새로 만드는 파일**

- `lib/utils/timeline/period.ts` — 행사의 시작·끝을 벽시계 값으로 읽기(`describeEvent`에서 꺼낸 것)
- `lib/utils/detail/applyCard.ts` — 신청 카드의 상태·남은 시간·진행 막대, 짧은 D-day 문구
- `lib/utils/detail/summary.ts` — 달력 한 장과 한 문장, 참여 방법 블록, 주최의 첫 글자
- `lib/utils/detail/related.ts` — 같은 날 다른 행사 고르기, 본문 비우기
- `lib/utils/renderDescription.ts` — 본문(마크다운)을 HTML로. **본문 HTML을 만드는 유일한 곳**
- `lib/utils/timeline/__tests__/period.test.ts`, `lib/utils/detail/__tests__/applyCard.test.ts`, `summary.test.ts`, `related.test.ts`
- `components/events/detail/` — 부품마다 `Foo.tsx`와 `Foo.module.scss`
  - `Lightbox`, `DetailPoster`
  - `ApplyLink`, `CalendarAdd`, `ApplyCard`, `MobileApplyBar`
  - `DetailHead`, `DetailBody`
  - `RelatedEvents`
  - `EventDetailView`

**고치는 파일**

- `lib/utils/timeline/describeEvent.ts`(기간 읽기를 `period.ts`로), `lib/utils/timeline/cover.ts`(함수 하나 추가), `lib/utils/timeline/__tests__/cover.test.ts`(테스트 하나 추가)
- `components/events/timeline/TimelineIcon.tsx`(아이콘 넷), `components/events/timeline/EventThumb.tsx`(선택 props 둘)
- `styles/Theme.scss`(변수 다섯 개씩), `styles/__tests__/deTokens.test.ts`(변수 목록)
- `pages/event/detail/[eventId].tsx`, `lib/seo/eventMeta.ts`(문구 한 곳)

**고치지 않고 두는 파일** (쓰는 곳이 없어지거나 줄어듦. 문서 끝 "9단계에서 지울 것"): `styles/EventDetail.module.scss`, `components/common/calendar-export/*`, `components/common/tag/DdayTag.*`·`FilterTag.*`, `components/icons/ShareIcon.tsx`·`BookmarkIcon.tsx`

**5단계(캘린더 보기)와 겹칠 수 있는 파일:** `TimelineIcon.tsx`, `styles/Theme.scss`, `styles/__tests__/deTokens.test.ts`, `describeEvent.ts`. 모두 "추가만" 하는 변경이다. 고치기 직전에 파일을 다시 읽고, 이미 있는 이름(아이콘·변수)은 다시 넣지 않는다. 줄 번호는 2026-11-17 기준이라 5단계가 먼저 고쳤으면 밀려 있을 수 있다.

**작업 순서와 같은 파일을 고치는 작업이 겹치지 않는지**

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 기간 읽기, 신청 카드 계산 (순수 함수) | `describeEvent.ts` |
| 2 | 일시 블록, 같은 날 다른 행사, 본문 HTML 한 곳 (순수 함수) | — |
| 3 | 3단계 부품에 추가(아이콘·썸네일), 본문 색 변수 | `TimelineIcon.tsx`, `EventThumb.tsx`, `cover.ts`, `cover.test.ts`, `Theme.scss`, `deTokens.test.ts` |
| 4 | 크게 보기, 포스터 | — |
| 5 | 신청 카드, 캘린더 메뉴, 모바일 아래 고정 버튼 | — |
| 6 | 제목 영역(주최·제목·태그·일시), 본문 | — |
| 7 | 같은 날 다른 행사 | — |
| 8 | 조립, 페이지 바꾸기 | `[eventId].tsx`, `lib/seo/eventMeta.ts` |
| 9 | 전체 확인 | — |

작업 1~7이 끝난 상태에서는 상세 화면이 예전 그대로입니다(새 부품은 아직 어디에도 걸리지 않음). 작업 3의 `EventThumb`·`TimelineIcon` 변경은 선택 값만 더하므로 메인·검색 화면도 그대로입니다. 작업 8 뒤에 상세가 새 모양입니다.

---

### Task 1: 기간 읽기 · 신청 카드 계산 (순수 함수)

목업 기준: `app.js:50-61`의 `enrich`(`state`, `label`, `remain`), `:71`의 `progress`, `:367`의 `status`, `:377-378`의 상태 줄과 진행 막대.

**Files:**
- Create: `lib/utils/timeline/period.ts`, `lib/utils/timeline/__tests__/period.test.ts`
- Create: `lib/utils/detail/applyCard.ts`, `lib/utils/detail/__tests__/applyCard.test.ts`
- Modify: `lib/utils/timeline/describeEvent.ts:38-50`(시작·끝 읽기), `:57-68`(둘 다 읽을 수 없을 때), `:70-74`(벽시계 값) — `readEventPeriod`를 부르게 바꾼다

**Interfaces:**
- Consumes: `Event`·`EventDate`(`model/event.ts`), `parseNaive`·`dayKey`·`keyToMs`·`diffDays`·`formatMdw`·`formatHm`·`DAY_MS`(`lib/utils/timeline/kst.ts`), `describeEvent`(`lib/utils/timeline/describeEvent.ts`)
- Produces (`lib/utils/timeline/period.ts`):

```ts
export interface EventPeriod {
  startAt: number;        // 벽시계 ms. 시각이 없으면 그날 0시
  endAt: number;          // 벽시계 ms. 시각이 없으면 그날의 마지막 순간(다음 날 0시 − 1ms)
  startDay: string;       // 'YYYY-MM-DD'
  endDay: string;
  startHasTime: boolean;  // use_start_date_time_yn === 'Y'
  endHasTime: boolean;
  oneDay: boolean;        // startDay === endDay
  startKnown: boolean;    // start_date_time을 읽을 수 있었는지. false면 끝 날짜로 대신한 것
}
export const readEventPeriod: (event: EventDate) => EventPeriod | null;   // 둘 다 읽을 수 없으면 null
```

- Produces (`lib/utils/detail/applyCard.ts`):

```ts
export type ApplyPhase = 'ended' | 'before' | 'recruiting' | 'upcoming' | 'ongoing' | 'unknown';
export type ApplyTone = 'orange' | 'blue' | 'gray';
export interface ApplyProgress {
  percent: number;      // 0~100 정수
  startLabel: string;   // '10.19(월) 접수 시작'
  endLabel: string;     // '11.19(목) 18:00 마감'
}
export interface ApplyInfo {
  phase: ApplyPhase;
  state: string;        // 카드 왼쪽: '접수 중 · 유료'
  status: string;       // 카드 오른쪽: '마감까지 6일 8시간'
  tone: ApplyTone;      // 오른쪽 글자 색
  progress: ApplyProgress | null;   // 접수형이고 끝나지 않았을 때만
  canApply: boolean;    // false면 버튼이 "종료된 행사예요"
}
export const costOf: (tags: { tag_name: string }[]) => string;      // '무료' | '유료' | ''
export const formatRemain: (ms: number) => string;                  // '6일 8시간'
export const ddayLabel: (event: Event, now: string) => string;      // '마감 D-6' | '오늘 마감' | 'D-6' | '오늘' | '진행 중' | '종료' | ''
export const describeApply: (event: Event, now: string) => ApplyInfo;   // now: 'YYYY-MM-DDTHH:mm' (한국 시간)
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `readEventPeriod`는 `describeEvent.ts:38-50`·`:70-74`의 규칙을 그대로 옮긴 것이다: 한쪽을 읽을 수 없으면 다른 쪽으로 대신하고, 대신한 쪽의 "시각 있음"은 양쪽이 모두 `'Y'`일 때만 인정한다. `describeEvent`의 결과(`TimelineEvent`)는 바꾸지 않는다. 기존 `describeEvent.test.ts` 19개가 그대로 통과해야 한다.
- 끝났는지·접수형인지·예정인지·진행 중인지는 `describeEvent(event, now).status`를 그대로 쓴다(`ended` / `recruiting` / `upcoming` / `ongoing`). 다시 판정하지 않는다.
- `describeApply`:

| `status` | 조건 | `phase` | `state` | `status` 문구 | `tone` | `progress` | `canApply` |
|---|---|---|---|---|---|---|---|
| — | 날짜를 둘 다 읽을 수 없음 | `unknown` | (비용만) | `''` | `blue` | `null` | `true` |
| `ended` | | `ended` | `종료` | `종료된 행사예요` | `gray` | `null` | `false` |
| `recruiting` | `startKnown`이고 `startAt > now` | `before` | `접수 전` | 아래 "마감 문구" | `orange` | 아래 | `true` |
| `recruiting` | 그 밖 | `recruiting` | `접수 중` | 아래 "마감 문구" | `orange` | 아래 | `true` |
| `upcoming` | | `upcoming` | `예정` | 시작일이 오늘이면 `오늘 열려요`, 아니면 `D-N` | `blue` | `null` | `true` |
| `ongoing` | | `ongoing` | `진행 중` | `지금 진행 중` | `blue` | `null` | `true` |

- `state`에는 비용을 붙인다: `costOf(event.tags)`가 있으면 `'<상태> · <비용>'`, 없으면 상태만(목업은 이때 `'접수 중 · '`처럼 점이 남는다).
- **마감 문구**: 마감에 시각이 있으면 `'마감까지 ' + formatRemain(endAt − now)`. 시각이 없으면 날짜로만 센다 — 마감일까지 `N`일 남았으면 `'마감까지 N일'`, 마감일 당일이면 `'오늘 마감'`.
- `formatRemain(ms)`: 24시간 이상이면 `'N일 N시간'`, 1시간 이상이면 `'N시간 N분'`, 그보다 적으면 `'N분'`. 뒤 단위가 0이면 뺀다(`'1일'`, `'7시간'`). 1분보다 적게 남았거나 0 이하면 `'1분'`(빈 문자열을 돌려주지 않는다).
- `progress`: `startKnown`일 때만. `percent = Math.round(clamp((now − startAt) / ((endAt − startAt) || 1), 0, 1) × 100)`. `startLabel = formatMdw(startDay) + ' 접수 시작'`, `endLabel = formatMdw(endDay) + (시각이 있으면 ' HH:mm') + ' 마감'`.
- `ddayLabel`: `ended` → `'종료'`. `recruiting` → 마감일이 오늘(또는 지남)이면 `'오늘 마감'`, 아니면 `'마감 D-N'`. `upcoming` → 시작일이 오늘이면 `'오늘'`, 아니면 `'D-N'`. `ongoing` → `'진행 중'`. 날짜를 읽을 수 없으면 `''`. `N`은 달력 날짜 차이(`diffDays`).
- `costOf`: 태그에 나온 순서로 `'무료'`·`'유료'` 가운데 처음 것.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/timeline/__tests__/period.test.ts`

```ts
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
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `lib/utils/detail/__tests__/applyCard.test.ts`

`end_day_week`가 `'수'`인 것은 `WeekType`이 `'월' | '화' | '수'`뿐이어서다(`model/calender.ts:1`). 이 값은 어디에서도 쓰이지 않는다.

```ts
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
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- period applyCard`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 4: `period.ts`를 만들고 `describeEvent.ts`가 그것을 부르게 바꾼다.** `describeEvent.ts`에서 `startParsed`·`endParsed`·`startHasTime`·`endHasTime`·`startDay`·`endDay`·`startAt`·`endAt`·`oneDay`를 직접 만들던 줄을 `readEventPeriod(event)`의 결과로 바꾸고, `null`이면 지금의 "둘 다 읽을 수 없을 때" 분기(`:57-68`)를 탄다. 나머지(상태, 묶이는 날, 시각 줄, NEW)는 손대지 않는다.

- [ ] **Step 5: `applyCard.ts`를 구현한다.** `dayjs`와 `Date`의 로컬 필드를 쓰지 않는다.

- [ ] **Step 6: 확인**

Run: `pnpm test -- lib/utils/timeline lib/utils/detail && npx tsc --noEmit && npx eslint lib/utils/timeline lib/utils/detail`
Expected: PASS. 새 테스트 25개(period 5, applyCard 20). 3단계의 `describeEvent` 19개를 포함한 `lib/utils/timeline`의 기존 테스트가 모두 그대로 통과. 타입·린트 오류 없음

Run: `TZ=America/Los_Angeles pnpm test -- lib/utils/timeline lib/utils/detail`
Expected: 같은 결과(시간대가 달라도 통과)

Run: `grep -n "new Date(\|dayjs" lib/utils/detail/applyCard.ts lib/utils/timeline/period.ts`
Expected: 결과 없음

관리자가 화면에서 볼 것: 없음(메인 화면의 카드가 예전과 같은지는 작업 9에서 한 번 본다).

---

### Task 2: 일시 블록 · 같은 날 다른 행사 · 본문 HTML 한 곳 (순수 함수)

목업 기준: `app.js:364`(달력에 올릴 날), `:388-389`(달력 한 장과 한 문장, 참여 방법), `:62`의 `range`, `:74`의 `initial`, `:365-366`(같은 날 다른 행사 고르기), `:393`(목록 한 줄의 문구).

**Files:**
- Create: `lib/utils/detail/summary.ts`, `lib/utils/detail/__tests__/summary.test.ts`
- Create: `lib/utils/detail/related.ts`, `lib/utils/detail/__tests__/related.test.ts`
- Create: `lib/utils/renderDescription.ts` (테스트 파일은 만들지 않는다. 아래 "본문 HTML")

**Interfaces:**
- Consumes: `readEventPeriod`·`costOf`·`ddayLabel`(Task 1), `describeEvent`, `DOW`·`weekdayOf`·`formatMdw`·`formatHm`(`kst.ts`), `marked`
- Produces (`lib/utils/detail/summary.ts`):

```ts
export interface WhenBlock {
  month: string;     // 달력 한 장의 윗줄: '11월'
  day: string;       // 달력 한 장의 숫자: '19'
  headline: string;  // '11월 19일 목요일 18:00 접수 마감'
  range: string;     // '접수 기간 10.19(월) 18:00 ~ 11.19(목) 18:00'
}
export interface HowBlock {
  icon: 'pin' | 'globe';
  headline: string;  // '오프라인 진행'
  note: string;      // '장소는 아래 행사 소개에서 확인해 주세요'
}
export const describeWhen: (event: Event, now: string) => WhenBlock | null;      // 날짜를 읽을 수 없으면 null
export const describeHow: (tags: { tag_name: string }[]) => HowBlock | null;     // 참여 방법 태그가 없으면 null
export const organizerInitial: (organizer: string) => string;                    // 'A'. 없으면 '?'
```

- Produces (`lib/utils/detail/related.ts`):

```ts
export const RELATED_MAX = 4;
export const TOPIC_TAGS: readonly string[];   // ['AI', '클라우드', '블록체인', '보안', '기술일반']
export interface RelatedPick {
  title: string;     // '같은 날 다른 행사' | '비슷한 행사'
  events: Event[];   // 본문을 비운 것. 네 건까지
}
export const slimEvent: (event: Event) => Event;   // description만 ''로 바꾼 사본
export const pickRelated: (current: Event, candidates: Event[], now: string) => RelatedPick | null;
export const aliveRelated: (events: Event[], now: string) => Event[];   // 그 사이 끝난 행사를 뺀다
export const relatedMeta: (event: Event, now: string) => string;        // 'GDG Busan · 마감 D-6 · 무료'
```

- Produces (`lib/utils/renderDescription.ts`):

```ts
export const renderDescription: (markdown?: string | null) => string;   // 비었거나 공백뿐이면 ''
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `describeWhen`
  - 달력에 올리는 날: 접수형(`RECRUIT`)은 **마감일**, 일시형은 **시작일**. 접수형 행사는 실제 행사 날짜가 데이터에 없어 마감일과 접수 기간을 보여 준다(목업 그대로).
  - `headline`: `'M월 D일 <요일>요일'` 뒤에, 접수형이면 `(마감에 시각이 있으면 ' HH:mm') + ' 접수 마감'`, 일시형이면 `describeEvent(event, now).slot.time`이 있을 때 `' ' + 그 값`. 그래서 진행 중이거나 끝난 일시형은 문장에 시각이 없고 기간 줄에만 있다(목업과 같다).
  - `range`: 시작은 `formatMdw(startDay) + (시각이 있으면 ' HH:mm')`. 하루짜리면 그 뒤에 `(끝에 시각이 있으면 ' ~ HH:mm')`, 여러 날이면 `' ~ ' + formatMdw(endDay) + (끝에 시각이 있으면 ' HH:mm')`. 접수형은 앞에 `'접수 기간 '`.
- `describeHow`: 태그 가운데 `'온라인'`·`'오프라인'`을 나온 순서대로 `' · '`로 잇고 `' 진행'`을 붙인다. `'오프라인'`이 있으면 `pin`과 장소 안내, 없으면 `globe`와 접속 안내. 둘 다 없으면 `null`(목업은 이때 "방식 미정 진행"과 접속 안내를 그리는데, 온라인인지 모르는 행사에 틀린 안내가 된다).
- `organizerInitial`: 앞의 `[`·`(`·공백을 건너뛴 첫 글자. `Array.from`으로 잘라 이모지가 반쪽이 되지 않게 한다.
- `pickRelated`
  1. 후보에서 자기 자신(`String(id)`로 비교)과 끝난 행사(`describeEvent(…).status === 'ended'`)를 뺀다.
  2. 지금 행사의 `describeEvent(current, now).dateKey`(접수형은 마감일, 예정인 일시형은 시작일, 진행 중은 오늘, 끝난 행사는 끝난 날)와 `dateKey`가 같은 후보를 **받은 순서대로** 네 건 → 제목 `'같은 날 다른 행사'`.
  3. 하나도 없으면, 분야 태그(`TOPIC_TAGS`)가 하나라도 겹치는 후보를 받은 순서대로 네 건 → 제목 `'비슷한 행사'`. 끝난 행사의 상세도 여기에 든다(같은 날에 놓인 예정 행사가 있을 수 없다).
  4. 그래도 없으면 `null`.
  5. 고른 행사는 `slimEvent`로 본문을 비운다. 목업 데이터 112건의 JSON은 280KB이고 본문을 빼면 46KB(한 건에 0.4KB)다. 네 건이면 2KB쯤이다. 타입은 `Event` 그대로라 3단계의 `EventThumb`·`describeEvent`에 바로 넘길 수 있다.
- `relatedMeta`: `[주최, ddayLabel, 비용]`에서 빈 것을 빼고 `' · '`로 잇는다.
- **본문 HTML** (`renderDescription`): 지금 `[eventId].tsx:63-69`의 호출을 그대로 옮긴다 — 문자열이 아니거나 공백뿐이면 `''`, 아니면 `marked(markdown, { breaks: true, gfm: true })`. **옵션을 바꾸거나 걸러내기를 넣지 않는다.** 파일 맨 위에 주석으로 적어 둔다: "걸러내기(XSS 방지)는 `claude/frosty-murdock-4b230c` 브랜치의 같은 경로 파일이 맡는다. 합칠 때 그쪽 파일로 통째로 바꾼다. 시그니처가 같아 부르는 쪽(`components/events/detail/DetailBody.tsx`)은 고칠 것이 없다." 그 브랜치에 `lib/utils/__tests__/renderDescription.test.ts`가 있으므로 여기서는 테스트 파일을 만들지 않는다(같은 이름으로 만들면 합칠 때 부딪친다).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/utils/detail/__tests__/summary.test.ts`

```ts
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
```

- [ ] **Step 2: 실패하는 테스트를 쓴다** — `lib/utils/detail/__tests__/related.test.ts`

```ts
import {
  aliveRelated,
  pickRelated,
  relatedMeta,
  slimEvent,
} from 'lib/utils/detail/related';
import { Event } from 'model/event';

const NOW = '2026-11-13T10:00'; // 금요일. 목업의 고정 시각과 같다

const tags = (...names: string[]) =>
  names.map((tag_name, id) => ({
    id,
    tag_name,
    tag_color: '',
    category: null,
  }));

// 접수형, 11.19(목) 18:00 마감
const ev = (id: string, over: Partial<Event> = {}): Event => ({
  id,
  title: `행사 ${id}`,
  description: '아주 긴 본문',
  organizer: '주최',
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'RECRUIT',
  start_day_week: '월',
  start_date_time: '2026-10-19T18:00',
  end_day_week: '수',
  end_date_time: '2026-11-19T18:00',
  tags: tags('오프라인', '무료', '세미나', 'AI'),
  create_date_time: '2026-10-19T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
  ...over,
});

const ids = (events: Event[] | undefined) => (events || []).map((e) => e.id);

describe('pickRelated — 같은 날 다른 행사', () => {
  it('타임라인에서 같은 날에 놓이는 행사를 응답 순서대로 고른다', () => {
    const current = ev('1');
    const r = pickRelated(
      current,
      [
        ev('2', { end_date_time: '2026-11-20T18:00' }), // 다른 날 마감
        current, // 자기 자신
        ev('3'), // 같은 날 마감
        ev('4', {
          event_time_type: 'DATE', // 같은 날 시작
          start_date_time: '2026-11-19T19:00',
          end_date_time: '2026-11-19T21:00',
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('같은 날 다른 행사');
    expect(ids(r?.events)).toEqual(['3', '4']);
  });

  it('네 건까지만', () => {
    const r = pickRelated(
      ev('1'),
      ['2', '3', '4', '5', '6', '7'].map((id) => ev(id)),
      NOW
    );
    expect(ids(r?.events)).toEqual(['2', '3', '4', '5']);
  });

  it('진행 중인 행사는 오늘에 놓이므로 오늘 마감하는 행사가 같은 날이다 (목업 #detail/3523)', () => {
    const current = ev('3523', {
      event_time_type: 'DATE',
      start_date_time: '2026-11-09T14:00',
      end_date_time: '2026-11-13T15:00',
    });
    const r = pickRelated(
      current,
      [ev('3508', { end_date_time: '2026-11-13T17:00' }), ev('3489')],
      NOW
    );
    expect(r?.title).toBe('같은 날 다른 행사');
    expect(ids(r?.events)).toEqual(['3508']);
  });

  it('id가 숫자로 와도 자기 자신을 뺀다', () => {
    const current = ev('7');
    const same = ev('8');
    const numeric = { ...current, id: 7 as unknown as string };
    expect(ids(pickRelated(current, [numeric, same], NOW)?.events)).toEqual([
      '8',
    ]);
  });

  it('넘기는 행사는 본문을 비운다', () => {
    const r = pickRelated(ev('1'), [ev('2')], NOW);
    expect(r?.events[0].description).toBe('');
    expect(r?.events[0].title).toBe('행사 2');
    expect(r?.events[0].tags).toHaveLength(4);
  });
});

describe('pickRelated — 같은 날이 없으면 비슷한 행사', () => {
  it('분야 태그가 하나라도 겹치는 예정 행사', () => {
    const r = pickRelated(
      ev('1', { tags: tags('오프라인', '유료', '세미나', '클라우드', 'AI') }),
      [
        ev('2', {
          end_date_time: '2026-11-20T18:00',
          tags: tags('온라인', '무료', '보안'),
        }),
        ev('3', {
          end_date_time: '2026-11-21T18:00',
          tags: tags('온라인', '무료', 'AI'),
        }),
        ev('4', {
          end_date_time: '2026-11-22T18:00',
          tags: tags('오프라인', '유료', '클라우드'),
        }),
        ev('5', {
          end_date_time: '2026-11-23T18:00',
          tags: tags('오프라인', '유료', '세미나'),
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('비슷한 행사');
    expect(ids(r?.events)).toEqual(['3', '4']);
  });

  it('유형·참여 방법·비용 태그만 겹치면 비슷한 행사가 아니다', () => {
    expect(
      pickRelated(
        ev('1', { tags: tags('오프라인', '무료', '세미나') }),
        [
          ev('2', {
            end_date_time: '2026-11-20T18:00',
            tags: tags('오프라인', '무료', '세미나'),
          }),
        ],
        NOW
      )
    ).toBeNull();
  });

  it('끝난 행사의 상세에서도 비슷한 예정 행사를 보여 준다 (목업 #detail/3470)', () => {
    const r = pickRelated(
      ev('3470', {
        start_date_time: '2026-10-17T17:00',
        end_date_time: '2026-11-01T15:00',
        tags: tags('오프라인', '유료', '모임', '블록체인'),
      }),
      [
        ev('3474', {
          end_date_time: '2026-11-13T17:00',
          tags: tags('오프라인', '무료', '대회', '블록체인'),
        }),
      ],
      NOW
    );
    expect(r?.title).toBe('비슷한 행사');
    expect(ids(r?.events)).toEqual(['3474']);
  });

  it('끝난 행사는 고르지 않는다', () => {
    expect(
      pickRelated(
        ev('1'),
        [ev('2', { end_date_time: '2026-11-12T18:00' })],
        NOW
      )
    ).toBeNull();
  });

  it('후보가 없으면 null', () => {
    expect(pickRelated(ev('1'), [], NOW)).toBeNull();
  });
});

describe('slimEvent · aliveRelated · relatedMeta', () => {
  it('slimEvent는 본문만 비우고 원본은 그대로 둔다', () => {
    const original = ev('1');
    const slim = slimEvent(original);
    expect(slim.description).toBe('');
    expect(slim.organizer).toBe('주최');
    expect(original.description).toBe('아주 긴 본문');
  });

  it('aliveRelated는 그 사이에 끝난 행사를 뺀다 (오래된 캐시)', () => {
    const list = [ev('2', { end_date_time: '2026-11-13T17:00' }), ev('3')];
    expect(ids(aliveRelated(list, NOW))).toEqual(['2', '3']);
    expect(ids(aliveRelated(list, '2026-11-13T17:01'))).toEqual(['3']);
    expect(ids(aliveRelated(list, '2026-11-20T00:00'))).toEqual([]);
  });

  it('relatedMeta는 "주최 · 남은 날 · 비용" (목업 #detail/3489의 첫 줄)', () => {
    expect(
      relatedMeta(ev('3525', { organizer: 'GDG Busan · Elice Lab' }), NOW)
    ).toBe('GDG Busan · Elice Lab · 마감 D-6 · 무료');
    expect(
      relatedMeta(
        ev('3508', {
          organizer: 'C++ Korea',
          end_date_time: '2026-11-13T17:00',
        }),
        NOW
      )
    ).toBe('C++ Korea · 오늘 마감 · 무료');
  });

  it('비용 태그나 주최가 없으면 그 자리를 건너뛴다', () => {
    expect(relatedMeta(ev('2', { tags: tags('오프라인', 'AI') }), NOW)).toBe(
      '주최 · 마감 D-6'
    );
    expect(relatedMeta(ev('2', { organizer: '' }), NOW)).toBe(
      '마감 D-6 · 무료'
    );
  });
});
```

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- lib/utils/detail`
Expected: `summary`·`related`가 FAIL(모듈을 찾을 수 없음), `applyCard`는 PASS

- [ ] **Step 4: `summary.ts`, `related.ts`를 구현한다.**

- [ ] **Step 5: `lib/utils/renderDescription.ts`를 만든다.** 이 시점에는 아직 부르는 곳이 없다(작업 6의 `DetailBody`가 부른다). `[eventId].tsx`의 `marked` 호출은 작업 8에서 없앤다.

- [ ] **Step 6: 확인**

Run: `pnpm test -- lib/utils/detail && npx tsc --noEmit && npx eslint lib/utils/detail lib/utils/renderDescription.ts`
Expected: PASS (applyCard 20, summary 15, related 14), 타입·린트 오류 없음

Run: `TZ=America/Los_Angeles pnpm test -- lib/utils/detail`
Expected: 같은 결과

Run: `grep -rn "from 'marked'" lib components pages --include='*.ts' --include='*.tsx'`
Expected: `lib/utils/renderDescription.ts`와 `pages/event/detail/[eventId].tsx:5`(작업 8에서 없어짐) 두 줄

관리자가 화면에서 볼 것: 없음.

---

### Task 3: 3단계 부품에 추가 · 본문 색 변수

**Files:**
- Modify: `components/events/timeline/TimelineIcon.tsx:1-9`(이름), `:17-55`(그림)
- Modify: `lib/utils/timeline/cover.ts`(함수 추가), `lib/utils/timeline/__tests__/cover.test.ts:1`(import)과 파일 끝(테스트 추가)
- Modify: `components/events/timeline/EventThumb.tsx:17-21`(props), `:23`, `:30`, `:43`
- Modify: `styles/Theme.scss:73` 뒤(밝은 화면), `:154` 뒤(어두운 화면), `styles/__tests__/deTokens.test.ts:15-38`(`EXPECTED`)

**Interfaces:**
- Produces:

```ts
// components/events/timeline/TimelineIcon.tsx — 이름 넷 추가 (기존 여덟 개는 그대로)
type IconName = /* 기존 */ | 'out' | 'zoom' | 'pin' | 'globe';

// lib/utils/timeline/cover.ts — 추가
export const hasCoverLink: (url: string | null | undefined) => boolean;   // 호스트를 가리지 않고 주소가 있는지만

// components/events/timeline/EventThumb.tsx — 선택 props 둘 추가
function EventThumb(props: {
  event: Event;
  priority?: boolean;
  className?: string;
  anyHost?: boolean;            // true면 호스트를 가리지 않고 cover_image_link가 있으면 그린다. 기본 false
  onCoverError?: () => void;    // 커버 이미지를 받지 못해 자동 표지로 바뀔 때 부른다
}): JSX.Element;
```

- Produces (`styles/Theme.scss`):

| 변수 | 밝은 화면 | 어두운 화면 | 쓰는 곳 |
|---|---|---|---|
| `--de-prose-fg` | `#2b2d36` | `#cfd4de` | 본문 글자 |
| `--de-prose-border` | `#e1e1e8` | `#2b303a` | 표·인용·가로줄의 선 |
| `--de-prose-th` | `#f7f7fa` | `#171a20` | 표 머리칸, 코드 바탕 |
| `--de-prose-accent` | `#0043ff` | `#7aa2ff` | 본문 링크 |
| `--de-prose-muted` | `#6c6e7e` | `#8d94a3` | 인용 글자 |

값은 목업 `app.css:6`·`:12`의 `--prose-*`다. 본문 제목 색(`--prose-head`)은 `--de-ink`를 쓴다.

**왜 `EventThumb`에 props를 더하나**

- 지금 상세는 커버 이미지의 호스트를 가리지 않는다(`[eventId].tsx:194-203`. `unoptimized`라 `next.config.js`의 `images.domains`와도 무관하게 그려진다: `node_modules/next/dist/client/image.js:586-588`). `EventThumb`은 서비스의 S3 주소가 아니면 자동 표지를 그린다(`cover.ts:18-19`, 카드의 기준). 그대로 쓰면 **지금 상세에서 보이던 다른 호스트의 포스터가 자동 표지로 바뀐다.** 그래서 상세의 포스터만 `anyHost`로 지금 동작을 지킨다. 이미지를 받지 못하면 자동 표지로 바뀌는 것은 같다. 같은 날 다른 행사의 작은 썸네일은 카드와 같은 기준(기본값)을 쓴다.
- 포스터는 커버 이미지가 실제로 보일 때만 "크게 보기"가 된다. 깨졌는지는 `EventThumb` 안의 상태라 밖에서 알 수 없어 `onCoverError`로 알린다.

- [ ] **Step 1: `cover.test.ts`에 실패하는 테스트를 더한다.** 맨 위 import에 `hasCoverLink`를 더하고, 파일 끝에 아래를 붙인다. 기존 테스트는 그대로 둔다.

```ts
describe('hasCoverLink', () => {
  it('호스트를 가리지 않고 주소가 있는지만 본다 (상세의 포스터)', () => {
    expect(hasCoverLink('https://example.com/a.png')).toBe(true);
    expect(
      hasCoverLink(
        'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/a.jpg'
      )
    ).toBe(true);
    expect(hasCoverLink('   ')).toBe(false);
    expect(hasCoverLink('')).toBe(false);
    expect(hasCoverLink(null)).toBe(false);
    expect(hasCoverLink(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: `styles/__tests__/deTokens.test.ts`의 `EXPECTED`에 변수 다섯 개를 더한다**(`'--de-prose-fg'`, `'--de-prose-border'`, `'--de-prose-th'`, `'--de-prose-accent'`, `'--de-prose-muted'`). 배열은 `.sort()`되므로 넣는 자리는 상관없다.

- [ ] **Step 3: 실패를 확인한다**

Run: `pnpm test -- cover deTokens`
Expected: FAIL (`hasCoverLink`가 없음, 변수 목록이 다름)

- [ ] **Step 4: `cover.ts`에 `hasCoverLink`를 더하고, `Theme.scss`의 두 블록 끝(`--de-holo-ink` 다음 줄)에 변수 다섯 개씩을 더한다.** `isUsableCover`는 고치지 않는다.

- [ ] **Step 5: `TimelineIcon.tsx`에 아이콘 넷을 더한다.** 경로는 목업 `app.js:38-44`에서 옮긴다(소수점 뒤의 불필요한 0은 뺐다).

| 이름 | 내용 | 쓰는 곳 |
|---|---|---|
| `out` | `<path d="M8 16L18 6M9.5 6H18v8.5"/>` | "신청하러 가기"의 바깥 화살표 |
| `zoom` | `<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6M11 8v6M8 11h6"/>` | "크게 보기" 딱지 |
| `pin` | `<path d="M12 21s7-6.2 7-11.5a7 7 0 00-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>` | 참여 방법(오프라인) |
| `globe` | `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>` | 참여 방법(온라인) |

- [ ] **Step 6: `EventThumb.tsx`에 props 둘을 더한다.**
  - 커버를 그릴지: `anyHost`면 `hasCoverLink(event.cover_image_link)`, 아니면 지금처럼 `isUsableCover(event.cover_image_link)`. 깨졌으면(`broken`) 둘 다 자동 표지.
  - `onError`에서 `setBroken(true)` 뒤에 `onCoverError`가 있으면 부른다.
  - 기본값은 지금 동작과 같다. `EventCard.tsx:62`의 호출은 고치지 않는다.

- [ ] **Step 7: 확인**

Run: `pnpm test -- cover deTokens && npx tsc --noEmit && npx eslint components/events/timeline/TimelineIcon.tsx components/events/timeline/EventThumb.tsx lib/utils/timeline/cover.ts`
Expected: PASS (cover 5개, deTokens 3개), 오류 없음

Run: `grep -n "<EventThumb" components/events/timeline/EventCard.tsx`
Expected: `<EventThumb event={event} priority={priority} />` 한 줄 그대로다(3단계의 파일은 아직 git이 추적하지 않아 `git diff`로는 볼 수 없다). `EventCard.tsx`와 `EventThumb.module.scss`는 이 작업에서 열어 고치지 않는다.

관리자가 화면에서 볼 것(작업 9에서 함께): `/events`의 카드 썸네일과 아이콘이 이 작업 전과 같다.

---

### Task 4: 크게 보기 · 포스터

목업 기준: `app.js:375`(포스터와 "크게 보기" 딱지), `:516-518`(여닫기), `:550`(Esc), `app.css:222-223`(`.d__l .k-thumb`, `.zoomhint`), `:258-259`(`.lb`). 목업 주소 `app.html#detail/3489`(포스터 있음), `#detail/3523`(자동 표지).

**Files:**
- Create: `components/events/detail/Lightbox.tsx`, `Lightbox.module.scss`
- Create: `components/events/detail/DetailPoster.tsx`, `DetailPoster.module.scss`

**Interfaces:**
- Consumes: `EventThumb`(`anyHost`, `onCoverError`)·`TimelineIcon`(`zoom`, `x`)·`hasCoverLink`(Task 3), `react-modal`(`pages/_app.tsx:27`에서 `Modal.setAppElement('#__next')`가 이미 되어 있다), 믹스인 `de-button-reset`·`de-focus-ring`
- Produces:

```ts
// components/events/detail/Lightbox.tsx
export interface LightboxImage { src: string; alt: string; }
function Lightbox(props: {
  image: LightboxImage | null;   // null이면 닫힌 상태
  onClose: () => void;
}): JSX.Element;

// components/events/detail/DetailPoster.tsx
function DetailPoster(props: {
  event: Event;
  onZoom: (image: LightboxImage) => void;
}): JSX.Element;
```

**`Lightbox`** — 새 의존성 없이 `react-modal`로 만든다. 포커스 가두기, Esc로 닫기, 닫힌 뒤 포커스 되돌리기, `role="dialog"`·`aria-modal`을 `react-modal`이 맡는다(로그인 창과 같은 도구).

- `<Modal isOpen={image !== null} onRequestClose={onClose} className={cn('content')} overlayClassName={cn('overlay')} contentLabel="그림 크게 보기">`. `className`·`overlayClassName`을 주면 `react-modal`의 기본 인라인 스타일이 빠진다.
- 안: `image`가 있을 때 `<img src={image.src} alt={image.alt} onClick={onClose} />`와 닫기 버튼 `<button type="button" aria-label="닫기" onClick={onClose}>`(`TimelineIcon` `x` 20px). `next/image`를 쓰지 않는다(원본 크기를 모른다).
- 닫히는 길 넷: Esc(`react-modal`), 바깥(오버레이)을 누름(`react-modal`), 그림을 누름, 닫기 버튼. 목업에는 닫기 버튼이 없지만, 대화상자 안에 포커스가 갈 곳과 터치 화면에서 닫는 길이 보여야 해서 넣는다.
- **뒤 화면 스크롤 잠금:** 열려 있는 동안 `document.documentElement.style.overflow = 'hidden'`, 닫히거나 언마운트될 때 원래 값으로 되돌린다(`useEffect`, 의존 값은 `image !== null`). `html`에 `scrollbar-gutter: stable`이 있어(`styles/globals.scss:5-7`) 스크롤바가 사라져도 화면이 옆으로 밀리지 않는다. CSS Module이 `pure` 모드라 `html`에 클래스를 다는 방식(`htmlOpenClassName`)은 스타일을 전역 파일에 써야 해서 쓰지 않는다.
- 값

| 부분 | 값 |
|---|---|
| 오버레이 | `position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: rgba(0, 0, 0, 0.86); cursor: zoom-out;` |
| 내용 칸 | `position: relative; display: grid; place-items: center; max-width: 100%; max-height: 100%; outline: 0;` |
| 그림 | `display: block; max-width: min(1200px, calc(100vw - 48px)); max-height: calc(100vh - 48px); max-height: calc(100dvh - 48px); border-radius: 12px; cursor: zoom-out;` (작은 그림은 키우지 않는다) |
| 닫기 버튼 | `de-button-reset`, `de-focus-ring`, `position: fixed; top: 16px; right: 16px; width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: rgba(0, 0, 0, 0.6); color: #fff;` |

- `z-index: 1000`은 로그인 창(999, `LoginModal.module.scss:12`)과 모바일 아래 고정 버튼(40)보다 위, 안내(9999, `ToastStack.module.scss:13`)보다 아래다.
- 여닫는 움직임은 넣지 않는다(목업에도 없다).

**`DetailPoster`**

```
<div class="poster">
  <EventThumb event={event} anyHost priority onCoverError={깨짐 표시} />
  [크게 볼 수 있으면]
  <button type="button" class="zoom" aria-label="행사 포스터 크게 보기" onClick={…}>
    <span class="hint" aria-hidden="true"><TimelineIcon name="zoom" size={14} /> 크게 보기</span>
  </button>
</div>
```

- "크게 볼 수 있다" = `hasCoverLink(event.cover_image_link)`이고 깨지지 않았을 때. 깨짐은 `useState(false)`에 두고 `onCoverError`에서 켠다. 자동 표지는 크게 볼 것이 없어 버튼과 딱지를 그리지 않는다(목업과 같다).
- **버튼을 `EventThumb`의 형제로 겹쳐 놓는다.** `EventThumb`을 버튼으로 감쌌다가 깨졌을 때 `div`로 바꾸면 `EventThumb`이 새로 마운트되어 깨진 주소를 한 번 더 요청한다.
- 누르면 `onZoom({ src: event.cover_image_link, alt: `${event.title} 포스터` })`.
- `priority`: 포스터는 첫 화면의 가장 큰 그림이다.
- 값

| 부분 | 값 |
|---|---|
| `.poster` | `position: relative; --de-thumb-radius: 18px;` |
| `.zoom` | `de-button-reset`, `de-focus-ring`, `position: absolute; inset: 0; width: 100%; border-radius: 18px; cursor: zoom-in;` |
| `.hint` | `position: absolute; right: 10px; bottom: 10px; display: flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 8px; background: rgba(0, 0, 0, 0.6); color: #fff; font-size: 12px; font-weight: 600;` |

- [ ] **Step 1: `Lightbox`와 스타일을 만든다.**
- [ ] **Step 2: `DetailPoster`와 스타일을 만든다.**
- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/detail/Lightbox.tsx components/events/detail/DetailPoster.tsx`
Expected: 오류 없음. (작업 9의 빌드에서 `min(1200px, calc(100vw - 48px))`나 `100dvh`를 Sass가 계산하려다 오류를 내면 `unquote('min(1200px, calc(100vw - 48px))')`처럼 적는다. 3단계의 `EventThumb.module.scss`가 `max(9px, 3.7cqw)`를 그대로 쓰고 있어 문제없을 것으로 본다.)

Run: `grep -n ":global" components/events/detail/*.scss`
Expected: 결과 없음

관리자가 화면에서 볼 것(작업 8 뒤. 비교: `app.html#detail/3489`, `#detail/3523`):
  1. 포스터가 왼쪽 칸 폭(320px)에 16:9, 모서리 18px, 오른쪽 아래에 "크게 보기" 딱지. 마우스를 올리면 돋보기 커서.
  2. 포스터를 누르면 어두운 바탕 위에 원본이 화면 안에 맞춰 뜬다. **Esc, 바탕, 그림, 닫기 버튼** 어느 것으로도 닫힌다. 닫힌 뒤 Tab을 누르면 포스터 다음 요소(신청 버튼)로 간다(포커스가 포스터로 돌아와 있다). 열려 있는 동안 마우스 휠로 뒤 화면이 움직이지 않고, 여닫을 때 화면이 옆으로 밀리지 않는다(Review Focus 5).
  3. 썸네일 없는 행사는 자동 표지가 나오고 "크게 보기" 딱지가 없고 눌리지 않는다.
  4. 개발자 도구에서 포스터 주소를 막고(Network → Block request URL) 새로 고치면 자동 표지로 바뀌고 딱지가 사라진다. 네트워크 탭에 그 주소의 요청이 **한 번**만 있다.
  5. 어두운 화면에서도 딱지와 닫기 버튼이 보인다.

---

### Task 5: 신청 카드 · 캘린더 메뉴 · 모바일 아래 고정 버튼

목업 기준: `app.js:367-369`(상태·버튼·관심), `:376-382`(카드), `:397`(아래 고정 버튼), `app.css:224-237`(`.reg*`, `.pb`, `.go`), `:298`·`:301-304`(860px 이하). 목업 주소 `app.html#detail/3489`, `#detail/3470`.

**Files:**
- Create: `components/events/detail/ApplyLink.tsx`, `ApplyLink.module.scss`
- Create: `components/events/detail/CalendarAdd.tsx`, `CalendarAdd.module.scss`
- Create: `components/events/detail/ApplyCard.tsx`, `ApplyCard.module.scss`
- Create: `components/events/detail/MobileApplyBar.tsx`, `MobileApplyBar.module.scss`

**Interfaces:**
- Consumes: `ApplyInfo`(Task 1), `TimelineIcon`(`bookmark`, `calendar`, `share`, `out`), `openInCalendar`·`CalendarTarget`(`lib/utils/calendar.ts`), `useToast`, 믹스인 `de-button-reset`·`de-focus-ring`·`de-press`·`de-mobile`
- Produces:

```ts
// ApplyLink.tsx — 신청 버튼. 카드와 아래 고정 버튼이 함께 쓴다
function ApplyLink(props: { href: string; canApply: boolean }): JSX.Element;
// 높이는 CSS 변수 --de-apply-height (기본 54px). 부모가 바꿔 쓴다.

// CalendarAdd.tsx — 캘린더 버튼과 메뉴. 버튼의 모양은 부르는 쪽이 정한다
function CalendarAdd(props: {
  event: Event;
  triggerClassName?: string;
  children: React.ReactNode;   // 버튼 안에 그릴 것 (아이콘, 글자)
}): JSX.Element;
// 메뉴는 "위치가 잡힌 가장 가까운 조상"을 기준으로 위로 열린다. 좌우 여백은 CSS 변수
// --de-menu-inset (기본 0). 부모가 position과 이 변수를 정한다.

// ApplyCard.tsx
function ApplyCard(props: {
  event: Event;
  info: ApplyInfo;
  favorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}): JSX.Element;

// MobileApplyBar.tsx
function MobileApplyBar(props: {
  event: Event;
  info: ApplyInfo;
  favorite: boolean;
  onToggleFavorite: () => void;
}): JSX.Element;
export function MobileApplyBarSpace(): JSX.Element;   // 푸터 아래에 두는 빈 자리. 860px 이하에서만 높이가 있다
```

**`ApplyLink`**

- `canApply`가 참: `<a href={href} target="_blank" rel="noopener noreferrer">신청하러 가기 <TimelineIcon name="out" size={18} /><span class="sr">(새 탭)</span></a>`. `.sr`은 화면에 보이지 않는 글자(`position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;`).
- 거짓: `<span class="off">종료된 행사예요</span>`(링크가 아니다. 포커스도 가지 않는다).
- 값: `display: flex; justify-content: center; align-items: center; gap: 6px; height: var(--de-apply-height, 54px); border-radius: 14px; background: var(--de-blue-fill); color: #fff; font-size: 16.5px; font-weight: 700;` + `de-press`·`de-focus-ring`. 꺼진 모습은 `background: var(--de-line); color: var(--de-hint);`
- 측정 이벤트는 보내지 않는다(지금 "참여하기"에도 없다).
- 다른 파일의 클래스로 이 부품의 `display`·`height`를 덮어쓰지 않는다(모듈 사이의 선택자 우선순위가 같아 빌드 순서에 따라 달라진다). 숨길 때는 부모가 감싼 칸을 숨기고, 높이는 변수로 바꾼다.

**`CalendarAdd`** — 지금의 `CalendarExportButton`과 하는 일이 같다(고르는 항목, 안내 문구, `openInCalendar` 호출). 버튼 모양과 메뉴가 열리는 방향이 달라 새로 만들고, 옛 파일은 그대로 둔다(작업 8 전까지 옛 화면이 쓴다).

- 버튼: `<button type="button" className={triggerClassName} aria-haspopup="menu" aria-expanded={open} aria-label="캘린더에 추가">{children}</button>`
- 메뉴(열렸을 때만 그린다): `role="menu"`, 안에 머리글 `캘린더 선택`과 항목 셋(`role="menuitem"`의 `<button type="button">`). 항목은 `CalendarExportButton.tsx:18-40`의 `OPTIONS`와 같다.

| 항목 | 덧말 | 색 칸 | 글자 |
|---|---|---|---|
| `Apple 캘린더` | `.ics` | `#0E0E14` | (없음) |
| `Google 캘린더` | `새 탭 열기` | `#4285F4` | `G` |
| `Outlook` | `.ics` | `#0078D4` | `O` |

- 고르면: 메뉴를 닫고 버튼으로 포커스를 돌린 뒤 `openInCalendar(target, event, window.location.origin)`. Apple·Outlook이면 `pushToast('캘린더 파일을 다운로드했어요')`, 예외가 나면 `pushToast('캘린더 추가에 실패했어요', 'plain')`(`CalendarExportButton.tsx:78-91`과 같다). 목업의 "캘린더에 추가했어요"는 쓰지 않는다(실제로는 파일을 내려받거나 새 탭이 열린다).
- 여닫기: 버튼을 누르면 여닫힌다. 열리면 첫 항목에 포커스. ↑·↓로 항목 사이를 돈다. Esc로 닫고 버튼으로 포커스. 바깥을 누르면(`mousedown`) 닫힌다. 리스너는 열려 있을 때만 달고 닫히거나 언마운트될 때 푼다.
- 바깥 `<div>`는 `position`을 주지 않는다(`min-width: 0`만). 메뉴가 부모(카드의 버튼 줄, 아래 고정 버튼)를 기준으로 놓이게 하려는 것이다.
- 메뉴의 값(목업에 메뉴 그림이 없다. 지금 메뉴의 구성에 새 색 변수를 입혔다)

| 부분 | 값 |
|---|---|
| 메뉴 | `position: absolute; left: var(--de-menu-inset, 0); right: var(--de-menu-inset, 0); bottom: calc(100% + 8px); z-index: 5; max-width: 320px; padding: 6px; border-radius: 14px; background: var(--de-bg); border: 1px solid var(--de-line); box-shadow: var(--de-shadow); text-align: left;` |
| 머리글 | `padding: 8px 10px 6px; font-size: 12px; font-weight: 700; color: var(--de-hint);` |
| 항목 | `de-button-reset`, `width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--de-ink); text-align: left;` 올리거나 포커스가 가면 `background: var(--de-hover)` (`outline`은 `de-focus-ring`, `outline-offset: -2px`) |
| 색 칸 | `flex: none; width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; border: 1px solid var(--de-line); color: #fff; font-size: 13px; font-weight: 800;` 바탕은 항목의 색(인라인 `style`) |
| 이름 | `flex: 1; min-width: 0;` |
| 덧말 | `font-size: 12px; font-weight: 500; color: var(--de-hint);` |

- **위로 여는 이유:** 왼쪽 칸은 화면에 붙어 있어 아래로 열면 낮은 창에서 화면 밖으로 나가고, 아래 고정 버튼에서는 위로밖에 열 수 없다. 두 자리를 같은 규칙으로 둔다(Review Focus 2·3).

**`ApplyCard`**

```
<section class="card" aria-label="신청">
  [state나 status가 있으면]
  <div class="status"><span>{info.state}</span><b class={info.tone}>{info.status}</b></div>
  [info.progress가 있으면]
  <div class="bar" aria-hidden="true"><i style={{ width: `${percent}%` }} /></div>
  <div class="barcap"><span>{startLabel}</span><span>{endLabel}</span></div>
  <div class="cta"><ApplyLink href={event.event_link} canApply={info.canApply} /></div>
  <div class="actions">
    <button 관심 /> <CalendarAdd …>아이콘 캘린더</CalendarAdd> <button 공유 />
  </div>
  [info.canApply면] <p class="note">신청은 주최 측 페이지에서 진행돼요.</p>
</section>
```

| 버튼 | 내용 |
|---|---|
| 관심 | `<button type="button" aria-label="관심 행사에 담기" aria-pressed={favorite}>` `TimelineIcon` `bookmark` 18px + `관심`. 누르면 `onToggleFavorite()` |
| 캘린더 | `<CalendarAdd event={event} triggerClassName={cn('action')}>` 안에 `TimelineIcon` `calendar` 18px + `캘린더` |
| 공유 | `<button type="button">` `TimelineIcon` `share` 18px + `공유`. 누르면 `onShare()` |

값 (`app.css:224-237`)

| 부분 | PC | 860px 이하 |
|---|---|---|
| `.card` | `margin-top: 16px; padding: 18px; border-radius: 18px; background: var(--de-surface);` | 같음 |
| `.status` | `display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 14px; font-weight: 600; color: var(--de-sub);` | 같음 |
| `.status b` | `font-size: 15px; font-weight: 800;` 색은 `orange` → `--de-orange`, `blue` → `--de-blue`, `gray` → `--de-hint` | 같음 |
| `.bar` | `margin-top: 10px; height: 6px; border-radius: 99px; background: var(--de-line); overflow: hidden;` 안의 `i`: `display: block; height: 100%; border-radius: 99px; background: var(--de-orange);` | 같음 |
| `.barcap` | `display: flex; justify-content: space-between; gap: 8px; margin-top: 6px; font-size: 12px; font-weight: 500; color: var(--de-hint);` | 같음 |
| `.cta` | `margin-top: 14px;` | **`display: none`** (신청 버튼은 아래 고정 버튼에 있다) |
| `.actions` | `position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 8px;` | 같음 |
| `.action` | `de-button-reset`, `de-focus-ring`, `width: 100%; height: 46px; border-radius: 12px; background: var(--de-bg); display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: var(--de-sub);` 담긴 상태(`aria-pressed="true"`)는 `color: var(--de-blue)`이고 아이콘을 채운다(`svg { fill: currentColor; }`) | 같음 |
| `.note` | `margin: 12px 0 0; text-align: center; font-size: 12.5px; line-height: 1.5; color: var(--de-hint);` | **`display: none`** |

- 끝난 행사: 상태 줄은 "종료 · 유료"와 회색 "종료된 행사예요", 막대 없음, 버튼은 꺼진 "종료된 행사예요", 관심·캘린더·공유는 그대로, 아래 안내 문장은 그리지 않는다(목업은 끝난 행사에도 "신청은 주최 측 페이지에서 진행돼요."가 남는다).
- `phase`가 `unknown`이고 비용 태그도 없으면 상태 줄을 그리지 않는다.
- 진행 막대의 `width`만 인라인 `style`로 넣는다.

**`MobileApplyBar`** — 860px보다 넓으면 `display: none`.

```
<div class="bar" role="group" aria-label="신청">
  <button type="button" class="icon" aria-label="관심 행사에 담기" aria-pressed={favorite}><TimelineIcon name="bookmark" /></button>
  <CalendarAdd event={event} triggerClassName={cn('icon')}><TimelineIcon name="calendar" /></CalendarAdd>
  <div class="cta"><ApplyLink href={event.event_link} canApply={info.canApply} /></div>
</div>
```

| 부분 | 값 (860px 이하) |
|---|---|
| `.bar` | `position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; gap: 8px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: var(--de-bg); border-top: 1px solid var(--de-line); --de-apply-height: 52px; --de-menu-inset: 16px;` |
| `.icon` | `de-button-reset`, `de-focus-ring`, `flex: none; width: 52px; height: 52px; border-radius: 14px; background: var(--de-surface); display: grid; place-items: center; color: var(--de-sub);` 담긴 상태는 `color: var(--de-blue)`, `svg { fill: currentColor; }` (목업에는 이 자리의 담긴 모습이 빠져 있다) |
| `.cta` | `flex: 1; min-width: 0;` |
| `MobileApplyBarSpace` | `<div aria-hidden="true">` — `display: none;` 860px 이하에서 `display: block; height: calc(76px + env(safe-area-inset-bottom));` |

- 아이콘은 20px(기본값).
- **푸터를 가리지 않게 하는 방법:** 목업은 상세 화면에서만 푸터에 아래 여백 76px을 준다(`app.css:304`). `Footer`는 `Layout` 안에 있어 손대지 않고, 페이지가 `</Layout>` 뒤에 `MobileApplyBarSpace`를 둔다(작업 8). 푸터에 바탕색이 따로 없어(`Footer.module.scss:4-6`) 여백으로 보인다. 목업의 76px에 `env(safe-area-inset-bottom)`을 더했다.
- PC의 카드와 이 막대는 둘 다 DOM에 있다. 숨겨진 쪽은 `display: none`이라 스크린리더와 Tab 순서에서 빠진다.

- [ ] **Step 1: `ApplyLink`, `CalendarAdd`와 스타일을 만든다.**
- [ ] **Step 2: `ApplyCard`와 스타일을 만든다.**
- [ ] **Step 3: `MobileApplyBar`(와 `MobileApplyBarSpace`)와 스타일을 만든다.**
- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/detail`
Expected: 오류 없음

Run: `grep -n "innerWidth\|matchMedia" components/events/detail/*.tsx`
Expected: 결과 없음

Run: `grep -n "openInCalendar" components/events/detail/*.tsx && git status --short -- lib/utils/calendar.ts components/common/calendar-export`
Expected: `CalendarAdd.tsx`에서만 부른다. `git status`에는 ` M …/CalendarExportButton.tsx` 한 줄만 나온다(1단계가 안내 문구를 고친 것). `lib/utils/calendar.ts`와 `CalendarExportButton.module.scss`는 나오지 않는다.

관리자가 화면에서 볼 것(작업 8 뒤. 비교: `app.html#detail/3489`, `#detail/3508`, `#detail/3470`. 1280×900과 390×844, 밝게·어둡게):
  1. 카드: "접수 중 · 유료" / 주황 "마감까지 N일 N시간", 주황 막대와 그 아래 "…접수 시작"·"…마감", 파란 "신청하러 가기 ↗", 관심·캘린더·공유 세 칸, "신청은 주최 측 페이지에서 진행돼요." 크기와 간격이 목업과 같다.
  2. "신청하러 가기"를 누르면 새 탭으로 주최 측 페이지가 열린다.
  3. 끝난 행사: 회색 "종료된 행사예요" 둘(오른쪽 위 글자, 버튼), 버튼이 눌리지 않고 Tab으로도 가지 않는다. 막대와 아래 안내 문장이 없다.
  4. 캘린더: 누르면 메뉴가 **버튼 위로**, 카드 안쪽 폭으로 열린다. 화면 폭을 900px로 줄여도 왼쪽이 잘리지 않는다. ↑·↓·Esc가 듣는다. Google은 새 탭, Apple·Outlook은 `.ics`가 내려받아지고 "캘린더 파일을 다운로드했어요"가 뜬다.
  5. 공유: "링크가 복사되었어요"가 뜨고, 붙여 넣으면 **지금 페이지의 주소**다(신청 주소가 아니다).
  6. 관심: 로그인하지 않고 누르면 로그인 창. 로그인한 상태에서는 파랗게 채워지고 "관심 행사에 담았어요"(로그인은 사용자가 직접 한다).
  7. 390px: 카드에 신청 버튼과 아래 안내 문장이 없고, 화면 아래에 관심·캘린더·"신청하러 가기"가 붙어 있다. 아래 막대의 캘린더 메뉴가 막대 위로 열린다. 맨 아래까지 내리면 푸터의 마지막 줄이 막대 위로 다 보인다(Review Focus 3). 로그인 창과 안내가 막대에 가리지 않는다.
  8. 1280×600처럼 낮은 창: 왼쪽 칸의 관심·캘린더·공유까지 화면 안에 있다. 더 낮으면(560px 이하) 칸이 붙지 않고 함께 스크롤된다(작업 8, Review Focus 2).

---

### Task 6: 제목 영역 · 본문

목업 기준: `app.js:385-392`, `app.css:238-250`(`.d__org`, `h1`, `.tags`, `.blks`, `.blk`, `.leaf`, `h2`), `:219-221`(표, 그림 커서), `:299`(860px 이하), `../shared/base.css:40-57`(`.k-prose`). 목업 주소 `app.html#detail/3489`, `#detail/3523`(표), `#detail/3470`(그림으로 시작).

**Files:**
- Create: `components/events/detail/DetailHead.tsx`, `DetailHead.module.scss`
- Create: `components/events/detail/DetailBody.tsx`, `DetailBody.module.scss`

**Interfaces:**
- Consumes: `describeWhen`·`describeHow`·`organizerInitial`·`renderDescription`(Task 2), `--de-prose-*`·`TimelineIcon`의 `pin`·`globe`(Task 3), `LightboxImage`(Task 4), `buildEventPlaceholderSummary`(`lib/seo/eventMeta.ts`)
- Produces:

```ts
function DetailHead(props: { event: Event; now: string }): JSX.Element;
function DetailBody(props: {
  event: Event;
  onZoom: (image: LightboxImage) => void;
}): JSX.Element;
```

**`DetailHead`**

```
[organizer가 있으면]
<div class="org"><i aria-hidden="true">{organizerInitial(organizer)}</i>{organizer}</div>
<h1 class="title">{title}</h1>
[tags가 있으면]
<div class="tags"><span>{tag_name}</span>…</div>            ← 받은 순서대로, 글자(버튼·링크 아님)
[when이나 how가 있으면]
<div class="blocks">
  [when] <div class="block">
           <div class="leaf" aria-hidden="true"><small>{when.month}</small><b>{when.day}</b></div>
           <p><b>{when.headline}</b><span>{when.range}</span></p>
         </div>
  [how]  <div class="block">
           <div class="leaf icon" aria-hidden="true"><TimelineIcon name={how.icon} size={22} /></div>
           <p><b>{how.headline}</b><span>{how.note}</span></p>
         </div>
</div>
```

- `when = describeWhen(event, now)`, `how = describeHow(event.tags)`. 그릴 때마다 계산한다(상태에 담아 두지 않는다).
- 태그의 `key`는 `${tag_name}-${index}`(`EventCard.tsx:76-78`과 같다).

| 부분 | PC | 860px 이하 |
|---|---|---|
| `.org` | `display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; color: var(--de-sub);` | 같음 |
| `.org i` | `flex: none; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--de-ink); color: var(--de-bg); font-style: normal; font-size: 14px; font-weight: 700;` | 같음 |
| `.title` | `margin: 12px 0 0; font-size: 34px; line-height: 1.3; font-weight: 800; letter-spacing: -0.025em;` | `font-size: 25px` |
| `.tags` | `display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px;` | 같음 |
| `.tags span` | `padding: 6px 11px; border-radius: 7px; background: var(--de-surface); font-size: 13.5px; font-weight: 500; color: var(--de-sub);` | 같음 |
| `.blocks` | `display: grid; gap: 14px; margin-top: 26px; padding: 22px 0; border-top: 1px solid var(--de-line); border-bottom: 1px solid var(--de-line);` | 같음 |
| `.block` | `display: flex; align-items: center; gap: 14px;` | 같음 |
| `.leaf` | `flex: none; width: 48px; height: 48px; border-radius: 12px; border: 1px solid var(--de-line); overflow: hidden; text-align: center;` | 같음 |
| `.leaf small` | `display: block; padding: 2px 0; background: var(--de-surface); font-size: 10.5px; font-weight: 700; color: var(--de-sub);` | 같음 |
| `.leaf b` | `display: block; font-size: 19px; font-weight: 800; line-height: 28px;` | 같음 |
| `.leaf.icon` | `display: grid; place-items: center; color: var(--de-sub);` | 같음 |
| `.block p` | `margin: 0; min-width: 0;` | 같음 |
| `.block p b` | `display: block; font-size: 16.5px; font-weight: 700;` | 같음 |
| `.block p span` | `font-size: 14px; font-weight: 500; color: var(--de-hint);` | 같음 |

**`DetailBody`**

```
<h2 class="heading">행사 소개</h2>
[html이 있으면] <div class="prose" ref onClick onKeyDown dangerouslySetInnerHTML={{ __html: html }} />
[없으면]       <p class="empty">{buildEventPlaceholderSummary(event)}</p>
```

- **본문 HTML을 만드는 호출은 여기 하나다:** `const html = useMemo(() => renderDescription(event.description), [event.description]);` 다른 브랜치의 걸러내기를 합칠 때 바뀌는 곳은 `lib/utils/renderDescription.ts` 파일 하나이고, 이 줄은 그대로다.
- 본문이 비었을 때(`html === ''`)는 지금처럼 자동 요약 문장을 보여 준다(검색 엔진에 빈 페이지로 보이지 않게 하려고 넣은 것이다: `eventMeta.ts:28`). 목업에는 이 경우가 없다(112건 모두 본문이 있다).
- **그림 크게 보기 — 이벤트 위임.** 본문은 `dangerouslySetInnerHTML`로 들어가 그림마다 핸들러를 달 수 없다. `.prose`의 `onClick`에서:
  1. `event.target`이 `HTMLImageElement`가 아니면 끝.
  2. `target.closest('a')`가 있으면 끝(링크 안의 그림은 링크로 간다).
  3. `onZoom({ src: target.currentSrc || target.src, alt: target.alt || '본문 그림' })`.
- **키보드:** 마운트된 뒤(`useEffect`, 의존 값 `html`) `.prose` 안의 그림 가운데 링크 안에 있지 않은 것에 `tabindex="0"`, `role="button"`, `aria-label`(`alt`가 있으면 `'<alt> 크게 보기'`, 없으면 `'본문 그림 크게 보기'`)을 단다. `.prose`의 `onKeyDown`에서 그런 그림 위의 Enter·Space를 누름과 같이 처리한다(Space는 `preventDefault`로 스크롤을 막는다). `__html` 문자열이 같으면 React가 안쪽 DOM을 다시 쓰지 않으므로 단 속성이 남는다.
- 값 — `.heading`: `margin: 32px 0 16px; font-size: 19px; font-weight: 800; letter-spacing: -0.015em;`
- 값 — `.prose` (`base.css:40-57`. 이 사이트에는 전역 여백 초기화가 없어 첫 줄을 더한다)

| 선택자 | 값 |
|---|---|
| `.prose` | `color: var(--de-prose-fg); font-size: 16px; line-height: 1.75;` |
| `.prose *` | `margin: 0;` (**맨 먼저 적는다.** 아래 `> * + *`와 우선순위가 같아 뒤에 오는 쪽이 이긴다) |
| `.prose > * + *` | `margin-top: 1em;` |
| `.prose h1` … `h6` | `margin-top: 2em; line-height: 1.4; letter-spacing: -0.012em; color: var(--de-ink);` 크기 `h1` 22px, `h2` 20px, `h3` 18px, `h4`·`h5`·`h6` 16px |
| `.prose > :first-child` | `margin-top: 0;` (제목으로 시작하는 본문 위에 2em이 생기지 않게. 목업에는 없다) |
| `.prose ul`, `ol` | `padding-left: 1.3em;` `ul { list-style: disc; }` `ol { list-style: decimal; }` |
| `.prose li + li`, `li > ul`, `li > ol` | `margin-top: 0.4em;` |
| `.prose a` | `color: var(--de-prose-accent); text-decoration: underline; text-underline-offset: 3px;` |
| `.prose table` | `width: 100%; border-collapse: collapse; font-size: 14.5px; display: table;` **860px 이하** `display: block; overflow-x: auto;` |
| `.prose th`, `td` | `padding: 10px 14px; border: 1px solid var(--de-prose-border); text-align: left; vertical-align: top;` |
| `.prose th` | `background: var(--de-prose-th); font-weight: 600; white-space: nowrap;` |
| `.prose img` | `max-width: 100%; height: auto; border-radius: 12px; cursor: zoom-in;` 포커스 표시는 `outline: 2px solid var(--de-blue); outline-offset: 2px;`(`:focus-visible`) |
| `.prose a img` | `cursor: pointer;` |
| `.prose iframe`, `video` | `max-width: 100%;` |
| `.prose blockquote` | `padding: 4px 0 4px 16px; border-left: 3px solid var(--de-prose-border); color: var(--de-prose-muted);` |
| `.prose code` | `font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; font-size: 0.9em; padding: 2px 6px; border-radius: 6px; background: var(--de-prose-th);` |
| `.prose pre` | `padding: 16px; border-radius: 12px; background: var(--de-prose-th); overflow-x: auto;` 안의 `code`는 `padding: 0; background: none;` (목업에는 없다. 지금 화면에 있는 것을 새 색으로) |
| `.prose hr` | `border: 0; border-top: 1px solid var(--de-prose-border); margin: 2em 0;` |

- **표는 PC에서 본문 칸을 다 채운다**(`display: table; width: 100%`. 지금 서비스와 같다). 860px 이하에서는 표가 화면보다 넓으면 표 안에서만 옆으로 넘겨진다.
- 값 — `.empty`: `margin: 0; padding: 22px; border-radius: 16px; background: var(--de-surface); font-size: 14.5px; line-height: 1.6; color: var(--de-sub);`

- [ ] **Step 1: `DetailHead`와 스타일을 만든다.**
- [ ] **Step 2: `DetailBody`와 스타일을 만든다.**
- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/detail/DetailHead.tsx components/events/detail/DetailBody.tsx`
Expected: 오류 없음

Run: `grep -rn "dangerouslySetInnerHTML\|renderDescription(" components --include='*.tsx'`
Expected: `components/events/detail/DetailBody.tsx`의 두 줄뿐이다(`components/` 아래에는 지금 `dangerouslySetInnerHTML`을 쓰는 곳이 없다. `pages/`의 것은 JSON-LD와, 작업 8에서 없어질 `[eventId].tsx:287`이다).

Run: `grep -n "useState" components/events/detail/DetailHead.tsx`
Expected: 결과 없음

관리자가 화면에서 볼 것(작업 8 뒤. 비교: `app.html#detail/3489`, `#detail/3523`, `#detail/3470`, `#detail/3555`. 1280px과 390px, 밝게·어둡게):
  1. 주최(검은 원 안의 첫 글자 + 이름), 제목 34px(모바일 25px), 회색 태그, 위아래 선 사이의 블록 둘(달력 한 장 + 문장, 아이콘 + 참여 방법)의 크기와 간격이 목업과 같다.
  2. 문장이 목업과 같다: 접수형 "11월 19일 목요일 18:00 접수 마감" / "접수 기간 10.19(월) 18:00 ~ 11.19(목) 18:00", 예정인 일시형 "11월 18일 수요일 19:00 ~ 20:30", 진행 중 "11월 9일 월요일" / "11.9(월) 14:00 ~ 11.13(금) 15:00". 오프라인은 핀 아이콘과 "장소는 아래 행사 소개에서 확인해 주세요", 온라인은 지구 아이콘과 "접속 방법은 신청 후 안내돼요".
  3. 본문: 글자 16px·줄 간격 1.75, 제목·목록·링크(파랑 밑줄)·인용·코드가 목업과 같다. **표가 본문 칸의 폭(712px)을 다 채운다**(`#detail/3523`). 390px에서는 넓은 표가 표 안에서만 옆으로 넘겨지고 화면 전체에 가로 스크롤이 생기지 않는다(Review Focus 4).
  4. 본문 그림을 누르면 크게 보인다. **링크가 걸린 그림은 크게 보이지 않고 링크로 간다.** Tab으로 그림에 포커스가 가고 Enter로 열린다. 닫으면 그 그림으로 포커스가 돌아온다.
  5. 그림으로 시작하는 본문(`#detail/3470`)과 제목으로 시작하는 본문에서 "행사 소개" 아래의 간격이 16px이다.
  6. 본문에 긴 주소가 있어도 칸을 넘지 않는다.
  7. 본문이 없는 행사: "행사 소개" 아래 회색 칸에 자동 요약 문장이 나온다.

---

### Task 7: 같은 날 다른 행사

목업 기준: `app.js:393`, `app.css:251-256`(`.more*`), `:300`(860px 이하). 목업 주소 `app.html#detail/3489`(2건), `#detail/3523`(4건), `#detail/3470`("비슷한 행사").

**Files:**
- Create: `components/events/detail/RelatedEvents.tsx`, `RelatedEvents.module.scss`

**Interfaces:**
- Consumes: `RelatedPick`·`aliveRelated`·`relatedMeta`(Task 2), `EventThumb`(기본값 그대로: 카드와 같은 호스트 기준), 믹스인 `de-focus-ring`·`text-multiline-ellipsis`·`de-mobile`
- Produces:

```ts
function RelatedEvents(props: {
  related: RelatedPick | null;
  now: string;
}): JSX.Element | null;
```

**구성**

```
<section class="more" aria-labelledby="related-title">
  <h2 id="related-title" class="heading">{related.title}</h2>
  <ul class="list">
    <li key={event.id}>
      <Link href={`/event/detail/${event.id}`}><a class="row">
        <span class="thumb"><EventThumb event={event} /></span>
        <span class="text">
          <strong>{event.title}</strong>
          <small>{relatedMeta(event, now)}</small>
        </span>
      </a></Link>
    </li>
  </ul>
</section>
```

- 그릴 목록은 `aliveRelated(related.events, now)`. `related`가 `null`이거나 목록이 비면 **아무것도 그리지 않는다**(`null`). HTML이 CDN에 남아 있는 동안 끝난 행사가 여기서 빠진다(Review Focus 1).
- 제목은 서버가 정한 `related.title`을 그대로 쓴다.
- 썸네일에는 `priority`를 주지 않는다(화면 아래쪽이다).
- 측정 이벤트는 보내지 않는다(새 이벤트를 만들지 않는다).

| 부분 | PC | 860px 이하 |
|---|---|---|
| `.more` | `margin-top: 48px; padding-top: 8px; border-top: 1px solid var(--de-line);` | 같음 |
| `.heading` | `margin: 32px 0 16px; font-size: 19px; font-weight: 800; letter-spacing: -0.015em;` | 같음 |
| `.list` | `margin: 0; padding: 0; list-style: none;` | 같음 |
| `.row` | `de-focus-ring`, `display: grid; grid-template-columns: 176px minmax(0, 1fr); gap: 16px; align-items: center; padding: 10px; margin: 0 -10px; border-radius: 16px; color: inherit;` 올리면 `background: var(--de-hover)` | `grid-template-columns: 128px minmax(0, 1fr); gap: 12px;` |
| `.thumb` | `display: block; --de-thumb-radius: 10px;` | 같음 |
| `.text` | `display: block; min-width: 0;` | 같음 |
| `.text strong` | `text-multiline-ellipsis(2)`, `font-size: 16px; line-height: 1.4; font-weight: 700;` | `font-size: 14.5px` |
| `.text small` | `display: block; margin-top: 5px; font-size: 13.5px; color: var(--de-hint);` | 같음 |

- [ ] **Step 1: `RelatedEvents`와 스타일을 만든다.**
- [ ] **Step 2: 확인**

Run: `npx tsc --noEmit && npx eslint components/events/detail/RelatedEvents.tsx`
Expected: 오류 없음

Run: `grep -n "key={" components/events/detail/RelatedEvents.tsx`
Expected: `key`가 `event.id`. 순번을 쓰지 않는다.

관리자가 화면에서 볼 것(작업 8 뒤. 비교: `app.html#detail/3489`, `#detail/3523`, `#detail/3470`):
  1. 본문 아래 가로줄, "같은 날 다른 행사", 썸네일 176px(모바일 128px)과 제목(두 줄까지)·"주최 · 마감 D-6 · 무료" 줄이 목업과 같다.
  2. 한 줄을 누르면 그 행사의 상세로 가고 화면이 맨 위에서 시작한다.
  3. 같은 날 행사가 없는 행사는 제목이 "비슷한 행사"다. 고를 것이 없으면 이 영역이 없고 본문 아래에 가로줄도 없다.
  4. 썸네일 없는 행사는 줄에도 자동 표지가 나온다.

---

### Task 8: 조립 · 페이지 바꾸기

목업 기준: `app.js:370-398`의 뼈대, `app.css:213-215`(`.back`, `.d`, `.d__l`), `:297-298`(860px 이하).

**Files:**
- Create: `components/events/detail/EventDetailView.tsx`, `EventDetailView.module.scss`
- Modify: `pages/event/detail/[eventId].tsx:1-35`(import), `:44-46`(props), `:48-50`(`isEventDone`), `:52-157`(상태·핸들러), `:188-302`(본문), `:307-357`(`getServerSideProps`). **`:39-42`(캐시 값)과 `:161-186`(`<Head>`)은 그대로 둔다.**
- Modify: `lib/seo/eventMeta.ts:36` (문구 한 곳)

**Interfaces:**
- Consumes: Task 1~7의 모든 것, `useNow`·`useFavorite`·`toKstNaive`·`flattenEvents`(3단계), `LoginModal`(`isOpen`, `onClose`), `useToast`
- Produces:

```ts
// components/events/detail/EventDetailView.tsx
function EventDetailView(props: {
  event: Event;
  related: RelatedPick | null;
  now: string;                    // 서버가 그린 시각 (한국 시간, 'YYYY-MM-DDTHH:mm')
}): JSX.Element;

// pages/event/detail/[eventId].tsx
interface EventDetailProps {
  eventData: Event;
  related: RelatedPick | null;
  now: string;
}
```

**`EventDetailView`의 구성**

```
<div class="wrap">                                    ← de-container
  <Link href="/events"><a class="back"><TimelineIcon name="back" size={16} /> 행사 일정</a></Link>
  <div class="grid">
    <aside class="side">
      <DetailPoster event={event} onZoom={setZoom} />
      <ApplyCard event={event} info={info} favorite={…} onToggleFavorite={…} onShare={share} />
    </aside>
    <div class="main">
      <DetailHead event={event} now={now} />
      <DetailBody event={event} onZoom={setZoom} />
      <RelatedEvents related={related} now={now} />
    </div>
  </div>
</div>
<MobileApplyBar event={event} info={info} favorite={…} onToggleFavorite={…} />
<Lightbox image={zoom} onClose={() => setZoom(null)} />
<LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
```

- `now = useNow(props.now)` — 처음 그릴 때는 서버가 준 값, 마운트된 뒤 실제 시각, 1분마다와 탭이 다시 보일 때 새로 읽는다(Review Focus 1).
- `info = useMemo(() => describeApply(event, now), [event, now])`.
- 관심: `useFavorite()`의 `isFavorite(event.id)`, `toggleFavorite(event)`, `loginModalIsOpen`, `closeLoginModal`. 지금 `[eventId].tsx:71-77`·`:98-157`의 처리를 대신한다(같은 API·같은 SWR 키·같은 안내 문구. 실패하면 화면을 되돌리고, 같은 행사를 연달아 누르면 무시하는 것이 더해진다).
- 공유 `share`: `navigator.clipboard.writeText(window.location.href)` → 성공 `pushToast('링크가 복사되었어요')`, 실패 `pushToast('링크 복사에 실패했어요', 'plain')`(`[eventId].tsx:86-96`과 같다. 측정 이벤트는 지금도 없다).
- 크게 보기: `const [zoom, setZoom] = useState<LightboxImage | null>(null)`.

| 부분 | PC | 860px 이하 |
|---|---|---|
| `.wrap` | `de-container` | 같음 |
| `.back` | `de-focus-ring`, `display: inline-flex; align-items: center; gap: 4px; margin-top: 24px; font-size: 14px; font-weight: 600; color: var(--de-hint);` | 같음 |
| `.grid` | `display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 48px; padding-top: 24px; align-items: start;` | `grid-template-columns: minmax(0, 1fr); gap: 22px; padding-top: 14px;` |
| `.side` | `position: sticky; top: 24px; min-width: 0;` 창 높이가 낮을 때(`@media (min-width: 861px) and (max-height: 560px)`) `position: static` | `position: static` |
| `.main` | `min-width: 0;` | 같음 |

- 1120 − 좌우 20×2 − 320 − 48 = **712px**가 본문 폭이다.
- 모바일의 칸을 목업의 `1fr`이 아니라 `minmax(0, 1fr)`로 둔다. `1fr`은 안의 넓은 표·코드만큼 칸이 늘어나 화면이 밀린다(Review Focus 4).
- `.wrap`과 그 조상에 `overflow`를 걸지 않는다(걸면 왼쪽 칸이 붙지 않는다. Review Focus 2). 3단계가 `body`의 `overflow-x`를 `clip`으로 바꿔 두었다(`styles/globals.scss:27-33`).
- 왼쪽 칸의 높이는 포스터 180px + 16px + 카드 250px쯤 = 446px이고 위 24px을 더하면 470px이다. 창 높이 560px 이하에서는 붙이지 않아, 붙은 칸의 아래쪽을 누를 수 없는 일이 없게 한다.
- 아래쪽 여백은 두지 않는다. 소식 받기에 `margin-top: 80px`이 있다(`Subscribe.module.scss:5`).

**`pages/event/detail/[eventId].tsx`**

- [ ] **Step 1: `EventDetailView`와 스타일을 만든다.** 이 시점에는 아직 페이지가 쓰지 않는다.

- [ ] **Step 2: `getServerSideProps`를 고친다.** 404 처리와 캐시 헤더는 한 줄도 바꾸지 않는다.
  - 행사 한 건(`/front/v1/events/{eventId}`)과 예정 행사 목록(`/front/v2/events/current`)을 **함께** 부른다(`Promise.all`). 목록을 기다리느라 상세가 늦어지지 않게 한다.
  - 목록 호출은 **절대 상세를 실패시키지 않는다.** 응답이 `ok`가 아니거나, 예외가 나거나, 3초 안에 답이 없으면(`AbortController`와 `setTimeout`. 끝나면 `clearTimeout`) 빈 목록으로 본다. 받은 것은 `flattenEvents(응답)`으로 푼다(이 호출도 같은 `try` 안에 둔다. 배열이 아닌 응답이 오면 예외가 난다).
  - `now = toKstNaive(Date.now())`.
  - `related = pickRelated(eventData, 목록, now)`(`null`일 수 있다. `undefined`를 넘기면 Next가 직렬화 오류를 낸다).
  - `props: { eventData, related, now }`.
- [ ] **Step 3: 컴포넌트 본문을 고친다.**
  - `<Head>`(`:161-186`)와 그 위의 SEO 값 여섯 줄(`:79-84`: `pageTitle`, `description`, `ogImage`, `canonical`, `eventJsonLd`, `breadcrumbJsonLd`)은 그대로 둔다.
  - `<Layout>` 안(`:189-301`)을 `<EventDetailView key={eventData.id} event={eventData} related={related} now={now} />` 하나로 바꾼다. **`key`를 꼭 준다.** 같은 날 다른 행사를 눌러 다른 상세로 가면 같은 컴포넌트에 props만 바뀌므로, `key`가 없으면 앞 행사의 크게 보기·포스터 깨짐·메뉴 열림이 남는다(Review Focus 5).
  - `</Layout>` 뒤에 `<MobileApplyBarSpace />`를 둔다(푸터 아래의 빈 자리).
  - 쓰지 않게 된 것을 지운다: `isEventDone`, `loginModalIsOpen`, `useMyEvent` 호출, `descriptionHtml`, `getFavoriteId`·`isBookmarked`, `handleShare`·`handleBookmark`, 그리고 import(`Image`, `marked`, `ShareIcon`, `BookmarkIcon`, `CalendarExportButton`, `DdayTag`, `FilterTag`, `LoginModal`, `useToast`, `AuthContext`, `createMyEventApi`, `deleteMyEventApi`, `useMyEvent`, `buildEventPlaceholderSummary`, `formatEventPeriod`·`getEventTimeLabel`, `ga`, `mutate`, `style`, `classNames`, `useState`·`useContext`·`useMemo`). 파일은 지우지 않는다(`styles/EventDetail.module.scss` 등은 그대로 남는다).
- [ ] **Step 4: `lib/seo/eventMeta.ts:36`의 `'참여하기' 버튼`을 `'신청하러 가기' 버튼`으로 바꾼다.** 본문이 없는 행사의 자동 요약에 나오는 버튼 이름이다. `lib/seo/__tests__/eventMeta.test.ts:49-55`는 이 부분을 보지 않아 그대로 통과한다.

- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint "pages/event/detail/[eventId].tsx" components/events/detail lib/seo/eventMeta.ts`
Expected: 모두 통과

Run: `grep -n "marked\|DdayTag\|FilterTag\|CalendarExportButton\|EventDetail.module\|new Date(\|useMyEvent\|dangerouslySetInnerHTML" "pages/event/detail/[eventId].tsx"`
Expected: JSON-LD를 넣는 `dangerouslySetInnerHTML` 두 줄만 나온다

Run: `grep -n "s-maxage\|notFound\|rel=\"canonical\"\|ld+json" "pages/event/detail/[eventId].tsx"`
Expected: 캐시 값 둘(`s-maxage=3600`, `s-maxage=60`), `notFound: true` 넷, canonical 하나, JSON-LD 둘 — 이 작업 전과 같다

Run: `grep -rn "new Date(\|dayjs" components/events/detail lib/utils/detail`
Expected: 결과 없음

관리자가 화면에서 볼 것(상세 화면. 비교: `app.html#detail/3489`, `#detail/3523`, `#detail/3470`, `app.html?theme=dark#detail/3489`. 1280×900과 390×844, 밝게·어둡게):
  1. 위에 "‹ 행사 일정"(누르면 `/events`), 그 아래 왼쪽 320px 칸과 오른쪽 본문. 본문 칸의 폭이 712px이다(개발자 도구로 잰다).
  2. **스크롤하면 왼쪽 칸(포스터·신청 카드)이 화면 위 24px에 붙어 따라오고**, 본문이 끝나면 함께 올라간다. 새로 고친 직후에도 붙는다(Review Focus 2).
  3. 390px: 포스터 → 카드(상태·막대·관심·캘린더·공유) → 주최·제목·태그 → 일시 블록 → 본문 → 같은 날 다른 행사 순으로 한 칸. 화면 아래에 신청 버튼. 가로 스크롤이 없다.
  4. 콘솔에 하이드레이션 경고가 없다. 컴퓨터의 시계를 마감 1~2분 전으로 맞추고 화면을 열어 두면 "마감까지 N분"이 줄다가 "종료된 행사예요"로 바뀌고 버튼이 꺼진다(Review Focus 1).
  5. 같은 날 다른 행사의 한 줄을 누른다 → 새 행사의 상세가 맨 위에서 시작하고, 포스터·카드·본문이 모두 새 행사 것이다. 크게 보기를 연 채로 브라우저의 뒤로 가기를 눌러도 다음 화면에 어두운 바탕이 남지 않고 스크롤이 된다(Review Focus 5).
  6. 페이지 소스(서버가 보낸 HTML)에 제목·본문·같은 날 다른 행사의 링크가 들어 있다. `<title>`, `<link rel="canonical">`, JSON-LD 두 개가 이 작업 전과 같다.
  7. 없는 번호(`/event/detail/999999999`)는 지금처럼 오류 화면이다.
  8. 네트워크 탭: 상세를 열 때 브라우저에서 `/front/v2/events/current` 요청이 나가지 않는다(서버가 부른다).
  9. 작업 4~7의 "관리자가 화면에서 볼 것".

---

### Task 9: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인**

Run:
```bash
npx tsc --noEmit
pnpm test
npx eslint "pages/event/detail/[eventId].tsx" components/events/detail components/events/timeline/TimelineIcon.tsx components/events/timeline/EventThumb.tsx lib/utils/detail lib/utils/timeline lib/utils/renderDescription.ts lib/seo/eventMeta.ts
pnpm build
```
Expected: 모두 통과. 테스트는 이 단계에서 55개가 늘어난다(period 5, applyCard 20, summary 15, related 14, cover 1). **빌드는 이 단계에서 여기가 처음이다.** SCSS 오류가 나오면(`Selector … is not pure`, Sass의 단위·함수 오류) 그 파일을 만든 작업으로 돌려보낸다. 빌드 로그에 Sass 경고가 없는지도 본다.

Run: `TZ=UTC pnpm test -- lib/utils/detail lib/utils/timeline`
Expected: 통과(서버와 같은 시간대에서도 같은 결과)

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지**

Run: `grep -rnE "var\(--(primary|gray-|vapor-|ktb-|glass-)|@include (mobile|tablet|laptop)\b|#[0-9a-fA-F]{3,8}\b" components/events/detail`
Expected: `ApplyLink.module.scss`·`DetailPoster.module.scss`·`Lightbox.module.scss`·`CalendarAdd.module.scss`의 `#fff`와, `CalendarAdd.tsx`의 상표 색 셋(`#0E0E14`, `#4285F4`, `#0078D4`)만 나온다.

Run: `grep -rn "rem\b" components/events/detail --include='*.scss'`
Expected: 결과 없음(크기는 px. `1em`·`0.9em` 같은 `em`은 본문 스타일에만 있다)

Run: `git status --short | grep "^ D\|^D "`
Expected: 결과 없음(지운 파일이 없다)

Run: `git status --short -- components/events/calendar pages/events.tsx`
Expected: 이 단계에서 새로 바뀐 것이 없다(3단계의 미커밋 변경과 5단계의 변경만 보인다)

- [ ] **Step 3: 설명 페이지의 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

| 설명 페이지 | 요구 | 맡은 작업 |
|---|---|---|
| `detail` | 왼쪽에 포스터와 신청 카드를 고정 | 4, 5, 8 |
| `detail` | 모바일에서는 신청 버튼이 화면 아래에 | 5, 8 |
| `detail` | 포스터를 누르면 크게 | 3, 4 |
| `detail` | 왼쪽 320px, 본문 712px | 8 |
| `detail` | 표가 본문 칸을 다 채움 | 6 |
| `detail` | 본문 그림도 누르면 크게 | 4, 6 |
| `detail` | 신청 카드: 상태 → 남은 시간 → 진행 막대 → 버튼 → 관심·캘린더·공유 | 1, 5 |
| `detail` | 끝난 행사는 버튼이 "종료된 행사예요", 눌리지 않음 | 1, 5 |
| `detail` | 달력 한 장 + 한 문장 | 2, 6 |
| `detail` | 접수형은 마감일과 접수 기간, 장소는 본문에서 확인하라는 안내 | 2, 6 |
| `detail` | 같은 날 다른 행사 네 건, 없으면 같은 분야 | 2, 7 |
| `detail` | 새 API 없이 `/front/v2/events/current`를 서버 단계에서 | 8 |
| `thumb` | 상세에서는 눌러서 크게 | 4 |
| `thumb` | 썸네일이 없으면 자동 표지, 옅은 테두리 | 3단계의 `EventThumb`을 그대로 씀(4, 7) |
| `state` | 끝난 행사의 신청 버튼은 눌리지 않음 | 5 |
| `state` | 어두운 화면 | 3~8(모두 `--de-*`) |
| `impl` | 왼쪽 고정 영역에 신청 카드, 모바일 하단 고정 버튼, 포스터 크게 보기 | 4, 5, 8 |
| (받은 결정) | 공유는 페이지 주소를 복사 | 8 |
| (받은 결정) | 본문 HTML을 만드는 호출은 한 곳 | 2, 6 |
| (받은 결정) | `<Head>`·canonical·JSON-LD·404·캐시 헤더는 그대로 | 8 |

- [ ] **Step 4: 관리자가 화면에서 볼 것을 한 번에 모은다.** 작업 3~8의 "관리자가 화면에서 볼 것"과 Review Focus 다섯 가지를 한 목록으로 묶어 보고한다. 프로덕션 빌드(`pnpm build` 뒤 `pnpm start`)로, 1280×900과 390×844, 밝게·어둡게. 데이터는 `redesign-mock-api`(목업의 2026-11-13 스냅샷)를 쓰면 목업과 같은 행사로 비교할 수 있다(이 가짜 API가 `/front/v1/events/{id}`도 주는지 먼저 확인한다). 다만 "지금"은 실제 날짜라 스냅샷의 행사는 모두 끝난 행사로 보인다. 목업과 상태까지 맞춰 보려면 `EventDetailView`에 넘기는 `now`를 잠깐 `'2026-11-13T10:00'`으로 고정하고(그리고 `useNow`가 덮어쓰지 않게) 본 뒤 되돌린다. 더불어 `/events`와 `/search?kwd=AI`를 열어 카드의 썸네일·아이콘·시각 줄이 이 단계 전과 같은지 본다(작업 1·3이 3단계 파일을 건드렸다).

**이 단계가 끝난 뒤의 모습:** 상세 화면이 새 모양입니다. 로그인 창은 옛 모양(7단계)이고, 관심 행사 화면은 옛 카드(`Item`)를 그대로 씁니다(8단계).

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

**쓰는 곳이 없어진 파일**
- `styles/EventDetail.module.scss` (전체)
- `components/common/calendar-export/CalendarExportButton.tsx`, `CalendarExportButton.module.scss` (`components/events/detail/CalendarAdd.*`가 대신한다)

**아직 쓰는 곳이 남아 있어 그 단계에서 정리할 것**
- `components/common/tag/DdayTag.*`, `FilterTag.*`, `components/icons/ShareIcon.tsx`·`BookmarkIcon.tsx` — 상세는 더 쓰지 않는다. 관심 행사 화면의 `Item`이 쓴다. 8단계 뒤.
- `lib/utils/eventDate.ts`의 `formatEventPeriod`·`getEventTimeLabel` — 화면에서는 `Item`만 쓰고, `lib/seo/eventMeta.ts`(메타 설명, 자동 요약)는 계속 쓴다. **지우지 않는다.**
- `styles/Theme.scss`의 `--glass-overlay`·`--glass-overlay-strong` — 남은 사용처는 `Item.module.scss`와 위의 두 옛 파일. 8단계 뒤.

**지우면 안 되는 것**
- `public/default/event-thumbnail-light.png` — 화면에서는 더 쓰지 않지만 `lib/seo/site.ts:10-11`의 `DEFAULT_EVENT_THUMBNAIL_PATH`(커버가 없는 행사의 `og:image`와 JSON-LD의 `image`)가 쓴다. 3단계 문서의 "다른 곳에서 쓰는지 확인한 뒤" 목록에 있다.
- `lib/utils/calendar.ts` — `CalendarAdd`가 쓴다.

**합칠 때 할 일(지우기는 아님)**
- `lib/utils/renderDescription.ts` — `claude/frosty-murdock-4b230c`를 합칠 때 그쪽 파일로 통째로 바꾼다. 그쪽이 고친 `[eventId].tsx`의 `marked` 호출 부분은 이 단계에서 없어졌으므로 이 단계의 페이지를 택한다. 의존성 `xss`가 함께 들어온다.

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **새 부품은 `components/events/detail/`에 만들고 페이지는 마지막 작업에서 바꾼다.** 361줄짜리 페이지를 한 번에 고치면 중간에 화면이 깨진 상태가 생긴다. 3단계와 같은 방식이다.
2. **상태 판정은 `describeEvent`를 그대로 쓴다.** 메인의 카드와 상세가 "끝났다"·"진행 중"을 다르게 말하지 않게 하려는 것이다. 시작·끝을 읽는 규칙은 `describeEvent.ts`에서 `period.ts`로 꺼내 두 곳이 함께 쓴다(결과는 같다. 기존 테스트로 지킨다).
3. **남은 시간의 표기.** 목업의 규칙(24시간 이상 "N일 N시간", 그 아래 "N시간 N분")에서 세 가지를 고쳤다: 뒤 단위가 0이면 뺀다("7시간 0분" → "7시간"), 1시간 아래는 "N분"("0시간 35분" → "35분"), 1분 아래는 "1분"(목업은 "마감까지 " 뒤가 빈다).
4. **마감에 시각이 없는 접수형**은 날짜로만 센다: "마감까지 7일", 당일은 "오늘 마감"(목업의 줄 목록에 있는 말). 시각이 없는데 "7일 13시간"이라고 쓰면 없는 정확함을 만든다. 진행 막대 아래도 "11.20(금) 마감".
5. **비용 태그가 없으면 상태만**("접수 중"), **참여 방법 태그가 없으면 그 블록을 그리지 않는다.** 목업은 "접수 중 · ", "방식 미정 진행"에 접속 안내가 나온다.
6. **끝난 행사에는 "신청은 주최 측 페이지에서 진행돼요."를 그리지 않는다.** 꺼진 버튼 아래에 신청 안내가 남는 것이 어색하다.
7. **포스터는 호스트를 가리지 않는다(`anyHost`).** 지금 상세가 그렇게 동작하고(`unoptimized`라 `images.domains`와 무관), 카드의 기준(S3만)을 그대로 쓰면 지금 보이던 포스터가 자동 표지로 바뀐다. 같은 날 다른 행사의 썸네일은 카드와 같은 기준이다.
8. **크게 보기는 `react-modal`로 만든다.** 포커스 가두기·Esc·포커스 되돌리기를 이미 있는 도구에 맡긴다. 목업에 없는 것을 둘 더했다: 닫기 버튼, 열린 동안 뒤 화면 스크롤 잠금.
9. **본문 그림에 Tab으로 갈 수 있게 한다**(`tabindex`, `role="button"`). 그러지 않으면 키보드로는 크게 볼 수 없다. 링크 안의 그림에는 달지 않는다.
10. **캘린더는 새 부품(`CalendarAdd`)으로, 메뉴는 위로 연다.** 고르는 항목·안내 문구·동작은 지금과 같다. 목업의 "캘린더에 추가했어요"는 실제 동작(파일 내려받기, 새 탭)과 맞지 않아 지금 문구를 둔다. 메뉴의 모양은 목업에 없어 지금 구성에 새 색을 입혔다.
11. **모바일 아래 고정 버튼과 푸터**는 목업처럼 푸터 아래에 76px의 빈 자리를 두되, `Footer`를 고치지 않고 페이지가 `</Layout>` 뒤에 빈 칸을 둔다. 아이폰의 아래 여백(`safe-area-inset-bottom`)을 더했다. 아래 막대의 관심 버튼에 담긴 모습(파랗게 채움)을 더했다.
12. **같은 날 다른 행사는 서버가 고르고, 화면은 끝난 것만 뺀다.** 목록 전체를 브라우저로 보내지 않는다(본문을 비운 네 건, 2KB쯤). 목록 호출은 상세와 함께 부르고, 실패하거나 3초를 넘기면 이 영역만 빠진다.
13. **"비슷한 행사"의 분야는 목업과 같은 다섯 태그**(`AI`, `클라우드`, `블록체인`, `보안`, `기술일반`)로 본다. 필터의 직군 칩(`jobGroup.ts`)에서 유형에 해당하는 것(교육, 모임, 대회)을 뺀 것과 같다.
14. **본문 HTML은 `lib/utils/renderDescription.ts` 하나에서 만들고 `DetailBody`만 부른다.** 걸러내기 브랜치와 경로·시그니처를 맞췄다. 테스트 파일은 그 브랜치의 것과 이름이 겹쳐 만들지 않았다.
15. **본문 스타일**은 목업의 `.k-prose`에 넷을 더했다: 전역 여백 초기화가 없어 `.prose * { margin: 0 }`, 첫 요소의 위 여백 0, `pre`(지금 화면에 있음), `iframe`·`video`의 최대 폭.
16. **본문이 없는 행사**는 지금의 자동 요약 문장을 회색 칸에 그대로 보여 주고, 문장 안의 버튼 이름만 "신청하러 가기"로 맞춘다.
17. **본문 색은 `--de-prose-*` 다섯 개를 새로 만든다.** 목업 값이 기존 변수와 조금씩 다르다(글자 `#2b2d36`은 `--de-ink`와 `--de-sub` 사이, 어두운 화면의 링크 `#7aa2ff`는 `--de-blue`와 다름). 변수 목록을 지키는 테스트(`deTokens.test.ts`)도 함께 고친다.
18. **낮은 창(높이 560px 이하)에서는 왼쪽 칸을 붙이지 않는다.** 붙은 칸이 창보다 길면 아래쪽 버튼을 누를 수 없다.
19. **"‹ 행사 일정"은 `/events`로 가는 링크다**(목업). 검색 결과에서 들어온 사람은 브라우저의 뒤로 가기를 쓴다.
20. **상세에서 상세로 갈 때 `key`로 화면 상태를 새로 만든다.**
21. **측정 이벤트를 새로 만들지 않는다.** 관심 담기·빼기는 `useFavorite`이 지금과 같은 이벤트를 보낸다. 신청·공유·같은 날 다른 행사 누르기에는 지금도 없어 넣지 않았다.
22. **달력에 올리는 날과 문장은 목업 그대로**: 접수형은 마감일, 일시형은 시작일. 진행 중이거나 끝난 일시형은 굵은 문장에 시각이 없고 아래 기간 줄에만 있다.

### 확인이 필요한 것

1. **끝난 행사의 상세에 "비슷한 행사"를 보여 줄지.** 설명 페이지는 "이미 끝난 행사의 상세에서는 이 영역이 나오지 않습니다"라고 적었는데, 목업 화면(`#detail/3470`)에는 "비슷한 행사" 네 건이 나온다(`app.js:366`이 같은 날이 없으면 같은 분야로 넘어가기 때문). 계획은 **목업 화면대로 보여 준다.** 빼려면 `pickRelated`에서 지금 행사가 끝났을 때 `null`을 돌려주면 된다(한 줄과 테스트 하나).
2. **"접수 전" 상태.** 접수 시작일이 아직 오지 않은 접수형은 목업에 없다(목업은 "접수 중"에 막대 0%로 그린다). 계획은 왼쪽을 "접수 전 · 무료"로, 나머지는 접수 중과 같게 두었다(주황 "마감까지 …", 막대 0%와 "11.16(월) 접수 시작", 신청 버튼은 열려 있음). "접수 전"이라는 말과, 이때 신청 버튼을 열어 둘지를 확인한다.
3. **오래된 HTML의 첫 그림.** 캐시 헤더(1시간 + 하루)를 그대로 두기로 했으므로, 캐시된 HTML의 남은 시간·상태는 그만큼 낡을 수 있고 화면이 뜬 직후 실제 값으로 바뀐다(글자가 한 번 바뀌는 것이 보일 수 있다). 3단계의 메인(5분 + 1시간)보다 길다. 줄이려면 상세의 `s-maxage`를 줄여야 하는데 이 계획의 범위 밖이다.
4. **캘린더 메뉴의 모양과 방향.** 목업은 버튼을 누르면 안내만 뜬다. 실제로는 세 가지 가운데 고르는 메뉴가 필요해 계획이 모양을 정했다(정한 것 10). 카드에서도 위로 열려 잠깐 상태 줄과 신청 버튼을 가린다.
5. **모바일의 크게 보기.** 목업의 규칙(화면 안에 맞춤)대로면 390px 화면에서는 크게 보기가 본문의 그림과 거의 같은 크기다. 두 손가락 확대는 막지 않았다. 모바일에서 원본 크기로 보여 주고 끌어서 보는 방식이 필요한지 확인한다.
6. **본문 그림의 Tab 정지점.** 그림이 많은 본문에서는 Tab을 여러 번 눌러야 지나간다(정한 것 9). 빼려면 `DetailBody`의 `useEffect` 하나를 지우면 된다(마우스·터치로는 그대로 크게 보인다).
7. **운영 응답을 보지 못하고 가정한 것**(바깥 요청을 하지 않았다).
   - 커버 이미지가 S3가 아닌 호스트에 있는 행사가 실제로 있는지. 없다면 `anyHost`는 쓰이지 않는 안전장치다.
   - `/front/v1/events/{id}`와 `/front/v2/events/current`의 `id`가 같은 타입인지. 다를 수 있다고 보고 문자열로 바꿔 비교한다.
   - `/front/v2/events/current`에 진행 중인 행사와 오늘 이미 끝난 행사가 들어 있는지(3단계의 가정과 같다). 없으면 고를 것이 줄 뿐이다.
   - 분야를 태그 이름으로 가렸다. 태그의 `category` 값으로 가릴 수 있는지는 응답을 보지 못해 쓰지 않았다.
8. **자동 요약 문장의 버튼 이름**을 "참여하기"에서 "신청하러 가기"로 바꿨다. 이 문장은 본문이 없는 행사의 페이지 본문(검색 엔진이 읽는 글)이다.
9. **신청 주소가 비어 있는 행사.** 지금처럼 빈 `href`의 링크가 그려진다(누르면 같은 페이지가 새 탭으로 열린다). 그런 데이터가 있다면 버튼을 어떻게 보일지 정해야 한다.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 설명 페이지와 화면이 다르다: 끝난 행사의 상세에 "비슷한 행사"가 나온다(확인이 필요한 것 1). 설명 페이지의 "접수형 행사는 … 본문에서 확인하도록 안내합니다"에 해당하는 문구는 오프라인일 때의 "장소는 아래 행사 소개에서 확인해 주세요"뿐이고, 온라인 접수형에는 행사 날짜에 대한 안내가 없다.
- 남은 시간이 "7시간 0분", "0시간 35분"으로 나오고, 마감하는 순간에는 "마감까지 " 뒤가 빈다(`app.js:61`).
- 비용 태그가 없으면 "접수 중 · ", 참여 방법이 없으면 "방식 미정 진행"과 접속 안내가 나온다(`app.js:377`, `:389`).
- 시각 사용 여부를 `!== 'N'`으로 본다(`app.js:52`). `null`이 시각 있음이 된다. 운영 데이터가 모두 `Y/Y`라 드러나지 않았다.
- 아래 고정 버튼의 관심 버튼에 담긴 모습이 없다(`.reg__a button.is-on`만 있다).
- 푸터 아래 여백 76px에 `safe-area-inset-bottom`이 빠져 있다(`app.css:304`).
- 본문이 제목으로 시작하면 위에 2em이 생긴다(`.k-prose h1`이 `.k-prose > * + *`보다 우선한다).
- 860px 이하의 칸이 `1fr`이라 넓은 표·코드가 화면을 밀 수 있다(`app.css:297`).
- 크게 보기에 닫기 버튼과 포커스 이동이 없고, 열린 동안 뒤 화면이 스크롤된다. 모바일에서는 그림이 커지지 않는다.
- 끝난 행사에도 "신청은 주최 측 페이지에서 진행돼요."가 남는다.

**지금 코드**
- `isEventDone`이 `new Date(문자열)`로 읽는다(`[eventId].tsx:48-50`). 서버(UTC)가 그릴 때 9시간 늦게 끝난 것으로 본다.
- `marked`의 기본값(`mangle`)이 메일 주소를 부를 때마다 다른 글자로 바꾼다. 본문에 메일 주소가 있으면 서버와 브라우저의 HTML이 다르다. 걸러내기 브랜치가 `mangle: false`로 고쳤다. 이 계획은 옵션을 건드리지 않았다.
- 본문에 걸러내는 처리가 없다(로드맵의 "범위 밖"). 걸러내기 브랜치에서 다룬다.
- `lib/utils/calendar.ts`가 날짜를 브라우저의 시간대로 읽는다. 한국 밖에서 쓰면 캘린더에 들어가는 시각이 어긋난다. 고치지 않았다.
- `WeekType`이 `'월' | '화' | '수'`뿐이다(`model/calender.ts:1`). `Event`의 `start_day_week`·`end_day_week`가 이 타입인데 그 값을 읽는 곳은 없다. 테스트에서 행사를 만들 때 `'목'`을 넣으면 `tsc`가 막는다.
- `CalendarExportButton`의 메뉴는 `role="menu"`인데 방향키가 듣지 않는다. 새 부품에서 넣었다.
- 상세는 커버 이미지의 호스트를 가리지 않고 카드는 S3만 받는다. 기준이 둘이다(정한 것 7에서 그대로 두었다).
- `styles/__tests__/deTokens.test.ts`가 `--de-*` 변수의 목록을 고정해 둔다. 변수를 더하는 단계는 이 테스트를 함께 고쳐야 한다(5단계도 해당될 수 있다).
- 자동 요약 문장(`lib/seo/eventMeta.ts:36`)에 화면의 버튼 이름이 글자로 박혀 있다.
