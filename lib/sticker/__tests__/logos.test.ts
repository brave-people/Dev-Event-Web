import { LogoKey, LOGO_DEFS, LOGOS } from 'lib/sticker/logos';

// [로고, 조각 순번, 길이, 앞머리] — 공식 파일에서 꺼낸 값. 도형이 바뀌면 이 표도 함께 고친다
const SHAPES: [LogoKey, number, number, string][] = [
  ['python', 0, 868, 'M 54.918785,9.'],
  ['python', 1, 743, 'm 85.637535,28'],
  ['js', 0, 938, 'M0 0H630V630H0'],
  ['ts', 0, 1546, 'M50 0H462A50 5'],
  ['git', 0, 691, 'M5,58c-2.76142'],
  ['android', 0, 1295, 'M151.025 85.22'],
];

const partOf = (key: LogoKey, index: number) => {
  const parts = LOGOS[key].parts;
  if (!parts) throw new Error(`${key}에는 조각이 없다`);
  return parts[index];
};

describe('LOGOS', () => {
  it('쓰는 로고 여섯 종만 담는다', () => {
    expect(Object.keys(LOGOS).sort()).toEqual([
      'android',
      'git',
      'js',
      'linux',
      'python',
      'ts',
    ]);
  });

  it('도형은 공식 파일에서 꺼낸 그대로다', () => {
    SHAPES.forEach(([key, index, length, head]) => {
      const d = partOf(key, index).d;
      expect(d).toHaveLength(length);
      expect(d.indexOf(head)).toBe(0);
    });
    expect(
      (Object.keys(LOGOS) as LogoKey[]).reduce(
        (sum, key) => sum + (LOGOS[key].parts || []).length,
        0
      )
    ).toBe(SHAPES.length);
  });

  it('도형에는 경로 글자만 있다', () => {
    SHAPES.forEach(([key, index]) => {
      expect(partOf(key, index).d).toMatch(
        /^[MmLlHhVvCcSsQqTtAaZz0-9 .,eE+-]+$/
      );
    });
  });

  it('그림 범위는 너비와 높이가 0보다 크다', () => {
    (Object.keys(LOGOS) as LogoKey[]).forEach((key) => {
      const box = LOGOS[key].box;
      expect(box).toHaveLength(4);
      expect(box[2]).toBeGreaterThan(0);
      expect(box[3]).toBeGreaterThan(0);
    });
  });

  it('Python은 공식 그러데이션, Git은 공식 단색판의 색 그대로다', () => {
    expect(partOf('python', 0).fill).toBe('url(#stk-py-blue)');
    expect(partOf('python', 1).fill).toBe('url(#stk-py-yellow)');
    expect(partOf('git', 0).fill).toBe('#100f0d');
    expect(partOf('git', 0).transform).toBe(
      'translate(10 10) rotate(-45 29 29)'
    );
  });

  it('JavaScript·TypeScript·Android는 색이 정해지지 않은, 글자·눈이 뚫린 한 도형이다', () => {
    (['js', 'ts', 'android'] as LogoKey[]).forEach((key) => {
      expect(LOGOS[key].parts).toHaveLength(1);
      expect(partOf(key, 0).fill).toBeUndefined();
      expect(partOf(key, 0).rule).toBe('evenodd');
    });
  });

  it('턱스는 LOGO_DEFS에 한 번 넣은 도형을 불러 쓴다', () => {
    expect(LOGOS.linux.parts).toBeUndefined();
    expect(LOGOS.linux.use).toBe('stk-tux');
    expect(LOGO_DEFS).toContain('<symbol id="stk-tux" viewBox="');
    expect(LOGO_DEFS.match(/<path /g)).toHaveLength(2);
    expect(LOGO_DEFS).toContain('fill="#ffffff"');
    expect(LOGO_DEFS).toContain('fill="#020204"');
  });
});

describe('LOGO_DEFS', () => {
  it('Python 그러데이션 둘과 턱스 도형만 정의한다', () => {
    expect(
      (LOGO_DEFS.match(/ id="[^"]+"/g) || []).map((m) => m.slice(5, -1))
    ).toEqual(['stk-py-blue', 'stk-py-yellow', 'stk-tux']);
    expect(LOGO_DEFS).toContain('stop-color="#5a9fd4"');
    expect(LOGO_DEFS).toContain('stop-color="#306998"');
    expect(LOGO_DEFS).toContain('stop-color="#ffd43b"');
    expect(LOGO_DEFS).toContain('stop-color="#ffe873"');
  });

  it('스크립트·이벤트 속성·주소가 들어 있지 않다', () => {
    expect(LOGO_DEFS).not.toMatch(/<script|\son[a-z]+=|href=|https?:/i);
  });
});
