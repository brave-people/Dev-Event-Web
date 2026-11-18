import type { StickerPlacement } from 'components/common/sticker/Sticker';

// 화면별 스티커 배치. 목업의 값을 그대로 옮긴 것이다. 순서도 목업 그대로 둔다
// (뒤에 그린 것이 위에 놓이고, 화면에 따라 순서로 스티커를 숨긴다).

// 로그인 창 머리띠 (login.js:65)
export const LOGIN_BAND: StickerPlacement[] = [
  { name: 'holo:logo', x: 22, y: 30, rotate: -7, scale: 0.86 },
  { name: 'lg:js:hex:h', x: 178, y: 12, rotate: 9, scale: 0.6 },
  { name: 'laptop', x: 96, y: 80, rotate: 8, scale: 0.6 },
  { name: 'prompt', x: 118, y: 70, rotate: -6, scale: 0.7, side: 'right' },
  {
    name: 'lg:linux:hex:h',
    x: 66,
    y: 8,
    rotate: 8,
    scale: 0.62,
    side: 'right',
  },
  {
    name: 'lg:python:disc:w',
    x: 22,
    y: 78,
    rotate: -10,
    scale: 0.52,
    side: 'right',
  },
];

// 관심 행사 머리띠 (mypage.js:67) — 모두 오른쪽에 붙는다
export const SAVED_BAND: StickerPlacement[] = [
  { name: 'holo:logo', x: 300, y: 26, rotate: -7, scale: 0.9, side: 'right' },
  { name: 'lg:js:hex:h', x: 196, y: 18, rotate: 9, scale: 0.66, side: 'right' },
  { name: 'laptop', x: 232, y: 96, rotate: 8, scale: 0.66, side: 'right' },
  { name: 'prompt', x: 96, y: 84, rotate: -6, scale: 0.78, side: 'right' },
  {
    name: 'lg:linux:hex:h',
    x: 92,
    y: 10,
    rotate: 8,
    scale: 0.66,
    side: 'right',
  },
  {
    name: 'lg:python:disc:w',
    x: 22,
    y: 62,
    rotate: -10,
    scale: 0.58,
    side: 'right',
  },
];

// 내 정보 머리띠 (mypage.js:131) — 노트북이 없다
export const ME_BAND: StickerPlacement[] = [
  { name: 'holo:logo', x: 26, y: 34, rotate: -7, scale: 0.9 },
  { name: 'lg:js:hex:h', x: 196, y: 14, rotate: 9, scale: 0.62 },
  { name: 'prompt', x: 150, y: 62, rotate: -6, scale: 0.74, side: 'right' },
  {
    name: 'lg:linux:hex:h',
    x: 84,
    y: 10,
    rotate: 8,
    scale: 0.64,
    side: 'right',
  },
  {
    name: 'lg:python:disc:w',
    x: 26,
    y: 70,
    rotate: -10,
    scale: 0.54,
    side: 'right',
  },
];

// 배너 없을 때의 홀1 묶음, PC 배치 (variants.js:205-210, 빈자리는 프롬프트)
export const BANNER_HOLO1: StickerPlacement[] = [
  { name: 'holo:logo', x: 10, y: 16, rotate: -7, scale: 1 },
  { name: 'laptop', x: 28, y: 104, rotate: 8, scale: 0.9 },
  { name: 'lg:python:disc:w', x: 156, y: 72, rotate: -10, scale: 0.94 },
  { name: 'lg:js:hex:h', x: 248, y: 2, rotate: 9, scale: 0.8 },
  { name: 'lg:android:disc:k', x: 266, y: 106, rotate: 12, scale: 0.76 },
  {
    name: 'lg:linux:hex:h',
    x: 22,
    y: 6,
    rotate: 8,
    scale: 0.98,
    side: 'right',
  },
  { name: 'term', x: 24, y: 108, rotate: -5, scale: 0.9, side: 'right' },
  { name: 'lg:ts:disc:h', x: 170, y: 82, rotate: 9, scale: 0.9, side: 'right' },
  { name: 'prompt', x: 174, y: 8, rotate: -9, scale: 0.92, side: 'right' },
  { name: 'holo:code', x: 262, y: 20, rotate: -8, scale: 0.78, side: 'right' },
  {
    name: 'lg:git:disc:h',
    x: 268,
    y: 108,
    rotate: 5,
    scale: 0.72,
    side: 'right',
  },
];
