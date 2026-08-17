import {
  DEFAULT_EVENT_THUMBNAIL,
  eventThumbnail,
} from 'lib/utils/eventThumbnail';

const S3 =
  'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/event/cover.png';

describe('eventThumbnail', () => {
  it('허용된 S3 링크는 그대로 쓴다', () => {
    expect(eventThumbnail(S3)).toBe(S3);
  });

  it('빈 문자열이면 기본 썸네일로 떨어진다', () => {
    // 서버는 커버 이미지가 없을 때 null 이 아니라 빈 문자열을 내려준다
    expect(eventThumbnail('')).toBe(DEFAULT_EVENT_THUMBNAIL);
  });

  it('null / undefined 도 기본 썸네일로 떨어진다', () => {
    expect(eventThumbnail(null)).toBe(DEFAULT_EVENT_THUMBNAIL);
    expect(eventThumbnail(undefined)).toBe(DEFAULT_EVENT_THUMBNAIL);
  });

  it('화이트리스트에 없는 호스트는 기본 썸네일로 떨어진다', () => {
    // next/image 는 images.domains 밖의 호스트를 받으면 런타임 에러를 낸다
    expect(eventThumbnail('https://example.com/cover.png')).toBe(
      DEFAULT_EVENT_THUMBNAIL
    );
  });
});
