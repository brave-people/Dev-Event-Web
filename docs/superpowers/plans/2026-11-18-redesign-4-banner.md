# 리디자인 4단계 — 배너 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 목록·캘린더·검색 화면 맨 위의 배너를 "물결 영상 위의 슬로건(높이 448px)"에서 "서버에 등록된 상단 배너(왼쪽 글, 오른쪽 이미지, 바탕은 API의 배경색)"로 바꾼다. 등록된 배너가 없거나 불러오지 못하면 홀로그램 스티커(홀1) 위에 지금의 슬로건을 보여 준다. 높이는 PC 200px, 모바일 150px.

**Architecture:** 배경색 검사·글자색 고르기·링크 판정·응답 거르기·넘기기는 `lib/utils/banner/`의 순수 함수로 빼고 테스트를 먼저 쓴다. 배너 목록은 `getServerSideProps`가 행사 조회와 **나란히** 받아 props로 넘기고(실패하거나 늦으면 빈 배열), 화면은 SWR 훅 `useTopBanners(fallbackData)`로 이어받는다. 화면은 `components/common/banner/`에 새 부품 둘(`RegisteredBanner`, `HoloBanner`)을 만들고, 지금의 `banner.tsx`는 둘 중 하나를 고르는 일만 하게 고쳐 쓴다(파일 경로와 default export가 그대로라 페이지의 import는 바뀌지 않는다). 스티커 그림과 배치는 2단계가 만든 것을 쓰고, 이 단계는 폭에 따라 어느 스티커를 어디에 보일지만 정한다. 옛 스타일 파일과 물결 영상은 지우지 않는다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / axios 0.26 / jest (ts-jest)

**Spec:** `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/index.html`의 "배너" 절(`:320-353` 결정과 API 표, `:354-357` 홀1), 움직이는 목업 `detail-design/app.html`(`app.js:124-145`, `variants.js:14-24`·`:36-38`·`:205-210`, `variants.css:338-355`·`:566-581`·`:619-620`·`:638-649`). 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`. 스티커는 `2026-11-18-redesign-2-sticker.md`와 **실제 파일**(`components/common/sticker/`, `lib/sticker/`). 계획과 실제 파일이 다르면 실제 파일이 기준이다.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm dev`·`pnpm start`로 화면을 띄우지 않는다. **`pnpm build`는 작업 6에서 한 번만 돌린다.** `pnpm lint`는 돌지 않으므로 `npx eslint <바꾼 파일>`을 쓴다. 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다(문서 끝 "관리자 확인"). 파일을 지우지 않는다. 파일 내려받기·바깥 요청 없음.

## Global Constraints

- **API는 서버 코드에서 확인한 그대로 쓴다.** 경로는 `GET ${BASE_SERVER_URL}/banner/top`(앞에 `/front/...`가 붙지 않는다. 인증 없음). 응답은 배열이고 항목의 필드는 아래 아홉 개다(서버 저장소 `Dev-Event-Server`, 로컬 `feature/image-opt-260924`의 `TopBannerController`·`TopBannerResponseDTO`·`RedisCacheConfig`에서 읽음). **운영 응답으로는 확인하지 못했다**(등록된 배너가 없어 빈 배열만 온다).

  | 필드 | 형 | 화면에서 쓰는 곳 |
  |---|---|---|
  | `id` | 숫자 | key |
  | `title` | 문자열 | 제목 |
  | `banner_image` | 문자열 | 오른쪽 이미지 |
  | `event_link` | 문자열 또는 null (서버가 필수로 검사하지 않는다) | "자세히 보기"와 이미지가 가는 곳 |
  | `background_color` | 문자열 (최대 10자, 형식 검사 없음) | 바탕색 |
  | `start_date_time`, `end_date_time` | `'YYYY-MM-DDTHH:mm:ss'` | 쓰지 않는다 (서버가 걸러서 준다) |
  | `create_date_time`, `update_date_time` | 같은 꼴 | 쓰지 않는다 |

  목업과 설명 페이지에 적힌 `priority`·`visible_yn`은 **응답에 없다**. 순서는 서버가 우선순위 높은 순으로 정해 주므로 받은 순서대로 그린다.
- **지금 스펙 그대로.** 주소, `Cache-Control`, `<Head>`, 모달 게이팅(`modalState.currentModal === 0`일 때만 본문)은 건드리지 않는다. 지금 `banner.tsx`에는 링크도 측정 이벤트(GA) 호출도 없다. **GA 호출을 새로 넣지 않는다.** 페이지의 `<h1>`은 지금처럼 슬로건이다(작업 3·4).
- **배너 조회가 실패하거나 늦어도 페이지는 뜬다.** 서버 쪽 조회는 던지지 않고 빈 배열을 돌려주며 2초에서 끊는다. 브라우저 쪽 조회는 `axiosInstance`의 오류 처리(`lib/api/error.tsx`의 `alert`)를 타지 않게 한다(작업 2).
- **저절로 넘어가지 않는다.** 여러 건이면 화살표로만 넘긴다. `setInterval`·`setTimeout`·스와이프를 넣지 않는다. 배너를 닫는 버튼도 없다(결정된 시안에 없다).
- **스티커는 장식이다.** 목업의 홀1에는 끌어 옮기기(`variants.js:467-476`)와 올렸을 때 들리는 움직임(`variants.css:575`)이 들어 있다. **둘 다 넣지 않는다**(지금 스펙에 없는 동작). 누르면 필터가 걸리는 스티커는 홀1에 없다(`variants.js:205-210`의 여덟째 칸이 모두 비어 있다). 스티커 묶음은 `aria-hidden="true"`와 `pointer-events: none`이다. `StickerDefs`는 `components/layout/index.tsx`에 이미 있으므로 배너에 넣지 않는다.
- 색은 `--de-*` 변수. 고정 색 값은 아래만 허용한다(바탕색은 API 값, 나머지는 목업 값).

  | 쓰임 | 값 | 목업 |
  |---|---|---|
  | 등록 배너의 기본 바탕 (값이 색 형식이 아닐 때) | `#000040` | `app.js:140` |
  | 등록 배너의 글자: 어두운 쪽 / 밝은 쪽 | `#101216` / `#ffffff` | `app.js:137` |
  | 밝은 글자일 때 화살표 테두리 / 올렸을 때 / 이미지 자리 | `rgba(255, 255, 255, 0.28)` / `0.12` / `0.1` | `variants.css:344-347`의 `color-mix`를 풀어 쓴 값 |
  | 어두운 글자일 때 같은 셋 | `rgba(16, 18, 22, 0.28)` / `0.12` / `0.1` | 같음 |
  | 홀로그램 배너의 바탕 | `radial-gradient(ellipse 50% 120% at 50% 50%, #1a1d2b 0%, #0b0d14 75%)` | `variants.css:619` |
  | 홀로그램 배너의 글자 / 강조 | `#fff` / `#a8c4ff` | `variants.css:619-620` |

  배너는 밝은 화면과 어두운 화면에서 모습이 같다(목업도 그렇다). `color-mix()`는 쓰지 않는다(이 저장소에 쓰는 곳이 없고 받지 못하는 브라우저가 있다).
- 크기는 px. 폭이 바뀌는 자리: **1180px**(스티커 세 장 숨김. `@media (max-width: 1180px)`로 직접 쓴다), **860px**(`de-mobile`), **621~860px**(`de-tablet`), **620px 이하**(`@media (max-width: 620px)`로 직접 쓴다). 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수는 새 파일에서 쓰지 않는다.
- 폭 분기는 CSS 미디어쿼리로만. `window.innerWidth`·`WindowContext.windowX`를 쓰지 않는다.
- SCSS에서 공용 파일은 전체 파일명과 물결표, 변수 먼저: `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`
- CSS Module에서 태그만으로 고르는 선택자(`h2 { … }`, `.title em { … }`)를 쓰지 않는다. 요소마다 클래스를 준다.
- import는 프로젝트 루트 기준 절대 경로.
- `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다. `Map`·`Set`을 `[...x]`나 `for…of`로 돌리지 않는다.
- 데이터는 SWR 훅으로(`lib/hooks/useSWR.tsx`). 부품 안에서 `fetch`를 부르지 않는다.
- 이미지는 `next/image` + `unoptimized`. `next.config.js`는 고치지 않는다(작업 3).
- `prefers-reduced-motion: reduce`에서는 이 단계의 transition을 끈다(`de-reduced-motion`. `de-press`는 믹스인 안에서 이미 끈다). 스티커 안의 움직임을 멈추는 것은 2단계의 몫이다.
- 문구는 이 계획에 적힌 그대로. **건수를 요약하는 문구를 새로 만들지 않는다.** 숫자는 쪽수(`1 / 3`)뿐이다.
- **3단계·5단계 파일은 `pages/events.tsx`·`pages/search.tsx`만, 작업 5에 적힌 줄만 고친다.** `EventTimeline`, `EventCalendar`와 그 아래 부품은 열어 고치지 않는다.
- 파일을 지우지 않는다. 쓰지 않게 된 것은 문서 끝 "9단계에서 지울 것"에 적는다.
- 작업마다의 확인 명령은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일>`이고 `pnpm build`는 작업 6에서 한 번이다. 지금(2026-11-18) 테스트는 28묶음 327개가 통과하고, 이 단계가 고치는 기존 파일의 eslint 결과는 `lib/api/handler.tsx`의 경고 4개(`no-explicit-any`)뿐이다. SCSS를 만든 작업은 아래 명령으로 문법을 확인한다(이 문서에서 "SCSS 확인"이라고 부른다).

```bash
node -e "const sass=require('sass');const imp={findFileUrl(u){return u.startsWith('~')?new URL('file://'+process.cwd()+'/'+u.slice(1)):null}};process.argv.slice(1).forEach(f=>{sass.compile(f,{importers:[imp],logger:sass.Logger.silent});console.log('ok',f)})" <scss 파일들>
```

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계와 "관리자 확인"에 넣었습니다.

1. **운영 응답을 본 적이 없다** — 운영에는 등록된 배너가 없어 응답 모양을 서버 코드로만 확인했다. 필드 이름이 다르거나(`backgroundColor`), 배열이 아닌 것이 오거나, `event_link`·`banner_image`가 비어 와도 화면이 깨지지 않고 슬로건이나 "있는 것만 그린 배너"로 떨어져야 한다. 가짜 API의 응답도 서버와 같은 모양이어야 비교가 뜻이 있다. (작업 1의 테스트, 작업 6)
2. **배너 때문에 페이지가 늦거나 경고창이 뜬다** — 배너 조회를 행사 조회 뒤에 차례로 부르면 응답이 그만큼 늦어지고, 배너 서버가 멈추면 페이지 전체가 멈춘다. 브라우저에서 `axiosInstance`로 부른 조회가 502 같은 응답을 받으면 `lib/api/error.tsx`가 "요청과정에서 문제가 발생했습니다."를 `alert`으로 띄운다(`axiosInstance.tsx:23-31`, `error.tsx:89-91`). 배너는 없어도 되는 것이라 둘 다 일어나면 안 된다. (작업 2, 작업 5)
3. **배경색에 따라 글자가 안 읽힌다** — 잘못된 값(`blue`, `0d1330`, 빈 문자열), 밝은 색(`#ffe55c`, `#ffffff`), 중간 밝기(`#777777`, `#e5484d`)에서 제목·머리말(투명도 0.7)·쪽수·"자세히 보기"·화살표 테두리·포커스 테두리가 모두 보여야 한다. 어두운 화면으로 바꿔도 배너는 같은 색이어야 한다. (작업 1의 테스트, 작업 3)
4. **0건·1건·여러 건** — 0건은 슬로건, 1건은 화살표와 쪽수가 없고, 여러 건은 끝에서 처음으로 돈다. 화살표를 누른 뒤 포커스가 그 버튼에 남아야 한다(목업은 다시 그리면서 포커스를 잃는다). 가만히 두면 넘어가지 않는다. 필터 모달을 열었다 닫으면 배너가 다시 그려져 첫 배너로 돌아간다(지금 구조의 결과. 그대로 둔다). (작업 3)
5. **이미지가 깨졌을 때, 제목이 아주 길 때** — 이미지 주소가 비었거나 받지 못하면 빈 회색 칸이 남지 않고 글이 폭을 다 써야 한다. 허용 목록(`next.config.js > images.domains`)에 없는 호스트의 이미지도 떠야 한다. 제목은 두 줄에서 말줄임이고, 띄어쓰기 없는 긴 글자열이 칸을 밀어내지 않아야 하며, 390px에서도 높이가 150px 언저리를 지켜야 한다. (작업 3)
6. **링크** — `event_link`가 우리 사이트 주소면 같은 탭, 바깥 주소면 새 탭, 비었거나 `javascript:` 같은 값이면 버튼이 없어야 한다. (작업 1의 테스트, 작업 3)
7. **스티커가 폭에 따라 목업과 다르게 놓인다** — 1280px(열한 장), 1100px(여덟 장), 700px(네 장, 조금 크게), 390px(네 장)에서 목업과 같은 자리여야 하고, 스티커를 끌 수 없고 올려도 움직이지 않아야 한다. 861~1000px에서 스티커가 슬로건 글자에 걸치는 것은 목업도 같다(그대로 둔다). (작업 4)
8. **3시간 캐시** — 서버가 응답을 3시간 캐시하고 수정·삭제 때만 비운다(등록 때는 비우지 않는다). 여기에 페이지의 CDN 캐시(5분 + 1시간)가 더해진다. 새 배너가 늦게 보이고 끝난 배너가 남는 것은 웹에서 고칠 수 없다. 웹이 여기에 캐시를 더 얹지 않는지만 본다. (작업 2, "확인이 필요한 것" 3)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 옵션은 `app.js:2-3`의 주석이 기준입니다(`reg=0…3` 등록된 배너 수, `bc=` 첫 배너의 배경색(# 없이), `theme=dark`). `reg`를 주지 않으면 2건입니다.

| 목업 | 주소 | 실제 화면 |
|---|---|---|
| 등록 배너 3건 | `app.html?reg=3#main` | `/events` (가짜 API가 3건을 줄 때) |
| 등록 배너 1건 | `app.html?reg=1#main` | 1건일 때 (화살표 없음) |
| 배경색 바꿔 보기 | `app.html?reg=1&bc=ffe55c#main`, `…&bc=f1ede4…`, `…&bc=blue…`(잘못된 값) | 첫 배너의 `background_color` |
| 배너가 없을 때 (홀1) | `app.html?reg=0#main` | 0건이거나 조회 실패 |
| 어두운 화면 | `app.html?reg=3&theme=dark#main`, `app.html?reg=0&theme=dark#main` | 헤더의 테마 버튼 |
| 캘린더 보기 | `app.html?view=cal&reg=3#main` | `/events?view=calendar` |
| 검색 결과 | `app.html?reg=3#search` | `/search?kwd=AI` |
| 결정과 API 표 | `index.html#banner` | — |

배너는 **목록·캘린더 보기·검색 결과 세 곳 모두**에 보입니다(목업 `app.js:329`의 `mainShell`이 두 보기에 함께 쓰이고, `:495`의 검색 화면에도 들어 있다. 설명 페이지 `index.html:505`, `:508`). 지금 코드도 같습니다(`pages/events.tsx`의 두 보기, `pages/search.tsx`). 배너를 쓰는 다른 페이지는 없습니다.

목업의 변수 `--tbn-bg`·`--tbn-fg`는 이 계획에서 `--bn-bg`·`--bn-fg`입니다.

---

## File Structure

**새로 만드는 파일**

- `model/banner.ts` — `TopBanner`
- `lib/utils/banner/tone.ts` — 배경색 검사, 글자색 고르기
- `lib/utils/banner/topBanner.ts` — 경로 상수, 응답 거르기, 링크 판정, 넘기기
- `lib/utils/banner/__tests__/tone.test.ts`, `topBanner.test.ts`
- `lib/api/topBannerServer.ts` — `getServerSideProps`에서 부르는 조회(던지지 않음, 2초 제한)
- `lib/api/__tests__/topBannerServer.test.ts`
- `components/common/banner/RegisteredBanner.tsx`, `RegisteredBanner.module.scss` — 등록 배너
- `components/common/banner/HoloBanner.tsx`, `HoloBanner.module.scss` — 배너가 없을 때
- `components/common/banner/holoLayout.ts`, `components/common/banner/__tests__/holoLayout.test.ts` — 폭별 스티커 묶음

**고치는 파일**

- `lib/api/handler.tsx`, `lib/hooks/useSWR.tsx` (작업 2. 추가만)
- `components/common/banner/banner.tsx` (작업 5. 내용을 바꿔 쓴다)
- `pages/events.tsx`, `pages/search.tsx` (작업 5)

**고치지 않고 두는 파일** (쓰는 곳이 없어짐): `components/common/banner/banner.module.scss`, `public/default/dev_event_banner_wave.mp4`. `next.config.js`도 고치지 않는다.

| 작업 | 하는 일 | 고치는 기존 파일 | 2단계가 끝나 있어야 하나 |
|---|---|---|---|
| 1 | 모델, 색·링크·응답 거르기·넘기기 (순수 함수) | — | 아니오 |
| 2 | 불러오기: 서버 쪽 조회, fetcher, `useTopBanners` | `handler.tsx`, `useSWR.tsx` | 아니오 |
| 3 | 등록 배너 부품 | — | 아니오 |
| 4 | 배너가 없을 때의 부품, 폭별 스티커 묶음 | — | **예** |
| 5 | 조립: `banner.tsx` 바꾸기, 페이지에서 불러 넘기기 | `banner.tsx`, `pages/events.tsx`, `pages/search.tsx` | 예 |
| 6 | 전체 확인 (`pnpm build` 한 번) | — | 예 |

작업 1~4가 끝난 상태에서는 화면이 예전 그대로입니다(새 부품은 아직 어디에도 걸리지 않습니다). 작업 5 뒤에 세 화면의 배너가 새 모양입니다. 작업 4를 시작할 때 `components/common/sticker/Sticker.tsx`·`stickerSets.ts`가 없으면 **대신 만들지 말고** 멈추고 관리자에게 알립니다.

---

### Task 1: 모델 · 순수 함수 (색, 링크, 응답 거르기, 넘기기)

목업 기준: `app.js:132-138`의 `tone`, `:140`의 기본값, `:141`·`:545`의 넘기기.

**Files:**
- Create: `model/banner.ts`
- Create: `lib/utils/banner/tone.ts`, `lib/utils/banner/topBanner.ts`
- Create: `lib/utils/banner/__tests__/tone.test.ts`, `lib/utils/banner/__tests__/topBanner.test.ts`

**Interfaces:**
- Consumes: `SITE_URL`(`lib/seo/site.ts`)
- Produces:

```ts
// model/banner.ts — Global Constraints의 표 그대로
export interface TopBanner {
  id: number;
  title: string;
  banner_image: string;
  event_link: string | null;
  background_color: string;
  start_date_time: string;
  end_date_time: string;
  create_date_time: string;
  update_date_time: string;
}

// lib/utils/banner/tone.ts
export const BANNER_DEFAULT_BG: string;   // '#000040'
export const BANNER_INK_DARK: string;     // '#101216'
export const BANNER_INK_LIGHT: string;    // '#ffffff'
export const normalizeHex: (value: unknown) => string | null;   // '#rrggbb' 소문자. 색 형식이 아니면 null
export const luminance: (hex: string) => number;                // WCAG 상대 휘도. normalizeHex를 거친 값만 받는다
export const contrastRatio: (a: string, b: string) => number;   // 1 ~ 21
export interface BannerTone {
  bg: string;                // 바탕 ('#rrggbb')
  fg: string;                // 글자 (BANNER_INK_DARK 또는 BANNER_INK_LIGHT)
  ink: 'dark' | 'light';     // 화면이 클래스를 고르는 데 쓴다
}
export const bannerTone: (value: unknown) => BannerTone;

// lib/utils/banner/topBanner.ts
export const TOP_BANNER_PATH: string;     // '/banner/top'
export const usableBanners: (data: unknown) => TopBanner[];
export interface BannerLink {
  href: string;
  external: boolean;         // true면 새 탭
}
export const bannerLink: (value: unknown, siteUrl?: string) => BannerLink | null;   // siteUrl 기본값은 SITE_URL
export const stepBanner: (index: number, delta: -1 | 0 | 1, count: number) => number;
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `normalizeHex`: 문자열만 받는다. 앞뒤 공백을 떼고 `#` 뒤에 16진수 **세 자리 또는 여섯 자리**일 때만 통과시킨다(대소문자 무시). 세 자리는 한 글자씩 두 번 써서 여섯 자리로 만든다. `#`이 없는 값은 통과시키지 않는다(목업의 `tone`은 `#?`로 받지만 그것은 `?bc=`가 `#`을 붙이기 전의 편의다).
- `luminance`: `app.js:136-137`의 식 그대로.
- `bannerTone`: 바탕은 `normalizeHex(value)`, null이면 `BANNER_DEFAULT_BG`. 글자는 **두 글자색 각각과의 대비를 비교해 큰 쪽**이고, 같으면 밝은 쪽이다. 목업은 휘도 0.179를 기준으로 가르는데 그것은 순수 검정 기준이라, 실제 어두운 글자(`#101216`)로는 `#767676`~`#797979`에서 대비가 낮은 쪽을 고른다. 목업 주석의 뜻("검정과 흰색 중 대비가 큰 쪽")을 따른다.
- `usableBanners`: 배열이 아니면 빈 배열. 항목 가운데 객체이고 `title`이 공백이 아닌 문자열인 것만 남긴다. 순서는 그대로, 넘겨받은 배열은 바꾸지 않는다. 이미지·링크·배경색이 비어 있는 항목은 **남긴다**(화면이 있는 것만 그린다). 기간으로 다시 거르지 않는다.
- `bannerLink`: 문자열이 아니거나 공백뿐이면 null. 앞뒤 공백을 뗀 뒤
  - `/`로 시작하고 둘째 글자가 `/`·`\`가 아니면 안쪽 링크(`external: false`, 값 그대로).
  - `http://`·`https://`로 시작하면(대소문자 무시): `siteUrl`과 같거나 `siteUrl` 바로 뒤가 `/`·`?`·`#`이면 안쪽 링크이고 `href`는 `siteUrl`을 뗀 나머지(비면 `/`, `/`로 시작하지 않으면 앞에 `/`). 아니면 바깥 링크(`external: true`, 값 그대로).
  - 그 밖(`javascript:`, `data:`, `mailto:`, `//host`, 스킴 없는 `www.example.com`)은 null.
- `stepBanner`: `count`가 1 이하면 0. 아니면 `index`를 0~`count-1`로 접은 뒤 `delta`를 더해 끝에서 처음으로 돈다. `delta`가 0이면 접기만 한다(건수가 줄었을 때 쓴다).

- [ ] **Step 1: 실패하는 테스트를 쓴다.** 아래를 단언한다.

  `tone.test.ts`
  - `normalizeHex`: `'#0D1330'` → `'#0d1330'`, `'#fff'` → `'#ffffff'`, `' #AbC '` → `'#aabbcc'`.
  - `normalizeHex`가 null: `'0d1330'`, `'blue'`, `''`, `'   '`, `'#12'`, `'#1234'`, `'#12345'`, `'#1234567'`, `'#ffffffff'`, `'#ggg'`, `'rgb(0,0,0)'`, `'#fff;color:red'`, `null`, `undefined`, `123`, `{}`.
  - `contrastRatio('#000000', '#ffffff')`는 21(`toBeCloseTo`), 순서를 바꿔도 같다.
  - `bannerTone('#0d1330')`은 `{ bg: '#0d1330', fg: '#ffffff', ink: 'light' }`. `'#c8321b'`·`'#000'`·`'#0043ff'`도 밝은 글자.
  - `bannerTone('#f1ede4')`·`'#ffe55c'`·`'#fff'`는 어두운 글자(`fg: '#101216'`, `ink: 'dark'`). `'#fff'`의 `bg`는 `'#ffffff'`.
  - 색 형식이 아닌 값(`'blue'`, `'0d1330'`, `''`, `null`, `undefined`)은 `{ bg: '#000040', fg: '#ffffff', ink: 'light' }`.
  - 경계: `'#797979'`는 밝은 글자, `'#7a7a7a'`는 어두운 글자.
  - 회색 256단계(`#000000`~`#ffffff`) 모두에서 고른 글자와의 대비가 **4.3 이상**이고, 고르지 않은 쪽과의 대비보다 작지 않다.
  - `'#e5484d'`, `'#f08c00'`, `'#12a47f'`, `'#0043ff'`에서 고른 글자와의 대비가 4.5 이상이다.

  `topBanner.test.ts`
  - `TOP_BANNER_PATH`는 `'/banner/top'`.
  - `usableBanners`: `null`·`undefined`·`'x'`·`{ message: 'x' }`는 `[]`. `[]`는 `[]`.
  - 제목이 없는 항목·제목이 공백뿐인 항목·`null`·문자열 항목은 빠지고 나머지의 순서가 그대로다.
  - `banner_image`가 `''`이고 `event_link`가 `null`이고 `background_color`가 `'blue'`인 항목은 남는다.
  - 넘긴 배열과 다른 배열을 돌려주고, 넘긴 배열의 길이가 바뀌지 않는다.
  - `bannerLink('/event/detail/3489')`는 `{ href: '/event/detail/3489', external: false }`.
  - `bannerLink('https://dev-event.vercel.app/event/detail/3489?x=1#a', 'https://dev-event.vercel.app')`는 `{ href: '/event/detail/3489?x=1#a', external: false }`. `'https://dev-event.vercel.app'`만 넘기면 `href`가 `'/'`.
  - `bannerLink('https://dev-event.vercel.app.evil.com/x', 'https://dev-event.vercel.app')`는 바깥 링크(앞부분만 같은 주소에 속지 않는다).
  - `'https://example.com/a'`, `'HTTP://example.com'`은 바깥 링크이고 `href`가 값 그대로다. 앞뒤 공백은 떼어진다.
  - null: `''`, `'  '`, `null`, `undefined`, `3`, `'javascript:alert(1)'`, `' JavaScript:alert(1)'`, `'data:text/html,x'`, `'//evil.com'`, `'/\\evil.com'`, `'www.example.com'`, `'mailto:a@b.c'`.
  - `stepBanner(0, 1, 3)` 1, `(2, 1, 3)` 0, `(0, -1, 3)` 2, `(5, 0, 3)` 2, `(5, 1, 3)` 0, `(0, 1, 1)` 0, `(3, 0, 0)` 0.

  Run: `pnpm test -- lib/utils/banner`
  Expected: 모듈을 찾지 못해 실패

- [ ] **Step 2: 세 파일을 만든다.**

- [ ] **Step 3: 확인**

  Run: `npx tsc --noEmit && pnpm test && npx eslint model/banner.ts lib/utils/banner/tone.ts lib/utils/banner/topBanner.ts lib/utils/banner/__tests__/tone.test.ts lib/utils/banner/__tests__/topBanner.test.ts`
  Expected: 오류 없음. 기존 327개도 그대로 통과

---

### Task 2: 불러오기 (서버 쪽 조회, fetcher, `useTopBanners`)

**Files:**
- Create: `lib/api/topBannerServer.ts`, `lib/api/__tests__/topBannerServer.test.ts`
- Modify: `lib/api/handler.tsx` (함수 하나 추가)
- Modify: `lib/hooks/useSWR.tsx` (훅 하나 추가, export 목록에 추가)

**Interfaces:**
- Consumes: `TopBanner`, `TOP_BANNER_PATH`·`usableBanners`(Task 1), `axiosInstance`(`lib/api/axiosInstance.tsx`. 고치지 않는다)
- Produces:

```ts
// lib/api/topBannerServer.ts — getServerSideProps에서만 부른다
export const TOP_BANNER_TIMEOUT_MS: number;   // 2000
export const fetchTopBannersOnServer: (timeoutMs?: number) => Promise<TopBanner[]>;   // 던지지 않는다

// lib/api/handler.tsx
export const getTopBannersApi: (url: string) => Promise<TopBanner[]>;

// lib/hooks/useSWR.tsx
const useTopBanners: (fallbackData?: TopBanner[]) => {
  topBanners: TopBanner[];   // 불러오는 중·실패는 빈 배열
  isLoading: boolean;
  isError: unknown;
};
```

**규칙**

- `fetchTopBannersOnServer`: 전역 `fetch`로 `${process.env.BASE_SERVER_URL}${TOP_BANNER_PATH}`를 부른다(페이지의 행사 조회와 같은 방식). `AbortController`와 `setTimeout`으로 `timeoutMs`(기본 `TOP_BANNER_TIMEOUT_MS`)에서 끊는다(`AbortSignal.timeout`은 TypeScript 4.6의 타입에 없다). 응답이 `ok`가 아니거나, JSON이 아니거나, 끊기거나, 던져지면 **빈 배열**. 성공하면 `usableBanners(본문)`. 어느 경우든 타이머를 지운다. `console`을 쓰지 않는다.
- `getTopBannersApi`: `axiosInstance.get(`${process.env.BASE_SERVER_URL}${url}`, { validateStatus: () => true })`. 상태가 200이 아니면 응답을 던지고, 200이면 `usableBanners(response.data)`. **`validateStatus`를 주는 이유**: 주지 않으면 4xx·5xx가 `axiosInstance`의 응답 인터셉터로 가서 `handleError`가 `alert`을 띄운다(Review Focus 2). 다른 fetcher처럼 `catch (error: any)`를 쓰지 않는다(경고가 늘지 않게).
- `useTopBanners`: 키는 `TOP_BANNER_PATH`, fetcher는 `getTopBannersApi`, 옵션은 다른 훅과 같은 넷(`shouldRetryOnError: false`, `revalidateOnFocus: false`, `revalidateOnReconnect: true`, `revalidateIfStale: false`)과 `fallbackData`. `topBanners`는 `data ?? []`. `fallbackData`가 있으면(빈 배열 포함) SWR은 화면이 뜰 때 다시 부르지 않는다(3·5단계의 훅과 같은 동작). 그래서 평소에는 브라우저에서 `/banner/top` 요청이 나가지 않는다.
- 웹이 캐시를 더하지 않는다: `dedupingInterval`·`refreshInterval`을 주지 않고, `Cache-Control`을 건드리지 않는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `lib/api/__tests__/topBannerServer.test.ts`. `global.fetch`를 `jest.fn()`으로 바꾸고 `process.env.BASE_SERVER_URL = 'http://api.test'`로 둔다(끝나면 되돌린다). 응답은 `{ ok, json }` 꼴의 객체로 흉내 낸다. 아래를 단언한다.
  - `http://api.test/banner/top`을 한 번 부르고, 둘째 인자에 `signal`이 있다.
  - 200과 배열 → 제목 없는 항목이 빠진 배열.
  - 200과 `[]` → `[]`. 200과 `{ message: 'x' }` → `[]`.
  - `ok: false`(500) → `[]`.
  - `fetch`가 거절 → `[]`(던지지 않는다).
  - `json()`이 거절(HTML 본문) → `[]`.
  - 시간 제한: `signal`의 `abort`에서만 거절하는 `fetch`를 두고 가짜 타이머를 2000ms 넘기면 `[]`로 끝나고 `signal.aborted`가 참이다. 1999ms에서는 아직 끝나지 않았다.
  - 성공한 뒤 남은 타이머가 없다(`jest.getTimerCount()`가 0).

  Run: `pnpm test -- lib/api`
  Expected: 모듈을 찾지 못해 실패

- [ ] **Step 2: `lib/api/topBannerServer.ts`를 만든다.**

- [ ] **Step 3: `getTopBannersApi`와 `useTopBanners`를 더한다.** 기존 함수·훅은 건드리지 않는다.

- [ ] **Step 4: 확인**

  Run: `npx tsc --noEmit && pnpm test && npx eslint lib/api/topBannerServer.ts lib/api/__tests__/topBannerServer.test.ts lib/api/handler.tsx lib/hooks/useSWR.tsx`
  Expected: 오류 없음. `lib/api/handler.tsx`의 경고는 전과 같은 4개(`no-explicit-any`)

  Run: `git diff --stat -- lib/api/axiosInstance.tsx lib/api/error.tsx`
  Expected: 결과 없음(고치지 않았다)

---

### Task 3: 등록 배너 부품

목업 기준: `app.js:139-145`의 `regBanner`, `variants.css:338-348`(PC), `:382-385`와 `:642-645`(860px 이하. 뒤의 것이 앞의 것을 덮는다), `app.css:396`. 목업 주소 `app.html?reg=3#main`, `app.html?reg=1&bc=ffe55c#main`.

**Files:**
- Create: `components/common/banner/RegisteredBanner.tsx`, `RegisteredBanner.module.scss`

**Interfaces:**
- Consumes: `TopBanner`, `bannerTone`, `bannerLink`·`stepBanner`(Task 1), `hasCoverLink`(`lib/utils/timeline/cover.ts`. 호스트를 가리지 않는 검사. 3단계 `EventThumb`의 `anyHost`가 쓰는 것), `TimelineIcon`(`back`, `chevron`), `next/image`, `next/link`, 믹스인 `de-container`·`de-button-reset`·`de-press`·`de-mobile`·`de-reduced-motion`
- Produces:

```ts
function RegisteredBanner(props: { banners: TopBanner[] }): JSX.Element;   // banners는 1건 이상
```

**마크업**

```
<section class="banner on-dark|on-light" aria-label="추천 행사"
         style="--bn-bg: {tone.bg}; --bn-fg: {tone.fg}">
  <h1 class="sr-only">개발자 행사는 모두 Dev Event 웹에서</h1>
  <div class="inner [no-image]">
    <div class="text">
      <p class="eyebrow">추천 행사</p>
      <h2 class="title" aria-live="polite">{banner.title}</h2>
      [링크가 있거나 2건 이상일 때]
      <div class="row">
        [링크가 있을 때] <a class="go" …>자세히 보기 [바깥 링크면 <span class="sr-only">(새 탭)</span>]</a>
        [2건 이상일 때]
        <button type="button" class="arrow" aria-label="이전 배너"><TimelineIcon back 16 /></button>
        <span class="count">{index + 1} / {count}</span>
        <button type="button" class="arrow" aria-label="다음 배너"><TimelineIcon chevron 16 /></button>
      </div>
    </div>
    [이미지 주소가 있고 깨지지 않았을 때]
    <a|span class="image" [href tabIndex={-1} aria-hidden="true"]>
      <Image key={banner.id} src={banner.banner_image} alt="" layout="fill" objectFit="cover" unoptimized onError />
    </a|span>
  </div>
</section>
```

- 바탕과 글자색은 `bannerTone(banner.background_color)`. `ink`가 `'light'`면 `on-dark`, `'dark'`면 `on-light`.
- **`<h1>`**: 지금 페이지의 `<h1>`은 슬로건이다. 등록 배너가 보일 때 그 제목을 `<h1>`로 올리면 페이지의 제목이 배너마다 바뀌므로, 슬로건을 화면에 보이지 않는 `<h1>`로 남기고 배너 제목은 `<h2>`로 둔다(타임라인의 월 제목이 `<h2>`다).
- **링크**: `bannerLink(banner.event_link)`. 안쪽이면 `next/link`로 감싼 `<a>`(같은 탭), 바깥이면 `<a target="_blank" rel="noopener noreferrer">`와 "(새 탭)"(6단계 `ApplyLink`와 같은 방식). null이면 버튼을 그리지 않고 이미지도 링크가 아니다(`<span>`). 이미지의 링크는 마우스용 중복이라 `tabIndex={-1}`·`aria-hidden="true"`다(목업과 같다).
- **이미지**: `hasCoverLink(banner.banner_image)`가 참일 때만 그린다. `next/image`에 `unoptimized`를 주면 주소를 그대로 쓰므로 `images.domains`에 없는 호스트도 뜬다(6단계 `DetailPoster`가 같은 방식으로 쓰고 있다). **`priority`를 주지 않는다**: 주면 서버가 보낸 HTML에 실제 주소가 들어가 화면이 살아나기 전에 깨진 이미지의 `onError`를 놓친다. `onError`가 오면 그 배너의 이미지를 숨기고 `inner`에 `no-image`를 붙인다. 깨짐 여부는 배너마다 따로다(배너 `id`별로 기억하거나, 보이는 배너가 바뀔 때 되돌린다).
- **넘기기**: 보이는 순번은 이 부품의 상태다. 화살표는 `stepBanner(index, ∓1, count)`. 그릴 때는 `stepBanner(index, 0, count)`로 접어 쓴다(건수가 줄었을 때). 타이머·스와이프·키보드 단축키를 넣지 않는다. 버튼이 같은 요소로 남으므로 누른 뒤에도 포커스가 유지된다.

**값** (`variants.css` 기준)

| 부분 | PC | 860px 이하 (`de-mobile`) |
|---|---|---|
| 바깥(`.banner`) | `background: var(--bn-bg); color: var(--bn-fg);` | 같음 |
| 안쪽(`.inner`) | `de-container`, `min-height: 200px; padding-top: 18px; padding-bottom: 18px; display: grid; grid-template-columns: minmax(0, 1fr) 292px; gap: 48px; align-items: center;` | `min-height: clamp(150px, 26vw, 200px); grid-template-columns: minmax(0, 1fr) clamp(128px, 31vw, 292px); gap: clamp(14px, 4vw, 48px); padding-top: clamp(16px, 2.6vw, 20px); padding-bottom: clamp(16px, 2.6vw, 20px);` |
| 이미지 없음(`.inner.no-image`) | `grid-template-columns: minmax(0, 1fr);` | 같음 |
| 머리말(`.eyebrow`) | `margin: 0; font-size: 13px; font-weight: 800; opacity: 0.7;` | `font-size: clamp(12px, 1.9vw, 13px);` |
| 제목(`.title`) | `margin: 8px 0 18px; font-size: 27px; line-height: 1.36; letter-spacing: -0.025em; font-weight: 800; overflow-wrap: anywhere;` 두 줄 말줄임(`display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden;`) | `margin: clamp(4px, 1vw, 8px) 0 clamp(12px, 2.2vw, 18px); font-size: clamp(17px, 3.3vw, 27px); line-height: 1.4;` |
| 줄이 없을 때의 제목 | `.row`를 그리지 않으면 제목의 아래 여백은 0 (`:last-child`) | 같음 |
| 줄(`.row`) | `display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 700;` | `gap: 4px; font-size: 12.5px;` |
| 자세히 보기(`.go`) | `de-press`, `display: flex; align-items: center; height: 42px; padding: 0 18px; margin-right: 8px; border-radius: 12px; background: var(--bn-fg); color: var(--bn-bg); font-size: 14.5px; font-weight: 800; white-space: nowrap; text-decoration: none;` | `height: clamp(36px, 6vw, 42px); padding: 0 clamp(13px, 2.4vw, 18px); margin-right: 2px; border-radius: 10px; font-size: clamp(13px, 2.1vw, 14.5px);` |
| 화살표(`.arrow`) | `de-button-reset`, `flex: none; width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; box-shadow: inset 0 0 0 1px var(--bn-line);` 올리면(`@media (hover: hover)` 안에서) `background: var(--bn-hover);` | `width: clamp(30px, 5vw, 34px); height: clamp(30px, 5vw, 34px);` |
| 쪽수(`.count`) | `min-width: 38px; text-align: center; opacity: 0.75; font-variant-numeric: tabular-nums;` | `min-width: 32px;` |
| 이미지(`.image`) | `position: relative; display: block; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: var(--bn-ph);` | `border-radius: clamp(8px, 1.6vw, 12px);` |

- `.on-dark`는 `--bn-line: rgba(255, 255, 255, 0.28); --bn-hover: rgba(255, 255, 255, 0.12); --bn-ph: rgba(255, 255, 255, 0.1);`, `.on-light`는 같은 셋을 `rgba(16, 18, 22, …)`로 둔다.
- 포커스: `.go`와 `.arrow`는 `&:focus-visible { outline: 2px solid var(--bn-fg); outline-offset: 2px; }`. `de-focus-ring`(파란 테두리)은 남색·파랑 바탕에서 보이지 않아 쓰지 않는다.
- `.sr-only`는 `TimelineSkeleton.module.scss:8-15`와 같은 값으로 이 모듈에 둔다.
- 이 부품이 더하는 transition은 `de-press`뿐이다.

- [ ] **Step 1: `RegisteredBanner.module.scss`를 만든다.**

- [ ] **Step 2: `RegisteredBanner.tsx`를 만든다.** 이 시점에는 어느 화면도 이 부품을 쓰지 않는다.

- [ ] **Step 3: 확인**

  Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/banner/RegisteredBanner.tsx`
  Expected: 오류 없음

  Run: SCSS 확인 — `components/common/banner/RegisteredBanner.module.scss`
  Expected: `ok`

  Run: `grep -n "innerWidth\|windowX\|setInterval\|setTimeout\|onTouch\|onPointer\|priority\|fetch(\|gtag\|color-mix" components/common/banner/RegisteredBanner.tsx components/common/banner/RegisteredBanner.module.scss`
  Expected: 결과 없음

  Run: `grep -nE "#[0-9a-fA-F]{3,8}\b|@include (mobile|tablet|laptop)\b|var\(--(primary|gray-|vapor-|ktb-)|[0-9]rem\b" components/common/banner/RegisteredBanner.module.scss`
  Expected: 결과 없음(색은 `--bn-*`와 `rgba()`뿐이고 크기는 px다)

  관리자가 화면에서 볼 것(작업 5 뒤. 비교: `app.html?reg=3#main`, `…?reg=1&bc=…`):
  1. 1280px: 높이 200px, 왼쪽에 "추천 행사"·제목·"자세히 보기 ‹ 1 / 3 ›", 오른쪽에 292×164px 이미지. 390px: 높이 150px 언저리, 이미지 128×72px. 700px에서는 그 사이 크기로 부드럽게 커진다.
  2. ›를 누르면 다음 배너로 바뀌고 바탕색·글자색이 함께 바뀐다. 3건에서 › 세 번이면 처음으로 돌아온다. **누른 뒤 포커스 테두리가 그 버튼에 남아 있다.** 30초를 두어도 저절로 넘어가지 않는다.
  3. 1건이면 화살표와 쪽수가 없다.
  4. 배경색: `#ffe55c`·`#f1ede4`는 검정 글자와 검정 버튼, `#0d1330`은 흰 글자와 흰 버튼, `blue`·`0d1330`(# 없음)·빈 값은 남색 바탕에 흰 글자. `#777777`에서 "추천 행사"와 쪽수가 읽힌다. 어두운 화면으로 바꿔도 배너는 그대로다.
  5. 이미지 주소가 404이거나 비어 있으면 빈 칸 없이 글이 폭을 다 쓴다. 허용 목록에 없는 호스트의 이미지도 뜬다.
  6. 제목이 80자여도 두 줄에서 "…"로 끊기고 높이가 늘지 않는다. 띄어쓰기 없는 긴 영문도 칸을 밀어내지 않는다.
  7. "자세히 보기": `/event/detail/…`이면 같은 탭에서 상세로, 바깥 주소면 새 탭으로. 링크가 비면 버튼이 없다.

---

### Task 4: 배너가 없을 때의 부품 · 폭별 스티커 묶음

목업 기준: `variants.js:14-24`(`stkGroup`, 프롬프트 자리), `:36-38`(`SLOGAN`), `:205-210`(`holo1`), `variants.css:351-355`(`.eb`), `:569-581`(`.stk-g`, 폭별 규칙), `:619-620`(바탕), `:646`·`:649`(중간 폭). 목업 주소 `app.html?reg=0#main`.

**이 작업은 2단계의 구현이 끝난 뒤에 시작한다.**

**Files:**
- Create: `components/common/banner/holoLayout.ts`, `components/common/banner/__tests__/holoLayout.test.ts`
- Create: `components/common/banner/HoloBanner.tsx`, `HoloBanner.module.scss`

**Interfaces:**
- Consumes (2단계. 아래가 확정된 모양이고, 다르면 실제 파일이 기준이다):
  - `components/common/sticker/Sticker.tsx`: `export type StickerPlacement = { name: StickerName; x: number; y: number; rotate: number; scale: number; side?: 'left' | 'right' }`, `export default function Sticker(props: StickerPlacement & { className?: string })` — 절대 위치로 놓인다(부모가 위치의 기준). `aria-hidden`은 감싸는 쪽이 붙인다.
  - `components/common/sticker/stickerSets.ts`: `export const BANNER_HOLO1: StickerPlacement[]` — 홀1의 PC 배치 열한 장(프롬프트 포함).
  - `lib/sticker/art.ts`: `StickerName`
  - `StickerDefs`는 `components/layout/index.tsx`에 이미 있다. 배너에 넣지 않는다.
- Consumes (그 밖): 믹스인 `de-mobile`·`de-tablet`
- Produces:

```ts
// holoLayout.ts
export const HOLO1_WIDE_ONLY: readonly StickerName[];   // 1180px 이하에서 숨기는 세 장
export const HOLO1_MOBILE: readonly { name: StickerName; x: number; y: number; scale: number }[];   // 860px 이하에서 남는 네 장의 자리
export interface HoloGroups {
  pc: StickerPlacement[];       // 861px 이상
  wide: StickerPlacement[];     // 1181px 이상에서만
  tablet: StickerPlacement[];   // 621~860px
  mobile: StickerPlacement[];   // 620px 이하
}
export const toTablet: (placement: StickerPlacement) => StickerPlacement;
export const buildHoloGroups: (placements: StickerPlacement[]) => HoloGroups;

// HoloBanner.tsx
function HoloBanner(): JSX.Element;
```

**폭별 배치** (`variants.js:205-210`. 가로는 붙는 쪽 가장자리에서의 거리다)

| 스티커 (목업 이름) | 쪽 | PC | 1180px 이하 | 860px 이하 `[가로, 세로, 크기]` |
|---|---|---|---|---|
| `holo:logo` | 왼쪽 | 보임 | 보임 | `[-44, -8, 0.56]` |
| `laptop` | 왼쪽 | 보임 | 보임 | `[-22, 100, 0.52]` |
| `lg:python:disc:w`, `lg:js:hex:h` | 왼쪽 | 보임 | 보임 | 숨김 |
| `lg:android:disc:k` | 왼쪽 | 보임 | **숨김** | 숨김 |
| `lg:linux:hex:h` | 오른쪽 | 보임 | 보임 | `[-18, -22, 0.56]` |
| `term` | 오른쪽 | 보임 | 보임 | `[-46, 104, 0.52]` |
| `lg:ts:disc:h`, `prompt`(프롬프트 자리) | 오른쪽 | 보임 | 보임 | 숨김 |
| `holo:code`, `lg:git:disc:h` | 오른쪽 | 보임 | **숨김** | 숨김 |

- PC의 자리·기울기·크기는 `BANNER_HOLO1`의 값을 **그대로** 쓴다. 이 파일에 다시 적지 않는다.
- 860px 이하의 네 장은 기울기와 쪽을 `BANNER_HOLO1`의 같은 이름에서 가져오고, 가로·세로·크기만 `HOLO1_MOBILE`로 바꾼다. `BANNER_HOLO1`에 그 이름이 없으면 그 장은 건너뛴다.
- 621~860px은 620px 이하의 값에서 `toTablet`으로 만든다: 가로 +8, 세로 ×1.28, 크기 ×1.34(`variants.css:649`). 세로와 크기는 소수 둘째 자리에서 반올림한다.
- `wide`는 `HOLO1_WIDE_ONLY`에 든 것, `pc`는 나머지다(순서는 `BANNER_HOLO1` 그대로).
- **한 벌을 CSS로 옮기지 않고 폭마다 묶음을 따로 그리는 이유**: 확정된 `StickerPlacement`는 숫자로 자리를 받는다. 목업의 모바일 배치는 PC 배치를 줄인 것이 아니라 자리가 다르고, `Sticker` 안쪽의 스타일을 배너 SCSS에서 덮어쓰면 2단계의 구현에 묶인다. 그래서 묶음 넷을 그려 두고 **묶음(배너가 가진 요소)의 `display`만** 폭에 따라 바꾼다. 스티커는 모두 열아홉 장이 그려진다("확인이 필요한 것" 5).

**마크업**

```
<section class="holo">
  <div class="stickers" aria-hidden="true">
    <div class="group pc">     {groups.pc     → <Sticker key={name} {...placement} />} </div>
    <div class="group wide">   {groups.wide   → …} </div>
    <div class="group tablet"> {groups.tablet → …} </div>
    <div class="group mobile"> {groups.mobile → …} </div>
  </div>
  <div class="copy">
    <h1 class="title">개발자 행사는<br />모두 <em class="accent">Dev Event 웹</em>에서</h1>
    <p class="desc">진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!</p>
  </div>
</section>
```

- 문구는 지금 `banner.tsx`의 글자 그대로다(`variants.js:37`). `<h1>`도 지금처럼 `<h1>`이다. 설명 줄은 `<h3>`에서 `<p>`로 바뀐다(목업).
- `buildHoloGroups(BANNER_HOLO1)`은 모듈 수준에서 한 번만 계산한다.
- `wide` 묶음을 `pc` 뒤에 두는 것은 목업에서 그 세 장이 이웃 스티커보다 위에 놓이기 때문이다.

**값**

| 부분 | PC | 860px 이하 (`de-mobile`) |
|---|---|---|
| 바깥(`.holo`) | `position: relative; height: 200px; overflow: hidden; display: grid; place-items: center; text-align: center; color: #fff; background: radial-gradient(ellipse 50% 120% at 50% 50%, #1a1d2b 0%, #0b0d14 75%);` | `height: clamp(150px, 26vw, 200px);` |
| 스티커 자리(`.stickers`) | `position: absolute; top: 0; bottom: 0; left: 50%; width: min(1320px, 100%); transform: translateX(-50%); z-index: 1; pointer-events: none; --stk-origin: 50% 50%;`(2단계 `Sticker`의 기준점을 목업 배너처럼 가운데로. 빠지면 스티커가 10~30px 어긋난다) | 같음 |
| 묶음(`.group`) | `position: absolute; inset: 0;` | 같음 |
| 글(`.copy`) | `position: relative; z-index: 0; padding: 0 20px;` (스티커보다 아래) | 같음 |
| 슬로건(`.title`) | `margin: 0; font-size: 33px; line-height: 1.26; letter-spacing: -0.03em; font-weight: 800;` | `font-size: clamp(23px, 3.8vw, 33px);` |
| 강조(`.accent`) | `font-style: normal; color: #a8c4ff;` | 같음 |
| 설명(`.desc`) | `margin: 10px 0 0; font-size: 15.5px; font-weight: 500; opacity: 0.82;` | `margin-top: 7px; font-size: clamp(13px, 2vw, 15.5px);` |

묶음의 `display`: `.pc`는 `de-mobile`에서 `none`. `.wide`는 `@media (max-width: 1180px)`에서 `none`. `.tablet`은 기본 `none`이고 `de-tablet`에서 `block`. `.mobile`은 기본 `none`이고 `@media (max-width: 620px)`에서 `block`.

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/common/banner/__tests__/holoLayout.test.ts`. 위 표의 열한 장을 테스트 안에 고정 값으로 두고(PC 자리는 `variants.js:206-209`와 프롬프트 `:21`의 값) 아래를 단언한다.
  - `pc` 여덟 장, `wide` 세 장(`lg:android:disc:k`, `holo:code`, `lg:git:disc:h` 순서), `tablet`·`mobile` 네 장씩.
  - `pc`·`wide`의 항목은 넘긴 값과 같다(자리·기울기·크기가 바뀌지 않는다). `prompt`는 `pc`에 있고 `mobile`·`tablet`에는 없다.
  - `mobile`: `holo:logo`는 `{ side: 'left', x: -44, y: -8, scale: 0.56, rotate: -7 }`, `laptop`은 `{ x: -22, y: 100, scale: 0.52, rotate: 8 }`, `lg:linux:hex:h`는 `{ side: 'right', x: -18, y: -22, scale: 0.56, rotate: 8 }`, `term`은 `{ side: 'right', x: -46, y: 104, scale: 0.52, rotate: -5 }`.
  - `tablet`: `holo:logo`는 `{ x: -36, y: -10.24, scale: 0.75 }`, `laptop`은 `{ x: -14, y: 128, scale: 0.7 }`, `lg:linux:hex:h`는 `{ x: -10, y: -28.16, scale: 0.75 }`, `term`은 `{ x: -38, y: 133.12, scale: 0.7 }`. 기울기와 쪽은 `mobile`과 같다.
  - 넘긴 배열과 항목을 바꾸지 않는다.
  - `holo:logo`가 빠진 배열을 넘기면 `mobile`·`tablet`이 세 장이다(던지지 않는다).
  - **2단계와 이름이 맞는지**: 실제 `BANNER_HOLO1`을 넘기면 `mobile`이 네 장, `wide`가 세 장이다(이름이 어긋나면 여기서 드러난다).

  Run: `pnpm test -- components/common/banner`
  Expected: 모듈을 찾지 못해 실패

- [ ] **Step 2: `holoLayout.ts`를 만든다.** `Sticker.tsx`에서는 타입만 가져온다(`import type`).

- [ ] **Step 3: `HoloBanner.module.scss`와 `HoloBanner.tsx`를 만든다.** 이 시점에는 어느 화면도 이 부품을 쓰지 않는다.

- [ ] **Step 4: 확인**

  Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/banner/holoLayout.ts components/common/banner/__tests__/holoLayout.test.ts components/common/banner/HoloBanner.tsx`
  Expected: 오류 없음

  Run: SCSS 확인 — `components/common/banner/HoloBanner.module.scss`
  Expected: `ok`

  Run: `grep -n "innerWidth\|windowX\|onPointer\|onMouse\|onClick\|draggable\|StickerDefs\|<video\|banner_wave" components/common/banner/HoloBanner.tsx`
  Expected: 결과 없음(끌기·누르기 없음, `StickerDefs`를 넣지 않음)

  Run: `grep -nE "#[0-9a-fA-F]{3,8}\b" components/common/banner/HoloBanner.module.scss`
  Expected: `#fff`, `#1a1d2b`, `#0b0d14`, `#a8c4ff`뿐

  관리자가 화면에서 볼 것(작업 5 뒤. 비교: `app.html?reg=0#main`):
  1. 1280px: 높이 200px의 어두운 바탕 가운데에 슬로건("Dev Event 웹"만 옅은 파랑)과 설명, 양옆에 스티커 열한 장. 오른쪽 위에 프롬프트(커서가 깜빡이는 터미널)가 있다.
  2. 1100px: 안쪽 세 장(Android, `</>`, Git)이 없다. 700px: 네 장(로고, 노트북, 턱스, 터미널)이 390px보다 조금 크게, 아래로 벌어져 있다. 390px: 네 장이 모서리에 걸쳐 있고 높이 150px.
  3. 스티커를 끌어도 움직이지 않고, 올려도 들리지 않고, 커서가 손 모양으로 바뀌지 않는다. Tab이 스티커에 멈추지 않는다.
  4. 어두운 화면에서도 같은 모습이다. "움직임 줄이기"를 켜면 스티커의 홀로그램 흐름과 커서 깜빡임이 멈춘다(2단계의 동작).

---

### Task 5: 조립 — `banner.tsx` 바꾸기, 페이지에서 불러 넘기기

**Files:**
- Modify: `components/common/banner/banner.tsx` (내용을 바꿔 쓴다. 파일은 지우지 않는다)
- Modify: `pages/events.tsx`
- Modify: `pages/search.tsx`

**Interfaces:**
- Consumes: `useTopBanners`·`fetchTopBannersOnServer`(Task 2), `RegisteredBanner`(Task 3), `HoloBanner`(Task 4), `TopBanner`
- Produces:

```ts
// components/common/banner/banner.tsx — 경로와 default export는 그대로
function Banner(props: { fallbackData?: TopBanner[] }): JSX.Element;
```

**`banner.tsx`**

- `useTopBanners(fallbackData)`의 `topBanners`가 1건 이상이면 `<RegisteredBanner banners={topBanners} />`, 아니면 `<HoloBanner />`. 불러오는 중과 실패도 0건과 같게 그린다(두 모습의 높이가 같아 나중에 바뀌어도 아래가 밀리지 않는다).
- `banner.module.scss`와 `<video>`를 더 쓰지 않는다. `classnames`·`WindowContext`도 필요 없다.

**`pages/events.tsx`** — 아래 네 가지만 고친다.

1. `ListProps`와 `CalendarProps`에 `banners: TopBanner[]`를 더한다.
2. `getServerSideProps`에서 `Cache-Control`을 건 바로 다음, 보기를 가르기 전에 `const bannersPromise = fetchTopBannersOnServer();`를 둔다(**여기서 `await`하지 않는다**. 행사 조회와 나란히 간다).
3. 목록 분기와 캘린더 분기 각각에서 행사 응답을 다 읽은 다음 `const banners = await bannersPromise;`로 받아 props에 `banners`를 더한다. `fetchTopBannersOnServer`는 던지지 않으므로 `try`/`catch`는 그 함수 안에만 있다. 행사 조회의 코드는 건드리지 않는다.
4. `<Banner />`를 `<Banner fallbackData={props.banners} />`로 바꾼다.

**`pages/search.tsx`** — 같은 네 가지(`Props`에 `banners`, `getServerSideProps`의 두 줄, `<Banner fallbackData={banners} />`).

두 페이지 모두 `<Head>`, `Cache-Control` 값, 모달 게이팅, `LoginModal`, `EventTimeline`·`EventCalendar`에 넘기는 props는 그대로다.

- [ ] **Step 1: `banner.tsx`를 바꿔 쓴다.**

- [ ] **Step 2: `pages/events.tsx`와 `pages/search.tsx`를 고친다.**

- [ ] **Step 3: 확인**

  Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/banner/banner.tsx pages/events.tsx pages/search.tsx`
  Expected: 오류 없음

  Run: `grep -rn "dev_event_banner_wave\|banner.module.scss" components pages --include='*.tsx' --include='*.ts'`
  Expected: 결과 없음

  Run: `grep -n "await fetchTopBannersOnServer\|Promise.all" pages/events.tsx pages/search.tsx`
  Expected: 결과 없음(부르는 줄에서 기다리지 않는다)

  Run: `grep -c "bannersPromise" pages/events.tsx pages/search.tsx`
  Expected: `pages/events.tsx:3`(한 번 만들고 두 분기에서 받는다), `pages/search.tsx:2`

  Run: `git diff -- pages/events.tsx pages/search.tsx | grep "^[-+]" | grep -n "Cache-Control\|<Head\|<meta\|canonical\|ld+json"`
  Expected: 결과 없음(캐시 헤더와 `<Head>`를 건드리지 않았다)

  Run: `git status --short components/events pages | grep -v "pages/events.tsx\|pages/search.tsx"`
  Expected: 이 단계 전과 같다(3·5단계 부품을 이 단계에서 고치지 않았다. 시작할 때의 출력을 적어 두고 비교한다)

---

### Task 6: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인** (`pnpm build`는 여기서 한 번만)

  Run:
  ```bash
  npx tsc --noEmit
  pnpm test
  npx eslint model/banner.ts lib/utils/banner/tone.ts lib/utils/banner/topBanner.ts lib/utils/banner/__tests__/tone.test.ts lib/utils/banner/__tests__/topBanner.test.ts lib/api/topBannerServer.ts lib/api/__tests__/topBannerServer.test.ts lib/api/handler.tsx lib/hooks/useSWR.tsx components/common/banner/banner.tsx components/common/banner/RegisteredBanner.tsx components/common/banner/HoloBanner.tsx components/common/banner/holoLayout.ts components/common/banner/__tests__/holoLayout.test.ts pages/events.tsx pages/search.tsx
  pnpm build
  ```
  Expected: 모두 통과. 테스트 묶음이 넷 늘었다(`tone`, `topBanner`, `topBannerServer`, `holoLayout`). eslint는 `lib/api/handler.tsx`의 경고 4개뿐.

  Run: SCSS 확인 — `components/common/banner/RegisteredBanner.module.scss components/common/banner/HoloBanner.module.scss`
  Expected: 둘 다 `ok`

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지, 지운 것이 없는지**

  Run: `head -2 components/common/banner/RegisteredBanner.module.scss components/common/banner/HoloBanner.module.scss | grep import`
  Expected: 파일마다 `@import '~styles/_variables.scss';`, `@import '~styles/_mixin.scss';` 순서

  Run: `grep -nE "@include (mobile|tablet|laptop)\b|var\(--(primary|gray-|vapor-|ktb-)|[0-9]rem\b|color-mix" components/common/banner/RegisteredBanner.module.scss components/common/banner/HoloBanner.module.scss`
  Expected: 결과 없음

  Run: `git status --short | grep "^ D\|^D "`
  Expected: 결과 없음. `components/common/banner/banner.module.scss`와 `public/default/dev_event_banner_wave.mp4`가 그대로 있다.

  Run: `git diff --stat -- next.config.js lib/api/axiosInstance.tsx lib/api/error.tsx components/events components/layout styles`
  Expected: 작업 1을 시작하기 전에 같은 명령으로 적어 둔 출력과 같다(이 폴더에는 다른 단계의 커밋하지 않은 변경이 있다. 이 단계가 더한 것이 없는지만 본다)

- [ ] **Step 3: 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

  | 근거 | 요구 | 맡은 작업 |
  |---|---|---|
  | 로드맵 4단계 | `/banner/top`을 `getServerSideProps`에서 함께 부르고 `useTopBanners`로 이어받음, 모델 `TopBanner` | 1, 2, 5 |
  | 로드맵 4단계 | 배경색은 `#RGB`·`#RRGGBB`만, 아니면 기본 남색. 글자색은 검정·흰색 중에서 | 1, 3 |
  | 로드맵 4단계 | 높이 PC 200px, 모바일 150px (그 사이는 `clamp`) | 3, 4 |
  | 로드맵 4단계 | 여러 건이면 화살표로만, 저절로 넘어가지 않음 | 1, 3 |
  | 로드맵 4단계 | 물결 영상과 옛 반응형 규칙을 쓰지 않음 (파일은 남김) | 5 |
  | 설명 페이지 `banner` 절 | 등록 배너: 왼쪽 글, 오른쪽 이미지(16:9, 292×164 / 128×72px), 제목 두 줄 말줄임, "추천 행사" 머리말 | 3 |
  | 설명 페이지 `banner` 절 | `event_link`는 "자세히 보기"와 이미지가 가는 곳 | 1, 3 |
  | 설명 페이지 `banner` 절 | 배너가 없으면 홀1 + 슬로건, 프롬프트 자리 | 4 |
  | 관리자 결정 | 조회 실패에도 페이지가 뜸(따로 감싸고, 행사 조회와 나란히) | 2, 5 |
  | 관리자 결정 | 스티커는 장식(끌기·누르기 없음), `StickerDefs`를 넣지 않음 | 4 |
  | 관리자 결정 | 이미지는 `next/image` + `unoptimized`, 호스트를 가리지 않음 | 3 |
  | 관리자 결정 | 배너는 목록·캘린더·검색 세 곳 | 5 |
  | 공통 규칙 | GA·`<Head>`·캐시 헤더 그대로, 건수 요약 문구 없음 | 5 |

- [ ] **Step 4: 관리자에게 넘길 것을 모은다.** 작업 3·4의 "관리자가 화면에서 볼 것"과 Review Focus 여덟 가지, 아래 "관리자 확인"을 한 목록으로 묶어 보고한다.

**이 단계가 끝난 뒤의 모습:** `/events`, `/events?view=calendar`, `/search`의 맨 위가 높이 200px(모바일 150px)의 새 배너입니다. 운영에는 등록된 배너가 없으므로 배포하면 홀로그램 슬로건이 보입니다.

---

## 관리자 확인

구현 에이전트는 화면을 띄우지 않습니다. 관리자가 프로덕션 빌드(`redesign-web`)로, 1280×900·1100×900·700×900·390×844·360×800에서, 밝게·어둡게 봅니다.

**가짜 API(`redesign-mock-api`)에 더할 것.** 지금 가짜 API는 `/banner/top`에 404를 줍니다. 그대로 두면 "조회 실패"(슬로건)만 보입니다. 등록 배너를 보려면 `GET /banner/top`이 아래 배열을 돌려주게 합니다(서버와 같은 필드 이름. 목업 `app.js:126-130`의 세 건). 웹은 이 주소를 쿼리 없이 부르므로, 경우를 바꾸는 것은 가짜 API 쪽에서 합니다(환경 변수나 따로 둔 조작용 주소).

```json
[
  {
    "id": 3,
    "title": "AWS Community Day Seoul 2026, 참가 신청을 받고 있어요",
    "start_date_time": "2026-11-01T00:00:00",
    "end_date_time": "9999-12-31T23:59:00",
    "banner_image": "https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/2026-10-20-19-03-5571-d3f1e64b.jpg",
    "event_link": "/event/detail/3489",
    "background_color": "#0d1330",
    "create_date_time": "2026-11-01T00:00:00",
    "update_date_time": "2026-11-01T00:00:00"
  },
  {
    "id": 2,
    "title": "PyTorch Day Korea 2026, 접수 마감이 사흘 남았어요",
    "start_date_time": "2026-11-01T00:00:00",
    "end_date_time": "9999-12-31T23:59:00",
    "banner_image": "https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/2026-10-19-08-11-5268-30407b8e.jpg",
    "event_link": "https://example.com/pytorch-day-korea-2026",
    "background_color": "#c8321b",
    "create_date_time": "2026-11-01T00:00:00",
    "update_date_time": "2026-11-01T00:00:00"
  },
  {
    "id": 1,
    "title": "Notion AI Hackathon Seoul, 반복 업무를 에이전트에게",
    "start_date_time": "2026-11-01T00:00:00",
    "end_date_time": "9999-12-31T23:59:00",
    "banner_image": "https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/2026-11-12-15-00-1380-9cc33f87.jpg",
    "event_link": "/event/detail/3557",
    "background_color": "#f1ede4",
    "create_date_time": "2026-11-01T00:00:00",
    "update_date_time": "2026-11-01T00:00:00"
  }
]
```

바꿔 가며 볼 경우(위 배열에서 바꾸는 것):

| 경우 | 가짜 API가 돌려줄 것 | 보여야 하는 것 |
|---|---|---|
| 3건 | 위 배열 | 등록 배너, `1 / 3`. 둘째의 "자세히 보기"는 새 탭 |
| 1건 | 첫 항목만 | 화살표·쪽수 없음 |
| 0건 | `[]` | 홀로그램 슬로건 |
| 조회 실패 | 500 또는 지금의 404 | 홀로그램 슬로건. 경고창 없음 |
| 배열이 아님 | `{ "message": "x" }` | 홀로그램 슬로건 |
| 느린 응답 | 5초 뒤에 응답 | 페이지가 2초 남짓에 뜨고 슬로건이 보인다 |
| 배경색 | 첫 항목의 `background_color`를 `#ffe55c`, `#ffffff`, `#777777`, `#e5484d`, `blue`, `0d1330`, `""`로 | Review Focus 3 |
| 깨진 이미지 | 첫 항목의 `banner_image`를 `http://127.0.0.1:5099/none.jpg`와 `""`로 | 이미지 칸이 사라지고 글이 폭을 다 쓴다 |
| 다른 호스트의 이미지 | `banner_image`를 허용 목록에 없는 호스트의 주소로(가짜 API가 직접 내주는 그림이면 된다) | 이미지가 뜬다 |
| 긴 제목 | 첫 항목의 `title`을 80자와, 띄어쓰기 없는 영문 60자로 | 두 줄 말줄임, 높이 유지 |
| 링크 없음 | 첫 항목의 `event_link`를 `null`, `""`, `"javascript:alert(1)"`로 | "자세히 보기" 없음. 1건이면 줄 자체가 없다 |

**화면에서 볼 것**

1. 작업 3·4의 "관리자가 화면에서 볼 것" 열한 가지.
2. `/events`, `/events?view=calendar`, `/search?kwd=AI` 세 곳에 같은 배너가 보인다.
3. 개발자 도구의 Network에 브라우저가 보낸 `/banner/top` 요청이 **없다**(서버가 받아 넘긴 것을 그대로 쓴다). Console에 하이드레이션 경고가 없다.
4. 페이지 소스에서 `<h1>`이 하나이고 글자가 "개발자 행사는 모두 Dev Event 웹에서"다(등록 배너일 때는 화면에 보이지 않는 `<h1>`).
5. 헤더의 "행사 일정"을 눌러 다른 화면에서 `/events`로 넘어올 때(브라우저 안 이동)도 배너가 뜬다.
6. 필터 모달을 열었다 닫으면 배너가 첫 건으로 돌아간다(알려진 동작).

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

- `components/common/banner/banner.module.scss` — 쓰는 곳이 없다. 로드맵이 짚은 성립하지 않는 반응형 규칙(`:56-79` `laptop` 안에 다시 넣은 `max-width`, `:93`, `:106`)이 이 파일에 있다.
- `public/default/dev_event_banner_wave.mp4` — 쓰는 곳이 없다(190KB).
- `CLAUDE.md`에 배너의 새 구조(등록 배너, `useTopBanners`)를 적는 일.

**이 단계에서 미룬 다듬기**
- `aspect-ratio`를 모르는 브라우저(Safari 14 이하)에서는 배너 이미지 칸의 높이가 0이 된다(3단계 썸네일과 같은 문제).
- 필터 모달을 열었다 닫으면 배너가 다시 그려져 첫 건으로 돌아간다(페이지가 모달이 열린 동안 본문을 그리지 않기 때문이다).
- 제목 단계: 등록 배너일 때 `<h1>`이 화면에 보이지 않는다. 로드맵 9단계의 "제목 단계" 항목과 함께 본다.

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **API 경로와 응답 모양은 서버 코드를 기준으로 삼았다**(Global Constraints의 표). `priority`는 응답에 없어 모델에 넣지 않았다.
2. **조회에 실패하면 빈 배열을 넘기고 브라우저에서 다시 부르지 않는다.** 그 HTML이 CDN에 남는 동안(5분, 길면 1시간 남짓)은 슬로건이 보인다. 브라우저에서 다시 부르게 하면 슬로건이 떴다가 등록 배너로 바뀌는 깜빡임이 생긴다.
3. **서버 쪽 조회는 2초에서 끊는다.** 서버의 응답은 Redis 캐시라 평소에는 빠르다. 끊지 않으면 배너 서버가 멈췄을 때 페이지가 함께 멈춘다.
4. **브라우저 쪽 fetcher는 `validateStatus`로 오류 인터셉터를 피한다.** `axiosInstance`와 `error.tsx`는 고치지 않는다.
5. **글자색은 두 글자색과의 대비를 직접 비교해 고른다**(목업의 0.179 기준 대신). 목업과 달라지는 것은 `#767676`~`#797979` 언저리의 회색뿐이다.
6. **`color-mix()` 대신 글자색 두 가지에 맞춘 `rgba()` 두 벌을 둔다.**
7. **`<h1>`은 슬로건으로 남긴다.** 등록 배너가 보일 때는 화면에 보이지 않는 `<h1>`과 `<h2>` 제목이다.
8. **링크는 `/…`와 `http(s)://…`만 받는다.** 우리 사이트 주소는 같은 탭, 바깥 주소는 새 탭이다.
9. **GA 호출을 넣지 않았다.** 지금 배너에 없다.
10. **이미지에 `priority`를 주지 않고, 깨지면 이미지 칸을 없앤다.** `next.config.js`의 허용 목록은 고치지 않는다(`unoptimized`라 필요 없다).
11. **스티커는 폭마다 묶음을 따로 그리고 묶음의 `display`만 바꾼다.** 끌기와 올렸을 때의 움직임은 넣지 않는다.
12. **받은 배너를 기간으로 다시 거르지 않는다**(설명 페이지: "웹은 받은 것을 그대로 그립니다").
13. **넘기기는 끝에서 처음으로 돌고, 누른 뒤 포커스가 남고, 제목에 `aria-live="polite"`를 건다.**
14. **새 부품은 새 파일로 만들고 `banner.tsx`는 고르는 일만 한다.** 페이지의 import 경로가 바뀌지 않는다.

### 확인이 필요한 것

1. **운영 응답을 보지 못했다.** 배너를 하나 등록해 실제 응답의 필드 이름과 날짜 꼴을 확인하면 Review Focus 1이 닫힌다.
2. **`#` 없이 적은 배경색(`0d1330`)은 기본 남색이 된다.** 받은 결정(`#RGB`·`#RRGGBB`만)대로다. 관리 화면에 형식 안내가 없으면 운영자가 겪을 수 있다. 받아 주려면 `normalizeHex`의 규칙 한 줄과 테스트 두 줄을 바꾸면 된다.
3. **끝난 배너가 남는 시간.** 서버 캐시 3시간에 페이지의 CDN 캐시가 더해진다. 등록 때는 캐시를 비우지 않아 새 배너도 최대 3시간 늦다. 웹에서 `end_date_time`으로 한 번 더 거를 수는 있지만 서버의 시간대를 확인해야 하고, 받은 결정과 다르다. 서버에서 등록 때 캐시를 비우고 TTL을 줄이는 쪽이 맞다.
4. **바깥 링크를 새 탭으로 여는 것.** 목업의 링크는 모두 목업 안의 상세라 정해진 것이 없었다. 상세의 "신청하러 가기"와 같은 방식으로 맞췄다.
5. **스티커가 열아홉 장 그려진다**(PC 열한 장, 중간 폭 네 장, 모바일 네 장). 2단계의 `Sticker`가 자리를 CSS 변수로도 받게 되면 한 벌(열한 장)로 줄일 수 있다. 지금 확정된 모양(숫자 props)만으로는 폭마다 다른 자리를 CSS로 옮길 수 없다.
6. **중간 밝기 배경의 작은 글자.** `#777777` 같은 바탕에서는 어느 글자색이든 대비가 4.3~4.5:1이고, "추천 행사"(투명도 0.7)와 쪽수(0.75)는 그보다 낮다. 목업의 값 그대로다.
7. **빨강 계열 바탕(`#e5484d`)에는 검정 글자가 골라진다**(대비 4.8:1, 흰색은 3.9:1). 규칙대로지만 흰 글자를 기대할 수 있다.
8. **16:9가 아닌 이미지는 가운데 기준으로 잘린다.** 비율 규격은 서버 쪽 일이다(로드맵 0단계).
9. **로드맵 0단계의 서버 확인 세 가지는 그대로 남아 있다**: 수정하면 배경색이 저장되지 않음(`TopBanner.updateBanner`가 배경색을 옮기지 않는다), 3시간 캐시, 운영 응답 미확인.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 화살표를 누르면 배너를 통째로 다시 그려 포커스를 잃는다(`app.js:545`).
- `tone`이 `#` 없는 값도 받는다(`app.js:134`). 설명 페이지는 "`#RGB`·`#RRGGBB`만"이라고 적었다.
- 글자색 기준 0.179는 순수 검정 기준인데 실제 글자는 `#101216`이다.
- 등록 배너의 값에 `priority`가 있고(`app.js:127-129`) 설명 페이지의 표에도 응답 값으로 적혀 있다. 실제 응답에는 없다.
- 860px 이하의 위아래 여백이 PC(18px)보다 커질 수 있다(`clamp(16px, 2.6vw, 20px)`). 높이가 `min-height`로 정해져 눈에 띄지 않아 그대로 옮겼다.

**지금 코드**
- `axiosInstance`의 응답 인터셉터가 `error.response.data`를 바로 읽는다(`axiosInstance.tsx:27`). 연결 자체가 실패하면 `error.response`가 없어 인터셉터 안에서 `TypeError`가 난다. 400·404·500이 아닌 응답에는 무조건 `alert`이 뜬다(`error.tsx:89-91`).
- `banner.module.scss`는 믹스인을 변수보다 먼저 불러오고, `laptop` 안에 다시 `max-width`를 넣어 듣지 않는 규칙이 있다.

**서버** (읽기만 했다. 로드맵 0단계의 이슈에 더할 것)
- 배너를 등록할 때 캐시를 비우지 않는다(`TopBannerService.createTopBanner`에 `@CacheEvict`가 없다).
- `event_link`를 검사하지 않는다. 스킴 없는 주소나 빈 값이 들어올 수 있다.
