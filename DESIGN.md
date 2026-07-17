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

### Dark Mode Palette — Wanted Design System

다크 모드는 라이트의 Vapor 스케일을 **역순 매핑하지 않는다**. 대신 Wanted Design System의 다크 시맨틱 토큰 (Figma `qQPdpnglONbuWul4cvodyj` → node `15625:32983` → Color/Semantic/Dark)을 직접 채용한다. 역순 매핑이 만들던 함정(예: `--vapor-gray-950` 이 다크에선 흰색으로 뒤집혀 카드 active 상태가 흰색 박스가 되던 버그)을 제거하기 위함.

#### Background — page + elevated surfaces

| Wanted 토큰 | hex | 우리 매핑 | Use |
|---|---|---|---|
| `background-normal-normal` | `#1B1C1E` | `--vapor-gray-000`, `--background-1` | 페이지 베이스 캔버스 |
| `background-normal-alternative` | `#0F0F10` | (예약) | 가장 깊은 알트 (필요 시) |
| `background-elevated-normal` | `#212225` | `--vapor-gray-050`, `--background-2`, `--toggle-track-bg` | 카드, 모달, alt 표면 |
| `background-elevated-alternative` | `#141415` | (예약) | 깊은 alt elevated |

#### Line — borders + dividers

| Wanted 토큰 | hex | 우리 매핑 | Use |
|---|---|---|---|
| `line-solid-normal` | `#37383C` | `--vapor-gray-300`, `--gray-4`, `--toggle-active-bg` | 표준 1px 보더, 토글 active 표면 |
| `line-solid-neutral` | `#333438` | `--vapor-gray-200` | subtle 구분선 |
| `line-solid-alternative` | `#2E2F33` | `--vapor-gray-100`, `--gray-5` | placeholder bg, search field bg |

#### Interaction

| Wanted 토큰 | hex | 우리 매핑 |
|---|---|---|
| `interaction-inactive` | `#5A5C63` | `--vapor-gray-400`, `--gray-3` |
| `interaction-disable` | `#2E2F33` | (line-solid-alt와 동일) |

#### Label — text scale

| Wanted 토큰 | hex | 우리 매핑 | Use |
|---|---|---|---|
| `label-strong` | `#FFFFFF` | `--vapor-gray-900`, `--vapor-gray-950`, `--gray-1` | body, heading, 최강 강조 |
| `label-normal` | `#F7F7F8` | `--vapor-gray-800` | secondary 텍스트 |
| `label-neutral` | `#C2C4C8` | `--vapor-gray-700` | 대체 표면 위의 보조 텍스트 |
| `label-alternative` | `#AEB0B6` | `--vapor-gray-600`, `--gray-2` | hint, meta |
| `label-disable` | `#989BA2` | `--vapor-gray-500` | placeholder, icon default |

#### Primary — brand blue (dark variant)

다크에서는 KTB Tech Blue (`#0043FF`)가 어두운 배경 위에서 가독성이 떨어져 Wanted primary scale로 한 단계 밝힌다.

| Wanted 토큰 | hex | 우리 매핑 |
|---|---|---|
| `primary-normal` | `#3385FF` | `--ktb-tech-blue` (dark only), `--primary`, `--vapor-text-primary` |
| `primary-strong` | `#1A75FF` | `--ktb-tech-navy-hover` (dark only) |
| `primary-heavy` | `#0066FF` | (예약) |

라이트는 `#0043FF`를 그대로 유지. 브랜드 색은 유지하되 다크에서만 한 단계 밝힌 변종을 쓰는 패턴.

#### Status — saturated for dark legibility

| Wanted 토큰 | hex | 우리 매핑 |
|---|---|---|
| `status-positive` | `#1ED45A` | `--vapor-text-success` (dark) |
| `status-cautionary` | `#FFA938` | `--vapor-text-warning` (dark) |
| `status-negative` | `#FF6363` | `--vapor-text-danger` (dark) |

#### Translucent — sticky header + glass overlays

다크 전용 반투명 토큰 (light에선 별도 white 알파 값 사용):

| 토큰 | dark 값 | Use |
|---|---|---|
| `--header-bg` | `rgba(27, 28, 30, 0.86)` | sticky 헤더 |
| `--glass-overlay` | `rgba(33, 34, 37, 0.72)` | 모바일 카드 아이콘 글래스 |
| `--glass-overlay-strong` | `rgba(33, 34, 37, 0.94)` | 글래스 hover |
| `--notice-bg` | `rgba(51, 133, 255, 0.12)` | 상단 공지 배너 틴트 |

### Dark Mode Iteration Notes
- 다크 모드 토큰은 `styles/_color.scss`의 `$wanted-dark-*` 변수에 한 곳에 모아두고, `styles/Theme.scss`의 `html[data-theme='dark']` 블록에서 시맨틱 토큰에 매핑한다.
- 새 컴포넌트가 다크 변종이 필요하면 **반드시 시맨틱 토큰**(`var(--vapor-gray-*)`, `var(--ktb-tech-blue)` 등)을 통해 접근. 하드코딩한 흰색(`#fff`, `rgba(255,255,255,...)`)이 다크에 떨어지면 시각적 부조화 발생.
- 예외 1 (어두운 brand surface 위 텍스트): light/dark 무관하게 항상 어두운 SNS 배너의 흰 pill 같은 surface는 그 위 텍스트도 하드코딩된 다크 값(`#2B2D36`)을 써야 함. 토큰 inversion이 텍스트를 흰색으로 뒤집어 invisible 화하는 사고 방지.
- 예외 2 (KTB Blue surface 위 텍스트): KTB Tech Blue 배경(`--ktb-tech-blue` / `--primary`) 위 텍스트는 **반드시 하드코딩된 `#ffffff`** 를 쓴다. `var(--vapor-gray-000)` 이나 `var(--background-1)` 을 쓰면 다크에서 페이지 bg(`#1B1C1E`)로 뒤집혀 검정 글씨가 파란 버튼 위에 나타나는 사고가 발생. 이 패턴이 적용된 곳: `FillButton.color--primary`, `EmailSubscribeButton`.
- 예외 3 (인라인 동적 색상): 캘린더 chip(`CalendarGrid.tsx`)처럼 인라인 `style={{ color: tagHex, background: rgba(tagHex, 0.08) }}` 으로 카테고리 색을 칠하는 케이스는 라이트 bg 가정으로 튜닝됨. 다크에선 dark-on-dark 가독성 붕괴 → SCSS 모듈에서 `:global(html[data-theme='dark']) &` 셀렉터로 `color`/`background`를 `!important` override하여 대비를 회복하고, 카테고리 색은 `border-left` 만 유지하여 시각적 큐로 남긴다.

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
- Use `pulse-blue` / `pulse-navy` / `pulse-danger` keyframe **only** on status badges that indicate live/urgent state
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
- **Don't replace pulse keyframe with hover shadow** — 라이브 상태와 hover는 다른 감각. pulse는 자동 반복, hover는 사용자 의도.

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
5. **Status badges pulse, nothing else does**: `pulse-blue` / `pulse-navy` / `pulse-danger` keyframes are the only motion language outside of media zoom.
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
