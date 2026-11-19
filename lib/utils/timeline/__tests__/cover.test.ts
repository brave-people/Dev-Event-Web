import {
  autoCover,
  coverCaption,
  hasCoverLink,
  isUsableCover,
} from 'lib/utils/timeline/cover';

const tags = (...names: string[]) => names.map((tag_name) => ({ tag_name }));

describe('isUsableCover', () => {
  it('서비스의 S3 주소만 쓴다', () => {
    expect(
      isUsableCover(
        'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/a.jpg'
      )
    ).toBe(true);
    expect(isUsableCover('https://example.com/a.png')).toBe(false);
    expect(isUsableCover('')).toBe(false);
    expect(isUsableCover(null)).toBe(false);
    expect(isUsableCover(undefined)).toBe(false);
  });
});

describe('autoCover', () => {
  it('유형 태그로 색을 고른다', () => {
    expect(autoCover(tags('오프라인', '유료', '모임', '블록체인'))).toEqual({
      index: 1,
      kind: '모임',
      mode: ['오프라인'],
    });
    expect(autoCover(tags('세미나')).index).toBe(0);
    expect(autoCover(tags('대회')).index).toBe(2);
    expect(autoCover(tags('교육')).index).toBe(3);
    expect(autoCover(tags('커뮤니티')).index).toBe(4);
  });

  it('유형 태그가 없으면 "행사", 첫 번째 색', () => {
    expect(autoCover(tags('온라인', '오프라인', '무료', 'AI'))).toEqual({
      index: 0,
      kind: '행사',
      mode: ['온라인', '오프라인'],
    });
  });

  it('표지 맨 윗줄 문구', () => {
    expect(coverCaption({ index: 0, kind: '세미나', mode: ['오프라인'] })).toBe(
      '세미나 · 오프라인'
    );
    expect(
      coverCaption({ index: 0, kind: '행사', mode: ['온라인', '오프라인'] })
    ).toBe('행사 · 온라인·오프라인');
    expect(coverCaption({ index: 2, kind: '대회', mode: [] })).toBe('대회');
  });
});

describe('hasCoverLink', () => {
  it('호스트를 가리지 않고 주소가 있는지만 본다 (상세의 포스터)', () => {
    expect(hasCoverLink('https://example.com/a.png')).toBe(true);
    expect(
      hasCoverLink(
        'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEV_EVENT/a.jpg'
      )
    ).toBe(true);
    expect(hasCoverLink('   ')).toBe(false);
    expect(hasCoverLink('')).toBe(false);
    expect(hasCoverLink(null)).toBe(false);
    expect(hasCoverLink(undefined)).toBe(false);
  });
});
