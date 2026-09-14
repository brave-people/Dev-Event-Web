import {
  SITE_URL,
  absoluteUrl,
  eventDetailUrl,
  DEFAULT_EVENT_THUMBNAIL_PATH,
} from 'lib/seo/site';

describe('site', () => {
  it('SITE_URL은 끝 슬래시가 없다', () => {
    expect(SITE_URL.endsWith('/')).toBe(false);
    expect(SITE_URL.startsWith('https://')).toBe(true);
  });

  it('absoluteUrl은 상대 경로를 SITE_URL 기준 절대 URL로 만든다', () => {
    expect(absoluteUrl('/default/og_image.png')).toBe(
      `${SITE_URL}/default/og_image.png`
    );
    expect(absoluteUrl('default/og_image.png')).toBe(
      `${SITE_URL}/default/og_image.png`
    );
  });

  it('absoluteUrl은 이미 절대 URL이면 그대로 반환한다', () => {
    const s3 = 'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/a.png';
    expect(absoluteUrl(s3)).toBe(s3);
    expect(absoluteUrl('http://example.com/x.png')).toBe(
      'http://example.com/x.png'
    );
  });

  it('absoluteUrl은 빈 값이면 기본 썸네일을 반환한다', () => {
    expect(absoluteUrl('')).toBe(`${SITE_URL}${DEFAULT_EVENT_THUMBNAIL_PATH}`);
  });

  it('eventDetailUrl은 상세 페이지 절대 URL을 만든다', () => {
    expect(eventDetailUrl(3212)).toBe(`${SITE_URL}/event/detail/3212`);
    expect(eventDetailUrl('3212')).toBe(`${SITE_URL}/event/detail/3212`);
  });
});
