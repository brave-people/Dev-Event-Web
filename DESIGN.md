<!--
  omd:source = custom reference (kakaotechbootcamp.com)
  omd:base-fingerprint = kakaotechbootcamp.com (Goorm Vapor Design System v0.21.4 + KTB brand tokens)
  omd:project = Dev Event Web — 개발자 행사 큐레이션 (Next.js)
  omd:notes = Structural template traced from the `kakao` reference DESIGN.md (9 sections).
              Visual tokens replaced with real values extracted from kakaotechbootcamp.com's
              live CSS (style.css + Vapor foundation v0.21.4). Course-card and course detail
              page (cloud.html) patterns preserved as-is — domain swap to dev events only.
-->

# Design System Inspiration of KTB (카카오테크 부트캠프) — for Dev Event Web

## 1. Visual Theme & Atmosphere

KTB(카카오테크 부트캠프)는 교육 플랫폼이지만, 비주얼은 **테크 컴퍼니의 신뢰감**을 가져간다. 짙은 네이비(`#000040`)와 채도 높은 시그니처 블루(`#0043ff`)가 한 쌍으로 움직이고, 그 사이를 흰 캔버스가 떠받친다. KakaoTalk의 따뜻한 노랑과는 다른 결 — 부트캠프의 정체성은 "친근함"이 아니라 "단단함"이다.

The design philosophy is **content-forward**, **token-disciplined**, and **media-rich**. course-card의 썸네일은 영상이 자동 재생되고, 카드 자체는 그림자 없이 라운디드 비디오 컨테이너 + 짧은 타이틀 + 캘린더 아이콘 한 줄로 끝난다. 정보는 시각적 노이즈 없이 직접적으로 전달된다 — chrome이 아니라 content가 무대 위에 선다.

Typography는 **Pretendard 한 줄**로 통일한다. 한글 가독성, 모던한 자소 구조, 다국어 친화성을 모두 갖춘 Korean OFL 폰트. 영문/숫자도 같은 가족 안에서 처리되어 코드 스타일의 ad-hoc 폰트 스위칭이 없다. 헤딩에는 letter-spacing `-0.012rem`로 살짝 조여 약간의 prose density를 만든다 — 부트캠프 헤드라인이 "공식 문서" 느낌으로 읽히게.

The overall aesthetic is **flat-but-confident**: 그림자 거의 없음, 미디어(영상/이미지)와 라운디드 컨테이너의 대비로 깊이를 만든다. 라운디드 스케일은 두 단계로 충분 — 카드 표면은 `12px` (border-radius-400), 디테일 페이지의 큰 surface는 `24px` (border-radius-600). 그 이상도 그 이하도 잘 안 쓴다.

**Key Characteristics:**
- KTB Tech Blue (`#0043ff`) as the singular brand accent — saturated, confident, not pastel
- KTB Tech Navy (`#000040`) as the brand base — deeper than black, anchors the visual stack
- Pretendard as the single typeface family (UI + display + body + caption)
- Vapor Design System tokens (Goorm GDS v0.21.4) as the spacing/color/radius substrate
- Course-card pattern: aspect-ratio 5/3 thumbnail + h5 title + icon-prefixed meta line
- Detail hero: 4-column grid (1/4 square thumb + 3/4 info column) with `--border-radius-600` corners
- Flat surfaces, no decorative shadow — depth from background tier shifts (white → gray-050)
- `word-break: keep-all` everywhere — Korean text never breaks mid-word
- Status badges with `pulse` keyframe glow for live/urgent states — the one allowed motion flourish

## 2. Color Palette & Roles

### Primary
- **KTB Tech Blue** (`#0043ff`): Primary brand color. Buttons (`.btn-ktb`), urgent badges, link emphasis, CTA accent. 부트캠프 라이브 상태의 시각적 앵커.
- **KTB Tech Navy** (`#000040`): Brand base. Wordmark, navy-tier badges, dark UI sections. Deeper than pure black for warmth at scale.
- **KTB Tech Sky** (`#78CDFF`): Supporting accent. Soft callouts, secondary highlights.
- **Pure White** (`#ffffff`): Body background, card surfaces, primary canvas.

### KTB Gradient Accents (Display Only)
모두 `linear-gradient(180deg, A 10%, B 100%)` 형태. Hero copy, marketing banner, featured event hero에만. **일반 카드/UI 텍스트에 절대 쓰지 말 것**.
- Yellow: `#FFE600 → #FFB900`
- Red/Pink: `#FF804E → #FF0073`
- Pink: `#F57DF0 → #F000E3`
- Violet: `#AF7DEB → #7A0CFF`
- Blue: `#00B7F8 → #006EF7`
- Sky: `#34B7F9 → #87E8DF`

### Semantic (Vapor)
- **Primary** (`rgb(29, 108, 224)` = `#1D6CE0`): Link text, primary text accents. Use with `var(--text-primary)`.
- **Danger** (`rgb(217, 28, 41)`): Error states, destructive actions, deadline-imminent badges.
- **Success** (`rgb(8, 120, 94)`): Confirmed registration, completed states.
- **Warning** (`rgb(180, 82, 9)`): Attention-needed states, soft alerts.

### Text Scale (Vapor)
- **Text Normal** (`rgb(43, 45, 54)` = `#2B2D36`): Body, titles, primary content. The workhorse.
- **Text Secondary** (`rgb(62, 64, 76)` = `#3E404C`): Card subtitles, secondary labels.
- **Text Hint** (`rgb(108, 110, 126)` = `#6C6E7E`): Period meta line, helper text, captions.
- **Text Alternative** (`rgb(82, 84, 99)` = `#525463`): Soft body in alternative surfaces.
- **Text Hint Alternative** (`rgb(62, 64, 76)`): Hint text on dark/colored surfaces.
- **Text Light** (`#ffffff`): Text on dark/colored backgrounds.

### Neutral Scale (Vapor `gray-*`)
| Token | Value | Use |
|-------|-------|-----|
| `--gray-000` | `#ffffff` | Page background, primary card surface |
| `--gray-050` | `#F7F7FA` | Alternative background — section bands, hover wash |
| `--gray-100` | `#F0F0F5` | Thumbnail placeholder bg, search field bg, soft fill |
| `--gray-200` | `#E8E8EE` | Subtle dividers, disabled-field fill |
| `--gray-300` | `#E1E1E8` | Standard border (`--border-color`) |
| `--gray-400` | `#CDCED6` | Hover border (`--border-hover`), disabled stroke |
| `--gray-500` | `#8C8F9F` | Icon default, placeholder text |
| `--gray-600` | `#6C6E7E` | Hint text |
| `--gray-700` | `#525463` | Secondary text on alt bg |
| `--gray-800` | `#3E404C` | Secondary text |
| `--gray-900` | `#2B2D36` | Body text, headings |
| `--gray-950` | `#252730` | Strongest text emphasis |

### Borders & Backgrounds
- `--border-color` = `#E1E1E8` — default 1px borders
- `--border-hover` = `#CDCED6` — hover state borders
- `--background-normal` = `#ffffff` — primary surface
- `--background-alternative` = `#F7F7FA` — section banding, common-card surface

## 3. Typography Rules

### Font Family
- **Single Family**: `Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Roboto, "Noto Sans KR", "Malgun Gothic", sans-serif`
- **Monospace** (only when code is shown): `"SF Mono", SFMono-Regular, Menlo, Consolas, monospace`

Pretendard is OFL — load via `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`. 모든 weight를 한 번에 로드하지 말고 사용하는 400/500/700/800만 selectively load.

### Hierarchy (Vapor `--font-size-*` + `--line-height-*`)

| Role | Size | Line | Weight | Letter Spacing | Notes |
|------|------|------|--------|----------------|-------|
| Display | 2.375rem (38px) | 3rem | 700-800 | normal | Marketing hero, gradient-accented copy only |
| Heading H1 | 2rem (32px) | 2.25rem | 700 | normal | Page title (events 목록, 상세 hero) |
| Heading H2 | 1.5rem (24px) | 2rem | 700 | normal | Section header (월별 묶음, 카테고리) |
| Heading H3 | 1.25rem (20px) | 1.875rem | 700 | normal | Sub-section / event detail tab title |
| Heading H4 | 1.125rem (18px) | 1.625rem | 700 | normal | Card group titles |
| Heading H5 (Card Title) | 1rem (16px) | 1.5rem | 700 | `-0.012rem` | **course-card / event-card 타이틀** — single line ellipsis |
| Body | 1rem (16px) | 1.5rem | 400-500 | normal | Default body, descriptions |
| Subtitle 1 (Meta) | 0.875rem (14px) | 1.375rem | 400-500 | normal | Card period line, secondary meta |
| Caption | 0.75rem (12px) | 1.125rem | 400-500 | normal | Timestamps, badge text, smallest labels |
| Micro | 0.625rem (10px) | 0.875rem | 500 | normal | Tag chips, tab labels |

### Principles
- **One family, one rhythm**: Pretendard로 통일. 다른 폰트를 섞지 말 것. 영문 헤딩만 영문 폰트로 바꾸는 식의 ad-hoc 스위칭 금지.
- **Heading letter-spacing**: 카드/페이지 헤딩에 `-0.012rem` 적용해 한글 자소 사이를 살짝 조인다. 본문에는 적용하지 않는다.
- **Weight discipline**: 400(body) / 500(emphasized body, meta) / 700(headings, card titles) / 800(display). 600/900 사용하지 않는다 — Pretendard variable이지만 토큰에 없는 weight는 ship하지 않는다.
- **`word-break: keep-all`**: 한글이 단어 단위로 줄바꿈되도록 `body`에 글로벌 적용. CJK 가독성의 기본기.

## 4. Component Stylings

### Buttons

**Primary (`.btn-ktb`)**
- Background: `#0043ff` (`--ktb-tech-blue`)
- Hover background: `#0238D1` (`--ktb-tech-navy-hover`)
- Text: `#ffffff`
- Padding: `var(--space-150) var(--space-300)` (12px 24px)
- Radius: `var(--border-radius-400)` (12px)
- Font: 1rem / weight 700
- Use: Primary CTA — "행사 등록하러 가기", "신청", "참여"

**Secondary / Outline**
- Background: transparent
- Text: `#2B2D36` (`--text-normal`)
- Border: 1px solid `#E1E1E8` (`--border-color`)
- Hover border: `#CDCED6` (`--border-hover`)
- Radius: `var(--border-radius-400)` (12px)
- Use: Secondary actions — "취소", "필터 초기화"

**Ghost / Tertiary**
- Background: transparent
- Text: `#1D6CE0` (`--text-primary`)
- Border: none
- Use: Inline links, tab triggers

**Danger**
- Background: `#D91C29` (`--text-danger`)
- Text: `#ffffff`
- Radius: `var(--border-radius-400)`
- Use: 신청 취소, 삭제

### Course / Event Card (Defining Component — Hero of the System)

The card is **the** unit of the events list. Trace this spec exactly.

```
.event-card                          ← container (a.event-link wraps everything)
├── .event-thumb                     ← media area
│   ├── .event-status-badge          ← absolute top-left badge (live/마감임박/모집중)
│   ├── video.event-video            ← autoplay loop muted playsinline (desktop)
│   └── picture > img                ← static fallback (mobile / no-video)
└── .event-info
    ├── .event-name                  ← h5 — single-line ellipsis title
    ├── .event-period                ← subtitle-1 — calendar icon + date range
    └── .badge-container             ← chip row (카테고리, 지역, 온라인/오프라인)
```

**`.event-card`**
- Width: 100% of grid cell
- Background: `#ffffff`
- Border: **none** (the card is shape-less — its thumb defines the silhouette)
- Hover: `.event-card:hover .event-video { transform: scale(1.05); }` — only the media zooms

**`.event-thumb`**
- `width: 100%; aspect-ratio: 5 / 3; overflow: hidden;`
- `border-radius: var(--border-radius-400)` (12px)
- `background-color: var(--gray-100)` (`#F0F0F5`) — placeholder while video loads
- `position: relative` — anchor for absolute badge

**`.event-status-badge`**
- `position: absolute; top: var(--space-200); left: var(--space-200);` (16px / 16px)
- `z-index: 1`
- Use `.badge-ktb-blue` (live / 진행중), `.badge-ktb-navy` (예정), `.badge-ktb-danger` (마감임박) with `pulse-*` keyframe

**`.event-video`**
- `width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;`
- `transition: transform 0.3s ease;` ← THE hover signature
- Mobile: replace with `<picture>` static image (no autoplay on cellular)

**`.event-info`** (content block below thumb)
- `padding-top: var(--space-150)` (12px above title)
- No padding sides — aligns flush with thumb edge

**`.event-name`**
- `h5` element
- Color: `var(--text-normal)` (`#2B2D36`)
- Font: 1rem (16px) / weight 700 / letter-spacing `-0.012rem`
- `margin-bottom: var(--space-050)` (4px)
- Single-line ellipsis: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`

**`.event-period`** (subtitle-1 meta line with calendar icon)
- Color: `var(--text-hint)` (`#6C6E7E`)
- Font: 0.875rem (14px) / weight 400
- `display: flex; align-items: center; gap: var(--space-050)` (4px between icon and text)
- `margin-bottom: var(--space-150)` (12px)
- Icon: 16×16 inline SVG, `fill: currentColor`

**`.badge-container`**
- `display: flex; flex-wrap: wrap; gap: var(--space-050)` (4px)
- Chip child style: see Tags / Badges below

### Tags / Badges (chips inside cards)

- Background: `var(--gray-100)` (`#F0F0F5`)
- Text: `var(--text-hint-alternative)` (`#3E404C`)
- Padding: `var(--space-025) var(--space-100)` (2px 8px)
- Radius: `var(--border-radius-200)` (6px) — flatter than card radius, signals "secondary"
- Font: 0.75rem (12px) / weight 500
- `badge-contrast` variant: bg `rgba(62, 64, 76, .32)` over media

### Cards & Containers (`.common-card`)

For event detail page sections (description, schedule, registration info).

- Background: `var(--background-alternative)` (`#F7F7FA`)
- Border: **none**
- Radius: `var(--border-radius-600)` (24px) — bigger than the list card for hierarchical contrast
- Padding: `var(--space-300)` (24px)
- Shadow: **none** — flat-by-default

### Event Detail Hero (`.hero-main-row--course` pattern)

The signature 4-column grid for `/event/detail/[eventId]`.

```
┌───────────┬──────────────────────────────────┐
│  thumb    │   info-column                    │
│  1/4      │   3/4                            │
│  square   │   ┌──────────────────┐           │
│           │   │ event-title (h1) │           │
│           │   │ event-description│           │
│           │   │ btn-ktb (primary)│           │
│           │   └──────────────────┘           │
└───────────┴──────────────────────────────────┘
```

- Container: `display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: var(--space-300);` (24px gap)
- `.thumb-container`: `grid-column: 1 / 2; aspect-ratio: 1 / 1; border-radius: var(--border-radius-600);` (24px) `background-color: var(--background-alternative);`
- `.info-column`: `grid-column: 2 / 5;`
- `.event-header-detail`: `display: flex; flex-direction: column; gap: var(--space-100);` (8px between title and description)
- `.event-title`: `color: var(--text-normal); margin: 0;` — page-level h1
- `.event-description`: `color: var(--text-hint); margin: 0;`
- Mobile: thumb stacks above info, full-width

### Inputs & Forms
- Border: 1px solid `var(--border-color)` (`#E1E1E8`)
- Radius: `var(--border-radius-400)` (12px)
- Focus: border becomes `var(--text-normal)` (`#2B2D36`) — no glow, no shadow
- Text: `var(--text-normal)`, Placeholder: `var(--gray-500)` (`#8C8F9F`)
- Search bar: `var(--gray-100)` (`#F0F0F5`) bg, `var(--border-radius-400)` radius — borderless variant

### Navigation
- Top nav height: 7.5rem (120px) — generous, accommodates logo + utility row + tab row
- Body has `padding-top: 7.5rem` global offset
- Tab item: `--text-hint` default, `--text-normal` + 2px bottom border on active
- Font: 1rem / weight 500 / 700 on active

## 5. Layout Principles

### Spacing System (Vapor `--space-*`)

| Token | rem | px | Common Use |
|-------|-----|----|------------|
| `--space-000` | 0 | 0 | Reset |
| `--space-025` | 0.125 | 2 | Hairline gaps in chips |
| `--space-050` | 0.25 | 4 | Icon-to-text gap, chip gap |
| `--space-075` | 0.375 | 6 | Tight chip padding-y |
| `--space-100` | 0.5 | 8 | Card stack gap, badge padding-x |
| `--space-150` | 0.75 | 12 | Section internal gap, title-to-meta |
| `--space-175` | 0.875 | 14 | Off-step adjustments |
| `--space-200` | 1 | 16 | **Standard horizontal padding**, badge top/left |
| `--space-225` | 1.125 | 18 | Off-step adjustments |
| `--space-250` | 1.25 | 20 | Section padding-y small |
| `--space-300` | 1.5 | 24 | **Card padding, grid column-gap, common-card padding** |
| `--space-400` | 2 | 32 | Section gap medium |
| `--space-500` | 2.5 | 40 | Section gap large |
| `--space-600` | 3 | 48 | Hero vertical padding |
| `--space-700` | 3.5 | 56 | Title margin-bottom on landing |
| `--space-800` | 4 | 64 | **content-section padding-y** |

### Grid & Container
- Max content width: **1104px** (laptop) — match existing project token
- Horizontal padding: 16px (mobile) / 64px (tablet) / 48px (laptop)
- Events list grid: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-300);` — responsive course-card row
- Detail hero: 4-column grid, see Hero spec above

### Whitespace Philosophy
- **Card-as-island**: Cards float in whitespace, no card-to-card borders. The thumb radius does the visual separation.
- **Section banding**: Alternate `--background-normal` (white) and `--background-alternative` (`#F7F7FA`) for scroll rhythm. No 3rd background tier.
- **Generous top padding**: 7.5rem body offset for fixed nav — never overlap content.
- **`word-break: keep-all`**: 한글 문장이 단어 중간에서 끊기지 않게. 모든 텍스트 컨테이너에 적용.

### Border Radius Scale (Vapor `--border-radius-*`)
- `--border-radius-100` (8px): Chips/tags on solid surfaces
- `--border-radius-200` (6px): Small badge chips
- `--border-radius-400` (**12px**): **Standard for course-card thumb, buttons, inputs** — THE workhorse radius
- `--border-radius-600` (**24px**): **Common-card / detail hero containers** — THE elevated radius
- Pill (9999px): Status badges, count badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | **Default — everything**. Cards, list items, buttons, badges |
| Pulse Glow (Special) | `box-shadow: 0 0 0 0 rgba(...0.6) → 0 0 0 8px rgba(...0)` keyframe | Live/urgent status badges only |
| Subtle (Level 2) | `0px 2px 6px rgba(0,0,0,0.08)` | Dropdown menus, popovers (rare) |
| Elevated (Level 3) | `0px 4px 12px rgba(0,0,0,0.12)` | Modal dialogs, bottom sheets (rare) |

**Shadow Philosophy**: KTB는 flat 디자인 시스템이다. 카드, 버튼, 일반 surface에 그림자를 쓰지 않는다. 깊이는 두 가지 수단으로만 만든다 — (1) 배경 색 tier 전환 (`gray-000` → `gray-050` → `gray-100`), (2) `pulse-*` 키프레임으로 라이브 상태 강조. 일반 hover에 box-shadow 추가 금지 — hover는 미디어 scale로만.

## 7. Do's and Don'ts

### Do
- Use KTB Tech Blue (`#0043ff`) as the **single** primary brand accent
- Use Pretendard as the **single** typeface family — UI / display / body / monospace exempt
- Use `var(--border-radius-400)` (12px) for cards/buttons/inputs and `var(--border-radius-600)` (24px) for detail surfaces
- Apply `letter-spacing: -0.012rem` to headings/card titles (not body)
- Apply `word-break: keep-all` globally for Korean text integrity
- Use `transform: scale(1.05)` on `.event-video` for the only card-hover signature
- ~~Use `pulse-blue` / `pulse-navy` / `pulse-danger` keyframe on status badges~~ → 이 서비스에서는 쓰지 않는다. §7 핵심 원칙 5번 참고 (WEB-038)
- Use Vapor design tokens (`--space-*`, `--gray-*`, `--text-*`, `--border-radius-*`) — never hardcode values when a token exists
- Stack thumb (1/4 square) + info column (3/4) for detail hero on desktop; collapse to vertical on mobile
- Render `<video autoplay loop muted playsinline>` for course/event thumbnails on desktop; fall back to `<picture>` on mobile (cellular-safe)

### Don't
- **Don't add box-shadow to cards or buttons** — KTB is flat. The pulse keyframe is the only shadow.
- **Don't mix fonts** — Pretendard handles 영문/숫자/한글 모두. ad-hoc 영문 폰트 스위칭 금지.
- **Don't use KTB gradient accents on functional UI** — gradient은 hero/marketing display 전용. 일반 카드/버튼/타이틀에 금지.
- **Don't use pure black (`#000000`) for text** — `--text-normal` (`#2B2D36`) for body, `--ktb-tech-navy` (`#000040`) only for wordmark/brand surfaces.
- **Don't break the card silhouette** — 카드에 border를 두르지 말 것. thumb의 radius와 whitespace로 분리.
- **Don't add multi-line card titles** — `.event-name`은 single-line ellipsis. 두 줄이 필요하면 카드 grid를 다시 짠다.
- **Don't autoplay video on mobile** — cellular cost. Use `<picture>` with `source media="(max-width: 576px)"`.
- **Don't use weights outside 400/500/700/800** — Pretendard variable이지만 토큰 밖 weight는 ship하지 않는다.
- **Don't bring the pulse keyframe back** — 라이브 상태는 색으로만 구분한다. 무한 반복 글로우는 목록에서 제목보다 먼저 눈에 띈다 (WEB-038).

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <576px | Single-column cards, thumb uses `<picture>` (no autoplay), 16px h-padding |
| Tablet | 576-768px | 2-column event grid, video autoplay activates, 64px h-padding |
| Laptop | 768-1104px | 3-4 column event grid, full hero 4-col detail layout |
| Desktop | >1104px | Content max-width 1104px, generous whitespace outside |

### Touch Targets
- Card link: entire `.event-card` is tappable (anchor wraps everything)
- Button minimum: 44×44px tap target — use `min-height: 2.75rem` for icon-only buttons
- Tab item: minimum 56px height with padding

### Collapsing Strategy
- **Event detail hero**: desktop 4-column grid → mobile vertical stack (thumb full-width, info below)
- **Events list**: 4 columns (desktop) → 3 (laptop) → 2 (tablet) → 1 (mobile) — via `auto-fill, minmax(280px, 1fr)`
- **Top nav**: full nav on desktop → hamburger on mobile, height stays 7.5rem
- **`.common-card` padding**: `--space-300` (24px) desktop → `--space-200` (16px) mobile

### Image / Video Behavior
- Thumbnails: aspect-ratio 5/3 (list card) or 1/1 (detail thumb)
- Desktop: autoplay loop muted video with static `<picture>` fallback
- Mobile (<576px): static `<picture>` only — no autoplay
- Profile/avatar (when applicable): 48px rounded square (12px radius), not circles
- Decorative event banner imagery: `object-fit: cover` inside fixed-aspect container

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA bg: KTB Tech Blue (`#0043ff`)
- Primary CTA hover bg: KTB Navy Hover (`#0238D1`)
- Primary CTA text: White (`#ffffff`)
- Body bg: White (`#ffffff` = `--gray-000`)
- Alternative bg: `#F7F7FA` (`--background-alternative`)
- Card placeholder bg: `#F0F0F5` (`--gray-100`)
- Heading text: `#2B2D36` (`--text-normal`)
- Body text: `#2B2D36` (`--text-normal`)
- Secondary text: `#3E404C` (`--text-secondary`)
- Hint/Meta text: `#6C6E7E` (`--text-hint`)
- Link: `#1D6CE0` (`--text-primary`)
- Border: `#E1E1E8` (`--border-color`)
- Border hover: `#CDCED6` (`--border-hover`)
- Error: `#D91C29` (`--text-danger`)
- Success: `#08785E` (`--text-success`)

### Example Component Prompts

- **Event Card**: "Create an event card: anchor wrapping `.event-thumb` (aspect-ratio 5/3, 12px radius, `#F0F0F5` placeholder bg, `<video autoplay loop muted playsinline>` on desktop with `<picture>` mobile fallback, absolute top-left status badge at 16px) + `.event-info` (padding-top 12px, h5 `.event-name` 16px weight 700 `#2B2D36` single-line ellipsis with letter-spacing -0.012rem, then `.event-period` subtitle 14px `#6C6E7E` with calendar SVG icon 16×16 gap 4px, then `.badge-container` flex-wrap gap 4px). On hover, only the video transforms `scale(1.05)` with 0.3s ease transition. No card border, no shadow."

- **Primary Button**: "Create a `.btn-ktb` primary button: bg `#0043ff`, hover bg `#0238D1`, text `#ffffff` weight 700 size 1rem, padding 12px 24px, border-radius 12px. No box-shadow."

- **Detail Hero**: "Build the event detail hero: 4-column grid, column-gap 24px. Column 1 (grid-column 1/2): square thumbnail container, aspect-ratio 1/1, border-radius 24px, bg `#F7F7FA`. Columns 2-4 (grid-column 2/5): info column with vertical stack (gap 8px) — h1 `.event-title` color `#2B2D36` margin 0, then `.event-description` color `#6C6E7E` margin 0, then `.btn-ktb` primary button. On mobile, stack thumb full-width above info column."

- **Common Card Container**: "Create a `.common-card`: bg `#F7F7FA`, border-radius 24px, padding 24px, no border, no shadow. Use for grouping event detail sub-sections (schedule, registration info, requirements)."

- **Status Badge with Pulse**: "Create a pulsing `.badge-ktb-blue`: bg `#0043ff`, text white, padding 4px 8px, border-radius pill (9999px), font 12px weight 500. Apply `animation: pulse-blue 2s infinite;` where `@keyframes pulse-blue` goes from `box-shadow: 0 0 0 0 rgba(0, 67, 255, 0.6)` to `0 0 0 8px rgba(0, 67, 255, 0)` to `0 0 0 0 rgba(0, 67, 255, 0)`."

- **Chip / Tag**: "Create a chip: bg `#F0F0F5`, text `#3E404C` weight 500 size 12px, padding 2px 8px, border-radius 6px. Use inside `.badge-container` of an event card to show category/region/online tags."

### Iteration Guide
1. **Pretendard is the single font** — UI/display/body/caption all share one family. Never mix fonts.
2. **Two radii do 90% of the work**: 12px (`--border-radius-400`) for list cards/buttons/inputs, 24px (`--border-radius-600`) for detail surfaces.
3. **The card is shape-less; the thumb carries the silhouette**. Don't add borders or shadows to cards.
4. **Hover is media-only**: `.event-video { transform: scale(1.05); transition: transform 0.3s ease; }` — nothing else changes on hover.
5. ~~**Status badges pulse, nothing else does**~~ → **모션은 hover 전환뿐**. KTB 원본은 라이브 배지에 `pulse-*` 키프레임을 썼지만, 이 서비스에서는 **걷어냈다** (WEB-038).
   D-day 배지와 '행사 진행중' 칩이 화면에 여러 개 깔리는 구조라, 무한 반복하는 글로우가 목록을 훑는 내내 시선을 잡아채 정작 행사 제목을 읽기 어려웠다.
   상태 구분은 색(blue/navy/danger)만으로 충분하다. 아래 §4·§6 의 `pulse-*` 서술은 KTB 원본 기록으로만 남긴다.
6. **Gradient accents are display-only**: hero copy, marketing banner. Never on functional UI.
7. **Section banding**: white (`--gray-000`) ↔ near-white (`--background-alternative` `#F7F7FA`). Just two background tiers, alternated.
8. **Korean-first typography**: `letter-spacing: -0.012rem` on headings, `word-break: keep-all` globally.
9. **Token-discipline**: Reach for `var(--space-*)` / `var(--gray-*)` / `var(--text-*)` / `var(--border-radius-*)` before typing a hex or px. If the value isn't in the token table above, ask before adding.

## 10. Brand Landing Hero Motion Contract

The `/` brand landing hero uses its generated desktop/mobile artwork as the complete visual baseline. Three.js may add depth, but it must never carry essential content or replace the static art.

- **Role**: a transparent starfield plus low-density cyan, blue, and violet nebula-dust layer. The dust follows visible curl-like paths, drifts as a group, and gently pulses while the stars retain subtle pointer parallax and restrained twinkle; HTML remains responsible for the `DEV EVENT` title, description, and actions.
- **Visual priority**: motion stays behind the shade and content layers. Keep the center readable and avoid bloom, lens distortion, logo deformation, or dense particle trails.
- **Performance**: render only while the hero intersects the viewport, cap pixel ratio, prefer low-power WebGL, and dispose GPU resources when the component unmounts.
- **Fallback**: disable WebGL decoration at widths up to 600px, when `prefers-reduced-motion: reduce` is active, or when WebGL initialization fails. The static image must remain visually complete in every fallback.
- **Interaction**: pointer movement may shift camera perspective slightly, but the canvas must use `pointer-events: none` and must not compete with navigation or CTAs.

## 11. Brand Landing Companion Services Contract

The `/` brand landing page presents Android, iOS, Instagram, Threads, email subscription, and the Whale browser extension as companion ways to keep using Dev Event beyond the website.

- **Placement**: keep companion services in a dedicated section between the brand introduction and footer so they remain visible without competing with the primary event CTA.
- **Card anatomy**: each card owns a code-native service icon, service name, one concise benefit-led description, and a directional arrow. Do not reuse third-party promotional banners as the card surface.
- **Visual language**: use a flat near-black card surface, 24px radius, and solid color only. Decorative gradients, blurred glows, and card shadows are prohibited in this functional section.
- **Layout**: pair services in a two-column grid on desktop/tablet — Android with iOS, Instagram with Threads, and email subscription with Whale — then collapse to one column on mobile with the same source order and no horizontal scrolling.
- **Interaction**: the full card opens the external service in a new tab, provides a descriptive accessible name, and changes only its background and border color on hover. Do not translate, scale, or shadow the card; retain a visible keyboard focus outline.
- **Assets**: use accurate Android, Apple, Instagram, and Threads brand glyphs from the existing local icon package. Reuse the repository's official Whale artwork for the browser extension. Email subscription is vendor-neutral, so use a polished generic mail symbol rather than a Gmail or other vendor mark.

## 12. Brand Landing Supporting Chrome Contract

- **Header**: the brand landing header is wordmark-only. Primary event discovery remains in the hero CTA; do not add duplicate navigation links or an empty mobile menu.
- **Supporting CTA**: use a solid neutral charcoal surface with a subtle neutral border. Avoid blue-tinted panels, gradients, or decorative glow; the white action button carries the emphasis.
- **Footer**: retain the `DEV EVENT` wordmark, service description, and project copyright with the contributor name linked to the public GitHub repository. Pair these details with compact GitHub and Whale service links, following the information hierarchy of the `/events` footer while using the brand landing page's flat charcoal surfaces and focus treatment.

## 13. Brand Landing Route Entry Contract

- **Route ownership**: the brand landing page lives at `/about`; `/` remains the service entry route and redirects to `/events` while preserving the existing authentication-token cookie handoff.
- **Service entry point**: the shared service header places a compact `데브이벤트 소개` link immediately after the `DEV.EVENT` logo. It routes internally to `/about` and remains visible on desktop and mobile.
- **Hierarchy**: style the introduction link as a quiet secondary button so event discovery, theme controls, and account actions retain priority.
## 14. Host Pages (주최)

주최(host) 영역은 두 페이지로 구성됩니다 — 각각 *발견(discovery)*과 *통합(consolidation)*의 역할을 분담합니다.

| 라우트 | 역할 | 진입 경로 |
|--------|------|-----------|
| `/hosts` | 주최자 둘러보기 (list) | 글로벌 네비 |
| `/hosts/[organizer]` | 한 주최자의 전체 행사 + 메타 | event 카드의 `organizer` 텍스트 클릭 |

이 영역의 핵심 디자인 의도는 *주최자도 행사 만큼 1등 시민*이라는 점이에요. 단순히 "이벤트 모음 페이지"가 아니라 wanted/daangn careers처럼 주최 자체에 정체성을 부여하는 카드/페이지로 다룹니다.

### 14.1 데이터 모델 (mock → API 설계 기준)

```ts
// 목록 카드용
interface HostListItem {
  organizer: string;          // URL slug & 표시 이름
  logoEmoji: string;          // 첫 글자 또는 이모지
  logoGradient: string;       // CSS gradient — 브랜드 색
  logoTextColor?: string;     // 그라데이션 위 글자 색 (밝은 배경엔 navy)
  verified: boolean;          // 공식 인증 배지
  classification:             // 8개 카테고리 칩과 1:1 매칭
    '기업' | '커뮤니티' | '학회/연구소' | '정부/공공' | '교육' | '미디어';
  domain: string;             // 메타 라인의 두 번째 항목 (예: '핀테크', '클라우드')
  ongoingCount: number;       // '행사 진행중 N' 칩에 표시
  totalCount: number;         // 누적 행사 칩
  shortDescription: string;   // 2줄 ellipsis
  topics: string[];           // 자주 다룬 주제 (3개 권장)
}

// 상세 페이지용 (HostListItem + 행사/메타/링크 확장)
interface Host {
  // ... HostListItem 의 필드와 호환
  metaCategory: string;       // 헤더 메타 (예: '모바일 · 커뮤니티')
  metaLocation: string | null;
  metaHistory: string;        // '2015년부터 24건 주최'
  homepageUrl: string | null;
  description: string;        // 긴 설명
  chips: { label: string; variant?: 'live'|'default'|'ghost' }[];
  ongoingEvents: Event[];     // 기존 Event 타입 재사용
  pastEvents: Event[];
  topics: { name: string; count: number }[];
  links: { label: string; url: string }[];
  summary: {                  // 사이드바 활동 요약
    totalEvents: number;
    averageCadence: string;
    firstEventDate: string;
    recentDelta: string;
  };
}
```

> **API 설계 시 주의**: `null`을 명시적으로 쓸 것 (`undefined` 금지 — Next.js `getServerSideProps` 직렬화 에러 발생).

### 14.2 호스트 로고 그라데이션 시스템

브랜드 정체성을 시각적으로 잇기 위해 **48×48 / 64×64 둥근 사각형 + CSS 그라데이션**을 사용해요. 이모지나 알파벳 한 글자가 위에 올라가고, 노란 계열에는 navy 글자, 그 외에는 흰 글자.

| 브랜드 톤 | 그라데이션 | 사용 예 |
|-----------|------------|---------|
| Warm | `linear-gradient(135deg,#FF804E,#FF0073)` | 당근, 패스트캠퍼스 |
| Yellow | `linear-gradient(135deg,#FFE600,#FFB900)` | 카카오, AWSKRUG (글자색 navy) |
| Blue | `linear-gradient(135deg,#00B7F8,#006EF7)` | 토스 |
| Violet | `linear-gradient(135deg,#AF7DEB,#7A0CFF)` | 우아한형제들, DACON |
| Sky | `linear-gradient(135deg,#34B7F9,#87E8DF)` | GDG Korea |
| Green | `linear-gradient(135deg,#00C73C,#03A731)` | NAVER |
| Deep Violet | `linear-gradient(135deg,#5B3F9F,#7A0CFF)` | (해시 배정용) |
| Coral | `linear-gradient(135deg,#FF6B6B,#FF0073)` | (해시 배정용) |

이 **8개 톤**이 충분히 다양해서 추가 색을 만들지 마세요. 로고 이미지가 없는 주최자는 `host_name` 의 char-code 해시로 8개 중 하나를 결정론적으로 배정합니다 (`lib/host/logoFallback.ts > LOGO_GRADIENTS`).

> **DES-110 정정(2026-08-17)**: 문서에는 6톤만 적혀 있었지만 코드는 8톤을 쓰고 있었습니다.
> 톤을 6개로 줄이면 해시 분포가 바뀌어 **기존 주최자의 로고 색이 전부 달라지므로**, 코드(8톤)를 정본으로 두고 이 표를 갱신했습니다.
> 경로 표기도 실제 위치(`lib/host/logoFallback.ts`)로 고쳤습니다 — 예전 `lib/mock/hosts.ts > pickGradient` 는 존재하지 않습니다.

**로고 이미지 로딩 정책 (WEB-034 결정, 2026-08-17)**

주최자 로고는 `next/image` 가 아니라 **일반 `<img>` + `onError` 폴백**을 씁니다.
`next/image` 는 `next.config.js > images.domains` 화이트리스트에 없는 호스트를 받으면 **페이지 전체를 런타임 에러로 죽입니다.**
로고 URL 은 어드민이 입력·업로드하는 값이라 화이트리스트를 미리 확정할 수 없으므로, 깨진 이미지 하나가 화면을 못 쓰게 만드는 위험을 피했습니다.
대신 로드 실패 시 `lib/host/logoFallback.ts > fallbackLogo` 의 이니셜 뱃지로 대체합니다(DES-100).

### 14.3 컴포넌트 구성

```
components/hosts/
├── HostBanner.tsx          (detail: 상단 그라데이션 배너 160px)
├── HostHeader.tsx          (detail: 로고 + 이름 + 메타 + 칩 + 설명)
├── HostEventCard.tsx       (detail: 행사 한 줄 카드 — 썸네일 색 5종 순환)
├── HostEventList.tsx       (detail: 탭(진행중/지난/전체) + 섹션)
├── HostTopicStrip.tsx      (detail: 자주 다룬 주제 스트립)
├── HostSidebar.tsx         (detail: 바로가기 + 활동 요약)
├── HostCard.tsx            (list: 그리드 카드)
└── HostListControls.tsx    (list: 검색 + 정렬 + 카테고리 칩)
```

### 14.4 핵심 시각 규칙

**리스트 페이지 (`/hosts`)**
- 그리드: 데스크탑 3열 / 920px 이하 2열 / 560px 이하 1열, `gap: 16px`
- 카드 hover: `border-color: var(--vapor-gray-400)` + `transform: translateY(-2px)` + `box-shadow: 0 4px 16px rgba(15,17,28,0.06)`
- 검색·정렬·카테고리 모두 **클라이언트 사이드 상태** — 새 페이지 로드 없이 즉시 반응 (서버 라운드트립 없음)
- 카테고리 칩의 **활성 상태**: `background: var(--ktb-tech-navy)` + 흰 글자 — 일반 칩과 명확히 구분되는 dark fill
- 정렬은 **드롭다운**(`활동 많은 순` / `최근 행사 순` / `가나다순`)으로 고른다. 선택지가 셋이라 순환 토글로는 원하는 값을 한 번에 집을 수 없고, 어떤 선택지가 있는지도 알 수 없어 목록을 펼치는 방식으로 바꿨다 (WEB-036).
  현재 값은 트리거 라벨과 메뉴 안 체크 표시 양쪽에 드러내고, `aria-haspopup="listbox"` + `role="option"` + 키보드(↑/↓/Esc)를 지원한다

**상세 페이지 (`/hosts/[hostId]`)** — 라우팅 키는 주최자 이름이 아니라 서버 PK 숫자다
- 메인 그리드: `minmax(0, 1fr) 272px` + `gap: 40px`, 좌측 컨텐츠 / 우측 sticky 사이드바.
  사이드바는 짧은 라벨/값 쌍만 담으므로 폭을 아끼고 주인공인 행사 카드에 넓이를 준다 (예전 `304px` + `gap 48px` 는 본문에서 352px 를 가져가 카드가 눌렸다)
- 상단 배너 높이 160px, `border-radius: 24px`, 메인 컨텐츠와 24px gap
- 호스트 로고는 **배너 위에 띄우지 않고** 호스트 이름 옆에 인라인 배치 (`profile__nameRow` flex row + gap 16px) — wanted 패턴의 떠있는 로고 카드는 시각적으로 어색해서 의도적으로 피함
- 행사 카드 썸네일: **`/events` 목록 카드와 같은 이미지 정책**을 쓴다 — `lib/utils/eventThumbnail.ts` 한 곳에서 판정하고, 허용된 S3 호스트면 `cover_image_link`, 아니면 `/default/event-thumbnail-light.png`.
  예전에는 5색 순환 블록(`thumb__c1` ~ `thumb__c5`)이었으나, **같은 행사가 목록에서는 썸네일 이미지로 주최자 페이지에서는 색 블록으로 보여** 같은 행사인지 알아보기 어려웠다. 시각적 다양성보다 식별 일관성을 택했다 (WEB-037).
  지난 행사는 목록 카드와 동일하게 `rgba(0,0,0,0.4)` 오버레이로 누른다
- D-day 배지: 진행중이면 `rgba(217,28,41,0.08)` + `#D91C29`, 종료된 행사는 회색 fill
  - `event_time_type === 'RECRUIT'` 인 행사는 개최일이 아니라 **접수 마감일 기준**으로 계산하고 `마감 D-n` 으로 표기 (GAP-8)
- '자주 다룬 주제' 칩은 **표시 전용이 아니라 검색 이동**이다 — 클릭 시 `/events?search={topic}` 로 push (WEB-030 / DES-102 결정).
  button + hover 인터랙션 스타일을 이미 갖고 있어 '눌리는 것처럼' 보이므로, span 으로 강등하는 대신 실제 동작을 붙였다.
- 주최자 이름은 목록·행사 상세 어디서든 **숫자 `hosts[0].id`** 로 라우팅한다. `hosts` 가 비면 링크를 렌더하지 않는다 (WEB-023 / DES-094).

**공통**
- fixed `Header`(56px)를 페이지 컨텐츠가 가리지 않도록 페이지 최상단에 `padding-top: calc(#{$header-height} + 24px)` 보정 (다른 페이지의 `<Banner />` 컴포넌트와 동일한 패턴)
- `Letter` 컴포넌트(매주 데브이벤트 소식)는 main과 footer 사이에 두기 — events 페이지와 일관성

### 14.5 다크/라이트 모드

호스트 영역은 **모든 색을 토큰 변수로 처리**해 자동 다크 대응됩니다. 절대 하드코딩하지 마세요.

| 사용처 | 토큰 |
|--------|------|
| 카드 / 사이드바 surface | `var(--vapor-gray-000)` |
| 페이지 배경 | (Layout 기본) |
| 카드 border / divider | `var(--vapor-gray-300)` / `var(--vapor-gray-200)` |
| 본문 / 제목 텍스트 | `var(--vapor-gray-900)` |
| 메타 / 캡션 | `var(--vapor-gray-600)` ~ `--vapor-gray-700` |
| 카테고리 활성 칩 fill | `var(--ktb-tech-navy)` |
| 진행중 카운트 칩 | `rgba(0,67,255,0.08)` + `var(--ktb-tech-blue)` |
| pulse keyframe | rgba 그대로 (양쪽 모드에서 동일 빛) |

**예외 — 브랜드 그라데이션**: 호스트 로고의 그라데이션은 브랜드 정체성이라 다크 모드에서도 그대로 둡니다. 다만 그 위에 올라가는 글자 색(`logoTextColor`)은 그라데이션 명도에 따라 navy/white를 선택.

### 14.6 어드민/API 작성 시 권장 사항

1. **slug 정책**: organizer 한글 문자열을 URL slug로 그대로 사용 (URL-encode). 영문 alias가 필요하면 별도 필드(`slug_en`)로 추가하되, 한글 slug는 유지해 SEO/공유 링크 호환성 확보.
2. **빈 값 처리**: `metaLocation`, `homepageUrl`은 `null`을 명시적으로 보내야 함 (위 직렬화 주의 참고).
3. **검증 배지**: `verified` 기준은 어드민이 명시적으로 토글하는 manual flag. 자동 부여 금지 (스팸 호스트 등록 시 시각적 신뢰 훼손).
4. **`ongoingCount`/`totalCount` 계산**: 클라이언트가 직접 세지 않고 서버가 집계해 내려주기. `pastEvents`/`ongoingEvents` 배열이 비어도 카운트는 서버 값을 신뢰.
5. **topics 산출**: 행사 태그에서 빈도수 집계해 자동 생성하는 게 자연스럽지만 상위 3~8개로 cap. 어드민에서 수동 큐레이션 옵션도 열어두면 좋음.
