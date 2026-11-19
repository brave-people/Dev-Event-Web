import {
  TOP_BANNER_PATH,
  bannerLink,
  stepBanner,
  usableBanners,
} from 'lib/utils/banner/topBanner';

const SITE = 'https://dev-event.vercel.app';

describe('TOP_BANNER_PATH', () => {
  it('경로', () => {
    expect(TOP_BANNER_PATH).toBe('/banner/top');
  });
});

describe('usableBanners', () => {
  it('배열이 아니면 빈 배열', () => {
    expect(usableBanners(null)).toEqual([]);
    expect(usableBanners(undefined)).toEqual([]);
    expect(usableBanners('x')).toEqual([]);
    expect(usableBanners({ message: 'x' })).toEqual([]);
    expect(usableBanners([])).toEqual([]);
  });

  it('제목이 없는 항목은 빠지고 순서는 그대로', () => {
    const input = [
      { id: 1, title: 'a' },
      { id: 2 },
      { id: 3, title: '   ' },
      null,
      'str',
      { id: 4, title: 'b' },
    ];
    expect(usableBanners(input).map((b) => b.id)).toEqual([1, 4]);
  });

  it('이미지·링크·배경색이 비어도 남긴다', () => {
    const item = {
      id: 1,
      title: 't',
      banner_image: '',
      event_link: null,
      background_color: 'blue',
    };
    expect(usableBanners([item])).toHaveLength(1);
  });

  it('다른 배열을 돌려주고 원본을 바꾸지 않는다', () => {
    const input = [{ id: 1, title: 'a' }, { id: 2 }];
    const out = usableBanners(input);
    expect(out).not.toBe(input);
    expect(input).toHaveLength(2);
  });
});

describe('bannerLink', () => {
  it('안쪽 경로', () => {
    expect(bannerLink('/event/detail/3489')).toEqual({
      href: '/event/detail/3489',
      external: false,
    });
  });

  it('우리 사이트 주소는 안쪽 링크', () => {
    expect(bannerLink(`${SITE}/event/detail/3489?x=1#a`, SITE)).toEqual({
      href: '/event/detail/3489?x=1#a',
      external: false,
    });
    expect(bannerLink(SITE, SITE)).toEqual({ href: '/', external: false });
  });

  it('앞부분만 같은 주소에 속지 않는다', () => {
    expect(bannerLink(`${SITE}.evil.com/x`, SITE)).toEqual({
      href: `${SITE}.evil.com/x`,
      external: true,
    });
  });

  it('바깥 주소', () => {
    expect(bannerLink('https://example.com/a')).toEqual({
      href: 'https://example.com/a',
      external: true,
    });
    expect(bannerLink('HTTP://example.com')).toEqual({
      href: 'HTTP://example.com',
      external: true,
    });
    expect(bannerLink('  https://example.com/a  ')).toEqual({
      href: 'https://example.com/a',
      external: true,
    });
  });

  it.each([
    '',
    '  ',
    null,
    undefined,
    3,
    'javascript:alert(1)',
    ' JavaScript:alert(1)',
    'data:text/html,x',
    '//evil.com',
    '/\\evil.com',
    'www.example.com',
    'mailto:a@b.c',
  ])('null: %p', (value) => {
    expect(bannerLink(value)).toBeNull();
  });
});

describe('bannerLink 우회', () => {
  it.each([
    `${SITE}//evil.com`,
    `${SITE}/\\evil.com`,
    '/\t/evil.com',
    '/\n/evil.com',
    'https://dev-event.vercel.app/\t/evil.com',
  ])('null: %p', (value) => {
    expect(bannerLink(value, SITE)).toBeNull();
  });
});

describe('stepBanner', () => {
  it('넘기기', () => {
    expect(stepBanner(0, 1, 3)).toBe(1);
    expect(stepBanner(2, 1, 3)).toBe(0);
    expect(stepBanner(0, -1, 3)).toBe(2);
    expect(stepBanner(5, 0, 3)).toBe(2);
    expect(stepBanner(5, 1, 3)).toBe(0);
    expect(stepBanner(0, 1, 1)).toBe(0);
    expect(stepBanner(3, 0, 0)).toBe(0);
  });
});
