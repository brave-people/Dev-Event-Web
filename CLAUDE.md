# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

Dev Event Web — 개발자 행사(웨비나·컨퍼런스·해커톤·네트워킹)를 큐레이션하는 한국어 웹 (https://dev-event.vercel.app/events). Next.js 12 / React 17 / TypeScript 4.6, pnpm 8+, Node 20 (`.nvmrc`는 20.15.1 고정).

이 저장소는 프론트엔드 하나일 뿐이고, 형제 저장소 두 개와 함께 하나의 서비스를 이룹니다 (아래 "연관 저장소" 참고).

## 명령어

```bash
pnpm install        # 의존성 설치
pnpm dev            # 개발 서버 http://localhost:5000  (주의: 3000 아님, 5000 포트)
pnpm build          # 프로덕션 Next.js 빌드 (배포 전 / 대규모 리팩토링 후 권장)
pnpm start          # 빌드 결과물 서빙
pnpm lint           # next lint (첫 실행 시 ESLint 셋업 프롬프트 — "Strict" 선택)
pnpm test           # jest (ts-jest + jsdom)
pnpm test:watch     # jest watch 모드
pnpm test -- <pattern>   # 단일 테스트 파일, 예: pnpm test -- buildCalendarMatrix
npx tsc --noEmit    # 타입 체크만 (빌드 없이)
```

배포는 Vercel을 통해 진행 (`vercel build && vercel deploy [--prod]`). 정식 순서는 README에 정리되어 있어요.

## 아키텍처 개요

### 라우팅 & 데이터 레이어
- **Pages Router** (`pages/`) — 모든 페이지는 `getServerSideProps`로 SSR 렌더링. 클라이언트 라우팅은 `router.push`(SSR을 다시 돌려야 하면 `shallow: false`). `/calender` 라우트는 `/events?view=calendar&year=&month=`로 307 리디렉트만 함 (예전 북마크 호환).
- **외부 API**가 데이터의 진실 근원. `${process.env.BASE_SERVER_URL}/front/v2/...` 에서 받아옵니다. Next.js의 `pages/api/*`는 auth/세션/쿠키용 얇은 헬퍼로만 쓰이며, 데이터 레이어가 아닙니다.
- **데이터 페치**: SWR 훅들이 `lib/hooks/useSWR.tsx`에 있음 (`useScheduledEvents`, `useMonthlyEvent`, `useMyEvent`, `useTags`, `useUser`, `useHostList`, `useHostDetail`, `useHostEvents`). 각 훅은 `fallbackData`를 받아 SSR로 받아온 데이터를 즉시 hydrate하고 이후 SWR이 revalidate. **새 훅을 추가할 때 이 패턴을 따르세요** — 컴포넌트 내부에서 `fetch`를 직접 호출하지 말 것.
- **HTTP**: `lib/api/`에 axios 인스턴스 — 비인증 콜은 `axiosInstance`, 인증 콜은 `axiosInstanceWithToken`. 에러 처리도 같은 디렉터리.

### 상태 관리 (Context)
모든 Provider는 `pages/_app.tsx`에서 다음 순서로 중첩됩니다: `AuthProvider → WindowProvider → EventProvider → ToastProvider`.
- **`EventContext`**: 페이지 간 공유되는 필터 상태 (`jobGroupList`, `eventType`, `location`, `coast`, `search`, `date`, `url`). 필터 컴포넌트가 `update*`/`delete*`/`handle*` 메서드로 mutate합니다. `/events` 리스트 뷰와 캘린더 뷰가 이 상태를 공유하므로 뷰 토글 시에도 필터 칩이 유지됩니다.
- **`WindowContext`**: viewport류 데이터 — `windowX`(픽셀 폭), `windowTheme`, `isNotice`, 그리고 숫자형 `modalState.currentModal` 스위치. 모달은 컴포넌트별 boolean이 아니라 `modalState.currentModal === <id>` 매칭으로 게이팅합니다. 새 모달 추가할 때 이 패턴을 유지하세요.
  - **주의**: `handleWindowX`는 정의되어 있지만 어떤 resize 리스너도 이를 호출하지 않습니다. 컴포넌트에서 현재 viewport가 필요하면 자체 `window.innerWidth` + `resize` 리스너를 추가하세요 (예: `components/events/calendar/CalendarView.tsx`). `WindowContext.windowX > 0` 으로 분기하지 마세요 — 항상 0입니다.

### 테마 (라이트/다크)
- **진실 근원은 `<html data-theme="light|dark">` 속성**입니다. `_document.tsx`의 인라인 스크립트가 hydration 전에 먼저 세팅해 FOUC를 막고, `context/window.tsx`가 그 값을 읽어 상태를 맞춥니다. React state를 테마의 근원으로 삼지 마세요.
- **`WindowContext.windowTheme`는 boolean이고 `true = light`, `false = dark`** 입니다. 이름만 보면 반대로 읽히니 주의.
- 색상 토큰은 `styles/Theme.scss`의 `html[data-theme='light']` / `html[data-theme='dark']` 두 블록에 CSS 변수로 정의돼 있습니다. **새 UI는 반드시 `var(--vapor-*)` / `var(--ktb-*)` 토큰을 쓰고 hex를 하드코딩하지 마세요** — 하드코딩하면 다크모드에서 대비가 무너집니다. 라이트/다크 양쪽에서 확인하는 것이 이 저장소의 기본 요구사항입니다.

### 헤더 오프셋 (레이아웃 함정)
`Header`가 `position: fixed`라 페이지 최상단 요소는 헤더 높이만큼 밀어줘야 콘텐츠가 가려지지 않습니다. `$header-height`(49px)는 `styles/_variables.scss`에 있고, 페이지 최상단 블록에 `padding-top: calc(#{$header-height} + N)` 또는 `margin-top: $header-height`를 줍니다. `/events`는 `<Banner>` 컴포넌트가 이 역할을 대신하므로 별도 보정이 없는 것처럼 보입니다 — 새 페이지를 만들 때 이걸 빠뜨리면 상단이 잘립니다.

### 컨벤션
- **import**: `tsconfig.json`의 `baseUrl: './'`로 프로젝트 루트 기준 절대 경로 임포트가 가능합니다 (`import { Event } from 'model/event'`). 가능한 한 절대 경로를 사용하고 `../../../` 같은 상대 경로는 피하세요. Prettier가 `.prettierrc.cjs`에 정의된 순서로 정렬합니다 (`react`, `classnames`, `@headlessui`, `next`, `jotai`, `@<...>`, 그 다음 relative).
- **스타일**: SCSS Module (`Foo.tsx` 옆 `Foo.module.scss`). `classNames.bind(style)`을 `cn` 또는 `cx`로 별칭. 공유 SCSS 임포트 시 **반드시 풀 파일명 + 틸드**: `@import '~styles/_variables.scss'`. `@import '~styles/variables'` 같이 확장자/언더스코어 생략하면 sass-loader가 조용히 실패하면서 해시된 클래스명만 생성되고 실제 CSS 규칙은 비어버리는 함정이 있습니다.
- **디자인 토큰**: `DESIGN.md`에 KTB(카카오테크 부트캠프) 기반 디자인 시스템 정리 — Pretendard 폰트, KTB Tech Blue `#0043FF`, Vapor gray 스케일, 12/24px border-radius. 공유 SCSS 변수/믹스인은 `styles/_variables.scss` / `_mixin.scss` / `_common.scss`, 테마 토큰은 `styles/Theme.scss` / `_color.scss`.
- **이미지**: `next/image` + `unoptimized` 조합으로 외부 썸네일 사용. 허용된 외부 호스트는 `next.config.js > images.domains`에 화이트리스트 — **여기에 없는 호스트를 `next/image`에 넘기면 런타임 에러**입니다. 폴백 썸네일은 `/default/event-thumbnail-light.png`.
- **SVG**: `@svgr/webpack`으로 React 컴포넌트로 import (이미 `next.config.js`에 설정).
- **레이아웃**: 페이지가 `getLayout`을 export하면 wrap됩니다: `Events.getLayout = (page) => <Layout>{page}</Layout>`. `_app.tsx`가 이를 읽어서 적용합니다.

### 도메인 모델 (`model/event.ts`)
직관적이지 않은 필드 몇 가지:
- `event_time_type: 'DATE' | 'RECRUIT'` — `DATE`는 실제 행사 날짜, `RECRUIT`는 모집/접수 기간 (보통 캘린더처럼 날짜 기반 UI에는 렌더하지 않음).
- `use_start_date_time_yn` / `use_end_date_time_yn: 'Y' | 'N' | null` — `'N'`이면 날짜만 의미 있고 시간 부분은 무의미. 표시 로직에서 반드시 체크해야 합니다 (`components/common/item/Item.tsx > getEventDate` 참고).
- 이벤트는 여러 날에 걸칠 수 있음 (`start_date_time` → `end_date_time`).
- 서버 응답 필드가 **snake_case 그대로** 타입에 선언돼 있습니다. camelCase로 바꾸지 마세요 (아래 "API 계약" 참고).

### 캘린더 기능 (`components/events/calendar/`)
기존 카드 리스트 위에 추가된 뷰. `/events` 페이지가 `getServerSideProps`에서 `?view=calendar` 여부로 분기해 `ScheduledEventList`(리스트) 또는 `CalendarView`(그리드)를 렌더. `CalendarView`는 viewport(`window.innerWidth <= 720`)를 자체 감지해 `CalendarGrid`(데스크탑 7×6) 또는 `CalendarDotGrid`(모바일 점 캘린더)를 선택. `ViewToggle` 칩은 리스트 모드에선 `EventFilter`의 칩 줄 안에, 캘린더 모드에선 `CalendarHeader` 안에 들어갑니다. 순수 로직 (`buildCalendarMatrix`, `layoutMultiDayEvents`, `tagColor`)은 `components/events/calendar/utils/__tests__/` 하위에 단위 테스트 됩니다.

### 주최자(Host) 기능 (`pages/hosts/`, `components/hosts/`)
행사의 주최자별로 진행중·지난 행사를 모아 보여주는 영역. 개발이 진행 중이며 아래 두 가지가 특히 헷갈립니다.

- **라우팅 키는 숫자 `hostId`(서버 PK)** 입니다. `/hosts/[hostId].tsx`의 `getServerSideProps`가 `Number(raw)`로 파싱하고 실패 시 `notFound`를 반환하므로, 주최자 **이름 문자열로 링크를 걸면 무조건 404**가 납니다. 행사에서 주최자로 이동시킬 땐 이벤트 응답의 `hosts[]`에 담긴 `id`를 쓰세요.
- **`lib/api/host.ts`에 mock 스위치**가 있습니다: `USE_MOCK = process.env.NEXT_PUBLIC_USE_HOST_MOCK !== 'false'` — 즉 **기본값이 mock**이라 아무 설정도 안 하면 `lib/mock/hosts.ts`의 고정 데이터가 렌더됩니다. 실서버에 붙이려면 `.env`에 `NEXT_PUBLIC_USE_HOST_MOCK=false`를 명시해야 합니다.
- 목록(`/hosts`)의 검색·정렬·분류 필터는 컴포넌트 state가 아니라 **URL 쿼리(`q` / `category` / `sort`)** 로 관리되고 `router.push(..., { shallow: false })`로 SSR을 다시 태웁니다.
- 데이터 모델은 `model/host.ts`, 서버 계약과 1:1로 맞춘 snake_case입니다.

### 연관 저장소 & API 계약
- **`../Dev-Event-Server`** — Spring Boot 3.0.5 + JPA/QueryDSL 백엔드. 공개 API는 `/front/v2/**`, 어드민 API는 `/admin/v1/**`. 로컬 스키마는 `src/main/resources/sql/schema.sql`을 수동 적용합니다 (`ddl-auto: none`, Flyway 없음).
- **`../Dev-Event-Client`** — 운영자용 어드민 (Next.js 13 App Router). 행사·주최자·배너 CRUD.
- **JSON 네이밍**: 서버가 `spring.jackson.property-naming-strategy: SNAKE_CASE`로 직렬화합니다. 그래서 이 저장소의 `model/*.ts`는 **snake_case 필드를 그대로 선언**합니다. 새 모델을 만들 때 camelCase로 "정리"하면 런타임에 값이 전부 `undefined`가 되니 주의하세요.

## 환경변수

`.env`는 커밋되지 않습니다. 코드에서 참조하는 키:

| 키 | 용도 |
|---|---|
| `BASE_SERVER_URL` | 백엔드 API 베이스 URL (SSR/서버사이드 호출) |
| `NEXT_PUBLIC_USE_HOST_MOCK` | 주최자 API mock 스위치. **`false`여야 실서버 호출** |
| `NEXT_PUBLIC_BASE_URL` | 클라이언트에서 쓰는 자기 자신 URL |
| `GA_TRACKING_ID` | Google Analytics |
| `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` | 검색엔진 소유 확인 |
| `ANALYZE` | 번들 분석 활성화 |

## 테스트

순수 유틸 함수와 mock 데이터만 커버되어 있습니다 (`lib/utils/__tests__/`, `components/events/calendar/utils/__tests__/`, `lib/mock/__tests__/`). Jest 설정은 `jest.config.js` (ts-jest + jsdom, SCSS는 `__mocks__/styleMock.js`로 모킹). 테스트는 대상 코드 옆 `__tests__/` 디렉터리에. 컴포넌트 테스트를 추가하려면 `@testing-library/react`를 설치해야 합니다 (현재 미설치).

**함정**: `testMatch`가 `**/__tests__/**`라서 **`.claude/worktrees/` 안에 남아 있는 옛 워크트리 복사본의 테스트까지 함께 실행**됩니다. 실제 테스트가 5개인데 13개 스위트가 "통과"하는 식이라, 결과를 볼 때 파일 경로를 확인하세요. 이미 지운 테스트가 워크트리 사본에서 계속 통과할 수도 있습니다. 정리하려면 워크트리를 제거하거나 `jest.config.js`에 `testPathIgnorePatterns: ['/node_modules/', '/\\.claude/']`를 추가하면 됩니다.

## 작업 노트

- `main`이 배포 브랜치. 기능 작업은 `feature/*` 브랜치에서 진행하고 PR로 merge합니다.
- `DESIGN.md`는 비주얼 디자인 계약 — 새 UI 만들 땐 그 토큰을 재사용 (primary: KTB Tech Blue, 폰트: Pretendard, 12/24px radius, `#E1E1E8` 보더). 주최자 화면 규격도 여기에 정리돼 있습니다.
- `docs/superpowers/specs/`와 `docs/superpowers/plans/` 에 최근 작업의 디자인 스펙·구현 플랜이 있음 (events card / detail / filter / header 리뉴얼, events calendar view). 해당 영역 수정 시 참고용.
- 주최자 기능의 설계 문서·목업·진행 현황은 이 저장소가 아니라 **`../Dev-Event-Ai/project/host/`** 에 모여 있습니다 (`PROGRESS.md`가 세 저장소에 걸친 남은 작업 목록).
- `.claude/`, `.omc/`, `.superpowers/`는 로컬 Claude/에이전트 상태이며 gitignore 대상입니다.
