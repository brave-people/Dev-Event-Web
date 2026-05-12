# Header / Footer / Banner Renewal — Design Spec

**Date:** 2026-05-11
**Scope:** Global chrome (Header + Footer) + `/events` 최상단 Banner
**Source of truth:** 프로젝트 루트의 `DESIGN.md` (KTB 비주얼 시스템)

## Goal

전역 chrome(Header / Footer)과 `/events` 페이지 최상단 Banner를 DESIGN.md 토큰·타이포 체계로 정렬한다. 구조는 그대로 두고 토큰 cleanup + 사이즈 다이어트(banner) + Profile dropdown 미니 정리.

## Out of Scope

- HeaderTab (현재 본문 코드가 모두 주석 — 변경하지 않음)
- NoticeModal (모달 묶음에서 별도 처리)
- LoginModal (사용자 지시: 모달 묶음 전체 제외)
- Logo SVG 자체 (외부 컴포넌트, 재사용)
- 다크 테마 별도 정의 — 기존 `[data-theme]` 매핑 활용

## Architecture

영향 받는 파일:

- `components/layout/header/Header.module.scss` — 토큰·dropdown cleanup
- `components/common/banner/banner.module.scss` — 타이포·높이 다이어트
- `components/layout/footer/Footer.module.scss` — 토큰·max-width 정렬
- `components/layout/header/HeaderTab.module.scss` — 토큰 정리 (구조 그대로)
- 토큰 소스: `styles/_color.scss`, `styles/Theme.scss` (이전 작업으로 정비됨, 변경 없음)

JSX 변경 없음 (모두 SCSS 토큰/값 교체).

## Decisions (사용자 확정)

1. **Banner**: 토큰 정리 + 사이즈 다이어트 (display 스케일 38~48px로 축소). CTA·그라데이션 추가 없음
2. **Header dropdown**: 토큰 + 미니 정리 (caret 제거, radius 12, hover gray-100, item 고정 높이 제거)
3. **Footer**: 토큰 정리만, max-width 1200으로 정렬

---

## Header (`components/layout/header/Header.module.scss`)

### Outer `.header`

- `position: fixed; top: 0; left: 0; width: 100%; z-index: 99;` — 유지
- `min-height: 3.5rem;` — 유지 (56px)
- `background-color: hsla(0, 0%, 100%, .88);` → 그대로 (frosted 효과 유지)
- `backdrop-filter: saturate(150%) blur(32px);` — 유지
- `border-bottom: 1px solid $light-gray-4;` → `border-bottom: 1px solid var(--vapor-gray-300);`

### `.header__inner` / `.header__inner__nav` / `.header__logo` / `.header__tab`

- 구조 변경 없음
- Token: 없음 (색상이 직접 적용된 곳 없음)

### `.header__buttons`

- `.toggle__container:hover { background-color: var(--gray-5); }` → `background-color: var(--vapor-gray-100);`

### `.profile` 블록

- `.profile-button svg path { fill: var(--gray-2); }` → `fill: var(--vapor-gray-500);`

### `.profile-menu` (Dropdown)

- **caret 제거**: `.profile-menu::after { ... }` 블록 전체 삭제 + `@keyframes appearIn` 블록 유지(자연스러운 height 등장 애니메이션)
- `border-radius: 10px;` → `border-radius: 12px;`
- `width: 136px; height: 135px;` → `width: 160px;` (height auto — 컨텐츠 길이 따라)
- `top: 42px; margin-left: -102px;` → `top: 44px; margin-left: -128px;` (160px 너비에 맞춰 우측 정렬 유지)
- `background-color: #fff;` → `background-color: var(--vapor-gray-000);`
- `box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);` → `box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08), 0 0 0 1px var(--vapor-gray-300);`
- `&__item` 정리:
  - `padding: 0.5rem 1.813rem 0.5rem 1.813rem;` → `padding: 10px 16px;`
  - `height: 45px;` → 제거 (auto)
  - `background-color: #fff;` → `background-color: transparent;`
  - `font-size: 0.875rem; color: #757575;` → `font-size: 14px; color: var(--vapor-gray-800);`
  - `&:hover { background: #ebebeb; }` → `&:hover { background-color: var(--vapor-gray-100); }`
  - `&:focus { background-color: #ebebeb; }` → `&:focus-visible { background-color: var(--vapor-gray-100); }`
  - first-child/last-child border-radius 10px → 12px (메뉴 radius와 일치)
- `@keyframes appearIn` final height 135 → `auto` 불가하므로 keyframes 자체 제거하고 단순 fade-in으로 교체:
  ```scss
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ```

### Tablet/Mobile

- `@include tablet { .header__inner { padding: 0 $tablet_padding; width: 100%; } }` — 유지
- `@include mobile { .header__inner { padding: 0 $mobile_padding; width: 100%; } }` — 유지

---

## HeaderTab (`components/layout/header/HeaderTab.module.scss`)

### `.tab .tab-text`

- `color: var(--gray-2);` → `color: var(--vapor-gray-600);`
- `&.active { color: #313234; }` → `&.active { color: var(--vapor-gray-900); }`

### `.new-badge`

- `background-color: #3182f6;` → `background-color: var(--ktb-tech-blue);`
- 그 외 유지 (현재 사용되지 않지만 향후 활용 대비)

---

## Banner (`components/common/banner/banner.module.scss`)

### `.banner` 외곽

- `position: relative; width: 100%;` — 유지
- 높이 (사이즈 다이어트):
  - 기본 (`min-width >= 1200`): `height: 28rem;` (was 30rem)
  - `max-width: 1075px`: `height: 24rem;` (was 28rem)
  - `max-width: 800px`: `height: 22rem;` (was 26rem)
  - `@include tablet` (≤960): `height: 22rem;` (was 24rem)
  - `max-width: 500px`: `height: 20rem;` (was 22rem)
  - `@include mobile` (≤480): `height: 18rem;` 유지
- `padding: 0 20px;` — 유지
- `margin-top: $header_height` — 유지

### `.banner__title`

- Desktop: `font-size: 3rem; line-height: 1.2;` (was 3.8rem / 5.1rem)
- `font-weight: 800;` (was 700) — display 스케일은 800으로 강조
- `letter-spacing: -0.012rem;` (was 0em)
- `color: #ffffff;` — 유지
- Responsive:
  - `max-width: 1075px`: `font-size: 2.75rem;`
  - `max-width: 800px`: `font-size: 2.5rem; line-height: 1.2;` (was 3.4rem / 4.5rem)
  - `@include tablet`: `font-size: 2.125rem; line-height: 1.2;`
  - `max-width: 500px`: `font-size: 1.875rem; line-height: 1.2;` (was 2.3rem)
  - `max-width: 400px`: `font-size: 1.75rem;`
  - `@include mobile`: `font-size: 1.75rem; line-height: 1.2;` (was 2rem / 2.5rem)

### `.banner__desc`

- `font-size: 1.125rem; line-height: 1.5;` (was 1.23rem / 1.813rem)
- `font-weight: 500;` (was 400)
- `color: rgba(255, 255, 255, 0.85);` (was `#ffffff` — 약간 톤다운)
- `padding-top: 1.5rem;` (was 1.938rem)
- Responsive:
  - `max-width: 800px`: `font-size: 1rem;` — 유지
  - `@include tablet`: `font-size: 1rem;` — 유지
  - `max-width: 400px`: `font-size: 0.9rem;` — 유지
  - `@include mobile`: `font-size: 0.9rem;` — 유지

### `.banner__video`

- 위치/사이즈/object-fit — 그대로

### `.notice--true` / `.notice--false`

- 그대로 유지 (`margin-top: $header_height` / `$header_height + 36px`)

---

## Footer (`components/layout/footer/Footer.module.scss`)

### `.footer` 컨테이너

- `max-width: 1104px;` → `max-width: 1200px;` (DESIGN.md 컨테이너 규격)
- `height: 200px;` → `min-height: 200px;` (텍스트 길이 따라 자동 확장 허용)
- `padding: 0 32px;` 추가 (데스크탑에서 좌우 여백)
- `background-color: var(--background-1);` → `background-color: var(--vapor-gray-000);`

### `&__column`

- `display: flex; flex-direction: column;` — 유지
- `.footer__desc`:
  - `color: var(--gray-2);` → `color: var(--vapor-gray-700);`
  - `font-size: 16px;` → `font-size: 14px;`
  - `font-weight: 500;`
  - `margin-top: 1rem;` — 유지
- `.footer__copyright`:
  - `color: var(--gray-3);` → `color: var(--vapor-gray-500);`
  - `font-size: 16px;` → `font-size: 14px;`
  - `font-weight: 500;`
  - `margin-top: 3rem;` — 유지
  - `a` 내부 링크: `color: var(--ktb-tech-blue); text-decoration: none;` hover `text-decoration: underline; color: var(--ktb-tech-navy-hover);`

### `&__row` (아이콘 영역)

- `gap: 12px;` 추가 (현재 인접 요소 간 간격 0)
- 위치 유지 (`position: absolute; bottom: 32px; right: 0;`)
- `.github__icon` (외부 컴포넌트 className): `color: var(--vapor-gray-500);` `&:hover { color: var(--ktb-tech-blue); }` — 컴포넌트가 currentColor 사용 시 적용. 안 될 경우 SCSS는 그대로 두고 JSX 미수정.

### Tablet/Mobile

- `@include tablet`:
  - `padding: 32px;` (기존 `32px $tablet_padding` 단순화)
  - `max-width: 1271px;` → 제거 (전역 max-width 1200 적용)
  - display block — 유지
  - `&__desc`, `&__copyright`: `font-size: 13px; font-weight: 500;`
- `@include mobile`:
  - `padding: 32px 16px;` (was `32px 20px`)
  - `&__desc`, `&__copyright`: `font-size: 13px;`
  - `&__row { right: 16px; bottom: 0; }`

---

## 검증 기준

- [ ] Header가 모든 페이지 상단에 frosted 효과로 고정됨
- [ ] Profile 클릭 시 dropdown이 caret 없이 자연스럽게 fade-in
- [ ] dropdown 메뉴 hover 시 `var(--vapor-gray-100)` 적용
- [ ] Banner 타이틀이 데스크탑에서 48px (3rem) 으로 보이고 letter-spacing 적용됨
- [ ] Banner desc가 약간 톤다운된 흰색(85% opacity)
- [ ] Footer max-width 1200, github/whale 아이콘이 우측에 자연스럽게 정렬
- [ ] Footer 링크가 `--ktb-tech-blue`로 렌더링
- [ ] 다크 테마 토글 시 모든 영역이 자동으로 반전 (기존 매핑 활용)
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 성공
- [ ] 잔여 하드코딩 hex: 영상 위 흰색 `#ffffff`만 허용. `#3182f6`, `#313234`, `#757575`, `#ebebeb`, `$light-gray-4` 모두 제거됨
