# 리디자인 1단계 — 공통 틀 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 화면이 함께 쓰는 틀(색 변수, 글꼴, 헤더, 소식 받기·푸터, 공지 띠, 안내)을 정해진 목업 모양으로 바꾼다.

**Architecture:** `styles/Theme.scss`에 `--de-*` 색 변수를 밝은·어두운 화면 값으로 추가하고, 틀을 이루는 부품(Header, Footer, NoticeModal, ToastStack)의 스타일과 마크업을 새 변수로 다시 쓴다. 화면마다 따로 넣던 소식 받기(Letter, SocialBanner)는 `Layout` 안의 `Subscribe` 하나로 모은다. 헤더를 화면 고정에서 풀기 때문에, 헤더 높이를 보정하던 여백을 함께 걷어 낸다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / jest (ts-jest)

**Spec:** `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/index.html` (설명), `detail-design/app.html` (움직이는 목업). 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음.

## Global Constraints

- 기능·주소·API 경로·쿠키 이름은 지금 그대로. 공지 쿠키 `dev-event-notice`(90일), 테마 저장 키 `dev-event:theme`.
- 새로 쓰는 스타일의 색은 `--de-*` 변수만. 고정 색 값은 이 계획에 적힌 것(홀로그램 위 글자 `#15171c` 등)만 허용.
- 크기는 px. (`html { font-size: 14px }`라 rem을 쓰면 목업과 어긋남)
- 내용 최대 폭 1120px, 좌우 여백 20px(360px 이하 16px). PC·모바일 전환 폭 860px.
- 헤더 높이 64px(860px 이하 56px), 화면에 고정하지 않음.
- SCSS에서 공용 파일을 불러올 때는 전체 파일명과 물결표: `@import '~styles/_mixin.scss';`
- import는 프로젝트 루트 기준 절대 경로(`components/...`, `lib/...`).
- `prefers-reduced-motion: reduce`에서는 이 단계의 모든 애니메이션을 끈다.
- 문구는 이 계획에 적힌 그대로(해요체). 건수 요약 문구를 새로 만들지 않는다.
- 소개 화면(`pages/about.tsx`, `styles/Brand.module.scss`)은 건드리지 않는다.
- `pnpm lint`는 쓰지 않는다(설정을 묻는 화면만 뜨고 검사가 돌지 않음). 바꾼 파일만 `npx eslint`로 본다.

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **공지를 닫아 둔 사용자가 다시 들어올 때** — 홀로그램 띠가 잠깐이라도 보였다 사라지면 안 된다. (작업 3)
2. **어두운 화면 사용자의 첫 화면** — 테마 버튼 아이콘이 밝은 화면용으로 먼저 그려졌다가 바뀌면 안 된다. (작업 4)
3. **로그인하지 않고 "관심 행사"를 누를 때** — `/events`로 튕기지 않고 로그인 창이 떠야 한다. (작업 4)
4. **390px 화면에서 긴 안내 문구** — 화면 밖으로 넘치지 않고 말줄임 된다. (작업 2)
5. **글꼴 CDN이 막힌 환경** — 시스템 글꼴로 보이되 헤더·푸터 배치가 깨지지 않는다. (작업 1)

---

## File Structure

**새로 만드는 파일**
- `lib/links.ts` — 바깥 주소 상수 한 곳
- `styles/__tests__/deTokens.test.ts` — 색 변수가 두 화면 모드에 빠짐없이 있는지 검사
- `components/layout/footer/Subscribe.tsx`, `Subscribe.module.scss` — 소식 받기(받는 방법 고르기)

**고치는 파일**
- `styles/Theme.scss`, `styles/_variables.scss`, `styles/_mixin.scss`, `styles/globals.scss`, `pages/_document.tsx`
- `context/toast.tsx`, `components/common/toast/ToastStack.tsx`, `ToastStack.module.scss`, 그리고 `pushToast` 호출 4개 파일
- `components/common/modal/NoticeModal.tsx`, `NoticeModal.module.scss`
- `components/layout/header/Header.tsx`, `Header.module.scss`, `Profile.tsx`, `components/common/theme-toggle/ThemeToggle.tsx`, `ThemeToggle.module.scss`, `components/features/login/Login.tsx`(스타일만), `components/features/filters/EventFilter.tsx`(행사 등록 요청 버튼 빼기)
- `components/layout/index.tsx`, `components/layout/footer/Footer.tsx`, `Footer.module.scss`, `pages/_error.tsx`
- 소식 받기를 빼는 곳: `pages/events.tsx`, `pages/search.tsx`, `pages/event/detail/[eventId].tsx`, `pages/myinfo.tsx`, `components/myEvent/MyEventBody.tsx`, `components/events/ScheduledEventList.tsx`
- 헤더 높이 보정값: `components/common/banner/banner.tsx`, `banner.module.scss`, `styles/EventDetail.module.scss`, `styles/Myinfo.module.scss`, `components/myEvent/MyEventEmpty.module.scss`

**지우지 않고 두는 파일** (9단계에서 정리): `Letter.*`, `SocialBanner.*`, `EmailSubscribeButton.*`, `Register.*`, `HeaderTab.*`

---

### Task 1: 색 변수 · 기준 폭 · 글꼴

**Files:**
- Create: `styles/__tests__/deTokens.test.ts`, `lib/links.ts`
- Modify: `styles/Theme.scss`, `styles/_variables.scss`, `styles/_mixin.scss`, `styles/globals.scss`, `pages/_document.tsx`

**Interfaces:**
- Produces (CSS 변수, `html[data-theme='light']`와 `html[data-theme='dark']` 양쪽에 정의):

| 변수 | 밝은 화면 | 어두운 화면 |
|---|---|---|
| `--de-bg` | `#ffffff` | `#0f1115` |
| `--de-surface` | `#f5f6f8` | `#171a20` |
| `--de-ink` | `#17191e` | `#f2f4f7` |
| `--de-sub` | `#4e5564` | `#b7bdc9` |
| `--de-hint` | `#8b91a0` | `#7d8493` |
| `--de-faint` | `#c3c7d1` | `#4a505c` |
| `--de-line` | `#e9ebf0` | `#252932` |
| `--de-hover` | `#f4f6f9` | `#181b22` |
| `--de-blue` | `#0043ff` | `#5b86ff` |
| `--de-blue-fill` (채운 버튼 바탕) | `#0043ff` | `#2f5fff` |
| `--de-blue-soft` | `#eaf0ff` | `#16234a` |
| `--de-orange` | `#e8590c` | `#ff8f52` |
| `--de-orange-soft` | `#fff1e6` | `#38220f` |
| `--de-red` | `#f04452` | `#ff6b76` |
| `--de-navy` | `#000040` | `#000040` |
| `--de-sun` (일요일) | `#e5484d` | `#ff7a80` |
| `--de-sat` (토요일) | `#2f6fed` | `#7aa2ff` |
| `--de-thumb-bg` | `#eef0f5` | `#1c2028` |
| `--de-thumb-fg` | `#b9bdcb` | `#3a404c` |
| `--de-shadow` | `0 8px 28px rgba(23, 25, 30, 0.12)` | `0 8px 28px rgba(0, 0, 0, 0.5)` |
| `--de-holo` | `linear-gradient(100deg, #ffd6f0, #c9f3ff, #d9ffd9, #fff3b8, #ffd6f0)` | 같음 |
| `--de-holo-ink` (홀로그램 위 글자) | `#15171c` | 같음 |

- Produces (SCSS, `styles/_variables.scss`): `$de-max-width: 1120px; $de-gutter: 20px; $de-header-height: 64px; $de-header-height-mobile: 56px; $de-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;`
- Produces (SCSS, `styles/_mixin.scss`):
  - `@mixin de-mobile { @media (max-width: 860px) { @content; } }`
  - `@mixin de-container` — `max-width: $de-max-width; margin: 0 auto; padding-left/right: $de-gutter;` 그리고 360px 이하에서 좌우 16px
  - `@mixin de-reduced-motion { @media (prefers-reduced-motion: reduce) { @content; } }`
  - `@keyframes de-holo`는 믹스인이 아니라 `styles/globals.scss`에 전역으로 둔다: `to { background-position: -200% 0; }`
- Produces (`lib/links.ts`): `SUBSCRIBE_URL`, `THREADS_URL`, `INSTAGRAM_URL`, `GITHUB_URL`, `WHALE_URL`, `REGISTER_FORM_URL` (모두 `string` 상수)

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `styles/__tests__/deTokens.test.ts`

```ts
import fs from 'fs';
import path from 'path';

const scss = fs.readFileSync(path.join(process.cwd(), 'styles/Theme.scss'), 'utf8');
const block = (theme: 'light' | 'dark') => {
  const start = scss.indexOf(`html[data-theme='${theme}']`);
  return scss.slice(start, scss.indexOf('\n}', start));
};
const names = (s: string) =>
  Array.from(s.matchAll(/(--de-[a-z0-9-]+)\s*:/g), (m) => m[1]).sort();

const EXPECTED = [
  '--de-bg', '--de-surface', '--de-ink', '--de-sub', '--de-hint', '--de-faint',
  '--de-line', '--de-hover', '--de-blue', '--de-blue-fill', '--de-blue-soft',
  '--de-orange', '--de-orange-soft', '--de-red', '--de-navy', '--de-sun', '--de-sat',
  '--de-thumb-bg', '--de-thumb-fg', '--de-shadow', '--de-holo', '--de-holo-ink',
].sort();

describe('리디자인 색 변수', () => {
  it('밝은 화면에 정해진 변수가 모두 있다', () => {
    expect(names(block('light'))).toEqual(EXPECTED);
  });
  it('어두운 화면에도 같은 변수가 있다', () => {
    expect(names(block('dark'))).toEqual(EXPECTED);
  });
  it('밝은 화면의 바탕과 글자 값이 목업과 같다', () => {
    expect(block('light')).toMatch(/--de-bg:\s*#ffffff;/);
    expect(block('light')).toMatch(/--de-ink:\s*#17191e;/);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- deTokens`
Expected: FAIL (받은 배열이 빈 배열)

- [ ] **Step 3: `styles/Theme.scss`의 두 블록 끝에 위 표의 `--de-*` 22개를 넣는다.** 블록마다 `// Redesign tokens (docs/superpowers/plans/2026-11-17-redesign-roadmap.md)` 주석 한 줄을 앞에 둔다. 기존 변수는 지우지 않는다.

- [ ] **Step 4: 테스트 통과를 확인한다**

Run: `pnpm test -- deTokens`
Expected: PASS (3개)

- [ ] **Step 5: `styles/_variables.scss`, `styles/_mixin.scss`에 Interfaces의 변수·믹스인을 추가한다.** 기존 것은 그대로 둔다.

- [ ] **Step 6: `styles/globals.scss`를 고친다.**
  - `html, body`: `background-color: var(--de-bg); color: var(--de-ink);`, `word-break: keep-all; overflow-wrap: anywhere; -webkit-font-smoothing: antialiased;`
  - `font-family`의 첫 값을 `'Pretendard Variable', Pretendard`로(따옴표 포함), 나머지 대체 글꼴은 그대로.
  - `@keyframes de-holo { to { background-position: -200% 0; } }` 추가.
  - `font-size: 14px`는 바꾸지 않는다(옛 화면이 rem에 기대고 있음).

- [ ] **Step 7: `pages/_document.tsx`의 `<Head>`에 글꼴을 불러오는 두 줄을 테마 스크립트 다음에 넣는다.**

```tsx
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
/>
```

- [ ] **Step 8: `lib/links.ts`를 만든다.** 값은 지금 코드에서 그대로 옮긴다: `SUBSCRIBE_URL`은 `Letter.tsx`의 링크, `THREADS_URL`·`INSTAGRAM_URL`은 `SocialBanner.tsx:7-9`, `GITHUB_URL`·`WHALE_URL`은 `Footer.tsx`, `REGISTER_FORM_URL`은 `Register.tsx`. 이 단계에서는 새 부품만 이 파일을 쓴다(`about.tsx`, `lib/seo/jsonLd.ts`는 그대로).

- [ ] **Step 9: 확인**

Run: `npx tsc --noEmit && pnpm test && pnpm build`
Expected: 오류 없음. 빌드 뒤 `pnpm start`로 `/events`를 열어 본문 글꼴이 Pretendard인지(개발자 도구 → Computed → Rendered Fonts) 확인. 네트워크 탭에서 `cdn.jsdelivr.net` 요청을 막고 새로 고쳐도 헤더·푸터 배치가 그대로인지 확인(Review Focus 5).

---

### Task 2: 안내(토스트) — 위에서 내려오는 모양

목업: `app.html?open=share#main` (공유), `?open=save#main` (담기). 스타일 기준은 `detail-design/extra.css`의 `.xt`, `.xt--sh4`.

**Files:**
- Modify: `context/toast.tsx`, `components/common/toast/ToastStack.tsx`, `components/common/toast/ToastStack.module.scss`
- Modify (호출부): `components/common/calendar-export/CalendarExportButton.tsx:89`, `components/common/item/Item.tsx:64`, `components/common/item/List.tsx:99`, `pages/event/detail/[eventId].tsx:95,131,149,156`

**Interfaces:**
- Produces: `pushToast(message: string, kind?: ToastKind): void`, `type ToastKind = 'done' | 'plain'` (기본 `'done'`). `ToastItem`은 `{ id: number; message: string; kind: ToastKind }`. `ToastKind`는 `components/common/toast/ToastStack.tsx`에서 export.
- 동작: 한 번에 하나만 보인다. 새 안내가 오면 앞의 것을 바꾼다. 보이는 시간 2400ms(지금과 같음).

- [ ] **Step 1: `context/toast.tsx`의 `pushToast`를 위 시그니처로 바꾼다.** `setToasts`는 배열에 덧붙이지 않고 새 항목 하나짜리 배열로 바꾼다.

- [ ] **Step 2: `ToastStack.tsx`에서 `kind === 'done'`일 때 문구 앞에 체크 아이콘을 그린다.**

```tsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
  <path d="M5 12.5l4.5 4.5L19 7.5" />
</svg>
```

- [ ] **Step 3: `ToastStack.module.scss`를 다시 쓴다.** 값:
  - 자리: `position: fixed; left: 50%; top: 76px; transform: translateX(-50%); z-index: 9999;` 860px 이하 `top: 66px`
  - 모양: `display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px 0 14px; border-radius: 14px; background: var(--de-bg); color: var(--de-ink); box-shadow: var(--de-shadow), 0 0 0 1px var(--de-line); font-size: 14.5px; font-weight: 600;`
  - 아이콘 색 `var(--de-blue)`
  - 문구: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`, 안내 전체 `max-width: calc(100vw - 32px)`
  - 나타남: `0.24s ease-out`, `opacity: 0; transform: translate(-50%, -12px)`에서 시작. 사라짐은 지금 파일의 방식(끝나기 0.3초 전부터 흐려짐)을 유지하되 2400ms에 맞춘다.
  - `de-reduced-motion`에서 애니메이션 없음.

- [ ] **Step 4: 호출부의 문구와 종류를 바꾼다.**

| 위치 | 바꾼 뒤 |
|---|---|
| `List.tsx:99` | `pushToast(isRemoving ? '관심 행사에서 뺐어요' : '관심 행사에 담았어요')` |
| `[eventId].tsx:131` | `pushToast('관심 행사에 담았어요')` |
| `[eventId].tsx:149` | `pushToast('관심 행사에서 뺐어요')` |
| `Item.tsx:64`, `[eventId].tsx:95` | `pushToast('링크 복사에 실패했어요', 'plain')` |
| `[eventId].tsx:156` | `pushToast('처리 중 오류가 발생했어요', 'plain')` |
| `CalendarExportButton.tsx:89` | `pushToast('캘린더 추가에 실패했어요', 'plain')` |

  나머지 호출(`링크가 복사되었어요`, `캘린더 파일을 다운로드했어요`)은 그대로 둔다.

- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm build`
`pnpm start` 뒤 `/events`에서 카드의 공유 버튼을 눌러, 목업 `app.html?open=share#main`과 나란히 놓고 자리·크기·그림자를 비교한다. 밝은 화면과 어두운 화면 모두. 공유 버튼을 빠르게 두 번 눌러 안내가 하나만 보이는지 확인. 390px 폭에서 개발자 도구 콘솔로 긴 문구를 띄울 수 없으므로, `Item.tsx:61`의 문구를 잠깐 40자짜리로 바꿔 말줄임을 확인한 뒤 되돌린다(Review Focus 4).

---

### Task 3: 공지 띠 — 홀로그램 띠

목업: `app.html#main` 맨 위. 스타일 기준은 `detail-design/extra.css`의 `.nt`, `.nt__in`, `.nt__t`, `.nt__x`, `.nt--nt2`.

**Files:**
- Modify: `components/common/modal/NoticeModal.tsx`, `components/common/modal/NoticeModal.module.scss`, `pages/_document.tsx`

**Interfaces:**
- Consumes: `--de-holo`, `--de-holo-ink`, `@keyframes de-holo`, `de-mobile`, `de-reduced-motion` (Task 1)
- Produces: `<html data-notice="off">` — 공지를 닫은 상태 표시. 뒤 단계에서 공지 높이를 알아야 하는 부품은 이 속성을 본다.

- [ ] **Step 1: `_document.tsx`의 테마 스크립트 끝에 한 줄을 더한다.** 쿠키에 `dev-event-notice=true`가 있으면 React가 뜨기 전에 `document.documentElement.setAttribute('data-notice', 'off')`.

- [ ] **Step 2: `NoticeModal.tsx`를 고친다.**
  - 닫을 때와, 마운트 시 쿠키가 있을 때 `document.documentElement.setAttribute('data-notice', 'off')`를 함께 한다. `handleIsNotice(false)`와 쿠키 저장(90일)은 그대로.
  - 닫기를 `<div onClick>`에서 `<button type="button" aria-label="공지 닫기">`로 바꾼다. `DeleteIcon`의 색은 고정값 대신 `currentColor`가 되게 한다(안 되면 같은 모양의 ×를 인라인 SVG로).
  - 바깥 요소에 `role="note"`. 문구 "개발자를 위한 행사 정보, 데브이벤트"와 `CalenderLogo`는 그대로.
  - `'notice--light'` 클래스는 뺀다.

- [ ] **Step 3: `NoticeModal.module.scss`를 다시 쓴다.** 값:
  - 띠: `position: relative; z-index: 30; background: var(--de-holo); background-size: 200% 100%; color: var(--de-holo-ink); font-size: 14px; animation: de-holo 9s linear infinite;`
  - 안쪽: `display: flex; align-items: center; justify-content: center; max-width: 1120px; height: 48px; margin: 0 auto; padding: 0 56px;`
  - 문구: `font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`, 문구와 아이콘 사이 8px
  - 닫기: `position: absolute; right: max(14px, calc(50% - 548px)); top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 10px; opacity: 0.6;` 올리면 `opacity: 1; background: rgba(127, 127, 127, 0.18);`
  - 860px 이하: `font-size: 13px`, 안쪽 `padding: 0 44px 0 16px; justify-content: flex-start;`, 닫기 `right: 8px`
  - `:global(html[data-notice='off']) .notice { display: none; }`
  - `de-reduced-motion`에서 `animation: none`
  - 어두운 화면에서도 같은 색(홀로그램 띠는 테마를 따르지 않는다).

- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && pnpm build`
`pnpm start` 뒤:
  1. 쿠키를 지우고 `/events`를 열어 목업과 비교(1280px, 390px).
  2. ×를 눌러 닫고 새로 고침을 열 번 한다. 띠가 한 번도 깜빡이지 않아야 한다(Review Focus 1). 개발자 도구 Performance의 스크린샷 기록으로 첫 프레임을 확인한다.
  3. 키보드 Tab으로 × 버튼에 닿고 Enter로 닫히는지 확인.

---

### Task 4: 헤더

목업: `app.html#main` 맨 위, 로그인한 모습은 `app.html?auth=1#main`. 스타일 기준은 `detail-design/app.css`의 `.hd`, `.hd__in`, `.nav`, `.hd__r`, `.icb`, `.btn-line`, `.btn-ink`와 `mypage.css`의 `.pm*`.

**Files:**
- Modify: `components/layout/header/Header.tsx`, `Header.module.scss`, `Profile.tsx`
- Modify: `components/common/theme-toggle/ThemeToggle.tsx`, `ThemeToggle.module.scss`
- Modify: `components/features/login/Login.tsx` (버튼 모양만), `components/features/filters/EventFilter.tsx` (`Register` 빼기)

**Interfaces:**
- Consumes: Task 1의 변수·믹스인, `REGISTER_FORM_URL`
- Produces: 헤더는 `position: static`. 높이 64px(860px 이하 56px). 뒤 단계의 화면은 헤더 높이를 보정하지 않는다.

**구성 (왼쪽부터)**

| 자리 | 내용 | 값 |
|---|---|---|
| 로고 | 지금의 `<Logo />` 그대로 | — |
| 메뉴 | 행사 일정(`/events`), 관심 행사(`/myevent`), 데브이벤트 소개(`/about`) | 간격 26px, 15px/600, 기본 `--de-hint`, 지금 화면은 `--de-ink` |
| 테마 버튼 | 아이콘 하나 | 40×40, radius 12px, `--de-sub`, 올리면 `--de-hover` 바탕 |
| 행사 등록 요청 | 새 탭으로 `REGISTER_FORM_URL` | 높이 40px, `padding: 0 14px`, radius 12px, `1px solid var(--de-line)`, `--de-sub`, 14px/600 |
| 로그인 또는 프로필 | 로그인 버튼 / 프로필 버튼+메뉴 | 로그인: 높이 40px, `padding: 0 16px`, radius 12px, 바탕 `--de-ink`, 글자 `--de-bg` |

- 바깥: `border-bottom: 1px solid var(--de-line); background: var(--de-bg);` 반투명·blur 없음.
- 안쪽: `de-container`, `display: flex; align-items: center; gap: 32px;`, 오른쪽 묶음은 `margin-left: auto; gap: 8px;`
- 860px 이하: 높이 56px, 간격 16px, 메뉴는 "행사 일정"만 보이고, "행사 등록 요청" 버튼은 숨긴다(푸터에 같은 링크가 있음).

- [ ] **Step 1: `Header.tsx`의 마크업을 위 구성으로 바꾼다.**
  - "지금 화면" 판정: `router.pathname`이 `/events`, `/search`, `/event/detail/[eventId]`이면 행사 일정, `/myevent`이면 관심 행사.
  - "관심 행사"는 로그인 상태면 `<Link href="/myevent">`, 아니면 `<button>`으로 그리고 누르면 `setLoginModalIsOpen(true)` (Review Focus 3).
  - "행사 등록 요청"을 누를 때 지금 `Register.tsx`가 보내는 측정 이벤트(`ga.event({ action: 'web_event_행사등록버튼클릭', event_category: 'web_event', event_label: '행사등록' })`)를 그대로 보낸다. `target="_blank" rel="noopener noreferrer"`.
  - `<NoticeModal />`과 `<LoginModal />`의 자리는 그대로.

- [ ] **Step 2: `EventFilter.tsx`에서 `Register`를 뺀다.** import와 렌더 한 줄만 지우고, 그 자리 때문에 생긴 여백 규칙이 `EventFilter.module.scss`에 있으면 함께 지운다. `Register.*` 파일은 남겨 둔다.

- [ ] **Step 3: `ThemeToggle`을 아이콘 버튼 하나로 바꾼다.**
  - 버튼 안에 달·해 아이콘을 둘 다 넣고, 어느 것을 보일지는 React 상태가 아니라 CSS로 정한다: `:global(html[data-theme='light'])`에서는 달, `:global(html[data-theme='dark'])`에서는 해 (Review Focus 2). 아이콘 20px.
  - `aria-label="밝은 화면, 어두운 화면 바꾸기"`. 누르면 지금처럼 `handleWindowTheme(!windowTheme)`.

- [ ] **Step 4: `Profile.tsx`를 고친다.**
  - 버튼: 40×40 원. `profile_image_link`가 있으면 지금처럼 사진, 없으면 `linear-gradient(135deg, #0043ff, #6a8dff)` 바탕에 이름 첫 글자(흰색, 15px/800). `aria-haspopup="menu"`, `aria-expanded`, `aria-label="프로필 메뉴 열기"`.
  - 메뉴: `position: absolute; right: 0; top: 48px; z-index: 60; min-width: 172px; padding: 6px; border-radius: 16px; background: var(--de-bg); box-shadow: var(--de-shadow), 0 0 0 1px var(--de-line);` 항목 높이 42px, `padding: 0 12px`, radius 10px, 14.5px/600, 올리면 `--de-hover`.
  - 항목: **관심 행사**(`/myevent`, `<Link><a role="menuitem">`), **내 정보**(`/myinfo`), **로그아웃**(`<button role="menuitem">`, 글자 `--de-hint`). "내 이벤트"라는 말은 쓰지 않는다.
  - 바깥을 누르거나 Esc를 누르면 닫힌다. Esc로 닫으면 포커스가 프로필 버튼으로 돌아간다.
  - 로그아웃: `Profile.tsx`가 직접 부르던 `POST /api/logout`을 지우고 `await authContext.logout()`만 부른 뒤 `/`로 이동한다(`context/auth.tsx`의 `logout`이 같은 요청을 이미 보내고 있어 지금은 두 번 나감).

- [ ] **Step 5: `Header.module.scss`를 새 값으로 다시 쓴다.** `position: fixed`, `backdrop-filter`, `--header-bg`, `.header__tab`, `.toggle__container`는 없앤다. 프로필 메뉴 스타일도 이 파일에 둔다(지금과 같은 자리).

- [ ] **Step 6: 확인**

Run: `npx tsc --noEmit && npx eslint <이 작업에서 바꾼 .ts·.tsx 파일> && pnpm build`
`pnpm start` 뒤:
  1. `/events`에서 목업과 나란히 비교(1280px, 390px, 밝게·어둡게).
  2. 어두운 화면으로 바꾼 뒤 새로 고침을 여러 번 한다. 테마 아이콘이 달로 보였다가 해로 바뀌면 안 된다(Review Focus 2).
  3. 로그인하지 않은 상태에서 "관심 행사"를 누르면 로그인 창이 뜬다(Review Focus 3).
  4. 키보드만으로 프로필 메뉴를 열고(Enter), 항목을 오가고(Tab), 닫는다(Esc).
  5. 로그아웃할 때 네트워크 탭에 `/api/logout`이 한 번만 나간다. (로그인은 사용자가 직접 한다. 에이전트는 로그인하지 않는다.)
  6. 이 시점에는 헤더 아래 내용이 예전 보정값만큼 내려가 있다. Task 6에서 바로잡는다.

---

### Task 5: 소식 받기 · 푸터

목업: 각 화면 맨 아래. 설명은 설명 페이지의 "소식 받기·푸터" 절(2번). 스타일 기준은 `detail-design/variants.css`의 `.z2*`와 `app.css`의 `.ftr*`.

**Files:**
- Create: `components/layout/footer/Subscribe.tsx`, `components/layout/footer/Subscribe.module.scss`
- Modify: `components/layout/index.tsx`, `components/layout/footer/Footer.tsx`, `Footer.module.scss`, `pages/_error.tsx`
- Modify (소식 받기 빼기): `pages/events.tsx:132`, `pages/search.tsx:89`, `pages/event/detail/[eventId].tsx:299`, `pages/myinfo.tsx:175`, `components/myEvent/MyEventBody.tsx:19`, `components/events/ScheduledEventList.tsx:15`

**Interfaces:**
- Consumes: `lib/links.ts`의 상수 (Task 1)
- Produces: `Layout({ children, subscribe = true }: { children: React.ReactNode; subscribe?: boolean })` — `subscribe`가 false면 푸터만 그린다. `Subscribe`는 props 없음.

**소식 받기의 내용 (문구 그대로)**

제목: `새 행사 소식,` (줄바꿈) `다양한 곳에서 확인해 보세요`

| 이름 | 설명 | 누를 말 | 주소 |
|---|---|---|---|
| 메일 | 일요일 저녁 8시 · 한 주 치를 모아서 | 구독하기 | `SUBSCRIBE_URL` |
| Threads | @dev.event.official · 새 행사 소식을 가장 먼저 | 보러 가기 | `THREADS_URL` |
| Instagram | @dev.event.official · 익숙한 피드에서 | 보러 가기 | `INSTAGRAM_URL` |

세 줄 모두 `target="_blank" rel="noopener noreferrer"`, 줄 전체가 링크, 오른쪽 끝에 18px 화살표(›).

- [ ] **Step 1: `Subscribe.tsx`와 스타일을 만든다.** 값:
  - 바깥: `margin-top: 80px; border-top: 1px solid var(--de-line);`
  - 안쪽: `de-container`, `padding-top: 64px; padding-bottom: 56px; display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 48px; align-items: start;`
  - 제목(`<h2>`): 34px/1.3, `letter-spacing: -0.025em`, 800
  - 목록(`<ul>`): `border-top: 2px solid var(--de-ink)`
  - 줄: `display: grid; grid-template-columns: 132px minmax(0, 1fr) auto 18px; align-items: center; gap: 16px; padding: 22px 6px; border-bottom: 1px solid var(--de-line);` 올리면 `background: var(--de-hover); padding-left: 14px;` (0.15s)
  - 이름 21px/800, 설명 15px `--de-sub`, 누를 말 14.5px/700 `--de-blue`, 화살표 `--de-hint`
  - 860px 이하: 한 칸, `gap: 24px; padding-top: 40px; padding-bottom: 36px;`, 제목 25px. 줄은 `grid-template-columns: minmax(0, 1fr) auto 18px; gap: 2px 10px; padding: 16px 2px;`, 이름 18px, 설명은 둘째 줄 전체(13.5px), 올렸을 때 `padding-left`는 바꾸지 않음
  - `de-reduced-motion`에서 transition 없음

- [ ] **Step 2: `Footer.tsx`를 고친다.**
  - 왼쪽: `<Logo />`, "개발자를 위한 행사 정보, 데브이벤트"(13.5px `--de-sub`), 저작권 줄(문구·링크 그대로, 12.5px `--de-hint`, 링크에 밑줄).
  - 오른쪽(`margin-left: auto; gap: 18px; 13.5px/600 --de-sub`): "데브이벤트 소개"(`/about`), "행사 등록 요청"(`REGISTER_FORM_URL`, 새 탭), GitHub 아이콘, 웨일 아이콘. 아이콘 둘은 40×40, radius 12px, 바탕 `--de-surface`. 웨일은 지금의 `/icon/whale.png`를 24px로. 아이콘 링크에는 `aria-label`("GitHub", "네이버 웨일 확장 프로그램").
  - 바깥: `border-top: 1px solid var(--de-line)`. 안쪽: `de-container`, `padding-top: 32px; padding-bottom: 44px; display: flex; align-items: flex-start; gap: 24px;`
  - 860px 이하: 세로로 쌓고 오른쪽 묶음은 `margin-left: 0`, 줄바꿈 허용.
  - 높이 고정(200px)과 옛 색 변수는 없앤다.

- [ ] **Step 3: `Layout`에 `subscribe`를 넣는다.** `<Header />`, `{children}`, `{subscribe && <Subscribe />}`, `<Footer />` 순서. `children: any`를 위 타입으로 바꾼다.

- [ ] **Step 4: `pages/_error.tsx`의 `getLayout`에서 `<Layout subscribe={false}>`로 바꾼다.**

- [ ] **Step 5: 화면마다 넣던 소식 받기를 뺀다.** Files에 적은 여섯 곳에서 `<Letter />`, `<SocialBanner />`와 그 import를 지운다. `Letter.*`, `SocialBanner.*`, `EmailSubscribeButton.*` 파일은 남겨 둔다.

- [ ] **Step 6: 확인**

Run: `npx tsc --noEmit && npx eslint <이 작업에서 바꾼 .ts·.tsx 파일> && pnpm build`
Run: `grep -rn "letter/Letter\|SocialBanner" pages components --include='*.tsx' | grep -v "^components/features/"`
Expected: 결과 없음

`pnpm start` 뒤 `/events`, `/search?kwd=AI`, 상세 화면 하나, 없는 주소(`/nope`)를 열어 본다. 앞의 셋은 소식 받기가 한 번만, 푸터 바로 위에 나온다. 없는 주소에서는 푸터만 나온다. 목업의 `app.html?bare=foot#main`과 나란히 비교(1280px, 390px, 밝게·어둡게). `/myevent`, `/myinfo`는 로그인이 필요하므로 사용자에게 확인을 부탁한다.

---

### Task 6: 헤더 높이 보정값 걷어 내기 · 전체 확인

헤더가 화면 고정에서 풀렸으므로, 내용이 헤더에 가려지지 않게 밀어 두던 여백이 이제 빈 공간으로 남는다.

**Files:**
- Modify: `components/common/banner/banner.tsx`, `components/common/banner/banner.module.scss`, `styles/EventDetail.module.scss`, `styles/Myinfo.module.scss`, `components/myEvent/MyEventEmpty.module.scss`

- [ ] **Step 1: 보정값이 있는 곳을 모두 찾는다.**

Run: `grep -rn "header-height\|header_height\|3\.5rem\|49px\|Header 높이" components styles pages --include='*.scss' --include='*.tsx'`

- [ ] **Step 2: 아래를 고친다.** Step 1에서 이 표에 없는 곳이 나오면 같은 방식(옛 헤더 높이 49px 몫을 뺌)으로 고치고, 보고에 적는다.

| 위치 | 지금 | 바꾼 뒤 |
|---|---|---|
| `banner.module.scss:14`, `:138` | `margin-top: $header_height` | `margin-top: 0` |
| `banner.module.scss:134` | `margin-top: $header_height + 36px` | 규칙째 삭제 |
| `banner.tsx:9-11` | `isNotice`로 `notice--true/false` 클래스를 붙임 | 클래스와 `isNotice` 사용 삭제 |
| `EventDetail.module.scss:6` | `padding-top: 64px` | `padding-top: 0` |
| `Myinfo.module.scss:51` | `padding: 136px 0 24px` | `padding: 87px 0 24px` (옛 헤더 높이 49px를 뺌) |
| `Myinfo.module.scss:65` | `padding-top: 136px` | `padding-top: 87px` |
| `Myinfo.module.scss:73` | `padding-top: 120px` | `padding-top: 71px` |
| `MyEventEmpty.module.scss:6` (`.sub-header`) | `padding-top: 136px` | `padding-top: 87px` |

  `$header-height: 49px`(`_variables.scss:4`)는 쓰는 곳이 없어지면 지운다.

- [ ] **Step 3: 전체 확인**

Run:
```bash
npx tsc --noEmit
pnpm test
npx eslint <이 단계에서 바꾼 .ts·.tsx 파일>
pnpm build
```
Expected: 모두 통과

`pnpm start` 뒤 아래 화면을 1280×900과 390×844, 밝게·어둡게로 각각 연다: `/events`, `/events?view=calendar`, `/search?kwd=AI`, 상세 화면 하나, `/about`, 없는 주소. 볼 것:
  1. 헤더와 그 아래 내용 사이에 빈 띠가 없고, 내용이 헤더에 가려지지도 않는다. 공지 띠를 닫았을 때와 열었을 때 모두.
  2. 화면을 내리면 헤더가 함께 올라간다.
  3. `/about`은 이 단계 전과 똑같다(전용 헤더·푸터).
  4. 가로 스크롤이 생기지 않는다(390px).
  5. 콘솔에 새 오류가 없다.

  `/myevent`, `/myinfo`는 사용자에게 확인을 부탁한다.

**이 단계가 끝난 뒤의 모습:** 헤더·공지 띠·안내·소식 받기·푸터는 새 모양이고, 그 사이의 배너·목록·상세·내 화면은 예전 모양입니다. 어두운 화면에서는 새 바탕(`#0f1115`)과 옛 구역의 바탕(`#1B1C1E`)이 다르게 보입니다. 뒤 단계에서 화면이 바뀌면서 맞춰집니다.
