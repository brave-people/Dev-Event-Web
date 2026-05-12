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
- **데이터 페치**: SWR 훅들이 `lib/hooks/useSWR.tsx`에 있음 (`useScheduledEvents`, `useMonthlyEvent`, `useMyEvent`, `useTags`, `useUser`). 각 훅은 `fallbackData`를 받아 SSR로 받아온 데이터를 즉시 hydrate하고 이후 SWR이 revalidate. **새 훅을 추가할 때 이 패턴을 따르세요** — 컴포넌트 내부에서 `fetch`를 직접 호출하지 말 것.
- **HTTP**: `lib/api/`에 axios 인스턴스 — 비인증 콜은 `axiosInstance`, 인증 콜은 `axiosInstanceWithToken`. 에러 처리도 같은 디렉터리.

### 상태 관리 (Context)
모든 Provider는 `pages/_app.tsx`에서 다음 순서로 중첩됩니다: `AuthProvider → WindowProvider → EventProvider → ToastProvider`.
- **`EventContext`**: 페이지 간 공유되는 필터 상태 (`jobGroupList`, `eventType`, `location`, `coast`, `search`, `date`, `url`). 필터 컴포넌트가 `update*`/`delete*`/`handle*` 메서드로 mutate합니다. `/events` 리스트 뷰와 캘린더 뷰가 이 상태를 공유하므로 뷰 토글 시에도 필터 칩이 유지됩니다.
- **`WindowContext`**: viewport류 데이터 — `windowX`(픽셀 폭), `windowTheme`, `isNotice`, 그리고 숫자형 `modalState.currentModal` 스위치. 모달은 컴포넌트별 boolean이 아니라 `modalState.currentModal === <id>` 매칭으로 게이팅합니다. 새 모달 추가할 때 이 패턴을 유지하세요.
  - **주의**: `handleWindowX`는 정의되어 있지만 어떤 resize 리스너도 이를 호출하지 않습니다. 컴포넌트에서 현재 viewport가 필요하면 자체 `window.innerWidth` + `resize` 리스너를 추가하세요 (예: `components/events/calendar/CalendarView.tsx`). `WindowContext.windowX > 0` 으로 분기하지 마세요 — 항상 0입니다.

### 컨벤션
- **import**: `tsconfig.json`의 `baseUrl: './'`로 프로젝트 루트 기준 절대 경로 임포트가 가능합니다 (`import { Event } from 'model/event'`). 가능한 한 절대 경로를 사용하고 `../../../` 같은 상대 경로는 피하세요. Prettier가 `.prettierrc.cjs`에 정의된 순서로 정렬합니다 (`react`, `classnames`, `@headlessui`, `next`, `jotai`, `@<...>`, 그 다음 relative).
- **스타일**: SCSS Module (`Foo.tsx` 옆 `Foo.module.scss`). `classNames.bind(style)`을 `cn` 또는 `cx`로 별칭. 공유 SCSS 임포트 시 **반드시 풀 파일명 + 틸드**: `@import '~styles/_variables.scss'`. `@import '~styles/variables'` 같이 확장자/언더스코어 생략하면 sass-loader가 조용히 실패하면서 해시된 클래스명만 생성되고 실제 CSS 규칙은 비어버리는 함정이 있습니다.
- **디자인 토큰**: `DESIGN.md`에 KTB(카카오테크 부트캠프) 기반 디자인 시스템 정리 — Pretendard 폰트, KTB Tech Blue `#0043FF`, Vapor gray 스케일, 12/24px border-radius. 공유 SCSS 변수/믹스인은 `styles/_variables.scss` / `_mixin.scss` / `_common.scss`.
- **이미지**: `next/image` + `unoptimized` 조합으로 외부 썸네일 사용. 허용된 외부 호스트는 `next.config.js > images.domains`에 화이트리스트. 폴백 썸네일은 `/default/event-thumbnail-light.png`.
- **SVG**: `@svgr/webpack`으로 React 컴포넌트로 import (이미 `next.config.js`에 설정).
- **레이아웃**: 페이지가 `getLayout`을 export하면 wrap됩니다: `Events.getLayout = (page) => <Layout>{page}</Layout>`. `_app.tsx`가 이를 읽어서 적용합니다.

### 도메인 모델 (`model/event.ts`)
직관적이지 않은 필드 몇 가지:
- `event_time_type: 'DATE' | 'RECRUIT'` — `DATE`는 실제 행사 날짜, `RECRUIT`는 모집/접수 기간 (보통 캘린더처럼 날짜 기반 UI에는 렌더하지 않음).
- `use_start_date_time_yn` / `use_end_date_time_yn: 'Y' | 'N' | null` — `'N'`이면 날짜만 의미 있고 시간 부분은 무의미. 표시 로직에서 반드시 체크해야 합니다 (`components/common/item/Item.tsx > getEventDate` 참고).
- 이벤트는 여러 날에 걸칠 수 있음 (`start_date_time` → `end_date_time`).

### 캘린더 기능 (`components/events/calendar/`)
기존 카드 리스트 위에 추가된 뷰. `/events` 페이지가 `getServerSideProps`에서 `?view=calendar` 여부로 분기해 `ScheduledEventList`(리스트) 또는 `CalendarView`(그리드)를 렌더. `CalendarView`는 viewport(`window.innerWidth <= 720`)를 자체 감지해 `CalendarGrid`(데스크탑 7×6) 또는 `CalendarDotGrid`(모바일 점 캘린더)를 선택. `ViewToggle` 칩은 리스트 모드에선 `EventFilter`의 칩 줄 안에, 캘린더 모드에선 `CalendarHeader` 안에 들어갑니다. 순수 로직 (`buildCalendarMatrix`, `layoutMultiDayEvents`, `tagColor`)은 `components/events/calendar/utils/__tests__/` 하위에 단위 테스트 됩니다.

## 테스트

지금은 순수 유틸 함수만 테스트로 커버되어 있습니다. Jest 설정은 `jest.config.js` (ts-jest + jsdom, SCSS는 `__mocks__/styleMock.js`로 모킹). 테스트는 대상 코드 옆 `__tests__/` 디렉터리에. 컴포넌트 테스트를 추가하려면 `@testing-library/react`를 설치해야 합니다 (현재 미설치).

## 작업 노트

- `main`이 배포 브랜치. 기능 작업은 `feature/*` 브랜치에서 진행하고 PR로 merge합니다.
- `DESIGN.md`는 비주얼 디자인 계약 — 새 UI 만들 땐 그 토큰을 재사용 (primary: KTB Tech Blue, 폰트: Pretendard, 12/24px radius, `#E1E1E8` 보더).
- `docs/superpowers/specs/`와 `docs/superpowers/plans/` 에 최근 작업의 디자인 스펙·구현 플랜이 있음 (events card / detail / filter / header 리뉴얼, events calendar view). 해당 영역 수정 시 참고용.
- `.claude/`, `.omc/`, `.superpowers/`는 로컬 Claude/에이전트 상태이며 gitignore 대상입니다.
