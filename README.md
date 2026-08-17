# Dev Event Web

> 🎉 개발자 행사(웨비나·컨퍼런스·해커톤·네트워킹)를 큐레이션해서 한 곳에 모아 보여주는 웹사이트 입니다.

👉 **웹 바로가기**: [https://dev-event.vercel.app/events](https://dev-event.vercel.app/events)

<br />

## 주요 기능

- **행사 리스트 / 캘린더 듀얼 뷰** — `/events`에서 카드 리스트와 월간 캘린더 그리드를 토글. 모바일은 점(dot) 캘린더로 자동 전환.
- **다중 필터** — 직군·행사 유형·지역·비용·검색어·기간을 조합. 필터 상태는 `EventContext`로 리스트/캘린더 뷰 간 공유.
- **북마크(내 행사)** — 로그인 사용자가 관심 행사를 저장하고 진행중/종료 탭으로 추적.
- **행사 상세 페이지** — 외부 API의 마크다운 본문을 `marked`로 렌더링.
- **SSR 우선** — 모든 페이지가 `getServerSideProps` 기반, SWR로 클라이언트 hydrate 후 revalidate.

<br />

## 기술 스택

- **Framework**: Next.js 12 (Pages Router) · React 17 · TypeScript 4.6
- **Styling**: SCSS Modules · Pretendard · KTB Tech Blue 디자인 토큰 (`DESIGN.md` 참고)
- **State**: React Context (Auth · Event · Window · Toast)
- **Data**: SWR + axios, 외부 API (`${BASE_SERVER_URL}/front/v2/...`)
- **Test**: Jest 29 + ts-jest + jsdom
- **Analytics**: Vercel Analytics
- **Deploy**: Vercel

<br />

## 개발 환경

- Node.js **20.15.1** (`.nvmrc` 고정)
- pnpm **8+**

<br />

## 시작하기

```sh
# 의존성 설치
$ pnpm install

# 개발 서버 (http://localhost:5000, 3000 아님)
$ pnpm dev

# 빌드 / 프로덕션 서빙
$ pnpm build
$ pnpm start

# 린트
$ pnpm lint

# 테스트
$ pnpm test
$ pnpm test:watch
$ pnpm test -- buildCalendarMatrix    # 단일 파일

# 타입 체크만
$ npx tsc --noEmit
```

### 백엔드 연결 (`.env`)

```sh
# 로컬 서버를 볼 때
BASE_SERVER_URL=http://127.0.0.1:9000

# 주최자 API 목업 스위치 — 기본값(미설정 포함)은 실서버 호출
NEXT_PUBLIC_USE_HOST_MOCK=false
```

- **`BASE_SERVER_URL`을 바꾸면 dev 서버를 반드시 재시작**하세요. `next.config.js`가 이 값을 빌드 타임에 인라인하므로 재시작 없이는 반영되지 않습니다.
- **주최자 조회 API(`/front/v2/hosts*`)는 서버의 `feature/host-260518` 브랜치에만 있습니다.** 운영·dev 서버 주소(예: `https://<real-host>` / `https://<dev-host>`)를 가리킨 채로 mock 을 끄면 `/hosts` 관련 호출이 전부 404 입니다. 머지·배포 전에는 로컬 서버로만 확인하세요.
- 목업 데이터로 화면만 보려면 `NEXT_PUBLIC_USE_HOST_MOCK=true` 로 두면 됩니다(서버 없이 동작).

<br />

## 디렉터리 구조

```
pages/              # Next.js Pages Router 진입점 (SSR)
  api/              # auth/세션용 얇은 헬퍼 (데이터 레이어 아님)
components/
  events/calendar/  # 캘린더 그리드·점 캘린더·뷰 토글 + 순수 로직 + 유닛 테스트
  myEvent/          # 북마크 탭·리스트
  common/item/      # 행사 카드
  layout/           # 공통 레이아웃 래퍼
context/            # AuthProvider · EventProvider · WindowProvider · ToastProvider
lib/
  api/              # axios 인스턴스 (인증/비인증)
  hooks/useSWR.tsx  # 데이터 페치 훅 (fallbackData 패턴)
  utils/            # 날짜·gTag 등 헬퍼
model/event.ts      # 도메인 타입
styles/             # 글로벌 SCSS·변수·믹스인·CSS Module
docs/superpowers/   # 최근 작업의 디자인 스펙·구현 플랜
```

<br />

## 컨벤션

- `tsconfig.json`의 `baseUrl: './'`로 절대 경로 import (`import { Event } from 'model/event'`).
- SCSS Module 공유 import는 `@import '~styles/_variables.scss'` 형식(틸드 + 확장자 + 언더스코어 모두 필수).
- 디자인 토큰은 `DESIGN.md` (Pretendard · KTB Tech Blue `#0043FF` · 12/24px radius · `#E1E1E8` border)에 정리.
- 새 데이터 페치는 `lib/hooks/useSWR.tsx` 패턴(`fallbackData` 주입) 사용. 컴포넌트에서 `fetch` 직접 호출 금지.

<br />

## 배포

```sh
# 로컬 빌드 테스트
$ pnpm build

# 프리뷰 배포
$ vercel build && vercel deploy

# 프로덕션 배포
$ vercel build && vercel deploy --prod
```

`main` 브랜치가 배포 대상. 기능 작업은 `feature/*` 또는 `release/*` 브랜치에서 진행하고 PR로 머지합니다.

<br />

## 참고 문서

- [`CLAUDE.md`](./CLAUDE.md) — 아키텍처 개요 & Claude Code 작업 가이드
- [`DESIGN.md`](./DESIGN.md) — 비주얼 디자인 시스템
- `docs/superpowers/` — 최근 작업의 스펙·플랜 (events card/detail/filter/header 리뉴얼, calendar view 등)
