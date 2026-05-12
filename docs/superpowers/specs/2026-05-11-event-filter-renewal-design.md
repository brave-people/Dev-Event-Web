# Event Filter (ScheduledEventList 컨테이너) Renewal — Design Spec

**Date:** 2026-05-11
**Scope:** `/events` 페이지 ScheduledEventList 컨테이너 — 페이지 타이틀, 카테고리 칩, 검색바, 드롭다운 필터, 월별 페이지네이션, 등록 요청 버튼
**Source of truth:** 프로젝트 루트의 `DESIGN.md` (KTB 비주얼 시스템)

## Goal

`/events` 페이지의 필터/네비게이션 영역(EventFilter + 하위 컴포넌트)을 DESIGN.md 토큰 체계로 리뉴얼한다. legacy 토큰(`--gray-N`, `--primary`, `--background-N`)을 `--vapor-gray-*` / `--ktb-tech-*` 로 교체하고, 매직값(`2.9881px` radius, `1.5px` border, `rgba(170,184,255,1)` hover) 을 DESIGN.md 표준값으로 정규화한다.

## Out of Scope

- 필터 모달 3종 (`FilterSearchModal`, `FilterTagModal`, `FilterDateModal`) — 모달 묶음에서 별도 처리
- React 동작 로직 (state, context, URL 파싱) — 변경 없음
- `JobGroupTag.tsx` / `BasicDropdown.tsx` / `BasicInput.tsx` 등 컴포넌트 prop API — 변경 없음
- ItemList / 카드: 이전 작업으로 완료
- Dark theme 별도 정의 — 기존 `[data-theme]` 매핑 활용

## Architecture

영향 받는 SCSS 파일 (JSX 변경 없음):

- `components/features/filters/EventFilter.module.scss` — 외곽 + 페이지 타이틀
- `components/features/register/Register.module.scss` — 등록 버튼 hover shadow
- `components/common/buttons/FillButton.module.scss` — primary/gray/white 색상 토큰
- `components/features/filters/ByJobGroup/FilterByJobGroup.module.scss` — 변경 없음 (margin only)
- `components/common/tag/JobGroupTag.module.scss` — 카테고리 칩 토큰 + active state
- `components/features/filters/searchEvent/SearchEvent.module.scss` — 변경 없음
- `components/common/input/BasicInput.module.scss` — 검색 input radius/border/color
- `components/common/dropdown/BasicDropdown.module.scss` — 드롭다운 radius/border/color/hover
- `components/common/date/DateBoard.module.scss` — 페이지네이션 컨테이너 토큰
- `components/common/date/DateElement.module.scss` — 페이지네이션 요소 토큰

## Decisions (사용자 확정)

1. **변경 범위**: 토큰 cleanup + 형태 정리 (radius 2.9881 → 8, border 1.5 → 1, hover 매직값 제거)
2. **페이지 타이틀**: 현재 40px 크기 유지 (디자인 강조). 토큰만 정리 + letter-spacing
3. **Active 칩 / Selected 드롭다운 배경**: `rgba(0, 67, 255, 0.08)` — ktb-tech-blue 의 8% tint

---

## EventFilter (`EventFilter.module.scss`)

### `.block__desc` (페이지 타이틀 "전체 행사")

- `font-size: 40px;` — 유지
- `font-weight: 700;` — 유지
- `line-height: 3rem;` — 유지
- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`
- 추가: `letter-spacing: -0.012rem;`

### 반응형 페이지 타이틀

- 1075/950/800/700/tablet/mobile 각 단계 폰트 사이즈 유지 (2.1/2.0/1.8/1.6/1.6/1.6rem)

### Toggle 버튼 (`.filter__group__toggle`) hover bg

- `background-color: var(--gray-5);` (3 군데 — laptop 700, tablet, mobile) → `background-color: var(--vapor-gray-100);`

---

## FillButton (`components/common/buttons/FillButton.module.scss`)

### `&.color`

- `&--primary { background-color: var(--primary); }` → `background-color: var(--ktb-tech-blue);`
- `&--gray { background-color: var(--gray-1); }` → `background-color: var(--vapor-gray-900);`
- `&--white { background-color: var(--background-1); color: var(--primary); }` → `background-color: var(--vapor-gray-000); color: var(--ktb-tech-blue);`

### `.button` 기본

- `color: var(--background-1);` → `color: var(--vapor-gray-000);`
- `background-color: var(--gray-1);` → `background-color: var(--vapor-gray-900);`

---

## Register (`components/features/register/Register.module.scss`)

### `.register`

- hover `box-shadow: 0 4px 12px rgba(44, 76, 239, 0.2);` → `0 4px 12px rgba(0, 67, 255, 0.18);`
- `translateY(-2px)` 호버 유지 (CTA 강조)
- 기존 mobile/tablet `display: none;` 유지

---

## JobGroupTag (`components/common/tag/JobGroupTag.module.scss`)

### Base `.tag`

- `color: var(--gray-1);` → `color: var(--vapor-gray-800);`
- `border-color: var(--gray-4);` → `border-color: var(--vapor-gray-300);`
- 그 외 (border 1px, radius 25/24/22/14, padding 16, height 36/34/32) — 유지

### `.tag--light` hover

- `border-color: var(--primary);` → `border-color: var(--ktb-tech-blue);`
- `color: var(--primary);` → `color: var(--ktb-tech-blue);`
- `background-color: rgba(237, 239, 255, 1);` → `background-color: rgba(0, 67, 255, 0.08);`

### `.tag--dark` hover

- `border-color: var(--primary);` → `border-color: var(--ktb-tech-blue);`
- `color: var(--primary);` → `color: var(--ktb-tech-blue);`
- `background-color: rgba(34, 35, 38, 1);` → `background-color: var(--vapor-gray-950);`

### `.checked--light` (active)

- `border-color: rgba(44, 76, 239, 1);` → `border-color: var(--ktb-tech-blue);`
- `color: rgba(44, 76, 239, 1);` → `color: var(--ktb-tech-blue);`
- `background-color: #edefff;` → `background-color: rgba(0, 67, 255, 0.08);`

### `.checked--dark` (active dark)

- `border-color: rgba(79, 108, 255, 1);` → `border-color: var(--ktb-tech-blue);`
- `color: rgba(79, 108, 255, 1);` → `color: var(--ktb-tech-blue);`
- `background-color: rgba(34, 35, 38, 1);` → `background-color: var(--vapor-gray-950);`

---

## BasicInput (`components/common/input/BasicInput.module.scss`)

### `.container__input`

- `background-color: var(--background-1);` → `var(--vapor-gray-000);`
- `border: 1.5px solid;` → `border: 1px solid;`
- `border-color: var(--gray-4);` → `border-color: var(--vapor-gray-300);`
- `border-radius: 2.9881px;` → `border-radius: 8px;`
- hover `border-color: rgba(170, 184, 255, 1);` → `border-color: var(--vapor-gray-400);`
- focus `border-color: var(--primary);` → `border-color: var(--ktb-tech-blue);`
- focus shadow 추가 (선택적): focus 시 `box-shadow: 0 0 0 3px rgba(0, 67, 255, 0.12);` (DESIGN.md 인풋 focus ring 패턴) — 단, 기존에 없었으면 추가하지 않음. 본 spec에서는 **추가하지 않는다** (시각 변화 최소).

### `input[type='text']`

- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`

### `input::-webkit-input-placeholder`

- `color: var(--gray-3);` → `color: var(--vapor-gray-500);`
- `font-weight: bold;` + `font-weight: 500;` 중복 → `font-weight: 500;` 한 줄로 정리

---

## BasicDropdown (`components/common/dropdown/BasicDropdown.module.scss`)

### `.dropdown__header`

- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`
- `background-color: var(--background-1);` → `var(--vapor-gray-000);`
- `border: 1.5px solid;` → `border: 1px solid;`
- `border-color: var(--gray-4);` → `border-color: var(--vapor-gray-300);`
- `border-radius: 2.9881px;` → `border-radius: 8px;`
- hover `border-color: rgba(170, 184, 255, 1);` → `border-color: var(--vapor-gray-400);`

### `.dropdown__list`

- `background-color: var(--background-1);` → `var(--vapor-gray-000);`
- `border-radius: 2.9881px;` → `border-radius: 8px;`
- `border: 1.5px solid;` → `border: 1px solid;`
- `border-color: var(--gray-4);` → `border-color: var(--vapor-gray-300);`
- 추가: `box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08);` (드롭다운 깊이감)

### `&__element`

- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`
- hover `background-color: var(--background-2);` → `background-color: var(--vapor-gray-050);`

### `.selected__light`

- `color: var(--primary);` → `color: var(--ktb-tech-blue);`
- `background-color: rgba(237, 239, 255, 1);` → `background-color: rgba(0, 67, 255, 0.08);`

### `.selected__dark`

- `color: var(--primary);` → `color: var(--ktb-tech-blue);`
- `background-color: rgba(34, 35, 38, 1);` → `background-color: var(--vapor-gray-950);`

### `.dropdown__header__focus`

- `border-color: var(--primary);` → `border-color: var(--ktb-tech-blue);`

### Scrollbar

- `&::-webkit-scrollbar-thumb { background-color: #c4c4c4; }` → `background-color: var(--vapor-gray-400);`

---

## DateBoard (`components/common/date/DateBoard.module.scss`)

### `.container`

- `background-color: var(--background-1);` → `var(--vapor-gray-000);`
- `border: 1.5px solid;` → `border: 1px solid;`
- `border-color: var(--gray-4);` → `border-color: var(--vapor-gray-300);`
- `border-radius: 2.9881px;` → `border-radius: 8px;`
- hover `border-color: rgba(170, 184, 255, 1);` → `border-color: var(--vapor-gray-400);`

### `.key--active`

- `&:hover { background-color: var(--background-2); }` → `var(--vapor-gray-050);`

### `.key--left` / `.key--right` border-radius

- 각각 `2.9881px 0 0 2.9881px` / `0 2.9881px 2.9881px 0` → `8px 0 0 8px` / `0 8px 8px 0`

### `.dropdown__header` (내부)

- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`

### `.dropdown__list`

- `background-color: var(--background-1);` → `var(--vapor-gray-000);`
- `border-radius: 2.9881px;` → `8px;`
- `border: 1.5px solid;` → `1px solid;`
- `border-color: var(--gray-4);` → `var(--vapor-gray-300);`
- 추가: `box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08);`

### `&__year`

- `color: var(--gray-1);` → `color: var(--vapor-gray-900);`

### `.container__focus`

- `border-color: var(--primary);` → `var(--ktb-tech-blue);`

---

## DateElement (`components/common/date/DateElement.module.scss`)

(파일 확인 필요. 동일 패턴으로 토큰 매핑)

- `var(--gray-1)` → `var(--vapor-gray-900)`
- `var(--gray-3)` → `var(--vapor-gray-500)`
- `var(--gray-4)` → `var(--vapor-gray-300)`
- `var(--primary)` → `var(--ktb-tech-blue)`
- `var(--background-1)` → `var(--vapor-gray-000)`
- `var(--background-2)` → `var(--vapor-gray-050)`
- `2.9881px` → `8px`
- `1.5px solid` → `1px solid`
- `rgba(170, 184, 255, 1)` → `var(--vapor-gray-400)`

(상세 매핑은 구현 단계에서 파일 읽고 확인)

---

## 검증 기준

- [ ] "전체 행사" 타이틀이 vapor-gray-900으로 렌더링
- [ ] 카테고리 칩 hover/active 시 ktb-tech-blue 텍스트 + 8% tint 배경
- [ ] 검색바 focus 시 ktb-tech-blue 1px border (1.5 → 1px 확인)
- [ ] 드롭다운 3종: 닫힘 상태 1px gray-300, 열림 상태 ktb-tech-blue focus border, 항목 hover gray-050
- [ ] 월별 페이지네이션: 8px radius, 1px border, ktb-tech-blue focus
- [ ] 등록 요청 버튼: ktb-tech-blue 배경, hover translateY + 톤다운된 그림자
- [ ] 모든 `2.9881px` 제거됨 (grep 검증)
- [ ] 모든 `1.5px solid` 제거됨 (1px로 변환)
- [ ] `--primary` / `--gray-1~5` / `--background-1~2` 잔여 없음 (단 컴포넌트가 변경 범위 밖이면 예외)
- [ ] `pnpm lint` / `pnpm build` 통과
