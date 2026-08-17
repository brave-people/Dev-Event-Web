/**
 * 행사 썸네일 경로를 고르는 단일 규칙.
 *
 * 목록(`/events`)과 주최자 상세(`/hosts/[hostId]`)가 같은 행사를 다르게 그리면
 * 같은 행사인지 알아보기 어렵다. 그래서 판정을 여기 한 곳에만 둔다.
 *
 * `next/image` 는 `next.config.js > images.domains` 화이트리스트에 없는 호스트를 받으면
 * 런타임 에러를 내므로, 허용된 S3 이외의 값(빈 문자열·외부 URL)은 기본 이미지로 떨군다.
 */
const ALLOWED_IMAGE_HOST = 'brave-people-3.s3.ap-northeast-2.amazonaws.com';

export const DEFAULT_EVENT_THUMBNAIL = '/default/event-thumbnail-light.png';

export const eventThumbnail = (
  coverImageLink: string | null | undefined
): string =>
  coverImageLink && coverImageLink.includes(ALLOWED_IMAGE_HOST)
    ? coverImageLink
    : DEFAULT_EVENT_THUMBNAIL;
