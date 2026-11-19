import {
  STICKER_DEFS,
  STICKER_NAMES,
  StickerName,
  stickerSvg,
} from 'lib/sticker/art';
import { LogoKey, LOGOS } from 'lib/sticker/logos';

// [폭, 높이, 가리키는 그러데이션] — 크기는 목업 stickers.js와 같다
const SPEC: Record<StickerName, [number, number, string[]]> = {
  'holo:logo': [146, 46, ['stk-holo']],
  'holo:code': [78, 78, ['stk-holo']],
  laptop: [108, 76, []],
  prompt: [84, 66, []],
  term: [136, 76, []],
  'lg:js:hex:h': [80, 92, ['stk-holoC']],
  'lg:linux:hex:h': [80, 92, ['stk-holoC', 'stk-tux']],
  'lg:ts:disc:h': [84, 84, ['stk-holo']],
  'lg:git:disc:h': [84, 84, ['stk-holo']],
  'lg:python:disc:w': [84, 84, ['stk-py-blue', 'stk-py-yellow']],
  'lg:android:disc:k': [84, 84, ['stk-holoC', 'stk-holoL']],
};
const NAMES = Object.keys(SPEC) as StickerName[];
// [이름, 로고, 판]
const LOGO_STICKERS: [StickerName, LogoKey, 'hex' | 'disc'][] = [
  ['lg:js:hex:h', 'js', 'hex'],
  ['lg:linux:hex:h', 'linux', 'hex'],
  ['lg:ts:disc:h', 'ts', 'disc'],
  ['lg:git:disc:h', 'git', 'disc'],
  ['lg:python:disc:w', 'python', 'disc'],
  ['lg:android:disc:k', 'android', 'disc'],
];

const uniq = (list: string[]): string[] =>
  list.filter((v, i) => list.indexOf(v) === i).sort();
const refs = (s: string): string[] =>
  uniq(
    (s.match(/url\(#[^)]+\)/g) || [])
      .map((m) => m.slice(5, -1))
      .concat((s.match(/ href="#[^"]+"/g) || []).map((m) => m.slice(8, -1)))
  );
const ids = (s: string): string[] =>
  uniq((s.match(/ id="[^"]+"/g) || []).map((m) => m.slice(5, -1)));

describe('stickerSvg', () => {
  it('옮긴 그림은 열한 가지다', () => {
    expect(STICKER_NAMES.slice().sort()).toEqual(NAMES.slice().sort());
  });

  it('이름마다 <svg로 시작하는 문자열을 돌려준다 (크기는 목업과 같다)', () => {
    NAMES.forEach((name) => {
      const [w, h] = SPEC[name];
      const svg = stickerSvg(name);
      expect(
        svg.indexOf(`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"`)
      ).toBe(0);
      expect(svg.slice(-6)).toBe('</svg>');
      expect(svg).not.toMatch(/undefined|NaN|\$\{/);
    });
  });

  it('인자 하나의 순수 함수다 (날짜가 바뀌어도 같은 문자열)', () => {
    const before = NAMES.map((name) => stickerSvg(name));
    jest.useFakeTimers().setSystemTime(new Date('2031-01-01T00:00:00Z'));
    const after = NAMES.map((name) => stickerSvg(name));
    jest.useRealTimers();
    expect(after).toEqual(before);
    expect(stickerSvg.length).toBe(1);
  });

  it('가리키는 홀로그램 색은 이름마다 정해져 있다', () => {
    NAMES.forEach((name) => {
      expect(refs(stickerSvg(name))).toEqual(SPEC[name][2]);
    });
  });

  it('홀로그램 판은 흰 글자를 먹색으로 바꾼다', () => {
    (['holo:logo', 'holo:code'] as StickerName[]).forEach((name) => {
      const svg = stickerSvg(name);
      expect(svg).toContain('fill="url(#stk-holo)" stroke="#15171c"');
      expect(svg).not.toContain('fill="#fff"');
      expect(svg).toMatch(/<text[^>]*fill="#15171c"/);
    });
  });

  it('글꼴은 지금 서비스에 있는 것만 쓴다', () => {
    NAMES.forEach((name) => {
      expect(stickerSvg(name)).not.toMatch(/JetBrains|Gaegu/);
    });
    expect(stickerSvg('holo:logo')).toContain("'Pretendard Variable'");
    (['laptop', 'term', 'holo:code'] as StickerName[]).forEach((name) => {
      expect(stickerSvg(name)).toContain('font-family="ui-monospace,');
    });
  });

  it('</> 글자는 이스케이프된 채로 둔다', () => {
    (['laptop', 'holo:code'] as StickerName[]).forEach((name) => {
      expect(stickerSvg(name)).toContain('>&lt;/&gt;</text>');
    });
  });

  it('움직이는 것은 프롬프트의 커서뿐이다', () => {
    expect(NAMES.filter((name) => /<animate/.test(stickerSvg(name)))).toEqual([
      'prompt',
    ]);
  });

  it('로고 스티커는 logos.ts의 도형을 그대로 넣는다', () => {
    LOGO_STICKERS.forEach(([name, key, shape]) => {
      const svg = stickerSvg(name);
      const logo = LOGOS[key];
      if (logo.use) expect(svg).toContain(`<use href="#${logo.use}"`);
      (logo.parts || []).forEach((part) => {
        expect(svg).toContain(` d="${part.d}"`);
      });
      expect(svg).toContain(
        shape === 'hex'
          ? 'points="40,2 78,24 78,68 40,90 2,68 2,24"'
          : '<circle cx="42" cy="42" r="39.5"'
      );
      expect(svg).toContain(
        shape === 'hex'
          ? 'translate(17.2 23.2) scale(1.9)'
          : 'translate(18 18) scale(2)'
      );
    });
  });

  it('홀로그램 판의 로고는 한 가지 색으로 찍는다 (색이 정해진 공식 단색판은 그 색 그대로)', () => {
    LOGO_STICKERS.filter(([name]) => /:h$/.test(name)).forEach(
      ([name, key]) => {
        (LOGOS[key].parts || []).forEach((part) => {
          expect(stickerSvg(name)).toContain(
            `d="${part.d}" fill="${part.fill || '#15171c'}"`
          );
        });
      }
    );
    expect(stickerSvg('lg:git:disc:h')).toContain('fill="#100f0d"');
    expect(stickerSvg('lg:js:hex:h')).toContain(
      'fill="#15171c" fill-rule="evenodd"'
    );
  });

  it('Python은 흰 판에 공식 색 그대로다', () => {
    const svg = stickerSvg('lg:python:disc:w');
    expect(svg).toContain('r="39.5" fill="#fff" stroke="#15171c"');
    const parts = LOGOS.python.parts || [];
    expect(parts).toHaveLength(2);
    expect(svg).toContain(`d="${parts[0].d}" fill="url(#stk-py-blue)"`);
    expect(svg).toContain(`d="${parts[1].d}" fill="url(#stk-py-yellow)"`);
  });

  it('먹색 판(Android)은 테두리와 로고만 홀로그램이다', () => {
    const svg = stickerSvg('lg:android:disc:k');
    expect(svg).toContain('fill="#15171c" stroke="url(#stk-holoC)"');
    expect(svg).toContain(
      `d="${
        (LOGOS.android.parts || [])[0].d
      }" fill="url(#stk-holoL)" fill-rule="evenodd"`
    );
  });

  it('스크립트·이벤트 속성·주소가 들어 있지 않다', () => {
    NAMES.map((name) => stickerSvg(name))
      .concat(STICKER_DEFS)
      .forEach((s) => {
        // 문서 안의 정의를 가리키는 href="#stk-…" 만 허용한다
        expect(s.replace(/ href="#stk-[A-Za-z-]+"/g, '')).not.toMatch(
          /<script|\son[a-z]+=|href=|https?:/i
        );
      });
  });
});

describe('STICKER_DEFS', () => {
  it('<defs> 안쪽만 담는다', () => {
    expect(STICKER_DEFS).not.toMatch(/<\/?(svg|defs)\b/);
  });

  it('홀로그램 그러데이션 셋, 칼선 필터 하나, 로고가 쓰는 정의가 들어 있다', () => {
    expect(ids(STICKER_DEFS)).toEqual([
      'stk-diecut',
      'stk-holo',
      'stk-holoC',
      'stk-holoL',
      'stk-py-blue',
      'stk-py-yellow',
      'stk-tux',
    ]);
    expect(STICKER_DEFS.match(/<linearGradient /g)).toHaveLength(5);
    expect(STICKER_DEFS.match(/<filter /g)).toHaveLength(1);
    expect(STICKER_DEFS.match(/<animateTransform /g)).toHaveLength(3);
  });

  it('스티커가 가리키는 id는 모두 정의되어 있고, 쓰지 않는 그러데이션은 없다', () => {
    const used = uniq(
      NAMES.reduce(
        (all, name) => all.concat(refs(stickerSvg(name))),
        [] as string[]
      )
    );
    expect(used).toEqual([
      'stk-holo',
      'stk-holoC',
      'stk-holoL',
      'stk-py-blue',
      'stk-py-yellow',
      'stk-tux',
    ]);
    used.forEach((id) => expect(ids(STICKER_DEFS)).toContain(id));
  });

  it('색과 그림자는 목업 값 그대로다', () => {
    expect(STICKER_DEFS).toContain('stop-color="#ffb3d9"');
    expect(STICKER_DEFS).toContain('stop-color="#ff8fd0"');
    expect(STICKER_DEFS).toContain('flood-color="#0d1226"');
  });
});
