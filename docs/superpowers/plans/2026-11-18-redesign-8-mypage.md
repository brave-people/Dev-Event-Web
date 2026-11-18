# 리디자인 8단계 — 관심 행사 · 내 정보 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관심 행사(`/myevent`)를 "제목 '북마크' + 탭 + 큰 카드 목록"에서 "홀로그램 머리띠 안의 제목 '관심 행사'와 탭(진행중 N / 종료 N) + 줄 목록"으로, 내 정보(`/myinfo`)를 "카드 세 장"에서 "홀로그램 머리띠가 있는 가운데 카드 한 장"으로 바꾼다. 탈퇴 확인 창도 새 모양으로 바꾼다. 함께, 세 파일에 흩어져 있던 종료 판정을 순수 함수 하나로 모아 탭 숫자와 목록이 같은 계산에서 나오게 한다.

**Architecture:** 종료 판정·탭 나누기·줄에 적는 글자(배지, 기간)는 `lib/utils/mypage/savedEvents.ts`, 프로필의 첫 글자·가입일 글자는 `lib/utils/mypage/profile.ts`의 순수 함수로 빼고 테스트를 먼저 쓴다. 관심 행사 화면은 `components/myEvent/`에 새 부품(`SavedBand`, `SavedTabs`, `SavedRow`, `SavedList`, `SavedEvents`)을 만들고 `pages/myevent.tsx`가 `SavedEvents` 하나를 그린다. 목록 요청·빼기 요청·알림·GA·주소 이동은 `SavedEvents` 한 파일에 모아 지금 코드와 줄 단위로 견줄 수 있게 한다. 내 정보는 `components/myInfo/ProfileCard`가 카드를 그리고, 탈퇴 요청·로그아웃·GA는 지금처럼 `pages/myinfo.tsx`에 둔다. 탈퇴 확인 창은 `DeleteAccountModal`의 경로·props를 그대로 두고 내용만 바꾼다(`react-modal`, 6단계 `Lightbox`·7단계 로그인 창과 같은 방식). 머리띠의 스티커는 2단계의 `Sticker`와 `SAVED_BAND`·`ME_BAND`를 쓴다. 7단계의 `LoginBand`는 쓰지 않는다(아래 "이 계획이 정한 것" 2).

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / react-modal 3.x / dayjs / jest (ts-jest)

**Spec:** 목업 `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/`의 `mypage.js`(관심 행사 `sv6`: `:66-69`, 공통 부품 `:22-32`, 내 정보 `me2`: `:130-133`, 공통 `:115-118`, 탈퇴 확인 창 `:189`), `mypage.css`(공통 `:13-42`, 탈퇴 창 `:51-56`, `sv6` `:107-116`, 프로필 원·줄 `:183-191`, `me2` `:205-213`, 움직임 줄이기 `:303`, 860px 이하 `:313-336`, 520px 이하 `:348`), `app.js:28`(기본값 `sv6`·`me2`), `:438-448`(탈퇴 창 열기·닫기), `:520`(빼기 안내), 설명 페이지 `index.html:435-476`. 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`. **보여 주는 정보·탭의 뜻·요청·알림과 확인 문구·성공/실패 뒤 동작의 기준은 목업이 아니라 지금 코드**(`pages/myevent.tsx`, `components/myEvent/*`, `pages/myinfo.tsx`, `components/common/modal/DeleteAccountModal.tsx`, `lib/api/delete.tsx`)다. 둘이 다른 곳은 아래 "목업과 지금 코드가 다른 점" 표가 정한다.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm dev`·`pnpm start`로 화면을 띄우지 않고, **로그인·가입·양식 제출을 하지 않는다**(관심 빼기·회원 탈퇴처럼 요청이 나가는 확인은 관리자·사용자가 한다). `pnpm build`는 작업 6에서 한 번만. 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다(로그인이 필요한 화면을 보는 방법은 이 문서 끝의 "관리자 확인"). 파일을 지우지 않는다. 파일 내려받기·외부 요청 없음.

## Global Constraints

- **리디자인은 지금 스펙 그대로.** 아래 "지금 동작" 표의 요청·알림·GA·이동은 순서까지 같아야 한다. 목업에만 있는 것은 넣지 않는다: 정렬, 일괄 삭제, 알림 설정, 화면 안의 로그아웃, 숫자 요약 카드, 관심 행사 바로 가기(목업의 다른 시안 `me5`·`me6`·`me8`·`me9`에 있는 것들이다. 정해진 `sv6`·`me2`에는 없다).
- **건수를 요약하는 문구를 새로 만들지 않는다.** 숫자가 들어가는 자리는 탭의 "진행중 N / 종료 N"뿐이다. "담아 둔 행사 9건" 같은 줄, 목록 위의 "N건", 빈 화면의 건수 문장을 넣지 않는다.
- **`lib/api/*`, `lib/hooks/useSWR.tsx`, `lib/hooks/useFavorite.tsx`, `context/auth.tsx`는 고치지 않는다.** 7단계가 같은 때에 `useFavorite.tsx`·`context/auth.tsx`를 고친다. 이 단계는 `useMyEvent`·`useUser`를 지금 모양대로 부르기만 한다.
- **7단계의 파일(`components/common/modal/login/*`, `LoginModal.*`)과 2단계의 파일(`components/common/sticker/*`, `lib/sticker/*`)은 고치지 않는다.** `StickerDefs`는 `components/layout/index.tsx`에 이미 있다. 다시 넣지 않는다.
- **3단계 부품은 "추가만".** `EventThumb`는 props를 바꾸지 않고 그대로 쓴다. `TimelineIcon`에는 `mail` 하나만 더할 수 있다(7단계 작업 3이 더하는 것과 같은 한 줄이다. 이미 있으면 손대지 않는다). `EventCard`는 쓰지 않고 고치지도 않는다.
- **두 화면은 `AuthContext.isChecked`를 읽지 않는다.** 두 화면은 서버가 `access_token` 쿠키를 보고, 없으면 `/events`로 돌려보낸다(임시 리디렉트). 그래서 화면이 그려졌다면 쿠키가 있는 것이고, 지금처럼 `useEffect`에서 `authContext.login()`을 부른다(7단계가 들어오면 이때 `isChecked`도 참이 된다). 목록·프로필 요청은 지금처럼 `AuthContext`와 무관하게 바로 나간다. 이 `useEffect`와 `getServerSideProps`의 리디렉트는 고치지 않는다.
- `WindowContext.modalState`는 탈퇴 확인 창이 지금도 쓰지 않는다(페이지의 `useState`). 쓰지 않는 채로 둔다.
- 색은 `--de-*` 변수만. 고정 색 값은 아래만 허용한다.

  | 쓰임 | 값 | 목업 |
  |---|---|---|
  | 관심 행사 머리띠 바탕 | `radial-gradient(ellipse 70% 150% at 72% 40%, #1a1d2b 0%, #0b0d14 78%)`, 글자 `#fff` | `mypage.css:108` |
  | 내 정보 머리띠 바탕 | `radial-gradient(ellipse 70% 140% at 50% 40%, #1a1d2b 0%, #0b0d14 78%)` | `:207` |
  | 머리띠 위의 탭 | 묶음 바탕 `rgba(255, 255, 255, 0.1)`, 글자 `#aeb5c6`, 숫자 바탕 `rgba(255, 255, 255, 0.14)`·글자 `#dfe3ec`. 고른 탭은 바탕 `#fff`·글자 `#15171c`, 숫자 바탕 `#15171c`·글자 `#fff`. 포커스 테두리 `#fff` | `:113-115` |
  | 프로필 원(사진이 없을 때) | `linear-gradient(135deg, #0043ff, #6a8dff)`, 글자 `#fff` | `:183` |
  | 탈퇴 창 오버레이 · 그림자 | `rgba(12, 14, 22, 0.56)` · `0 24px 70px rgba(8, 10, 20, 0.34)` | `:51-52` |
  | "탈퇴하기" 버튼 글자 | `#fff` (바탕은 `var(--de-red)`) | `:56` |

  목업의 변수 `--bg`, `--ink`, `--sub`, `--hint`, `--faint`, `--line`, `--surface`, `--hover`, `--blue`, `--blue-soft`, `--orange`, `--orange-soft`, `--red`, `--shadow`는 `--de-bg`, `--de-ink` …이다.
- **폭이 바뀌는 자리는 860px(`de-mobile`) 하나**이고, 내 정보의 머리띠만 520px에서 스티커 두 장을 더 숨긴다(`@media (max-width: 520px)`로 직접 쓴다). 좌우 여백은 `de-container`가 한다(20px, 360px 이하 16px). `window.innerWidth`·`WindowContext.windowX`로 갈라지는 코드를 쓰지 않는다. 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수는 쓰지 않는다. **330·540·660px은 모두 "860px 이하" 값으로 그려지고, 그 폭에서 글자가 잘리거나 가로 스크롤이 생기지 않아야 한다.**

  | 관심 행사 | 861px 이상 | 860px 이하 |
  |---|---|---|
  | 화면 여백(위 · 아래) | 24px · 76px | 14px · 56px |
  | 머리띠 | `min-height: 176px`, 모서리 26px | 모서리 22px |
  | 머리띠의 스티커 묶음 | 머리띠 전체에 겹쳐 놓인다(`position: absolute; inset: 0`). 여섯 장 모두 오른쪽 | 머리띠 맨 위의 118px 칸이 된다(`position: relative; height: 118px`). 묶음 전체를 `scale(0.74)`, 기준점 오른쪽 위 |
  | 머리띠 안쪽(제목·탭) | `max-width: 58%`, 여백 `36px 36px 32px` | `max-width: none`, 여백 `0 22px 22px` |
  | 제목 | 30px, 아래 간격 26px | 25px, 아래 간격 16px |
  | 탭 | 내용만큼(`inline-flex`), 버튼 높이 38px | 가로를 다 채움(버튼 `flex: 1`, 가운데 정렬). 높이 같음 |
  | 목록 | 위 간격 14px, 줄 사이 2px | 같음 |
  | 줄 | 썸네일 148px(16:9라 높이 약 83px), 사이 18px, 안쪽 여백 10px, 제목 17px, 빼기 버튼 38×38px·오른쪽 8px | 썸네일 112px(높이 63px), 사이 12px, 안쪽 여백 `8px 4px`, 제목 15.5px, 빼기 버튼 오른쪽 0 |
  | 줄 높이 | 약 103px(썸네일 + 여백. 고정하지 않는다) | 내용만큼(약 80~112px) |

  | 내 정보 | 861px 이상 | 860px 이하 | 520px 이하 |
  |---|---|---|---|
  | 화면 | `max-width: 640px`(좌우 여백 포함. 카드는 600px), 위 48px · 아래 8px | 위 24px · 아래 56px | 같음 |
  | 카드 | 모서리 26px, `overflow: hidden` | 같음 | 같음 |
  | 머리띠 높이 | 150px | 128px | 128px, 스티커 둘째·넷째를 숨긴다 |
  | 본문 여백 | `0 36px 28px` | `0 22px 24px` | 같음 |
  | 프로필 원 | 96px, 머리띠에 48px 걸침, 바깥 테 5px(`--de-bg`) | 같음 | 같음 |
  | 탈퇴 줄 | 문장과 버튼이 한 줄(양끝) | 세로로(왼쪽 정렬, 사이 8px) | 같음 |

  탈퇴 확인 창은 모든 폭에서 같다: `max-width: 400px`, 오버레이 여백 20px(330px 화면에서 창 290px).
- 크기는 px. SCSS 첫 두 줄은 `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`(전체 파일명과 물결표, 변수 먼저). `~styles/_common.scss`는 불러오지 않는다.
- **CSS Module은 `pure` 모드다.** 선택자에 그 파일의 클래스가 하나는 들어 있어야 한다(`svg { … }`, `:global(html…) { … }`만으로 된 규칙은 빌드 오류). 어두운 화면 전용 규칙은 `:global(html[data-theme='dark']) &`를 클래스 안에 넣는다. 다른 모듈의 클래스를 덮을 때는 클래스 둘로 적는다.
- import는 프로젝트 루트 기준 절대 경로. `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다(`Map`·`Set`을 `[...x]`·`for…of`로 돌리지 않는다).
- **데이터는 SWR 훅으로.** 컴포넌트 안에서 `fetch`·`axios.get`을 직접 부르지 않는다. `useMyEvent`는 화면에서 **한 번만**(`SavedEvents`) 부른다.
- `prefers-reduced-motion: reduce`에서는 이 단계의 animation·transition을 끈다(`de-reduced-motion`). 스티커의 움직임은 `Sticker`가 스스로 멈춘다.
- 문구는 이 계획에 적힌 그대로다. 화면 제목·버튼·안내 문장은 목업, 빈 화면 문구·오류 문구·알림(`alert`)·탈퇴 확인 문구는 지금 코드다.
- **토큰을 화면·콘솔·파일에 남기지 않는다.** 새 코드에 `console.log`를 넣지 않는다.
- 파일을 지우지 않는다. 쓰지 않게 된 것은 이 문서 끝의 "9단계에서 지울 것"에 적는다.
- `pnpm lint`는 쓰지 않는다. 작업마다의 확인은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일을 하나씩>`이고 `pnpm build`는 작업 6에서 한 번이다. 새 파일이 포맷 오류를 내면 `npx prettier --write <그 파일>`로 맞춘다(테스트의 단언은 바꾸지 않는다). SCSS는 `tsc`가 보지 않으므로 SCSS를 만들거나 고친 작업은 아래 명령으로 문법을 확인한다(이 문서에서 "SCSS 확인"이라고 부른다. `pure` 모드 위반은 빌드에서만 드러난다).

```bash
node -e "const sass=require('sass');const imp={findFileUrl(u){return u.startsWith('~')?new URL('file://'+process.cwd()+'/'+u.slice(1)):null}};process.argv.slice(1).forEach(f=>{sass.compile(f,{importers:[imp],logger:sass.Logger.silent});console.log('ok',f)})" <scss 파일들>
```

### 지금 동작 — 관심 행사 (그대로 옮긴다. 줄 번호는 2026-11-18 기준)

| 일 | 지금 동작 | 지금 코드 |
|---|---|---|
| 들어올 때 | `getServerSideProps`가 `access_token` 쿠키가 있으면 `{ isLoggedIn: true }`를, 없으면 `/events`로 임시 리디렉트를 돌려준다(값이 유효한지는 보지 않는다). 화면이 뜨면 `useEffect`에서 `authContext.login()` | `pages/myevent.tsx:16-22`, `:38-60` |
| 목록 요청 | `useMyEvent({ filter: '' }, true)` — `AuthContext`와 무관하게 늘 요청한다. 서버에서는 요청하지 않는다(처음 HTML에는 목록이 없다) | `MyEventTabs.tsx:21` 등 세 곳 |
| 탭 | 주소의 `tab`이 정확히 `done`이면 종료, 그 밖에는 진행중. 누르면 ① 이미 그 탭이면 아무것도 하지 않는다 ② `ga.event({ action: 'web_event_진행중인행사탭클릭' 또는 'web_event_종료행사탭클릭', event_category: 'web_myevent', event_label: '내이벤트' })` ③ `router.push('/myevent')` 또는 `router.push('/myevent?tab=done')` (`shallow`를 주지 않는다) | `MyEventTabs.tsx:23`, `:36-55` |
| 탭의 숫자 | 받은 목록을 종료 판정으로 나눈 수. 목록을 받기 전에는 둘 다 0 | `MyEventTabs.tsx:25-34` |
| 순서 | 서버가 준 순서 그대로(화면에서 정렬하지 않는다) | — |
| 빼기 | ① `favorite_id`가 0이거나 목록이 없으면 `alert('이벤트 정보가 없습니다!')` ② 아니면 목록에서 먼저 빼고(`mutate(키, 뺀 목록, false)`) `deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, { favoriteId })` ③ 다시 불러온다(`mutate(키)`) ④ `ga.event({ action: 'web_event_관심행사삭제버튼클릭', event_category: 'web_myevent', event_label: '관심행사' })`. 확인 창 없이 바로 빠진다. ①의 알림 뒤에도 ③④는 지나간다. 요청이 실패하면 ③④에 가지 못한다 | `MyEventScheduledList.tsx:66-89`, `MyEventDoneList.tsx:70-93` |
| 줄을 누르면 | `ga.event({ action: 'web_event_이벤트클릭', event_category: 'web_event', event_label: '이벤트클릭' })` 뒤 `/event/detail/<id>` | `components/common/item/Item.tsx`의 링크 |
| 불러오는 중 | 점 세 개(`ThreeDots`) | `MyEventScheduledList.tsx:94-98` |
| 불러오기 실패 | "내 이벤트 정보를 불러오는데 문제가 발생했습니다!" (탭은 그대로 보이고 숫자는 0) | `:39-45` |
| 빈 화면 | 두 탭 모두 같다: "저장한 행사가 없습니다." / 북마크 그림 / "관심있는 행사를 저장해보세요" / 버튼 "개발자 행사 보러가기"(→ `/events`) | `MyEventEmpty.tsx` |
| 아래쪽 | 소식 받기 + 푸터(`Layout`의 기본값) | `pages/myevent.tsx:62-64` |

### 종료 판정 — 지금 세 곳의 규칙

| `use_start_date_time_yn` | `use_end_date_time_yn` | `MyEventTabs.tsx:12-17` | `MyEventScheduledList.tsx:47-58` | `MyEventDoneList.tsx:24-35` |
|---|---|---|---|---|
| 값 있음(`'Y'`·`'N'`) | 값 있음 | `end_date_time` | `end_date_time` | `end_date_time` |
| 값 있음 | 비어 있음(`null`) | **`start_date_time`** | **`start_date_time`** | **`start_date_time`** |
| 비어 있음 | 값 있음 | `end_date_time` | `end_date_time` | `end_date_time` |
| 비어 있음 | 비어 있음 | `end_date_time` | `end_date_time` | `end_date_time` |

세 곳은 적은 모양만 다르고 **결과는 같다.** 그래서 고를 것이 없고, 이 표를 그대로 한 함수(`savedEndDate`)로 옮긴다. 조심할 것 두 가지:

- 조건은 `'Y'`인지가 아니라 **값이 있는지**다(`'N'`도 참이다). `=== 'Y'`로 "바로잡으면" 판정이 달라진다.
- 고른 날짜를 `DateUtil.isDone`(`lib/utils/dateUtil.tsx:10-18`)에 넣는다. 이 함수는 **날짜만** 견준다: 고른 날이 오늘보다 앞이면 종료, 오늘이거나 뒤면 진행중. 끝나는 시각이 지났어도 그날 자정까지는 진행중이다. 읽을 수 없는 날짜(`null`, 빈 문자열, 형식 오류)는 종료다. 메인 타임라인의 판정(`describeEvent`의 `status === 'ended'`. 끝나는 **시각**이 지나면 종료)과 다르다. 이 화면은 지금 규칙을 따른다.

새 함수가 지금과 다른 점은 하나다: "오늘"을 브라우저의 시간대가 아니라 **한국 시간**으로 본다(`lib/utils/timeline/kst.ts`. 3단계와 같다). 한국 시간대의 브라우저에서는 결과가 같다.

### 지금 동작 — 내 정보 · 회원 탈퇴 (그대로 옮긴다)

| 일 | 지금 동작 | 지금 코드 |
|---|---|---|
| 들어올 때 | 관심 행사와 같다(쿠키가 없으면 `/events`로, 있으면 `authContext.login()`) | `pages/myinfo.tsx:28-34`, `:178-198` |
| 프로필 요청 | `useUser()` (`/front/v1/users/profile`). 서버에서는 요청하지 않는다 | `:36` |
| 보여 주는 것 | 프로필 사진(`profile_image_link`. 없으면 대신 그리는 것), 이름(`username`), 가입일(`register_date`가 있을 때만. `dayjs(…).format('YYYY년 MM월 DD일')`), 가입 계정(메일 아이콘 + `email`), 회원 탈퇴 | `:76-158` |
| 불러오는 중 | 따로 없다. 이름·가입일·이메일이 빈 채로 카드가 그려진다 | — |
| 불러오기 실패 | 화면 전체 대신 "내 정보를 불러오는데 문제가 발생했습니다!" | `:38-44` |
| 탈퇴 버튼 | 창을 열고 `ga.event({ action: 'web_event_탈퇴버튼클릭', event_category: 'web_myinfo', event_label: '탈퇴' })` | `:148-155` |
| 창의 취소(버튼·Esc·바깥 누름 모두) | 창을 닫고 `ga.event({ action: 'web_event_탈퇴취소버튼클릭', event_category: 'web_myinfo', event_label: '탈퇴' })` | `:161-172`, `DeleteAccountModal.tsx:27` |
| 창의 "탈퇴하기" | ① `deleteAccountApi('/front/v1/users/witdraw')` (**주소의 철자 `witdraw`를 고치지 않는다**) ② 응답의 `status_code === 200`이면 `logout()`을 기다리지 않고 부른다: `axios.post('/api/logout')` → `message === 'SUCCESS'`이면 `authContext.logout()` → `router.push('/')` ③ `ga.event({ action: 'web_event_탈퇴진행버튼클릭', event_category: 'web_myinfo', event_label: '탈퇴' })`. 창을 닫지 않는다(화면이 `/`로 넘어간다) | `:46-64` |
| 탈퇴 요청 실패 | 페이지는 아무것도 하지 않는다(창이 열린 채 남는다. ③도 보내지 않는다). 알림·로그아웃은 `lib/api/axiosInstanceWithToken.tsx`의 인터셉터와 `lib/api/error.tsx`가 한다. 새 코드는 예외를 삼키는 `catch`만 둔다(지금은 잡지 않아 처리되지 않은 거부가 남는다. 보이는 것은 같다) | `lib/api/delete.tsx:22-33` |
| 확인 창의 문구 | "정말 탈퇴하시겠습니까?" / "탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다." 줄바꿈 "삭제된 정보는 다시 복구할 수 없습니다." | `DeleteAccountModal.tsx:29-33` |

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **0건 · 1건 · 아주 많을 때** — 0건이면 탭은 "진행중 0 / 종료 0"이고 두 탭 모두 지금의 빈 화면이 나온다. 한 탭만 비어도 그 탭에는 같은 빈 화면이 나온다(지금과 같다). 1건이면 줄 하나 아래가 비어 보여도 최소 높이를 주지 않는다(목업 `mypage.css:13`의 주석). 수백 건이어도 한 번에 모두 그린다(지금도 쪽 나누기가 없다). 그래서 썸네일에 `priority`를 주지 않고(늦게 불러온다), 줄은 `memo`이고, `onRemove`는 매 렌더 새 함수가 되지 않아야 한다. 숫자가 세 자리여도 탭이 줄바꿈되지 않는다. (작업 2, 3, 4)
2. **빼기 실패와 연타** — 누르면 줄이 바로 사라지고 "관심 행사에서 뺐어요"가 뜬다. 요청이 실패하면 **누르기 전의 목록으로 되돌리고** "처리 중 오류가 발생했어요"를 띄운 뒤 다시 불러온다(지금은 빠진 채로 남는다). 같은 줄을 빠르게 두 번 눌러도 요청은 한 번이다(줄이 사라지기 전의 두 번째 누름. 진행 중인 `favorite_id`를 `ref`에 적어 둔다). 서로 다른 줄을 잇달아 빼는 것은 막지 않는다. 그중 앞의 것이 실패해 되돌리면 뒤의 것도 잠깐 다시 보였다가, 다시 불러온 결과로 맞춰진다(`useFavorite`과 같은 한계다). `favorite_id`가 0인 줄(다른 화면에서 막 담아 서버 번호를 아직 못 받은 것)은 지금처럼 알림만 뜬다. (작업 4)
3. **탭의 숫자와 목록이 어긋나는 것** — 지금은 탭과 목록이 저마다 판정 함수를 갖고 따로 센다(목록은 `useEffect`로 한 박자 늦게 걸러진다). 새 코드는 `useMyEvent`를 한 번만 부르고, 한 번 나눈 결과(`SavedView`)의 길이를 탭이, 배열을 목록이 쓴다. 주소의 `tab`이 `done`이 아닌 값(`?tab=foo`, 같은 이름이 두 번)이면 탭도 목록도 진행중이다(지금은 탭만 진행중이고 목록이 비어 보인다). 화면을 켜 둔 채 자정이 지나면 `useNow`가 "오늘"을 바꿔 줄이 종료 탭으로 옮겨진다. (작업 1, 4)
4. **날짜를 읽을 수 없는 행사 · 끝난 시각이 지난 오늘 행사** — 날짜를 읽을 수 없으면 종료 탭에 "종료" 배지로 놓이고 기간 글자는 비운다(주최만 적는다. 주최도 비면 그 줄을 그리지 않는다). 오늘 끝난 행사는 자정까지 진행중 탭에 남는다(지금 규칙). 이때 배지에 "종료"를 적으면 진행중 탭 안에 종료 배지가 보이므로 "오늘"(접수형은 "오늘 마감")로 적고 줄을 흐리게 하지 않는다. `use_end_date_time_yn`이 비어 있는 옛 자료는 시작일로 판정한다(위 표). (작업 1, 3)
5. **썸네일이 없거나 깨진 행사, 아주 긴 제목·주최** — `EventThumb`가 자동 표지로 바꿔 그린다(148px·112px 폭에서도 글자가 최소 9~11px로 그려진다. 그대로 쓴다). 제목은 두 줄, 주최·기간은 한 줄에서 말줄임이고 줄의 글자 칸에 `min-width: 0`이 있어야 빼기 버튼이 밀려나지 않는다. 330px에서 글자 칸은 약 128px이다. 배지("마감 D-12")는 줄바꿈되지 않는다. (작업 3)
6. **내 정보: 긴 이름·이메일, 사진이 없거나 깨졌을 때, 불러오는 동안** — 이름과 이메일은 `overflow-wrap: anywhere`로 카드 안에서 줄바꿈된다(이메일 줄은 라벨이 줄어들지 않는다). 사진이 없으면 이름 첫 글자를 넣은 파란 원, 사진을 불러오지 못하면(`onError`) 같은 원으로 바뀐다. 사진은 `next/image`에 **`unoptimized`**를 준다: 지금은 주지 않아 `next.config.js`의 허용 목록(호스트 다섯 개)에 없는 주소의 사진이면 프로덕션에서는 최적화 요청이 거절되어 깨진 그림이 보이고, 개발 모드에서는 렌더가 예외를 낸다(`node_modules/next/dist/client/image.js`의 `defaultLoader`). `unoptimized`면 주소를 그대로 쓰므로 둘 다 일어나지 않는다. 불러오는 동안에는 글자 없는 파란 원과 빈 이름 칸이 그려지고, 이름이 들어와도 카드 높이가 바뀌지 않는다(이름 칸에 최소 높이). (작업 5)
7. **탈퇴 요청 실패 · 연타 · 닫기** — 실패하면 창은 열린 채 그대로다(지금과 같다. 알림은 `lib/api/error.tsx`가 띄울 때만 뜬다). "탈퇴하기"를 빠르게 두 번 눌러도 요청은 한 번이다(`ref`로 막고 `finally`에서 푼다. 버튼을 `disabled`로 바꾸지 않는다). Esc·바깥 누름·"취소" 모두 취소 GA를 보내고 닫는다. 열리면 포커스는 창 자체(빨간 버튼에 두지 않는다. 목업 `app.js:438`), Tab은 "취소" → "탈퇴하기" 안에서만 돌고, 닫히면 "회원 탈퇴" 버튼으로 포커스가 돌아온다. 창이 열린 동안 뒤 화면이 스크롤되지 않고, 창을 연 채 다른 화면으로 넘어가도(탈퇴 성공 → `/`) 스크롤 잠금이 풀린다. (작업 5)
8. **토큰이 만료·거부된 채 들어왔을 때** — 서버는 쿠키가 있는지만 보므로 화면은 뜬다. 첫 요청이 `TOKEN_400_02`(만료)면 인터셉터가 토큰을 다시 받아 같은 요청을 한 번 더 보낸다. 다시 받지 못하거나 다른 토큰 오류면 `lib/api/error.tsx`가 알림을 띄우고 로그아웃한 뒤 `/`로 보낸다. 그 사이 화면에는 불러오기 실패 문구가 보인다(지금과 같다). 새 코드가 지켜야 할 것: 요청을 **한 번만** 보낸다(`useMyEvent` 한 번, `useUser` 한 번. 인터셉터는 페이지에서 첫 번째 실패만 처리한다), 실패했을 때 스스로 다시 요청하거나 알림을 더 띄우지 않는다, 실패 문구가 보이는 동안 빈 화면("저장한 행사가 없습니다.")을 함께 그리지 않는다. (작업 4, 5)
9. **좁은 화면** — 330·540·660px에서 머리띠의 탭이 가로를 채우고, 줄의 썸네일(112px)과 글자·버튼이 겹치지 않고, 내 정보 카드의 탈퇴 줄이 세로로 놓인다. 330px에서 관심 행사 머리띠는 298px이라 맨 왼쪽 스티커(`holo:logo`)의 왼쪽 끝이 머리띠 밖으로 조금 잘린다(목업도 같다. "확인이 필요한 것" 8). 가로 스크롤이 생기지 않는다(머리띠는 `overflow: hidden`). (작업 2, 3, 5)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 옵션은 `mypage.js:5`의 주석이 기준입니다.

| 목업 | 주소 | 실제 화면 |
|---|---|---|
| 관심 행사 · 진행중 | `app.html#saved` | `/myevent` |
| 관심 행사 · 종료 | `app.html?tab=done#saved` | `/myevent?tab=done` |
| 관심 행사 · 비었을 때 | `app.html?empty=1#saved` | 담은 행사가 없을 때 (문구는 지금 코드) |
| 내 정보 | `app.html#me` | `/myinfo` |
| 탈퇴 확인 창 | `app.html?open=withdraw#me` | "회원 탈퇴" 누름 |
| 어두운 화면 | 위 주소에 `theme=dark`를 더한다 | 헤더의 테마 버튼 |

## 목업과 지금 코드가 다른 점

**관심 행사**

| 항목 | 지금 코드 | 목업 (`sv6`) | 따른 쪽 |
|---|---|---|---|
| 화면 제목 | "북마크" | "관심 행사" | 목업 (받은 결정) |
| `<title>` | 두 페이지 모두 `<Head>`가 없어 `_app.tsx`의 기본 제목 | — | 지금 코드. `<Head>`를 더하지 않는다 ("이 계획이 정한 것" 1) |
| 탭의 이름표 | `aria-label="북마크 행사 상태"` | `aria-label="관심 행사 상태"` | 목업 (화면 이름 통일) |
| 탭의 뜻(종료 판정) | 날짜만 견준다(위 표) | 끝나는 시각이 지나면 종료 | 지금 코드 |
| 순서 | 서버가 준 순서 | 진행중은 마감·시작이 빠른 순, 종료는 최근에 끝난 순 | 지금 코드 ("확인이 필요한 것" 1) |
| 한 줄에 보이는 것 | 썸네일, D-day 딱지, 주최, 제목, "일시/접수" + 기간(연도 포함), 태그, 공유 버튼, 북마크 버튼 | 썸네일, 배지(D-day·종료), 제목, "주최 · 기간", 빼기 버튼 | 목업의 줄 모양 (받은 결정). **태그와 공유 버튼이 이 화면에서 빠진다** ("확인이 필요한 것" 2) |
| 배지의 글자 | "D-3", "Today" | "D-3", "오늘", "진행 중", "마감 D-6", "오늘 마감", "종료" | 목업 (6단계 `ddayLabel`과 같은 말) |
| 기간의 글자 | "일시 26.11.20 10:00 ~ 18:00" 꼴 | "11.20(금) 10:00 ~ 18:00", 접수형은 "11.19(목) 18:00 접수 마감" | 목업 (3·6단계와 같은 꼴. 연도가 없다. "확인이 필요한 것" 4) |
| 종료 탭의 줄 | 흐리게 하지 않는다(`isEventDone`에 늘 `false`를 넘긴다) | 썸네일을 흐리게, 제목을 옅게 | 목업 |
| 빼기 | 확인 없이 바로. 안내 없음 | 확인 없이 바로. "관심 행사에서 뺐어요" 안내 | 요청·GA는 지금 코드, 안내는 목업 (`app.js:520`. 메인의 관심 버튼과 같은 안내) |
| 빼기 실패 | 빠진 채로 남는다 | — | 되돌리고 "처리 중 오류가 발생했어요" (`useFavorite`과 같게. Review Focus 2) |
| 빼기 버튼의 이름 | 없음(아이콘만) | `aria-label="관심 행사에서 빼기"` | 목업 |
| 빈 화면의 문구 | "저장한 행사가 없습니다." / "관심있는 행사를 저장해보세요" / "개발자 행사 보러가기" | "담아 둔 행사가 없어요" / "관심 있는 행사를 담아 보세요." / "개발자 행사 보러 가기" | 지금 코드 (받은 결정) |
| 종료 탭이 비었을 때 | 진행중 탭과 같은 빈 화면(버튼 포함) | "종료된 행사가 없어요" / "담아 둔 행사가 끝나면 여기로 옮겨져요." (버튼 없음) | 지금 코드 ("확인이 필요한 것" 3) |
| 빈 화면의 그림 | `bookmark_icon.png` 88px. 순서는 제목 → 그림 → 안내 → 버튼 | 76px 둥근 네모 안의 북마크 선 그림. 순서는 그림 → 제목 → 안내 → 버튼 | 목업 (모양과 순서만) |
| 빈 화면의 버튼 | `<button>` + `router.push('/events')` | 링크 | 링크(`next/link`). 가는 곳은 같다 |
| 불러오는 중 | 점 세 개 | 그리지 않음 | 줄 모양의 빈 칸 세 줄 ("이 계획이 정한 것" 6) |
| 불러오기 실패 | "관심 행사 정보를 불러오는데 문제가 발생했습니다!" | 그리지 않음 | 지금 코드의 문구 ("확인이 필요한 것" 5) |
| `tab`이 `done`도 `ongoing`도 아닐 때 | 탭은 진행중, 목록은 아무것도 그리지 않는다 | — | 탭도 목록도 진행중 (Review Focus 3) |
| "오늘"의 시간대 | 브라우저의 시간대 | — | 한국 시간 (3단계와 같게) |
| GA 이벤트 네 가지 | 있음 | 없음 | 지금 코드 |

**내 정보 · 탈퇴 확인 창**

| 항목 | 지금 코드 | 목업 (`me2`) | 따른 쪽 |
|---|---|---|---|
| 화면 제목 | `<h1>내 정보</h1>` + 카드 세 장 | 제목 줄 없음. 카드 한 장이고 `<h1>`은 이름 | 목업 |
| 항목 | 프로필 사진, 이름, 가입일, 가입 계정, 회원 탈퇴 | 같음 | 같음 |
| 사진이 없을 때 | 회색 사람 그림 | 이름 첫 글자를 넣은 파란 원 | 목업 (설명 페이지 `index.html:467`) |
| 사진을 불러오지 못할 때 | 깨진 그림(허용 목록에 없는 호스트의 사진도 그렇다. 개발 모드에서는 예외) | — | 파란 원으로 바꾼다 (Review Focus 6) |
| 가입일 | "2025년 03월 14일" + 딱지 "가입일 🎉" | "2025년 03월 14일 가입" | 목업. 날짜 형식은 같다 |
| 가입 계정 | 소제목 "계정 정보" + 라벨 "가입계정" + `email.svg` | 소제목 없음, 라벨 "가입 계정", 선으로 그린 봉투 | 목업. 아이콘은 `TimelineIcon`의 `mail`(`email.svg`는 `#D8D8D8`이라 흰 카드에서 거의 보이지 않는다) |
| 탈퇴 영역 | 소제목 "회원 탈퇴" + "탈퇴 시 내 정보와 북마크가 모두 삭제되며 복구할 수 없어요." + 빨간 버튼 "탈퇴하기" | "탈퇴하면 내 정보와 담아 둔 행사가 모두 삭제되고 복구할 수 없어요." + 밑줄 글자 버튼 "회원 탈퇴" | 목업 (지금 문장의 "북마크"는 없어지는 화면 이름이다. "확인이 필요한 것" 6) |
| 확인 창의 제목·본문 | 위 "지금 동작" 표 | 같음 | 같음 |
| 확인 창의 버튼 | 왼쪽 "탈퇴하기"(빨강), 오른쪽 "취소하기" | 왼쪽 "취소", 오른쪽 "탈퇴하기"(빨강) | 목업 (순서와 "취소"). 누른 뒤의 동작은 지금 코드 |
| 확인 창의 역할 | 기본값(`dialog`), 이름 없음 | `role="alertdialog"`, `aria-label="회원 탈퇴 확인"` | 목업 |
| 탈퇴 요청·성공/실패 뒤 | 위 "지금 동작" 표 | 없음 | 지금 코드 |
| 로그아웃 | 헤더의 프로필 메뉴 | 같음 | 화면 안에 넣지 않는다 |
| GA 이벤트 세 가지 | 있음 | 없음 | 지금 코드 |

---

## File Structure

**새로 만드는 파일**

- `lib/utils/mypage/savedEvents.ts`, `lib/utils/mypage/__tests__/savedEvents.test.ts` — 종료 판정, 탭 나누기, 줄의 배지·기간 글자, 주소의 탭 읽기
- `lib/utils/mypage/profile.ts`, `lib/utils/mypage/__tests__/profile.test.ts` — 프로필 원의 첫 글자, 가입일 글자
- `components/myEvent/SavedBand.tsx`, `SavedBand.module.scss` — 관심 행사의 홀로그램 머리띠
- `components/myEvent/SavedTabs.tsx`, `SavedTabs.module.scss` — 머리띠 안의 탭
- `components/myEvent/SavedRow.tsx`, `SavedRow.module.scss` — 한 줄
- `components/myEvent/SavedList.tsx`, `SavedList.module.scss` — 목록, 불러오는 중, 실패, 빈 화면
- `components/myEvent/SavedEvents.tsx`, `SavedEvents.module.scss` — 조립. 목록 요청, 빼기, GA, 탭 이동
- `components/myInfo/ProfileCard.tsx`, `ProfileCard.module.scss` — 내 정보 카드

**고치는 파일**

- `pages/myevent.tsx` — 그리는 것을 `SavedEvents`로 바꾸고 `now`를 내려 준다 (작업 4)
- `pages/myinfo.tsx` — 그리는 것을 `ProfileCard`로 바꾼다. 요청·GA는 그대로 (작업 5)
- `styles/Myinfo.module.scss` — 내용을 통째로 바꾼다(클래스 둘) (작업 5)
- `components/common/modal/DeleteAccountModal.tsx`, `DeleteAccountModal.module.scss` — 내용을 통째로 바꾼다. 경로·props는 그대로 (작업 5)
- `components/events/timeline/TimelineIcon.tsx` — `mail`이 없을 때만 더한다 (작업 5)

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 종료 판정·탭 나누기·줄의 글자, 프로필 글자 (순수 함수) | — |
| 2 | 관심 행사 머리띠 · 탭 | — |
| 3 | 줄 · 목록(불러오는 중 / 실패 / 빈 화면) | — |
| 4 | 관심 행사 조립 · 페이지 바꾸기 | `pages/myevent.tsx` |
| 5 | 내 정보 카드 · 탈퇴 확인 창 · 페이지 바꾸기 | `pages/myinfo.tsx`, `styles/Myinfo.module.scss`, `DeleteAccountModal.*`, `TimelineIcon.tsx` |
| 6 | 전체 확인 (`pnpm build` 한 번) | — |

작업 1~3이 끝난 상태에서는 두 화면이 예전 그대로입니다(새 부품은 아직 걸리지 않습니다). 작업 4 뒤에 관심 행사가, 작업 5 뒤에 내 정보가 새 모양입니다. 작업 5는 작업 1만 끝나 있으면 시작할 수 있습니다. **작업 2와 5는 2단계(스티커)가 끝나 있어야 합니다.** 7단계와는 순서가 무관합니다.

---

### Task 1: 종료 판정 · 탭 나누기 · 줄의 글자 · 프로필 글자 (순수 함수)

기준: 종료 판정은 위 "종료 판정" 표와 `lib/utils/dateUtil.tsx:10-18`. 배지는 목업 `app.js:53-57`(= 6단계 `ddayLabel`), 기간은 `mypage.js:25`와 `app.js:62`(= 6단계 `describeWhen`의 `range`). 가입일은 `pages/myinfo.tsx:108-113`.

**Files:**
- Create: `lib/utils/mypage/savedEvents.ts`, `lib/utils/mypage/__tests__/savedEvents.test.ts`
- Create: `lib/utils/mypage/profile.ts`, `lib/utils/mypage/__tests__/profile.test.ts`

**Interfaces:**
- Consumes (고치지 않는다): `Event`·`EventDate`·`MyEvent`(`model/event.ts`), `parseNaive`·`dayKey`·`formatMdw`·`formatHm`(`lib/utils/timeline/kst.ts`), `readEventPeriod`(`lib/utils/timeline/period.ts`), `ddayLabel`(`lib/utils/detail/applyCard.ts`), `describeWhen`(`lib/utils/detail/summary.ts`), `dayjs`
- Produces:

```ts
// lib/utils/mypage/savedEvents.ts
export type SavedTab = 'ongoing' | 'done';
export type SavedTone = 'done' | 'dead' | 'open';

export interface SavedItem {
  favoriteId: number;
  event: Event;             // 받은 객체 그대로
  done: boolean;            // 탭을 가르는 값. 줄을 흐리게 하는 것도 이 값이다
  tone: SavedTone;          // 배지의 색
  label: string;            // 배지의 글자
  when: string;             // 기간 글자. 읽을 수 없으면 ''
}
export interface SavedView {
  ongoing: SavedItem[];
  done: SavedItem[];
}

export const savedEndDate: (event: EventDate) => string;                 // 판정에 쓸 날짜(지금 세 곳의 규칙)
export const isSavedDone: (event: EventDate, now: string) => boolean;
export const describeSaved: (item: MyEvent, now: string) => SavedItem;
export const splitSaved: (list: MyEvent[] | null | undefined, now: string) => SavedView;
export const savedTabOf: (query: string | string[] | undefined) => SavedTab;

// lib/utils/mypage/profile.ts
export const avatarInitial: (username: string | null | undefined) => string;   // 없으면 ''
export const joinedText: (registerDate: string | null | undefined) => string;  // '2025년 03월 14일 가입'. 없거나 읽을 수 없으면 ''
```

`now`는 3단계와 같은 한국 시간 문자열이다(`'2026-11-18T15:00'`. `toKstNaive`가 만든다).

**규칙**

- `savedEndDate` — `use_start_date_time_yn`에 값이 있고 `use_end_date_time_yn`이 비어 있으면 `start_date_time`, 그 밖에는 `end_date_time`. `'Y'`인지 견주지 않는다.
- `isSavedDone` — `savedEndDate`가 준 날짜를 `parseNaive`로 읽어, 읽을 수 없으면 `true`. 읽히면 그 **날**(`dayKey`)이 `now`의 날보다 앞일 때만 `true`. 시각은 보지 않는다.
- `describeSaved`
  - `done`은 `isSavedDone`.
  - `done`이면 `tone: 'done'`, `label: '종료'`.
  - 아니면 `label`은 `ddayLabel(event, now)`. 그것이 `'종료'`나 `''`를 주면(끝나는 시각은 지났지만 아직 그날인 경우) 접수형(`event_time_type === 'RECRUIT'`)은 `'오늘 마감'`, 그 밖에는 `'오늘'`. `tone`은 접수형이면 `'dead'`, 아니면 `'open'`.
  - `when`: `readEventPeriod`가 `null`이면 `''`. 접수형이면 `"<끝 날> <끝 시각> 접수 마감"`인데 끝 시각은 `readEventPeriod`의 `endHasTime`이 참이고 `done`이 아닐 때만 적는다(목업은 끝난 접수형에 시각을 적지 않는다). 그 밖에는 `describeWhen(event, now)`의 `range`와 같은 글자다.
- `splitSaved` — 받은 순서를 지킨다(정렬하지 않는다). 받은 배열과 그 안의 객체를 고치지 않는다. 모든 항목이 둘 중 정확히 한쪽에 들어간다.
- `savedTabOf` — 정확히 문자열 `'done'`일 때만 `'done'`.
- `avatarInitial` — 앞의 공백을 건너뛴 첫 글자(`Array.from`으로 세어 이모지가 반으로 잘리지 않게. `lib/utils/detail/summary.ts`의 `organizerInitial`과 같은 방식). 대문자로 바꾸지 않는다.
- `joinedText` — 지금 코드와 같은 `dayjs(값).format('YYYY년 MM월 DD일')` 뒤에 `' 가입'`. 값이 없거나 `dayjs(값).isValid()`가 거짓이면 `''`(지금은 "Invalid Date"가 그대로 보인다).
- 두 파일 모두 React·`next/router`·`window`·`Date.now()`를 쓰지 않는다.

- [ ] **Step 1: 실패하는 테스트를 쓴다.** 행사를 만드는 도우미 하나(`ev({ … })`. 기본값은 `event_time_type: 'DATE'`, 두 `…_yn` 모두 `'Y'`, `tags: []`)와 `const NOW = '2026-11-18T15:00'`(수요일)을 두고 아래를 단언한다.

`savedEndDate` — 시작 `2026-11-10T10:00:00`, 끝 `2026-11-25T18:00:00`

| `use_start…` | `use_end…` | 기대 |
|---|---|---|
| `'Y'` | `'Y'` | 끝 |
| `'Y'` | `'N'` | 끝 |
| `'Y'` | `null` | **시작** |
| `'N'` | `null` | **시작** (`'N'`도 값이 있는 것이다) |
| `null` | `'Y'` | 끝 |
| `null` | `null` | 끝 |

`isSavedDone` (`NOW` 기준)

| 판정에 쓰이는 날짜 | 기대 |
|---|---|
| `2026-11-17T23:59:00` | `true` |
| `2026-11-18T09:00:00` (오늘, 시각은 이미 지남) | `false` |
| `2026-11-18T23:00:00`, `2026-11-19T00:00:00` | `false` |
| `2025-12-31T10:00:00` (해가 다름) | `true` |
| `2026-11-18T23:00:00`인데 `now`가 `'2026-11-19T00:00'` | `true` |
| 시작 `11-10`, 끝 `11-25`, `use_end…`가 `null` (`use_start…`는 `'Y'`, `'N'` 각각) | `true` (시작일로 판정) |
| 시작 `11-10`, 끝 `11-25`, 둘 다 `null` | `false` |
| `''`, `'abc'`, `null`(타입을 속여 넣는다) | `true` |

`describeSaved` (`NOW` 기준. `favoriteId`와 `event`가 받은 것 그대로인지도 한 번 본다)

| 행사 | `done` | `tone` | `label` | `when` |
|---|---|---|---|---|
| 접수형, 끝 `2026-11-24T18:00:00` | `false` | `'dead'` | `'마감 D-6'` | `'11.24(화) 18:00 접수 마감'` |
| 접수형, 끝 `2026-11-18T23:59:00` | `false` | `'dead'` | `'오늘 마감'` | `'11.18(수) 23:59 접수 마감'` |
| 접수형, 끝 `2026-11-18T09:00:00` (시각 지남) | `false` | `'dead'` | `'오늘 마감'` | `'11.18(수) 09:00 접수 마감'` |
| 접수형, 끝 `2026-11-10T18:00:00` | `true` | `'done'` | `'종료'` | `'11.10(화) 접수 마감'` (시각 없음) |
| 일시형, `2026-11-21T10:00:00` ~ `2026-11-21T18:00:00` | `false` | `'open'` | `'D-3'` | `'11.21(토) 10:00 ~ 18:00'` |
| 일시형, `2026-11-18T19:00:00` ~ `2026-11-18T21:00:00` | `false` | `'open'` | `'오늘'` | `'11.18(수) 19:00 ~ 21:00'` |
| 일시형, `2026-11-16T09:00:00` ~ `2026-11-20T18:00:00` | `false` | `'open'` | `'진행 중'` | `'11.16(월) 09:00 ~ 11.20(금) 18:00'` |
| 일시형, `2026-11-18T10:00:00` ~ `2026-11-18T12:00:00` (시각 지남) | `false` | `'open'` | `'오늘'` | `'11.18(수) 10:00 ~ 12:00'` |
| 일시형, `2026-11-21` ~ `2026-11-22`, 두 `…_yn` 모두 `'N'` | `false` | `'open'` | `'D-3'` | `'11.21(토) ~ 11.22(일)'` |
| 일시형, `2026-11-10T10:00:00` ~ `2026-11-10T18:00:00` | `true` | `'done'` | `'종료'` | `'11.10(화) 10:00 ~ 18:00'` |
| 시작·끝 모두 `''` | `true` | `'done'` | `'종료'` | `''` |

`splitSaved`
- `undefined`, `null`, `[]` → `{ ongoing: [], done: [] }`
- 진행중·종료가 섞인 다섯 건 → 각 배열의 `favoriteId` 순서가 받은 순서와 같고, 두 배열 길이의 합이 5
- 부른 뒤 받은 배열이 그대로다(길이와 첫 항목이 같은 객체)

`savedTabOf`
- `'done'` → `'done'`
- `undefined`, `'ongoing'`, `'foo'`, `''`, `['done']`, `['done', 'x']` → `'ongoing'`

`avatarInitial`
- `'김데브'` → `'김'`, `'  dev'` → `'d'`, `'😀abc'` → `'😀'`, `''`·`'   '`·`null`·`undefined` → `''`

`joinedText`
- `'2025-03-14T10:20:30'`, `'2025-03-14'` → `'2025년 03월 14일 가입'`
- `''`, `null`, `undefined`, `'abc'` → `''`

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- lib/utils/mypage`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `savedEvents.ts`와 `profile.ts`를 구현한다.**

- [ ] **Step 4: 확인**

Run: `pnpm test -- lib/utils/mypage && npx tsc --noEmit && npx eslint lib/utils/mypage/savedEvents.ts && npx eslint lib/utils/mypage/profile.ts && npx eslint lib/utils/mypage/__tests__/savedEvents.test.ts && npx eslint lib/utils/mypage/__tests__/profile.test.ts`
Expected: PASS, 타입·린트 오류 없음

Run: `grep -n "=== 'Y'\|=== 'N'" lib/utils/mypage/savedEvents.ts`
Expected: 결과 없음 (`savedEndDate`는 값이 있는지만 본다. 시각이 있는지는 `readEventPeriod`가 알려 준다)

Run: `grep -n "Date.now\|new Date()\|window\|from 'react'\|next/router" lib/utils/mypage/savedEvents.ts lib/utils/mypage/profile.ts`
Expected: 결과 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 2: 관심 행사 머리띠 · 탭

목업 기준: 머리띠 `mypage.css:107-112`, `:323-325`, `mypage.js:67-68`. 탭 `mypage.css:18-23`, `:113-115`, `:326`, `mypage.js:22`.

**Files:**
- Create: `components/myEvent/SavedBand.tsx`, `SavedBand.module.scss`
- Create: `components/myEvent/SavedTabs.tsx`, `SavedTabs.module.scss`

**Interfaces:**
- Consumes (2단계. 이 모양이 확정이다): `components/common/sticker/Sticker.tsx`의 `export default function Sticker(props: StickerPlacement & { className?: string })`, `components/common/sticker/stickerSets.ts`의 `SAVED_BAND`(여섯 장, 모두 `side: 'right'`). 스티커는 절대 위치로 놓이고 `aria-hidden`은 감싸는 쪽이 붙인다.
- Consumes: `SavedTab`(Task 1), 믹스인 `de-mobile`·`de-button-reset`
- Produces:

```ts
// SavedBand.tsx
function SavedBand(props: { children: React.ReactNode }): JSX.Element;

// SavedTabs.tsx
interface SavedTabsProps {
  active: SavedTab;
  ongoingCount: number;
  doneCount: number;
  onSelect: (tab: SavedTab) => void;   // 이미 고른 탭을 눌러도 부른다. 걸러내는 것은 부르는 쪽이다
}
function SavedTabs(props: SavedTabsProps): JSX.Element;
```

**마크업**

```
<div class="band">
  <div class="stickers" aria-hidden="true">{SAVED_BAND를 순서대로 <Sticker key={name} … />}</div>
  <div class="inner">{children}</div>
</div>

<div class="tabs" role="tablist" aria-label="관심 행사 상태">
  <button type="button" role="tab" aria-selected class="tab [on]">진행중<i class="count">{ongoingCount}</i></button>
  <button type="button" role="tab" aria-selected class="tab [on]">종료<i class="count">{doneCount}</i></button>
</div>
```

**값** (색은 Global Constraints의 표)

| 부분 | 값 | 860px 이하 |
|---|---|---|
| `.band` | `position: relative; overflow: hidden; min-height: 176px; border-radius: 26px; color: #fff;` + 바탕 | `border-radius: 22px` |
| `.stickers` | `position: absolute; inset: 0;` | `position: relative; inset: auto; height: 118px; transform: scale(0.74); transform-origin: 100% 0;` |
| `.inner` | `position: relative; max-width: 58%; padding: 36px 36px 32px;` | `max-width: none; padding: 0 22px 22px;` |
| `.tabs` | `display: inline-flex; flex: none; padding: 4px; border-radius: 14px;` | `display: flex` |
| `.tab` | `de-button-reset`, `height: 38px; padding: 0 15px; border-radius: 10px; display: flex; align-items: center; gap: 7px; font-size: 14.5px; font-weight: 700; white-space: nowrap;` `&:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }` | `flex: 1; justify-content: center;` |
| `.count` | `font-style: normal; padding: 1px 7px; border-radius: 999px; font-size: 12.5px; font-weight: 700;` | 같음 |

- 제목(`<h1>`)은 `SavedBand`가 그리지 않는다. `SavedEvents`가 `children`으로 넣는다(작업 4).
- `.stickers`는 `.inner`보다 **앞에** 둔다(860px 이하에서 위 칸이 된다). 스티커의 위치·회전·크기는 `Sticker`가 한다. `StickerDefs`를 넣지 않는다.
- 탭에는 움직임(transition)을 넣지 않는다.
- 2단계가 끝나지 않아 `Sticker.tsx`나 `SAVED_BAND`가 없으면 **이 작업을 멈추고 관리자에게 알린다.** 스티커 없는 머리띠를 임시로 만들지 않는다.

- [ ] **Step 1: 2단계의 결과가 있는지 본다**

Run: `ls components/common/sticker/Sticker.tsx components/common/sticker/stickerSets.ts && grep -n "SAVED_BAND\|ME_BAND" components/common/sticker/stickerSets.ts && grep -n "StickerDefs" components/layout/index.tsx`
Expected: 두 파일이 있고 `SAVED_BAND`, `ME_BAND`, `StickerDefs`가 나온다. 없으면 멈춘다.

- [ ] **Step 2: `SavedBand`를 만든다.**
- [ ] **Step 3: `SavedTabs`를 만든다.**
- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/myEvent/SavedBand.tsx && npx eslint components/myEvent/SavedTabs.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/myEvent/SavedBand.module.scss components/myEvent/SavedTabs.module.scss`
Expected: 모두 `ok`

관리자가 화면에서 볼 것: 작업 4 뒤에 함께.

---

### Task 3: 줄 · 목록 (불러오는 중 / 실패 / 빈 화면)

목업 기준: 줄 `mypage.css:24-27`, `:34-42`, `:317`, `mypage.js:23-24`, `:32`. 목록 `:116`. 빈 화면 `:28-32`(모양만. 문구는 지금 코드 `MyEventEmpty.tsx`).

**Files:**
- Create: `components/myEvent/SavedRow.tsx`, `SavedRow.module.scss`
- Create: `components/myEvent/SavedList.tsx`, `SavedList.module.scss`

**Interfaces:**
- Consumes: `SavedItem`(Task 1), `EventThumb`·`TimelineIcon`(3단계. 고치지 않는다), `lib/utils/gTag`, `next/link`, 믹스인 `de-mobile`·`de-button-reset`·`de-focus-ring`·`de-press`·`de-reduced-motion`·`text-ellipsis`·`text-multiline-ellipsis`
- Produces:

```ts
// SavedRow.tsx
interface SavedRowProps {
  item: SavedItem;
  onRemove: (item: SavedItem) => void;
}
export default memo(SavedRow);

// SavedList.tsx
interface SavedListProps {
  items: SavedItem[] | null;   // null이면 불러오는 중
  isError: boolean;
  onRemove: (item: SavedItem) => void;
}
function SavedList(props: SavedListProps): JSX.Element;
```

**`SavedList`가 그리는 것 — 위에서부터 먼저 맞는 것 하나**

| 조건 | 그리는 것 |
|---|---|
| `isError` | `<p class="message">관심 행사 정보를 불러오는데 문제가 발생했습니다!</p>` |
| `items === null` | 줄 모양의 빈 칸 세 줄. `role="status" aria-busy="true"`이고 화면에 보이지 않는 글자 "행사를 불러오는 중이에요"(3단계 `TimelineSkeleton`과 같은 문구) |
| `items.length === 0` | 빈 화면: 북마크 그림(`TimelineIcon` `bookmark` 34px, 76px 칸 안. `aria-hidden`) → "저장한 행사가 없습니다." → "관심있는 행사를 저장해보세요" → 링크 "개발자 행사 보러가기"(`next/link`, `/events`). 어느 탭이든 같다 |
| 그 밖 | `<div class="list">` 안에 `SavedRow`. `key`는 `` `${favoriteId}-${event.id}` `` |

**`SavedRow`의 마크업**

```
<article class="row [done]">
  <Link href={`/event/detail/${String(event.id)}`}>
    <a class="link" onClick={GA web_event_이벤트클릭}>
      <span class="thumb" aria-hidden="true"><EventThumb event={event} /></span>
      <span class="body">
        <i class="badge <tone>">{label}</i>
        <strong class="title">{event.title}</strong>
        <span class="meta">{주최와 when 가운데 있는 것을 ' · '로 이은 글자. 둘 다 없으면 이 줄을 그리지 않는다}</span>
      </span>
    </a>
  </Link>
  <button type="button" class="remove" aria-label="관심 행사에서 빼기" title="관심 행사에서 빼기"
          onClick={() => onRemove(item)}><TimelineIcon name="bookmark" size={20} /></button>
</article>
```

**값**

| 부분 | 값 | 860px 이하 |
|---|---|---|
| `.list` | `display: grid; gap: 2px; padding-top: 14px;` | 같음 |
| `.row` | `position: relative; display: flex; align-items: center; border-radius: 18px; transition: background 0.15s;` 올리면 `background: var(--de-hover)` | 같음 |
| `.link` | `flex: 1; min-width: 0; display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 18px; align-items: center; padding: 10px; color: inherit; text-decoration: none; border-radius: 18px;` + `de-focus-ring` | `grid-template-columns: 112px minmax(0, 1fr); gap: 12px; padding: 8px 4px;` |
| `.thumb` | `display: block; --de-thumb-radius: 12px;` | 같음 |
| `.body` | `display: block; min-width: 0;` | 같음 |
| `.badge` | `display: inline-block; font-style: normal; padding: 3px 8px; border-radius: 7px; font-size: 12px; font-weight: 700; white-space: nowrap;` `dead`는 `--de-orange-soft`·`--de-orange`, `open`은 `--de-blue-soft`·`--de-blue`, `done`은 `--de-surface`·`--de-hint` | 같음 |
| `.title` | `text-multiline-ellipsis(2)`, `margin-top: 7px; font-size: 17px; line-height: 1.4; font-weight: 700; letter-spacing: -0.01em; overflow-wrap: anywhere;` | `font-size: 15.5px` |
| `.meta` | `text-ellipsis`, `display: block; margin-top: 4px; font-size: 13.5px; color: var(--de-hint);` | 같음 |
| `.remove` | `de-button-reset`, `de-focus-ring`, `flex: none; width: 38px; height: 38px; margin-right: 8px; border-radius: 12px; display: grid; place-items: center; color: var(--de-blue);` 안의 `svg`는 `fill: currentColor`. 올리면 `background: var(--de-line)` | `margin-right: 0` |
| `.done` | `.thumb`에 `opacity: 0.45; filter: grayscale(0.6);`, `.title`에 `color: var(--de-hint)` | 같음 |
| 빈 화면(`.empty`) | `padding: 84px 0 72px; text-align: center;` 그림 칸 `76×76px`, `margin: 0 auto 18px`, `border-radius: 24px`, `--de-surface`·`--de-faint`. 제목 19px·800. 안내 `margin: 8px 0 22px`, 14.5px, `--de-hint`. 링크 `display: inline-flex; align-items: center; height: 44px; padding: 0 18px; border-radius: 12px; background: var(--de-surface); font-size: 14.5px; font-weight: 700; color: var(--de-ink); text-decoration: none;` 올리면 `--de-line`. `de-press`·`de-focus-ring` | 같음 |
| `.message` | `margin: 0; padding: 84px 0 72px; text-align: center; font-size: 14.5px; color: var(--de-hint);` | 같음 |
| 빈 칸(불러오는 중) | `.link`와 같은 격자·여백. 썸네일 칸은 16:9·모서리 12px, 글자 자리는 막대 셋(48×22px, 70%×20px, 40%×14px. 사이 8px). 모두 `--de-surface`. 움직임 없음 | 격자·여백만 따라 바뀜 |

- 움직임 줄이기 설정에서는 `.row`의 `transition`을 끈다.
- `EventThumb`에는 `event`만 넘긴다(`priority`·`anyHost`를 주지 않는다. Review Focus 1, 5).
- `SavedRow`는 `useToast`·`useRouter`·SWR을 부르지 않는다(누름을 올리기만 한다).
- 줄의 높이·최소 높이를 고정하지 않는다.

- [ ] **Step 1: `SavedRow`를 만든다.**
- [ ] **Step 2: `SavedList`를 만든다.**
- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/myEvent/SavedRow.tsx && npx eslint components/myEvent/SavedList.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/myEvent/SavedRow.module.scss components/myEvent/SavedList.module.scss`
Expected: 모두 `ok`

Run: `grep -n "저장한 행사가 없습니다.\|관심있는 행사를 저장해보세요\|개발자 행사 보러가기\|관심 행사 정보를 불러오는데 문제가 발생했습니다!\|행사를 불러오는 중이에요" components/myEvent/SavedList.tsx`
Expected: 다섯 가지가 모두 나온다(글자가 지금 코드와 같다. 띄어쓰기도)

Run: `grep -n "web_event_이벤트클릭\|관심 행사에서 빼기" components/myEvent/SavedRow.tsx`
Expected: 둘 다 나온다

Run: `grep -n "}건\|[0-9]건\|priority\|useSWR\|useToast" components/myEvent/SavedRow.tsx components/myEvent/SavedList.tsx`
Expected: 결과 없음 (건수 문구가 없다)

코드로 볼 것 (Review Focus 5): `.body`와 `.link`의 둘째 칸에 `min-width: 0`이 있는지, 배지가 `nowrap`인지, 주최·기간이 모두 비었을 때 `.meta`를 그리지 않는지.

관리자가 화면에서 볼 것: 작업 4 뒤에 함께.

---

### Task 4: 관심 행사 조립 · 페이지 바꾸기

기준: Global Constraints의 "지금 동작 — 관심 행사" 표. 지금 코드 `MyEventTabs.tsx:36-55`, `MyEventScheduledList.tsx:66-89`를 옆에 두고 순서와 인자를 맞춘다. 화면 여백은 `mypage.css:13`, `:107`, `:314`, `:323`. 제목은 `:111`, `:325`.

**Files:**
- Create: `components/myEvent/SavedEvents.tsx`, `SavedEvents.module.scss`
- Modify: `pages/myevent.tsx`

**Interfaces:**
- Consumes: `SavedBand`·`SavedTabs`(Task 2), `SavedList`(Task 3), `splitSaved`·`savedTabOf`·`SavedItem`·`SavedTab`(Task 1), `useMyEvent`(`lib/hooks/useSWR.tsx`), `useNow`(`lib/hooks/useNow.ts`), `useToast`(`context/toast.tsx`), `deleteMyEventApi`(`lib/api/delete.tsx`), `mutate`(`swr`), `lib/utils/gTag`, `next/router`, `toKstNaive`(`lib/utils/timeline/kst.ts`)
- Produces:

```ts
// SavedEvents.tsx
function SavedEvents(props: { now: string }): JSX.Element;

// pages/myevent.tsx — props가 하나 늘어난다
const MyEvent: ({ isLoggedIn, now }: { isLoggedIn: boolean; now: string }) => JSX.Element;
```

**마크업 (`SavedEvents`)**

```
<main class="page">
  <SavedBand>
    <h1 class="title">관심 행사</h1>
    <SavedTabs active ongoingCount doneCount onSelect />
  </SavedBand>
  <SavedList items isError onRemove />
</main>
```

**동작**

- 목록은 `useMyEvent(PARAM, true)` **한 번**. `PARAM`은 파일 맨 위의 상수 `{ filter: '' }`이고 SWR 키는 `['/front/v1/favorite/events', PARAM]`이다(`lib/hooks/useFavorite.tsx:11-13`과 같은 값이어야 캐시를 함께 쓴다. 그 파일에서 불러오지 않고 같은 값을 적는다).
- `const now = useNow(props.now)`, `splitSaved(myEvent, now)`를 `useMemo`로. 탭의 숫자는 두 배열의 길이, 목록은 `savedTabOf(router.query.tab)`에 맞는 배열이다. 목록을 받기 전(`myEvent`가 없고 오류도 아님)에는 `SavedList`에 `items={null}`을 넘기고 탭의 숫자는 0이다(지금과 같다).
- 탭 누름: "지금 동작" 표의 ①②③ 그대로.
- 빼기(`onRemove`): "지금 동작" 표의 ①②③④에 아래 셋을 더한다.
  - 같은 `favoriteId`의 요청이 진행 중이면 아무것도 하지 않는다(`useRef`에 적어 두고 `finally`에서 지운다).
  - ②의 요청이 성공하면 `pushToast('관심 행사에서 뺐어요')`.
  - ②의 요청이 실패하면 누르기 전의 목록으로 되돌리고(`mutate(키, 앞의 목록, false)`) `pushToast('처리 중 오류가 발생했어요', 'plain')` 뒤 다시 불러온다. ④는 보내지 않는다. 다시 불러오는 것이 실패해도 예외를 밖으로 내보내지 않는다.
- `onRemove`는 매 렌더 새 함수가 되지 않게 한다(바뀌는 값은 `ref`로 읽는다. `useFavorite.tsx`와 같은 방식. Review Focus 1).
- 누른 뒤 버튼을 `disabled`로 바꾸거나 확인 창을 띄우지 않는다.
- `useFavorite`·`LoginModal`·`AuthContext`를 이 파일에서 쓰지 않는다.

**값 (`SavedEvents.module.scss`)**

| 부분 | 값 | 860px 이하 |
|---|---|---|
| `.page` | `de-container`, `padding-top: 24px; padding-bottom: 76px;` (최소 높이를 주지 않는다) | `padding-top: 14px; padding-bottom: 56px;` |
| `.title` | `margin: 0 0 26px; font-size: 30px; line-height: 1.2; font-weight: 800; letter-spacing: -0.025em;` | `margin-bottom: 16px; font-size: 25px;` |

**`pages/myevent.tsx`에서 바꾸는 것**

- `getServerSideProps`의 성공 쪽 `props`에 `now: toKstNaive(Date.now())`를 더한다(`pages/events.tsx:230`과 같다). 리디렉트 쪽은 그대로 둔다.
- 그리는 것을 `<SavedEvents now={now} />` 하나로 바꾼다. 옛 `<header>`·`MyEventBody`, `styles/MyEvent.module.scss`·`classnames` import를 뺀다.
- `useEffect`(`:16-22`)와 `getLayout`은 그대로 둔다. `<Head>`를 더하지 않는다.

- [ ] **Step 1: `SavedEvents.tsx`·`SavedEvents.module.scss`를 만든다.**
- [ ] **Step 2: `pages/myevent.tsx`를 고친다.**
- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/myEvent/SavedEvents.tsx && npx eslint pages/myevent.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/myEvent/SavedEvents.module.scss`
Expected: `ok`

Run: `grep -n "web_event_진행중인행사탭클릭\|web_event_종료행사탭클릭\|web_event_관심행사삭제버튼클릭\|web_myevent\|/front/v1/favorite/events\|이벤트 정보가 없습니다!\|관심 행사에서 뺐어요\|처리 중 오류가 발생했어요\|/myevent?tab=done" components/myEvent/SavedEvents.tsx`
Expected: 아홉 가지가 모두 나온다

Run: `grep -c "useMyEvent(" components/myEvent/SavedEvents.tsx && grep -rn "useMyEvent(" components/myEvent/Saved*.tsx | wc -l`
Expected: `1`, `1` (요청이 한 곳이다. Review Focus 3, 8)

Run: `grep -n "console\.\|disabled\|useFavorite\|LoginModal\|AuthContext\|shallow\|window.innerWidth\|windowX\|<Head" components/myEvent/SavedEvents.tsx`
Expected: 결과 없음

Run: `grep -n "authContext.login()\|destination: '/events'\|toKstNaive(Date.now())\|<SavedEvents" pages/myevent.tsx`
Expected: 네 가지가 모두 나온다

관리자가 화면에서 볼 것 (프로덕션 빌드로. 목업과 나란히. 보는 방법은 "관리자 확인"):
1. `/myevent`와 `/myevent?tab=done`이 목업과 같다. 밝게·어둡게. 탭의 숫자와 줄의 수가 같다.
2. 줄을 누르면 상세로 간다. 뒤로 오면 보던 탭이다.
3. 빼기: 줄이 바로 사라지고 숫자가 줄고 안내가 뜬다. 마지막 줄을 빼면 빈 화면이 된다. 실패하게 해 두고 빼면 줄이 돌아오고 오류 안내가 뜬다(Review Focus 2).
4. 0건·1건·많은 건수(Review Focus 1), 날짜가 비어 있는 행사·끝난 시각이 지난 오늘 행사(Review Focus 4), 썸네일 없는 행사·긴 제목(Review Focus 5).
5. 폭 330·390·540·660px(Review Focus 9).
6. 새로 고친 직후 콘솔에 하이드레이션 경고가 없다(서버가 그린 것과 첫 화면이 모두 "빈 칸 세 줄, 숫자 0"이다).

---

### Task 5: 내 정보 카드 · 탈퇴 확인 창 · 페이지 바꾸기

목업 기준: 카드 `mypage.css:183-191`, `:205-213`, `:336`, `:348`, `mypage.js:115-118`, `:131-133`. 탈퇴 창 `mypage.css:51-56`, `:303`, `mypage.js:189`, `app.js:438-442`. `react-modal`을 쓰는 방식은 `components/events/detail/Lightbox.tsx`·`Lightbox.module.scss`. 지금 코드 `pages/myinfo.tsx:46-64`, `:148-172`를 옆에 두고 맞춘다.

**Files:**
- Create: `components/myInfo/ProfileCard.tsx`, `ProfileCard.module.scss`
- Modify: `components/common/modal/DeleteAccountModal.tsx`, `DeleteAccountModal.module.scss` (내용을 통째로 바꾼다. 경로와 기본 내보내기, props는 그대로)
- Modify: `pages/myinfo.tsx`
- Modify: `styles/Myinfo.module.scss` (내용을 통째로 바꾼다)
- Modify: `components/events/timeline/TimelineIcon.tsx` (`mail`이 없을 때만)

**Interfaces:**
- Consumes: `Sticker`·`ME_BAND`(2단계. 다섯 장), `avatarInitial`·`joinedText`(Task 1), `User`(`model/auth.ts`), `TimelineIcon`, `next/image`, `react-modal`, 믹스인
- Produces:

```ts
// ProfileCard.tsx
interface ProfileCardProps {
  user: User | undefined;        // 불러오는 동안에는 undefined
  onWithdraw: () => void;        // "회원 탈퇴" 누름
}
function ProfileCard(props: ProfileCardProps): JSX.Element;

// DeleteAccountModal.tsx — 지금과 같다
export interface DeleteAccountModalProps {
  isOpen?: boolean;
  onClick?: () => void;          // "탈퇴하기"
  onCancel?: () => void;         // "취소", Esc, 바깥 누름
}

// TimelineIcon.tsx — IconName에 'mail'이 없으면 더한다 (7단계 작업 3과 같은 그림. mypage.js:116이 쓰는 것)
//   <rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="M4.5 8l7.5 5 7.5-5" />
```

**마크업**

```
// ProfileCard
<section class="card">
  <div class="band" aria-hidden="true">{ME_BAND를 순서대로 <Sticker key={name} … />}</div>
  <div class="body">
    <span class="avatar">{사진 또는 첫 글자}</span>
    <h1 class="name">{user?.username}</h1>
    {joinedText가 있으면 <p class="since">2025년 03월 14일 가입</p>}
    <dl class="rows"><div class="row"><dt>가입 계정</dt><dd><span class="mail"><TimelineIcon name="mail" size={17} />{user?.email}</span></dd></div></dl>
    <div class="danger">
      <span>탈퇴하면 내 정보와 담아 둔 행사가 모두 삭제되고 복구할 수 없어요.</span>
      <button type="button" class="withdraw" onClick={onWithdraw}>회원 탈퇴</button>
    </div>
  </div>
</section>

// DeleteAccountModal
<Modal isOpen onRequestClose={onCancel} className="card" overlayClassName="overlay"
       role="alertdialog" contentLabel="회원 탈퇴 확인">
  <strong class="title">정말 탈퇴하시겠습니까?</strong>
  <p class="desc">탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.<br />삭제된 정보는 다시 복구할 수 없습니다.</p>
  <div class="buttons">
    <button type="button" class="button" onClick={onCancel}>취소</button>
    <button type="button" class="button ok" onClick={onClick}>탈퇴하기</button>
  </div>
</Modal>

// pages/myinfo.tsx
<main class="page">
  {isError ? <p class="message">내 정보를 불러오는데 문제가 발생했습니다!</p>
           : <ProfileCard user={user} onWithdraw={…} />}
  <DeleteAccountModal … />
</main>
```

**프로필 원**

- `user.profile_image_link`가 있고 불러오기에 실패한 적이 없으면 `<Image src=… width={96} height={96} alt="프로필 이미지" unoptimized objectFit="cover" onError={…} />`. `onError`에서 "실패했다"를 `useState`에 적고, 링크가 바뀌면 지운다(`EventThumb.tsx:36-40`과 같은 방식).
- 그 밖에는 `avatarInitial(user?.username)`을 `aria-hidden="true"`로 그린다(빈 글자면 빈 원).
- `ProfileCard` 안의 작은 함수 컴포넌트로 둔다(파일을 나누지 않는다).

**값 (`ProfileCard.module.scss`. 색은 Global Constraints의 표)**

| 부분 | 값 | 860px 이하 |
|---|---|---|
| `.card` | `overflow: hidden; border-radius: 26px; background: var(--de-bg); box-shadow: var(--de-shadow), 0 0 0 1px var(--de-line);` | 같음 |
| `.band` | `position: relative; height: 150px; overflow: hidden;` + 바탕 | `height: 128px`. 520px 이하에서는 `.band > :nth-child(2), .band > :nth-child(4) { display: none; }` |
| `.body` | `padding: 0 36px 28px;` | `padding: 0 22px 24px;` |
| `.avatar` | `position: relative; display: grid; place-items: center; width: 96px; height: 96px; margin-top: -48px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 5px var(--de-bg); color: #fff; font-size: 38.4px; font-weight: 800;` + 바탕 | 같음 |
| `.name` | `margin: 14px 0 0; min-height: 32px; font-size: 26px; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; overflow-wrap: anywhere;` | 같음 |
| `.since` | `margin: 4px 0 0; font-size: 14.5px; color: var(--de-hint);` | 같음 |
| `.rows` | `margin: 20px 0 0; border-top: 1px solid var(--de-line); border-bottom: 1px solid var(--de-line);` | 같음 |
| `.row` | `display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 54px; font-size: 15px;` 안의 `dt`는 `flex: none; font-weight: 600; color: var(--de-hint);`, `dd`는 `margin: 0; min-width: 0; font-weight: 600; text-align: right; overflow-wrap: anywhere;` | 같음 |
| `.mail` | `display: inline-flex; align-items: center; gap: 7px;` 안의 `svg`는 `flex: none; color: var(--de-hint);` | 같음 |
| `.danger` | `display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; font-size: 13px; line-height: 1.5; color: var(--de-hint);` | `flex-direction: column; align-items: flex-start; gap: 8px;` |
| `.withdraw` | `de-button-reset`, `de-focus-ring`, `flex: none; font-size: 13.5px; font-weight: 700; color: var(--de-hint); text-decoration: underline; text-underline-offset: 3px;` 올리면 `color: var(--de-red)` | 같음 |

**값 (`styles/Myinfo.module.scss`)**

| 부분 | 값 | 860px 이하 |
|---|---|---|
| `.page` | `de-container`, `max-width: 640px; padding-top: 48px; padding-bottom: 8px;` (`max-width`는 `de-container` 뒤에 적어 덮는다. 아래 여백은 소식 받기의 위 여백 80px이 이어받는다) | `padding-top: 24px; padding-bottom: 56px;` |
| `.message` | `margin: 0; padding: 84px 0 72px; text-align: center; font-size: 14.5px; color: var(--de-hint);` | 같음 |

**값 (`DeleteAccountModal.module.scss`)**

| 부분 | 값 |
|---|---|
| `.overlay` | `position: fixed; inset: 0; z-index: 1000; display: flex; padding: 20px; overflow-y: auto; background: rgba(12, 14, 22, 0.56); animation: fade 0.18s ease-out;` (`from { opacity: 0; }`) |
| `.card` | `margin: auto; width: 100%; max-width: 400px; padding: 32px 28px 24px; border-radius: 24px; outline: 0; background: var(--de-bg); color: var(--de-ink); text-align: center; box-shadow: 0 24px 70px rgba(8, 10, 20, 0.34); animation: rise 0.24s cubic-bezier(0.2, 0.8, 0.3, 1);` (`from { opacity: 0; transform: translateY(14px) scale(0.985); }`) |
| `.title` | `display: block; font-size: 20px; font-weight: 800;` |
| `.desc` | `margin: 10px 0 24px; font-size: 14.5px; line-height: 1.6; color: var(--de-sub);` |
| `.buttons` | `display: grid; grid-template-columns: 1fr 1fr; gap: 8px;` |
| `.button` | `de-button-reset`, `de-focus-ring`, `de-press`, `height: 48px; border-radius: 12px; background: var(--de-surface); font-size: 15px; font-weight: 700;` |
| `.ok` | `background: var(--de-red); color: #fff;` (`.button.ok`처럼 클래스 둘로 적어 `.button`을 이기게 한다) |

- `z-index`는 `Lightbox`·로그인 창과 같은 1000이다(헤더 60보다 위, 안내 9999보다 아래).
- 가운데 정렬은 `.card`의 `margin: auto`로 한다. `100vh`를 쓰지 않는다.
- 움직임 줄이기 설정에서는 `.overlay`·`.card`의 animation과 버튼의 누름 움직임을 끈다.
- 옛 스타일(`rem`, `mobile` 믹스인, `white`·`#171717` 같은 고정 색, 고정 높이)은 남기지 않는다.

**동작**

- `DeleteAccountModal`은 `react-modal`의 기본 동작을 그대로 쓴다: 열리면 창(`.card`)에 포커스, Tab은 창 안에서 돌고, Esc와 바깥 누름은 `onRequestClose`(= `onCancel`), 닫히면 연 버튼으로 포커스가 돌아온다. `closeTimeoutMS`를 주지 않는다.
- 열려 있는 동안 `document.documentElement.style.overflow`를 `hidden`으로 두고, 닫히거나 언마운트되면 앞의 값으로 되돌린다(`Lightbox.tsx:25-33`과 같은 방식).
- `pages/myinfo.tsx`의 `deleteAccount`·`logout`은 **"지금 동작" 표의 순서 그대로** 둔다. 더하는 것은 둘뿐이다: 요청이 진행 중이면 다시 부르지 않는 `ref`(시작할 때 적고 `finally`에서 지운다), 그리고 예외를 삼키는 `catch`.
- 창을 여는 것·닫는 것과 그때의 GA 두 가지, `useEffect`(`:28-34`), `getServerSideProps`, `getLayout`은 그대로 둔다. `<Head>`를 더하지 않는다.
- 불러오기 실패(`isError`)일 때는 카드 대신 문구만 그린다(지금과 같다). 훅보다 앞에서 `return`하지 않는다.
- `WithdrawOkButton`·`WithdrawCancelButton`·`/icon/email.svg`·`dayjs`(페이지에서)·옛 `cx` 클래스들은 더 쓰지 않는다. 파일은 지우지 않는다.

- [ ] **Step 1: 2단계의 결과와 `mail` 아이콘이 있는지 본다**

Run: `grep -n "ME_BAND" components/common/sticker/stickerSets.ts; grep -n "'mail'" components/events/timeline/TimelineIcon.tsx`
Expected: `ME_BAND`가 나온다(없으면 멈추고 알린다). `'mail'`이 나오면 `TimelineIcon.tsx`를 고치지 않고, 나오지 않으면 Interfaces에 적힌 그림으로 `mail` 하나만 더한다(다른 아이콘과 기본값은 건드리지 않는다).

- [ ] **Step 2: `ProfileCard.tsx`·`ProfileCard.module.scss`를 만든다.**
- [ ] **Step 3: `DeleteAccountModal.tsx`·`DeleteAccountModal.module.scss`의 내용을 바꾼다.**
- [ ] **Step 4: `styles/Myinfo.module.scss`의 내용을 바꾸고 `pages/myinfo.tsx`를 고친다.**
- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/myInfo/ProfileCard.tsx && npx eslint components/common/modal/DeleteAccountModal.tsx && npx eslint pages/myinfo.tsx && npx eslint components/events/timeline/TimelineIcon.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/myInfo/ProfileCard.module.scss components/common/modal/DeleteAccountModal.module.scss styles/Myinfo.module.scss`
Expected: 모두 `ok`

Run: `grep -n "/front/v1/users/witdraw\|web_event_탈퇴버튼클릭\|web_event_탈퇴취소버튼클릭\|web_event_탈퇴진행버튼클릭\|web_myinfo\|/api/logout\|router.push('/')\|authContext.login()\|destination: '/events'\|내 정보를 불러오는데 문제가 발생했습니다!" pages/myinfo.tsx`
Expected: 열 가지가 모두 나온다

Run: `grep -n "정말 탈퇴하시겠습니까?\|탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.\|삭제된 정보는 다시 복구할 수 없습니다.\|alertdialog\|회원 탈퇴 확인" components/common/modal/DeleteAccountModal.tsx`
Expected: 다섯 가지가 모두 나온다

Run: `grep -n "unoptimized\|onError\|가입 계정\|회원 탈퇴\|탈퇴하면 내 정보와 담아 둔 행사가 모두 삭제되고 복구할 수 없어요." components/myInfo/ProfileCard.tsx`
Expected: 다섯 가지가 모두 나온다

Run: `grep -rn "console\.\|disabled\|StickerDefs\|modalState\|window.innerWidth\|windowX\|🎉\|로그아웃" components/myInfo components/common/modal/DeleteAccountModal.tsx`
Expected: 결과 없음

관리자가 화면에서 볼 것 (프로덕션 빌드로. 목업과 나란히):
1. `/myinfo`가 목업과 같다. 밝게·어둡게. 사진이 있을 때 / 없을 때 / 깨졌을 때(Review Focus 6).
2. 긴 이름(40자), 긴 이메일(60자)이 카드 밖으로 나가지 않는다.
3. "회원 탈퇴" → 창. 닫기 세 가지(취소, Esc, 바깥), 포커스, 스크롤 잠금(Review Focus 7).
4. 폭 330·390·540·660px: 520px 이하에서 머리띠의 스티커가 세 장이고, 탈퇴 줄이 세로다. 창은 330px에서도 버튼 둘이 한 줄이다.
5. **가짜 API로만, 또는 사용자가 직접**(요청이 나간다): "탈퇴하기" 성공 뒤 `/events`로 가고 헤더가 "로그인"으로 바뀌는 것, 실패했을 때 창이 그대로인 것.

---

### Task 6: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인** (`pnpm build`는 여기서 한 번만)

Run:
```bash
npx tsc --noEmit
pnpm test
for f in lib/utils/mypage/savedEvents.ts lib/utils/mypage/profile.ts lib/utils/mypage/__tests__/savedEvents.test.ts lib/utils/mypage/__tests__/profile.test.ts components/myEvent/SavedBand.tsx components/myEvent/SavedTabs.tsx components/myEvent/SavedRow.tsx components/myEvent/SavedList.tsx components/myEvent/SavedEvents.tsx components/myInfo/ProfileCard.tsx components/common/modal/DeleteAccountModal.tsx pages/myevent.tsx pages/myinfo.tsx components/events/timeline/TimelineIcon.tsx; do npx eslint "$f"; done
pnpm build
```
Expected: 모두 통과. 테스트 파일이 이 단계에서 둘 늘어난다. 빌드가 SCSS에서 실패하면(`pure` 모드 위반 등) 그 파일을 만든 작업으로 돌려보낸다.

Run: SCSS 확인 — `components/myEvent/SavedBand.module.scss components/myEvent/SavedTabs.module.scss components/myEvent/SavedRow.module.scss components/myEvent/SavedList.module.scss components/myEvent/SavedEvents.module.scss components/myInfo/ProfileCard.module.scss components/common/modal/DeleteAccountModal.module.scss styles/Myinfo.module.scss`
Expected: 모두 `ok`

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지**

Run: `grep -nE "var\(--(primary|gray-|vapor-|ktb-|glass-)|@include (mobile|tablet|laptop)\b|_common\.scss|[0-9]rem\b|100vh" components/myEvent/Saved*.scss components/myInfo/*.scss components/common/modal/DeleteAccountModal.module.scss styles/Myinfo.module.scss`
Expected: 결과 없음

Run: `grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" components/myEvent/Saved*.scss components/myInfo/*.scss components/common/modal/DeleteAccountModal.module.scss styles/Myinfo.module.scss`
Expected: Global Constraints의 색 표에 있는 값만 나온다

Run: `head -2 components/myEvent/Saved*.scss components/myInfo/*.scss components/common/modal/DeleteAccountModal.module.scss styles/Myinfo.module.scss | grep import`
Expected: 파일마다 `@import '~styles/_variables.scss';`, `@import '~styles/_mixin.scss';` 순서

Run: `grep -rn "DateUtil\|react-loader-spinner\|common/item/Item\|MyEventBody\|WithdrawOkButton\|styles/MyEvent.module" pages/myevent.tsx pages/myinfo.tsx components/myEvent/Saved*.tsx components/myInfo components/common/modal/DeleteAccountModal.tsx`
Expected: 결과 없음

Run: `git status --short | grep "^ D\|^D "`
Expected: 결과 없음(지운 파일이 없다)

이 단계에서 만들거나 고친 파일이 File Structure에 적힌 것뿐인지 본다. `lib/api/*`, `lib/hooks/*`, `context/*`, `components/common/sticker/*`, `components/common/modal/login/*`, `LoginModal.*`, `components/layout/*`, `EventCard.*`, `EventThumb.*`, `Lightbox.*`, 옛 `components/myEvent/MyEvent*.tsx`는 이 단계에서 고치지 않는다.

- [ ] **Step 3: 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

| 출처 | 요구 | 맡은 작업 |
|---|---|---|
| 로드맵 8단계 | 화면 이름 "관심 행사" | 2, 4 |
| 로드맵 8단계 | 머리띠 안에 제목과 탭(진행중 N / 종료 N), 아래는 줄 목록 | 2, 3, 4 |
| 로드맵 8단계 | 빈 화면 문구와 "개발자 행사 보러가기" 버튼은 지금 그대로 | 3 |
| 로드맵 8단계 | 내 정보: 가운데 카드(머리띠, 사진·이름·가입일, 가입 계정, 회원 탈퇴), 탈퇴 확인 창 | 5 |
| 로드맵 8단계 | 종료일 계산 세 곳을 하나로 | 1, 4 |
| 로드맵 공통 규칙 7 · 받은 결정 | 건수를 요약하는 문구 없음 | 3, 4 |
| 받은 결정 | 판정 결과는 지금과 같게, 테스트 먼저, `kst.ts`, 서버가 만든 `now` | 1, 4 |
| 받은 결정 | 관심 빼기의 요청·GA는 지금과 같게 | 4 |
| 받은 결정 | 탈퇴의 요청·성공/실패 뒤 동작·확인 문구는 지금과 같게, `react-modal` | 5 |
| 받은 결정 | 스티커는 2단계의 `Sticker`·`SAVED_BAND`·`ME_BAND`, 7단계 파일은 고치지 않음 | 2, 5 |
| 받은 결정 | 로그인하지 않았을 때·확인 전의 동작은 지금 그대로 | 4, 5 |
| 설명 페이지 `index.html:444` | 빠진 뒤 "관심 행사에서 뺐어요" 안내 | 4 |
| 설명 페이지 `index.html:467` | 사진이 없으면 이름 첫 글자를 넣은 파란 원 | 1, 5 |
| `mypage.css:303` | 움직임 줄이기 | 3, 5 |
| `mypage.css:313-336`, `:348` | 860px·520px 이하의 값 | 2, 3, 4, 5 |

- [ ] **Step 4: 관리자가 화면에서 볼 것을 한 번에 모은다.** 작업 4·5의 "관리자가 화면에서 볼 것"과 Review Focus 아홉 가지를 한 목록으로 묶어 보고한다. 프로덕션 빌드로, 1280×900·660·540·390×844·330px 폭에서, 밝게·어둡게. 요청이 나가는 항목(빼기, 탈퇴)은 따로 표시한다.

**이 단계가 끝난 뒤의 모습:** 관심 행사와 내 정보가 새 모양입니다. 옛 `MyEvent*` 부품과 `styles/MyEvent.module.scss`는 쓰는 곳이 없는 채로 남아 있고 9단계가 지웁니다.

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

- `components/myEvent/MyEventBody.tsx`, `MyEventTabs.tsx`, `MyEventScheduledList.tsx`, `MyEventDoneList.tsx`, `MyEventEmpty.tsx`, `MyEventEmpty.module.scss`
- `styles/MyEvent.module.scss` — 위 파일들과 옛 `pages/myevent.tsx`만 썼다.
- `components/common/buttons/WithdrawOkButton.tsx`·`.module.scss`, `WithdrawCancelButton.tsx`·`.module.scss`
- `public/icon/bookmark_icon.png` — 옛 빈 화면만 썼다.
- `public/icon/email.svg` — 이 단계 뒤에는 옛 로그인 창만 쓴다(7단계가 끝나면 쓰는 곳이 없다).
- `react-loader-spinner` — 남은 쓰는 곳은 `components/events/MonthlyEventList.tsx`(9단계 후보)뿐이다. 그것이 없어지면 의존성도 뺄 수 있다.
- `DateUtil.isDone` — 남은 쓰는 곳은 `components/common/item/List.tsx`와 `lib/utils/eventUtil.tsx`(옛 목록)다. `components/common/item/Item.tsx`도 이 단계 뒤에는 `List.tsx`만 쓴다.
- `pages/myinfo.tsx`·`pages/myevent.tsx`의 `useEffect`에서 닿을 일이 없는 `else`(`authContext.logout()`. 서버가 쿠키 없이는 화면을 그리지 않는다).
- 스크롤 잠금이 `Lightbox.tsx`, `LoginModal.tsx`(7단계), `DeleteAccountModal.tsx`에 같은 줄로 있다. 훅 하나로 모을 수 있다.
- 머리띠의 어두운 바탕이 `LoginBand`, `SavedBand`, `ProfileCard`에 따로 적혀 있다(타원의 자리·높이가 달라 지금은 따로 둔다).

**남겨 두는 것**
- `lib/hooks/useFavorite.tsx`의 `PARAM`·`KEY` — `SavedEvents.tsx`가 같은 값을 따로 적는다. 한쪽을 바꾸면 다른 쪽도 바꿔야 한다.
- `DeleteAccountModal.tsx` — 경로가 그대로이고 새 내용이 들어 있다.

**9단계로 미룬 다듬기**
- 줄을 뺀 뒤 포커스가 사라진다(지금과 같다. 다음 줄의 빼기 버튼이나 목록으로 옮길 수 있다).
- 탭에 방향키 이동이 없다(지금도 목업도 없다).

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **`<title>`은 건드리지 않는다.** 두 페이지에는 지금 `<Head>`가 없어 `_app.tsx`의 기본 제목이 쓰인다. 로그인해야 보이는 화면이라 검색과 무관하고, 제목을 더하면 새 문구를 만드는 일이 된다. 바뀌는 것은 화면 안의 제목("북마크" → "관심 행사")과 탭의 `aria-label`뿐이다.
2. **머리띠는 화면마다 따로 만든다(7단계 `LoginBand`를 쓰지 않는다).** `LoginBand`는 높이 138px·아래 간격·`LOGIN_BAND`가 박혀 있고 안에 내용을 넣을 수 없다. 관심 행사의 머리띠는 안에 제목과 탭이 들어가고(`min-height`), 860px 이하에서 스티커 묶음이 위 칸으로 내려오며 통째로 줄어든다. 내 정보의 머리띠는 높이가 다르고 520px 이하에서 두 장을 숨긴다. 함께 쓰려면 7단계 파일에 props를 넷은 더해야 해서, 7단계 파일을 고치지 않는 쪽을 골랐다. 겹치는 것은 바탕색 한 줄이다.
3. **줄은 새 부품(`SavedRow`)이다. `EventCard`를 쓰지 않는다.** `EventCard`는 썸네일 320px, 시각 줄, 태그, 공유 버튼, "관심 행사에 담기" 버튼(`aria-pressed`)으로 짜여 있어 목업의 줄(썸네일 148px, 배지, 제목, 한 줄 설명, 빼기 버튼)과 겹치는 것이 썸네일뿐이다. 선택 속성으로 맞추면 속성이 다섯은 늘고 메인 카드가 복잡해진다. `EventThumb`·`TimelineIcon`만 그대로 쓴다.
4. **종료 판정은 지금 규칙 그대로 한 함수로.** 세 곳의 결과가 같아 고를 것이 없었다. 값이 있는지로 가르는 것(`'N'`도 참)과 날짜만 견주는 것을 그대로 옮기고 테스트로 묶었다. 다른 점은 "오늘"을 한국 시간으로 보는 것 하나다.
5. **빼기는 `useFavorite`을 쓰지 않고 `SavedEvents` 안에 둔다.** `useFavorite`은 GA의 `event_category`가 `web_event`이고(이 화면은 `web_myevent`), `favorite_id`가 0인 줄을 누르면 "담기"로 처리하며(이 화면은 알림), 로그인 확인 전에는 누름을 버린다. 지금 동작과 달라지고 7단계가 같은 파일을 고치고 있어, 같은 방식(먼저 빼기 → 실패하면 되돌리기 → 다시 불러오기, 진행 중인 것 막기)을 이 화면에 따로 적었다.
6. **불러오는 중은 줄 모양의 빈 칸 세 줄.** 지금의 점 세 개(`react-loader-spinner`, 옛 파란색)를 새 화면에 들이지 않으려는 것이다. 목업은 이 상태를 그리지 않았다. 빈 칸이 줄과 같은 크기라 목록이 들어올 때 화면이 덜 움직인다.
7. **목록은 지금처럼 브라우저에서만 불러온다.** 서버에서 토큰으로 미리 불러 내려 주면 탭의 0이 보이지 않겠지만 요청 흐름이 바뀐다. `now`만 서버에서 내려 준다(처음 그릴 때의 "오늘"이 서버와 브라우저에서 같다).
8. **프로필 사진에 `unoptimized`를 준다.** 지금은 허용 목록에 없는 호스트의 사진이면 깨진 그림이 보인다(개발 모드에서는 `next/image`가 예외를 낸다). 이 저장소의 다른 외부 그림도 `unoptimized`다. 불러오지 못하면 첫 글자 원으로 바꾼다.
9. **탈퇴 요청에 연타 막기와 `catch`를 더했다.** 보이는 동작은 같다. 두 번 나가면 이미 탈퇴한 계정으로 두 번째 요청이 가서 오류 알림이 뜰 수 있다.
10. **목업을 고쳐 옮긴 것**
    - 머리띠 위 탭의 포커스 테두리를 흰색으로(어두운 바탕에서 `--de-blue`는 보이지 않는다. 7단계의 닫기 버튼과 같은 결정).
    - 그 밖의 포커스 테두리는 `de-focus-ring`(2px. 목업은 2.5px).
    - 종료 탭이 비었을 때도 지금 문구(목업은 다른 문구).
    - 끝난 시각이 지난 오늘 행사의 배지를 "오늘"·"오늘 마감"으로(목업은 시각으로 판정해 "종료").
11. **화면 틀의 SCSS**: 관심 행사는 새 파일(`SavedEvents.module.scss`), 내 정보는 페이지가 쓰던 `styles/Myinfo.module.scss`의 내용을 바꾼다(요청·GA가 페이지에 남아 있어 틀도 페이지가 그린다).

### 확인이 필요한 것

1. **순서.** 목업은 진행중을 "마감·시작이 빠른 순", 종료를 "최근에 끝난 순"으로 놓고 설명 페이지(`index.html:445`)에도 그렇게 적혀 있다. 지금 코드는 서버가 준 순서 그대로다. "지금 코드가 기준"이라 정렬을 넣지 않았다. 넣기로 하면 `splitSaved` 한 곳과 그 테스트만 바꾸면 된다(서버는 고칠 필요가 없다).
2. **태그와 공유 버튼이 이 화면에서 빠진다.** 지금 카드에는 있고 목업의 줄에는 없다. 줄의 모양을 목업대로 하라는 결정을 따랐다. 남기려면 `SavedRow`에 한 줄(태그)과 버튼 하나(공유)를 더하는데, 330px에서 글자 칸이 128px이라 태그 줄은 좁다.
3. **종료 탭이 비었을 때의 빈 화면.** 지금 코드대로 진행중 탭과 같은 문구("저장한 행사가 없습니다.")와 "개발자 행사 보러가기" 버튼이 나온다. 진행중에 행사가 있는데 종료 탭에서 "저장한 행사가 없습니다."가 보이는 것이 어색하면 목업의 문구("종료된 행사가 없어요")로 바꿀 수 있다.
4. **기간에 연도가 없다.** 목업의 꼴("11.20(금)")은 3·6단계와 같고 연도를 적지 않는다. 지금 화면은 "26.11.20"처럼 연도를 적는다. 종료 탭에 지난해 행사가 쌓이면 어느 해인지 알 수 없다.
5. **오류 문구의 "내 이벤트".** "내 이벤트 정보를 불러오는데 문제가 발생했습니다!"를 지금 글자 그대로 두었다. 화면 이름을 "관심 행사"로 통일하면서 이 문장만 옛 이름을 쓴다. **→ 관리자 결정(11-18): "관심 행사 정보를 불러오는데 문제가 발생했습니다!"로 바꾼다. 이 문서의 작업 단계에는 바꾼 문구가 적혀 있다.**
6. **내 정보의 탈퇴 안내 문장.** 목업의 문장("…담아 둔 행사가 모두 삭제되고…")을 썼다. 지금 문장은 "…북마크가 모두 삭제되며…"다. 확인 창의 문구는 지금 그대로다. 확인 창의 버튼은 목업대로 "취소"(지금 "취소하기")이고 순서가 바뀐다(취소가 왼쪽).
7. **목록을 받기 전 탭의 숫자가 0이다**(지금과 같다). 새로 고치면 "진행중 0 / 종료 0"이 잠깐 보였다가 실제 숫자로 바뀐다. 받기 전에는 숫자를 비워 두는 것도 할 수 있다(탭 폭이 한 번 바뀐다).
8. **330px에서 관심 행사 머리띠의 스티커.** 860px 이하에서 묶음을 0.74배로 줄여도 맨 왼쪽 `holo:logo`가 오른쪽에서 약 222px 떨어진 자리에서 시작해, 298px 머리띠에서는 왼쪽 끝이 조금 잘린다. 목업도 같다(CSS로만 읽었고 화면으로 띄워 보지는 못했다). 보기 싫으면 `SavedBand`가 360px 이하에서 한 번 더 줄이면 된다.
9. **끝난 시각이 지난 오늘 행사가 진행중 탭에 남는다**(지금 규칙). 메인 타임라인은 같은 행사를 "행사 종료"로 보여 준다. 두 화면의 판정을 맞추려면 이 화면을 시각 기준으로 바꿔야 하고, 그러면 "판정 결과는 지금과 같게"와 부딪힌다.
10. **7단계와 겹칠 수 있는 파일.** `TimelineIcon.tsx`의 `mail` 한 줄(작업 5가 있는지 보고 없을 때만 더한다). `lib/hooks/useFavorite.tsx`·`context/auth.tsx`는 이 단계에서 고치지 않는다.
11. **탈퇴에 성공한 직후.** `logout()`이 `/api/logout` → `authContext.logout()`(같은 주소를 한 번 더 부른다) → `/`로 간다. 요청이 겹치지만 지금과 같아 그대로 두었다.

### 관리자 확인 — 로그인이 필요한 화면을 보는 방법

구현 에이전트는 화면을 띄우지 않습니다. 관리자가 가짜 API와 프로덕션 빌드(`.claude/launch.json`의 `redesign-mock-api`·`redesign-web`)로 봅니다.

**서버 쪽(SSR)이 통과하는 조건**
- `localhost:5000`에 **이름이 `access_token`인 쿠키가 비어 있지 않으면** 두 화면이 그려진다(`pages/myevent.tsx`·`pages/myinfo.tsx`의 `getServerSideProps`. 값이 유효한지, 어떤 모양인지는 보지 않는다). 없으면 `/events`로 넘어간다.
- 쿠키를 넣는 방법: `/?accessToken=…&refreshToken=…` 주소는 `pages/index.tsx`가 값을 JWT로 풀어 만료 시각을 읽으므로 **아무 글자로는 쓸 수 없다.** 브라우저에서 `localhost:5000`에 `access_token` 쿠키를 직접 넣는다(가짜 값. 실제 토큰을 쓰지 않는다. `httpOnly`가 아니어도 된다). 다 본 뒤에는 쿠키를 지운다(헤더의 로그아웃을 누르면 `/api/logout`이 지운다).

**브라우저 쪽 요청**
- 요청마다 먼저 `POST /api/getToken`(쿠키 값을 그대로 돌려준다)을 부르고 그 값을 `Authorization` 헤더에 실어 `BASE_SERVER_URL`로 보낸다. 가짜 API는 이 헤더의 값을 보지 않으면 된다.
- 가짜 API가 더 가져야 하는 응답(지금 가짜 API에는 없다)

  | 요청 | 응답 |
  |---|---|
  | `GET /front/v1/favorite/events` | `[{ "favorite_id": 1, "dev_event": { …행사 하나… } }, …]` (행사는 `/front/v2/events/current`가 주는 것과 같은 모양) |
  | `DELETE /front/v1/favorite/events/:favoriteId` | `{ "message": "…", "status": "…", "status_code": 200 }`. 목록에서도 빼야 다시 불러올 때 돌아오지 않는다 |
  | `GET /front/v1/users/profile` | `{ "auth_type_enum": "GOOGLE", "email": "…", "register_date": "2025-03-14T10:20:30", "username": "…", "profile_image_link": "" }` |
  | `DELETE /front/v1/users/witdraw` (철자 그대로) | `{ "message": "…", "status": "…", "status_code": 200 }` |

- **CORS**: 지금 가짜 API는 `Access-Control-Allow-Origin: *`와 `Access-Control-Allow-Headers: *`만 준다. `Authorization` 헤더는 `*`로 허용되지 않고 `DELETE`는 허용 메서드에 있어야 한다. 사전 요청(`OPTIONS`)의 응답에 `Access-Control-Allow-Headers: Authorization, Accept, Content-Type`과 `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`를 더한다.

**만들어 둘 경우** (배너의 `banner-mode.json`처럼 파일 하나로 바꿀 수 있게 하면 빌드를 다시 하지 않아도 된다)

| 경우 | 가짜 API가 주는 것 | 보는 것 |
|---|---|---|
| 보통 | 진행중 9건 + 종료 5건(목업과 같은 수) | 목업과 나란히 |
| 0건 · 1건 · 200건 | `[]` · 한 건 · 같은 행사를 `favorite_id`만 바꿔 200건 | Review Focus 1 |
| 날짜 | `end_date_time`이 `null`인 것, 오늘 오전에 끝난 것, `use_end_date_time_yn`이 `null`이고 시작일이 지난 것 | Review Focus 4 |
| 모양 | `cover_image_link`가 `""`인 것, 없는 주소인 것, 제목 80자, 주최 40자 | Review Focus 5 |
| 느린 응답 | 목록을 2초 뒤에 | 빈 칸 세 줄, 탭의 0 |
| 빼기 실패 | `DELETE …/events/:id`에 500 `{ "status_code": 500, "status": "ERROR_500_00", "message": "…" }` | Review Focus 2. `lib/api/error.tsx`의 알림("요청과정에서 서버 오류가 발생했습니다.")이 먼저 뜰 수 있다(페이지에서 첫 실패일 때만) |
| 목록 실패 | `GET …/favorite/events`에 같은 500 | 실패 문구. 빈 화면이 함께 보이지 않는다 |
| 토큰 거부 | 같은 요청에 400 `{ "status_code": 400, "status": "TOKEN_400_01", "message": "…" }` | 알림 → 로그아웃 → `/events` (Review Focus 8) |
| 토큰 만료 | 같은 요청에 400 `TOKEN_400_02` | 다시 받기를 시도한다(`/api/getRefreshToken` → `POST /admin/v1/token/refresh`). 가짜 API에 그 응답이 없으면 실패 문구에서 멈춘다 |
| 프로필 | 사진 없음 / 있는 사진 / 없는 주소의 사진 / 허용 목록 밖 호스트의 사진, 이름 40자, 이메일 60자, `register_date`가 `null` | Review Focus 6 |
| 탈퇴 | 성공(200) / 실패(500) | Review Focus 7. 가짜 API라 실제 계정에는 일이 없다 |

실제 서버에 붙여 빼기·탈퇴를 누르는 확인은 사용자가 직접 합니다.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 끝난 접수형 행사의 줄에는 마감 시각이 빠진다("11.10(화) 접수 마감"). 시각 칸을 타임라인의 것(`slot.time`)에서 가져와 생긴 일이다. 그대로 따랐다.
- 머리띠 위의 탭과 줄의 포커스 테두리가 `--blue`라 어두운 머리띠 위에서 거의 보이지 않는다.
- 불러오는 중·불러오기 실패, 날짜를 읽을 수 없는 행사, 사진이 깨졌을 때를 그리지 않았다.
- `me2`에는 화면 제목("내 정보")이 없다. 화면의 `<h1>`이 사용자 이름이 된다.

**지금 코드**
- 종료 탭의 목록도 `isEventDone={() => false}`를 넘겨, 끝난 행사가 흐려지지 않고 D-day 딱지 자리가 빈다.
- 탭과 목록이 같은 요청을 세 번 부르고(SWR이 하나로 합친다) 목록은 `useEffect`로 걸러 한 박자 늦다.
- `?tab=foo`면 탭은 진행중인데 목록이 그려지지 않는다.
- 빼기 요청이 실패하면 줄이 빠진 채 남고, 다시 불러오기도 GA도 지나가지 않는다.
- `lib/api/axiosInstanceWithToken.tsx`의 `requestArray`는 비워지지 않아, 페이지를 연 뒤 **첫 번째 실패만** 알림·토큰 다시 받기가 처리된다. 응답이 없는 실패(네트워크)에서는 인터셉터가 `error.response.data`를 읽다가 다시 예외를 낸다.
- `model/event.ts`의 `MyEvent.favorite_id`가 `number`가 아니라 `0`으로 적혀 있다.
- 탈퇴 주소의 철자가 `witdraw`다(서버와 맞춰져 있을 것이므로 고치지 않는다).
- `pages/myinfo.tsx`의 프로필 사진에 `unoptimized`가 없어 허용 목록 밖 호스트면 깨진 그림이 된다(개발 모드에서는 예외). `register_date`가 읽을 수 없는 값이면 "Invalid Date"가 보인다.
- 탈퇴 요청의 실패를 잡지 않고, 버튼을 여러 번 누르면 요청이 여러 번 나간다.
- 두 페이지의 `useEffect`에 있는 `else { authContext.logout() }`은 닿을 일이 없다.
