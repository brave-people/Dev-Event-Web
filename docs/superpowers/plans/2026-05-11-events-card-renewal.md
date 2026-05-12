# Events Card Renewal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin `Item` card on `/events` (and reuse pages) to match the KTB course-card pattern in `DESIGN.md` — responsive hybrid (horizontal row ≥1200px, vertical KTB card <1200px), unified status badge system, Vapor token alignment.

**Architecture:** Surgical CSS+JSX refactor. (1) Extend SCSS theme with KTB tokens via CSS custom properties so existing `var(--*)` consumers pick them up. (2) Replace `EndBulletIcon`/`NewBulletIcon` flag JSX with a single status badge derived from `isDone` + D-Day buckets (reuse `DdayTag`'s existing classification logic). (3) Rewrite `Item.module.scss` — desktop horizontal grid with 5/3 thumb at 12px radius, mobile vertical course-card with 5/3 thumb on top. (4) Conditionally hide `DdayTag` on mobile-urgent state since the badge already encodes it. No data model / API changes.

**Tech Stack:** Next 12, React 17, SCSS modules, Pretendard Variable, classnames, no automated test infra — visual verification via `pnpm dev`.

**Spec:** `docs/superpowers/specs/2026-05-11-events-card-renewal-design.md`
**Reference:** `DESIGN.md`, visual mockups at `.superpowers/brainstorm/99710-1778482665/content/card-direction-v3.html`

---

## File Structure

| File | Role | Type |
|---|---|---|
| `styles/_color.scss` | Add KTB brand tokens + Vapor gray ramp as SCSS variables | Modify |
| `styles/Theme.scss` | Expose new tokens as CSS custom properties (`--ktb-tech-blue`, `--gray-100…900`, `--text-danger`, etc.) | Modify |
| `components/common/item/Item.tsx` | Replace flag icons with status badge; render organizer + calendar-icon meta line; conditionally hide DdayTag on mobile-urgent | Modify |
| `components/common/item/Item.module.scss` | Full rewrite for new layout (desktop row + mobile vertical card), pulse keyframes, status badge variants | Modify |
| `components/common/tag/FilterTag.module.scss` | Chip token alignment (gray-100 bg, gray-800 text, 8px/6px radius, 12-13px font) | Modify |
| `components/common/tag/DdayTag.module.scss` | Token alignment (gray ramp instead of legacy `--gray-2`), pill radius | Modify |
| `components/icons/index.ts` (or wherever) | (Reference only — no change; we use inline SVG) | — |

**Files NOT touched (per spec §10):** `pages/events.tsx`, `pages/event/detail/[eventId].tsx`, Banner, Letter, EventFilter, modals, layout components, model/event, API hooks, dateUtil.

---

## Pre-flight: Branch + Dev Server

- [ ] **Step 0.1: Confirm branch / decide branching strategy**

Current branch is `release/2.3.0`. Confirm with user whether to:
- Work directly on `release/2.3.0` (one of many in-flight features)
- Create `feature/events-card-renewal` off `main` and PR back

If branching: `git checkout main && git pull && git checkout -b feature/events-card-renewal`. **Default assumption:** stay on `release/2.3.0` unless user says otherwise.

- [ ] **Step 0.2: Start dev server in background and confirm running**

```bash
pnpm install   # if node_modules out of date
pnpm run dev
```

Expected: server on `http://localhost:5000`. Keep this running across all tasks. Open `/events` in browser.

---

## Task 1: Extend SCSS theme with KTB + Vapor tokens

**Files:**
- Modify: `styles/_color.scss`
- Modify: `styles/Theme.scss`

**Rationale:** The existing theme exposes only a thin token set (`--primary`, `--gray-1…5`, `--background-1/2`). DESIGN.md demands a richer ramp (gray-100…900, text-danger, ktb-tech-blue/navy). Adding these as CSS custom properties means downstream SCSS modules just consume `var(--*)`.

- [ ] **Step 1.1: Add KTB + Vapor SCSS variables to `_color.scss`**

Append the following block to the end of `styles/_color.scss`:

```scss
// ========================================
// KTB / Vapor design tokens (DESIGN.md)
// ========================================

// KTB brand
$ktb-tech-blue: #0043ff;
$ktb-tech-navy: #000040;
$ktb-tech-navy-hover: #0238D1;
$ktb-tech-sky: #78CDFF;

// Vapor gray ramp
$vapor-gray-000: #ffffff;
$vapor-gray-050: #F7F7FA;
$vapor-gray-100: #F0F0F5;
$vapor-gray-200: #E8E8EE;
$vapor-gray-300: #E1E1E8;
$vapor-gray-400: #CDCED6;
$vapor-gray-500: #8C8F9F;
$vapor-gray-600: #6C6E7E;
$vapor-gray-700: #525463;
$vapor-gray-800: #3E404C;
$vapor-gray-900: #2B2D36;
$vapor-gray-950: #252730;

// Semantic
$vapor-text-danger: #D91C29;
$vapor-text-success: #08785E;
$vapor-text-warning: #B45209;
$vapor-text-primary: #1D6CE0;
```

- [ ] **Step 1.2: Expose tokens as CSS custom properties in `Theme.scss`**

Add these custom properties inside both `html[data-theme='light']` and `html[data-theme='dark']` blocks of `styles/Theme.scss`. For dark theme, swap the gray ramp values (lighter → darker, darker → lighter) so the same `var(--*)` works in both themes.

Append inside `html[data-theme='light']`:

```scss
  // KTB brand
  --ktb-tech-blue: #{$ktb-tech-blue};
  --ktb-tech-navy: #{$ktb-tech-navy};
  --ktb-tech-navy-hover: #{$ktb-tech-navy-hover};
  --ktb-tech-sky: #{$ktb-tech-sky};

  // Vapor gray ramp (light theme: 000 = white → 950 = near-black)
  --vapor-gray-000: #{$vapor-gray-000};
  --vapor-gray-050: #{$vapor-gray-050};
  --vapor-gray-100: #{$vapor-gray-100};
  --vapor-gray-200: #{$vapor-gray-200};
  --vapor-gray-300: #{$vapor-gray-300};
  --vapor-gray-400: #{$vapor-gray-400};
  --vapor-gray-500: #{$vapor-gray-500};
  --vapor-gray-600: #{$vapor-gray-600};
  --vapor-gray-700: #{$vapor-gray-700};
  --vapor-gray-800: #{$vapor-gray-800};
  --vapor-gray-900: #{$vapor-gray-900};
  --vapor-gray-950: #{$vapor-gray-950};

  // Semantic
  --vapor-text-danger: #{$vapor-text-danger};
  --vapor-text-success: #{$vapor-text-success};
  --vapor-text-warning: #{$vapor-text-warning};
  --vapor-text-primary: #{$vapor-text-primary};
```

Append inside `html[data-theme='dark']` (inverted gray ramp for dark mode — body text becomes light):

```scss
  // KTB brand (same hex in dark — saturated blue still reads on dark)
  --ktb-tech-blue: #{$ktb-tech-blue};
  --ktb-tech-navy: #{$ktb-tech-navy};
  --ktb-tech-navy-hover: #{$ktb-tech-navy-hover};
  --ktb-tech-sky: #{$ktb-tech-sky};

  // Vapor gray ramp (dark theme: 000 = near-black bg → 950 = white text)
  --vapor-gray-000: #{$vapor-gray-950};
  --vapor-gray-050: #{$vapor-gray-900};
  --vapor-gray-100: #{$vapor-gray-800};
  --vapor-gray-200: #{$vapor-gray-700};
  --vapor-gray-300: #{$vapor-gray-700};
  --vapor-gray-400: #{$vapor-gray-500};
  --vapor-gray-500: #{$vapor-gray-400};
  --vapor-gray-600: #{$vapor-gray-300};
  --vapor-gray-700: #{$vapor-gray-200};
  --vapor-gray-800: #{$vapor-gray-100};
  --vapor-gray-900: #{$vapor-gray-050};
  --vapor-gray-950: #{$vapor-gray-000};

  // Semantic
  --vapor-text-danger: #{$vapor-text-danger};
  --vapor-text-success: #{$vapor-text-success};
  --vapor-text-warning: #{$vapor-text-warning};
  --vapor-text-primary: #{$vapor-text-primary};
```

- [ ] **Step 1.3: Verify SCSS compiles and dev server has no errors**

Check terminal where `pnpm dev` is running. Expected: no SCSS compile errors. Hot-reload should re-render `/events` with no visible change yet (tokens declared but not consumed).

If error: read the SCSS error message and fix the offending line. Common pitfall: missing `;` or wrong variable interpolation `#{$var}`.

- [ ] **Step 1.4: Commit**

```bash
git add styles/_color.scss styles/Theme.scss
git commit -m "feat(design): add KTB + Vapor design tokens to theme

Expose KTB brand colors (tech-blue, tech-navy, tech-navy-hover, tech-sky) and
the full Vapor gray ramp (000-950) + semantic colors (danger/success/warning/
primary) as CSS custom properties on both light and dark theme roots. Prepares
for Item card renewal per DESIGN.md."
```

---

## Task 2: Add Item status helper + integrate badge state

**Files:**
- Modify: `components/common/item/Item.tsx`

**Rationale:** Status badge has 4 variants (`live`, `urgent`, `upcoming`, `ended`). We derive the variant from existing `isDone` + D-Day classification (`DdayTag` already buckets D-Day; we inline the same logic here to avoid passing computed state). Steps 2-3 do the JSX side; Step 4-5 the CSS side.

- [ ] **Step 2.1: Add `EventStatus` type + `getEventStatus` helper inside Item.tsx**

In `components/common/item/Item.tsx`, after the `DateType` const (around line 31) and before the `Props` type, add:

```tsx
type EventStatus = 'live' | 'urgent' | 'upcoming' | 'ended';

function getEventStatus(
  startDateTime: string,
  endDateTime: string,
  isDone: boolean
): EventStatus {
  if (isDone) return 'ended';
  const today = DateUtil.setDateTimeToDate();
  const start = startDateTime
    ? DateUtil.setDateTimeToDate(startDateTime)
    : null;
  const end = endDateTime ? DateUtil.setDateTimeToDate(endDateTime) : null;
  const dStart = start ? start.diff(today, 'day') : null;
  const dEnd = end ? end.diff(today, 'day') : null;

  // currently ongoing: started but not ended
  if (dStart !== null && dEnd !== null && dStart <= 0 && dEnd >= 0) {
    return 'live';
  }
  // urgent: starts within 3 days
  if (dStart !== null && dStart > 0 && dStart <= 3) {
    return 'urgent';
  }
  // upcoming: future, beyond 3 days
  if (dStart !== null && dStart > 3) {
    return 'upcoming';
  }
  // fallback (no start_date, or already past with no end) — treat as ended
  return 'ended';
}

const STATUS_LABEL: Record<EventStatus, string> = {
  live: '모집중',
  urgent: '마감임박',
  upcoming: '예정',
  ended: '종료',
};
```

- [ ] **Step 2.2: Add status state computation inside the Item component**

In the `Item` component body, after the existing `useState` hooks (around line 56-57), add:

```tsx
const status: EventStatus = getEventStatus(
  data.start_date_time,
  data.end_date_time,
  isDone
);
```

- [ ] **Step 2.3: Verify TypeScript compiles**

`pnpm dev` should hot-reload. Check the terminal where the dev server is running. Expected: no TS errors. If TS errors about `setDateTimeToDate` signature, confirm by reading `lib/utils/dateUtil.ts` and adjust calls.

- [ ] **Step 2.4: Commit**

```bash
git add components/common/item/Item.tsx
git commit -m "feat(item): add EventStatus derivation

Derive a single status variant ('live' | 'urgent' | 'upcoming' | 'ended')
from existing isDone + D-Day buckets. Used by the upcoming status badge
that replaces the EndBulletIcon/NewBulletIcon flags."
```

---

## Task 3: Replace flag icons with status badge in Item.tsx JSX

**Files:**
- Modify: `components/common/item/Item.tsx`

**Rationale:** Remove the existing `EndBulletIcon` / `NewBulletIcon` flag block (around lines 159-174) and emit a single `.status-badge` span instead. Also add calendar SVG inline for the meta line. Conditionally hide `DdayTag` on mobile-urgent (badge already encodes D-Day).

- [ ] **Step 3.1: Remove old icon imports**

In `components/common/item/Item.tsx`, edit the icons import (lines 5-12). Remove `EndBulletIcon` and `NewBulletIcon` (no longer used). Keep `BookmarkIcon`, `BookmarkIconMobile`, `ShareIcon`, `ShareIconMobile`.

Before:
```tsx
import {
  BookmarkIcon,
  BookmarkIconMobile,
  EndBulletIcon,
  NewBulletIcon,
  ShareIcon,
  ShareIconMobile,
} from 'components/icons';
```

After:
```tsx
import {
  BookmarkIcon,
  BookmarkIconMobile,
  ShareIcon,
  ShareIconMobile,
} from 'components/icons';
```

- [ ] **Step 3.2: Replace the flag JSX block with the status badge**

Locate the block inside `item__content__img` (currently lines 158-174):

```tsx
{isDone && <div className={cn('item__content__img__done')} />}
{isDone ? (
  <div className={cn('item__content__flag')}>
    <EndBulletIcon
      color={'rgba(203, 203, 206, 1)'}
      backgroundColor={'rgba(49, 50, 52, 1)'}
    />
  </div>
) : null}
{isNew ? (
  <div className={cn('item__content__flag')}>
    <NewBulletIcon
      color={'rgba(203, 203, 206, 1)'}
      backgroundColor={'rgba(44, 76, 239, 1)'}
    />
  </div>
) : null}
```

Replace with:

```tsx
{isDone && <div className={cn('item__content__img__done')} />}
<span className={cn('status-badge', `status-badge--${status}`)}>
  {STATUS_LABEL[status]}
</span>
```

Note: `isNew` state remains computed (used elsewhere if needed) but no longer drives a visual flag here — the status badge subsumes the "NEW" signal via the `upcoming` variant. Leave the `isNew` `useState` line and `isEventNew` prop as-is for now (out-of-scope cleanup).

- [ ] **Step 3.3: Conditionally hide DdayTag on mobile (where badge encodes urgency)**

In the `item__content_title__container` block (around lines 227-245), the current code unconditionally renders `<DdayTag>`. Wrap it so it only renders on desktop or when status isn't `urgent`/`ended`:

Before:
```tsx
{isDone ? null : (
  <DdayTag
    startDateTime={data.start_date_time}
    endDateTime={data.end_date_time}
  />
)}
```

After:
```tsx
{!isDone && status !== 'urgent' && (
  <DdayTag
    startDateTime={data.start_date_time}
    endDateTime={data.end_date_time}
  />
)}
```

(Mobile-specific hiding is also handled in CSS for cases where we want the DdayTag visible on desktop but not mobile. CSS in Task 5 covers `.item__content_title__container .tag { display: none; }` under the mobile media query for urgent state. The JSX gate above is the primary mechanism — simpler.)

- [ ] **Step 3.4: Replace existing meta date area with calendar-icon prefixed format**

Locate the `.item__content__desc` block (around lines 247-291). The current structure shows "일시" / "접수" prefix + dates inline. Replace the prefix span with a calendar SVG icon for visual consistency with KTB course-card.

Before (around lines 251-275):
```tsx
<span
  className={cn(
    isDone ? 'date__type__done' : 'date__type'
  )}
>
  {data.event_time_type === 'DATE' ? '일시 ' : '접수 '}
</span>
```

After:
```tsx
<svg
  className={cn('date__icon')}
  width="16"
  height="16"
  viewBox="0 0 16 16"
  fill="currentColor"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <path d="M3.33333 14.6666C2.96667 14.6666 2.65278 14.536 2.39167 14.2749C2.13056 14.0138 2 13.6999 2 13.3333V3.99992C2 3.63325 2.13056 3.31936 2.39167 3.05825C2.65278 2.79714 2.96667 2.66659 3.33333 2.66659H4V1.99992C4 1.81103 4.06389 1.6527 4.19167 1.52492C4.31944 1.39714 4.47778 1.33325 4.66667 1.33325C4.85556 1.33325 5.01389 1.39714 5.14167 1.52492C5.26944 1.6527 5.33333 1.81103 5.33333 1.99992V2.66659H10.6667V1.99992C10.6667 1.81103 10.7306 1.6527 10.8583 1.52492C10.9861 1.39714 11.1444 1.33325 11.3333 1.33325C11.5222 1.33325 11.6806 1.39714 11.8083 1.52492C11.9361 1.6527 12 1.81103 12 1.99992V2.66659H12.6667C13.0333 2.66659 13.3472 2.79714 13.6083 3.05825C13.8694 3.31936 14 3.63325 14 3.99992V13.3333C14 13.6999 13.8694 14.0138 13.6083 14.2749C13.3472 14.536 13.0333 14.6666 12.6667 14.6666H3.33333ZM3.33333 13.3333H12.6667V6.66658H3.33333V13.3333Z" />
</svg>
```

(The visual icon now carries the meaning "이건 일정 정보" — the `일시` / `접수` Korean prefix is replaced by an SVG glyph. If product wants the Korean word as well for accessibility, leave the span and add the icon before it. **Default decision: replace the prefix span entirely** — cleaner per DESIGN.md course-period pattern.)

- [ ] **Step 3.5: Verify in browser**

Refresh `http://localhost:5000/events`. Expected: cards now render with raw status badge text (e.g. "모집중", "예정") and a calendar SVG — but with **broken visual layout** until Task 4-5 CSS lands. This is expected. The goal of Step 3.5 is to confirm:
- No React errors in console
- No TypeScript errors in terminal
- Status badge text actually appears in DOM (inspect element)
- Calendar SVG renders
- `isDone` cards have no NEW flag and no End flag (both removed)

- [ ] **Step 3.6: Commit**

```bash
git add components/common/item/Item.tsx
git commit -m "refactor(item): replace flag icons with status badge

Replaces EndBulletIcon/NewBulletIcon flags with a single .status-badge span
driven by EventStatus. Wraps date prefix in a calendar SVG glyph to match
KTB course-period pattern. DdayTag is conditionally hidden when status is
'urgent' since the badge already encodes that information."
```

---

## Task 4: Rewrite Item.module.scss — desktop horizontal row

**Files:**
- Modify: `components/common/item/Item.module.scss`

**Rationale:** Apply DESIGN.md tokens to the existing desktop horizontal layout. Thumb sizing 280×168 (5/3 at 280px width), 12px radius, organizer 14px hint tone, title 20px/700 with 2-line clamp, calendar-prefixed meta line, chip row, status badge variants.

- [ ] **Step 4.1: Replace `Item.module.scss` entirely with the desktop+pulse keyframe scaffold**

Replace the **entire contents** of `components/common/item/Item.module.scss` with the following. Mobile rewrite comes in Task 5.

```scss
@import '~styles/_mixin.scss';
@import '~styles/_variables.scss';
@import '~styles/_common.scss';

// ===== Pulse keyframes (DESIGN.md §7) — live/urgent badges only =====
@keyframes pulse-blue {
  0%   { box-shadow: 0 0 0 0 rgba(0, 67, 255, 0.55); }
  70%  { box-shadow: 0 0 0 8px rgba(0, 67, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 67, 255, 0); }
}
@keyframes pulse-danger {
  0%   { box-shadow: 0 0 0 0 rgba(217, 28, 41, 0.55); }
  70%  { box-shadow: 0 0 0 8px rgba(217, 28, 41, 0); }
  100% { box-shadow: 0 0 0 0 rgba(217, 28, 41, 0); }
}

.item__container {
  width: 100%;
  padding: 24px 0;
  background-color: transparent;
  border-bottom: 1px solid var(--vapor-gray-300);

  .item {
    width: 100%;

    &:hover {
      cursor: pointer;
    }

    &__content {
      width: 100%;
      display: grid;
      grid-template-columns: 280px 1fr auto;
      gap: 32px;
      align-items: center;
      position: relative;

      &__img {
        width: 280px;
        aspect-ratio: 5 / 3;
        position: relative;
        border-radius: 12px;
        overflow: hidden;

        &__mask {
          border-radius: 12px;
          overflow: hidden;
          transition: transform $transition-duration $transition-timing;
        }

        &__done {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          background-color: rgba(0, 0, 0, 0.4);
          overflow: hidden;
          border-radius: 12px;
          z-index: 1;
        }
      }

      &__body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;

        .wrap {
          .host {
            font-size: 14px;
            font-weight: 500;
            color: var(--vapor-gray-600);
            margin-bottom: 6px;
          }

          .host__done {
            font-size: 14px;
            font-weight: 500;
            color: var(--vapor-gray-500);
            margin-bottom: 6px;
          }
        }
      }

      &_title__container {
        width: 100%;
        margin: 0 0 10px 0;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      &__title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-weight: 700;
        font-size: 20px;
        line-height: 1.4;
        letter-spacing: -0.012rem;
        color: var(--vapor-gray-900);
        text-align: left;
        flex: 1;
        word-break: keep-all;
      }

      &__title__done {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-weight: 700;
        font-size: 20px;
        line-height: 1.4;
        letter-spacing: -0.012rem;
        color: var(--vapor-gray-600);
        text-align: left;
        flex: 1;
        word-break: keep-all;
      }

      &__desc {
        width: 100%;
        font-weight: 400;
        font-size: 15px;
        color: var(--vapor-gray-700);
        display: flex;
        flex-direction: column;
        gap: 10px;

        &__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          width: 100%;
        }
      }

      .wrap {
        color: var(--vapor-gray-900);

        .date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          font-weight: 500;
          color: var(--vapor-gray-700);

          &__icon {
            flex-shrink: 0;
            color: var(--vapor-gray-600);
          }

          &__date {
            white-space: nowrap;
            color: var(--vapor-gray-700);
            font-weight: 500;
          }

          &__date__done {
            white-space: nowrap;
            color: var(--vapor-gray-500);
            font-weight: 500;
          }

          &__date__mobile {
            display: none;
          }

          &__date__done__mobile {
            display: none;
          }
        }
      }
    }

    &__buttons {
      display: flex;
      align-items: center;
      gap: 4px;
      align-self: flex-start;

      .button {
        width: 36px;
        height: 36px;
        border: none;
        background-color: transparent;
        border-radius: 8px;
        @include flex-center;
        color: var(--vapor-gray-500);

        &:hover {
          cursor: pointer;
          background-color: var(--vapor-gray-100);
        }
      }

      .laptop {
        display: flex;

        &:first-child {
          margin-right: 2px;
        }
      }

      .mobile {
        display: none;
      }
    }
  }
}

// ===== Status badge =====
.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0;
  white-space: nowrap;

  &--live {
    background-color: var(--ktb-tech-blue);
    animation: pulse-blue 2s infinite;
  }
  &--urgent {
    background-color: var(--vapor-text-danger);
    animation: pulse-danger 2s infinite;
  }
  &--upcoming {
    background-color: var(--ktb-tech-navy);
  }
  &--ended {
    background-color: var(--vapor-gray-600);
  }
}

// Mobile rewrite — Task 5 will append the @media (max-width: 1200px) block below.
```

- [ ] **Step 4.2: Visual check at desktop width (>1200px)**

Open `/events` at viewport ≥1200px. Expected:
- Thumb is 280px wide, 5/3 aspect (height 168px), rounded 12px
- Status badge visible top-left at (12px, 12px) with correct color per variant
- Pulse glow visible on `live` / `urgent`, plain on `upcoming` / `ended`
- Organizer in hint tone above title
- Title 20px/700, 2-line clamp
- Calendar icon + date in single row (15px), tag chips below
- Share/bookmark buttons on the right, hover bg gray-100
- Hover on card: image scales 1.05 (existing transition)
- Border-bottom 1px gray-300 between cards

- [ ] **Step 4.3: Commit**

```bash
git add components/common/item/Item.module.scss
git commit -m "feat(item): rewrite desktop SCSS to KTB token system

- 280px × 5/3 thumb with 12px radius
- 20px/700 2-line clamp title with -0.012rem letter-spacing
- Calendar-icon prefixed meta line, gap 6px
- Status badge with 4 variants (live/urgent/upcoming/ended) +
  pulse-blue / pulse-danger keyframes for live/urgent only
- Action buttons gray-500 with gray-100 hover bg
- Mobile @media block to be added in next task"
```

---

## Task 5: Append mobile vertical card to Item.module.scss

**Files:**
- Modify: `components/common/item/Item.module.scss`

**Rationale:** Replace the current mobile `@media (max-width: 1200px)` block with a vertical KTB course-card layout — thumb on top (5/3 full-width), info below.

- [ ] **Step 5.1: Append the mobile media query block**

Append the following block to the end of `components/common/item/Item.module.scss` (after the `.status-badge` rules from Task 4):

```scss
// ===== Tablet / Mobile — vertical KTB course-card =====
@media (max-width: 1200px) {
  .item__container {
    display: block;
    border-bottom: none;
    padding: 0;
    overflow: visible;

    .item__content {
      display: block;
      grid-template-columns: none;
      gap: 0;
    }

    .item__content__img {
      width: 100%;
      aspect-ratio: 5 / 3;
      max-height: none;
      border-radius: 12px;
    }

    .item__content__img__mask,
    .item__content__img__done {
      border-radius: 12px;
    }

    .item__content__body {
      margin-top: 12px;
      padding: 0;
      justify-content: inherit;

      .wrap {
        .host {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .host__done {
          font-size: 13px;
          margin-bottom: 4px;
        }
      }
    }

    .item__content_title__container {
      margin-bottom: 4px;
    }

    .item__content__title {
      display: block;
      -webkit-line-clamp: unset;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.4;
      letter-spacing: -0.012rem;
      margin-right: 0;
    }

    .item__content__title__done {
      display: block;
      -webkit-line-clamp: unset;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.4;
      letter-spacing: -0.012rem;
      margin-right: 0;
    }

    .item__content__desc {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 14px;
      color: var(--vapor-gray-600);
    }

    .item__content__desc__tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding-top: 0;
    }

    .wrap {
      .date {
        font-size: 14px;
        gap: 4px;
        white-space: normal;

        &__icon {
          width: 16px;
          height: 16px;
        }

        .date__date,
        .date__date__done {
          white-space: nowrap;
        }
      }
    }

    .item__buttons {
      position: absolute;
      top: 12px;
      right: 12px;

      .button {
        width: 32px;
        height: 32px;
        background-color: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(4px);

        &:hover {
          background-color: rgba(255, 255, 255, 1);
        }
      }

      .laptop {
        display: none;
      }

      .mobile {
        display: flex;
      }
    }
  }

  // DdayTag inside the title container — visually de-emphasize on mobile
  // (the status badge already encodes urgency)
  .item__content_title__container > div:last-child:not(.item__content__title):not(.item__content__title__done) {
    display: none;
  }

  // Status badge slightly smaller on mobile
  .status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
}

@media (max-width: 550px) {
  .item__container {
    max-width: inherit;
  }
}
```

- [ ] **Step 5.2: Visual check at multiple viewports**

Use DevTools responsive mode. Verify:
- **1199px** (just below threshold): cards flip to vertical, thumb full-width, info below
- **768px** (tablet): same vertical layout
- **375px** (mobile): single column, action buttons inside the thumb area with translucent white bg
- Status badge slightly smaller (10px font, 3×8 padding)
- Title stays single-line ellipsis, organizer above
- Calendar-icon meta line gap 4px, font 14px
- Tag chips wrap

If grid container needs spacing between cards (the `border-bottom` was removed for mobile), confirm `List.module.scss` or parent already provides gap. If not, document as follow-up — but **don't fix in this task** (out of scope per spec §10).

- [ ] **Step 5.3: Commit**

```bash
git add components/common/item/Item.module.scss
git commit -m "feat(item): mobile vertical KTB course-card layout

- Thumb full-width at 5/3 aspect, 12px radius
- Info stack below: organizer (13px) / title (16px ellipsis) / calendar+date (14px) / chips
- Action buttons absolutely positioned over the thumb on mobile with
  translucent white bg + backdrop-filter
- DdayTag hidden visually inside title container (badge encodes urgency)
- Status badge scales down to 10px / 3px 8px padding"
```

---

## Task 6: Align FilterTag chip styling with DESIGN.md

**Files:**
- Modify: `components/common/tag/FilterTag.module.scss`

**Rationale:** The chip used inside `item__content__desc__tags` needs to match the DESIGN.md spec — `gray-100` bg, `gray-800` text, 8px radius (desktop) / 6px (mobile), 13/12px font, 500 weight. Current chip is `--gray-5` bg and `--gray-1` text — close, but ramp and radius are off.

- [ ] **Step 6.1: Update `FilterTag.module.scss` chip rules**

Replace the **entire contents** of `components/common/tag/FilterTag.module.scss` with:

```scss
@import '~styles/_mixin.scss';
@import '~styles/_color.scss';

.tag {
  display: inline-flex;
  align-items: center;
  border: none;
  color: var(--vapor-gray-800);
  background-color: var(--vapor-gray-100);
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 13px;
  line-height: 1.4;
  letter-spacing: -0.012rem;
  margin: 0;

  &.size--large {
    font-size: 13px;
    padding: 4px 10px;
  }

  &.size--regular {
    font-size: 13px;
    padding: 4px 10px;
  }
}

@include tablet {
  .tag {
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 12px;

    &.size--large {
      font-size: 12px;
      padding: 3px 8px;
    }
    &.size--regular {
      font-size: 12px;
      padding: 3px 8px;
    }
  }
}

@include mobile {
  .tag {
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;

    &.size--large {
      font-size: 12px;
      padding: 2px 8px;
    }
    &.size--regular {
      font-size: 12px;
      padding: 2px 8px;
    }
  }
}
```

(`type--location` selector existed but was unused for styling — dropped. If future variants need it, re-add.)

- [ ] **Step 6.2: Visual check**

Refresh `/events`. Expected:
- Chips inside cards use light gray bg (`#F0F0F5`) and dark gray text (`#3E404C`)
- 8px radius desktop, 6px mobile
- 13/12px font, 500 weight
- Compact padding (4×10 / 3×8 / 2×8)
- Spacing between chips comes from `.item__content__desc__tags { gap: 6px / 4px }` already set in Item.module.scss — confirm no double-margin

- [ ] **Step 6.3: Commit**

```bash
git add components/common/tag/FilterTag.module.scss
git commit -m "feat(tag): align FilterTag chip with KTB Vapor tokens

- bg vapor-gray-100, text vapor-gray-800
- 8px radius desktop / 6px tablet+mobile
- 13/12px font, 500 weight, -0.012rem letter-spacing
- Drop unused .type--location styling"
```

---

## Task 7: Align DdayTag styling with new token system

**Files:**
- Modify: `components/common/tag/DdayTag.module.scss`

**Rationale:** DdayTag still uses legacy `--gray-2` / `--background-2` / `--primary`. Bring it into the new ramp and make it visually quieter so the status badge remains the urgency signal (D-Day shows only on desktop now).

- [ ] **Step 7.1: Replace `DdayTag.module.scss` contents**

Replace with:

```scss
@import '~styles/_mixin.scss';

.tag {
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--vapor-gray-700);
  background-color: var(--vapor-gray-100);
  border-radius: 9999px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 2px 10px;
  white-space: nowrap;
  flex-shrink: 0;

  &--bold {
    font-weight: 600;
    color: var(--ktb-tech-blue);
  }

  @media (max-width: 1199px) {
    display: none; // mobile uses the status badge instead
  }
}
```

- [ ] **Step 7.2: Visual check**

Refresh `/events`. Expected:
- DdayTag visible on desktop only, next to title, pill-shaped gray
- "Today" tag uses tech-blue color (`--bold` variant)
- Hidden entirely on mobile (the JSX gate in Task 3 also hides on urgent; CSS belt-and-suspenders for non-urgent + scheduled buckets)

- [ ] **Step 7.3: Commit**

```bash
git add components/common/tag/DdayTag.module.scss
git commit -m "feat(tag): DdayTag token alignment + mobile hide

- Pill shape (9999px radius), 13px / 500
- bg vapor-gray-100, text vapor-gray-700
- 'Today' variant uses ktb-tech-blue
- Hidden under 1200px (status badge takes over the urgency signal)"
```

---

## Task 8: Visual regression check + reused-page review

**Files:**
- No edits expected, but be ready to add narrow follow-ups if regressions surface

**Rationale:** `Item.tsx` is consumed by both `/events` (ScheduledEventList / MonthlyEventList / FilteredEventList) and `/myevent` (MyEventScheduledList / MyEventDoneList). The same card design now applies to both. Confirm both pages look correct and existing functionality is intact.

- [ ] **Step 8.1: Walk through `/events`**

At each viewport (1400px / 1199px / 768px / 375px), confirm:
- Cards render in all 4 status variants when seeded (manually filter by date if needed, or wait for real data with mix of states)
- `Banner`, `Letter`, `EventFilter`, modals visually unchanged
- Filter / search interactions still work — chip clicks, date filter, search bar
- Bookmark / share buttons functional
- Click on card navigates to `/event/detail/{id}`
- Scroll loading / infinite list behavior unchanged

- [ ] **Step 8.2: Walk through `/myevent` (requires login)**

If logged in, navigate to `/myevent` and confirm:
- Scheduled list shows the new vertical card on mobile / horizontal on desktop
- Done list shows the ended-state badge + dimmed thumb overlay
- Bookmark removal still works (it's not the card chrome — same handlers)

If no login session is available locally, document as a manual smoke test in the PR description.

- [ ] **Step 8.3: Walk through `/calender` and `/search`**

These pages also render `List` → `Item`. Quick visual smoke:
- `/calender`: cards in a date-grouped view
- `/search`: cards in a filtered list

Note any visual oddity. **Don't fix in this task** — file a follow-up ticket if issues arise. Scope was `/events`.

- [ ] **Step 8.4: Lint check**

```bash
pnpm run lint
```

Expected: pass. If `unused-imports` or similar complains about `EndBulletIcon` / `NewBulletIcon` removal, confirm they were imported only in `Item.tsx` and the removal in Task 3.1 cleared them.

- [ ] **Step 8.5: Build check**

```bash
pnpm run build
```

Expected: build succeeds. Watch for SCSS compile errors or TS type errors. If build fails, read the error and fix.

- [ ] **Step 8.6: Final commit + summary**

If any tiny adjustments were needed during the walk-through:

```bash
git add -A
git commit -m "fix(item): adjustments from visual regression pass

[describe specific fixes — e.g., chip gap on mobile, badge contrast]"
```

If clean (no adjustments needed), no extra commit. Just confirm:

```bash
git log --oneline -10
```

Expected: 7-8 commits from Tasks 1-7 (each task = 1 commit).

---

## Self-Review

Coverage map vs spec sections:

| Spec § | Task |
|---|---|
| §2 Scope (Item card only) | Tasks 1-7 only touch Item + tags + theme |
| §4.1 Responsive (≥1200px row, <1200px vertical) | Task 4 (desktop) + Task 5 (mobile) |
| §4.2 Horizontal row layout | Task 4 SCSS |
| §4.3 Vertical card layout | Task 5 SCSS |
| §4.4 Status badge (4 variants + pulse) | Task 2 (helper) + Task 3 (JSX) + Task 4 (CSS) |
| §4.5 Ended state styling | Task 4 (`__title__done`, `__done` overlay) |
| §4.6 D-Day handling (desktop inline, mobile via badge) | Task 3 (JSX gate) + Task 5 (CSS hide) + Task 7 (token align) |
| §5 Component contract / `EventStatus` | Task 2 |
| §6 Files Touched | All 7 tasks |
| §7 Edge cases (organizer null, no tags, long title, no date) | Existing JSX already handles; documented in Task 2 helper (null guards on dStart/dEnd) |
| §8 Testing plan (manual) | Task 8 |
| §9 Open Questions | Resolved during exploration: Item reused in /myevent/calender/search (Task 8.2-8.3); dateUtil at lib/utils/dateUtil (used in Task 2); organizer is `string` non-null per model/event.ts |
| §10 Non-Goals | Not touched — banner/filter/modal/layout unchanged |

Placeholder scan: no "TBD" / "TODO" / "implement later" / "add appropriate error handling" / vague references. Each step has exact code, exact paths, exact commands.

Type consistency: `EventStatus` ('live'|'urgent'|'upcoming'|'ended') defined in Task 2.1, consumed in 2.2 (state) and 3.2 (badge class) and 3.3 (DdayTag gate). `STATUS_LABEL` Record consistent. `status-badge--{variant}` class names match Task 4 CSS.

---

## Execution Handoff

Plan saved to `docs/superpowers/plans/2026-05-11-events-card-renewal.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Good for visual UI changes where checkpoint review catches drift early.

**2. Inline Execution** — Execute tasks sequentially in this session using `executing-plans`, batched with checkpoints at task boundaries.

Which approach?
