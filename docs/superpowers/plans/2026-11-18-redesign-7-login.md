# 리디자인 7단계 — 로그인 창 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 창을 "반투명 유리 창에 버튼 여섯 개"에서 "홀로그램 머리띠가 있는 불투명한 창"으로 바꾼다. 처음에는 카카오와 이메일만 보이고 "다른 방법으로 로그인"을 누르면 Google·네이버·GitHub가 펼쳐진다. 화면은 세 가지(처음 / 이메일 로그인 / 이메일 가입)다. 함께, 로그인 상태 확인이 끝나기 전에 헤더에 "로그인" 버튼이 먼저 그려지고 그 사이 "관심 행사"를 누르면 로그인한 사람에게도 로그인 창이 뜨던 것을 없앤다.

**Architecture:** 검사 규칙·화면 전환·포커스가 갈 곳·간편 로그인 주소는 `components/common/modal/login/loginFlow.ts`의 순수 함수로 빼고 테스트를 먼저 쓴다(검사 규칙은 지금 `LoginModal.tsx`의 `checkValid` 두 개를 그대로 꺼낸 것이다). 화면은 `components/common/modal/login/`에 새 부품(`LoginButton`, `LoginBand`, `LoginMain`, `LoginForms`, `LoginPanel`)을 만들고, 마지막 조립 작업에서 `LoginModal.tsx`와 그 SCSS의 내용을 새 것으로 바꾼다. `LoginModal`의 경로·props(`isOpen`, `onClose`)와 여는 곳은 그대로다. 요청·알림·이동은 `LoginPanel` 한 파일에 모아 지금 코드와 줄 단위로 견줄 수 있게 한다. 로그인 상태 확인은 `AuthContext`에 `isChecked` 하나를 더하고 헤더와 `useFavorite`이 그것을 읽는다. 모달은 지금처럼 `react-modal`이고 6단계 `Lightbox`와 같은 방식(자기 클래스의 오버레이, `onRequestClose`, `html`의 스크롤 잠금)을 쓴다.

**Tech Stack:** Next.js 12 (Pages Router) / React 17 / TypeScript 4.6 / SCSS Module (`classNames.bind`) / SWR 1.x / react-modal 3.x / jest (ts-jest)

**Spec:** 목업 `docs/design-proposals/2026-11-13-main-detail-redesign/detail-design/`의 `login.js`(시안 `l2`: `:64-65`, 공통 부품 `:23-55`), `login.css`(공통 `:4-49`, `l2` `:53-58`, 움직임 줄이기 `:142`, 좁은 화면 `:145-149`), `app.js:402-427`(열기·닫기·누름), `:550`(Esc), 설명 페이지 `index.html:406-433`. 전체 순서와 공통 규칙은 `docs/superpowers/plans/2026-11-17-redesign-roadmap.md`. **입력란·검사 규칙·오류 문구·요청·성공/실패 뒤 동작의 기준은 목업이 아니라 지금 코드**(`components/common/modal/LoginModal.tsx`, `lib/api/post.tsx`, `lib/api/error.tsx`)다. 둘이 다른 곳은 아래 "목업과 지금 코드가 다른 점" 표가 정한다.

**User preferences:** 작업 중 git commit 없음. 계획 안에 commit 단계 없음. 구현 에이전트는 `pnpm dev`·`pnpm start`로 화면을 띄우지 않고, **로그인·가입·양식 제출을 하지 않는다**(실제 요청이 나가는 확인은 관리자·사용자가 한다). `pnpm build`는 작업 6에서 한 번만. 화면 비교는 관리자가 모든 작업이 끝난 뒤 한 번에 한다. 파일을 지우지 않는다. 파일 내려받기·외부 요청 없음(로고는 지금 저장소에 있는 파일만 쓴다).

## Global Constraints

- **리디자인은 지금 스펙 그대로.** 입력란의 종류·순서·`name`·placeholder, 검사 규칙과 알림 문구, 보내는 요청, 성공·실패 뒤 동작은 아래 "지금 동작" 표와 같아야 한다. 창 안에 오류를 보여 주는 자리를 만들지 않는다(알림은 지금처럼 `alert`). 약관·개인정보 안내, 계정 찾기, 애플 로그인은 넣지 않는다.
- **`lib/api/*`는 고치지 않는다.** 비밀번호가 틀리면 `lib/api/error.tsx`가 알림 → 로그아웃 → `/`로 보내는 동작은 범위 밖이다.
- **`LoginModal`의 경로·props와 여는 곳은 바꾸지 않는다.** 여는 곳 일곱 군데(2026-11-18 기준): `components/layout/header/Header.tsx:100`, `components/events/timeline/EventTimeline.tsx:433`, `components/events/calendar/EventCalendar.tsx:237`, `components/events/detail/EventDetailView.tsx:92`(이 셋은 `useFavorite`이 연다), 그리고 열릴 일이 없어진 `pages/events.tsx:180`, `pages/search.tsx:100`, `components/common/item/List.tsx:192`. 이 가운데 고치는 파일은 `Header.tsx`뿐이고(작업 2), `<LoginModal … />` 줄은 그대로 둔다.
- **헤더와 `AuthContext`에 사용자 조회를 더하지 않는다.** `useUser()`·`/front/v1/users/profile`을 부르면 토큰이 거부될 때 모든 화면에서 알림·로그아웃이 일어난다(1단계 결정). 확인은 지금처럼 `/api/checkAuth`(쿠키가 있는지만 본다) 하나다.
- `WindowContext.modalState`는 로그인 창이 지금도 쓰지 않는다. 쓰지 않는 채로 둔다.
- `StickerDefs`는 `components/layout/index.tsx`에 한 번 들어 있다(2단계). 로그인 창에 다시 넣지 않는다. `react-modal`의 포털도 같은 문서라 `url(#…)`이 듣는다. 로그인 창을 여는 화면은 모두 `Layout` 안이다.
- 색은 `--de-*` 변수만. 고정 색 값은 아래만 허용한다(목업 `login.css:5`, `:8`, `:21`, `:28-31`, `:54`, `:56`).

  | 쓰임 | 값 |
  |---|---|
  | 오버레이 바탕 | `rgba(12, 14, 22, 0.56)` |
  | 창 그림자 | `0 24px 70px rgba(8, 10, 20, 0.34)` |
  | 머리띠 바탕 | `radial-gradient(ellipse 70% 140% at 50% 40%, #1a1d2b 0%, #0b0d14 78%)` |
  | 닫기 버튼(머리띠 위) | 글자 `rgba(255, 255, 255, 0.75)`, 바탕 `rgba(255, 255, 255, 0.1)`. 올리면 `#fff`, `rgba(255, 255, 255, 0.2)`. 포커스 테두리 `#fff` |
  | 카카오 | 바탕 `#fee500`, 글자 `rgba(0, 0, 0, 0.85)`. 올리면 `filter: brightness(0.96)` |
  | Google (Neutral 판) | 바탕 `#f2f2f2`, 글자 `#1f1f1f`, 테두리 없음. 올리면 `#e9e9e9` |
  | 네이버 | 바탕 `#03c75a`, 글자 `#fff`. 올리면 `filter: brightness(0.96)` |
  | GitHub | 바탕 `#24292f`, 글자 `#fff`. 올리면 `filter: brightness(1.18)`. 어두운 화면에서만 `box-shadow: inset 0 0 0 1.5px #3a404c` |

  목업의 변수 `--bg`, `--ink`, `--sub`, `--hint`, `--faint`, `--line`, `--surface`, `--hover`, `--blue`는 `--de-bg`, `--de-ink` …이다.
- **로고는 지금 코드가 쓰는 파일을 그대로** `@svgr/webpack`으로 불러온다: `public/icon/kakao.svg`, `google.svg`, `naver.svg`, `github.svg`. 파일을 고치거나 새로 받지 않는다. 크기는 props로 준다(`<KakaoIcon width={20} height={20} aria-hidden />`). 메일·닫기·뒤로·펼침 화살표는 로고가 아니므로 `TimelineIcon`을 쓴다(`mail`만 더한다. 작업 3).
- 폭이 바뀌는 자리는 **520px 하나**다(`@media (max-width: 520px)`로 직접 쓴다. 목업 `login.css:145`). 860px(`de-mobile`)에서는 입력란 글자 크기만 바뀐다. `window.innerWidth`·`WindowContext.windowX`로 갈라지는 코드를 쓰지 않는다. 옛 믹스인(`mobile`, `tablet`, `laptop`)과 옛 색 변수는 쓰지 않는다.

  | | 521px 이상 | 520px 이하 |
  |---|---|---|
  | 창의 모양 | 화면 가운데 카드(전체 화면도, 아래에서 올라오는 판도 아니다) | 같음 |
  | 오버레이 여백 | 20px | 14px |
  | 창 폭 | `width: 100%; max-width: 440px` | 100% (화면 폭 − 28px. 330px 화면에서 302px, 390px에서 362px) |
  | 창 모서리 | 26px | 22px |
  | 머리띠 높이 · 아래 간격 | 138px · 26px | 118px · 22px |
  | 본문 여백 | `0 40px 34px` | `0 22px 26px` |
  | 제목 | 25px | 22px |
  | 안내문 | 14.5px | 14px |
  | 버튼 높이 · 글자 | 52px · 15.5px ("다른 방법으로 로그인"은 44px · 14.5px) | 모두 50px · 15px ("다른 방법으로 로그인"도. 목업의 규칙 순서가 그렇다) |
  | 창 높이 | 내용만큼(처음 약 500px, 펼치면 약 680px, 가입 화면 약 770px). 화면보다 길면 **오버레이가 스크롤**된다 | 같음 |
- 크기는 px. SCSS 첫 두 줄은 `@import '~styles/_variables.scss'; @import '~styles/_mixin.scss';`(전체 파일명과 물결표, 변수 먼저). `~styles/_common.scss`는 불러오지 않는다.
- **CSS Module은 `pure` 모드다.** 선택자에 그 파일의 클래스가 하나는 들어 있어야 한다(`svg { … }`, `:global(html…) { … }`만으로 된 규칙은 빌드 오류). 어두운 화면 전용 규칙은 `:global(html[data-theme='dark']) &`를 클래스 안에 넣는다. 다른 모듈의 클래스를 덮을 때는 클래스 둘로 적어 순서와 무관하게 이기게 한다(`.main .first`).
- import는 프로젝트 루트 기준 절대 경로. `tsconfig`의 `target`이 `es5`이고 `downlevelIteration`이 꺼져 있다(`Map`·`Set`을 `[...x]`·`for…of`로 돌리지 않는다).
- `prefers-reduced-motion: reduce`에서는 이 단계의 animation·transition을 끈다(`de-reduced-motion`).
- 문구는 이 계획에 적힌 그대로다. 버튼·제목·안내문은 목업, 입력란 이름·placeholder·알림 문구는 지금 코드다.
- **토큰을 화면·콘솔·파일에 남기지 않는다.** 새 코드에 `console.log`를 넣지 않는다.
- 파일을 지우지 않는다. 쓰지 않게 된 것은 이 문서 끝의 "9단계에서 지울 것"에 적는다.
- `pnpm lint`는 쓰지 않는다. 작업마다의 확인은 `npx tsc --noEmit`, `pnpm test`, `npx eslint <바꾼 .ts·.tsx 파일을 하나씩>`이고 `pnpm build`는 작업 6에서 한 번이다. `context/auth.tsx`에는 이 단계 전부터 eslint 오류 4개(빈 함수 2, 28·54행의 포맷 2)가 있다. 고치는 줄 밖은 건드리지 않는다. 새 파일이 포맷 오류를 내면 `npx prettier --write <그 파일>`로 맞춘다(테스트의 단언은 바꾸지 않는다). SCSS는 `tsc`가 보지 않으므로 SCSS를 만들거나 고친 작업은 아래 명령으로 문법을 확인한다(이 문서에서 "SCSS 확인"이라고 부른다. `pure` 모드 위반은 빌드에서만 드러난다).

```bash
node -e "const sass=require('sass');const imp={findFileUrl(u){return u.startsWith('~')?new URL('file://'+process.cwd()+'/'+u.slice(1)):null}};process.argv.slice(1).forEach(f=>{sass.compile(f,{importers:[imp],logger:sass.Logger.silent});console.log('ok',f)})" <scss 파일들>
```

### 지금 동작 (그대로 옮긴다. `LoginModal.tsx`의 줄 번호는 2026-11-18 기준)

| 일 | 순서 | 지금 코드 |
|---|---|---|
| 간편 로그인 버튼 | ① `ga.event({ action: 'web_event_sns로그인버튼클릭', event_category: 'web_event', event_label: '로그인' })` ② `router.push(`${process.env.BASE_SERVER_URL}/auth/login/${type}`)`. `type`은 `kakao`·`google`·`naver`·`github`. 창을 닫지 않고, 버튼을 막거나 불러오는 표시를 넣지 않는다 | `:76-84` |
| 이메일 로그인 제출 | ① `ga.event({ action: 'web_event_이메일로그인버튼클릭', event_category: 'web_event', event_label: '로그인' })` ② 검사: 아이디가 비면 `alert('아이디를 입력해주세요!')`, 비밀번호가 비면 `alert('비밀번호를 입력해주세요!')` ③ `loginByEmail('/front/v1/users/login', { user_id, password })` ④ 받은 값이 있으면 `router.push(`/?accessToken=${access_token}&refreshToken=${refresh_token}`)` 뒤 창을 닫는다 | `:165-193` |
| 이메일 로그인 실패 | 창은 아무것도 하지 않는다. 알림·로그아웃·`/` 이동은 `lib/api/axiosInstance.tsx`의 인터셉터와 `lib/api/error.tsx`가 한다. 새 코드는 예외를 삼키는 `catch`만 둔다(지금은 잡지 않아 처리되지 않은 거부가 남는다. 보이는 것은 같다) | `lib/api/error.tsx:41-44` |
| 이메일 가입 제출 | ① `ga.event({ action: 'web_event_회원가입버튼클릭', event_category: 'web_event', event_label: '회원가입' })` ② 검사: 네 칸 가운데 하나라도 비면 `alert('모두 입력해주세요!')`, 비밀번호가 6~15자가 아니면 `alert('비밀번호는 6에서 15자로 입력해주세요!')` ③ `signUpByEmail('/front/v1/users/register', { user_id, email, password, name })` ④ `status_code === 200`이면 `alert('회원가입이 완료되셨습니다!')` 뒤 이메일 로그인 화면으로 | `:249-277` |
| 이메일 가입 실패 | 로그인 실패와 같다(창은 아무것도 하지 않는다) | `lib/api/error.tsx:45-52` |
| 입력란 | 로그인: 아이디(`name="user_id"`, "아이디 입력"), 비밀번호(`name="password"`, `type="password"`, "비밀번호 입력"). 가입: 이름(`name`, "이름 입력"), 아이디(`user_id`, "아이디 입력"), 이메일(`email`, "이메일 입력"), 비밀번호(`password`, "비밀번호 입력 (6~15자)") 순서 | `:204-222`, `:283-319` |
| 입력값 | 화면을 떠나면 비워진다(화면마다 따로 마운트된다). 다듬지 않는다(`trim` 없음) | `:163`, `:237` |

## Review Focus

테스트가 잡지 못하지만 사용자가 겪을 가능성이 큰 경우입니다. 각 줄의 확인은 괄호 안 작업의 확인 단계에 넣었습니다.

1. **로그인 확인이 끝나기 전의 헤더와 누름** — 서버가 그린 HTML과 첫 화면은 "확인 전"(빈 40px 자리)으로 같아야 하이드레이션 경고가 없다. 확인이 끝나면 로그인한 사람에게 "로그인" 버튼이 한 번도 보이지 않아야 한다. 그 사이 "관심 행사"를 누른 것은 버리지 않고 확인이 끝난 뒤 한 번만 처리한다(로그인 상태면 `/myevent`, 아니면 로그인 창). 카드의 관심 담기는 그 사이 누르면 아무 일도 없어야 한다(로그인 창도, 요청도). `/api/checkAuth`가 실패해도 확인은 끝난 것으로 쳐서 빈 자리가 남지 않는다. (작업 2)
2. **토큰이 만료·거부된 채 들어왔을 때** — `isChecked`·`isLoggedIn`은 쿠키가 있는지만 본다. 헤더가 프로필을 그리는 것만으로는 토큰 요청이 나가지 않아야 한다(나가면 모든 화면에서 "토큰이 만료되었습니다" 알림과 로그아웃이 일어난다). `lib/api/error.tsx`가 로그아웃시킨 뒤에도 헤더가 프로필로 남는 것은 지금과 같고 이 단계에서 고치지 않는다. (작업 2의 grep)
3. **창을 연 채 뒤로 가기·다른 화면으로 이동** — `Layout`은 페이지가 바뀌어도 남아 있어, 헤더가 연 로그인 창은 뒤로 가도 열려 있다(지금과 같다). 상세처럼 `Layout`을 직접 감싼 화면에서는 창과 함께 화면이 사라진다. 어느 쪽이든 **스크롤 잠금이 풀려야** 한다(언마운트될 때 `html`의 `overflow`를 되돌린다). 잠금은 `body`가 아니라 `html`에 건다(`pages/events.tsx:108-120`이 `body`의 `overflow`를 수시로 되돌린다). (작업 5)
4. **키보드** — 열리면 포커스는 창 자체(첫 버튼에 두면 눌린 것처럼 테두리가 생긴다. `app.js:407`). Tab은 닫기 → 카카오 → 이메일 → "다른 방법으로 로그인" → (펼쳤을 때 Google·네이버·GitHub) → "이메일로 가입" 순으로 창 안에서만 돈다. 접힌 묶음과 머리띠의 스티커에는 Tab이 멈추지 않는다. 화면이 바뀌면 포커스가 사라지지 않고 정해진 곳으로 간다(입력 화면은 첫 입력란, 처음 화면은 "이메일로 로그인", 펼치면 Google). Esc는 어느 화면에서든 창을 닫고, 닫히면 연 버튼으로 포커스가 돌아온다. 입력란에서 Enter를 누르면 제출된다. (작업 4, 작업 5)
5. **좁은 화면·낮은 화면·휴대폰 키보드** — 330·390·540·660px에서 버튼 글자가 줄바꿈되거나 잘리지 않고, 아래 링크 문장은 줄바꿈되어도 창 밖으로 나가지 않는다. 가입 화면(약 770px)은 낮은 창에서 위·아래가 잘리지 않고 오버레이가 스크롤된다(가운데 정렬을 `align-items: center`로 하면 위가 잘린다. `margin: auto`로 한다). iOS는 글자 크기가 16px보다 작은 입력란에 포커스가 가면 화면을 확대하므로 860px 이하에서 입력란은 16px이다. `100vh`를 쓰지 않는다. (작업 4, 작업 5)
6. **알림(`alert`) 뒤, 그리고 간편 로그인으로 나갔다 돌아왔을 때** — 오류 문구는 모두 `alert`라 길어도 창의 배치와 무관하다. 창 안에 오류 자리를 만들지 않았는지 본다. 간편 로그인 화면에서 뒤로 돌아오면 브라우저가 떠날 때의 화면을 되살릴 수 있다(창이 열린 채). 버튼을 막아 두었다면 막힌 채로 되살아나므로 **누른 뒤 버튼을 막지 않는다.** 간편 로그인이 끝나면 서버가 `/?accessToken=…`으로 보내고 `/events`가 새로 열린다(창은 닫혀 있고, 보던 화면으로 돌아가지는 않는다. 지금과 같다). (작업 5)

---

## 목업 주소

목업 서버는 `.claude/launch.json`의 `design-mockups`입니다. 아래 주소 앞에 `http://localhost:5177/detail-design/`를 붙입니다. 옵션은 `login.js:6`의 주석이 기준입니다.

| 목업 | 주소 | 실제 화면 |
|---|---|---|
| 처음 | `app.html?open=login#main` | 헤더의 "로그인" |
| 다른 방법을 펼친 모습 | `app.html?open=login&lgmore=1#main` | "다른 방법으로 로그인" 누름 |
| 이메일 로그인 | `app.html?open=login&lgview=email#main` | "이메일로 로그인" 누름 |
| 이메일 가입 | `app.html?open=login&lgview=join#main` | "이메일로 가입" 누름 |
| 어두운 화면 | 위 주소에 `&theme=dark` | 헤더의 테마 버튼 |

## 목업과 지금 코드가 다른 점

| 항목 | 지금 코드 | 목업 | 따른 쪽 |
|---|---|---|---|
| 로그인 방법 | 카카오·구글·네이버·github·아이디 로그인·회원가입 버튼 여섯 개가 한꺼번에 | 카카오·이메일이 먼저, Google·네이버·GitHub는 펼침, 가입은 글자 링크 | 방법은 같다(넷 + 이메일 + 가입). 배치는 목업 |
| 버튼 문구 | "구글 로그인", "github 로그인", "아이디 로그인", "회원가입" | "Google 계정으로 로그인", "GitHub 로그인", "이메일로 로그인", "이메일로 가입" | 목업 (카카오·네이버는 둘이 같다) |
| 제목 | 처음 "관심있는 개발자 행사를 내 이벤트에서 관리해보세요!", "로그인", "회원가입" | "로그인 · 회원가입" + "처음이어도 간편 로그인 한 번이면 가입까지 끝나요.", "이메일로 로그인", "이메일로 가입" | 목업 |
| 입력란의 `name` | `user_id`, `password`, `name`, `email` | `id`, `pw`, `name`, `email` | 지금 코드 (요청 본문의 키다) |
| 입력란의 종류·순서·placeholder | 위 "지금 동작" 표 | 같음 | 같음 |
| `autocomplete`, 이메일의 `type="email"` | 없음 | 있음 | 목업. `<form noValidate>`라 브라우저 검사는 돌지 않는다(검사 규칙은 그대로) |
| 제출 | 버튼을 눌러야만(입력란이 `form` 밖이라 Enter는 듣지 않는다) | `<form>` 제출(Enter도 듣는다) | 목업. 검사·요청은 같다 ("확인이 필요한 것" 2) |
| 검사·알림 문구 | `alert` 다섯 가지 | 없음(안내 문구만 뜸) | 지금 코드 |
| 로그인·가입의 성공·실패 뒤 | 위 "지금 동작" 표 | 없음 | 지금 코드 |
| 뒤로 | 왼쪽 위 화살표 버튼 → 처음 | "‹ 다른 방법으로" → 처음 | 목업 (가는 곳은 같다) |
| 로그인 입력 화면 → 가입 | 길 없음(처음으로 돌아가 "회원가입") | 아래 "이메일 계정이 없으신가요? 이메일로 가입" | 목업 (화면을 빼지 않고 길만 더한다) |
| 가입 화면 아래 | 없음 | "간편 로그인은 가입 없이 바로 시작할 수 있어요. 간편 로그인으로" → 처음 | 목업 |
| 다시 열었을 때 | ×로 닫으면 처음 화면, Esc·바깥으로 닫으면 보던 화면(입력값은 비어 있음) | 늘 처음 화면, 접힌 채 | 목업 |
| 닫기 버튼의 이름 | 없음(아이콘만) | `aria-label="로그인 창 닫기"` | 목업 |
| 카카오 로고 | `kakao.svg`(말풍선 `#3c1e1e`) | 다시 그린 말풍선(`#191919`) | 지금 파일 |
| 네이버 로고 | `naver.svg`(PNG가 박힌 16×15 SVG. 녹색 둥근 네모 안의 흰 N) | 흰 N만(16px) | 지금 파일 ("확인이 필요한 것" 3) |
| Google·GitHub 로고 | `google.svg`, `github.svg`(흰색) | 같은 그림 | 지금 파일 |
| 메일 아이콘 | `email.svg`(`#D8D8D8`. 옛 어두운 유리 창에 맞춘 색) | 선으로 그린 봉투(`currentColor`) | 목업의 그림을 `TimelineIcon`에 `mail`로 더한다(흰 버튼 위에서 `#D8D8D8`은 보이지 않는다. 소셜 로고가 아니다) |
| 버튼 색 | 카카오 글자 `#3c1e1e`, 구글 흰 바탕, 깃허브 `#24292e` | Global Constraints의 표 | 목업·받은 결정 |
| 입력란 글자 크기 | 16px | 15px | PC 15px, 860px 이하 16px (Review Focus 5) |
| GA 이벤트 세 가지 | 있음 | 없음 | 지금 코드 |
| 애플 로그인 | 주석 처리되어 있음 | 없음 | 옮기지 않는다 |
| 약관·개인정보 안내, 계정 찾기 | 없음 | 없음 | 넣지 않는다 |

---

## File Structure

**새로 만드는 파일** — 모두 `components/common/modal/login/`

- `loginFlow.ts`, `__tests__/loginFlow.test.ts` — 검사 규칙, 화면 전환, 포커스가 갈 곳, 간편 로그인의 순서·문구·주소
- `LoginButton.tsx`, `LoginButton.module.scss` — 버튼 일곱 가지 모양
- `LoginBand.tsx`, `LoginBand.module.scss` — 홀로그램 머리띠
- `LoginMain.tsx`, `LoginForms.tsx`, `LoginPanel.module.scss` — 처음 화면, 이메일 로그인·가입 입력 화면, 세 화면이 함께 쓰는 스타일
- `LoginPanel.tsx` — 화면 상태, 포커스, 요청·알림·이동

**고치는 파일**

- `context/auth.tsx`, `components/layout/header/Header.tsx`, `Header.module.scss`, `lib/hooks/useFavorite.tsx` (작업 2)
- `components/events/timeline/TimelineIcon.tsx` — `mail` 하나 추가 (작업 3)
- `components/common/modal/LoginModal.tsx`, `LoginModal.module.scss` — 내용을 통째로 바꾼다 (작업 5)

| 작업 | 하는 일 | 고치는 기존 파일 |
|---|---|---|
| 1 | 검사 규칙·화면 전환·간편 로그인 주소 (순수 함수) | — |
| 2 | 로그인 상태 확인: `AuthContext.isChecked`, 헤더의 빈 자리, "관심 행사"·관심 담기 누름 | `context/auth.tsx`, `Header.tsx`, `Header.module.scss`, `useFavorite.tsx` |
| 3 | 버튼, 홀로그램 머리띠 | `TimelineIcon.tsx` |
| 4 | 세 화면(처음 / 이메일 로그인 / 이메일 가입) | — |
| 5 | 조립, `LoginModal` 바꾸기 | `LoginModal.tsx`, `LoginModal.module.scss` |
| 6 | 전체 확인 (`pnpm build` 한 번) | — |

작업 1·3·4가 끝난 상태에서는 로그인 창이 예전 그대로입니다(새 부품은 아직 걸리지 않습니다). 작업 2는 헤더만 바꿉니다. 작업 5 뒤에 로그인 창이 새 모양입니다. **작업 3은 2단계(스티커)가 끝나 있어야 합니다.**

---

### Task 1: 검사 규칙 · 화면 전환 · 간편 로그인 주소 (순수 함수)

기준: 검사 규칙은 `LoginModal.tsx:165-175`, `:249-261`. 화면 전환과 포커스는 `app.js:421-424`. 간편 로그인의 순서·문구는 `login.js:23-27`, 주소는 `LoginModal.tsx:82`.

**Files:**
- Create: `components/common/modal/login/loginFlow.ts`
- Create: `components/common/modal/login/__tests__/loginFlow.test.ts`

**Interfaces:**
- Consumes: `AuthProp`·`SignUpProps`(`model/auth.ts`. 고치지 않는다)
- Produces:

```ts
export type LoginView = 'main' | 'email' | 'join';
export interface LoginState {
  view: LoginView;
  moreOpen: boolean;          // "다른 방법으로 로그인"이 펼쳐져 있는지
}
export type LoginAction = 'openEmail' | 'openJoin' | 'back' | 'toggleMore' | 'joined';
export type LoginFocus = 'emailFirstInput' | 'joinFirstInput' | 'emailButton' | 'moreFirstButton' | null;

export const INITIAL_LOGIN_STATE: LoginState;   // { view: 'main', moreOpen: false }
export const nextLoginState: (state: LoginState, action: LoginAction) => LoginState;
export const focusAfter: (action: LoginAction, next: LoginState) => LoginFocus;

export const loginError: (fields: AuthProp) => string | null;      // 알림 문구. 통과하면 null
export const signUpError: (fields: SignUpProps) => string | null;

export type SocialType = 'kakao' | 'google' | 'naver' | 'github';
export const SOCIAL_PRIMARY: SocialType;                 // 'kakao'
export const SOCIAL_MORE: readonly SocialType[];         // ['google', 'naver', 'github']
export const SOCIAL_LABEL: Record<SocialType, string>;
export const socialLoginUrl: (baseUrl: string | undefined, type: SocialType) => string;
```

**테스트·시그니처만으로 정해지지 않는 규칙**

- `nextLoginState`는 받은 객체를 고치지 않고 새 객체를 돌려준다. `joined`는 어느 화면에서 불려도 `email`이다.
- `socialLoginUrl`은 `process.env`를 읽지 않는다. 부르는 쪽이 `process.env.BASE_SERVER_URL`을 **글자 그대로** 적어 넘긴다(빌드가 그 글자를 값으로 바꿔 넣는다. 변수에 담아 `process.env[key]`로 읽으면 바뀌지 않는다).
- 검사 함수는 `alert`를 부르지 않는다(문구만 돌려준다).

- [ ] **Step 1: 실패하는 테스트를 쓴다** — `components/common/modal/login/__tests__/loginFlow.test.ts`

```ts
import {
  focusAfter,
  INITIAL_LOGIN_STATE,
  loginError,
  LoginState,
  nextLoginState,
  signUpError,
  SOCIAL_LABEL,
  SOCIAL_MORE,
  SOCIAL_PRIMARY,
  socialLoginUrl,
} from 'components/common/modal/login/loginFlow';

const MAIN: LoginState = { view: 'main', moreOpen: false };
const MAIN_OPEN: LoginState = { view: 'main', moreOpen: true };
const EMAIL: LoginState = { view: 'email', moreOpen: false };
const JOIN: LoginState = { view: 'join', moreOpen: false };

// 지금 코드(LoginModal.tsx)의 알림 문구 그대로
const NO_ID = '아이디를 입력해주세요!';
const NO_PW = '비밀번호를 입력해주세요!';
const NOT_ALL = '모두 입력해주세요!';
const PW_LENGTH = '비밀번호는 6에서 15자로 입력해주세요!';

describe('화면 전환', () => {
  it('처음에는 처음 화면이고 다른 방법은 접혀 있다', () => {
    expect(INITIAL_LOGIN_STATE).toEqual(MAIN);
  });

  it('"이메일로 로그인"은 로그인 입력 화면으로 간다', () => {
    expect(nextLoginState(MAIN, 'openEmail')).toEqual(EMAIL);
  });

  it('"이메일로 가입"은 처음 화면과 로그인 입력 화면에서 가입 화면으로 간다', () => {
    expect(nextLoginState(MAIN, 'openJoin')).toEqual(JOIN);
    expect(nextLoginState(EMAIL, 'openJoin')).toEqual(JOIN);
  });

  it('"다른 방법으로"·"간편 로그인으로"는 처음 화면으로 돌아간다', () => {
    expect(nextLoginState(EMAIL, 'back')).toEqual(MAIN);
    expect(nextLoginState(JOIN, 'back')).toEqual(MAIN);
  });

  it('가입이 끝나면 로그인 입력 화면으로 간다 (지금 코드와 같다)', () => {
    expect(nextLoginState(JOIN, 'joined')).toEqual(EMAIL);
  });

  it('"다른 방법으로 로그인"은 누를 때마다 펼치고 접는다', () => {
    expect(nextLoginState(MAIN, 'toggleMore')).toEqual(MAIN_OPEN);
    expect(nextLoginState(MAIN_OPEN, 'toggleMore')).toEqual(MAIN);
  });

  it('펼친 채로 입력 화면에 다녀와도 펼쳐져 있다', () => {
    const email = nextLoginState(MAIN_OPEN, 'openEmail');
    expect(email).toEqual({ view: 'email', moreOpen: true });
    expect(nextLoginState(email, 'back')).toEqual(MAIN_OPEN);
  });

  it('입력 화면에서는 펼치기가 듣지 않는다', () => {
    expect(nextLoginState(EMAIL, 'toggleMore')).toEqual(EMAIL);
    expect(nextLoginState(JOIN, 'toggleMore')).toEqual(JOIN);
  });

  it('넘겨받은 상태를 고치지 않는다', () => {
    const before: LoginState = { view: 'main', moreOpen: false };
    nextLoginState(before, 'toggleMore');
    nextLoginState(before, 'openEmail');
    expect(before).toEqual({ view: 'main', moreOpen: false });
  });
});

describe('화면이 바뀐 뒤 포커스가 갈 곳', () => {
  it('입력 화면으로 가면 첫 입력란', () => {
    expect(focusAfter('openEmail', EMAIL)).toBe('emailFirstInput');
    expect(focusAfter('joined', EMAIL)).toBe('emailFirstInput');
    expect(focusAfter('openJoin', JOIN)).toBe('joinFirstInput');
  });

  it('처음 화면으로 돌아오면 "이메일로 로그인" 버튼', () => {
    expect(focusAfter('back', MAIN)).toBe('emailButton');
  });

  it('펼치면 펼쳐진 첫 버튼, 접으면 옮기지 않는다', () => {
    expect(focusAfter('toggleMore', MAIN_OPEN)).toBe('moreFirstButton');
    expect(focusAfter('toggleMore', MAIN)).toBeNull();
  });
});

describe('이메일 로그인 검사', () => {
  it('아이디가 비면 아이디 문구가 먼저다', () => {
    expect(loginError({ user_id: '', password: '' })).toBe(NO_ID);
    expect(loginError({ user_id: '', password: 'abcdef' })).toBe(NO_ID);
  });

  it('비밀번호가 비면 비밀번호 문구', () => {
    expect(loginError({ user_id: 'dev', password: '' })).toBe(NO_PW);
  });

  it('둘 다 있으면 통과한다 (길이와 공백은 보지 않는다)', () => {
    expect(loginError({ user_id: 'dev', password: '1' })).toBeNull();
    expect(loginError({ user_id: ' ', password: ' ' })).toBeNull();
  });
});

describe('이메일 가입 검사', () => {
  const ok = {
    name: '홍길동',
    user_id: 'dev',
    email: 'dev@example.com',
    password: 'abcdef',
  };

  it('네 칸이 다 차고 비밀번호가 6~15자면 통과한다', () => {
    expect(signUpError(ok)).toBeNull();
    expect(signUpError({ ...ok, password: 'a'.repeat(15) })).toBeNull();
  });

  it('하나라도 비면 "모두 입력해주세요!"', () => {
    expect(signUpError({ ...ok, name: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, user_id: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, email: '' })).toBe(NOT_ALL);
    expect(signUpError({ ...ok, password: '' })).toBe(NOT_ALL);
  });

  it('빈 칸 문구가 길이 문구보다 먼저다', () => {
    expect(signUpError({ ...ok, name: '', password: 'abc' })).toBe(NOT_ALL);
  });

  it('비밀번호가 5자 이하이거나 16자 이상이면 길이 문구', () => {
    expect(signUpError({ ...ok, password: 'abcde' })).toBe(PW_LENGTH);
    expect(signUpError({ ...ok, password: 'a'.repeat(16) })).toBe(PW_LENGTH);
  });

  it('이메일 형식과 공백은 보지 않는다', () => {
    expect(signUpError({ ...ok, email: 'not-an-email' })).toBeNull();
    expect(signUpError({ ...ok, name: ' ' })).toBeNull();
  });
});

describe('간편 로그인', () => {
  it('카카오가 먼저 보이고 나머지 셋은 펼친 묶음에 이 순서로 있다', () => {
    expect(SOCIAL_PRIMARY).toBe('kakao');
    expect(SOCIAL_MORE).toEqual(['google', 'naver', 'github']);
  });

  it('버튼 문구는 목업과 같다', () => {
    expect(SOCIAL_LABEL).toEqual({
      kakao: '카카오 로그인',
      google: 'Google 계정으로 로그인',
      naver: '네이버 로그인',
      github: 'GitHub 로그인',
    });
  });

  it('보내는 주소는 지금 코드와 같다', () => {
    const base = 'https://api.example.com';
    expect(socialLoginUrl(base, 'kakao')).toBe(`${base}/auth/login/kakao`);
    expect(socialLoginUrl(base, 'google')).toBe(`${base}/auth/login/google`);
    expect(socialLoginUrl(base, 'naver')).toBe(`${base}/auth/login/naver`);
    expect(socialLoginUrl(base, 'github')).toBe(`${base}/auth/login/github`);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `pnpm test -- loginFlow`
Expected: FAIL (모듈을 찾을 수 없음)

- [ ] **Step 3: `loginFlow.ts`를 구현한다.** React·`next/router`·`window`를 불러오지 않는다.

- [ ] **Step 4: 확인**

Run: `pnpm test -- loginFlow && npx tsc --noEmit && npx eslint components/common/modal/login/loginFlow.ts components/common/modal/login/__tests__/loginFlow.test.ts`
Expected: PASS (23개), 타입·린트 오류 없음

관리자가 화면에서 볼 것: 없음.

---

### Task 2: 로그인 상태 확인 — `AuthContext` · 헤더 · 관심 담기

지금: `context/auth.tsx:18`의 처음 값이 `false`라 서버가 그린 헤더와 첫 화면에 "로그인" 버튼이 그려지고, `/api/checkAuth` 응답이 온 뒤 프로필 버튼으로 바뀐다. 그 사이 헤더의 "관심 행사"(`Header.tsx:57-63`)와 카드의 관심 담기(`useFavorite.tsx:51-54`)는 로그인한 사람에게도 로그인 창을 연다.

**Files:**
- Modify: `context/auth.tsx`
- Modify: `components/layout/header/Header.tsx`, `components/layout/header/Header.module.scss`
- Modify: `lib/hooks/useFavorite.tsx`

**Interfaces:**
- Produces:

```ts
// context/auth.tsx
interface AuthContext {
  isLoggedIn: boolean;
  isChecked: boolean;        // 로그인 상태 확인이 끝났는지. 처음 값 false, 한 번 true가 되면 돌아가지 않는다
  login: () => void;
  logout: () => Promise<void>;
}
```

**규칙**

- `isChecked`가 `true`가 되는 때는 둘뿐이다: `/api/checkAuth` 확인이 끝났을 때(응답이 정상이든 아니든, 예외가 나든. `finally`), 그리고 `login()`이 불렸을 때(`pages/myevent.tsx`·`pages/myinfo.tsx`는 서버가 쿠키를 보고 `login()`을 부른다). `logout()`과 `isLoggedIn`을 정하는 지금 코드는 건드리지 않는다. `defaultValue`에도 `isChecked: false`를 넣는다.
- **헤더의 오른쪽 자리**: `isChecked`가 `false`면 `<span className={cn('auth-slot')} aria-hidden="true" />`(40×40px, `flex: none`), `true`면 지금처럼 `isLoggedIn ? <Profile /> : <Login … />`. `Profile`·`Login`은 고치지 않는다.
- **헤더의 "관심 행사"**: `isChecked`가 `false`인 동안에는 지금의 버튼 마크업 그대로 그린다(서버가 그린 것과 같다). 누르면 로그인 창을 열지 않고 "눌렀다"는 것만 `ref`에 적는다. `isChecked`가 `true`가 된 뒤의 `useEffect`에서 적어 둔 것이 있으면 **한 번만** 처리하고 지운다: 로그인 상태면 `router.push('/myevent')`, 아니면 `setLoginModalIsOpen(true)`. `isChecked`가 `true`인 뒤의 동작은 지금과 같다.
- **관심 담기(`useFavorite`)**: `latest.current`에 `isChecked`를 더하고, `toggleFavorite`의 맨 앞에서 `isChecked`가 `false`면 아무것도 하지 않고 끝낸다(확인 전에는 담아 둔 행사도 빈 하트로 보여, 누른 뜻을 알 수 없다). 그 밖의 줄은 고치지 않는다. 돌려주는 값의 모양도 그대로다.
- `components/common/item/List.tsx`(옛 목록)에는 넣지 않는다.
- `Header.module.scss`에는 `.auth-slot` 하나만 더한다.

- [ ] **Step 1: `context/auth.tsx`에 `isChecked`를 더한다.**
- [ ] **Step 2: `Header.tsx`·`Header.module.scss`를 고친다.**
- [ ] **Step 3: `useFavorite.tsx`를 고친다.**
- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/layout/header/Header.tsx && npx eslint lib/hooks/useFavorite.tsx && npx eslint context/auth.tsx`
Expected: 타입 오류 없음, 테스트 통과. `Header.tsx`·`useFavorite.tsx`는 린트 오류 없음. `context/auth.tsx`는 전과 같은 오류 4개(빈 함수 2, 포맷 2)뿐.

Run: SCSS 확인 — `components/layout/header/Header.module.scss`
Expected: `ok`

Run: `grep -n "useUser\|users/profile\|useSWR" context/auth.tsx components/layout/header/Header.tsx components/layout/header/Profile.tsx components/features/login/Login.tsx`
Expected: 결과 없음 (Review Focus 2)

Run: `grep -n "<LoginModal" -A 3 components/layout/header/Header.tsx`
Expected: `isOpen={loginModalIsOpen}`, `onClose={() => setLoginModalIsOpen(false)}` 그대로

관리자가 화면에서 볼 것 (Review Focus 1):
1. 로그인한 상태로 새로 고치면 "로그인" 버튼이 잠깐이라도 보이지 않고, 빈 자리 뒤에 프로필 버튼이 나온다. 콘솔에 하이드레이션 경고가 없다.
2. 로그인하지 않은 상태로 새로 고치면 빈 자리 뒤에 "로그인"이 나온다(40px에서 버튼 폭으로 한 번 넓어진다. "확인이 필요한 것" 5).
3. 느린 연결로 두고(개발자 도구) 로그인한 상태에서 새로 고친 직후 "관심 행사"를 누르면 로그인 창이 뜨지 않고, 확인이 끝난 뒤 `/myevent`로 간다. 로그인하지 않은 상태면 확인이 끝난 뒤 로그인 창이 한 번 뜬다.
4. 같은 조건에서 카드의 관심 담기를 누르면 아무 일도 없다.

---

### Task 3: 버튼 · 홀로그램 머리띠

목업 기준: 버튼 `login.css:18-33`, `:148`(520px 이하), 문구와 아이콘 `login.js:10-19`, `:23-30`. 머리띠 `login.css:54-55`, `:149`, `login.js:65`.

**Files:**
- Create: `components/common/modal/login/LoginButton.tsx`, `LoginButton.module.scss`
- Create: `components/common/modal/login/LoginBand.tsx`, `LoginBand.module.scss`
- Modify: `components/events/timeline/TimelineIcon.tsx` (`mail` 추가만)

**Interfaces:**
- Consumes (2단계. 이 모양이 확정이다):
  - `components/common/sticker/Sticker.tsx` — `export type StickerPlacement = { name: StickerName; x: number; y: number; rotate: number; scale: number; side?: 'left' | 'right' }`, `export default function Sticker(props: StickerPlacement & { className?: string })`. 절대 위치로 놓인다(부모가 `position: relative`). `aria-hidden`은 감싸는 쪽이 붙인다.
  - `components/common/sticker/stickerSets.ts` — `export const LOGIN_BAND: StickerPlacement[]`(목업 `login.js:65`의 여섯 장)
- Consumes: 믹스인 `de-button-reset`·`de-focus-ring`·`de-reduced-motion`
- Produces:

```ts
// LoginButton.tsx
export type LoginButtonVariant = 'kakao' | 'email' | 'google' | 'naver' | 'github' | 'more' | 'go';
interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: LoginButtonVariant;
}
const LoginButton: React.ForwardRefExoticComponent<
  LoginButtonProps & React.RefAttributes<HTMLButtonElement>
>;   // type의 기본값은 'button'. className은 자기 클래스 뒤에 붙인다. 내용(아이콘·글자)은 children

// LoginBand.tsx
function LoginBand(): JSX.Element;   // <div class="band" aria-hidden="true"> 안에 LOGIN_BAND를 순서대로 <Sticker />

// TimelineIcon.tsx — IconName에 'mail' 추가
//   <rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="M4.5 8l7.5 5 7.5-5" />   (login.js:15)
```

**값**

| 부분 | 값 | 520px 이하 |
|---|---|---|
| 버튼 공통 | `de-button-reset`, `de-focus-ring`, `position: relative; width: 100%; height: 52px; margin-top: 10px; padding: 0 18px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 9px; font-size: 15.5px; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap; transition: transform 0.12s, filter 0.12s, background 0.12s;` 누르는 동안 `transform: scale(0.985)`. 안의 아이콘은 `flex: none` | `height: 50px; font-size: 15px` |
| `kakao`·`google`·`naver`·`github` | Global Constraints의 색 표. `github`의 어두운 화면 테두리는 `:global(html[data-theme='dark']) &` | 같음 |
| `email` | `background: var(--de-bg); color: var(--de-ink); box-shadow: inset 0 0 0 1.5px var(--de-line);` 올리면 `background: var(--de-hover)` | 같음 |
| `more` | `height: 44px; margin-top: 12px; background: none; color: var(--de-hint); font-size: 14.5px; font-weight: 600;` 올리면 `color: var(--de-ink)`. `aria-expanded="true"`일 때 안의 화살표가 뒤집힌다(아래) | `height: 50px; font-size: 15px` (공통 값이 이긴다) |
| `go` | `background: var(--de-ink); color: var(--de-bg); margin-top: 18px;` 올리면 `opacity: 0.9` | 같음 |
| 머리띠(`.band`) | `position: relative; height: 138px; margin-bottom: 26px; overflow: hidden;` 바탕은 Global Constraints의 값 | `height: 118px; margin-bottom: 22px` |

- 움직임 줄이기 설정에서는 버튼의 `transition`과 누르는 동안의 `transform`을 끈다.
- 머리띠는 좌우 음수 여백을 쓰지 않는다. 창(`.card`)에 좌우 여백을 두지 않고 본문만 여백을 갖게 해서(작업 5) 머리띠가 창 폭을 다 채운다. 목업(`margin: 0 -40px 26px`)과 보이는 것은 같다.
- 스티커의 위치·회전·크기는 `Sticker`가 한다. `LoginBand`는 `key`(순번)만 준다. `StickerDefs`를 넣지 않는다.
- 2단계가 끝나지 않아 `Sticker.tsx`·`stickerSets.ts`의 `LOGIN_BAND`가 없으면 **이 작업을 멈추고 관리자에게 알린다.** 스티커 없는 머리띠를 임시로 만들지 않는다.

- [ ] **Step 1: 2단계의 결과가 있는지 본다**

Run: `ls components/common/sticker/Sticker.tsx components/common/sticker/stickerSets.ts && grep -n "LOGIN_BAND" components/common/sticker/stickerSets.ts && grep -n "StickerDefs" components/layout/index.tsx`
Expected: 두 파일이 있고, `LOGIN_BAND`와 `StickerDefs`가 나온다. 없으면 멈춘다.

- [ ] **Step 2: `TimelineIcon`에 `mail`을 더한다.** 다른 아이콘과 기본값은 고치지 않는다.
- [ ] **Step 3: `LoginButton`을 만든다.**
- [ ] **Step 4: `LoginBand`를 만든다.**
- [ ] **Step 5: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/modal/login/LoginButton.tsx && npx eslint components/common/modal/login/LoginBand.tsx && npx eslint components/events/timeline/TimelineIcon.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/common/modal/login/LoginButton.module.scss components/common/modal/login/LoginBand.module.scss`
Expected: 모두 `ok`

관리자가 화면에서 볼 것: 작업 5 뒤에 함께.

---

### Task 4: 세 화면 — 처음 / 이메일 로그인 / 이메일 가입

목업 기준: 문구와 구조 `login.js:23-52`, `:64`. 스타일 `login.css:13-15`(제목·안내문·첫 버튼), `:24-26`·`:35-36`(펼침), `:37-39`(아래 링크), `:41`(화면이 바뀔 때), `:42-48`(뒤로·입력란), `:57-58`(`l2`의 제목·뒤로), `:142`, `:148`.

**Files:**
- Create: `components/common/modal/login/LoginMain.tsx`
- Create: `components/common/modal/login/LoginForms.tsx`
- Create: `components/common/modal/login/LoginPanel.module.scss` (두 파일이 함께 쓴다. `Header.module.scss`를 `Login.tsx`·`Profile.tsx`가 함께 쓰는 것과 같은 방식)

**Interfaces:**
- Consumes: `LoginButton`(Task 3), `TimelineIcon`(`mail`·`back`·`chevron`), `SocialType`·`SOCIAL_PRIMARY`·`SOCIAL_MORE`·`SOCIAL_LABEL`(Task 1), `AuthProp`·`SignUpProps`(`model/auth.ts`), 로고 넷(`public/icon/*.svg`)
- Produces:

```ts
// LoginMain.tsx
function LoginMain(props: {
  moreOpen: boolean;
  onSocial: (type: SocialType) => void;
  onEmail: () => void;
  onToggleMore: () => void;
  onJoin: () => void;
  emailButtonRef: React.RefObject<HTMLButtonElement>;   // "이메일로 로그인"
  moreFirstRef: React.RefObject<HTMLButtonElement>;     // 펼친 묶음의 첫 버튼(Google)
}): JSX.Element;

// LoginForms.tsx
export function LoginEmailForm(props: {
  onSubmit: (fields: AuthProp) => void;
  onBack: () => void;
  onJoin: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}): JSX.Element;
export function LoginJoinForm(props: {
  onSubmit: (fields: SignUpProps) => void;
  onBack: () => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}): JSX.Element;
```

**마크업**

```
LoginMain
<div class="main">
  <h2 class="title">로그인 · 회원가입</h2>
  <p class="hint">처음이어도 간편 로그인 한 번이면 가입까지 끝나요.</p>
  <LoginButton variant="kakao" class="first"><KakaoIcon 20×20 /><span>카카오 로그인</span></LoginButton>
  <LoginButton variant="email" ref={emailButtonRef}><TimelineIcon mail 20 /><span>이메일로 로그인</span></LoginButton>
  <LoginButton variant="more" aria-expanded={moreOpen} aria-controls="login-more">
    <span>다른 방법으로 로그인</span><TimelineIcon chevron 16 class="chev" /></LoginButton>
  <div id="login-more" class="more" hidden={!moreOpen}>
    <LoginButton variant="google" class="moreFirst" ref={moreFirstRef}><GoogleIcon 20×20 /><span>Google 계정으로 로그인</span></LoginButton>
    <LoginButton variant="naver"><NaverIcon 20×19 /><span>네이버 로그인</span></LoginButton>
    <LoginButton variant="github"><GithubIcon 20×20 /><span>GitHub 로그인</span></LoginButton>
  </div>
  <p class="foot">이메일 계정이 필요하면 <button type="button" class="link">이메일로 가입</button></p>
</div>

LoginEmailForm / LoginJoinForm
<div class="pane">
  <button type="button" class="back"><TimelineIcon back 20 /><span>다른 방법으로</span></button>
  <h2 class="title">이메일로 로그인</h2>                          ← 가입은 "이메일로 가입"
  <form class="form" noValidate onSubmit>
    <label class="field"><span class="label">아이디</span><input class="input" … /></label>  ← 입력란은 아래 표
    <LoginButton variant="go" type="submit">로그인</LoginButton>   ← 가입은 "가입하기"
  </form>
  <p class="foot">이메일 계정이 없으신가요? <button type="button" class="link">이메일로 가입</button></p>
       ← 가입은 "간편 로그인은 가입 없이 바로 시작할 수 있어요. <button>간편 로그인으로</button>" (onBack)
</div>
```

| 화면 | 입력란 (순서대로. `name` · `type` · `autoComplete` · placeholder) |
|---|---|
| 이메일 로그인 | 아이디: `user_id` · `text` · `username` · "아이디 입력" / 비밀번호: `password` · `password` · `current-password` · "비밀번호 입력" |
| 이메일 가입 | 이름: `name` · `text` · `name` · "이름 입력" / 아이디: `user_id` · `text` · `username` · "아이디 입력" / 이메일: `email` · `email` · `email` · "이메일 입력" / 비밀번호: `password` · `password` · `new-password` · "비밀번호 입력 (6~15자)" |

**동작**

- 두 파일은 **요청·알림·이동·GA를 하지 않는다.** 누름과 제출을 props로 올리기만 한다(작업 5의 `LoginPanel`이 한다).
- 입력값은 각 입력 화면이 `useState`로 든다(지금 코드의 `onChangeInput`과 같은 방식: `name`으로 칸을 가린다). 다듬지 않는다. 제출하면 `event.preventDefault()` 뒤 `onSubmit(fields)`.
- 간편 로그인 버튼은 `SOCIAL_PRIMARY`·`SOCIAL_MORE`의 순서와 `SOCIAL_LABEL`의 문구로 그린다(문구를 다시 적지 않는다). 누르면 `onSocial(type)`.
- 접힌 묶음은 지우지 않고 `hidden`을 붙인다(`aria-controls`가 가리킬 요소가 남아 있어야 한다). `.more[hidden] { display: none; }`을 꼭 적는다(클래스가 `display`를 정하면 `hidden`이 듣지 않는다).
- 화살표는 `TimelineIcon`의 `chevron`(오른쪽 방향)을 돌려 쓴다: 접혔을 때 `rotate(90deg)`, `aria-expanded="true"`일 때 `rotate(-90deg)`, `transition: transform 0.2s`.
- 첫 입력란에 `firstInputRef`, "이메일로 로그인"에 `emailButtonRef`, Google에 `moreFirstRef`를 건다.

**값**

| 부분 | 값 | 520px 이하 |
|---|---|---|
| 제목(`.title`) | `margin: 0; font-size: 25px; line-height: 1.34; font-weight: 800; letter-spacing: -0.025em;` | `font-size: 22px` |
| 안내문(`.hint`) | `margin: 8px 0 0; font-size: 14.5px; line-height: 1.55; color: var(--de-sub);` | `font-size: 14px` |
| 첫 버튼 | `.main .first { margin-top: 26px; }` | 같음 |
| 펼친 묶음(`.more`) | `animation: open 0.22s ease-out;` (`from { opacity: 0; transform: translateY(-6px); }`). `.more .moreFirst { margin-top: 4px; }` | 같음 |
| 아래 문장(`.foot`) | `margin: 22px 0 0; font-size: 14px; line-height: 1.6; color: var(--de-hint);` | 같음 |
| 글자 링크(`.link`) | `de-button-reset`, `de-focus-ring`, `margin-left: 4px; font-weight: 700; color: var(--de-ink); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--de-faint);` | 같음 |
| 입력 화면(`.pane`) | `animation: open 0.2s ease-out;` 내용은 가운데 정렬(창에서 물려받는다) | 같음 |
| 뒤로(`.back`) | `de-button-reset`, `de-focus-ring`, `display: flex; align-items: center; gap: 2px; height: 40px; margin: -12px 0 4px -12px; padding: 0 12px 0 8px; border-radius: 20px; font-size: 13.5px; font-weight: 600; color: var(--de-hint);` 올리면 `background: var(--de-surface); color: var(--de-ink);` 왼쪽에 붙고 제목은 그 아랫줄 가운데(`.pane .title { padding-top: 6px; }`) | 같음 |
| 입력란 묶음(`.form`) | `margin-top: 22px; text-align: left; display: grid; gap: 12px;` | 같음 |
| 입력란 이름(`.label`) | `display: block; margin-bottom: 6px; font-size: 13px; font-weight: 700; color: var(--de-sub);` | 같음 |
| 입력란(`.input`) | `width: 100%; height: 50px; padding: 0 15px; border: 0; border-radius: 13px; outline: 0; background: var(--de-surface); box-shadow: inset 0 0 0 1.5px transparent; font: inherit; font-size: 15px; color: var(--de-ink); transition: box-shadow 0.12s;` placeholder `var(--de-hint)`. 포커스 `box-shadow: inset 0 0 0 2px var(--de-ink); background: var(--de-bg);` **860px 이하(`de-mobile`)에서 `font-size: 16px`** | 같음 |

- 움직임 줄이기 설정에서는 `.more`·`.pane`의 animation과 화살표·입력란의 transition을 끈다.
- `@keyframes`는 이 파일 안에 둔다(모듈 밖의 것은 부를 수 없다).

- [ ] **Step 1: `LoginPanel.module.scss`와 `LoginMain.tsx`를 만든다.**
- [ ] **Step 2: `LoginForms.tsx`를 만든다.**
- [ ] **Step 3: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/modal/login/LoginMain.tsx && npx eslint components/common/modal/login/LoginForms.tsx`
Expected: 오류 없음

Run: SCSS 확인 — `components/common/modal/login/LoginPanel.module.scss`
Expected: `ok`

Run: `grep -n "alert(\|router\|ga\.\|loginByEmail\|signUpByEmail\|process.env" components/common/modal/login/LoginMain.tsx components/common/modal/login/LoginForms.tsx`
Expected: 결과 없음 (요청과 알림은 작업 5에만 있다)

Run: `grep -n 'name="' components/common/modal/login/LoginForms.tsx`
Expected: `user_id`, `password`, `name`, `user_id`, `email`, `password` 순서 (TimelineIcon의 `name="back"`·`name="mail"`은 다른 속성이다)

관리자가 화면에서 볼 것: 작업 5 뒤에 함께.

---

### Task 5: 조립 · `LoginModal` 바꾸기

목업 기준: 창과 오버레이 `login.css:4-11`, `:53`, `:56`, `:142`, `:146-147`. 열기·닫기 `app.js:402-414`, `:418`(바깥 누름), `:550`(Esc). `react-modal`을 쓰는 방식은 `components/events/detail/Lightbox.tsx`·`Lightbox.module.scss`.

**Files:**
- Create: `components/common/modal/login/LoginPanel.tsx`
- Modify: `components/common/modal/LoginModal.tsx` (내용을 통째로 바꾼다. 경로와 기본 내보내기는 그대로)
- Modify: `components/common/modal/LoginModal.module.scss` (내용을 통째로 바꾼다)

**Interfaces:**
- Consumes: `LoginMain`·`LoginEmailForm`·`LoginJoinForm`(Task 4), `LoginBand`(Task 3), `INITIAL_LOGIN_STATE`·`nextLoginState`·`focusAfter`·`loginError`·`signUpError`·`socialLoginUrl`(Task 1), `loginByEmail`·`signUpByEmail`(`lib/api/post.tsx`. 고치지 않는다), `lib/utils/gTag`, `next/router`, `TimelineIcon`(`x`)
- Produces:

```ts
// LoginPanel.tsx
function LoginPanel(props: { onClose: () => void }): JSX.Element;

// LoginModal.tsx — props는 지금과 같다(지금은 any로 적혀 있다)
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}
function LoginModal(props: LoginModalProps): JSX.Element;
export default LoginModal;
```

**마크업 (`LoginModal`)**

```
<Modal isOpen onRequestClose={onClose} className="card" overlayClassName="overlay"
       contentLabel="로그인 · 회원가입">
  <LoginBand />
  <button type="button" class="close" aria-label="로그인 창 닫기"><TimelineIcon x 20 /></button>
  <div class="body"><LoginPanel onClose={onClose} /></div>
</Modal>
```

**동작**

- `react-modal`의 기본 동작을 그대로 쓴다: 열리면 창(`.card`)에 포커스, Tab은 창 안에서 돌고, Esc와 바깥(오버레이) 누름은 `onRequestClose`, 닫히면 연 요소로 포커스가 돌아온다. `closeTimeoutMS`를 주지 않는다(닫힐 때의 움직임은 없다. `Lightbox`와 같다).
- 열려 있는 동안 `document.documentElement.style.overflow`를 `hidden`으로 두고, 닫히거나 언마운트되면 앞의 값으로 되돌린다(`Lightbox.tsx:25-33`과 같은 방식. Review Focus 3).
- **`LoginPanel`은 `<Modal>` 안에서만 마운트된다.** 그래서 창을 열 때마다 처음 화면·접힌 상태·빈 입력란으로 시작한다. `LoginModal`은 화면 상태를 들지 않는다.
- `LoginPanel`의 상태는 `useState(INITIAL_LOGIN_STATE)` 하나다. 누름마다 `nextLoginState`로 바꾸고, `focusAfter`가 준 이름을 `ref`에 적어 둔 뒤 다시 그려진 다음의 `useEffect`에서 그 요소에 `focus({ preventScroll: true })`를 준다. 화면은 `view`에 맞는 것 하나만 그린다(다른 화면은 언마운트되어 입력값이 비워진다. 지금과 같다).
- 간편 로그인·이메일 로그인·이메일 가입의 처리는 **Global Constraints의 "지금 동작" 표 그대로**다. 순서(GA → 검사 → 요청 → 뒤처리)를 바꾸지 않는다. 검사는 `loginError`·`signUpError`가 문구를 주면 `alert(문구)` 뒤 끝낸다. 요청이 실패하면 아무것도 하지 않는다.
  - 간편 로그인의 주소는 `socialLoginUrl(process.env.BASE_SERVER_URL, type)`(환경 변수는 이 파일에 글자 그대로 적는다).
  - 이메일 로그인이 성공하면 `router.push(…)` 뒤 `onClose()`. 가입이 성공하면 알림 뒤 `joined`로 화면을 바꾼다.
  - 누른 뒤 버튼을 `disabled`로 바꾸거나 불러오는 표시를 넣지 않는다(Review Focus 6).

**값 (`LoginModal.module.scss`)**

| 부분 | 값 | 520px 이하 |
|---|---|---|
| `.overlay` | `position: fixed; inset: 0; z-index: 1000; display: flex; padding: 20px; overflow-y: auto; background: rgba(12, 14, 22, 0.56); animation: fade 0.18s ease-out;` (`from { opacity: 0; }`) | `padding: 14px` |
| `.card` | `position: relative; margin: auto; width: 100%; max-width: 440px; border-radius: 26px; overflow: hidden; outline: 0; background: var(--de-bg); color: var(--de-ink); box-shadow: 0 24px 70px rgba(8, 10, 20, 0.34); text-align: center; animation: rise 0.24s cubic-bezier(0.2, 0.8, 0.3, 1);` (`from { opacity: 0; transform: translateY(14px) scale(0.985); }`) | `border-radius: 22px` |
| `.body` | `padding: 0 40px 34px;` | `padding: 0 22px 26px` |
| `.close` | `de-button-reset`, `position: absolute; top: 14px; right: 14px; z-index: 3; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;` 색은 Global Constraints의 표. `&:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }` | 같음 |

- 가운데 정렬은 `.card`의 `margin: auto`로 한다(`.overlay`에 `align-items: center`를 주면 창이 화면보다 길 때 위가 잘린다. Review Focus 5). `100vh`·`min-height`를 쓰지 않는다.
- `z-index`는 `Lightbox`와 같은 1000이다(헤더 60, 모바일 아래 고정 버튼 40보다 위, 안내 9999보다 아래).
- 움직임 줄이기 설정에서는 `.overlay`·`.card`의 animation을 끈다.
- 옛 스타일(유리 효과, `backdrop-filter`, `tablet`·`mobile` 믹스인, `~styles/_common.scss`)은 남기지 않는다.

- [ ] **Step 1: `LoginPanel.tsx`를 만든다.** 지금의 `LoginModal.tsx:76-84`, `:165-193`, `:249-277`을 옆에 두고 순서와 인자를 맞춘다.
- [ ] **Step 2: `LoginModal.module.scss`의 내용을 바꾼다.**
- [ ] **Step 3: `LoginModal.tsx`의 내용을 바꾼다.**
- [ ] **Step 4: 확인**

Run: `npx tsc --noEmit && pnpm test && npx eslint components/common/modal/login/LoginPanel.tsx && npx eslint components/common/modal/LoginModal.tsx`
Expected: 오류 없음(`LoginModal.tsx`의 `any` 경고 5개도 없어진다)

Run: SCSS 확인 — `components/common/modal/LoginModal.module.scss`
Expected: `ok`

Run: `grep -n "web_event_sns로그인버튼클릭\|web_event_이메일로그인버튼클릭\|web_event_회원가입버튼클릭\|/front/v1/users/login\|/front/v1/users/register\|회원가입이 완료되셨습니다!\|accessToken=\|process.env.BASE_SERVER_URL" components/common/modal/login/LoginPanel.tsx`
Expected: 여덟 가지가 모두 나온다

Run: `grep -rn "console\.\|disabled\|StickerDefs\|window.innerWidth\|windowX\|modalState" components/common/modal/LoginModal.tsx components/common/modal/login --include='*.tsx' --include='*.ts'`
Expected: 결과 없음

Run: `grep -rn "<LoginModal" pages components --include='*.tsx' | wc -l`
Expected: 7 (여는 곳이 그대로다)

관리자가 화면에서 볼 것 (프로덕션 빌드로. 목업과 나란히):
1. 처음 / 펼침 / 이메일 로그인 / 이메일 가입 네 모습이 목업과 같다. 밝게·어둡게.
2. 닫기: ×, Esc, 바깥 누름. 닫은 뒤 다시 열면 처음 화면이다. 닫히면 연 버튼에 포커스가 있다.
3. Tab 순서와 화면이 바뀐 뒤의 포커스(Review Focus 4). 접힌 묶음에 Tab이 멈추지 않는다.
4. 폭 330·390·540·660px, 높이 600px에서 가입 화면까지(Review Focus 5). 330px에서 머리띠의 스티커가 겹쳐 보이는 정도("확인이 필요한 것" 4).
5. 네이버 버튼의 로고가 흰 N으로 보인다("확인이 필요한 것" 3. 빈 네모로 보이면 다른 SVG와 `id`가 겹친 것이다).
6. 창을 연 채 뒤로 가기, 상세 화면에서 관심 담기로 연 창을 둔 채 다른 화면으로 이동: 화면이 다시 스크롤된다(Review Focus 3).
7. 모바일 상세 화면에서 로그인 창이 아래 고정 버튼 위에 뜬다.
8. **사용자가 직접**(요청이 나간다): 빈 칸으로 제출했을 때의 알림 문구 다섯 가지, 틀린 비밀번호(알림 → `/events`. 지금과 같다), 이메일 로그인 성공 뒤의 헤더("확인이 필요한 것" 1), 가입 성공 뒤 로그인 화면으로 바뀌는 것, 간편 로그인 네 가지가 각 제공자 화면으로 가는 것과 뒤로 돌아왔을 때(Review Focus 6).

---

### Task 6: 전체 확인

**Files:** 없음(확인만). 고칠 것이 나오면 그 파일을 만든 작업으로 돌려보낸다.

- [ ] **Step 1: 명령으로 도는 확인** (`pnpm build`는 여기서 한 번만)

Run:
```bash
npx tsc --noEmit
pnpm test
for f in components/common/modal/LoginModal.tsx components/common/modal/login/loginFlow.ts components/common/modal/login/__tests__/loginFlow.test.ts components/common/modal/login/LoginButton.tsx components/common/modal/login/LoginBand.tsx components/common/modal/login/LoginMain.tsx components/common/modal/login/LoginForms.tsx components/common/modal/login/LoginPanel.tsx components/layout/header/Header.tsx lib/hooks/useFavorite.tsx components/events/timeline/TimelineIcon.tsx; do npx eslint "$f"; done
pnpm build
```
Expected: 모두 통과. 테스트는 이 단계에서 23개가 늘어난다(loginFlow). `context/auth.tsx`는 작업 2의 확인(오류 4개, 전과 같음)으로 본다. 빌드가 SCSS에서 실패하면(`pure` 모드 위반 등) 그 파일을 만든 작업으로 돌려보낸다.

Run: SCSS 확인 — `components/common/modal/LoginModal.module.scss components/common/modal/login/LoginButton.module.scss components/common/modal/login/LoginBand.module.scss components/common/modal/login/LoginPanel.module.scss components/layout/header/Header.module.scss`
Expected: 모두 `ok`

- [ ] **Step 2: 옛 것을 새로 쓰지 않았는지**

Run: `grep -nE "var\(--(primary|gray-|vapor-|ktb-|glass-)|@include (mobile|tablet|laptop)\b|backdrop-filter|_common\.scss|[0-9]rem\b|100vh" components/common/modal/LoginModal.module.scss components/common/modal/login/*.scss`
Expected: 결과 없음

Run: `grep -nE "#[0-9a-fA-F]{3,8}\b|rgba?\(" components/common/modal/LoginModal.module.scss components/common/modal/login/*.scss`
Expected: Global Constraints의 색 표에 있는 값만 나온다

Run: `head -2 components/common/modal/LoginModal.module.scss components/common/modal/login/*.scss | grep import`
Expected: 파일마다 `@import '~styles/_variables.scss';`, `@import '~styles/_mixin.scss';` 순서

Run: `git status --short | grep "^ D\|^D "`
Expected: 결과 없음(지운 파일이 없다)

이 단계에서 만들거나 고친 파일이 File Structure에 적힌 것뿐인지 본다. `lib/api/*`, `pages/*`, `components/common/sticker/*`, `components/layout/index.tsx`, `Profile.tsx`, `Login.tsx`, `public/icon/*`, `Lightbox.*`는 이 단계에서 고치지 않는다.

- [ ] **Step 3: 요구가 빠지지 않았는지** — 아래 표의 각 줄을 코드에서 찾아 확인한다.

| 출처 | 요구 | 맡은 작업 |
|---|---|---|
| 로드맵 7단계 | 화면 세 가지, "다른 방법으로 로그인"을 누르면 Google·네이버·GitHub | 1, 4, 5 |
| 로드맵 7단계 | `LoginModal`의 props와 여는 곳은 그대로 | 5 |
| 로드맵 7단계 | 확인이 끝났는지를 `AuthContext`에, 그 전에는 40px 빈 자리, "관심 행사" 누름 | 2 |
| 로드맵 공통 규칙 1 | 로그인은 아이디+비밀번호, 가입은 이름·아이디·이메일·비밀번호(6~15자) | 1, 4 |
| 설명 페이지 `:414-420` | 카카오·이메일이 먼저, 다시 누르면 접힘, "다른 방법으로"로 돌아옴, 불투명한 창 | 3, 4, 5 |
| 설명 페이지 `:409` | 제목 "로그인 · 회원가입", 안내문, "이메일로 가입" 글자 링크, 가입 화면 아래 문장 | 4 |
| 설명 페이지 `:411` | Esc·×·바깥으로 닫힘 | 5 |
| 받은 결정 | 버튼 색(카카오·Google Neutral·네이버·GitHub), 로고는 지금 파일 | 3, 4 |
| 받은 결정 | 비밀번호가 틀렸을 때의 동작은 그대로, 창 안의 오류 자리 없음, 약관 없음 | 5 |
| 받은 결정 | 스티커는 2단계의 `Sticker`·`LOGIN_BAND`, `StickerDefs`는 넣지 않음 | 3 |
| `login.css:142` | 움직임 줄이기 | 3, 4, 5 |
| `login.css:145-149` | 520px 이하의 값 | 3, 4, 5 |

- [ ] **Step 4: 관리자가 화면에서 볼 것을 한 번에 모은다.** 작업 2·5의 "관리자가 화면에서 볼 것"과 Review Focus 여섯 가지를 한 목록으로 묶어 보고한다. 프로덕션 빌드로, 1280×900·660·540·390×844·330px 폭에서, 밝게·어둡게. 요청이 나가는 항목(작업 5의 8번)은 따로 표시한다.

**이 단계가 끝난 뒤의 모습:** 로그인 창이 새 모양이고, 헤더는 로그인 확인이 끝날 때까지 빈 자리를 그립니다. 관심 행사·내 정보 화면은 8단계가 바꿉니다.

---

## 9단계에서 지울 것

이 단계에서 쓰는 곳이 없어진 것입니다. 지우지 않고 목록만 남깁니다.

- `public/icon/arrow_back_regular.svg` — 옛 로그인 창만 썼다.
- `public/icon/apple.svg` — 주석 처리된 애플 로그인만 가리켰고, 그 주석도 없어졌다.
- 열릴 일이 없는 `LoginModal`과 그 상태: `pages/events.tsx`(`loginModalIsOpen`, `:180`), `pages/search.tsx`(`:100`), `components/common/item/List.tsx`(`:192`. 옛 목록이 없어질 때 함께). 로드맵 9단계 절에 이미 있는 것이다.
- 스크롤 잠금이 `Lightbox.tsx`와 `LoginModal.tsx`에 같은 다섯 줄로 있다. 훅 하나로 모을 수 있다.

**남겨 두는 것**
- `public/icon/kakao.svg`·`google.svg`·`naver.svg`·`github.svg` — 새 로그인 창이 쓴다.
- `public/icon/email.svg` — `pages/myinfo.tsx:129`가 쓴다(8단계에서 다시 본다).
- `react-icons` — `pages/about.tsx`가 쓴다(로그인 창은 더 쓰지 않는다).

---

## 정한 것과 확인이 필요한 것

### 이 계획이 정한 것

1. **모바일에서도 가운데 카드다.** 목업의 미디어쿼리는 520px 하나이고(`login.css:145-149`), 전체 화면이나 아래에서 올라오는 판으로 바꾸지 않는다(그것은 채택되지 않은 7·8번 시안이다). 860px에서는 입력란 글자 크기만 바뀐다.
2. **창을 열 때마다 처음 화면에서 시작한다**(목업). 지금은 Esc·바깥으로 닫으면 보던 화면이 남는다.
3. **입력란은 `<form noValidate>` 안에 둔다**(목업). 검사와 요청은 지금과 같고, Enter로 제출되는 것만 더해진다.
4. **요청·알림·이동은 `LoginPanel` 한 파일에 둔다.** 세 화면은 누름을 올리기만 한다. 지금 코드와 견주어 볼 곳이 한 곳이다.
5. **`isChecked`는 쿠키 확인(`/api/checkAuth`)이 끝났는지만 뜻한다.** 토큰이 유효한지는 보지 않는다. `login()`이 불려도 `true`가 된다.
6. **확인 전의 "관심 행사" 누름은 버리지 않고 확인 뒤 한 번 처리한다.** 카드의 관심 담기는 확인 전에는 무시한다(그때는 담아 둔 행사도 빈 하트라 담기인지 빼기인지 알 수 없다). `useFavorite`은 3단계 파일이지만 같은 문제라 세 줄을 더했다.
7. **메일 아이콘은 `TimelineIcon`에 `mail`로 더했다.** 지금 파일(`email.svg`)은 `#D8D8D8`이라 새 흰 버튼 위에서 보이지 않는다. 소셜 로고 넷은 지금 파일 그대로다.
8. **목업을 고쳐 옮긴 것**
   - 입력란 글자 크기를 860px 이하에서 16px로(iOS의 확대. 지금 코드도 16px이다).
   - 머리띠 위 닫기 버튼의 포커스 테두리를 흰색으로(어두운 바탕에서 `--de-blue`는 보이지 않는다).
   - 그 밖의 포커스 테두리는 `de-focus-ring`(2px. 목업은 2.5px).
   - 머리띠의 음수 여백 대신 본문에만 여백을 둔다(보이는 것은 같다).
   - 입력 화면을 떠나면 입력값이 비워진다(지금 코드와 같다. 목업은 남는다).
9. **`context/auth.tsx`의 기존 린트 오류와 `lib/api/*`는 손대지 않는다.**

### 확인이 필요한 것

1. **이메일 로그인에 성공한 직후 헤더가 "로그인"으로 남을 수 있다(지금 코드의 문제로 보인다. 코드로만 확인했고 화면에서는 확인하지 못했다).** 성공하면 `router.push('/?accessToken=…')`인데, 이것은 새로 고침이 아니라 화면 안에서의 이동이다(`/`의 `getServerSideProps`가 쿠키를 심고 `/events`로 넘긴다). `AuthProvider`는 처음 뜰 때만 `/api/checkAuth`를 부르므로 `isLoggedIn`이 `false`로 남는다(새로 고치거나 `/myevent`에 가면 바뀐다). 간편 로그인은 페이지가 새로 열려 해당 없다. 고치려면 `LoginPanel`이 이동이 끝난 뒤 `authContext.login()`을 부르거나, `AuthProvider`가 페이지 이동이 끝날 때마다 다시 확인하면 된다. "성공 뒤 동작은 지금과 같게"와 부딪혀 계획에 넣지 않았다. **넣을지 정해 주세요.**
2. **Enter로 제출되는 것**("정한 것" 3). 지금과 완전히 같게 하려면 `<form>`을 `<div>`로, 제출 버튼을 `type="button"` + `onClick`으로 바꾸면 된다.
3. **네이버 로고.** 지금 파일은 PNG가 박힌 SVG이고 "녹색 둥근 네모 안의 흰 N"이다. 녹색 버튼 위에 그대로 올리면 N이 목업(16px)보다 작게 보이고(20px로 그려도 N은 약 9px), 네모의 녹색이 버튼의 `#03C75A`와 다르면 네모가 비쳐 보인다. 목업의 주석(`login.js:9`)은 "실제 구현에서는 공식 파일"이라고 했지만 이번에는 새로 받지 않기로 했다. 화면을 보고 그대로 둘지, 0단계에서 공식 파일을 받을지 정한다. 카카오 말풍선도 지금 파일은 `#3c1e1e`(목업 `#191919`)다.
4. **좁은 화면의 머리띠.** `LOGIN_BAND`의 여섯 장은 440px 폭에 맞춘 자리라, 창이 302px(330px 화면)가 되면 왼쪽·오른쪽 스티커가 가운데에서 겹친다. 목업도 같다(머리띠는 `overflow: hidden`이라 밖으로 나가지는 않는다). 보기 싫으면 `LoginBand`가 가운데 두 장(`laptop`, `prompt`)에 클래스를 넘겨 360px 이하에서 숨기면 된다. 목업을 화면으로 띄워 보지는 못했고 CSS로만 읽었다.
5. **확인 전 빈 자리의 폭.** 받은 대로 40px이다. 프로필 버튼(40px)과는 같지만 "로그인" 버튼(약 70px)보다 좁아, 로그인하지 않은 사람에게는 확인이 끝날 때 오른쪽 묶음이 한 번 넓어진다.
6. **창을 연 채 뒤로 가면 창이 남는다**(헤더가 연 경우. 지금과 같다). 페이지가 바뀔 때 닫으려면 `LoginModal`이 `routeChangeStart`에서 `onClose()`를 부르면 되는데, 그러면 틀린 비밀번호 뒤(`/`로 보내질 때)에도 창이 닫혀 지금과 달라진다.
7. **같은 요청이 두 번 나갈 수 있다**(지금과 같다). 제출 버튼을 막지 않으므로 빠르게 두 번 누르거나 Enter를 누르고 있으면 로그인·가입 요청이 겹친다.
8. **2단계가 먼저 끝나야 한다.** 2026-11-18에 `components/common/sticker/`와 `Layout`의 `StickerDefs`는 아직 없었다. 작업 3의 Step 1이 확인한다. 작업 1·2는 2단계와 무관하게 시작할 수 있다.
9. **다른 단계와 겹칠 수 있는 파일.** `TimelineIcon.tsx`(아이콘 한 줄), `lib/hooks/useFavorite.tsx`(8단계가 고칠 수 있다), `Header.tsx`.
10. **약관·개인정보 안내**(로드맵 0단계)는 받은 대로 넣지 않았다. 필요해지면 `LoginMain`의 아래 문장 밑에 한 줄을 더하면 된다.

### 계획을 쓰면서 본 목업·코드의 문제

**목업**
- 520px 이하에서 `.lgb { height: 50px; font-size: 15px }`가 `.lgb--more`(44px·14.5px)보다 뒤에 있어 "다른 방법으로 로그인"이 오히려 커진다. 그대로 따랐다.
- 입력란이 15px이라 iOS에서 포커스할 때 화면이 확대된다.
- 닫기 버튼과 머리띠 위 요소의 포커스 테두리가 `--blue`라 어두운 머리띠 위에서 거의 보이지 않는다.
- 입력란의 `name`이 `id`·`pw`로 지금 요청의 키와 다르다.

**지금 코드**
- 이메일 로그인 성공 뒤 `AuthContext`가 갱신되지 않는다("확인이 필요한 것" 1). `lib/api/error.tsx`가 로그아웃시킨 뒤에도 마찬가지로 헤더가 프로필로 남는다.
- `loginByEmail`·`signUpByEmail`의 실패를 잡지 않아 처리되지 않은 거부가 남는다. 응답이 없는 실패(네트워크)에서는 인터셉터가 `error.response.data`를 읽다가 다시 예외를 낸다(`lib/api/axiosInstance.tsx:27`). 알림 없이 아무 일도 일어나지 않는다.
- `lib/api/error.tsx`는 "이미 존재하는 이메일·아이디"(가입 실패)에도 로그아웃하고 `/`로 보낸다.
- 토큰이 주소(`/?accessToken=…`)에 실린다(로드맵의 범위 밖).
- `LoginModal`의 props가 `any`다. 뒤로 버튼의 조건 `if (pageState.signUp || pageState.email)`은 늘 참이다.
- `naver.svg`가 벡터가 아니라 PNG를 품은 SVG이고, `email.svg`의 색이 옛 어두운 창에 맞춰져 있다.
- 한 화면에 `LoginModal`이 여러 개 마운트된다(`/events`에서는 헤더·타임라인·페이지의 셋). 닫혀 있을 때는 그리지 않으므로 동작에는 문제가 없다.

## 2026-11-19 바꾼 것

- **문구:** "이메일로 로그인" → "아이디로 로그인", "이메일로 가입" → "아이디로 가입", "이메일 계정이 없으신가요?" → "아이디가 없으신가요?", "이메일 계정이 필요하면" → "아이디 계정이 필요하면". 로그인은 아이디·비밀번호로 하고(서버도 아이디로만 찾는다), 지금 운영 창도 "아이디 로그인"이라 목업 문구 대신 실제 동작에 맞췄다. 처음 화면 버튼의 아이콘은 편지(`mail`)에서 사람(`user`)으로 바꿨다. GA 이벤트 이름(`web_event_이메일로그인버튼클릭`)과 코드 안 이름(`LoginEmailForm`, `view: 'email'`)은 그대로다.
- **실패 처리:** 비밀번호가 틀리거나 가입이 실패해도 알림·로그아웃·`/` 이동을 하지 않고, 창 안 제출 버튼 위에 이유를 보여 준다(`loginFlow.ts`의 `authFailure`, `lib/api/post.tsx`의 `validateStatus`). 위 "받은 결정"의 "비밀번호가 틀렸을 때의 동작은 그대로, 창 안의 오류 자리 없음"을 바꾼 것이다.
- **입력 확인:** 빈칸·비밀번호 길이도 `alert` 대신 칸 아래 빨간 문구(`loginFieldErrors`·`joinFieldErrors`)로 보여 주고 첫 문제 칸으로 포커스를 옮긴다. 가입의 "모두 입력해주세요!"는 칸마다 나눴다. 칸을 가리키는 서버 거절(이미 있는 아이디·이메일, 이메일 형식)도 칸 아래, 칸을 가리키지 않는 거절(틀린 비밀번호, 서버 오류)은 제출 버튼 위(`role="alert"`)다.

