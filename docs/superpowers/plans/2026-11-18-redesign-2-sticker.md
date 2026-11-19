# 리디자인 2단계 — 홀로그램 스티커 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 배너(4단계)·로그인 창(7단계)·관심 행사와 내 정보(8단계)가 함께 쓰는 홀로그램 스티커 부품을 만든다. 스티커 그림(SVG 문자열), 한 장을 붙이는 부품, 화면에 한 번 들어가는 색·필터 정의, 결정된 화면별 배치 묶음까지가 이 단계다. 이 단계만으로는 화면에 보이는 변화가 없다.

**Architecture:** 그림은 `lib/sticker/`의 순수 함수로 둔다. `logos.ts`가 로고 도형을 한 곳에 모으고, `art.ts`의 `stickerSvg(name)`이 이름 하나로 SVG 문자열을 돌려준다. 홀로그램 그러데이션과 칼선(흰 테두리+그림자) 필터는 `STICKER_DEFS` 문자열 하나에 담아 `StickerDefs`가 `components/layout/index.tsx`에서 한 번만 그린다. `Sticker`는 그 정의를 `url(#…)`로 가리키는 절대 위치 `<span>`이고, 목업의 `stk()`와 같은 방식으로 놓인다. 돌리고 줄이는 기준점만 CSS 변수(`--stk-origin`)로 열어 둔다(배너는 기준점이 다르다). 화면별 배치는 `stickerSets.ts`의 상수 네 개다. 쓰는 화면(배너·로그인 창·관심 행사·내 정보)은 이 단계에서 건드리지 않는다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / jest (ts-jest)

**Spec:** 정적 목업 `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/`의 `stickers.js`(그림과 `DEFS`), `logos.js`(로고 도형), 쓰는 곳 `login.js:57,65`·`login.css:49,55`, `mypage.js:67,124,131`·`mypage.css:109`, `variants.js:17-24,205-210`·`variants.css:569-581`. 결정된 시안은 `app.js:28`의 기본값(로그인 `l2`, 관심 행사 `sv6`, 내 정보 `me2`, 배너 `holo1`)과 `variants.js:23`의 `SLOT_DEFAULT = 'prompt'`로 확인했다. 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`. 목업과 이 계획이 다르면 "정한 것과 확인이 필요한 것"에 적힌 것만 계획이 기준이고, 나머지는 목업이 기준이다.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm dev`·`pnpm start`로 화면을 띄우지 않는다. **`pnpm build`는 작업 4에서 한 번만 돌린다**(같은 폴더의 빌드 결과물을 다른 작업이 쓰고 있다). `pnpm lint`는 돌지 않으므로 `npx eslint <바꾼 파일>`로 본다. 화면 비교는 관리자가 마지막에 한 번에 한다. 파일을 지우지 않는다. 파일을 내려받거나 외부로 요청을 보내지 않는다. 확인용 페이지를 만들지 않는다.

## Global Constraints

- **옮기는 그림은 아래 열한 가지뿐이다.** 결정된 네 화면이 쓰는 것만 옮긴다. 목업의 다른 그림(일력·입장권·무료·D-3·마이크·이름표·말풍선·글자 딱지·파일 딱지·꼬리표·육각 글자 딱지 등)과 로고 열두 종(React, Kotlin, Spring …)은 옮기지 않는다.

  | 이름 | 그림 | 쓰는 곳 |
  |---|---|---|
  | `holo:logo` | DEV.EVENT 딱지(홀로그램 판) | 머리띠 셋, 배너 |
  | `lg:js:hex:h` | JavaScript, 육각 홀로그램 판 | 머리띠 셋, 배너 |
  | `lg:linux:hex:h` | 턱스, 육각 홀로그램 판 | 머리띠 셋, 배너 |
  | `lg:python:disc:w` | Python, 흰 원판에 공식 색 | 머리띠 셋, 배너 |
  | `prompt` | 깜빡이는 프롬프트 | 머리띠 셋, 배너 |
  | `laptop` | 노트북 | 로그인·관심 행사 머리띠, 배너 |
  | `term` | 터미널 창 | 배너 |
  | `holo:code` | `</>` 원(홀로그램 판) | 배너 |
  | `lg:ts:disc:h` | TypeScript, 홀로그램 원판 | 배너 |
  | `lg:git:disc:h` | Git, 홀로그램 원판 | 배너 |
  | `lg:android:disc:k` | Android, 먹색 원판에 홀로그램 로고 | 배너 |

- **`stickerSvg`는 인자 하나의 순수 함수다.** 날짜·건수 같은 바깥 값(목업의 `c.NOW`, `c.CNT`)에 기대는 그림은 옮기지 않는다. `Date`, `Math.random`, `window`를 쓰지 않는다.
- **`dangerouslySetInnerHTML`에는 이 단계가 만든 고정 문자열만 넣는다.** `stickerSvg`의 결과와 `STICKER_DEFS`뿐이고 사용자 입력·API 값이 섞이지 않는다. 그림 이름은 `StickerName` 유니언으로 막는다.
- **로고 도형은 `lib/sticker/logos.ts` 한 곳에만 둔다.** 다른 파일에 경로(`d`) 문자열을 적지 않는다. 로고 파일을 내려받지 않는다. 도형은 목업 `logos.js`에서 작업 1의 명령으로 뽑는다(손으로 옮겨 적지 않는다. 턱스 도형은 5,354자다).
- **글꼴을 더하지 않는다.** 목업 스티커의 `'JetBrains Mono'`는 `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`(로드맵 공통 규칙 6)로 바꾸고, `'Pretendard Variable', Pretendard, sans-serif`는 그대로 쓴다. `'Gaegu'`를 쓰는 그림(이름표·명찰)은 옮기지 않는다. 글꼴 파일·CDN 링크를 더하지 않는다.
- **id에는 `stk-`를 붙인다.** 정의의 id는 `stk-holo`, `stk-holoC`, `stk-holoL`, `stk-diecut` 네 개다(목업은 `holo`, `holoC` …). 문서 전체에서 하나뿐이어야 하는데, 상세 본문은 `marked`가 제목마다 id를 붙여 `holo` 같은 이름이 겹칠 수 있다.
- 색은 `--de-*` 변수만. **스티커 그림과 `STICKER_DEFS` 안의 고정 색은 목업 값 그대로 허용한다**(밝은 화면·어두운 화면에서 같은 그림이다). 이 단계의 SCSS에는 색이 없다.
- SCSS에서 공용 파일은 전체 파일명과 물결표, 변수 먼저: `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`
- CSS Module에서 클래스 없는 순수 태그 선택자(`svg { … }`)를 쓰지 않는다.
- import는 프로젝트 루트 기준 절대 경로(`components/layout/index.tsx`에 이미 있는 상대 경로 줄은 고치지 않는다).
- `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다. `Map`·`Set`·문자열·`NodeList`를 `[...x]`나 `for…of`로 돌리지 않는다(목업의 `[...k].reduce(…)`를 그대로 옮기면 안 된다).
- `prefers-reduced-motion: reduce`에서는 움직임을 멈춘다. 이 단계의 움직임은 CSS가 아니라 SVG 안의 `<animate>`·`<animateTransform>`뿐이라 `de-reduced-motion` 믹스인으로는 멈출 수 없다. `useStillMotion`이 멈춘다(작업 2). SCSS에 transition·animation을 넣지 않는다.
- 건드리지 않는 것: 배너(`components/common/banner/`), 로그인 창(`components/common/modal/LoginModal.*`), 관심 행사·내 정보(`components/myEvent/*`, `pages/myevent.tsx`, `pages/myinfo.tsx`), `styles/Theme.scss`, `styles/_mixin.scss`. 고치는 기존 파일은 `components/layout/index.tsx` 하나다.
- 파일을 지우지 않는다.
- 작업마다의 확인 명령은 `npx tsc --noEmit`, `pnpm test -- <경로>`, `npx eslint <바꾼 .ts·.tsx 파일을 하나씩>`이고 `pnpm build`는 작업 4에서 한 번이다. 테스트 파일도 `.prettierrc.cjs`의 포맷을 지킨다(이 문서의 테스트 코드는 그 포맷으로 적었다). SCSS는 `tsc`가 보지 않으므로 아래 명령으로 문법을 확인한다(이 문서에서 "SCSS 확인").

```bash
node -e "const sass=require('sass');const imp={findFileUrl(u){return u.startsWith('~')?new URL('file://'+process.cwd()+'/'+u.slice(1)):null}};process.argv.slice(1).forEach(f=>{sass.compile(f,{importers:[imp],logger:sass.Logger.silent});console.log('ok',f)})" <scss 파일들>
```

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 이 단계에는 화면이 없어, 코드로 볼 수 있는 것은 괄호 안 작업에서 보고 화면으로 볼 것은 4·7·8단계의 확인 목록으로 넘깁니다(작업 4의 Step 3).

1. **`url(#stk-…)`가 정의를 찾지 못한다** — 찾지 못하면 흰 칼선과 그림자가 사라지고 홀로그램 판이 비어 보인다(브라우저에 따라서는 스티커가 그려지지 않는다). 생길 수 있는 자리: ① 정의를 담은 `<svg>`를 `display: none`으로 숨긴 경우(브라우저에 따라 그 안의 그러데이션·필터가 듣지 않는다. 목업처럼 크기 0, `position: absolute`로 둔다) ② `Layout`을 쓰지 않는 화면(`pages/index.tsx`, `pages/about.tsx`. 스티커를 쓰지 않는다) ③ `react-modal` 포털 — 로그인 창은 `<body>` 끝에 따로 붙지만 **같은 문서 안이라 듣는다.** 모달이 열릴 때 `Modal.setAppElement('#__next')`가 `#__next`에 `aria-hidden`을 붙여도 그리는 데는 영향이 없다 ④ 쓰는 쪽이 `StickerDefs`를 한 번 더 넣어 id가 둘이 되는 경우 ⑤ 상세 화면은 `Layout`이 페이지 안에 있어(`pages/event/detail/[eventId].tsx:96`) 목록과 오갈 때 정의가 다시 그려진다. (작업 2, 7단계에서 로그인 창을 상세 화면에서도 열어 본다)
2. **움직임 줄이기를 켠 사용자에게 홀로그램이 계속 흐른다** — SVG 안의 움직임은 CSS 미디어쿼리로 멈출 수 없다. 목업은 배너의 스티커만 `pauseAnimations()`로 멈추고(`variants.js:466`) 머리띠의 것은 멈추지 않는다. 정의(그러데이션 셋)와 스티커 한 장 한 장(프롬프트의 커서)을 모두 멈춰야 한다. 프롬프트의 커서는 보이는 상태로 멈춰야 한다. (작업 2)
3. **문자열을 옮기다 깨진다** — ① `laptop`·`holo:code`의 글자 `&lt;/&gt;`를 `</>`로 풀어 쓰면 HTML로 들어갈 때 태그로 읽혀 그림이 깨진다 ② SVG 속성 이름을 JSX식(`strokeWidth`, `stopColor`)으로 바꾸면 듣지 않는다. 문자열 안에서는 SVG 그대로(`stroke-width`, `stop-color`, `gradientUnits`) ③ 목업의 `holo()`는 문자열 치환이라, 고쳐 쓰다 보면 흰 글자가 홀로그램 판 위에 남는다 ④ 로고 도형을 손으로 옮기면 한 글자만 빠져도 모양이 틀어진다. (작업 1의 테스트)
4. **글꼴을 바꿔 글자가 판을 벗어난다** — `term`의 `$ git push`와 한글 한 줄(`→ 행사 가는 중…`), `laptop`·`holo:code`의 `</>`는 목업에서 JetBrains Mono였다. 시스템 고정폭 글꼴은 기기마다 폭이 다르다(Windows는 Consolas). 판 안에 들어오는지는 4단계에서 배너를 볼 때 확인한다. `holo:logo`의 굵기 900은 Pretendard Variable이 불려 있어야 목업과 같다.
5. **배너에서 스티커의 자리가 목업과 어긋난다** — 목업은 머리띠와 배너에서 스티커를 붙이는 법이 다르다. 머리띠(`.lg-stk`)는 붙는 쪽 위 모서리를 기준으로 돌리고 줄이고(`login.css:49`, `:55`), 배너(`.stk`)는 **가운데**를 기준으로 한다(`variants.css:571`). 같은 `x`·`y`·`scale`이라도 기준점이 다르면 놓이는 자리가 달라진다(84px 원판을 0.72배로 줄이면 약 12px, 860px 이하의 `holo:logo` 0.56배는 가로 약 32px). `Sticker`의 기준점을 CSS 변수 `--stk-origin`으로 열어 두어 배너가 감싸는 요소에서 `50% 50%`로 바꿀 수 있게 한다. 4단계 계획에는 아직 이 줄이 없다("확인이 필요한 것" 1). 넘겨받은 `className`이 실제로 `<span>`에 붙는지도 본다. (작업 2)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 이 단계에서 구현 에이전트가 열어 볼 일은 없고, 묶음이 어느 화면의 것인지 가리키는 용도입니다.

| 묶음 | 목업 주소 | 목업 코드 | 실제 화면 (맡는 단계) |
|---|---|---|---|
| `LOGIN_BAND` | `app.html?open=login#main` | `login.js:65` (`l2`) | 로그인 창 (7단계) |
| `SAVED_BAND` | `app.html#saved` | `mypage.js:67` (`sv6`. `:124`의 `BAND`와 같은 값) | `/myevent` (8단계) |
| `ME_BAND` | `app.html#me` | `mypage.js:131` (`me2`) | `/myinfo` (8단계) |
| `BANNER_HOLO1` | `app.html?reg=0#main` | `variants.js:205-210` (`holo1`), 빈자리는 `:21`·`:23`의 프롬프트 | `/events`의 배너 없을 때 (4단계) |

---

## File Structure

**새로 만드는 파일**

- `lib/sticker/logos.ts` — 로고 여섯 종의 도형 (Python, JavaScript, TypeScript, Git, 턱스, Android)
- `lib/sticker/art.ts` — 그림 이름, `stickerSvg`, `STICKER_DEFS`
- `lib/sticker/__tests__/logos.test.ts`, `lib/sticker/__tests__/art.test.ts`
- `components/common/sticker/Sticker.tsx`, `Sticker.module.scss` — 스티커 한 장
- `components/common/sticker/StickerDefs.tsx` — 화면에 한 번 들어가는 정의
- `components/common/sticker/useStillMotion.ts` — 움직임 줄이기에서 SVG 움직임을 멈춘다
- `components/common/sticker/stickerSets.ts` — 화면별 배치 묶음
- `components/common/sticker/__tests__/stickerSets.test.ts`

**고치는 파일**

- `components/layout/index.tsx` — `StickerDefs`를 한 번 넣는다 (두 줄 추가)

**작업 순서**

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 로고 도형, 스티커 그림 (순수 함수) | — |
| 2 | `Sticker`, `StickerDefs`, 레이아웃에 한 번 넣기 | `components/layout/index.tsx` |
| 3 | 배치 묶음 | — |
| 4 | 전체 확인 (`pnpm build` 한 번) | — |

작업 1이 끝나야 2를, 2가 끝나야 3을 할 수 있습니다(3은 2의 `StickerPlacement` 타입을 씁니다). 모든 작업이 끝나도 화면은 예전 그대로이고, HTML에 크기 0인 `<svg>` 하나가 더 들어갑니다.

---

### Task 1: 로고 도형 · 스티커 그림 (순수 함수)

**Files:**
- Create: `lib/sticker/logos.ts`
- Create: `lib/sticker/art.ts`
- Create: `lib/sticker/__tests__/logos.test.ts`
- Create: `lib/sticker/__tests__/art.test.ts`

**Interfaces:**
- Consumes: 없음 (목업 파일은 옮겨 적는 원본일 뿐, 코드에서 불러오지 않는다)
- Produces:

```ts
// lib/sticker/logos.ts
export type LogoKey = 'python' | 'js' | 'ts' | 'git' | 'linux' | 'android';
export interface LogoShape {
  d: string;    // 24×24 도형
  c?: string;   // 공식 색 (공식 색 그대로 찍는 로고만. 지금은 Python)
  c2?: string;  // 둘째 색
  d2?: string;  // 둘째 색 조각
}
export const LOGOS: Record<LogoKey, LogoShape>;

// lib/sticker/art.ts
export const STICKER_NAMES: readonly [/* 아래 열한 이름 */];   // 테스트와 묶음 검사가 돌려 볼 목록
export type StickerName = typeof STICKER_NAMES[number];
//   'holo:logo' | 'holo:code' | 'laptop' | 'prompt' | 'term'
//   | 'lg:js:hex:h' | 'lg:linux:hex:h' | 'lg:ts:disc:h' | 'lg:git:disc:h'
//   | 'lg:python:disc:w' | 'lg:android:disc:k'
export function stickerSvg(name: StickerName): string;   // '<svg width=… >…</svg>'
export const STICKER_DEFS: string;                       // <defs> 안쪽 문자열 (<svg>·<defs> 태그는 없다)
```

**목업의 어느 줄을 옮기는가** (`detail-design/stickers.js`)

| 만들 것 | 목업 | 바꾸는 것 |
|---|---|---|
| 먹색 `#15171c`, 글꼴 속성 둘 | `:5-7`의 `INK`, `F`, `M` | `M`만 `font-family="ui-monospace, 'SF Mono', Menlo, Consolas, monospace"`로. `H`(Gaegu)는 옮기지 않는다 |
| 겉 `<svg>` | `:9`의 `svg(w, h, body)` | 그대로 |
| `laptop` | `ART.laptop` `:32-34` | 글꼴만 |
| `term` | `ART.term` `:64-67` | 글꼴만 |
| `prompt` | `ART.prompt` `:100-101` | 그대로(`<animate>` 포함) |
| `holo:logo` | `ART.logo` `:72-73`에 `holo()` `:170-173`를 적용한 결과 | 판의 채움 → `url(#stk-holo)`, 흰 글자 → 먹색 |
| `holo:code` | `ART.code` `:90`에 `holo()`를 적용한 결과 | 판의 `#0043ff` → `url(#stk-holo)`, 흰 글자 → 먹색. 글꼴 |
| 로고 스티커 여섯 | `mark` `:141-144`, `logo` `:145-152` | 아래 표의 조합만 만든다 |
| `STICKER_DEFS` | `DEFS` `:178-215` 가운데 `holo` `:180-183`, `holoC` `:188-191`, `holoL` `:192-195`, `diecut` `:196-202` | id에 `stk-`를 붙인다. 겉의 `<svg>`·`<defs>`는 뺀다 |

로고 스티커의 조합(목업 `logo()`와 `hv()`가 내는 결과를 표로 고정한 것. `hv`의 글자 합 계산은 옮기지 않는다):

| 이름 | 판 | 판의 채움 | 테두리 | 로고의 채움 |
|---|---|---|---|---|
| `lg:js:hex:h` | 육각 80×92 | `url(#stk-holoC)` | 먹색 | 먹색 |
| `lg:linux:hex:h` | 육각 80×92 | `url(#stk-holoC)` | 먹색 | 먹색 |
| `lg:ts:disc:h` | 원 84×84 | `url(#stk-holo)` | 먹색 | 먹색 |
| `lg:git:disc:h` | 원 84×84 | `url(#stk-holo)` | 먹색 | 먹색 |
| `lg:python:disc:w` | 원 84×84 | `#fff` | 먹색 | 공식 색 (`c`, 둘째 조각은 `c2`) |
| `lg:android:disc:k` | 원 84×84 | 먹색 | `url(#stk-holoC)` | `url(#stk-holoL)` |

**테스트·시그니처만으로 정해지지 않는 규칙**

- 옮기지 않는 것: `star`, `WORD`·`word`, `lum`, `FILEC`·`file`, `tag`, `hx`, `hword`, `TRI`·`tri`, `logo()`의 `cut`·`sq` 모양과 `c` 판, `DEFS`의 `ringp`·`holoB`·`diecut-up`·`kisscut`. `holoB`는 고른 열한 그림 가운데 가리키는 것이 없다. `diecut-up`은 배너의 스티커에 올렸을 때·끌 때만 쓰는 필터인데(`variants.css:575-576`), 4단계가 그 동작을 넣지 않기로 했다.
- 목업 `mark()`가 JavaScript·TypeScript 로고 뒤에 까는 `<rect … fill="…">`(`bk`)는 옮기지 않는다. 홀로그램 판에서는 `fill="none"`이라 아무것도 그리지 않는다. 그래서 `logos.ts`에 `bk`가 없고, Python 말고는 공식 색(`c`)도 없다.
- `holo:logo`·`holo:code`는 결과 문자열이 같으면 된다. 목업의 문자열 치환(`holo()`)을 그대로 옮길 필요는 없다.
- `stickerSvg`는 모르는 이름을 받을 일이 없다(타입으로 막는다). 목업의 "모르는 이름이면 글자 딱지"는 옮기지 않는다.
- 속성의 순서와 띄어쓰기는 목업 그대로 둔다(테스트가 `d="…" fill="…"` 순서를 본다).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/sticker/__tests__/logos.test.ts`

```ts
import { LogoKey, LOGOS } from 'lib/sticker/logos';

// [로고, 조각, 길이, 앞머리] — 목업 logos.js에서 꺼낸 값. 공식 파일로 바꾸면 이 표도 함께 고친다
const SHAPES: [LogoKey, 'd' | 'd2', number, string][] = [
  ['python', 'd', 697, 'M14.25 0.18l.9'],
  ['python', 'd2', 713, 'M21.04 6.11l.2'],
  ['js', 'd', 860, 'M0 0h24v24H0V0'],
  ['ts', 'd', 1180, 'M1.125 0C.502 '],
  ['git', 'd', 595, 'M23.546 10.93L'],
  ['linux', 'd', 5354, 'M12.504 0c-.15'],
  ['android', 'd', 578, 'M17.523 15.341'],
];

describe('LOGOS', () => {
  it('쓰는 로고 여섯 종만 담는다', () => {
    expect(Object.keys(LOGOS).sort()).toEqual([
      'android',
      'git',
      'js',
      'linux',
      'python',
      'ts',
    ]);
  });

  it('도형은 목업에서 한 글자도 바뀌지 않았다', () => {
    SHAPES.forEach(([key, part, length, head]) => {
      const d = LOGOS[key][part] as string;
      expect(d).toHaveLength(length);
      expect(d.indexOf(head)).toBe(0);
    });
  });

  it('도형에는 경로 글자만 있다', () => {
    SHAPES.forEach(([key, part]) => {
      expect(LOGOS[key][part]).toMatch(/^M[MmLlHhVvCcSsQqTtAaZz0-9 .,eE-]+$/);
    });
  });

  it('공식 색은 Python만 갖는다 (다른 로고는 한 가지 색으로 찍는다)', () => {
    expect(LOGOS.python.c).toBe('#3776ab');
    expect(LOGOS.python.c2).toBe('#ffd43b');
    (['js', 'ts', 'git', 'linux', 'android'] as LogoKey[]).forEach((key) => {
      expect(Object.keys(LOGOS[key])).toEqual(['d']);
    });
  });
});
```

`lib/sticker/__tests__/art.test.ts`

```ts
import {
  STICKER_DEFS,
  STICKER_NAMES,
  StickerName,
  stickerSvg,
} from 'lib/sticker/art';
import { LogoKey, LOGOS } from 'lib/sticker/logos';

// [폭, 높이, 가리키는 그러데이션] — 크기는 목업 stickers.js와 같다
const SPEC: Record<StickerName, [number, number, string[]]> = {
  'holo:logo': [146, 46, ['stk-holo']],
  'holo:code': [78, 78, ['stk-holo']],
  laptop: [108, 76, []],
  prompt: [84, 66, []],
  term: [136, 76, []],
  'lg:js:hex:h': [80, 92, ['stk-holoC']],
  'lg:linux:hex:h': [80, 92, ['stk-holoC']],
  'lg:ts:disc:h': [84, 84, ['stk-holo']],
  'lg:git:disc:h': [84, 84, ['stk-holo']],
  'lg:python:disc:w': [84, 84, []],
  'lg:android:disc:k': [84, 84, ['stk-holoC', 'stk-holoL']],
};
const NAMES = Object.keys(SPEC) as StickerName[];
// [이름, 로고, 판]
const LOGO_STICKERS: [StickerName, LogoKey, 'hex' | 'disc'][] = [
  ['lg:js:hex:h', 'js', 'hex'],
  ['lg:linux:hex:h', 'linux', 'hex'],
  ['lg:ts:disc:h', 'ts', 'disc'],
  ['lg:git:disc:h', 'git', 'disc'],
  ['lg:python:disc:w', 'python', 'disc'],
  ['lg:android:disc:k', 'android', 'disc'],
];

const uniq = (list: string[]): string[] =>
  list.filter((v, i) => list.indexOf(v) === i).sort();
const refs = (s: string): string[] =>
  uniq((s.match(/url\(#[^)]+\)/g) || []).map((m) => m.slice(5, -1)));
const ids = (s: string): string[] =>
  uniq((s.match(/ id="[^"]+"/g) || []).map((m) => m.slice(5, -1)));

describe('stickerSvg', () => {
  it('옮긴 그림은 열한 가지다', () => {
    expect(STICKER_NAMES.slice().sort()).toEqual(NAMES.slice().sort());
  });

  it('이름마다 <svg로 시작하는 문자열을 돌려준다 (크기는 목업과 같다)', () => {
    NAMES.forEach((name) => {
      const [w, h] = SPEC[name];
      const svg = stickerSvg(name);
      expect(
        svg.indexOf(`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"`)
      ).toBe(0);
      expect(svg.slice(-6)).toBe('</svg>');
      expect(svg).not.toMatch(/undefined|NaN|\$\{/);
    });
  });

  it('인자 하나의 순수 함수다 (날짜가 바뀌어도 같은 문자열)', () => {
    const before = NAMES.map((name) => stickerSvg(name));
    jest.useFakeTimers().setSystemTime(new Date('2031-01-01T00:00:00Z'));
    const after = NAMES.map((name) => stickerSvg(name));
    jest.useRealTimers();
    expect(after).toEqual(before);
    expect(stickerSvg.length).toBe(1);
  });

  it('가리키는 홀로그램 색은 이름마다 정해져 있다', () => {
    NAMES.forEach((name) => {
      expect(refs(stickerSvg(name))).toEqual(SPEC[name][2]);
    });
  });

  it('홀로그램 판은 흰 글자를 먹색으로 바꾼다', () => {
    (['holo:logo', 'holo:code'] as StickerName[]).forEach((name) => {
      const svg = stickerSvg(name);
      expect(svg).toContain('fill="url(#stk-holo)" stroke="#15171c"');
      expect(svg).not.toContain('fill="#fff"');
      expect(svg).toMatch(/<text[^>]*fill="#15171c"/);
    });
  });

  it('글꼴은 지금 서비스에 있는 것만 쓴다', () => {
    NAMES.forEach((name) => {
      expect(stickerSvg(name)).not.toMatch(/JetBrains|Gaegu/);
    });
    expect(stickerSvg('holo:logo')).toContain("'Pretendard Variable'");
    (['laptop', 'term', 'holo:code'] as StickerName[]).forEach((name) => {
      expect(stickerSvg(name)).toContain('font-family="ui-monospace,');
    });
  });

  it('</> 글자는 이스케이프된 채로 둔다', () => {
    (['laptop', 'holo:code'] as StickerName[]).forEach((name) => {
      expect(stickerSvg(name)).toContain('>&lt;/&gt;</text>');
    });
  });

  it('움직이는 것은 프롬프트의 커서뿐이다', () => {
    expect(NAMES.filter((name) => /<animate/.test(stickerSvg(name)))).toEqual([
      'prompt',
    ]);
  });

  it('로고 스티커는 logos.ts의 도형을 그대로 넣는다', () => {
    LOGO_STICKERS.forEach(([name, key, shape]) => {
      const svg = stickerSvg(name);
      expect(svg).toContain(` d="${LOGOS[key].d}"`);
      expect(svg).toContain(
        shape === 'hex'
          ? 'points="40,2 78,24 78,68 40,90 2,68 2,24"'
          : '<circle cx="42" cy="42" r="39.5"'
      );
      expect(svg).toContain(
        shape === 'hex'
          ? 'translate(17.2 23.2) scale(1.9)'
          : 'translate(18 18) scale(2)'
      );
    });
  });

  it('홀로그램 판의 로고는 먹색 한 가지로 찍는다', () => {
    LOGO_STICKERS.filter(([name]) => /:h$/.test(name)).forEach(
      ([name, key]) => {
        expect(stickerSvg(name)).toContain(
          `d="${LOGOS[key].d}" fill="#15171c"`
        );
      }
    );
  });

  it('Python은 흰 판에 공식 색 그대로다', () => {
    const svg = stickerSvg('lg:python:disc:w');
    expect(svg).toContain('r="39.5" fill="#fff" stroke="#15171c"');
    expect(svg).toContain(`d="${LOGOS.python.d}" fill="#3776ab"`);
    expect(svg).toContain(`d="${LOGOS.python.d2}" fill="#ffd43b"`);
  });

  it('먹색 판(Android)은 테두리와 로고만 홀로그램이다', () => {
    const svg = stickerSvg('lg:android:disc:k');
    expect(svg).toContain('fill="#15171c" stroke="url(#stk-holoC)"');
    expect(svg).toContain(`d="${LOGOS.android.d}" fill="url(#stk-holoL)"`);
  });

  it('스크립트·이벤트 속성·주소가 들어 있지 않다', () => {
    NAMES.map((name) => stickerSvg(name))
      .concat(STICKER_DEFS)
      .forEach((s) => {
        expect(s).not.toMatch(/<script|\son[a-z]+=|href=|https?:/i);
      });
  });
});

describe('STICKER_DEFS', () => {
  it('<defs> 안쪽만 담는다', () => {
    expect(STICKER_DEFS).not.toMatch(/<\/?(svg|defs)\b/);
  });

  it('그러데이션 셋과 칼선 필터 하나가 들어 있다', () => {
    expect(ids(STICKER_DEFS)).toEqual([
      'stk-diecut',
      'stk-holo',
      'stk-holoC',
      'stk-holoL',
    ]);
    expect(STICKER_DEFS.match(/<linearGradient /g)).toHaveLength(3);
    expect(STICKER_DEFS.match(/<filter /g)).toHaveLength(1);
    expect(STICKER_DEFS.match(/<animateTransform /g)).toHaveLength(3);
  });

  it('스티커가 가리키는 id는 모두 정의되어 있고, 쓰지 않는 그러데이션은 없다', () => {
    const used = uniq(
      NAMES.reduce(
        (all, name) => all.concat(refs(stickerSvg(name))),
        [] as string[]
      )
    );
    expect(used).toEqual(['stk-holo', 'stk-holoC', 'stk-holoL']);
    used.forEach((id) => expect(ids(STICKER_DEFS)).toContain(id));
  });

  it('색과 그림자는 목업 값 그대로다', () => {
    expect(STICKER_DEFS).toContain('stop-color="#ffb3d9"');
    expect(STICKER_DEFS).toContain('stop-color="#ff8fd0"');
    expect(STICKER_DEFS).toContain('flood-color="#0d1226"');
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- lib/sticker`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `lib/sticker/logos.ts`를 목업에서 뽑아 만든다.** 작업 폴더의 맨 위에서 아래 명령을 돌린다(내려받는 것이 없다. 목업 파일을 읽어 여섯 종의 쓰는 값만 적는다). 만든 뒤 파일을 열어 맨 위 주석 세 줄과 여섯 종인지를 본다.

```bash
mkdir -p lib/sticker
node <<'EOF' > lib/sticker/logos.ts
global.window = {};
require('./docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/logos.js');
var L = global.window.LOGOS;
var pick = { python: ['c', 'd', 'c2', 'd2'], js: ['d'], ts: ['d'], git: ['d'], linux: ['d'], android: ['d'] };
var rows = Object.keys(pick).map(function (k) {
  return '  ' + k + ': {\n' + pick[k].map(function (f) { return '    ' + f + ": '" + L[k][f] + "',\n"; }).join('') + '  },\n';
}).join('');
process.stdout.write([
  '// 목업의 도형(react-icons Simple Icons에서 꺼낸 것). 배포 전에 각 로고의 공식 파일로 바꾼다.',
  '// 턱스·Android·Git은 출처 표기 필요.',
  '// 로고는 각 권리자의 상표다. 로고 도형은 이 파일 한 곳에만 둔다.',
  "export type LogoKey = 'python' | 'js' | 'ts' | 'git' | 'linux' | 'android';",
  '',
  'export interface LogoShape {',
  '  d: string; // 24×24 도형',
  '  c?: string; // 공식 색 (공식 색 그대로 찍는 로고만)',
  '  c2?: string; // 둘째 색',
  '  d2?: string; // 둘째 색 조각',
  '}',
  '',
  'export const LOGOS: Record<LogoKey, LogoShape> = {',
].join('\n') + '\n' + rows + '};\n');
EOF
```

이 명령의 결과는 `.prettierrc.cjs`의 포맷과 같다(2026-11-18에 같은 출력으로 확인). 도형 문자열에는 작은따옴표와 역슬래시가 없다.

- [ ] **Step 4: `lib/sticker/art.ts`를 구현한다.** 위의 "목업의 어느 줄을 옮기는가" 표와 조합 표대로. `LOGOS`는 `lib/sticker/logos`에서 불러온다. 문자열 펼치기(`[...name]`)와 `for…of`를 쓰지 않는다.

- [ ] **Step 5: 확인**

Run: `pnpm test -- lib/sticker && npx tsc --noEmit`
Expected: PASS (logos 4개, art 17개), 타입 오류 없음

Run: `npx eslint lib/sticker/logos.ts lib/sticker/art.ts lib/sticker/__tests__/logos.test.ts lib/sticker/__tests__/art.test.ts`
Expected: 오류 없음

Run: `grep -n "JetBrains\|Gaegu\|c\.NOW\|new Date\|Math.random\|window\|diecut-up\|holoB" lib/sticker/art.ts`
Expected: 결과 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 2: `Sticker` · `StickerDefs` · 레이아웃에 한 번 넣기

목업 기준: 한 장을 붙이는 `stk()`(`login.js:57`, `mypage.js:11`)와 `.lg-stk`(`login.css:49`), 오른쪽에 붙는 것의 기준점(`login.css:55`, `mypage.css:109`), 정의를 담는 `<svg>`(`stickers.js:178`), 움직임 멈춤(`variants.js:458`, `:466`).

**Files:**
- Create: `components/common/sticker/Sticker.tsx`
- Create: `components/common/sticker/Sticker.module.scss`
- Create: `components/common/sticker/StickerDefs.tsx`
- Create: `components/common/sticker/useStillMotion.ts`
- Modify: `components/layout/index.tsx`

**Interfaces:**
- Consumes: `StickerName`, `stickerSvg`, `STICKER_DEFS` (`lib/sticker/art`. 작업 1)
- Produces:

```ts
// components/common/sticker/Sticker.tsx
export type StickerPlacement = {
  name: StickerName;
  x: number;        // 붙는 쪽 끝에서의 거리 (px)
  y: number;        // 위에서의 거리 (px)
  rotate: number;   // 기울기 (도)
  scale: number;    // 크기 배율
  side?: 'left' | 'right';   // 붙는 쪽. 넘기지 않으면 'left'
};
export default function Sticker(
  props: StickerPlacement & { className?: string }
): JSX.Element;

// components/common/sticker/StickerDefs.tsx
export default function StickerDefs(): JSX.Element;

// components/common/sticker/useStillMotion.ts
export default function useStillMotion(ref: React.RefObject<Element>): void;
```

쓰는 쪽에 여는 CSS 변수: **`--stk-origin`** — 돌리고 줄이는 기준점. 감싸는 요소에 주면 그 안의 스티커가 모두 따른다. 주지 않으면 붙는 쪽의 위 모서리다.

**`Sticker`가 그리는 것** — 목업의 `<span class="lg-stk" style="left:22px;top:30px;--r:-7deg;--s:0.86">…svg…</span>`와 같다.

- `<span>` 하나. 안쪽은 `dangerouslySetInnerHTML={{ __html: stickerSvg(name) }}`.
- 인라인 `style`: 붙는 쪽(`left` 또는 `right`)에 `x`px, `top`에 `y`px, `--r`에 `<rotate>deg`, `--s`에 `<scale>`. `transform`은 인라인으로 적지 않는다(SCSS가 변수로 만든다). 변수 이름이 들어간 `style`은 `as React.CSSProperties`로 넘긴다(`components/events/calendar/HeatLegend.tsx:30`과 같은 방식).
- 클래스는 `sticker`, `side === 'right'`이면 `right`도, 넘겨받은 `className`이 있으면 그것도 붙인다.
- `aria-hidden`·`role`을 붙이지 않는다(감싸는 쪽이 붙인다). 위에 적힌 props 말고는 DOM에 넘기지 않는다(`{...rest}`를 `<span>`에 펼치지 않는다).
- `useStillMotion`에 `<span>`의 ref를 넘긴다.

**`Sticker.module.scss`의 규칙** — 선택자는 클래스 하나짜리 둘뿐이다. `.right`는 `.sticker` 뒤에 적는다.

| 선택자 | 규칙 | 목업 |
|---|---|---|
| `.sticker` | `position: absolute; line-height: 0; user-select: none; filter: url(#stk-diecut); transform: rotate(var(--r)) scale(var(--s)); transform-origin: var(--stk-origin, 0 0);` | `login.css:49` |
| `.right` | `transform-origin: var(--stk-origin, 100% 0);` | `login.css:55`, `mypage.css:109` |

부모가 `position: relative`(또는 다른 위치 지정)여야 한다는 것과 `--stk-origin`의 뜻을 파일 맨 위 주석에 적는다. 색·transition·animation·미디어쿼리는 없다.

**`StickerDefs`가 그리는 것** — `<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">` 안에 `<defs dangerouslySetInnerHTML={{ __html: STICKER_DEFS }} />`. `display: none`·`visibility: hidden`으로 숨기지 않는다(Review Focus 1). SCSS 파일을 따로 만들지 않는다. `useStillMotion`에 `<svg>`의 ref를 넘긴다.

**`useStillMotion`의 규칙**

- 마운트된 뒤(`useEffect`, 의존 배열 `[]`) `window.matchMedia('(prefers-reduced-motion: reduce)').matches`가 참일 때만 움직인다. 거짓이면 아무것도 하지 않는다.
- 대상은 `ref.current`가 `<svg>`이면 그것, 아니면 그 안의 `<svg>` 모두. 대상마다 `pauseAnimations()`를 부른 뒤 `setCurrentTime(0)`을 부른다(프롬프트의 커서가 보이는 상태, 그러데이션이 처음 자리에서 멈춘다).
- `ref.current`가 없거나 `pauseAnimations`가 함수가 아니면(jsdom, 오래된 브라우저) 조용히 넘어간다.
- `NodeList`는 `for…of`·펼치기 없이 인덱스로 돈다.
- 화면이 떠 있는 동안 설정이 바뀌는 것은 따라가지 않는다(새로 고치면 반영된다).

**`components/layout/index.tsx`** — 지금 내용에 두 줄만 더한다. import 한 줄(`import StickerDefs from 'components/common/sticker/StickerDefs';`)과, 프래그먼트의 **첫 자식**으로 `<StickerDefs />`(`<Header />` 앞). 정의가 가리키는 쪽보다 문서에서 먼저 나오게 하고, 같은 id가 본문에 있어도 이쪽이 먼저 잡히게 한다. 이미 있는 줄(상대 경로 import, `subscribe` 분기)은 고치지 않는다.

- [ ] **Step 1: `useStillMotion.ts`를 만든다.**
- [ ] **Step 2: `Sticker.tsx`와 `Sticker.module.scss`를 만든다.** `classNames.bind(style)`을 `cn`으로.
- [ ] **Step 3: `StickerDefs.tsx`를 만든다.**
- [ ] **Step 4: `components/layout/index.tsx`에 `StickerDefs`를 넣는다.**

- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && npx eslint components/common/sticker/Sticker.tsx components/common/sticker/StickerDefs.tsx components/common/sticker/useStillMotion.ts components/layout/index.tsx`
Expected: 오류 없음 (`components/layout/index.tsx`는 이 단계 전에도 오류가 없다)

Run: SCSS 확인 — `components/common/sticker/Sticker.module.scss`
Expected: `ok`

Run: `grep -rn "StickerDefs" components pages --include='*.tsx' | grep -v "^components/common/sticker/"`
Expected: `components/layout/index.tsx`의 두 줄(import, `<StickerDefs />`)만 나온다

Run: `grep -n "transform\|display: none\|visibility" components/common/sticker/Sticker.tsx components/common/sticker/StickerDefs.tsx`
Expected: 결과 없음

Run: `grep -n "url(#\|stk-origin" components/common/sticker/Sticker.module.scss`
Expected: `filter: url(#stk-diecut);` 한 줄과 `--stk-origin`이 든 두 줄(주석에 적은 줄은 빼고 센다). `url(#…)`는 Next의 css-loader가 파일 경로로 풀지 않고 그대로 둔다(`node_modules/next/dist/build/webpack/loaders/css-loader/src/utils.js`의 `isUrlRequestable`).

코드로 볼 것(Review Focus 1·2·5): `Sticker`가 `className`을 `<span>`에 붙이는지, `useStillMotion`이 `Sticker`와 `StickerDefs` 양쪽에서 불리는지, `StickerDefs`가 `Layout`의 첫 자식인지, 기준점이 두 규칙 모두 `var(--stk-origin, …)`인지.

관리자가 화면에서 볼 것: 없음(스티커를 쓰는 화면이 아직 없다). 4·7·8단계에서 볼 것은 작업 4의 Step 3.

---

### Task 3: 배치 묶음

목업 기준: `login.js:65`, `mypage.js:67`(`:124`와 같은 값), `mypage.js:131`, `variants.js:205-210`과 빈자리의 프롬프트(`:21`의 `SLOTS.prompt`, `:23`). 배너 목록의 칸 뜻은 `variants.js:16`의 주석.

**Files:**
- Create: `components/common/sticker/stickerSets.ts`
- Create: `components/common/sticker/__tests__/stickerSets.test.ts`

**Interfaces:**
- Consumes: `StickerPlacement` (`components/common/sticker/Sticker`. **`import type`으로** 불러온다. 테스트가 `Sticker.tsx`와 SCSS를 실행하지 않게 한다)
- Produces:

```ts
// components/common/sticker/stickerSets.ts
export const LOGIN_BAND: StickerPlacement[];     // 로그인 창 머리띠 (6장)
export const SAVED_BAND: StickerPlacement[];     // 관심 행사 머리띠 (6장, 모두 오른쪽)
export const ME_BAND: StickerPlacement[];        // 내 정보 머리띠 (5장. 노트북이 없다)
export const BANNER_HOLO1: StickerPlacement[];   // 배너 없을 때의 홀1 묶음, PC 배치 (11장)
```

값은 아래 테스트의 표가 기준이다(목업 값을 옮긴 것). 테스트의 한 줄 `[이름, 붙는 쪽, x, y, 기울기, 크기]`가 `StickerPlacement` 하나다. 왼쪽에 붙는 것은 `side`를 적지 않아도 된다.

**테스트·시그니처만으로 정해지지 않는 규칙**

- **배열의 순서는 목업 그대로 둔다.** 뒤에 그린 것이 위에 놓이고, 8단계가 순서로 스티커를 숨긴다(내 정보 머리띠는 520px 이하에서 둘째·넷째를 숨긴다. `mypage.css:348`).
- 배너 묶음은 PC 값만 담는다. 목업 목록의 일곱째 칸(860px 이하의 자리)과 아홉째 칸(1180px 이하에서 숨김)은 4단계가 자기 파일(`components/common/banner/holoLayout.ts`)에 둔다. 목업의 `'l'`·`'r'`은 `'left'`·`'right'`로 적는다.
- 이 파일에는 상수만 둔다. 부품·SCSS를 불러오지 않는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/common/sticker/__tests__/stickerSets.test.ts`

```ts
import {
  BANNER_HOLO1,
  LOGIN_BAND,
  ME_BAND,
  SAVED_BAND,
} from 'components/common/sticker/stickerSets';
import { STICKER_NAMES } from 'lib/sticker/art';

type Placed = {
  name: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  side?: string;
};
type Row = [string, string, number, number, number, number];

const rows = (set: Placed[]): Row[] =>
  set.map((p): Row => [p.name, p.side || 'left', p.x, p.y, p.rotate, p.scale]);
const ALL: Placed[][] = [LOGIN_BAND, SAVED_BAND, ME_BAND, BANNER_HOLO1];

describe('스티커 배치 묶음', () => {
  it('묶음마다 장수', () => {
    expect(ALL.map((set) => set.length)).toEqual([6, 6, 5, 11]);
  });

  it('이름은 모두 stickerSvg가 그릴 수 있는 것이고, 한 묶음 안에서 겹치지 않는다', () => {
    ALL.forEach((set) => {
      const names = set.map((p) => p.name);
      names.forEach((name, i) => {
        expect(STICKER_NAMES).toContain(name);
        expect(names.indexOf(name)).toBe(i);
      });
    });
  });

  it('옮긴 그림 가운데 어느 묶음도 쓰지 않는 것은 없다', () => {
    const used = ALL.reduce((all, set) => all.concat(set), [] as Placed[]).map(
      (p) => p.name
    );
    STICKER_NAMES.forEach((name) => expect(used).toContain(name));
  });

  it('로그인 창 머리띠 (login.js:65)', () => {
    expect(rows(LOGIN_BAND)).toEqual([
      ['holo:logo', 'left', 22, 30, -7, 0.86],
      ['lg:js:hex:h', 'left', 178, 12, 9, 0.6],
      ['laptop', 'left', 96, 80, 8, 0.6],
      ['prompt', 'right', 118, 70, -6, 0.7],
      ['lg:linux:hex:h', 'right', 66, 8, 8, 0.62],
      ['lg:python:disc:w', 'right', 22, 78, -10, 0.52],
    ]);
  });

  it('관심 행사 머리띠 (mypage.js:67) — 모두 오른쪽에 붙는다', () => {
    expect(rows(SAVED_BAND)).toEqual([
      ['holo:logo', 'right', 300, 26, -7, 0.9],
      ['lg:js:hex:h', 'right', 196, 18, 9, 0.66],
      ['laptop', 'right', 232, 96, 8, 0.66],
      ['prompt', 'right', 96, 84, -6, 0.78],
      ['lg:linux:hex:h', 'right', 92, 10, 8, 0.66],
      ['lg:python:disc:w', 'right', 22, 62, -10, 0.58],
    ]);
  });

  it('내 정보 머리띠 (mypage.js:131) — 노트북이 없다', () => {
    expect(rows(ME_BAND)).toEqual([
      ['holo:logo', 'left', 26, 34, -7, 0.9],
      ['lg:js:hex:h', 'left', 196, 14, 9, 0.62],
      ['prompt', 'right', 150, 62, -6, 0.74],
      ['lg:linux:hex:h', 'right', 84, 10, 8, 0.64],
      ['lg:python:disc:w', 'right', 26, 70, -10, 0.54],
    ]);
  });

  it('배너 홀1의 PC 배치 (variants.js:205-210, 빈자리는 프롬프트)', () => {
    expect(rows(BANNER_HOLO1)).toEqual([
      ['holo:logo', 'left', 10, 16, -7, 1],
      ['laptop', 'left', 28, 104, 8, 0.9],
      ['lg:python:disc:w', 'left', 156, 72, -10, 0.94],
      ['lg:js:hex:h', 'left', 248, 2, 9, 0.8],
      ['lg:android:disc:k', 'left', 266, 106, 12, 0.76],
      ['lg:linux:hex:h', 'right', 22, 6, 8, 0.98],
      ['term', 'right', 24, 108, -5, 0.9],
      ['lg:ts:disc:h', 'right', 170, 82, 9, 0.9],
      ['prompt', 'right', 174, 8, -9, 0.92],
      ['holo:code', 'right', 262, 20, -8, 0.78],
      ['lg:git:disc:h', 'right', 268, 108, 5, 0.72],
    ]);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- stickerSets`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `stickerSets.ts`를 만든다.** 테스트의 표와 목업 줄을 나란히 놓고 옮긴다.

- [ ] **Step 4: 확인**

Run: `pnpm test -- stickerSets lib/sticker && npx tsc --noEmit && npx eslint components/common/sticker/stickerSets.ts components/common/sticker/__tests__/stickerSets.test.ts`
Expected: PASS (stickerSets 7개, 작업 1의 21개도 그대로), 타입·린트 오류 없음

`pnpm test`가 `Sticker.tsx`의 타입을 읽다가 오류를 내면(테스트가 도는 `.ts`가 JSX가 든 `.tsx`에서 타입을 가져오는 첫 사례다) 고치지 말고 보고한다. 그때의 방법은 `StickerPlacement`를 `stickerSets.ts`에서 정의하고 `Sticker.tsx`가 `export type { StickerPlacement } from …`으로 다시 내보내는 것이다(밖에서 보는 이름과 위치는 같다).

관리자가 화면에서 볼 것: 없음.

---

### Task 4: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인** (`pnpm build`는 여기서 한 번만)

Run:
```bash
npx tsc --noEmit
pnpm test
npx eslint lib/sticker/logos.ts lib/sticker/art.ts lib/sticker/__tests__/logos.test.ts lib/sticker/__tests__/art.test.ts components/common/sticker/Sticker.tsx components/common/sticker/StickerDefs.tsx components/common/sticker/useStillMotion.ts components/common/sticker/stickerSets.ts components/common/sticker/__tests__/stickerSets.test.ts components/layout/index.tsx
pnpm build
```
Expected: 모두 통과. 테스트는 이 단계에서 28개가 늘어난다(logos 4, art 17, stickerSets 7). 이 단계와 무관한 파일에서 나는 오류는 고치지 않고 보고한다.

Run: SCSS 확인 — `components/common/sticker/Sticker.module.scss`
Expected: `ok`

Run: `grep -rlq "stk-diecut" .next/server && echo ok`
Expected: `ok` (정의가 빌드 결과물에 들어갔다)

- [ ] **Step 2: 약속을 지켰는지**

Run: `grep -rlE "M14\.25 0\.18l|M21\.04 6\.11l|M0 0h24v24H0V0zm22\.034|M1\.125 0C\.502|M23\.546 10\.93L|M12\.504 0c-\.155|M17\.523 15\.3414" components lib pages`
Expected: `lib/sticker/logos.ts` 하나(로고 도형이 다른 파일에 없다)

Run: `grep -rnE "<Sticker\b|stickerSets|stickerSvg" components pages --include='*.tsx' --include='*.ts' | grep -v "^components/common/sticker/\|^components/common/banner/"`
Expected: 결과 없음(쓰는 화면은 4·7·8단계가 붙인다. 4단계가 먼저 진행 중이면 `components/common/banner/`에만 있다)

Run: `grep -rn "JetBrains\|Gaegu\|fonts.googleapis" lib/sticker components/common/sticker pages/_document.tsx`
Expected: 결과 없음

Run: `head -2 components/common/sticker/Sticker.module.scss | grep import; grep -nE "#[0-9a-fA-F]{3,6}\b|transition|animation|@media" components/common/sticker/Sticker.module.scss`
Expected: 첫 명령은 `@import '~styles/_variables.scss';`, `@import '~styles/_mixin.scss';` 순서. 둘째 명령은 결과 없음

Run: `git status --short | grep "^ D\|^D "; git status --short -uall lib/sticker components/common/sticker components/layout/index.tsx`
Expected: 첫 명령은 결과 없음(지운 파일이 없다). 둘째 명령은 File Structure에 적힌 파일뿐이다(`lib/sticker/` 넷, `components/common/sticker/` 여섯, `components/layout/index.tsx`). 배너·로그인 창·관심 행사·내 정보의 파일은 이 단계에서 열어 고치지 않는다.

- [ ] **Step 3: 뒤 단계의 확인 목록으로 넘길 것을 보고한다.** 이 단계에는 볼 화면이 없다. 아래를 4·7·8단계 계획의 "관리자가 화면에서 볼 것"에 넣도록 보고에 적는다.

  1. 스티커에 흰 칼선과 그림자가 보이고 홀로그램 판이 흐른다. 로그인 창(포털 안)에서도, 상세 화면에서 연 로그인 창에서도 같다.
  2. Safari에서도 칼선·그림자·홀로그램이 보이고 흐릿하지 않다(목업은 미리보기 브라우저로만 봤다).
  3. 운영체제의 "동작 줄이기"를 켜고 새로 고치면 홀로그램이 흐르지 않고 프롬프트의 커서가 보이는 채로 멈춘다.
  4. `term`의 두 줄과 `laptop`·`holo:code`의 `</>`가 판 안에 들어온다(글꼴이 목업과 다르다).
  5. 배너에서 스티커의 자리가 목업과 겹쳐 보았을 때 같다(기준점. Review Focus 5).
  6. 스티커가 많은 배너에서 스크롤이 끊기지 않는다(흐르는 그러데이션 위에 필터가 걸려 있다).
  7. 스티커의 글자("DEV.EVENT", "$ git push")를 화면 읽기 도구가 읽지 않는다(감싸는 쪽의 `aria-hidden`).

**이 단계가 끝난 뒤의 모습:** 화면은 예전 그대로입니다. `Layout`을 쓰는 모든 화면의 HTML 맨 앞에 크기 0인 `<svg>`(그러데이션 셋, 필터 하나)가 하나 들어갑니다.

---

## 9단계에서 지울 것

이 단계는 더하기만 해서 쓰는 곳이 없어진 파일·변수가 없습니다.

**배포 전에 할 것** (로드맵 0단계의 "스티커에 쓰는 로고 여섯 종의 공식 파일"이 아직 남아 있다)
- `lib/sticker/logos.ts`의 도형을 각 로고의 공식 파일에서 가져온 것으로 바꾼다. `logos.test.ts`의 길이·앞머리 표를 함께 고친다. 공식 도형의 기준 칸이 24×24가 아니면 `art.ts`의 로고 배치(`translate`·`scale`)도 맞춘다.
- 턱스·Android·Git의 출처 표기를 넣는다. 조건은 설명 페이지(`detail-design/index.html`) "배너" 절의 "로고를 써도 되는지" 표. 어디에 적을지는 정해지지 않았다("확인이 필요한 것" 2).

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **옮기는 그림은 열한 가지, 로고는 여섯 종.** 로드맵이 적은 머리띠의 여섯 가지(`holo:logo`, `lg:js:hex:h`, `lg:linux:hex:h`, `lg:python:disc:w`, `laptop`, `prompt`)는 목업과 같았다. 배너 홀1이 여기에 `term`, `holo:code`, `lg:ts:disc:h`, `lg:git:disc:h`, `lg:android:disc:k`를 더한다. 로고 여섯 종은 로드맵 0단계의 목록(Python, JavaScript, TypeScript, Git, 턱스, Android)과 같다.
2. **id에 `stk-`를 붙였다.** 목업의 `holo`·`diecut`은 문서 전체에서 겹치기 쉬운 이름이다(상세 본문의 제목 id).
3. **정의는 쓰는 것만.** 그러데이션 `holo`·`holoC`·`holoL`과 필터 `diecut`. 목업의 `holoB`는 고른 그림이 가리키지 않고, `diecut-up`은 4단계가 넣지 않기로 한 동작(올렸을 때 들림, 끌어 옮기기)의 것이며, `kisscut`·`ringp`는 옮기지 않는 그림의 것이다. 로고의 판 색을 고르는 목업의 계산(`hv`: 이름 글자의 합을 3으로 나눈 나머지)은 결과를 표로 고정했다.
4. **오른쪽에 붙는 스티커의 기준점은 `100% 0`이다.** 받은 지시는 "`transform-origin: 0 0`"이었지만 목업의 세 머리띠는 모두 오른쪽 것만 `100% 0`으로 덮는다(`login.css:55`, `mypage.css:109`). `0 0`으로 두면 크기를 줄일 때 오른쪽 끝에서 멀어져 자리가 목업과 달라진다. 목업을 따랐다.
5. **기준점을 CSS 변수 `--stk-origin`으로 열었다.** 목업의 배너는 가운데가 기준이다(Review Focus 5). `StickerPlacement`와 `Sticker`의 props는 받은 그대로 두고, 감싸는 요소가 변수 하나로 바꿀 수 있게 했다. 주지 않으면 머리띠의 방식이다.
6. **`STICKER_NAMES`(이름 목록)를 함께 내보낸다.** 유니언 타입만으로는 테스트가 "모든 이름"을 돌 수 없다. `StickerName`은 이 목록에서 만든 문자열 유니언이다.
7. **`BANNER_HOLO1`은 PC 배치만 담는다.** 목업의 홀1은 장마다 860px 이하의 자리와 1180px 이하에서 숨기는 표시도 갖고 있는데, 4단계 계획(`2026-11-18-redesign-4-banner.md`)이 그것을 자기 파일에 두기로 했다. 같은 값을 두 곳에 적지 않는다.
8. **`useStillMotion`을 따로 두었다.** 받은 파일 목록에는 없다. `Sticker`와 `StickerDefs`가 같은 일을 해야 해서 한 파일로 뺐다. 목업은 배너의 스티커만 멈추는데, 계획은 머리띠의 것도 멈춘다(로드맵 공통 규칙 8. 4단계 계획도 이것을 2단계의 몫으로 적었다).
9. **`StickerDefs`는 `Layout`의 첫 자식이다.** 목업은 머리띠·배너마다 정의를 통째로 넣어 같은 id가 화면에 여러 번 생긴다. 한 번만 넣는다.
10. **로고 파일은 명령으로 뽑는다.** 손으로 옮겨 적다 틀리는 것을 막는다. 테스트는 목업 폴더를 읽지 않고(그 폴더는 아직 커밋되지 않았다) 길이와 앞머리만 고정한다.
11. **`user-select: none`을 더했다.** 목업의 머리띠에는 없고 배너에는 있다. 장식의 글자가 끌어서 선택되지 않게 한다.
12. **로고 뒤의 빈 네모(`bk`)와 쓰지 않는 공식 색은 옮기지 않았다.** 고른 조합에서는 그려지는 것이 없다.

### 뒤 단계(4·7·8)가 알아 둘 것

- 쓰는 법: `position: relative`인 머리띠 안에 `{LOGIN_BAND.map((p) => <Sticker key={p.name} {...p} />)}`. 한 묶음 안에서 이름이 겹치지 않아 `key`로 쓸 수 있다(테스트가 본다). **`StickerDefs`를 넣지 않는다**(이미 `Layout`에 있다). **`aria-hidden="true"`는 감싸는 요소에 붙인다.**
- 스티커 한 장의 모양을 바꿔야 하면 `className`을 넘기고 `.머리띠 .그클래스 { … }`처럼 클래스 둘로 쓴다(`Sticker` 쪽 규칙이 클래스 하나짜리라, 불러오는 순서와 무관하게 쓰는 쪽 규칙이 이긴다). 숨기는 것은 감싸는 쪽에서 `.머리띠 > :nth-child(2) { display: none; }`처럼 해도 된다.
- 머리띠의 모바일 규칙은 목업 CSS에 있다: 로그인 창 머리띠 높이 138 → 118px(`login.css:54`, `:149`), 관심 행사는 860px 이하에서 스티커 묶음 전체를 `scale(.74)`(기준점 오른쪽 위. `mypage.css:324`), 내 정보는 높이 150 → 128px(`:207`, `:336`)이고 520px 이하에서 둘째(`lg:js:hex:h`)·넷째(`lg:linux:hex:h`)를 숨긴다(`:348`).
- **배너는 기준점이 가운데다**(`variants.css:571`의 `transform-origin: 50% 50%`). 스티커 묶음을 감싸는 요소에 `--stk-origin: 50% 50%;`를 준다. 860px 이하의 자리·크기(`variants.css:581`, `:649`)도 같은 기준점으로 잡힌 값이다.
- 머리띠·배너의 바탕(어두운 방사형 그러데이션 `#1a1d2b → #0b0d14`)은 이 단계에 없다. 쓰는 쪽이 그린다.

### 확인이 필요한 것

1. **4단계 계획에 기준점 한 줄이 빠져 있다.** `2026-11-18-redesign-4-banner.md`는 `Sticker`에 `BANNER_HOLO1`의 숫자를 그대로 넘기는데, 기준점을 바꾸지 않으면 배너의 스티커가 목업보다 PC에서 10px 안팎, 860px 이하에서 최대 30px쯤 어긋난다(크기를 줄일수록 커진다). 4단계 계획의 스티커 묶음 요소(`.stickers`)에 `--stk-origin: 50% 50%;`를 더해야 한다. 이 문서는 4단계 계획을 고치지 않았다.
2. **로고의 출처 표기를 어디에 적을지.** 턱스·Android·Git은 표기가 필요한데 자리가 정해지지 않았다(푸터, 소개 화면, 따로 둔 안내 등). 이 단계는 표기를 넣지 않고 `logos.ts` 주석에만 남긴다. 공식 파일로 바꾸는 일과 함께 배포 전에 해야 한다. 로드맵 0단계는 이 일을 "2단계 전"으로 적었는데, 받은 결정대로 목업 도형으로 먼저 진행한다(로드맵의 그 줄은 고치지 않았다).
3. **글꼴이 바뀌어 `</>`와 `$ git push`의 글자 모양이 목업과 조금 다르다.** 받은 결정(글꼴을 더하지 않음)대로다. 판을 벗어나는지는 4단계에서 본다.
4. **움직임 줄이기 설정은 화면을 열 때 한 번만 읽는다.** 서버가 보낸 HTML이 뜬 뒤 스크립트가 붙기 전의 짧은 동안은 흐른다.
5. **스티커 필터의 무게.** 그림마다 "넓히기 + 흐리기 둘" 필터가 걸리고, 홀로그램 판은 그러데이션이 흐르는 동안 계속 다시 그려진다. 목업과 같은 구조다. 4단계 계획은 배너에 폭별로 모두 열아홉 장을 그려 두고 묶음을 숨긴다. 끊기면 4단계에서 흐름을 멈추거나 장수를 줄이는 것을 정해야 한다.

### 계획을 쓰면서 본 목업의 문제

- `DEFS`를 머리띠·배너마다 넣어, 로그인 창을 메인에서 열면 같은 id의 정의가 두 벌이 된다(`login.js:65`, `variants.js:205`).
- 움직임 줄이기에서 배너의 스티커만 멈춘다(`variants.js:466`의 `.eb-stk svg`). 로그인 창·관심 행사·내 정보 머리띠의 홀로그램과 커서는 계속 움직인다.
- 머리띠와 배너가 스티커를 붙이는 법이 다르다(`.lg-stk`는 기준점이 모서리, `.stk`는 가운데). 같은 `x`·`y`라도 놓이는 자리가 다르다.
- `mypage.js:124`의 `BAND`는 `sv6`(`:67`)와 같은 값을 한 번 더 적은 것이고, 쓰는 곳은 거절된 `me2a`·`me2b`뿐이다.
- `logos.js`의 열여덟 종 가운데 열두 종은 결정된 화면이 쓰지 않는다(홀2 벌집용).
