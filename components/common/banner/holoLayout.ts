import type { StickerPlacement } from 'components/common/sticker/Sticker';
import type { StickerName } from 'lib/sticker/art';

// 1180px 이하에서 숨기는 세 장 (variants.js:205-210)
export const HOLO1_WIDE_ONLY: readonly StickerName[] = [
  'lg:android:disc:k',
  'holo:code',
  'lg:git:disc:h',
];

// 860px 이하에서 남는 네 장의 자리 (variants.css:569-581). 기울기와 쪽은 PC 배치에서 가져온다.
export const HOLO1_MOBILE: readonly {
  name: StickerName;
  x: number;
  y: number;
  scale: number;
}[] = [
  { name: 'holo:logo', x: -44, y: -8, scale: 0.56 },
  { name: 'laptop', x: -22, y: 100, scale: 0.52 },
  { name: 'lg:linux:hex:h', x: -18, y: -22, scale: 0.56 },
  { name: 'term', x: -46, y: 104, scale: 0.52 },
];

export interface HoloGroups {
  pc: StickerPlacement[];
  wide: StickerPlacement[];
  tablet: StickerPlacement[];
  mobile: StickerPlacement[];
}

const round2 = (value: number) => Math.round(value * 100) / 100;

// 621~860px: 620px 이하의 값에서 가로 +8, 세로 ×1.28, 크기 ×1.34 (variants.css:649)
export const toTablet = (placement: StickerPlacement): StickerPlacement => ({
  ...placement,
  x: placement.x + 8,
  y: round2(placement.y * 1.28),
  scale: round2(placement.scale * 1.34),
});

export const buildHoloGroups = (placements: StickerPlacement[]): HoloGroups => {
  const isWide = (p: StickerPlacement) =>
    HOLO1_WIDE_ONLY.indexOf(p.name) !== -1;
  const mobile: StickerPlacement[] = [];
  HOLO1_MOBILE.forEach((spot) => {
    const base = placements.find((p) => p.name === spot.name);
    if (!base) return;
    mobile.push({
      name: spot.name,
      x: spot.x,
      y: spot.y,
      rotate: base.rotate,
      scale: spot.scale,
      side: base.side ?? 'left',
    });
  });
  return {
    pc: placements.filter((p) => !isWide(p)).map((p) => ({ ...p })),
    wide: placements.filter(isWide).map((p) => ({ ...p })),
    tablet: mobile.map(toTablet),
    mobile,
  };
};
