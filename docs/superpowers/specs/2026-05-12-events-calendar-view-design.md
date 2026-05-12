# `/events` 캘린더 보기 추가 — 디자인 스펙

- **작성일**: 2026-05-12
- **작성**: 고언약
- **상태**: Draft (브레인스토밍 완료, 구현 계획 수립 전)
- **관련 페이지**: `/events`, `/calender` (deprecate)

---

## 1. 배경 & 목표

`/events` 페이지는 현재 진행/예정 이벤트를 카드 리스트로만 보여준다. "이번 달에 어떤 행사가 어느 날 있는지" 한눈에 보고 싶다는 요구가 있어, **캘린더 보기 모드**를 추가한다.

기존 `/calender?year=YYYY&month=MM` 페이지는 이름과 달리 실제 달력 격자가 아니라 "해당 월에 해당하는 이벤트 리스트"였다. 이번 작업으로 캘린더 그리드 UX를 도입하고, 라우트는 `/events` 한 곳으로 통합한다.

### 성공 기준
- `/events` 페이지에서 한 번의 토글로 리스트 ↔ 캘린더 전환이 가능하다.
- 캘린더 모드에서 한 달의 이벤트가 시각적 격자로 노출된다 (다중일 이벤트는 연속 막대로).
- 모바일에서 격자가 깨지지 않고 사용 가능한 형태로 전환된다.
- 기존 `/calender` 북마크가 깨지지 않는다 (리디렉트 처리).

---

## 2. 확정 결정 사항 (브레인스토밍 결과)

| # | 결정 | 비고 |
|---|------|------|
| D1 | 캘린더는 `/events` 페이지 안의 **뷰 모드 토글**로 구현 (옵션 A) | 한 페이지에서 두 시각 |
| D2 | 모바일은 **점(dot) 캘린더 + 선택일 상세 패널** (옵션 1) | 격자 시각은 유지, 텍스트는 한 단계 아래로 |
| D3 | 셀 클릭 → **그 날 이벤트 리스트 (모달/시트)** → 카드 클릭으로 상세 페이지 (옵션 C) | 데스크탑/모바일 일관 |
| D4 | 기본 뷰는 리스트 (기존 동작 보존) | 사용자 놀라지 않음 |
| D5 | URL이 진실의 근원: `/events?view=calendar&year=YYYY&month=M` | 공유/뒤로가기/SSR 친화 |
| D6 | 필터 칩 상태는 두 뷰 간 유지 | 컨텍스트 기반, 추가 작업 없음 |
| D7 | 기존 `/calender` → `307` 리디렉트 to `/events?view=calendar&...` | 북마크/SEO 보호 |
| D8 | 캘린더 그리드는 `event_time_type === 'DATE'` 만 표시 (RECRUIT 제외) | 그리드 가독성 보호 |
| D9 | 다중일 이벤트는 시작~종료 셀에 걸친 **연속 막대**로 렌더 | |
| D10 | 셀당 칩 한도(데스크탑 2, 모바일 점 3) 초과 시 `+N 더보기` 표기 | 셀 높이 폭주 방지 |
| D11 | 데이터 호출은 기존 `/front/v2/events/{year}/{month}` 활용 | 신규 API 불필요 |

### 비목표
- 주(week) / 일(day) 뷰
- 드래그앤드롭, 인라인 편집
- iCal / 캘린더 내보내기
- 즐겨찾기 이벤트만 보는 캘린더 필터
- 키보드 네비게이션 (follow-up)

---

## 3. 컴포넌트 구조

### 신규 파일

```
components/events/calendar/
├── CalendarView.tsx              # 뷰 진입점, viewport 분기 (desktop ↔ mobile)
├── CalendarHeader.tsx            # "‹ 2026년 5월 › / 오늘" 월 네비게이션
├── CalendarGrid.tsx              # 데스크탑 7×6 그리드
├── CalendarDotGrid.tsx           # 모바일 점 캘린더
├── DayDetailSheet.tsx            # 셀 클릭 시 그 날 이벤트 리스트
├── ViewToggle.tsx                # "📋 리스트 / 📅 캘린더" 세그먼트
├── CalendarView.module.scss
└── utils/
    ├── buildCalendarMatrix.ts    # year/month → 6주×7일 Date 행렬
    ├── layoutMultiDayEvents.ts   # 이벤트 → 주 단위 segment 배치
    └── tagColor.ts               # 태그명 → KTB 색
```

### 변경되는 파일

| 파일 | 변경 |
|------|------|
| `pages/events.tsx` | `view`/`year`/`month` 쿼리 읽기 → 리스트 vs `CalendarView` 분기. SSR에서 모드별 API 호출. `ViewToggle` 마운트 |
| `pages/calender.tsx` | 컴포넌트 본체 제거, `getServerSideProps`에서 `/events?view=calendar&year=&month=`로 307 리디렉트만 처리 |
| `lib/hooks/useSWR.ts` | 신규 `useMonthlyEvents(year, month, fallbackData)` 추가 |
| `components/features/filters/EventFilter.tsx` | 두 뷰에서 동일 동작 검증 (코드 변경 가능성 낮음) |

### 책임 분리

- **`CalendarView`**: 디바이스 분기, 선택일 상태, 데이터 페치 트리거. 자체 UI는 최소.
- **`CalendarGrid` / `CalendarDotGrid`**: 받은 props만으로 순수 렌더, 내부 상태 없음.
- **`DayDetailSheet`**: 선택일 이벤트 배열 표시. 카드 디자인은 기존 `components/common/item/Item` 재사용.
- **`utils/*`**: 순수 함수, 단위 테스트 가능.

---

## 4. 데이터 흐름

### URL 상태 모델

```
/events                                       → 리스트 (기본)
/events?view=list                             → 리스트 (명시적)
/events?view=calendar                         → 캘린더, 현재 월
/events?view=calendar&year=2026&month=5       → 캘린더, 특정 월
```

규칙
- `view` 없거나 `list` → 리스트
- `view=calendar` 인데 `year`/`month` 없음 → SSR 시점의 현재 년/월로 폴백
- `year=NaN`/`month=NaN` → 현재 년/월로 폴백
- 모드 전환 / 월 이동은 `router.push({ query }, undefined, { shallow: true })`

### SSR 분기 (의사 코드)

```ts
// pages/events.tsx
getServerSideProps(ctx) {
  const view = (ctx.query.view ?? 'list') === 'calendar' ? 'calendar' : 'list';

  if (view === 'calendar') {
    const now = dayjs().tz('Asia/Seoul');
    const year  = Number(ctx.query.year)  || now.year();
    const month = Number(ctx.query.month) || now.month() + 1;
    const res = await fetch(`${BASE}/front/v2/events/${year}/${month}`);
    return { props: { view, year, month, fallbackData: await res.json() } };
  }

  const res = await fetch(`${BASE}/front/v2/events/current`);
  return { props: { view: 'list', fallbackData: await res.json() } };
}
```

### 클라이언트 데이터

- 리스트: 기존 `useScheduledEvents(fallbackData)`
- 캘린더: 신규 `useMonthlyEvents(year, month, fallbackData)` — SWR key `['monthly', year, month]`
- 월 이동 시 SWR이 새 키로 fetch, 직전 달은 캐시에 남아 뒤로 가기 즉시 표시

### 토글 동작

```
"📅 캘린더" 클릭
  → URL → /events?view=calendar&year=&month=  (shallow push)
  → events.tsx가 view=calendar 감지 → <CalendarView /> 렌더
  → useMonthlyEvents(year, month) — SSR fallbackData 즉시 노출 + revalidate
```

### 다중일 이벤트 segment

`utils/layoutMultiDayEvents.ts`:
- 입력: `events: Event[]`, `weeks: Date[][]`
- 출력: `WeekSegments[]` — 주차별로 `{event, startCol, endCol, isStart, isEnd, isOutside}` 배열
- 한 이벤트가 주 경계를 넘어가면 주 단위로 쪼개 별도 segment 생성
- 같은 셀의 segment 정렬: `display_sequence` ASC → `start_date_time` ASC
- 셀당 표시 한도 초과 시 `hasOverflow: true`, 화면에서 `+N 더보기` 마커

---

## 5. 렌더링 규칙

### 뷰포트 분기

- `useMediaQuery('(max-width: 720px)')` 결과로 `CalendarGrid` vs `CalendarDotGrid` 선택
- breakpoint: **720px**

### 데스크탑 그리드 (`CalendarGrid`)

| 항목 | 값 |
|------|-----|
| 격자 | 7열 × 6행 (42칸 고정) |
| 셀 최소 높이 | 110px |
| 셀 패딩 | 8px |
| 셀 hover | bg `#F7F7FA` |
| outside 셀 | bg `#F7F7FA`, 글씨 `#8C8F9F` |
| 그리드 라인 | gap 1px / bg `#E8E8EE` |
| 외곽 라운드 | 8px |
| 일요일 숫자 | `#D91C29` |
| 토요일 숫자 | `#1D6CE0` |
| 오늘 | 숫자 배경 22px 원 `#0043FF`, 글씨 흰색 |

### 이벤트 칩 (데스크탑)

| 항목 | 값 |
|------|-----|
| 높이 | 약 20px |
| 폰트 | 11px / weight 500 |
| 배경 | `rgba(태그색, 0.08)` |
| 좌측 보더 | 2px solid `태그색` |
| 텍스트 색 | `태그색` |
| overflow | `ellipsis` 1줄 |
| 다중일 segment | 시작/끝 셀만 라운드, 가운데는 0. `margin-left/-right: -9px` 로 셀 경계 넘기 |

### 태그 색 매핑 (utils/tagColor.ts)

`model/tag.ts` 기반. 최종 키는 구현 단계에서 실제 태그명 보고 확정. 색 팔레트:

| 카테고리 | KTB 색 |
|----------|--------|
| 컨퍼런스 | `#0043FF` (Tech Blue) |
| 웨비나 / 세미나 | `#08785E` (Success) |
| 해커톤 / 공모전 | `#B45209` (Warning) |
| 네트워킹 / 밋업 | `#7A0CFF` (Violet) |
| 기본 / 미분류 | `#525463` (Gray-700) |

### 모바일 점 캘린더 (`CalendarDotGrid`)

| 항목 | 값 |
|------|-----|
| 셀 | `aspect-ratio: 1`, flex center |
| 점 | 4×4 원, 셀당 최대 3개 (초과 시 마지막은 회색 "+" 점) |
| 점 색 | 태그 색 |
| 선택일 outline | 2px `#0043FF` |
| 오늘 | 셀 배경 `#0043FF`, 글씨 흰색 |
| 셀 탭 → | 하단 `DayDetailSheet` 슬라이드 인 |

### 헤더 (`CalendarHeader`)

```
[‹]  2026년 5월  [›]   [오늘]                       [📋 리스트] [📅 캘린더]
```

- 좌측 월 네비 + "오늘" 버튼: 캘린더 모드에서만 노출
- 우측 `ViewToggle`: 두 모드 모두 노출
- sticky 적용 안 함 (MVP)

### 선택일 상세 (`DayDetailSheet`)

| 항목 | 값 |
|------|-----|
| 데스크탑 | `react-modal` 기반 중앙 모달 (`LoginModal` 패턴 재사용) |
| 모바일 | 하단 슬라이드 시트 (translateY 트랜지션) |
| 헤더 | `5월 14일 (목) · 행사 2건` + 닫기 |
| 본문 | 기존 `components/common/item/Item` 카드 재사용 |
| 다중일 보조 라벨 | `5/14 ~ 5/16 · 진행 1일차` |
| 빈 날짜 | "이 날은 등록된 행사가 없어요" + 가까운 다음 행사 이동 버튼 |
| 카드 클릭 | `/event/detail/{id}` 이동 |

### 캘린더 행렬

`utils/buildCalendarMatrix(year, month): Date[][]`
- 6행 × 7열 (일요일 시작)
- 첫/마지막 주의 빈 칸은 인접 월 날짜로 채우고 `isOutside: true` 표기
- `dayjs` + `Asia/Seoul` 고정

### 접근성 (MVP)

- 셀: `role="button" tabIndex={0}` + `aria-label="5월 14일 행사 1건"`
- 토글: `role="tablist"` / `aria-selected`
- 키보드 화살표 네비게이션은 follow-up

### 성능

- segment 계산은 `useMemo`로 `events`/`year`/`month` 변화 시만
- 그리드 42칸 고정 → 가상화 불필요
- `DayDetailSheet`는 열릴 때 lazy mount

---

## 6. 엣지 케이스

| 케이스 | 처리 |
|--------|------|
| 이벤트 0건인 달 | 그리드 그대로, 상단에 안내 문구 |
| 5주 vs 6주 표시 | **항상 6주(42칸) 고정** |
| 다중일이 월 경계 걸침 | 보이는 부분만 segment, outside 셀에도 흐리게 막대 |
| 같은 날 이벤트 N개 (데스크탑 ≥3) | 2개 표시 + `+N 더보기` |
| 같은 날 이벤트 N개 (모바일 ≥4) | 점 3개 + 회색 "+" 점 |
| `RECRUIT` 타입 | 그리드 제외, 시트에도 노출 안 함 (MVP) |
| `use_start_date_time_yn === 'N'` | 그리드 제외, 시트 하단 "날짜 미정 행사 N건" 별도 섹션 |
| 잘못된 URL 쿼리 | SSR에서 현재 년/월 폴백 |
| API 실패 | 기존 `EventNull` 빈 상태 |
| `/calender` 직접 접속 | 307 → `/events?view=calendar&year=&month=` |
| 토글 후 뒤로가기 | URL 기반이라 브라우저 히스토리 자연스럽게 |

---

## 7. 테스트 계획

### 유닛 테스트 (`utils/__tests__/`)

- `buildCalendarMatrix`:
  - 2026년 5월 → 42칸, 앞 5칸 outside (4/26~4/30), 뒤 6칸 outside (6/1~6/6)
  - 윤년 2월 / 평년 2월 / 12월(다음 해 1월 outside)
- `layoutMultiDayEvents`:
  - 단일일 → 단일 segment
  - 같은 주 다중일 → 1 segment, `isStart && isEnd`
  - 주 경계 걸침 → 2 segments
  - 월 경계 걸침 → outside segment 포함
  - 정렬: `display_sequence` 우선
- `tagColor`: 알려진 태그 매핑 / 미지 태그 폴백

### 컴포넌트 테스트

- `CalendarGrid`: events 주입 → 셀 수, segment 클래스(`span-start/mid/end`), `+N` 마커
- `CalendarDotGrid`: 점 개수/색/"+" 마커, 선택일 outline
- `DayDetailSheet`: 빈 날짜 안내, 카드 클릭 시 라우팅
- `ViewToggle`: 클릭 시 `router.push` 호출, 쿼리 변경

### 수동 QA 체크리스트

- [ ] 데스크탑 1280 / 1024 폭에서 그리드 깨짐 없음
- [ ] 모바일 375 / 360 폭에서 점 캘린더 정상
- [ ] 월 이동 후 브라우저 뒤로가기 정상 동작
- [ ] 토글 ↔ 필터 칩 ↔ 월 이동 조합 데이터 정합
- [ ] `/calender?year=2026&month=5` 직접 접속 → 307 리디렉트 확인
- [ ] 다중일 이벤트(예: 5/14~5/16)가 연속 막대로 보임
- [ ] 오늘(5/12) 강조 정상
- [ ] DayDetailSheet에서 카드 클릭 → 이벤트 상세 페이지 정상 이동
- [ ] `RECRUIT` 타입은 그리드에 안 보임 (리스트 모드에서는 그대로 보임)

---

## 8. 롤아웃

단일 PR, 단계별 커밋:

1. `utils/buildCalendarMatrix` + `layoutMultiDayEvents` + `tagColor` + 단위 테스트
2. `CalendarHeader` + `ViewToggle` + URL 상태 wiring
3. `CalendarGrid` (데스크탑) + 다중일 segment 렌더 + 스타일
4. `CalendarDotGrid` (모바일) + 선택일 상태
5. `DayDetailSheet` + 기존 `Item` 카드 재사용
6. `pages/events.tsx` SSR 분기 + `useMonthlyEvents` 훅 + `pages/calender.tsx` 307 redirect
7. 수동 QA + 스크린샷 첨부 PR 본문

피처 플래그는 도입하지 않는다 (UX 변경이고 데이터 호환성 이슈 없음, 기본 뷰가 리스트라 점진 노출).

---

## 9. 미정 / 후속 작업

- 키보드 네비게이션 (셀 ←↑→↓, Enter, Esc)
- 모바일 가로 스와이프로 월 이동
- 즐겨찾기 이벤트만 보는 캘린더 필터
- 주(week) / 일(day) 뷰
- iCal 내보내기
- `RECRUIT` 타입 별도 시각 (예: 배경 stripe 패턴)
