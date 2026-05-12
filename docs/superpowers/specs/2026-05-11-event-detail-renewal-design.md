# Event Detail Page Renewal — Design Spec

**Date:** 2026-05-11
**Scope:** `/event/detail/[eventId]` 페이지 비주얼 리뉴얼
**Source of truth:** 프로젝트 루트의 `DESIGN.md` (KTB 비주얼 시스템)

## Goal

`/event/detail/[eventId]` 페이지를 `DESIGN.md` (KTB / Vapor 토큰 시스템) 기준으로 리뉴얼한다. 행사 목록(`/events`) 카드에서 적용한 토큰·타이포·인터랙션과 시각적으로 연속된 상세 페이지를 만든다. React 구조는 유지하고 SCSS와 일부 JSX 마이크로 변경만 한다.

## Out of Scope

- `Letter` (뉴스레터 신청) 컴포넌트 리스타일링
- 마크다운 파서/렌더링 로직 변경
- API/데이터 모델 변경
- 다크 테마 별도 정의 (기존 `Theme.scss`의 `[data-theme]` 매핑 그대로 사용)

## Architecture

영향 받는 파일:

- `pages/event/detail/[eventId].tsx` — JSX 마이크로 변경 (DdayTag 추가, 아이콘 컬러 토큰화, 메타라벨 prefix 정리)
- `styles/EventDetail.module.scss` — 전면 리라이트
- `components/common/tag/DdayTag.tsx` / `DdayTag.module.scss` — 재사용 (이미 DESIGN.md 적용 완료)
- 토큰: `styles/_color.scss` + `styles/Theme.scss` (이전 작업으로 이미 정비됨, 추가 작업 불필요)

## Decisions (사용자 확정)

1. **Hero 레이아웃**: 하이브리드 — 5:3 비율 썸네일 유지하면서 DESIGN.md 토큰 적용
2. **본문(마크다운) 영역**: Flat (흰 캔버스 + 얇은 divider) — `common-card` 표면 미사용
3. **CTA 버튼**: 모든 viewport에서 in-flow (모바일 sticky bar 없음)

## Hero — Desktop (≥1200px)

```
┌─────────────────┬──────────────────────────────────────────┐
│                 │  [share][bookmark]      ← absolute top-R │
│   THUMB         │  organizer text                          │
│   400px × 5:3   │  Title (32px / 700 / -0.012rem)          │
│   radius 12     │  일시  26. 6. 14(토) 10:00~18:00          │
│   [D-3 badge]   │  [tag] [tag] [tag]                       │
│                 │  [참여하기 ─ btn-ktb]                     │
└─────────────────┴──────────────────────────────────────────┘
container: max-width 1200, mx auto, padding 64px 32px
columns: 400px 1fr, gap 32px
```

**Thumb:**
- `width: 400px; aspect-ratio: 5 / 3; flex-shrink: 0;`
- `border-radius: 12px;` (`--border-radius-400` 등가)
- `overflow: hidden; position: relative;`
- 이미지: `Image` `layout="fill"` `objectFit="cover"`
- 종료된 행사: `position: absolute inset 0; background: rgba(0,0,0,0.4);` 오버레이
- 종료 안 된 행사: `DdayTag` (`startDateTime` / `endDateTime`) 좌상단 absolute (top 12, left 12, z-index 2)

**Info column:**
- `flex: 1; display: flex; flex-direction: column; gap: 16px;`
- `position: relative; padding-right: 88px;` (action 버튼 자리)

**Action buttons (share / bookmark):**
- `position: absolute; top: 0; right: 0; display: flex; gap: 4px;`
- 각 버튼 36×36, radius 8, background transparent
- hover: `background: var(--vapor-gray-100);`
- 아이콘 컬러: `var(--vapor-gray-500)` (기본), bookmark 활성 시 `var(--ktb-tech-blue)`

**Organizer text:**
- `font-size: 14px; font-weight: 500; color: var(--vapor-gray-600);`

**Title (h1):**
- `font-size: 32px; font-weight: 700; line-height: 1.3; letter-spacing: -0.012rem; color: var(--vapor-gray-900); margin: 0; word-break: keep-all;`

**Meta (일시):**
- 부모 `display: flex; align-items: baseline; gap: 8px; font-size: 14px;`
- `.meta-label`: `color: var(--vapor-gray-500); font-weight: 500; flex-shrink: 0;`
- `.meta-value`: `color: var(--vapor-gray-700); font-weight: 500;`

**Tags:**
- `display: flex; flex-wrap: wrap; gap: 6px;`
- `event-tag` 클래스를 `FilterTag` 컴포넌트 사용으로 변경 (이미 DESIGN.md 적용된 chip — gray-100 bg, gray-800 text, radius 8, 13px)

**CTA (`.apply-btn`):**
- `background: var(--ktb-tech-blue); color: #fff;`
- `padding: 12px 24px; border-radius: 12px;`
- `font-size: 16px; font-weight: 700; letter-spacing: -0.012rem;`
- `align-self: flex-start;` (콘텐츠 너비)
- `min-height: 48px; display: inline-flex; align-items: center;`
- hover: `background: var(--ktb-tech-navy-hover);` (`#0238D1`)
- active: `transform: translateY(0)` (현재의 1px 점프 제거)

## Hero — Tablet/Mobile (≤1199px)

- 컨테이너: `flex-direction: column; padding: 32px 32px;` → ≤600 `padding: 24px 16px;`
- Thumb: `width: 100%; aspect-ratio: 5 / 3;`
- Info: 썸네일 아래, `padding-right: 0;` (action 버튼이 썸네일 위로 이동)
- Action 버튼: 썸네일 영역에 absolute top 12 right 12, `background: rgba(255,255,255,0.85); backdrop-filter: blur(4px);` 32×32
- Title: 24px (≤1199) → 20px (≤600)
- CTA: `width: 100%;` full-width 48px

## Content 영역 (마크다운)

**Container:**
- `max-width: 1200px; margin: 0 auto; padding: 0 32px 40px;` (desktop)
- ≤600: `padding: 0 16px 40px;`
- ≤320: `padding: 0 16px 32px; gap: 24px;`

**Top divider:**
- Hero와 content 사이 `border-top: 1px solid var(--vapor-gray-300);` 단일선
- divider 자체에는 외부 margin/padding 없음, container의 padding-top 24px

**Typography (DESIGN.md §3 매핑):**

| Element | Size | Weight | Color | Notes |
|---------|------|--------|-------|-------|
| h1 | 32px | 700 | gray-900 | margin 32 0 16, letter-spacing -0.012rem |
| h2 | 24px | 700 | gray-900 | 동일 |
| h3 | 20px | 700 | gray-900 | 동일 |
| h4 | 18px | 700 | gray-900 | 동일 |
| h5 | 16px | 700 | gray-900 | 동일 |
| h6 | 14px | 700 | gray-900 | 동일 |
| p | 16px | 400 | gray-900 | line-height 1.5, margin 0 0 16 |
| li | 16px | 400 | gray-900 | line-height 1.6, margin 8 0 |
| strong | inherit | 700 | gray-900 | — |
| em | inherit | inherit | inherit | font-style italic |

≤320: 각 H 단계 -2~-4px, p/li 15px.

**Code / Pre:**
- 인라인 `code`: `background: var(--vapor-gray-100); padding: 2px 6px; border-radius: 6px;` mono `font-size: 14px; color: var(--vapor-text-danger);`
- `pre`: `background: var(--vapor-gray-100); padding: 16px; border-radius: 12px; overflow-x: auto;` 내부 code는 색상 reset

**Blockquote:**
- `border-left: 4px solid var(--ktb-tech-blue); background: var(--vapor-gray-050); padding: 16px 20px; margin: 24px 0; color: var(--vapor-gray-900);`

**Hr:**
- `border-top: 1px solid var(--vapor-gray-300); margin: 32px 0;`

**Link:**
- `color: var(--ktb-tech-blue);` hover `color: var(--ktb-tech-navy-hover); text-decoration: underline;`

**Image:**
- `max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0;` (border 제거)

**Table:**
- `border-collapse: collapse; width: 100%;`
- th/td: `padding: 12px; border: 1px solid var(--vapor-gray-300);`
- th: `background: var(--vapor-gray-100); font-weight: 700; color: var(--vapor-gray-900);`
- `tr:hover`: `background: var(--vapor-gray-050);`

## 빈 상태 (description 없음)

- 외부: `display: flex; justify-content: center; padding: 24px 0;`
- 내부 카드: `background: var(--vapor-gray-050); border-radius: 24px; padding: 40px 20px; max-width: 480px;`
- 메시지 1번째 줄: weight 700 16px gray-900
- 메시지 2번째 줄: weight 500 15px gray-600 (`margin-top: 8px`)

## JSX 변경 (최소)

`pages/event/detail/[eventId].tsx`:
1. 썸네일 컨테이너 안에 `DdayTag` 마운트 (행사 종료 안 됐을 때)
2. 종료 상태 오버레이 (`event-detail__image__done`) 마운트 (행사 종료됐을 때)
3. `ShareIcon` / `BookmarkIcon` 컬러 prop: `var(--gray-2)` → `var(--vapor-gray-500)`, 활성 bookmark `#007AFF` → `var(--ktb-tech-blue)`
4. 태그 렌더링: `<span className={cx('event-tag')}>` → `<FilterTag label={tag.tag_name} size="regular" type="location" />`
5. 종료 판정 헬퍼 추가: `isEventDone()` — 기존 Item.tsx 패턴 참조
6. 메타라벨 prefix (`일시`) 유지 — 마크업 변경 없음

## Token Cleanup

`EventDetail.module.scss`에서 다음 하드코딩 제거:

| Before | After |
|--------|-------|
| `var(--text-1)` | `var(--vapor-gray-900)` |
| `var(--gray-2)` | `var(--vapor-gray-700)` (meta), `var(--vapor-gray-500)` (icon), `var(--vapor-gray-600)` (placeholder) — 맥락별 |
| `var(--background-1)` | `var(--vapor-gray-000)` |
| `#2c4cef` / `#1e3bcf` | `var(--ktb-tech-blue)` / `var(--ktb-tech-navy-hover)` |
| `#ebebeb` | `var(--vapor-gray-300)` (border) |
| `#e1e2e6` | `var(--vapor-gray-300)` |
| `#f5f5f5` | `var(--vapor-gray-100)` |
| `#f5f7ff` | `var(--vapor-gray-050)` |
| `#d3d4d8` | `var(--vapor-gray-300)` |
| `#f9f9f9` | `var(--vapor-gray-050)` |
| `#e53e3e` | `var(--vapor-text-danger)` |

## 검증 기준

- [ ] Hero가 ≥1200, 1199~601, ≤600, ≤320 각 브레이크포인트에서 깨지지 않음
- [ ] 종료된 행사: 썸네일 dim 오버레이, DdayTag 미표시
- [ ] 진행 중 / D-day 행사: DdayTag pulse 애니메이션 정상
- [ ] 마크다운 본문이 흰 캔버스 위에 자연스럽게 렌더링됨
- [ ] 빈 상태 메시지가 회색 카드로 표시됨
- [ ] CTA hover: 색상 변화만 (transform translateY 제거)
- [ ] Share / bookmark 버튼: 모바일에서 썸네일 위 backdrop-blur, 데스크탑에서 info 우상단
- [ ] 모든 색상값이 토큰 (`--vapor-*`, `--ktb-*`) 경유
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 성공
