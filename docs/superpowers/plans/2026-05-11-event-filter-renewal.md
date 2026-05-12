# Event Filter Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/events` ScheduledEventList 컨테이너(필터/검색/페이지네이션)를 DESIGN.md(KTB Vapor) 토큰·정형값으로 정렬.

**Architecture:** SCSS module 8개 토큰 교체 + radius `2.9881px` → `8px` + border `1.5px` → `1px` + hover 매직값 정리. JSX 변경 없음.

**Tech Stack:** Next.js 12 / SCSS modules / 기존 vapor·ktb CSS 변수.

**User preferences:** 작업 중 git commit 없음. Plan 안 commit step 없음.

---

## File Structure

**Modified files (SCSS only):**
- `components/features/filters/EventFilter.module.scss`
- `components/features/register/Register.module.scss`
- `components/common/buttons/FillButton.module.scss`
- `components/common/tag/JobGroupTag.module.scss`
- `components/common/input/BasicInput.module.scss`
- `components/common/dropdown/BasicDropdown.module.scss`
- `components/common/date/DateBoard.module.scss`
- `components/common/date/DateElement.module.scss`

---

## Task 1: EventFilter — 페이지 타이틀 + toggle hover

**Files:** `components/features/filters/EventFilter.module.scss`

- [ ] **Step 1: 페이지 타이틀 `.block__desc` 색상·letter-spacing**

Find:
```scss
&__desc {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 40px;
  line-height: 3rem;
  color: var(--gray-1);
}
```

Replace with:
```scss
&__desc {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 40px;
  line-height: 3rem;
  letter-spacing: -0.012rem;
  color: var(--vapor-gray-900);
}
```

- [ ] **Step 2: `.filter__group__toggle` hover bg — 3 군데 일괄**

`replace_all` 가능. Edit 도구 `replace_all: true` 로 다음 치환:

Old:
```scss
background-color: var(--gray-5);
```
New:
```scss
background-color: var(--vapor-gray-100);
```

(라ptop 700, tablet, mobile 블록 3 곳 모두 동일 라인 — replace_all 3건)

---

## Task 2: FillButton — primary/gray/white 색상

**Files:** `components/common/buttons/FillButton.module.scss`

- [ ] **Step 1: `.button` 기본 색상**

Find:
```scss
.button {
  @extend %button-base;
  color: var(--background-1);
  background-color: var(--gray-1);
```

Replace with:
```scss
.button {
  @extend %button-base;
  color: var(--vapor-gray-000);
  background-color: var(--vapor-gray-900);
```

- [ ] **Step 2: `&--primary` 교체**

Find:
```scss
&--primary {
  background-color: var(--primary);
  font-size: 14px;
}
```

Replace with:
```scss
&--primary {
  background-color: var(--ktb-tech-blue);
  font-size: 14px;
}
```

- [ ] **Step 3: `&--gray` 교체**

Find:
```scss
&--gray {
  background-color: var(--gray-1);
  font-size: 14px;
}
```

Replace with:
```scss
&--gray {
  background-color: var(--vapor-gray-900);
  font-size: 14px;
}
```

- [ ] **Step 4: `&--white` 교체**

Find:
```scss
&--white {
  background-color: var(--background-1);
  color: var(--primary);
  font-size: 14px;
}
```

Replace with:
```scss
&--white {
  background-color: var(--vapor-gray-000);
  color: var(--ktb-tech-blue);
  font-size: 14px;
}
```

---

## Task 3: Register — hover shadow

**Files:** `components/features/register/Register.module.scss`

- [ ] **Step 1: hover shadow 교체**

Find:
```scss
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(44, 76, 239, 0.2);
}
```

Replace with:
```scss
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 67, 255, 0.18);
}
```

---

## Task 4: JobGroupTag — base + hover + active

**Files:** `components/common/tag/JobGroupTag.module.scss`

- [ ] **Step 1: Base `.tag` 토큰**

Find:
```scss
.tag {
  min-width: 40px;
  padding-right: 16px;
  padding-left: 16px;
  height: 36px;
  font-weight: 500;
  color: var(--gray-1);
  border: 1px solid;
  border-color: var(--gray-4);
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  margin-top: 10px;
}
```

Replace with:
```scss
.tag {
  min-width: 40px;
  padding-right: 16px;
  padding-left: 16px;
  height: 36px;
  font-weight: 500;
  color: var(--vapor-gray-800);
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  margin-top: 10px;
}
```

- [ ] **Step 2: `.tag--light` hover**

Find:
```scss
.tag--light {
  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background-color: rgba(237, 239, 255, 1);
    cursor: pointer;
  }
}
```

Replace with:
```scss
.tag--light {
  &:hover {
    border-color: var(--ktb-tech-blue);
    color: var(--ktb-tech-blue);
    background-color: rgba(0, 67, 255, 0.08);
    cursor: pointer;
  }
}
```

- [ ] **Step 3: `.tag--dark` hover**

Find:
```scss
.tag--dark {
  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background-color: rgba(34, 35, 38, 1);
    cursor: pointer;
  }
}
```

Replace with:
```scss
.tag--dark {
  &:hover {
    border-color: var(--ktb-tech-blue);
    color: var(--ktb-tech-blue);
    background-color: var(--vapor-gray-950);
    cursor: pointer;
  }
}
```

- [ ] **Step 4: `.checked--light` active**

Find:
```scss
.checked--light {
  border-color: rgba(44, 76, 239, 1);
  color: rgba(44, 76, 239, 1);
  background-color: #edefff;
}
```

Replace with:
```scss
.checked--light {
  border-color: var(--ktb-tech-blue);
  color: var(--ktb-tech-blue);
  background-color: rgba(0, 67, 255, 0.08);
}
```

- [ ] **Step 5: `.checked--dark` active**

Find:
```scss
.checked--dark {
  border-color: rgba(79, 108, 255, 1);
  color: rgba(79, 108, 255, 1);
  background-color: rgba(34, 35, 38, 1);
}
```

Replace with:
```scss
.checked--dark {
  border-color: var(--ktb-tech-blue);
  color: var(--ktb-tech-blue);
  background-color: var(--vapor-gray-950);
}
```

---

## Task 5: BasicInput — radius/border/color

**Files:** `components/common/input/BasicInput.module.scss`

- [ ] **Step 1: `.container__input` 교체**

Find:
```scss
&__input {
  width: 100%;
  height: 100%;
  outline: none;
  background-color: var(--background-1);
  border: 1.5px solid;
  border-color: var(--gray-4);
  border-radius: 2.9881px;
  box-sizing: border-box;
  &:hover {
    border-color: rgba(170, 184, 255, 1);
  }
  &:focus {
    border-color: var(--primary);
  }
}
```

Replace with:
```scss
&__input {
  width: 100%;
  height: 100%;
  outline: none;
  background-color: var(--vapor-gray-000);
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  border-radius: 8px;
  box-sizing: border-box;
  &:hover {
    border-color: var(--vapor-gray-400);
  }
  &:focus {
    border-color: var(--ktb-tech-blue);
  }
}
```

- [ ] **Step 2: input text color**

Find:
```scss
input[type='text'] {
  padding-left: 55px;
  color: var(--gray-1);
}
```

Replace with:
```scss
input[type='text'] {
  padding-left: 55px;
  color: var(--vapor-gray-900);
}
```

- [ ] **Step 3: placeholder 교체 (중복 `font-weight` 정리)**

Find:
```scss
input::-webkit-input-placeholder {
  font-weight: bold;
  color: var(--gray-3);
  font-weight: 500;
}
```

Replace with:
```scss
input::-webkit-input-placeholder {
  color: var(--vapor-gray-500);
  font-weight: 500;
}
```

---

## Task 6: BasicDropdown — radius/border/color/hover

**Files:** `components/common/dropdown/BasicDropdown.module.scss`

- [ ] **Step 1: `.dropdown__header` 교체**

Find:
```scss
&__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 1.125rem 0 1.125rem;
  font-size: 1rem;
  color: var(--gray-1);
  font-weight: 400;
  cursor: pointer;
  background-color: var(--background-1);
  border: 1.5px solid;
  border-color: var(--gray-4);
  box-sizing: border-box;
  border-radius: 2.9881px;
  &:hover {
    border-color: rgba(170, 184, 255, 1);
  }
}
```

Replace with:
```scss
&__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 1.125rem 0 1.125rem;
  font-size: 1rem;
  color: var(--vapor-gray-900);
  font-weight: 400;
  cursor: pointer;
  background-color: var(--vapor-gray-000);
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  box-sizing: border-box;
  border-radius: 8px;
  &:hover {
    border-color: var(--vapor-gray-400);
  }
}
```

- [ ] **Step 2: `.dropdown__list` 교체 (shadow 추가)**

Find:
```scss
&__list {
  width: 100%;
  position: absolute;
  top: 40px;
  left: 0;
  animation-name: appearIn;
  animation-duration: 0.2s;
  animation-timing-function: linear;
  max-height: 12rem;
  background-color: var(--background-1);
  border-radius: 2.9881px;
  border: 1.5px solid;
  border-color: var(--gray-4);
  z-index: 50;
  overflow-y: scroll;
```

Replace with:
```scss
&__list {
  width: 100%;
  position: absolute;
  top: 40px;
  left: 0;
  animation-name: appearIn;
  animation-duration: 0.2s;
  animation-timing-function: linear;
  max-height: 12rem;
  background-color: var(--vapor-gray-000);
  border-radius: 8px;
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08);
  z-index: 50;
  overflow-y: scroll;
```

- [ ] **Step 3: `&__element` hover + color**

Find:
```scss
&__element {
  display: flex;
  justify-content: flex-start;
  padding-left: 1rem;
  align-items: center;
  width: 100%;
  height: 2.5rem;
  color: var(--gray-1);

  &:hover {
    cursor: pointer;
    background-color: var(--background-2);
  }
}
```

Replace with:
```scss
&__element {
  display: flex;
  justify-content: flex-start;
  padding-left: 1rem;
  align-items: center;
  width: 100%;
  height: 2.5rem;
  color: var(--vapor-gray-900);

  &:hover {
    cursor: pointer;
    background-color: var(--vapor-gray-050);
  }
}
```

- [ ] **Step 4: `.selected__light` 교체**

Find:
```scss
.selected__light {
  font-weight: 700;
  color: var(--primary);
  background-color: rgba(237, 239, 255, 1);
}
```

Replace with:
```scss
.selected__light {
  font-weight: 700;
  color: var(--ktb-tech-blue);
  background-color: rgba(0, 67, 255, 0.08);
}
```

- [ ] **Step 5: `.selected__dark` 교체**

Find:
```scss
.selected__dark {
  font-weight: 700;
  color: var(--primary);
  background-color: rgba(34, 35, 38, 1);
}
```

Replace with:
```scss
.selected__dark {
  font-weight: 700;
  color: var(--ktb-tech-blue);
  background-color: var(--vapor-gray-950);
}
```

- [ ] **Step 6: scrollbar thumb + focus 교체**

Find:
```scss
&::-webkit-scrollbar-thumb {
  width: 5px;
  border-radius: 4px;
  background-color: #c4c4c4;
}
```

Replace with:
```scss
&::-webkit-scrollbar-thumb {
  width: 5px;
  border-radius: 4px;
  background-color: var(--vapor-gray-400);
}
```

Find:
```scss
.dropdown__header__focus {
  border-color: var(--primary);
}
```

Replace with:
```scss
.dropdown__header__focus {
  border-color: var(--ktb-tech-blue);
}
```

---

## Task 7: DateBoard — pagination container

**Files:** `components/common/date/DateBoard.module.scss`

- [ ] **Step 1: `.container` 교체**

Find:
```scss
.container {
  position: relative;
  width: 100%;
  min-width: 14rem;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--background-1);
  border: 1.5px solid;
  border-color: var(--gray-4);
  border-radius: 2.9881px;

  &:hover {
    border-color: rgba(170, 184, 255, 1);
  }
```

Replace with:
```scss
.container {
  position: relative;
  width: 100%;
  min-width: 14rem;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--vapor-gray-000);
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  border-radius: 8px;

  &:hover {
    border-color: var(--vapor-gray-400);
  }
```

- [ ] **Step 2: `.key--active` hover bg**

Find:
```scss
.key--active {
  min-width: 3rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.1s linear;
  &:hover {
    cursor: pointer;
    background-color: var(--background-2);
  }
}
```

Replace with:
```scss
.key--active {
  min-width: 3rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.1s linear;
  &:hover {
    cursor: pointer;
    background-color: var(--vapor-gray-050);
  }
}
```

- [ ] **Step 3: `.key--left` / `.key--right` radius**

Find:
```scss
.key--left {
  border-radius: 2.9881px 0 0 2.9881px;
}

.key--right {
  border-radius: 0 2.9881px 2.9881px 0;
}
```

Replace with:
```scss
.key--left {
  border-radius: 8px 0 0 8px;
}

.key--right {
  border-radius: 0 8px 8px 0;
}
```

- [ ] **Step 4: `.dropdown__header` color**

Find:
```scss
&__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1rem;
  color: var(--gray-1);
  font-weight: 400;
  cursor: pointer;
}
```

Replace with:
```scss
&__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1rem;
  color: var(--vapor-gray-900);
  font-weight: 400;
  cursor: pointer;
}
```

- [ ] **Step 5: `.dropdown__list` 교체 (shadow 추가)**

Find:
```scss
&__list {
  width: 14rem;
  height: 265px;
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  overflow: hidden;
  animation-name: appearIn;
  animation-duration: 0.2s;
  animation-timing-function: linear;
  background-color: var(--background-1);
  border-radius: 2.9881px;
  border: 1.5px solid;
  border-color: var(--gray-4);
  z-index: 50;
```

Replace with:
```scss
&__list {
  width: 14rem;
  height: 265px;
  position: absolute;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  overflow: hidden;
  animation-name: appearIn;
  animation-duration: 0.2s;
  animation-timing-function: linear;
  background-color: var(--vapor-gray-000);
  border-radius: 8px;
  border: 1px solid;
  border-color: var(--vapor-gray-300);
  box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08);
  z-index: 50;
```

- [ ] **Step 6: `&__year` color**

Find:
```scss
&__year {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray-1);
```

Replace with:
```scss
&__year {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--vapor-gray-900);
```

- [ ] **Step 7: `.container__focus`**

Find:
```scss
.container__focus {
  border-color: var(--primary);
  &:hover {
    border-color: var(--primary);
  }
}
```

Replace with:
```scss
.container__focus {
  border-color: var(--ktb-tech-blue);
  &:hover {
    border-color: var(--ktb-tech-blue);
  }
}
```

---

## Task 8: DateElement — pagination elements

**Files:** `components/common/date/DateElement.module.scss`

- [ ] **Step 1: `.date__element` 데스크탑 교체**

Find:
```scss
&__element {
  width: 52px;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  margin: 5px;
  border: 1px solid;
  color: var(--gray-1);
  border-color: var(--gray-4);

  &:hover {
    cursor: pointer;
    background-color: var(--background-2);
  }
}
```

Replace with:
```scss
&__element {
  width: 52px;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  margin: 5px;
  border: 1px solid;
  color: var(--vapor-gray-900);
  border-color: var(--vapor-gray-300);

  &:hover {
    cursor: pointer;
    background-color: var(--vapor-gray-050);
  }
}
```

- [ ] **Step 2: `.date__invalid` 교체**

Find:
```scss
&__invalid {
  user-select: none;
  color: var(--gray-5);
  border-color: var(--gray-5);
  background-color: transparent;
  &:hover {
    cursor: auto;
    background-color: transparent;
  }
}
```

Replace with:
```scss
&__invalid {
  user-select: none;
  color: var(--vapor-gray-400);
  border-color: var(--vapor-gray-200);
  background-color: transparent;
  &:hover {
    cursor: auto;
    background-color: transparent;
  }
}
```

- [ ] **Step 3: `.light--selected` 데스크탑**

Find:
```scss
.light--selected {
  border-color: var(--primary);
  background-color: rgba(237, 239, 255, 1);
  color: var(--primary);
}
```

Replace with:
```scss
.light--selected {
  border-color: var(--ktb-tech-blue);
  background-color: rgba(0, 67, 255, 0.08);
  color: var(--ktb-tech-blue);
}
```

- [ ] **Step 4: `.dark--selected` 데스크탑**

Find:
```scss
.dark--selected {
  border-color: var(--primary);
  background-color: rgba(34, 35, 38, 1);
  color: var(--primary);
}
```

Replace with:
```scss
.dark--selected {
  border-color: var(--ktb-tech-blue);
  background-color: var(--vapor-gray-950);
  color: var(--ktb-tech-blue);
}
```

- [ ] **Step 5: tablet `&__element` 블록 교체 (동일 매핑)**

Find (tablet 미디어 내부):
```scss
&__element {
  width: 68px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  margin: 5px;
  border: 1px solid;
  color: var(--gray-1);
  border-color: var(--gray-4);

  &:hover {
    cursor: pointer;
    background-color: var(--background-2);
  }
}
```

Replace with:
```scss
&__element {
  width: 68px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  margin: 5px;
  border: 1px solid;
  color: var(--vapor-gray-900);
  border-color: var(--vapor-gray-300);

  &:hover {
    cursor: pointer;
    background-color: var(--vapor-gray-050);
  }
}
```

- [ ] **Step 6: tablet `&__invalid` 블록 교체**

Find (tablet 미디어 내부):
```scss
&__invalid {
  user-select: none;
  color: var(--gray-5);
  border-color: var(--gray-5);
  background-color: transparent;
  &:hover {
    cursor: auto;
    background-color: transparent;
  }
}
```

Replace with:
```scss
&__invalid {
  user-select: none;
  color: var(--vapor-gray-400);
  border-color: var(--vapor-gray-200);
  background-color: transparent;
  &:hover {
    cursor: auto;
    background-color: transparent;
  }
}
```

- [ ] **Step 7: tablet `.light--selected` / `.dark--selected` 교체**

Find (tablet 미디어 내부):
```scss
.light--selected {
  border-color: var(--primary);
  background-color: rgba(237, 239, 255, 1);
  color: var(--primary);
}

.dark--selected {
  border-color: var(--primary);
  background-color: rgba(34, 35, 38, 1);
  color: var(--primary);
}
```

Replace with:
```scss
.light--selected {
  border-color: var(--ktb-tech-blue);
  background-color: rgba(0, 67, 255, 0.08);
  color: var(--ktb-tech-blue);
}

.dark--selected {
  border-color: var(--ktb-tech-blue);
  background-color: var(--vapor-gray-950);
  color: var(--ktb-tech-blue);
}
```

---

## Task 9: 빌드·토큰 검증

**Files:** 변경 없음 (검증만)

- [ ] **Step 1: 잔여 매직값 / legacy 토큰 검증**

Run:
```bash
grep -nE '2\.9881px|1\.5px solid|var\(--gray-[0-9]\)|var\(--background-[0-9]\)|var\(--primary\)|var\(--text-1\)|rgba\(170,\s*184,\s*255' \
  components/features/filters/EventFilter.module.scss \
  components/features/register/Register.module.scss \
  components/common/buttons/FillButton.module.scss \
  components/common/tag/JobGroupTag.module.scss \
  components/common/input/BasicInput.module.scss \
  components/common/dropdown/BasicDropdown.module.scss \
  components/common/date/DateBoard.module.scss \
  components/common/date/DateElement.module.scss
```

Expected: 결과 비어있어야 함.

- [ ] **Step 2: lint**

Run: `cd /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People && pnpm lint`
Expected: PASS (warning 무관)

- [ ] **Step 3: build**

Run: `cd /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People && pnpm build`
Expected: 빌드 성공

- [ ] **Step 4: 시각 검증** — `pnpm dev` (포트 5000) 실행 후 브라우저로 `/events` 확인:

- 페이지 타이틀 "전체 행사" gray-900 + letter-spacing 적용
- 카테고리 칩 hover/active 시 ktb-tech-blue + 8% tint 배경
- 검색바 focus 시 ktb-tech-blue 1px border
- 드롭다운 3종 (행사 유형, 참여 방법, 비용): 닫힘 1px gray-300, 열림 ktb-tech-blue, 항목 hover gray-050
- 〈 전체 〉 페이지네이션: 8px radius, 1px border, gray-400 hover
- "+ 행사 등록 요청" 버튼: ktb-tech-blue 배경, hover 부드러운 lift + 톤다운 그림자

---

## Self-Review Notes

- **Spec coverage:** spec의 모든 섹션(EventFilter / FillButton / Register / JobGroupTag / BasicInput / BasicDropdown / DateBoard / DateElement)에 매칭되는 task 존재.
- **No placeholders:** 모든 step에 구체 SCSS 코드와 명령어 포함.
- **Type consistency:** 토큰 이름 일관 (`--vapor-gray-*`, `--ktb-tech-blue`), 매직값 → 표준값 (`2.9881px` → `8px`, `1.5px` → `1px`) 모든 task에서 동일.
- **Commit policy:** commit step 제외.
