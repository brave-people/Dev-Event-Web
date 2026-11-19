import { bannerTone, contrastRatio, normalizeHex } from 'lib/utils/banner/tone';

describe('normalizeHex', () => {
  it('소문자 여섯 자리로 바꾼다', () => {
    expect(normalizeHex('#0D1330')).toBe('#0d1330');
    expect(normalizeHex('#fff')).toBe('#ffffff');
    expect(normalizeHex(' #AbC ')).toBe('#aabbcc');
  });

  it.each([
    '0d1330',
    'blue',
    '',
    '   ',
    '#12',
    '#1234',
    '#12345',
    '#1234567',
    '#ffffffff',
    '#ggg',
    'rgb(0,0,0)',
    '#fff;color:red',
    null,
    undefined,
    123,
    {},
  ])('색 형식이 아니면 null: %p', (value) => {
    expect(normalizeHex(value)).toBeNull();
  });
});

describe('contrastRatio', () => {
  it('검정과 흰색은 21', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
  });
});

describe('bannerTone', () => {
  it.each(['#0d1330', '#c8321b', '#000', '#0043ff'])(
    '%s 는 밝은 글자',
    (bg) => {
      const tone = bannerTone(bg);
      expect(tone.fg).toBe('#ffffff');
      expect(tone.ink).toBe('light');
    }
  );

  it('#0d1330 의 전체 값', () => {
    expect(bannerTone('#0d1330')).toEqual({
      bg: '#0d1330',
      fg: '#ffffff',
      ink: 'light',
    });
  });

  it.each(['#f1ede4', '#ffe55c', '#fff'])('%s 는 어두운 글자', (bg) => {
    const tone = bannerTone(bg);
    expect(tone.fg).toBe('#101216');
    expect(tone.ink).toBe('dark');
  });

  it('#fff 의 bg 는 여섯 자리', () => {
    expect(bannerTone('#fff').bg).toBe('#ffffff');
  });

  it.each(['blue', '0d1330', '', null, undefined])(
    '색 형식이 아니면 기본 남색: %p',
    (value) => {
      expect(bannerTone(value)).toEqual({
        bg: '#000040',
        fg: '#ffffff',
        ink: 'light',
      });
    }
  );

  it('경계', () => {
    expect(bannerTone('#797979').ink).toBe('light');
    expect(bannerTone('#7a7a7a').ink).toBe('dark');
  });

  it('회색 256단계 모두 대비 4.3 이상이고 큰 쪽을 고른다', () => {
    for (let i = 0; i < 256; i += 1) {
      const h = i.toString(16).padStart(2, '0');
      const bg = `#${h}${h}${h}`;
      const tone = bannerTone(bg);
      const other = tone.fg === '#101216' ? '#ffffff' : '#101216';
      const chosen = contrastRatio(bg, tone.fg);
      expect(chosen).toBeGreaterThanOrEqual(4.3);
      expect(chosen).toBeGreaterThanOrEqual(contrastRatio(bg, other));
    }
  });

  it.each(['#e5484d', '#f08c00', '#12a47f', '#0043ff'])(
    '%s 에서 대비 4.5 이상',
    (bg) => {
      const tone = bannerTone(bg);
      expect(contrastRatio(tone.bg, tone.fg)).toBeGreaterThanOrEqual(4.5);
    }
  );
});
