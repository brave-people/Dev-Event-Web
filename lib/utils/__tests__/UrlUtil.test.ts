import {
  initUrl,
  parseUrl,
  reflactUrlContext,
  safeDecode,
} from 'lib/utils/UrlUtil';

describe('safeDecode', () => {
  it('인코딩된 문자열을 푼다', () => {
    expect(safeDecode('%EA%B5%AC%EB%A1%9C')).toBe('구로');
  });

  it('잘못된 % 인코딩이면 받은 문자열을 그대로 돌려준다', () => {
    expect(safeDecode('50%')).toBe('50%');
  });
});

describe('reflactUrlContext', () => {
  it.each(['typescript', 'backstage', 'geolocation', 'westcoast'])(
    '검색어에 필터 키 이름이 들어 있어도 kwd로 읽는다 (%s)',
    (kwd) => {
      expect(reflactUrlContext(`/search?kwd=${kwd}`)).toEqual({
        tagList: [],
        type: undefined,
        location: undefined,
        coast: undefined,
        kwd,
      });
    }
  );

  it('필터와 검색어를 각자의 키로 읽는다', () => {
    expect(
      reflactUrlContext(
        '/search?tag=AI&tag=%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C&type=%EC%9B%A8%EB%B9%84%EB%82%98&kwd=aws'
      )
    ).toEqual({
      tagList: ['AI', '%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C'],
      type: '%EC%9B%A8%EB%B9%84%EB%82%98',
      location: undefined,
      coast: undefined,
      kwd: 'aws',
    });
  });
});

describe('parseUrl — 검색어(kwd)', () => {
  it.each([
    ['Kiro & AWS', '/search?kwd=Kiro%20%26%20AWS'],
    ['#gudi', '/search?kwd=%23gudi'],
    ['50%', '/search?kwd=50%25'],
    ['C++', '/search?kwd=C%2B%2B'],
  ])('검색어 "%s"를 인코딩해서 주소에 넣는다', (kwd, expected) => {
    expect(parseUrl('/events', 'kwd', kwd, undefined)).toBe(expected);
  });

  it('이미 있는 검색어를 새 검색어로 바꾼다', () => {
    expect(parseUrl('/search?tag=AI&kwd=old', 'kwd', 'new', ['AI'])).toBe(
      '/search?tag=AI&kwd=new'
    );
  });

  it('필터만 있던 주소에 검색어를 덧붙인다', () => {
    expect(parseUrl('/search?tag=AI', 'kwd', 'aws', ['AI'])).toBe(
      '/search?tag=AI&kwd=aws'
    );
  });
});

describe('다른 필터를 바꿀 때 검색어 유지', () => {
  it('행사 유형을 고르면 typescript 검색어 뒤에 붙인다', () => {
    expect(
      parseUrl('/search?kwd=typescript', 'type', '웨비나', undefined)
    ).toBe('/search?kwd=typescript&type=웨비나');
  });

  it('행사 유형을 바꾸면 기존 유형만 교체한다', () => {
    expect(
      parseUrl(
        '/search?type=%EC%9B%A8%EB%B9%84%EB%82%98&kwd=aws',
        'type',
        '컨퍼런스',
        undefined
      )
    ).toBe('/search?type=컨퍼런스&kwd=aws');
  });

  it('직군 태그를 해제해도 backstage 검색어는 남긴다', () => {
    expect(parseUrl('/search?tag=AI&kwd=backstage', 'tag', 'AI', ['AI'])).toBe(
      '/search?kwd=backstage'
    );
  });

  it('행사 유형을 전체로 되돌려도 typescript 검색어는 남긴다', () => {
    expect(
      initUrl(
        '/search?type=%EC%9B%A8%EB%B9%84%EB%82%98&kwd=typescript',
        'type',
        undefined,
        '웨비나',
        undefined,
        undefined
      )
    ).toBe('/search?kwd=typescript');
  });

  it('검색어를 지우면 kwd만 빠진다', () => {
    expect(
      initUrl(
        '/search?tag=AI&kwd=aws',
        'kwd',
        ['AI'],
        undefined,
        undefined,
        undefined
      )
    ).toBe('/search?tag=AI');
  });
});
