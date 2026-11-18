import type { StickerPlacement } from 'components/common/sticker/Sticker';
import { BANNER_HOLO1 } from 'components/common/sticker/stickerSets';
import {
  HOLO1_MOBILE,
  HOLO1_WIDE_ONLY,
  buildHoloGroups,
  toTablet,
} from 'components/common/banner/holoLayout';

const HOLO1: StickerPlacement[] = [
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

const find = (list: StickerPlacement[], name: string) =>
  list.find((p) => p.name === name);

describe('buildHoloGroups', () => {
  it('폭마다 묶음의 장수가 맞다', () => {
    const g = buildHoloGroups(HOLO1);
    expect(g.pc).toHaveLength(8);
    expect(g.wide.map((p) => p.name)).toEqual([
      'lg:android:disc:k',
      'holo:code',
      'lg:git:disc:h',
    ]);
    expect(g.tablet).toHaveLength(4);
    expect(g.mobile).toHaveLength(4);
  });

  it('pc와 wide는 넘긴 값 그대로이고 프롬프트는 pc에만 있다', () => {
    const g = buildHoloGroups(HOLO1);
    [...g.pc, ...g.wide].forEach((p) => {
      expect(p).toEqual(HOLO1.find((o) => o.name === p.name));
    });
    expect(find(g.pc, 'prompt')).toBeDefined();
    expect(find(g.mobile, 'prompt')).toBeUndefined();
    expect(find(g.tablet, 'prompt')).toBeUndefined();
  });

  it('mobile 값', () => {
    const g = buildHoloGroups(HOLO1);
    expect(find(g.mobile, 'holo:logo')).toMatchObject({
      side: 'left',
      x: -44,
      y: -8,
      scale: 0.56,
      rotate: -7,
    });
    expect(find(g.mobile, 'laptop')).toMatchObject({
      x: -22,
      y: 100,
      scale: 0.52,
      rotate: 8,
    });
    expect(find(g.mobile, 'lg:linux:hex:h')).toMatchObject({
      side: 'right',
      x: -18,
      y: -22,
      scale: 0.56,
      rotate: 8,
    });
    expect(find(g.mobile, 'term')).toMatchObject({
      side: 'right',
      x: -46,
      y: 104,
      scale: 0.52,
      rotate: -5,
    });
  });

  it('tablet 값', () => {
    const g = buildHoloGroups(HOLO1);
    expect(find(g.tablet, 'holo:logo')).toMatchObject({
      x: -36,
      y: -10.24,
      scale: 0.75,
    });
    expect(find(g.tablet, 'laptop')).toMatchObject({
      x: -14,
      y: 128,
      scale: 0.7,
    });
    expect(find(g.tablet, 'lg:linux:hex:h')).toMatchObject({
      x: -10,
      y: -28.16,
      scale: 0.75,
    });
    expect(find(g.tablet, 'term')).toMatchObject({
      x: -38,
      y: 133.12,
      scale: 0.7,
    });
    g.tablet.forEach((p) => {
      const m = find(g.mobile, p.name);
      expect(p.rotate).toBe(m?.rotate);
      expect(p.side).toBe(m?.side);
    });
  });

  it('넘긴 배열과 항목을 바꾸지 않는다', () => {
    const copy = JSON.parse(JSON.stringify(HOLO1));
    buildHoloGroups(HOLO1);
    expect(HOLO1).toEqual(copy);
  });

  it('holo:logo가 없으면 세 장이다', () => {
    const g = buildHoloGroups(HOLO1.filter((p) => p.name !== 'holo:logo'));
    expect(g.mobile).toHaveLength(3);
    expect(g.tablet).toHaveLength(3);
  });

  it('실제 BANNER_HOLO1과 이름이 맞는다', () => {
    const g = buildHoloGroups(BANNER_HOLO1);
    expect(g.mobile).toHaveLength(4);
    expect(g.wide).toHaveLength(3);
  });

  it('상수', () => {
    expect(HOLO1_WIDE_ONLY).toHaveLength(3);
    expect(HOLO1_MOBILE).toHaveLength(4);
  });
});

describe('toTablet', () => {
  it('가로 +8, 세로 x1.28, 크기 x1.34', () => {
    expect(
      toTablet({ name: 'laptop', x: -22, y: 100, rotate: 8, scale: 0.52 })
    ).toEqual({ name: 'laptop', x: -14, y: 128, rotate: 8, scale: 0.7 });
  });
});
