# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

Dev Event Web — 개발자 행사(웨비나·컨퍼런스·해커톤·네트워킹)를 큐레이션하는 한국어 웹 (https://dev-event.vercel.app/events). Next.js 12 / React 17 / TypeScript 4.6, pnpm 8+, Node 20 (`.nvmrc`는 20.15.1 고정).

## 명령어

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 http://localhost:5000  (주의: 3000 아님, 5000 포트)
pnpm build          # 프로덕션 Next.js 빌드 (배포 전 / 대규모 리팩토링 후 권장)
pnpm start          # 빌드 결과물 서빙
pnpm test           # jest (ts-jest + jsdom)
pnpm test:watch     # jest watch 모드
pnpm test -- <pattern>   # 단일 테스트 파일, 예: pnpm test -- buildCalendarMatrix
npx tsc --noEmit    # 타입 체크만 (빌드 없이)
npx eslint <파일...>  # 린트 (.eslintrc.cjs). `pnpm lint`(next lint)는 설정을 찾지 못해 ESLint 설정 화면에서 멈추므로 쓰지 않음
```

배포는 Vercel을 통해 진행 (`vercel build && vercel deploy [--prod]`). 정식 순서는 README에 정리되어 있어요.

## 아키텍처 개요

### 라우팅 & 데이터 레이어
- **Pages Router** (`pages/`) — 모든 페이지는 `getServerSideProps`로 SSR 렌더링. 클라이언트 라우팅은 `router.push`(SSR을 다시 돌려야 하면 `shallow: false`). `/calender` 라우트는 `/events?view=calendar&year=&month=`로 307 리디렉트만 함 (예전 북마크 호환).
- **외부 API**가 데이터의 진실 근원. `${process.env.BASE_SERVER_URL}/front/v2/...` 에서 받아옵니다. Next.js의 `pages/api/*`는 auth/세션/쿠키용 얇은 헬퍼로만 쓰이며, 데이터 레이어가 아닙니다.
- **데이터 페치**: SWR 훅들이 `lib/hooks/useSWR.tsx`에 있음 (`useScheduledEvents`, `useMonthlyEvent`, `useTopBanners`, `useMyEvent`, `useUser`). 목록·월별·배너 훅은 `fallbackData`를 받아 SSR로 받아온 데이터를 즉시 hydrate하고 이후 SWR이 revalidate. 관심 담기·빼기는 `lib/hooks/useFavorite.tsx`. **새 훅을 추가할 때 이 패턴을 따르세요** — 컴포넌트 내부에서 `fetch`를 직접 호출하지 말 것.
- **배너**: `/events`·`/search`의 `getServerSideProps`가 `fetchTopBannersOnServer`(`lib/api/topBannerServer.ts`, 2초 제한, 실패하면 빈 배열)로 `/banner/top`을 함께 불러 `banners` props로 넘기고, `components/common/banner/banner.tsx`가 `useTopBanners`로 이어받아 등록 배너(`RegisteredBanner`) 또는 홀로그램 슬로건(`HoloBanner`)을 그립니다.
- **시각(`now`)**: `/events`·`/search`·`/myevent`·상세의 `getServerSideProps`가 한국 시간 문자열 `toKstNaive(Date.now())`(`lib/utils/timeline/kst.ts`)를 `now` props로 내리고, 화면은 `useNow(now)`(`lib/hooks/useNow.ts`)로 받아 마운트 뒤·1분마다·탭이 다시 보일 때 실제 시각으로 바꿉니다. 서버(UTC)와 브라우저의 첫 그림을 맞추려는 것입니다.
- **HTTP**: `lib/api/`에 axios 인스턴스 — 비인증 콜은 `axiosInstance`, 인증 콜은 `axiosInstanceWithToken`. 에러 처리도 같은 디렉터리.

### 상태 관리 (Context)
모든 Provider는 `pages/_app.tsx`에서 다음 순서로 중첩됩니다: `AuthProvider → WindowProvider → EventProvider → ToastProvider`.
- **`AuthContext`**: `isLoggedIn`, `isChecked`(처음 `/api/checkAuth` 확인이 끝났는지. 한 번 true가 되면 그대로), `login`, `logout`. 확인 전에는 헤더가 로그인 버튼 자리에 40px 빈 칸을 그리고, 카드의 관심 담기 누름은 무시합니다(`useFavorite`).
- **`EventContext`**: 페이지 간 공유되는 필터 상태 (`jobGroupList`, `eventType`, `location`, `coast`, `search`, `date`, `url`)와 리디자인에서 더한 `newOnly`("새로 올라온 행사"), `showPast`("지난 행사 보기"), `replaceJobGroupList`, `focusDay`(캘린더에서 타임라인으로 넘기는 날짜. 한 번 쓰고 비움). 새 필터 줄(`components/events/timeline/FilterBar.tsx`)은 필터를 **주소에서 읽고** context를 주소에 맞춥니다(누르면 타임라인은 `/search?…`, 캘린더는 캘린더 주소 안에서 바뀜).
- **`WindowContext`**: viewport류 데이터 — `windowX`(픽셀 폭), `windowTheme`, `isNotice`, 그리고 숫자형 `modalState.currentModal` 스위치. `modalState`(1 검색·2 필터·3 날짜)는 `/events`·`/search`의 옛 필터 모달 게이팅에만 남아 있고, 값을 바꾸는 곳이 그 모달들 안뿐이라 화면에서 열리지 않습니다. 새 창(`LoginModal`, `DeleteAccountModal`, 상세의 `Lightbox`)은 `react-modal` + `isOpen` props입니다.
  - **주의**: `handleWindowX`는 정의되어 있지만 어떤 resize 리스너도 이를 호출하지 않습니다. `WindowContext.windowX > 0` 으로 분기하지 마세요 — 항상 0입니다. PC·모바일 전환은 CSS(`de-mobile`, 860px)로 하고, JS에서 크기가 필요하면 자체 `resize` 리스너를 둡니다 (예: `components/events/timeline/DateStrip.tsx`).

### 컨벤션
- **import**: `tsconfig.json`의 `baseUrl: './'`로 프로젝트 루트 기준 절대 경로 임포트가 가능합니다 (`import { Event } from 'model/event'`). 가능한 한 절대 경로를 사용하고 `../../../` 같은 상대 경로는 피하세요. Prettier가 `.prettierrc.cjs`에 정의된 순서로 정렬합니다 (`react`, `classnames`, `@headlessui`, `next`, `jotai`, `@<...>`, 그 다음 relative).
- **스타일**: SCSS Module (`Foo.tsx` 옆 `Foo.module.scss`). `classNames.bind(style)`을 `cn` 또는 `cx`로 별칭. 공유 SCSS 임포트 시 **반드시 풀 파일명 + 틸드**: `@import '~styles/_variables.scss'`. `@import '~styles/variables'` 같이 확장자/언더스코어 생략하면 sass-loader가 조용히 실패하면서 해시된 클래스명만 생성되고 실제 CSS 규칙은 비어버리는 함정이 있습니다.
- **디자인 토큰**: `DESIGN.md`에 KTB(카카오테크 부트캠프) 기반 디자인 시스템 정리 — Pretendard 폰트, KTB Tech Blue `#0043FF`, Vapor gray 스케일, 12/24px border-radius. 공유 SCSS 변수/믹스인은 `styles/_variables.scss` / `_mixin.scss` / `_common.scss`.
- **리디자인 토큰**: 새 화면의 색은 `styles/Theme.scss`의 `--de-*` 변수(`html[data-theme]` 밝게·어둡게 두 벌)만 씁니다. 틀은 `_variables.scss`의 `$de-*`, 믹스인은 `_mixin.scss`의 `de-*`(`de-mobile` = 860px 이하, `de-tablet` 621~860px, `de-container`, `de-focus-ring`, `de-chip`, `de-reduced-motion` 등). PC·모바일 전환 폭은 860px. `--de-*`를 더하거나 빼면 목록을 고정해 둔 `styles/__tests__/deTokens.test.ts`도 고칩니다.
- **스티커**: 홀로그램 머리띠·배너의 스티커는 `components/common/sticker/`(`Sticker`, 자리표 `stickerSets.ts`)와 `lib/sticker/`(`art.ts` 그림, `logos.ts` 로고 도형). 정의 `StickerDefs`는 `Layout`이 한 번 넣으므로 쓰는 쪽에서 다시 넣지 않습니다. 로고 도형은 각 권리자의 공식 파일에서 꺼낸 것이고(받은 곳과 조건은 `logos.ts` 맨 위 표), 출처 표기는 `public/licenses.txt`에 있습니다. 로고를 더하거나 바꾸면 둘을 함께 고칩니다.
- **이미지**: `next/image` + `unoptimized` 조합으로 외부 썸네일 사용. 허용된 외부 호스트는 `next.config.js > images.domains`에 화이트리스트. 표지가 없거나 깨지면 자동 표지(`components/events/timeline/EventThumb.tsx` + `lib/utils/timeline/cover.ts`). `/default/event-thumbnail-light.png`는 SEO 기본 이미지(`lib/seo/site.ts`).
- **SVG**: `@svgr/webpack`으로 React 컴포넌트로 import (이미 `next.config.js`에 설정).
- **레이아웃**: 페이지가 `getLayout`을 export하면 wrap됩니다: `Events.getLayout = (page) => <Layout>{page}</Layout>`. `_app.tsx`가 이를 읽어서 적용합니다. `Layout`의 `subscribe={false}`는 푸터 위 소식 받기(`Subscribe`)를 뺍니다(오류 화면).

### 도메인 모델 (`model/event.ts`)
직관적이지 않은 필드 몇 가지:
- `event_time_type: 'DATE' | 'RECRUIT'` — `DATE`는 실제 행사 날짜, `RECRUIT`는 모집/접수 기간. 타임라인·캘린더는 접수 중인 `RECRUIT`를 마감일에 놓습니다 (`lib/utils/timeline/describeEvent.ts`의 `dateKey`).
- `use_start_date_time_yn` / `use_end_date_time_yn: 'Y' | 'N' | null` — `'Y'`일 때만 시간 부분이 의미 있고 `'N'`·`null`이면 날짜만. 표시 로직에서 반드시 체크해야 합니다 (`lib/utils/timeline/period.ts > readEventPeriod` 참고).
- 이벤트는 여러 날에 걸칠 수 있음 (`start_date_time` → `end_date_time`).

### 화면별 폴더
- **타임라인** (`/events`, `/search`): `components/events/timeline/`(`EventTimeline`이 날짜 띠·필터 줄·카드 목록을 묶음), 순수 로직 `lib/utils/timeline/`(`describeEvent`, `groupByDay`, `buildView`, `filters`, `kst`, `period` 등). 다른 달은 `/events?year=&month=`(shallow)로 가서 월별 조회로 불러옵니다.
- **상세** (`/event/detail/[eventId]`): `components/events/detail/`(`EventDetailView`가 진입점), 로직 `lib/utils/detail/`. 본문 HTML은 `lib/utils/renderDescription.ts` 한 곳에서 만듭니다. "같은 날 다른 행사"는 `getServerSideProps`가 `/front/v2/events/current`를 함께 불러 고릅니다.
- **관심 행사** (`/myevent`): `components/myEvent/`(`SavedEvents`가 진입점) + `lib/utils/mypage/savedEvents.ts`. **내 정보** (`/myinfo`): `components/myInfo/ProfileCard` + `lib/utils/mypage/profile.ts`, 탈퇴 확인 `components/common/modal/DeleteAccountModal`.
- **로그인 창**: `components/common/modal/LoginModal.tsx`(props `isOpen`·`onClose`)가 `components/common/modal/login/`(`LoginPanel`, 검사 `loginFlow.ts`)을 감쌉니다. **배너**: `components/common/banner/` + `lib/utils/banner/`(`topBanner`, 배경색·글자색 `tone`). **오류 화면**: `pages/_error.tsx` + `styles/Error.module.scss`.
- **옛 부품**: `components/common/item/*`, `components/common/{date,dropdown,input}/*`, `components/features/filters/**`, `FilterSearchModal`·`FilterTagModal`·`FilterDateModal`은 `/events`·`/search`의 옛 모달 게이팅이 import해서 남아 있을 뿐 화면에서 열리지 않습니다. 새 코드에서 쓰지 마세요. 단 `components/features/filters/jobGroup.ts`·`eventType.ts`는 새 필터 줄과 `lib/utils/timeline/filters.ts`가 씁니다.

### 캘린더 보기 (`components/events/calendar/`)
`/events?view=calendar&year=&month=(&day=)`. `/events`의 `getServerSideProps`가 `?view=calendar`면 월별 조회(`/front/v2/events/{year}/{month}`)를 받아 `EventCalendar`를, 아니면 목록 조회를 받아 `EventTimeline`을 그립니다(캘린더 보기에서는 목록 조회를 부르지 않음). `EventCalendar` = `FilterBar` + 색 농도 달력 `HeatMonth`(범례 `HeatLegend`) + 고른 날의 목록 `DayPanel`. 고른 날은 주소의 `day`(shallow `replace`), 달 이동은 서버를 거칩니다. 배치는 CSS로만 바뀝니다(621~860px 두 칸, 620px 이하 위아래). `ViewToggle`(타임라인 | 캘린더)은 `DateNav`·`EventCalendar` 안에 있고, 타임라인으로 갈 때 보던 날을 `EventContext.focusDay`로 넘깁니다. `pages/events.tsx`의 `Router.beforePopState`는 shallow로 남은 기록으로 돌아갈 때 주소의 보기·달이 지금 props와 다르면 `Router.replace`로 `getServerSideProps`를 다시 거치게 합니다(Next는 shallow 기록이면 props를 그대로 씀). 순수 로직(`buildCalendarMatrix`, `buildCalendarView`, `calendarDay`, `calendarMonth`, `calendarUrl`)은 `utils/__tests__/`에서 테스트합니다.

## 테스트

지금은 순수 함수만 테스트로 커버되어 있습니다. Jest 설정은 `jest.config.js` (ts-jest + jsdom, SCSS는 `__mocks__/styleMock.js`로 모킹). 테스트는 대상 코드 옆 `__tests__/` 디렉터리에: `lib/utils/__tests__/`, `lib/utils/{timeline,detail,banner,mypage}/__tests__/`, `lib/seo/__tests__/`, `lib/api/__tests__/`, `lib/sticker/__tests__/`, `components/events/calendar/utils/__tests__/`, `components/common/{banner,sticker,modal/login}/__tests__/`, `styles/__tests__/`(`--de-*` 변수 목록). 컴포넌트 테스트를 추가하려면 `@testing-library/react`를 설치해야 합니다 (현재 미설치).

## 작업 노트

- `main`이 배포 브랜치. 기능 작업은 `feature/*` 브랜치에서 진행하고 PR로 merge합니다.
- `DESIGN.md`는 비주얼 디자인 계약 — 새 UI 만들 땐 그 토큰을 재사용 (primary: KTB Tech Blue, 폰트: Pretendard, 12/24px radius, `#E1E1E8` 보더).
- `docs/superpowers/specs/`와 `docs/superpowers/plans/` 에 최근 작업의 디자인 스펙·구현 플랜이 있음 (events card / detail / filter / header 리뉴얼, events calendar view). 해당 영역 수정 시 참고용.
- 메인·상세 리디자인(2026-11)의 스펙은 `docs/design-proposals/2026-11-13-main-detail-redesign/`(시안, 설명 `detail-design/`)와 `docs/superpowers/plans/2026-11-1[78]-redesign-*.md`(로드맵 `2026-11-17-redesign-roadmap.md`와 단계별 계획)에 있습니다. 각 계획 끝의 "정한 것과 확인이 필요한 것"에 결정과 남은 질문이 있습니다.
- `.claude/`, `.omc/`, `.superpowers/`는 로컬 Claude/에이전트 상태이며 gitignore 대상입니다.
