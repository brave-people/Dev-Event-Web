# Event Detail Page Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/event/detail/[eventId]` 페이지를 DESIGN.md(KTB Vapor) 토큰으로 리뉴얼하고 행사 목록 카드와 시각적 연속성을 확보한다.

**Architecture:** SCSS module 전면 리라이트 + JSX 마이크로 변경(DdayTag 마운트 / FilterTag 치환 / 아이콘 컬러 토큰화). 데스크탑(≥1200) hero는 `400px 1fr` 2-column 5:3 썸네일 + flex info, 모바일(≤1199)은 stacked. 본문은 흰 캔버스 flat + divider, 빈 상태만 gray-050 카드.

**Tech Stack:** Next.js 12 / React 17 / SCSS modules / `classnames/bind` / 기존 `DdayTag` · `FilterTag` 컴포넌트 재사용.

**User preferences:** 사용자는 작업 중 git commit을 원하지 않음. 각 Task 끝의 commit step은 선택사항이며 사용자 확인 없이 자동 commit하지 않는다.

---

## File Structure

**Modified files:**
- `styles/EventDetail.module.scss` — 전면 리라이트
- `pages/event/detail/[eventId].tsx` — JSX 마이크로 변경

**Reused (변경 없음):**
- `components/common/tag/DdayTag.tsx` / `.module.scss` — 이미 DESIGN.md 적용
- `components/common/tag/FilterTag.tsx` / `.module.scss` — 이미 DESIGN.md 적용
- `components/icons/ShareIcon.tsx`, `BookmarkIcon.tsx` — color prop만 토큰화
- `styles/_color.scss`, `styles/Theme.scss` — 이미 정비됨

---

## Task 1: 토큰 cleanup baseline

**의도:** 본격 리라이트 전에 현재 SCSS의 하드코딩 색상값을 토큰으로 1:1 치환한다. 이걸 먼저 분리하면 후속 작업에서 토큰 누락을 잡기 쉽다.

**Files:**
- Modify: `styles/EventDetail.module.scss` (전 영역 치환)

- [ ] **Step 1: 다음 매핑으로 일괄 치환**

| Before | After |
|--------|-------|
| `var(--text-1)` | `var(--vapor-gray-900)` |
| `var(--background-1)` | `var(--vapor-gray-000)` |
| `var(--gray-2)` (meta-label/value) | `var(--vapor-gray-700)` |
| `var(--gray-2)` (placeholder body) | `var(--vapor-gray-600)` |
| `#2c4cef` | `var(--ktb-tech-blue)` |
| `#1e3bcf` | `var(--ktb-tech-navy-hover)` |
| `#ebebeb` | `var(--vapor-gray-300)` |
| `#e1e2e6` | `var(--vapor-gray-300)` |
| `#d3d4d8` | `var(--vapor-gray-300)` |
| `#f5f5f5` | `var(--vapor-gray-100)` |
| `#f5f7ff` | `var(--vapor-gray-050)` |
| `#f9f9f9` | `var(--vapor-gray-050)` |
| `#e53e3e` | `var(--vapor-text-danger)` |

- [ ] **Step 2: 검증** — `grep -n '#[0-9a-fA-F]\{3,6\}' styles/EventDetail.module.scss` 결과가 비어있어야 한다. 비어있지 않으면 누락 토큰 찾아 추가 치환.

- [ ] **Step 3: 빌드 sanity** — `pnpm lint` 통과, 페이지 새로고침 시 시각적 regression 없음.

---

## Task 2: Hero 데스크탑 레이아웃 (≥1200px)

**의도:** hero 영역을 5:3 썸네일(400px 고정) + flex info 컬럼으로 재구성한다. 행사 목록 카드와 동일한 비율로 시각적 연속성을 만든다.

**Files:**
- Modify: `styles/EventDetail.module.scss` (`.event-detail__header`, `&__image-section`, `&__image`, `&__info-section` 블록)

- [ ] **Step 1: `&__header` 데스크탑 블록 교체**

`@media (min-width: 1200px)` 블록을 다음으로 교체:

```scss
@media (min-width: 1200px) {
  flex-direction: row;
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 32px;
  gap: 32px;
  min-height: auto;
}
```

- [ ] **Step 2: `&__image-section` 데스크탑 블록 교체**

```scss
@media (min-width: 1200px) {
  width: 400px;
  flex-shrink: 0;
}
```

aspect-ratio는 공통부에서 `5 / 3`로 통일 (기존 `400 / 223` 제거):

```scss
&__image-section {
  position: relative;
  aspect-ratio: 5 / 3;
  // ... 나머지 미디어쿼리 블록
}
```

- [ ] **Step 3: `&__image` border-radius·border 변경**

```scss
&__image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}
```

기존 `border: 1px solid` 라인은 제거 (KTB flat surfaces 철학).

- [ ] **Step 4: `&__info-section` 데스크탑 블록 교체**

```scss
@media (min-width: 1200px) {
  flex: 1;
  padding: 0;
  padding-right: 88px;
  position: relative;
}
```

`gap: 16px;`는 공통부에 유지.

---

## Task 3: Hero action 버튼 + organizer + title + meta + CTA 스타일

**Files:**
- Modify: `styles/EventDetail.module.scss` (`&__header-actions`, `&__organizer`, `&__title`, `&__meta`, `&__actions` 블록)

- [ ] **Step 1: `&__header-actions` 데스크탑 블록 단순화**

```scss
&__header-actions {
  display: flex;
  gap: 4px;

  @media (min-width: 1200px) {
    position: absolute;
    top: 0;
    right: 0;
  }

  // 모바일/태블릿 처리는 Task 5에서 (썸네일 위로 이동)

  .icon-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    padding: 4px;
    color: var(--vapor-gray-500);

    &:hover {
      background-color: var(--vapor-gray-100);
    }

    svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  }
}
```

기존 모바일 (`top: -10px`, `top: -2px`) absolute 매직넘버 블록은 Task 5에서 다시 정의하므로 일단 삭제.

- [ ] **Step 2: `&__organizer` 블록 교체**

```scss
&__organizer {
  display: flex;
  align-items: center;
  gap: 6px;

  .organizer-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--vapor-gray-600);
  }
}
```

`.organizer-badge`는 코드에서 주석 처리돼 있으므로 SCSS 블록도 제거.

- [ ] **Step 3: `&__title` 블록 교체**

```scss
&__title {
  font-weight: 700;
  font-size: 32px;
  line-height: 1.3;
  letter-spacing: -0.012rem;
  color: var(--vapor-gray-900);
  margin: 0;
  word-break: keep-all;

  @media (max-width: 1199px) {
    font-size: 24px;
  }

  @media (max-width: 600px) {
    font-size: 20px;
  }

  @media (max-width: 320px) {
    font-size: 18px;
  }
}
```

- [ ] **Step 4: `&__meta` 블록 교체**

```scss
&__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .meta-item {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .meta-label {
      font-weight: 500;
      font-size: 14px;
      line-height: 1.5;
      color: var(--vapor-gray-500);
      flex-shrink: 0;
    }

    .meta-value {
      font-weight: 500;
      font-size: 14px;
      line-height: 1.5;
      color: var(--vapor-gray-700);
    }
  }
}
```

- [ ] **Step 5: `&__actions` 블록 교체**

```scss
&__actions {
  display: flex;
  align-items: center;
  margin-top: 8px;

  .apply-btn {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: -0.012rem;
    color: #ffffff;
    background: var(--ktb-tech-blue);
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-self: flex-start;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    &:hover {
      background: var(--ktb-tech-navy-hover);
    }

    @media (max-width: 1199px) {
      width: 100%;
    }
  }
}
```

기존 `transform: translateY(-1px)` hover와 active reset 라인 제거.

---

## Task 4: 태그 컴포넌트를 FilterTag로 치환

**의도:** hero의 태그를 행사 목록과 동일한 `FilterTag` 컴포넌트로 통일. 별도 `.event-tag` 스타일 제거.

**Files:**
- Modify: `pages/event/detail/[eventId].tsx`
- Modify: `styles/EventDetail.module.scss` (`&__tags`, `.event-tag` 블록)

- [ ] **Step 1: TSX 상단 import 추가**

```tsx
import FilterTag from 'components/common/tag/FilterTag';
```

- [ ] **Step 2: 태그 렌더링 부분 (현재 `event-detail__tags` 안 `<span>` 매핑) 교체**

기존:
```tsx
<div className={cx('event-detail__tags')}>
  {eventData.tags?.map((tag, index) => (
    <span key={index} className={cx('event-tag')}>
      {tag.tag_name}
    </span>
  ))}
</div>
```

신규:
```tsx
<div className={cx('event-detail__tags')}>
  {eventData.tags?.map((tag, index) => (
    <FilterTag
      key={index}
      label={tag.tag_name}
      size="regular"
      type="location"
    />
  ))}
</div>
```

- [ ] **Step 3: SCSS `&__tags` 블록 교체**

```scss
&__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  @media (max-width: 600px) {
    gap: 4px;
  }
}
```

기존 `.event-tag` 블록 전체 제거 (수평 스크롤, border, padding 등) — FilterTag가 자체 스타일링.

---

## Task 5: Hero 모바일/태블릿 (≤1199px) — action 버튼 썸네일 위로 이동

**의도:** 좁은 viewport에서 action 버튼이 썸네일 좌상단에 오버레이되도록 (목록 카드와 동일 패턴). info 컬럼의 `padding-right`도 해제.

**Files:**
- Modify: `styles/EventDetail.module.scss`

- [ ] **Step 1: `&__header` 모바일 블록 정리**

```scss
@media (max-width: 1199px) {
  flex-direction: column;
  padding: 32px 32px;
  gap: 32px;
  min-height: auto;
}

@media (max-width: 600px) {
  padding: 24px 16px !important;
  gap: 24px;
}

@media (max-width: 320px) {
  padding: 24px 16px !important;
  gap: 16px;
}
```

- [ ] **Step 2: `&__image-section` 모바일 블록 정리**

```scss
@media (max-width: 1199px) {
  width: 100%;
}

@media (max-width: 600px) {
  max-height: none;
}

@media (max-width: 320px) {
  max-height: none;
}
```

(max-height 매직넘버 제거 — aspect-ratio가 비율 보장)

- [ ] **Step 3: `&__info-section` 모바일 블록 정리**

```scss
@media (max-width: 1199px) {
  width: 100%;
  position: relative;
  padding-right: 0;
}
```

- [ ] **Step 4: `&__header-actions` 모바일 블록 (썸네일 위 오버레이) 추가**

`&__header-actions` 블록 안에 다음 미디어쿼리 추가:

```scss
@media (max-width: 1199px) {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;

  .icon-btn {
    width: 32px;
    height: 32px;
    background-color: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);

    &:hover {
      background-color: rgba(255, 255, 255, 1);
    }
  }
}
```

위 블록 추가 후 기존의 `@media (min-width: 601px) and (max-width: 1199px)`, `@media (max-width: 600px)`, `@media (max-width: 320px)` action 버튼 블록은 모두 제거.

- [ ] **Step 5: `&__image-section`에 `position: relative;` 보장**

action 버튼이 썸네일 영역 기준 absolute여야 하므로 `&__image-section`이 relative 컨테이너인지 확인. 현재 코드 47라인 `position: relative;` 이미 있음 — 그대로 유지.

단, 모바일에서는 `&__header-actions`가 `&__image-section`의 자식이 아니라 `&__info-section`의 자식이다. 두 가지 방법 중 하나:

**방법 A (CSS만):** `&__header` 자체를 `position: relative;`로 두고 모바일 action 버튼은 헤더 기준 top/right 좌표를 계산 — 썸네일 폭이 100%이므로 top 12 right 12가 자연스럽게 썸네일 위로 떨어진다.

방법 A를 선택. `&__header { position: relative; }` 공통부에 추가:

```scss
&__header {
  width: 100%;
  display: flex;
  position: relative;  // 추가
  // ... 미디어쿼리들
}
```

이렇게 하면 action 버튼이 모바일에서 `top: 12; right: 12;` 일 때 헤더(=썸네일 시작점) 기준 우상단으로 정확히 떨어진다.

---

## Task 6: DdayTag 마운트 + 종료 오버레이

**Files:**
- Modify: `pages/event/detail/[eventId].tsx`
- Modify: `styles/EventDetail.module.scss` (`&__image__done`, `&__image__badge` 블록 추가)

- [ ] **Step 1: TSX import 추가**

```tsx
import DdayTag from 'components/common/tag/DdayTag';
```

- [ ] **Step 2: 종료 판정 헬퍼 추가 (`formatEventDate` 함수 위)**

```tsx
const isEventDone = (endDate: string): boolean => {
  return new Date(endDate).getTime() < Date.now();
};
```

- [ ] **Step 3: 컴포넌트 본문 상단(`const param =` 위)에서 한 번 계산**

```tsx
const eventDone = isEventDone(eventData.end_date_time);
```

- [ ] **Step 4: 썸네일 마크업 교체**

기존:
```tsx
<div className={cx('event-detail__image')}>
  <Image
    src={eventData.cover_image_link || '/default/event_img.png'}
    alt={eventData.title}
    layout="fill"
    objectFit="cover"
    unoptimized
  />
</div>
```

신규:
```tsx
<div className={cx('event-detail__image')}>
  <Image
    src={eventData.cover_image_link || '/default/event_img.png'}
    alt={eventData.title}
    layout="fill"
    objectFit="cover"
    unoptimized
  />
  {eventDone && <div className={cx('event-detail__image__done')} />}
  {!eventDone && (
    <div className={cx('event-detail__image__badge')}>
      <DdayTag
        startDateTime={eventData.start_date_time}
        endDateTime={eventData.end_date_time}
      />
    </div>
  )}
</div>
```

- [ ] **Step 5: SCSS 블록 추가** — `&__image` 블록 안에 자식 두 개 추가:

```scss
&__image {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;

  &__done {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    z-index: 1;
  }

  &__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
  }
}
```

---

## Task 7: 아이콘 컬러 토큰화

**Files:**
- Modify: `pages/event/detail/[eventId].tsx`

- [ ] **Step 1: `ShareIcon` / `BookmarkIcon` color prop 교체**

기존:
```tsx
<ShareIcon color="var(--gray-2)" />
// ...
<BookmarkIcon
  color={isBookmarked ? '#007AFF' : 'var(--gray-2)'}
  isFavorite={isBookmarked}
/>
```

신규:
```tsx
<ShareIcon color="var(--vapor-gray-500)" />
// ...
<BookmarkIcon
  color={isBookmarked ? 'var(--ktb-tech-blue)' : 'var(--vapor-gray-500)'}
  isFavorite={isBookmarked}
/>
```

---

## Task 8: 본문(마크다운) 영역 — 컨테이너 · divider · 타이포

**Files:**
- Modify: `styles/EventDetail.module.scss` (`&__content` 블록 전체)

- [ ] **Step 1: 컨테이너 패딩·divider 정리**

```scss
&__content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  gap: 24px;
  padding: 24px 32px 64px;
  border-top: 1px solid var(--vapor-gray-300);

  @media (max-width: 600px) {
    padding: 24px 16px 48px;
  }

  @media (max-width: 320px) {
    padding: 24px 16px 40px;
    gap: 20px;
  }
}
```

- [ ] **Step 2: `.content-description` 블록 — 본문 텍스트 토큰화**

```scss
.content-description {
  color: var(--vapor-gray-900);
  line-height: 1.6;
  max-width: none;

  p {
    margin: 0 0 16px 0;
    font-weight: 400;
    font-size: 16px;
    line-height: 1.5;

    @media (max-width: 320px) {
      font-size: 15px;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--vapor-gray-900);
    margin: 32px 0 16px 0;
    font-weight: 700;
    letter-spacing: -0.012rem;
    line-height: 1.3;

    &:first-child {
      margin-top: 0;
    }
  }

  h1 { font-size: 32px; @media (max-width: 320px) { font-size: 26px; } }
  h2 { font-size: 24px; @media (max-width: 320px) { font-size: 22px; } }
  h3 { font-size: 20px; @media (max-width: 320px) { font-size: 18px; } }
  h4 { font-size: 18px; @media (max-width: 320px) { font-size: 16px; } }
  h5 { font-size: 16px; @media (max-width: 320px) { font-size: 15px; } }
  h6 { font-size: 14px; @media (max-width: 320px) { font-size: 13px; } }

  hr {
    margin: 32px 0;
    border: none;
    border-top: 1px solid var(--vapor-gray-300);

    @media (max-width: 320px) {
      margin: 24px 0;
    }
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;

    li {
      margin: 8px 0;
      font-size: 16px;
      line-height: 1.6;
      color: var(--vapor-gray-900);

      @media (max-width: 320px) {
        font-size: 15px;
      }
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 24px 0;
    border-radius: 12px;

    @media (max-width: 320px) {
      margin: 16px 0;
    }
  }

  code {
    background-color: var(--vapor-gray-100);
    padding: 2px 6px;
    border-radius: 6px;
    font-family: 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    color: var(--vapor-text-danger);

    @media (max-width: 320px) {
      font-size: 13px;
    }
  }

  pre {
    background-color: var(--vapor-gray-100);
    padding: 16px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 24px 0;

    @media (max-width: 320px) {
      padding: 12px;
      margin: 16px 0;
    }

    code {
      background-color: transparent;
      padding: 0;
      color: var(--vapor-gray-900);
    }
  }

  blockquote {
    margin: 24px 0;
    padding: 16px 20px;
    border-left: 4px solid var(--ktb-tech-blue);
    background-color: var(--vapor-gray-050);
    color: var(--vapor-gray-900);
    border-radius: 0 8px 8px 0;

    @media (max-width: 320px) {
      margin: 16px 0;
      padding: 12px 16px;
    }

    p {
      margin: 0;
    }
  }

  a {
    color: var(--ktb-tech-blue);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ktb-tech-navy-hover);
      text-decoration: underline;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;

    @media (max-width: 320px) {
      margin: 16px 0;
      font-size: 14px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border: 1px solid var(--vapor-gray-300);

      @media (max-width: 320px) {
        padding: 8px;
      }
    }

    th {
      background-color: var(--vapor-gray-100);
      font-weight: 700;
      color: var(--vapor-gray-900);
    }

    td {
      color: var(--vapor-gray-900);
    }

    tr:hover {
      background-color: var(--vapor-gray-050);
    }
  }

  strong, b {
    font-weight: 700;
    color: var(--vapor-gray-900);
  }

  em, i {
    font-style: italic;
  }
}
```

---

## Task 9: 빈 상태(`.content-placeholder`) 재설계

**의도:** description이 없을 때 보이는 안내 카드를 gray-050 + radius 24 패턴으로.

**Files:**
- Modify: `styles/EventDetail.module.scss` (`.content-placeholder` 블록)

- [ ] **Step 1: 블록 교체**

```scss
.content-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background: var(--vapor-gray-050);
  border-radius: 24px;
  padding: 40px 20px;

  @media (max-width: 320px) {
    padding: 32px 16px;
    border-radius: 16px;
  }

  .placeholder-message {
    text-align: center;
    max-width: 400px;

    p {
      margin: 0 0 8px 0;
      font-weight: 500;
      font-size: 15px;
      line-height: 1.5;
      color: var(--vapor-gray-600);

      @media (max-width: 320px) {
        font-size: 14px;
      }

      &:first-child {
        font-weight: 700;
        font-size: 16px;
        color: var(--vapor-gray-900);
        margin-bottom: 8px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
```

(기존 블록 안의 h1~h4 스타일은 placeholder 메시지가 H 태그를 쓰지 않으므로 모두 제거)

---

## Task 10: 빌드·시각 검증

**Files:** 변경 없음 (검증만)

- [ ] **Step 1: lint**

Run: `pnpm lint`
Expected: PASS (warning 무관)

- [ ] **Step 2: build**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 3: 시각 검증** — `pnpm dev` (포트 5000) 실행 후 다음 URL을 브라우저로 확인:

- `http://localhost:5000/event/detail/<진행중 행사 id>` — Today 배지, hero, 본문 마크다운
- `http://localhost:5000/event/detail/<예정 행사 id>` — D-N 배지
- `http://localhost:5000/event/detail/<종료 행사 id>` — dim 오버레이, 배지 없음
- `http://localhost:5000/event/detail/<description 없는 행사 id>` — 빈 상태 카드

각 뷰포트에서 깨짐 없음:
- ≥1200: 2-column hero (400px + flex)
- 1199~601: stacked, action 버튼 썸네일 우상단
- ≤600: stacked + 작은 타이포
- ≤320: 최소 폭

- [ ] **Step 4: 토큰 누락 최종 확인**

Run: `grep -n '#[0-9a-fA-F]\{3,6\}' styles/EventDetail.module.scss | grep -v 'rgba(\|rgb(' | grep -v '#ffffff' | grep -v '// '`
Expected: 빈 결과 (rgba/rgb 함수 안 hex, `#fff`/`#ffffff` 흰색, 주석은 허용)

---

## Self-Review Notes

- **Spec coverage:** spec의 모든 섹션(Hero desktop / Hero mobile / Content / 빈 상태 / Token cleanup / 검증 기준)에 매칭되는 task 존재.
- **No placeholders:** 모든 step에 구체 코드와 명령어 포함.
- **Type consistency:** `&__image__done` / `&__image__badge` 클래스명, `isEventDone` 헬퍼명, `eventDone` 변수명이 task 6 안에서 일관.
- **Commit policy:** 사용자 지시에 따라 commit step 제외. 작업 완료 후 사용자가 별도 요청 시 한 번에 commit.
