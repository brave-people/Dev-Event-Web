import { LOGO_DEFS, LOGOS, LogoKey } from 'lib/sticker/logos';

// 스티커 그림. 목업 detail-design/stickers.js 를 옮긴 것이다.
// 흰 칼선 테두리와 그림자는 그림마다 그리지 않고 STICKER_DEFS 의 필터(#stk-diecut)가 만든다.

export const STICKER_NAMES = [
  'holo:logo',
  'holo:code',
  'laptop',
  'prompt',
  'term',
  'lg:js:hex:h',
  'lg:linux:hex:h',
  'lg:ts:disc:h',
  'lg:git:disc:h',
  'lg:python:disc:w',
  'lg:android:disc:k',
] as const;

export type StickerName = typeof STICKER_NAMES[number];

const INK = '#15171c';
const F = 'font-family="\'Pretendard Variable\', Pretendard, sans-serif"';
const M = 'font-family="ui-monospace, \'SF Mono\', Menlo, Consolas, monospace"';

const svg = (w: number, h: number, body: string): string =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;

const num = (v: number): number => Number(v.toFixed(5));

// 로고 도형을 24×24 칸 가운데에 맞춰 넣는다(공식 파일마다 그림 범위가 달라서).
// fg: 색이 정해지지 않은 조각의 채움. 공식 색이 정해진 조각은 그 색 그대로 찍는다.
const mark = (
  key: LogoKey,
  fg: string,
  x: number,
  y: number,
  k: number
): string => {
  const L = LOGOS[key];
  const [bx, by, bw, bh] = L.box;
  const fit = 24 / Math.max(bw, bh);
  const ox = num((24 - bw * fit) / 2);
  const oy = num((24 - bh * fit) / 2);
  if (L.use) {
    return `<g transform="translate(${x} ${y}) scale(${k})"><use href="#${
      L.use
    }" x="${ox}" y="${oy}" width="${num(bw * fit)}" height="${num(
      bh * fit
    )}"/></g>`;
  }
  const parts = (L.parts || [])
    .map(
      (part) =>
        `<path d="${part.d}" fill="${part.fill || fg}"${
          part.rule ? ` fill-rule="${part.rule}"` : ''
        }${part.transform ? ` transform="${part.transform}"` : ''}/>`
    )
    .join('');
  return `<g transform="translate(${x} ${y}) scale(${k}) translate(${ox} ${oy}) scale(${num(
    fit
  )}) translate(${-bx} ${-by})" stroke="none">${parts}</g>`;
};

const hex = (key: LogoKey, base: string, edge: string, fg: string): string =>
  svg(
    80,
    92,
    `<polygon points="40,2 78,24 78,68 40,90 2,68 2,24" fill="${base}" ${edge}/>${mark(
      key,
      fg,
      17.2,
      23.2,
      1.9
    )}`
  );

const disc = (key: LogoKey, base: string, edge: string, fg: string): string =>
  svg(
    84,
    84,
    `<circle cx="42" cy="42" r="39.5" fill="${base}" ${edge}/>${mark(
      key,
      fg,
      18,
      18,
      2
    )}`
  );

const EDGE = `stroke="${INK}" stroke-width="3.5"`;

const ART: Record<StickerName, () => string> = {
  'holo:logo': () =>
    svg(
      146,
      46,
      `<rect x="2" y="2" width="142" height="42" rx="10" fill="url(#stk-holo)" stroke="${INK}" stroke-width="3.5"/>
      <text x="73" y="31" text-anchor="middle" ${F} font-size="21" font-weight="900" fill="${INK}" letter-spacing=".3">DEV.EVENT</text>`
    ),
  'holo:code': () =>
    svg(
      78,
      78,
      `<circle cx="39" cy="39" r="36" fill="url(#stk-holo)" stroke="${INK}" stroke-width="3.5"/><text x="39" y="47" text-anchor="middle" ${M} font-size="24" font-weight="700" fill="${INK}">&lt;/&gt;</text>`
    ),
  laptop: () =>
    svg(
      108,
      76,
      `<rect x="14" y="2" width="80" height="54" rx="7" fill="#1d2430" stroke="${INK}" stroke-width="3.5"/>
      <text x="54" y="37" text-anchor="middle" ${M} font-size="22" font-weight="700" fill="#5fe1ff">&lt;/&gt;</text>
      <path d="M2 62h104l-6 12H8z" fill="#cdd5df" stroke="${INK}" stroke-width="3.5"/><path d="M44 62h20v4H44z" fill="${INK}"/>`
    ),
  prompt: () =>
    svg(
      84,
      66,
      `<rect x="2" y="2" width="80" height="62" rx="12" fill="#0d1117" stroke="${INK}" stroke-width="3.5"/>
      <path d="M18 22l13 11-13 11" stroke="#3fd97c" stroke-width="5.5"/><rect x="40" y="39" width="26" height="6" rx="2" fill="#3fd97c"><animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/></rect>`
    ),
  term: () =>
    svg(
      136,
      76,
      `<rect x="2" y="2" width="132" height="72" rx="11" fill="#0d1117" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="16" cy="15" r="4" fill="#ff5f57"/><circle cx="29" cy="15" r="4" fill="#febc2e"/><circle cx="42" cy="15" r="4" fill="#28c840"/>
      <text x="13" y="42" ${M} font-size="13.5" font-weight="700" fill="#3fd97c">$ git push</text>
      <text x="13" y="60" ${M} font-size="11" font-weight="500" fill="#8b949e">→ 행사 가는 중…</text>`
    ),
  'lg:js:hex:h': () => hex('js', 'url(#stk-holoC)', EDGE, INK),
  'lg:linux:hex:h': () => hex('linux', 'url(#stk-holoC)', EDGE, INK),
  'lg:ts:disc:h': () => disc('ts', 'url(#stk-holo)', EDGE, INK),
  'lg:git:disc:h': () => disc('git', 'url(#stk-holo)', EDGE, INK),
  // Python은 조각마다 공식 그러데이션이 정해져 있어 넘기는 색을 쓰지 않는다
  'lg:python:disc:w': () => disc('python', '#fff', EDGE, INK),
  'lg:android:disc:k': () =>
    disc(
      'android',
      INK,
      'stroke="url(#stk-holoC)" stroke-width="3.5"',
      'url(#stk-holoL)'
    ),
};

export function stickerSvg(name: StickerName): string {
  return ART[name]();
}

// stk-holoL 은 Android 로고만 칠한다. 그러데이션 좌표는 칠하는 도형의 좌표계를 따르므로
// 로고 원본의 크기(24칸 기준의 몇 배인지)만큼 키워 적는다. 그래야 무늬의 굵기가 목업과 같다.
const HL = Math.max(LOGOS.android.box[2], LOGOS.android.box[3]) / 24;

// 칼선 필터 하나, 홀로그램 그러데이션 셋, 로고가 쓰는 정의(LOGO_DEFS). <defs> 안쪽만 담는다.
export const STICKER_DEFS = `
    <linearGradient id="stk-holo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="90" spreadMethod="reflect">
      <stop offset="0" stop-color="#ffb3d9"/><stop offset=".2" stop-color="#ffe9a8"/><stop offset=".4" stop-color="#b8ffd9"/><stop offset=".6" stop-color="#a8e1ff"/><stop offset=".8" stop-color="#d4b8ff"/><stop offset="1" stop-color="#ffb3d9"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="300 180" dur="7s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="stk-holoC" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="130" spreadMethod="reflect">
      <stop offset="0" stop-color="#b8ffd9"/><stop offset=".2" stop-color="#a8e1ff"/><stop offset=".4" stop-color="#d4b8ff"/><stop offset=".6" stop-color="#ffb3d9"/><stop offset=".8" stop-color="#ffe9a8"/><stop offset="1" stop-color="#b8ffd9"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="120 260" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="stk-holoL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${num(
      26 * HL
    )}" y2="${num(16 * HL)}" spreadMethod="reflect">
      <stop offset="0" stop-color="#ff8fd0"/><stop offset=".2" stop-color="#ffe07a"/><stop offset=".4" stop-color="#8dffc4"/><stop offset=".6" stop-color="#7fd6ff"/><stop offset=".8" stop-color="#c3a0ff"/><stop offset="1" stop-color="#ff8fd0"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="${num(
        52 * HL
      )} ${num(32 * HL)}" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <filter id="stk-diecut" x="-30%" y="-45%" width="160%" height="200%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.3" result="b"/>
      <feComponentTransfer in="b" result="edge"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer>
      <feOffset in="edge" dy="2" result="so"/><feGaussianBlur in="so" stdDeviation="2" result="sb"/><feFlood flood-color="#0d1226" flood-opacity=".2"/><feComposite in2="sb" operator="in" result="shadow"/>
      <feFlood flood-color="#fff"/><feComposite in2="edge" operator="in" result="border"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${LOGO_DEFS}
  `;
