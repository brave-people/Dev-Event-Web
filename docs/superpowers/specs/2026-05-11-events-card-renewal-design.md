# Events 페이지 카드 리뉴얼 — Design Spec

- **Date**: 2026-05-11
- **Author**: 고언약 + Claude Code (Opus 4.7)
- **Status**: Draft — pending user review
- **Reference**: [DESIGN.md](../../../DESIGN.md), kakaotechbootcamp.com course-card pattern
- **Visual mockups**: `.superpowers/brainstorm/99710-1778482665/content/card-direction-v3.html`

## 1. Goal

`/events` 페이지에 렌더링되는 행사 카드를 DESIGN.md의 KTB course-card 스펙으로 리뉴얼한다. 반응형 하이브리드 — 데스크탑(≥1200px)은 horizontal row 유지, 그 이하는 vertical KTB 카드. 색·타이포·radius·간격은 모두 Vapor 토큰으로 정렬.

## 2. Scope

### In scope
- `components/common/item/Item.tsx` — 카드 컴포넌트의 JSX 구조 일부 조정 (status badge 추가, organizer 위치 정렬)
- `components/common/item/Item.module.scss` — 색·타이포·radius·간격·hover를 DESIGN.md 토큰으로 교체
- `components/common/tag/DdayTag` — D-Day 표시 위치 조정 필요 시 함께 손봄 (status badge가 D-Day 자리를 일부 흡수할 수 있음)
- 새 SCSS 변수 / mixin 필요 시 `styles/_variables.scss` 또는 `styles/_color.scss`에 추가

### Out of scope
- `pages/events.tsx` 레이아웃, `Banner`, `Letter`, `EventFilter`, 모달, 헤더/푸터 — 모두 그대로 둠
- 데이터 모델 (`model/event.ts`), API, SWR hook 변경 없음
- 기존 SCSS 변수(`$light-primary`, `$dark-primary` 등) 제거 — 별도 정리는 차후 작업
- 다크 모드 — 현재 시스템 유지 (별도 ticket)

## 3. Current State (요약)

`components/common/item/Item.tsx`:
- `<Link>` 안에 `item__content` 그리드 — 좌측 썸네일 252×144 (4px radius) + 우측 body
- Body: organizer host (16px) + 공유/북마크 버튼 (절대 위치, top-right) + title (22px/600) + date + tags
- `@media (max-width: 1200px)`에서 vertical로 전환 — 썸네일 16:9 max-height 190px, title 18px
- 만료 상태(`isDone`) — 썸네일 어두운 오버레이 + 텍스트 톤 다운
- `EndBulletIcon`, `NewBulletIcon` flag — 썸네일 좌상단 절대 위치

기존 상태 시그널:
- `EndBulletIcon` (만료, gray)
- `NewBulletIcon` (NEW, primary blue)
- `DdayTag` (남은 일수, 별도 컴포넌트)

## 4. Target Design

### 4.1 Responsive Behavior

| Breakpoint | Layout | Variant |
|---|---|---|
| `≥1200px` (laptop+) | Horizontal row | B variant |
| `<1200px` (tablet/mobile) | Vertical KTB course-card | A variant |

`@media (max-width: 1200px)` 경계 유지 — 기존 코드와 동일.

### 4.2 Horizontal Row (Desktop, ≥1200px)

```
┌──────────────┬────────────────────────────────────────┬─────┐
│   thumb      │  host (14px hint)                       │ ⋯ ⋯ │
│   280×168    │  title (20px/700, 2-line clamp)         │ ico │
│   r=12px     │  calendar-icon · date (15px secondary)  │ ns  │
│              │  [chip] [chip] [chip]                   │     │
└──────────────┴────────────────────────────────────────┴─────┘
```

- Container: `grid-template-columns: 280px 1fr auto`, `gap: 32px`, `padding: 24px 0`, `border-bottom: 1px solid var(--gray-300, #E1E1E8)`
- Thumb: width 280px, aspect-ratio 5/3 (height 168px), `border-radius: 12px`, `overflow: hidden`. Status badge absolute top-left at `(12px, 12px)`.
- Host: 14px / 500 / `--gray-600` (#6C6E7E), margin-bottom 6px
- Title: 20px / 700 / `--gray-900` (#2B2D36), `letter-spacing: -0.012rem`, `line-height: 1.4`, 2-line clamp (replace current single-line `text-ellipsis`)
- Meta line: calendar SVG 18×18 + 15px / `--gray-700` (#525463), margin-bottom 10px
- Tag chips: bg `--gray-100` (#F0F0F5), text `--gray-800` (#3E404C), padding 4px 10px, radius 8px, 13px / 500
- Action buttons (share, bookmark): right column, top-aligned, 36×36 icon buttons, gray (`--gray-500`), hover bg `--gray-100`
- Hover: 카드 전체 background-color 변화 없음. 썸네일 image scale 1.05 (`.item__content__img__mask:hover`) — DESIGN.md의 hover signature 유지

### 4.3 Vertical KTB Card (Tablet/Mobile, <1200px)

```
┌─────────────────────────┐
│   thumb                 │
│   100% × aspect 5/3     │
│   r=12px                │
│   [badge]               │
└─────────────────────────┘
  host (13px hint)
  title (16px/700, ellipsis)
  📅 date (14px hint)
  [chip] [chip] [chip]
```

- Card container: width 100%, no border, no shadow, padding 0 (gap만 사용)
- Thumb: width 100%, aspect-ratio 5/3, radius 12px, overflow hidden. Badge absolute (12px, 12px).
- Info block: padding-top 12px
- Host: 13px / 500 / `--gray-600`, margin-bottom 4px
- Title: 16px / 700 / `--gray-900`, `letter-spacing: -0.012rem`, single-line ellipsis, margin-bottom 4px
- Period: 14px / `--gray-600` w/ calendar SVG 16×16, gap 4px, margin-bottom 10px
- Tag chips: bg `--gray-100`, text `--gray-800`, padding 2px 8px, radius 6px, 12px / 500

### 4.4 Status Badge System (NEW)

기존 `EndBulletIcon` / `NewBulletIcon` flag를 통합 status badge로 대체. 위치는 썸네일 좌상단 (12px, 12px), 형태는 pill (border-radius 9999px), 4px 10px padding, 11px / 600.

| 상태 | 트리거 | 배경 | Pulse |
|---|---|---|---|
| `live` 모집중 | `!isDone && 진행중` | `#0043ff` (Tech Blue) | `pulse-blue 2s infinite` |
| `urgent` 마감임박 | D-Day ≤ 3 && `!isDone` | `#D91C29` (Danger Red) | `pulse-danger 2s infinite` |
| `upcoming` 예정 | 미래 시작일, D-Day > 3 | `#000040` (Tech Navy) | none (plain) |
| `ended` 종료 | `isDone` | `#6C6E7E` (Hint Gray) | none |

`pulse-*` keyframe은 DESIGN.md §7 에 정의된 형태 그대로 SCSS에 포함:

```scss
@keyframes pulse-blue {
  0%   { box-shadow: 0 0 0 0 rgba(0, 67, 255, 0.55); }
  70%  { box-shadow: 0 0 0 8px rgba(0, 67, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 67, 255, 0); }
}
@keyframes pulse-danger {
  0%   { box-shadow: 0 0 0 0 rgba(217, 28, 41, 0.55); }
  70%  { box-shadow: 0 0 0 8px rgba(217, 28, 41, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 28, 41, 0); }
}
```

### 4.5 Ended (만료) 상태

- 썸네일 위 `rgba(0,0,0,0.4)` 어두운 오버레이 유지 (기존 `item__content__img__done`)
- Title 색: `--gray-600` (#6C6E7E) (기존 `var(--gray-2)` 와 비슷한 톤)
- Host 색: `--gray-500` (#8C8F9F)
- Tag chip 톤 다운: 그대로 둘 수도, opacity 0.6 줄 수도 — **결정: opacity 변경 없이 톤만 유지** (chip은 이미 회색이라 충분히 secondary)
- Status badge: `ended` variant (회색 plain)

### 4.6 D-Day 처리

기존 `DdayTag`는 title 옆에 inline으로 노출됨. 새 디자인에서는:
- **Desktop**: D-Day tag를 title 옆 inline 유지 (현재 위치 유지, 다만 색·radius 토큰 정렬)
- **Mobile**: D-Day는 status badge로 통합 — D-Day ≤ 3이면 `urgent` 뱃지 노출, `DdayTag` 렌더 생략
- `urgent` 상태에서는 D-Day 숫자를 status badge 텍스트로: `"D-2"`, `"D-1"`, `"오늘"`

## 5. Component Contract

### Item.tsx 변경 사항

```tsx
type Props = {
  data: Event;
  isEventDone: () => boolean;
  isEventNew?: () => boolean;        // NEW 플래그 — 유지하되 status badge로 흡수
  isFavorite: () => boolean;
  onClickFavorite?: any;
  childLast?: boolean;
  parentLast?: boolean;
  isLast?: boolean;
};
```

내부 새 로직:
```tsx
type EventStatus = 'live' | 'urgent' | 'upcoming' | 'ended';

function getEventStatus(data: Event, isDone: boolean): EventStatus {
  if (isDone) return 'ended';
  const daysUntil = getDaysUntil(data.start_date_time || data.end_date_time);
  if (daysUntil <= 3 && daysUntil >= 0) return 'urgent';
  if (daysUntil < 0) return 'live'; // 시작했지만 종료 전
  return 'upcoming';
}
```

`<StatusBadge status={status} dDay={dDay} />` 형태의 internal helper로 분리하거나 Item 내부 JSX로 인라인 처리. **결정: Item 내부 인라인 + scss className만 토글** (별도 컴포넌트 분리는 추후).

## 6. Files Touched

| File | Change |
|---|---|
| `components/common/item/Item.tsx` | status badge JSX 추가, `EndBulletIcon`/`NewBulletIcon` flag JSX 제거, organizer/host 위치 동일 유지, calendar 아이콘 inline SVG 추가 |
| `components/common/item/Item.module.scss` | 전체 색·radius·간격·타이포를 DESIGN.md 토큰으로 교체. `pulse-blue`/`pulse-danger` keyframe 추가. `.status-badge` 및 variant 4종 정의. 1200px 미만 vertical 카드 재작성 |
| `components/common/tag/FilterTag` (또는 `.module.scss`) | chip 스타일 정렬 — radius 8px(desktop)/6px(mobile), bg `--gray-100`, text `--gray-800`, font-weight 500 |
| `components/common/tag/DdayTag` | 색·radius·font 토큰 정렬. mobile에서는 conditional render(`status !== 'urgent'`일 때만) |
| `styles/_color.scss` 또는 `_variables.scss` | DESIGN.md 토큰을 SCSS variable로 추가 (`--gray-100` ~ `--gray-900`, `--ktb-tech-blue`, `--text-danger` 등) — `var(--*)` 직접 사용 vs SCSS 변수 둘 다 OK, 일관성을 위해 CSS custom property로 글로벌 선언 |

## 7. Edge Cases

- **organizer 없음**: 현재 `data.organizer`가 null일 가능성? — 코드 확인 후 null 가드 추가
- **tags 없음**: `data.tags` 빈 배열일 때 chip row 자리 차지 안 함 (이미 빈 배열이면 nothing 렌더링)
- **title 매우 김**: Desktop 2-line clamp, Mobile single-line ellipsis로 안전
- **시작/종료 일자 없음**: 현재 `getEventDate()` 로직 그대로 — null 케이스 대응됨
- **D-Day 계산**: 현재 `DdayTag` 내부 로직 재사용, `getDaysUntil()` 헬퍼는 `lib/utils/dateUtil`에 있을 가능성 — 확인 후 결정

## 8. Testing Plan

자동화 테스트는 없는 프로젝트로 보임 (next 12 + SCSS). 수동 검증:

- [ ] `pnpm run dev` → `http://localhost:5000/events` 에서 desktop (>1200px) horizontal row 확인
- [ ] DevTools로 viewport 1199px / 768px / 375px 각각 vertical 카드 확인
- [ ] 카드 hover 시 썸네일 scale 1.05 확인 (기존 `item__content__img__mask transition`)
- [ ] 4가지 상태 (live / urgent / upcoming / ended) 시각 확인 — 가능하면 실제 데이터 또는 fixture
- [ ] 만료 카드 (`isDone === true`) 시각 확인 — 오버레이 + 톤 다운
- [ ] 공유/북마크 버튼 클릭 동작 — 기존 핸들러 변경 없음
- [ ] D-Day 표시 위치 확인 — desktop title 옆, mobile은 urgent badge로 통합
- [ ] tag chip 클릭 → 필터 동작 (기존 동작 유지)
- [ ] `/myevent`, `/calender`, `/search` 등 `Item`을 재사용하는 다른 페이지 회귀 확인

## 9. Open Questions

- [ ] `Item` 컴포넌트가 다른 페이지(`/myevent`, `/calender`, `/search`)에서도 쓰이는지? 만약 그렇다면 prop으로 variant 분기 필요 여부 결정 — **기본 가정**: 모든 페이지에서 동일하게 적용 (단일 비주얼 시스템)
- [ ] D-Day 계산 함수 위치 확인 (`DdayTag` 내부 vs `lib/utils/dateUtil`)
- [ ] `data.organizer` null 가능성

위 3가지는 구현 단계 첫 번째 task로 코드 읽으면서 확정.

## 10. Non-Goals (다시 한 번 강조)

- 페이지 레이아웃, banner, filter UI, modal, header/footer — **건드리지 않음**
- 다크 모드 — 현재 동작 유지 (확장은 차후)
- API / 데이터 모델 / SWR — 변경 없음
- SCSS 변수 시스템 전면 재정비 — 이 PR에서는 token 추가만, 기존 변수 제거 없음
