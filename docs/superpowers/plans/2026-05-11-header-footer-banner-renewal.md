# Header / Footer / Banner Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 전역 chrome(Header / Footer)과 `/events` Banner를 DESIGN.md(KTB Vapor) 토큰·타이포로 리뉴얼.

**Architecture:** SCSS module 4개 토큰·값 교체 + Banner 사이즈 다이어트 + Profile dropdown 미니 리디자인. JSX 변경 없음.

**Tech Stack:** Next.js 12 / React 17 / SCSS modules / 기존 vapor·ktb CSS 변수.

**User preferences:** 작업 중 git commit 없음. Plan 안 commit step 없음.

---

## File Structure

**Modified files (SCSS only):**
- `components/layout/header/Header.module.scss`
- `components/layout/header/HeaderTab.module.scss`
- `components/common/banner/banner.module.scss`
- `components/layout/footer/Footer.module.scss`

**Reused (변경 없음):** `styles/_color.scss`, `styles/Theme.scss`, 모든 TSX.

---

## Task 1: Header outer 토큰 cleanup

**Files:** `components/layout/header/Header.module.scss`

- [ ] **Step 1: border 토큰**

Find:
```scss
border-bottom: 1px solid $light-gray-4;
```
Replace with:
```scss
border-bottom: 1px solid var(--vapor-gray-300);
```

- [ ] **Step 2: toggle hover 토큰**

Find:
```scss
&:hover {
  background-color: var(--gray-5);
}
```
(inside `.toggle__container`)

Replace with:
```scss
&:hover {
  background-color: var(--vapor-gray-100);
}
```

- [ ] **Step 3: profile button svg 토큰**

Find:
```scss
svg path {
  fill: var(--gray-2);
}
```
(inside `.profile .profile-button`)

Replace with:
```scss
svg path {
  fill: var(--vapor-gray-500);
}
```

---

## Task 2: Profile dropdown 미니 리디자인

**Files:** `components/layout/header/Header.module.scss`

- [ ] **Step 1: `.profile-menu` 외곽 교체**

Find:
```scss
.profile-menu {
  animation-name: appearIn;
  animation-duration: 0.2s;
  animation-timing-function: linear;

  border-radius: 10px;
  width: 136px;
  height: 135px;
  padding: 0;
  left: 50%;
  top: 42px;
  margin-left: -102px;
  text-align: center;
  position: absolute;
  z-index: 1;
  background-color: #fff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
```

Replace with:
```scss
.profile-menu {
  animation: fadeIn 0.15s ease-out;

  border-radius: 12px;
  width: 160px;
  padding: 4px;
  left: 50%;
  top: 44px;
  margin-left: -128px;
  text-align: center;
  position: absolute;
  z-index: 1;
  background-color: var(--vapor-gray-000);
  box-shadow: 0 8px 24px rgba(0, 0, 64, 0.08), 0 0 0 1px var(--vapor-gray-300);
```

(height·고정값 제거, padding 4px로 inner 여백, animation 단순화)

- [ ] **Step 2: `&__item` 블록 교체**

Find:
```scss
&__item {
  padding: 0.5rem 1.813rem 0.5rem 1.813rem;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 0.875rem;
  color: #757575;
  font-weight: 400;
  cursor: pointer;
  height: 45px;

  &:hover {
    background: #ebebeb;
  }
  &:focus {
    background-color: #ebebeb;
  }
}
```

Replace with:
```scss
&__item {
  padding: 10px 16px;
  background-color: transparent;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--vapor-gray-800);
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--vapor-gray-100);
  }
  &:focus-visible {
    background-color: var(--vapor-gray-100);
    outline: none;
  }
}
```

(고정 height 제거, padding 정규화, 아이템 자체에 radius 추가 — 외곽 padding 4px와 어울림)

- [ ] **Step 3: first-child/last-child 모서리 처리 + caret 제거**

Find:
```scss
&__item:first-child {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
&__item:last-child {
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
```

및

```scss
.profile-menu::after {
  content: ' ';
  position: absolute;
  bottom: 100%;
  left: 102px;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent #ffffff transparent;
}
```

두 블록 전체 삭제. (아이템마다 8px radius가 있으므로 외곽 first/last 처리 불필요. caret도 제거.)

- [ ] **Step 4: keyframes 교체**

Find:
```scss
@keyframes appearIn {
  0% {
    height: 0px;
    opacity: 0%;
  }

  100% {
    height: 135px;
    opacity: 100%;
  }
}
```

Replace with:
```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Task 3: HeaderTab 토큰 cleanup

**Files:** `components/layout/header/HeaderTab.module.scss`

- [ ] **Step 1: tab-text 색상 교체**

Find:
```scss
.tab-text {
  font-size: 14px;
  line-height: 14px;
  color: var(--gray-2);
  font-weight: 500;

  &.active {
    color: #313234;
  }
}
```

Replace with:
```scss
.tab-text {
  font-size: 14px;
  line-height: 14px;
  color: var(--vapor-gray-600);
  font-weight: 500;

  &.active {
    color: var(--vapor-gray-900);
  }
}
```

- [ ] **Step 2: new-badge 색상 교체**

Find:
```scss
background-color: #3182f6;
```
(in `.new-badge`)

Replace with:
```scss
background-color: var(--ktb-tech-blue);
```

---

## Task 4: Banner 사이즈 다이어트 + 토큰

**Files:** `components/common/banner/banner.module.scss`

- [ ] **Step 1: `.banner` 외곽 — desktop 기본 height 축소**

Find:
```scss
.banner {
  position: relative;
  height: 30rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  padding: 0 20px;
  margin-top: $header_height;
  z-index: 0;
  overflow: hidden;
```

Replace `height: 30rem;` with:
```scss
  height: 28rem;
```

(나머지 라인 그대로)

- [ ] **Step 2: `.banner__title` 교체**

Find:
```scss
&__title {
  font-size: 3.8rem;
  font-weight: 700;
  line-height: 5.1rem;
  letter-spacing: 0em;
  text-align: center;
  color: #ffffff;
  padding: 0px;
  margin: 0px;
  z-index: 1;
}
```

Replace with:
```scss
&__title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.012rem;
  text-align: center;
  color: #ffffff;
  padding: 0px;
  margin: 0px;
  z-index: 1;
}
```

- [ ] **Step 3: `.banner__desc` 교체**

Find:
```scss
&__desc {
  font-weight: 400;
  font-size: 1.23rem;
  line-height: 1.813rem;
  text-align: center;
  color: #ffffff;
  padding-top: 1.938rem;
  padding-bottom: 0px;
  margin: 0px;
  z-index: 1;
  &--bold {
    font-weight: bold;
  }
}
```

Replace with:
```scss
&__desc {
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.5;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  padding-top: 1.5rem;
  padding-bottom: 0px;
  margin: 0px;
  z-index: 1;
  &--bold {
    font-weight: 700;
  }
}
```

- [ ] **Step 4: `@include laptop` 미디어 교체**

Find:
```scss
@include laptop {
  @media (max-width: 1075px) {
    .banner {
      width: 100%;
      height: 28rem;
    }
  }
  @media (max-width: 800px) {
    .banner {
      width: 100%;
      height: 26rem;
      &__title {
        font-size: 3.4rem;
        line-height: 4.5rem;
      }
      &__desc {
        font-size: 1rem;
      }
    }
  }
}
```

Replace with:
```scss
@include laptop {
  @media (max-width: 1075px) {
    .banner {
      width: 100%;
      height: 24rem;
      &__title {
        font-size: 2.75rem;
      }
    }
  }
  @media (max-width: 800px) {
    .banner {
      width: 100%;
      height: 22rem;
      &__title {
        font-size: 2.5rem;
        line-height: 1.2;
      }
      &__desc {
        font-size: 1rem;
      }
    }
  }
}
```

- [ ] **Step 5: `@include tablet` 미디어 교체**

Find:
```scss
@include tablet {
  .banner {
    width: 100%;
    height: 24rem;
    &__title {
      font-size: 3rem;
      line-height: 4rem;
    }
    &__desc {
      font-size: 1rem;
    }
  }
  @media (max-width: 500px) {
    .banner {
      width: 100%;
      height: 22rem;
      &__title {
        font-size: 2.3rem;
        line-height: 3rem;
      }
      &__desc {
        font-size: 1rem;
      }
    }
  }
  @media (max-width: 400px) {
    .banner {
      &__title {
        font-size: 2.1rem;
        line-height: 3rem;
      }
      &__desc {
        font-size: 0.9rem;
      }
    }
  }
}
```

Replace with:
```scss
@include tablet {
  .banner {
    width: 100%;
    height: 22rem;
    &__title {
      font-size: 2.125rem;
      line-height: 1.2;
    }
    &__desc {
      font-size: 1rem;
    }
  }
  @media (max-width: 500px) {
    .banner {
      width: 100%;
      height: 20rem;
      &__title {
        font-size: 1.875rem;
        line-height: 1.2;
      }
      &__desc {
        font-size: 1rem;
      }
    }
  }
  @media (max-width: 400px) {
    .banner {
      &__title {
        font-size: 1.75rem;
        line-height: 1.2;
      }
      &__desc {
        font-size: 0.9rem;
      }
    }
  }
}
```

- [ ] **Step 6: `@include mobile` 미디어 교체**

Find:
```scss
@include mobile {
  .banner {
    width: 100%;
    height: 18rem;
    &__title {
      font-size: 2rem;
      line-height: 2.5rem;
    }
    &__desc {
      font-size: 0.9rem;
    }
  }
}
```

Replace with:
```scss
@include mobile {
  .banner {
    width: 100%;
    height: 18rem;
    &__title {
      font-size: 1.75rem;
      line-height: 1.2;
    }
    &__desc {
      font-size: 0.9rem;
    }
  }
}
```

(높이는 18rem 유지, title만 절제)

---

## Task 5: Footer 토큰 + max-width + 아이콘 row gap

**Files:** `components/layout/footer/Footer.module.scss`

- [ ] **Step 1: 컨테이너 교체**

Find:
```scss
.footer {
  width: 100%;
  max-width: 1104px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: var(--background-1);
```

Replace with:
```scss
.footer {
  width: 100%;
  max-width: 1200px;
  min-height: 200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: var(--vapor-gray-000);
```

(height fixed → min-height, max-width 1200, padding 추가, background 토큰)

- [ ] **Step 2: `&__column` 텍스트 토큰 교체**

Find:
```scss
&__column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  .footer__desc {
    color: var(--gray-2);
    font-size: 16px;
    margin-top: 1rem;
  }
  .footer__copyright {
    color: var(--gray-3);
    font-size: 16px;
    margin-top: 3rem;
  }
}
```

Replace with:
```scss
&__column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  .footer__desc {
    color: var(--vapor-gray-700);
    font-size: 14px;
    font-weight: 500;
    margin-top: 1rem;
  }
  .footer__copyright {
    color: var(--vapor-gray-500);
    font-size: 14px;
    font-weight: 500;
    margin-top: 3rem;

    a {
      color: var(--ktb-tech-blue);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--ktb-tech-navy-hover);
        text-decoration: underline;
      }
    }
  }
}
```

- [ ] **Step 3: `&__row` 아이콘 영역에 gap 추가**

Find:
```scss
&__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: 32px;
  right: 0;
}
```

Replace with:
```scss
&__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  position: absolute;
  bottom: 32px;
  right: 32px;
}
```

(right 0 → 32 — 컨테이너 padding과 정렬)

- [ ] **Step 4: `@include tablet` 교체**

Find:
```scss
@include tablet {
  .footer {
    padding: 32px $tablet_padding;
    //padding: 32px 0;
    display: block;
    max-width: 1271px;

    &__column {
      .footer__desc,
      .footer__copyright {
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
      }
    }

    // 바로가기 Github & Whale 아이콘
    &__row {
      padding-right: $tablet_padding;
      bottom: 32px;
    }
  }
}
```

Replace with:
```scss
@include tablet {
  .footer {
    padding: 32px;
    display: block;

    &__column {
      .footer__desc,
      .footer__copyright {
        display: inline-block;
        font-size: 13px;
        font-weight: 500;
      }
    }

    // 바로가기 Github & Whale 아이콘
    &__row {
      right: 32px;
      bottom: 32px;
    }
  }
}
```

- [ ] **Step 5: `@include mobile` 교체**

Find:
```scss
@include mobile {
  .footer {
    display: block;
    padding: 32px 20px;
    width: 100%;

    &__column {
      .footer__desc,
      .footer__copyright {
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
      }
    }

    // 바로가기 Github & Whale 아이콘
    &__row {
      right: 18px;
      bottom: 0;
    }
  }
}
```

Replace with:
```scss
@include mobile {
  .footer {
    display: block;
    padding: 32px 16px;
    width: 100%;

    &__column {
      .footer__desc,
      .footer__copyright {
        display: inline-block;
        font-size: 13px;
        font-weight: 500;
      }
    }

    // 바로가기 Github & Whale 아이콘
    &__row {
      right: 16px;
      bottom: 0;
    }
  }
}
```

---

## Task 6: 빌드·시각·토큰 검증

**Files:** 변경 없음 (검증만)

- [ ] **Step 1: 잔여 하드코딩 검증**

Run:
```bash
grep -nE '#[0-9a-fA-F]{3,6}|\$light-gray|var\(--gray-[0-9]\)|var\(--background-1\)|var\(--text-1\)' \
  /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People/components/layout/header/Header.module.scss \
  /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People/components/layout/header/HeaderTab.module.scss \
  /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People/components/common/banner/banner.module.scss \
  /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People/components/layout/footer/Footer.module.scss
```

Expected: 결과에서 `#ffffff` 외 하드코딩 hex가 없어야 하고, `$light-gray`·`var(--gray-N)`·`var(--background-1)`·`var(--text-1)` 모두 0건. `hsla()` / `rgba()` 안의 hex/rgb 값은 무시.

- [ ] **Step 2: lint**

Run: `cd /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People && pnpm lint`
Expected: PASS (warning 무관)

- [ ] **Step 3: build**

Run: `cd /Users/user/Desktop/dev-lab/Dev-Event-Web-Brave-People && pnpm build`
Expected: 빌드 성공

- [ ] **Step 4: 시각 검증** — `pnpm dev` 실행 후 브라우저로 확인:

- `http://localhost:5000/events` — Header frosted, Banner 작아진 타이틀, Footer 정렬
- Profile 클릭 → dropdown이 caret 없이 fade-in
- Footer 링크가 ktb-tech-blue
- 다크 테마 토글 (있으면): 모든 영역 자연 반전

뷰포트별 깨짐 없음: 1200+, 1075, 800, 500, 400, ≤480.

---

## Self-Review Notes

- **Spec coverage:** spec의 모든 섹션(Header / Profile dropdown / HeaderTab / Banner sizing / Footer / 검증)에 매칭되는 task 존재.
- **No placeholders:** 모든 step에 구체 코드와 명령어 포함.
- **Type consistency:** 색상 토큰명 일관 (`--vapor-gray-*`, `--ktb-tech-blue`, `--ktb-tech-navy-hover`), `fadeIn` keyframe 이름 Task 2 Step 1/4에서 동일.
- **Commit policy:** 사용자 지시에 따라 commit step 제외.
