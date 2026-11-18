# 리디자인 구현 — 전체 계획

정적 목업으로 정한 화면을 실제 Next.js 코드로 옮기는 순서와 단계별 범위를 정한 문서입니다.
단계마다 세부 계획을 따로 씁니다(아래 표의 "세부 계획" 칸). 이 문서는 세부 계획들이 공통으로 따르는 규칙과 순서만 담습니다.

- **기준 문서(목업):** `docs/design-proposals/2026-11-13-main-detail-redesign/`
  - 설명 페이지: `detail-design/index.html` (결정 사항, 화면별 규칙, 참고한 서비스)
  - 움직이는 목업: `detail-design/app.html` (주소 끝의 `#main`, `#detail/<id>`, `#saved`, `#me`, `#search`, `#error`로 화면을 고름)
  - 목업 서버: `.claude/launch.json`의 `design-mockups` (http://localhost:5177)
- **목업은 기준 화면이지 옮겨 쓸 코드가 아닙니다.** 크기·색·문구·동작은 목업의 CSS와 화면에서 읽고, 구조는 이 저장소의 방식(SCSS Module, SWR 훅, Context)으로 새로 짭니다.

## 정해진 화면

| 화면 | 결정 | 목업 주소 (`app.html` 뒤) | 지금 코드 |
|---|---|---|---|
| 메인 | 02 날짜 타임라인, 썸네일 320px, NEW는 제목 앞 파란 글자(등록 후 3일), 날짜 띠는 오늘부터 2주 | `#main` | `pages/events.tsx`, `components/common/item/*`, `components/common/date/DateBoard.tsx` |
| 배너 | 등록 배너가 있으면 글+이미지(배경색은 API 값), 없으면 홀로그램 스티커(홀1)+프롬프트 | `#main` (`?reg=0`이면 배너 없을 때) | `components/common/banner/banner.tsx` |
| 캘린더 보기 | 달력 한 달 + 그날 목록 두 칸, 범례는 (i) 안 | `?view=cal#main` | `components/events/calendar/*` |
| 상세 | 왼쪽 320px 고정 칸(포스터·신청 카드), 본문 712px | `#detail/3489` | `pages/event/detail/[eventId].tsx`, `styles/EventDetail.module.scss` |
| 검색 결과 | 1. 날짜 타임라인 (메인과 같은 모습) | `#search` | `pages/search.tsx`, `components/events/FilteredEventList.tsx` |
| 로그인 창 | 2. 홀로그램 머리띠, 제목 "로그인 · 회원가입" | `?open=login#main` | `components/common/modal/LoginModal.tsx` |
| 관심 행사 | 6. 홀로그램 머리띠 | `#saved` | `pages/myevent.tsx`, `components/myEvent/*` |
| 내 정보 | 2. 홀로그램 머리띠 (가운데 카드) | `#me` | `pages/myinfo.tsx`, `DeleteAccountModal.tsx` |
| 오류 화면 | 9. 큰 숫자 | `#error` | `pages/_error.tsx` |
| 공지 띠 | 2. 홀로그램 띠 | `#main` 맨 위 | `components/common/modal/NoticeModal.tsx` |
| 공유·담기 안내 | 4. 위에서 내려옴 | `?open=share#main` | `context/toast.tsx`, `components/common/toast/ToastStack.tsx` |
| 소식 받기·푸터 | 2. 받는 방법 고르기 | 각 화면 맨 아래 | `components/features/letter/Letter.tsx`, `SocialBanner.tsx`, `Footer.tsx` |
| 소개 | **지금 디자인 유지** (손대지 않음) | — | `pages/about.tsx` |

## 공통 규칙 (모든 단계에 적용)

1. **기능·입력란·API 경로는 지금 그대로.** 바뀌는 것은 모양과 배치입니다. 예: 로그인은 아이디+비밀번호, 가입은 이름·아이디·이메일·비밀번호(6~15자), 주소(`/events`, `/search`, `/myevent`, `/myinfo`, `/event/detail/[id]`)도 그대로.
2. **색은 `--de-*` 변수만 씁니다.** 1단계에서 `styles/Theme.scss`에 밝은 화면·어두운 화면 값을 함께 넣습니다. 새로 만드는 화면에서 옛 변수(`--primary`, `--gray-*`, `--vapor-*`, `--ktb-*`)와 고정 색 값은 쓰지 않습니다. 옛 변수는 마지막 단계에서 쓰는 곳이 없어진 것만 지웁니다.
3. **폭 기준:** 내용 최대 폭 1120px, 좌우 여백 20px(360px 이하 16px). PC와 모바일을 가르는 폭은 **860px** 하나입니다. 날짜 띠만 620px·480px, 캘린더 보기만 1040px에서 한 번 더 바뀝니다. 옛 믹스인(`mobile` 600px, `tablet`, `laptop` 1200px)은 새 화면에서 쓰지 않습니다.
4. **헤더는 화면에 고정하지 않습니다.** 높이 64px(모바일 56px)이고 스크롤하면 올라갑니다. 화면 위에 붙는 것은 메인의 날짜 띠뿐입니다.
5. **크기는 px로 씁니다.** 이 사이트는 `html { font-size: 14px }`라 1rem이 14px입니다. 목업 값은 모두 px입니다.
6. **글꼴:** Pretendard Variable. 고정폭 글자는 `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`.
7. **문구는 해요체.** 목업의 문구를 그대로 씁니다. "담아 둔 행사 9건"처럼 건수를 요약하는 문구는 넣지 않습니다(여러 번 받은 요청).
8. **움직임 줄이기 설정**(`prefers-reduced-motion: reduce`)을 켠 사용자에게는 홀로그램 흐름·내려오는 안내·스티커 움직임을 멈춘 모습으로 보여 줍니다.
9. **데이터는 SWR 훅으로.** 컴포넌트 안에서 `fetch`를 직접 부르지 않습니다(`lib/hooks/useSWR.tsx`의 방식).
10. **테스트:** 날짜 묶기·건수 세기·색 대비 같은 계산은 순수 함수로 빼서 `__tests__/`에 단위 테스트를 먼저 씁니다. 컴포넌트 테스트 도구(`@testing-library/react`)는 설치되어 있지 않으므로, 화면은 아래 "확인 방법"으로 봅니다.
11. **커밋 단계 없음.** 커밋·푸시는 사용자가 요청할 때만 합니다.

### 확인 방법 (단계마다 마지막에)

```bash
npx tsc --noEmit
pnpm test
npx eslint <바꾼 파일들>
pnpm build
```

`pnpm lint`(`next lint`)는 쓰지 않습니다. 이 저장소에서는 설정을 묻는 화면만 뜨고 검사가 돌지 않습니다(2026-11-17 확인). 대신 바꾼 `.ts`·`.tsx` 파일만 `npx eslint`로 봅니다(`.eslintrc.cjs` 사용).

화면은 프로덕션 빌드(`pnpm build` 뒤 `pnpm start`, http://localhost:5000)로 봅니다. 숨겨진 브라우저 패널에서는 개발 서버 화면이 제대로 뜨지 않기 때문입니다. 1280×900과 390×844에서, 밝은 화면과 어두운 화면을 각각 목업과 나란히 놓고 비교합니다.

## 단계와 순서

| 단계 | 이름 | 하는 일 | 먼저 끝나야 하는 단계 | 크기 | 세부 계획 |
|---|---|---|---|---|---|
| 0 | 준비 | 공식 로고·아이콘 파일 확보, 서버 쪽 확인 요청, 목업 문서 커밋 | — | 작음 | 이 문서의 "0단계" |
| 1 | 공통 틀 | 색 변수, 글꼴, 헤더, 소식 받기·푸터, 공지 띠, 안내 | — | 중간 | `2026-11-17-redesign-1-shell.md` (구현 완료, 미커밋) |
| 2 | 홀로그램 스티커 | 스티커를 그리는 부품(배너·로그인·관심 행사·내 정보가 함께 씀) | 0, 1 | 작음 | `2026-11-18-redesign-2-sticker.md` (구현 완료, 미커밋. 로고는 공식 파일의 도형) |
| 3 | 메인 타임라인 · 검색 결과 | 날짜별 묶기, 날짜 띠, 행사 카드, NEW, 자동 표지, 필터 배치 | 1 | 큼 | `2026-11-17-redesign-3-timeline.md` (구현 완료, 미커밋) |
| 4 | 배너 | 등록 배너 불러오기, 배너 없을 때 홀로그램 슬로건 | 1, 2 | 중간 | `2026-11-18-redesign-4-banner.md` (구현 완료, 미커밋) |
| 5 | 캘린더 보기 | 색 농도 달력 + 그날 목록 | 3 | 중간 | `2026-11-17-redesign-5-calendar.md` (구현 완료, 미커밋) |
| 6 | 상세 | 두 칸 구성, 신청 카드, 모바일 아래 고정 버튼, 그림 크게 보기, 같은 날 다른 행사 | 1 (같은 날 행사 카드는 3) | 중간 | `2026-11-17-redesign-6-detail.md` (구현 완료, 미커밋) |
| 7 | 로그인 창 | 홀로그램 머리띠, 다른 방법 펼치기, 화면 세 가지 | 1, 2 | 중간 | `2026-11-18-redesign-7-login.md` (구현 완료, 미커밋) |
| 8 | 관심 행사 · 내 정보 | 머리띠, 탭, 줄 목록, 탈퇴 확인 창 | 1, 2 (카드는 3) | 중간 | `2026-11-18-redesign-8-mypage.md` (구현 완료, 미커밋) |
| 9 | 오류 화면 · 정리 | 큰 숫자 화면, 안 쓰게 된 코드와 옛 변수 지우기 | 모두 | 작음 | 계획 문서 없음. 오류 화면 완료, 안 쓰는 파일 지우기는 `.superpowers/sdd/2026-11-18-redesign-9-cleanup/cleanup-report.md`. 공용 파일 안의 죽은 변수와 "미룬 다듬기"는 남음 |

```
0 준비 ─┐
1 공통 틀 ─┬─ 3 메인·검색 ─┬─ 5 캘린더 보기
           │               ├─ 6 상세
           │               └─ 8 관심 행사·내 정보
           └─ 2 스티커 ─┬─ 4 배너
                        ├─ 7 로그인 창
                        └─ 8 관심 행사·내 정보
                                          └─ 9 오류 화면·정리
```

**세부 계획을 단계가 시작될 때 쓰는 이유:** 뒤 단계는 앞 단계가 만든 부품의 이름과 props에 기대어 씁니다. 미리 써 두면 앞 단계에서 바뀐 것과 어긋납니다. 1단계만 지금 썼습니다.

## 배포 방식 — 결정이 필요합니다

단계를 하나씩 운영에 올리면 새 헤더 아래에 옛 카드가 보이는 식으로 **새 모양과 옛 모양이 섞인 기간**이 생깁니다. 두 가지 방법이 있습니다.

| | A. 모아서 한 번에 (권장) | B. 단계마다 배포 |
|---|---|---|
| 방법 | `feature/redesign` 브랜치를 만들고, 단계별 브랜치를 여기에 합칩니다. 다 끝나면 `main`에 한 번 합칩니다. | 단계별 브랜치를 바로 `main`에 합치고 배포합니다. |
| 사용자에게 보이는 것 | 한 번에 전부 바뀜 | 몇 주 동안 화면마다 모양이 다름 |
| 문제가 생겼을 때 | 되돌리는 범위가 큼 (전체) | 그 단계만 되돌림 |
| 중간 확인 | Vercel 미리보기 주소로 확인 | 운영에서 바로 확인 |
| `main`의 다른 수정과 충돌 | 기간이 길수록 늘어남. 주기적으로 `main`을 합쳐 옴 | 거의 없음 |

A를 권합니다. 1단계(헤더·푸터·색)가 모든 화면에 걸쳐 있어, B로 가면 첫 배포부터 모든 화면이 반쯤 바뀐 상태가 됩니다. 세부 계획은 어느 쪽이든 그대로 쓸 수 있습니다.

## 0단계 — 준비

코드 작업 전에 확인하거나 받아 둘 것입니다. 1단계는 이것 없이 시작할 수 있습니다.

- [ ] **목업 문서 커밋.** `docs/design-proposals/`가 아직 한 번도 커밋되지 않았습니다. 세부 계획이 이 폴더를 기준으로 삼으므로 먼저 올려 두는 것을 권합니다.
- [ ] **스티커에 쓰는 로고 여섯 종의 공식 파일.** (2026-11-18 완료: 공식 파일을 받아 `lib/sticker/logos.ts`를 다시 만듦. 출처 표기는 `public/licenses.txt`(주소 `/licenses.txt`). 푸터 저작권 줄 끝의 "로고 출처" 링크로 연결됨.) Python, JavaScript, TypeScript, Git, 턱스(Linux), Android 로봇. 목업의 `detail-design/logos.js`는 목업용으로 넣은 것이라 공식 배포 파일로 바꿉니다. 턱스·Android·Git은 출처 표기가 필요합니다(조건은 설명 페이지 "배너" 절의 표). → 2단계 전
- [ ] **로그인 버튼 색.** 네이버 녹색 값은 공식 문서를 다시 확인하지 못했습니다. Google은 Neutral 판(`#F2F2F2`, 테두리 없음), 카카오는 `#FEE500`입니다. → 7단계 전
- [ ] **배너 API(`GET /banner/top`)의 서버 쪽 확인 세 가지.** ① 배너를 수정하면 배경색이 저장되지 않음 ② 응답이 3시간 캐시되어 새 배너가 늦게 보일 수 있음 ③ 등록된 배너가 없어 실제 응답 모양을 확인하지 못함. 서버 저장소에 이슈로 남깁니다. → 4단계 전
- [ ] **글꼴을 어디서 불러올지.** 지금 서비스는 Pretendard를 불러오는 코드가 없어, 글꼴이 설치되지 않은 기기에서는 시스템 글꼴로 보입니다. 1단계 계획은 목업과 같은 CDN(jsDelivr의 Pretendard 묶음)에서 불러오는 것으로 썼습니다. 직접 올려 두고 쓰려면 1단계 작업 1만 바꾸면 됩니다. 지금 방식(CDN의 stylesheet)은 받기 전까지 첫 그림을 막습니다. CDN이 느리게 응답하면 빈 화면이 길어질 수 있으니, 직접 올려 두거나 그림을 막지 않는 방식으로 바꿀지 함께 정합니다.
- [ ] **서버의 월별 조회 연도 상한.** 서버가 `/front/v2/events/{year}/{month}`의 연도를 2021~2027로 막고 있습니다(서버 저장소 로컬 브랜치 기준). 캘린더의 월 선택은 내년까지 넘길 수 있어, 2027년 1월 1일부터는 2028년을 고르면 오류 문구가 나옵니다(화면은 깨지지 않음). 그 전에 서버의 상한을 올려야 합니다.
- [ ] **가입 화면의 약관·개인정보 안내.** 지금 서비스에 없고 목업에도 넣지 않았습니다. 필요한지 확인합니다. → 7단계 전

## 단계별 범위

세부 계획을 쓸 때 출발점으로 삼을 내용입니다. 파일 줄 번호는 2026-11-17 기준입니다.

### 1단계 — 공통 틀
세부 계획: `2026-11-17-redesign-1-shell.md`

### 2단계 — 홀로그램 스티커
- 목업의 `stickers.js`(스티커 그림), `logos.js`(로고)를 TypeScript로 옮깁니다. 결정된 화면이 쓰는 스티커만 옮깁니다: 배너 홀1의 묶음, 로그인·관심 행사·내 정보 머리띠의 `holo:logo`, `lg:js:hex:h`, `lg:linux:hex:h`, `lg:python:disc:w`, `laptop`, `prompt`.
- 그림을 만드는 함수는 순수 함수(SVG 문자열 반환)로 두고, 화면에는 `<Sticker name=... />` 부품과 한 번만 넣는 `<StickerDefs />`(홀로그램 색·칼선 필터)로 그립니다.

### 3단계 — 메인 타임라인 · 검색 결과
- **순수 함수(테스트 먼저):** 행사를 날짜별로 묶기(접수형은 마감일, 일시형은 시작일, 진행 중은 오늘), 카드의 시각 표시 줄("접수 마감 17:00", "행사 19:00 ~ 20:30"), NEW 판정(등록 후 3일), 날짜 띠에 넣을 날짜별 건수.
- **바뀌는 부품:** `ItemList`(월별 묶음 → 날짜별 묶음), `Item`(썸네일 왼쪽 320px·16:9, 시각 줄, 제목 20px, 회색 태그, 관심·공유), `DdayTag`(접수 기간 내내 Today로 나오던 규칙을 접수형·일시형으로 나눔), 새 날짜 띠(지금의 `DateBoard` 자리), 필터·검색 줄 배치, "지난 행사 보기"·"새로 올라온 행사" 칩, 썸네일 없는 행사의 자동 표지, 불러오는 중 뼈대.
- **검색 결과**는 같은 목록을 그대로 쓰고, 결과 없음 화면만 다릅니다("찾으시는 행사정보가 없어요"와 추천 태그는 지금 그대로).
- **주의할 것**
  - `Item.tsx:83-90`은 누른 요소가 SPAN/DIV/IMG일 때만 상세로 갑니다. 마크업을 바꾸면 카드가 눌리지 않게 되므로 카드 전체를 링크로 다시 짭니다. 태그 버튼이 링크 안에 들어가지 않게 합니다.
  - `List.tsx:156`의 key가 순번이고 `Item.tsx:51-52`의 `isDone`·`isNew`가 처음 값에 묶여 있습니다. 날짜별로 다시 묶으면서 key를 행사 id로 바꿉니다.
  - 목록의 관심 담기에는 실패 처리가 없습니다(`List.tsx:71-96`). 실패하면 화면을 되돌리고 안내를 띄웁니다.
  - 검색 규칙(`lib/utils/searchUtil.tsx`: 대소문자·띄어쓰기 무시, 제목·주최·태그)은 그대로 둡니다. 목업의 검색은 단순 포함이라 결과가 다를 수 있으니 실제 규칙이 기준입니다.
  - 다른 달은 월별 조회(`useMonthlyEvent`)로 불러옵니다. 월 선택 풍선의 "달마다 건수"는 지금 API에 없습니다. 세부 계획에서 넣을지 뺄지 정합니다.

### 4단계 — 배너
- `/banner/top`을 목록 화면의 `getServerSideProps`에서 함께 부르고 SWR 훅(`useTopBanners`)으로 이어받습니다. 모델 `TopBanner`를 추가합니다.
- **순수 함수(테스트 먼저):** 배경색 검사(`#RGB`·`#RRGGBB`만 받고 아니면 기본 남색), 배경색에 따라 글자색을 검정·흰색 중에서 고르기.
- 높이 PC 200px, 모바일 150px. 여러 건이면 화살표로만 넘깁니다(저절로 넘어가지 않음).
- 지금의 물결 영상(`/default/dev_event_banner_wave.mp4`)과 `banner.module.scss`의 성립하지 않는 반응형 규칙(`:56-79`, `:93`, `:106`)은 함께 없어집니다.

### 5단계 — 캘린더 보기
- **순수 함수(테스트 먼저):** 날짜별 건수(3단계와 같은 기준), 색 단계(1~2건, 3~4건, 5~7건, 8건 이상), 방향키로 다음에 갈 날짜(행사 없는 날은 건너뜀).
- `CalendarGrid`(이름 막대)와 `CalendarDotGrid`(점)를 색 농도 달력 하나로 바꿉니다. `buildCalendarMatrix`는 그대로 쓰고, `layoutMultiDayEvents`·`tagColor`는 쓰는 곳이 없어지면 9단계에서 지웁니다.
- 필터와 검색이 달력에도 적용되게 합니다(지금은 적용되지 않음).
- 주소 `/events?view=calendar&year=&month=`는 그대로 씁니다.

### 6단계 — 상세
- 왼쪽 320px 칸(포스터, 신청 카드: 상태 → 남은 시간 → 버튼 → 관심·캘린더·공유)을 화면에 붙이고, 오른쪽 본문은 712px. 860px 이하에서는 한 칸이 되고 신청 버튼이 화면 아래에 붙습니다.
- **순수 함수(테스트 먼저):** 신청 카드의 상태 문구와 남은 시간("마감까지 6일 8시간"), 접수 기간 진행 막대의 비율.
- 포스터와 본문 그림은 누르면 크게 보입니다. 표는 본문 칸을 다 채웁니다.
- "같은 날 다른 행사"는 새 API 없이 `/front/v2/events/current`를 상세의 `getServerSideProps`에서 함께 불러 고릅니다.
- **범위 밖이지만 알아 둘 것:** 본문은 `marked` 결과를 그대로 넣고 있어 걸러내는 처리가 없습니다(`[eventId].tsx:64-70`, `:286-289`). 리디자인과 별개의 보안 문제이므로 따로 다룹니다.

### 7단계 — 로그인 창
- 화면 세 가지: 처음(카카오, 이메일 로그인, "다른 방법으로 로그인"을 누르면 Google·네이버·GitHub), 이메일 로그인(아이디·비밀번호), 이메일 가입(이름·아이디·이메일·비밀번호).
- `LoginModal`은 다섯 곳에 따로 있습니다(`Header.tsx:45`, `events.tsx:143`, `search.tsx:97`, `List.tsx:192`, `[eventId].tsx:300`). props(`isOpen`, `onClose`)는 바꾸지 않습니다.
- 로그인 상태 확인이 끝나기 전에는 헤더에 "로그인" 버튼이 먼저 그려졌다가 프로필 버튼으로 바뀝니다(`context/auth.tsx:18`의 처음 값이 false). 그 사이 "관심 행사"를 누르면 로그인한 사람에게도 로그인 창이 뜹니다. 확인이 끝났는지를 AuthContext에 두고, 그 전에는 40px 빈 자리를 그립니다.
- **알아 둘 것:** 비밀번호가 틀려도 `lib/api/error.tsx:41-51`이 로그아웃 처리 후 `/`로 보냅니다. 창 안에 오류를 보여 주려면 이 분기를 바꿔야 하는데, 동작을 바꾸는 일이라 세부 계획에서 따로 묻습니다.

### 8단계 — 관심 행사 · 내 정보
- 화면 이름을 "북마크"·"내 이벤트"에서 **"관심 행사"**로 통일합니다(헤더 메뉴는 1단계에서 먼저 바꿉니다).
- 관심 행사: 홀로그램 머리띠 안에 제목과 탭(진행중 N / 종료 N), 아래는 줄 목록. 빈 화면 문구와 "개발자 행사 보러가기" 버튼은 지금 그대로.
- 내 정보: 가운데 카드(머리띠, 프로필 사진·이름·가입일, 가입 계정, 회원 탈퇴)와 탈퇴 확인 창("정말 탈퇴하시겠습니까?").
- 종료일 계산이 세 곳에 중복되어 있습니다(`MyEventTabs.tsx:12`, `MyEventScheduledList.tsx:47`, `MyEventDoneList.tsx:24`). 하나로 모읍니다.

### 9단계 — 오류 화면 · 정리
- `_error.tsx`를 큰 숫자 화면으로 바꿉니다(문구는 지금 그대로, "행사 일정으로 가기" 버튼 추가). 소식 받기 없이 푸터만 둡니다.
- 쓰는 곳이 없어진 파일과 옛 색 변수를 지웁니다. 후보: `HeaderTab.*`, `MonthlyEventList`, `ShareModal`, `SaveModal`, `Letter.*`, `SocialBanner.*`, `EmailSubscribeButton.*`, `DateBoard`, 안 쓰는 아이콘들.
- 1단계에서 새로 쓰이지 않게 된 것(1단계 전체 검토에서 확인): `Register.*`, `components/common/buttons/TextButton.*`, `components/icons/GithubIcon.tsx`와 `.github__icon`, `styles/globals.scss`의 `@keyframes de-holo`(모듈에서 부를 수 없어 공지 띠가 자기 것을 따로 둠), `Theme.scss`의 `--header-bg`·`--notice-bg`, `Header.module.scss`의 프로필 버튼 글자 크기·굵기, `WindowContext`의 `isNotice`(이제 `data-notice` 속성과 역할이 겹침).
- 3단계에서 쓰이지 않게 된 것은 `2026-11-17-redesign-3-timeline.md` 끝의 "9단계에서 지울 것"에 있습니다. 3단계 전체 검토에서 더 찾은 것: 아이콘 `ToggleIcon`·`LeftArrowIcon`·`RightArrowIcon`·`DownArowIcon`·`DeleteIcon`(쓰는 곳이 죽은 부품뿐), `public/icon/toggle_active.svg`, `pages/events.tsx`·`pages/search.tsx`의 열릴 일 없는 `LoginModal`, 중복된 `prefersReducedMotion`·`pad`.
- **지우면 안 되는 것:** `components/features/filters/jobGroup.ts`·`eventType.ts`는 새 필터 줄(`components/events/timeline/FilterBar.tsx`)과 `lib/utils/timeline/filters.ts`가 씁니다. 옛 필터 폴더를 정리할 때 함께 지우지 않습니다.
- 3단계에서 미룬 다듬기: 안내(토스트)가 화면 위에 붙은 날짜 띠 위에 겹쳐 뜨는 것(붙은 띠의 아랫선을 변수로 올려 안내가 그 아래에 뜨게), 제목 단계(배너 `h1` 다음이 날짜 `h3`), 날짜 띠의 칸이 모두 Tab 정지점인 것(roving tabindex), 행사 유형 고르기가 방향키만으로 이동하는 것, Safari 15 이하에서 날짜 띠가 화면 위에 붙지 않는 것(`body`의 `overflow-x: hidden` 대체값).
- 5단계·6단계에서 쓰이지 않게 된 것은 각 계획 문서(`…-5-calendar.md`, `…-6-detail.md`) 끝의 "9단계에서 지울 것"에 있습니다. 더 찾은 것: `pages/events.tsx`의 열릴 일 없는 `loginModalIsOpen`·`LoginModal`, 화면에서 쓰지 않는 `daySummary`와 `CalendarViewModel.summary`(건수 요약 줄을 그리지 않기로 함), `styles/EventDetail.module.scss`(상세 페이지가 더 쓰지 않음).
- 5단계에서 미룬 것: 주소의 소수 연·월(`month=1.5`)을 서버 쪽에서 막기, 달력 칸의 한 줄 설명을 키보드 포커스에서도 보이기, 보기 전환이 취소됐을 때 넘겨주던 날짜(`focusDay`)가 남는 것. **색 단계 칸의 글자 대비**(5~7건 칸의 흰 숫자 약 2.6:1, 3~4건 칸의 건수 글자 약 3.6:1)는 목업의 색 그대로라 사용자 결정이 필요합니다.
- 6단계에서 미룬 것: 크게 보기의 그림이 깨졌을 때 처리, iOS 아래 안전 영역(`viewport-fit=cover` 메타가 없어 모바일 아래 고정 버튼의 안전 영역 처리가 효과 없음), 캘린더 메뉴의 Home·End 키, 걸러내기 브랜치(`claude/frosty-murdock-4b230c`)의 `lib/utils/renderDescription.ts`로 교체.
- `.error { height: 100vh }`(`styles/globals.scss`)는 헤더가 흐름 안으로 들어온 뒤 늘 스크롤이 생깁니다. 오류 화면을 바꾸면서 함께 없앱니다.

#### 처리 결과 (2026-11-19, 커밋 전)

미룬 다듬기와 정리 항목을 지금 빌드에서 하나씩 재현해 보고 처리했다.

| 항목 | 결과 |
|---|---|
| 안내(토스트)가 붙은 날짜 띠 위에 겹침 | 고침. `DateNav`가 띠 아랫선을 `<html>`의 `--de-stuck-bottom`으로 알리고, 안내는 `max(기본 위치, 아랫선 + 12px)`에 뜬다 |
| 제목 단계 | 고침. 첫 달에도 화면에 안 보이는 달 제목(`h2`)을 두어 날짜 제목(`h3`)이 늘 달 제목 아래에 온다 |
| 날짜 띠 칸이 모두 Tab 정지점 | 고침. roving tabindex(`role="toolbar"`, ←→·Home·End). 날짜 줄의 Tab 정지점 27 → 6 |
| 행사 유형이 방향키만으로 이동 | 고침. `<select>`는 그대로, 키보드로 옮긴 값은 Enter나 다른 곳으로 나갈 때 적용. 마우스·터치는 고르자마자 적용 |
| Safari 15 이하에서 날짜 띠가 안 붙음 | 고침. `@supports not (overflow-x: clip)`에서 body는 `visible`(가로 넘침은 html이 막음). 실제 Safari 15에서는 확인 못 함 |
| 주소의 소수 연·월 | 고침. 서버도 `readMonthParam`(정수 2000~2100년, 1~12월)으로 읽는다 |
| 달력 칸 설명을 키보드 포커스에서도 | 고침. `:focus-visible`에서도 같은 풍선 |
| 취소된 보기 전환의 `focusDay` | 고침. `router.push`가 `false`로 끝나거나 실패하면 비운다 |
| 색 단계 칸의 글자 대비 | 고침(사용자 결정). 칸 바탕은 목업 그대로, 글자색만 `--heat-num`·`--heat-3-on`·`--heat-sun`·`--heat-sat`로 바꿔 앞으로 올 날 글자가 모두 4.5:1 이상. 지난 날은 칸 전체 42% 흐림 대신 회색 단계(`--heat-past-*`) |
| 크게 보기 그림이 깨졌을 때 | 고침. "그림을 불러오지 못했어요"와 그림 설명 |
| iOS 아래 안전 영역 | 그대로 둠. `viewport-fit=cover`가 없어 Safari가 안전 영역 안에만 그리므로 화면 문제 없음(iOS 27 시뮬레이터 확인) |
| 캘린더 메뉴의 Home·End | 고침 |
| 걸러내기 브랜치로 교체 | 고침. `claude/frosty-murdock-4b230c`의 `renderDescription.ts`와 테스트를 합치고 `xss` 패키지 추가. 목업 API는 본문을 마크다운으로 내려 준다(`.claude/redesign-mock/html-to-md.js`) |
| `.error { height: 100vh }` | 이미 없음 |
| 옛 필터 모달 게이팅 | 걷어냄. `/events`·`/search`의 게이팅과 그 아래 파일 53개, `WindowContext`의 `isClient`·`windowX`·`modalState`, `EventContext`의 `updateJobGroupList`·`deleteJobGroupList`, `react-loader-spinner` 패키지를 지웠다 |

남은 것: 0건이 된 `public/` 자산(`icon/toggle_active.svg`·`search.svg`와 정리 보고서 1-3절 목록)은 바깥에서 주소로 부를 수 있어 남겨 두었다. 공용 SCSS·유틸 안의 안 쓰는 항목(정리 보고서 4절)도 그대로다.

## 범위 밖

- 소개 화면(`pages/about.tsx`, `styles/Brand.module.scss`)
- 서버 코드 (배너 수정 버그 등은 0단계에서 이슈로만 남김)
- 상세 본문의 걸러내기(보안), 로그인 실패 시 로그아웃되는 동작, 토큰이 주소에 실리는 방식: 리디자인과 별개로 다룹니다.
