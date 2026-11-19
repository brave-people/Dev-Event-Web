import {
  BANNER_HOLO1,
  LOGIN_BAND,
  ME_BAND,
  SAVED_BAND,
} from 'components/common/sticker/stickerSets';
import { STICKER_NAMES } from 'lib/sticker/art';

type Placed = {
  name: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  side?: string;
};
type Row = [string, string, number, number, number, number];

const rows = (set: Placed[]): Row[] =>
  set.map((p): Row => [p.name, p.side || 'left', p.x, p.y, p.rotate, p.scale]);
const ALL: Placed[][] = [LOGIN_BAND, SAVED_BAND, ME_BAND, BANNER_HOLO1];

describe('스티커 배치 묶음', () => {
  it('묶음마다 장수', () => {
    expect(ALL.map((set) => set.length)).toEqual([6, 6, 5, 11]);
  });

  it('이름은 모두 stickerSvg가 그릴 수 있는 것이고, 한 묶음 안에서 겹치지 않는다', () => {
    ALL.forEach((set) => {
      const names = set.map((p) => p.name);
      names.forEach((name, i) => {
        expect(STICKER_NAMES).toContain(name);
        expect(names.indexOf(name)).toBe(i);
      });
    });
  });

  it('옮긴 그림 가운데 어느 묶음도 쓰지 않는 것은 없다', () => {
    const used = ALL.reduce((all, set) => all.concat(set), [] as Placed[]).map(
      (p) => p.name
    );
    STICKER_NAMES.forEach((name) => expect(used).toContain(name));
  });

  it('로그인 창 머리띠 (login.js:65)', () => {
    expect(rows(LOGIN_BAND)).toEqual([
      ['holo:logo', 'left', 22, 30, -7, 0.86],
      ['lg:js:hex:h', 'left', 178, 12, 9, 0.6],
      ['laptop', 'left', 96, 80, 8, 0.6],
      ['prompt', 'right', 118, 70, -6, 0.7],
      ['lg:linux:hex:h', 'right', 66, 8, 8, 0.62],
      ['lg:python:disc:w', 'right', 22, 78, -10, 0.52],
    ]);
  });

  it('관심 행사 머리띠 (mypage.js:67) — 모두 오른쪽에 붙는다', () => {
    expect(rows(SAVED_BAND)).toEqual([
      ['holo:logo', 'right', 300, 26, -7, 0.9],
      ['lg:js:hex:h', 'right', 196, 18, 9, 0.66],
      ['laptop', 'right', 232, 96, 8, 0.66],
      ['prompt', 'right', 96, 84, -6, 0.78],
      ['lg:linux:hex:h', 'right', 92, 10, 8, 0.66],
      ['lg:python:disc:w', 'right', 22, 62, -10, 0.58],
    ]);
  });

  it('내 정보 머리띠 (mypage.js:131) — 노트북이 없다', () => {
    expect(rows(ME_BAND)).toEqual([
      ['holo:logo', 'left', 26, 34, -7, 0.9],
      ['lg:js:hex:h', 'left', 196, 14, 9, 0.62],
      ['prompt', 'right', 150, 62, -6, 0.74],
      ['lg:linux:hex:h', 'right', 84, 10, 8, 0.64],
      ['lg:python:disc:w', 'right', 26, 70, -10, 0.54],
    ]);
  });

  it('배너 홀1의 PC 배치 (variants.js:205-210, 빈자리는 프롬프트)', () => {
    expect(rows(BANNER_HOLO1)).toEqual([
      ['holo:logo', 'left', 10, 16, -7, 1],
      ['laptop', 'left', 28, 104, 8, 0.9],
      ['lg:python:disc:w', 'left', 156, 72, -10, 0.94],
      ['lg:js:hex:h', 'left', 248, 2, 9, 0.8],
      ['lg:android:disc:k', 'left', 266, 106, 12, 0.76],
      ['lg:linux:hex:h', 'right', 22, 6, 8, 0.98],
      ['term', 'right', 24, 108, -5, 0.9],
      ['lg:ts:disc:h', 'right', 170, 82, 9, 0.9],
      ['prompt', 'right', 174, 8, -9, 0.92],
      ['holo:code', 'right', 262, 20, -8, 0.78],
      ['lg:git:disc:h', 'right', 268, 108, 5, 0.72],
    ]);
  });
});
