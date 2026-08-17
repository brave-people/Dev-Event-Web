import { fallbackLogo, resolveHostLogo } from 'lib/host/logoFallback';
import { Event, EventHost } from 'model/event';
import { useMemo, useState } from 'react';

/**
 * 행사 응답의 주최자를 주최자 API 의 로고 형태로 맞춘다.
 * `EventHost` 는 `image_link`, `HostListItem` 은 `logo_image_link` 라 필드명이 다르다 —
 * 매핑을 여기 한 곳에만 둬서 호출부가 직접 헷갈리지 않게 한다.
 */
export const resolveEventHostLogo = (host: EventHost) =>
  resolveHostLogo({
    host_name: host.host_name,
    logo_image_link: host.image_link,
  });

type EventHostLogo = {
  /** 로고 이미지를 그릴지 여부. false 면 이니셜 뱃지를 그린다. */
  showImage: boolean;
  /** showImage 가 true 일 때만 유효한 이미지 URL. */
  imageSrc: string;
  /** 이미지가 없거나 로드에 실패했을 때 쓰는 이니셜 뱃지 (DES-100). */
  badge: { initial: string; gradient: string; textColor: string };
  /** <img onError> 에 그대로 연결한다. */
  handleImageError: () => void;
};

/**
 * 행사 카드·행사 상세가 같은 주최자 로고를 그리도록 모아둔 훅.
 *
 * 해시 기준은 표시용 `organizer` 가 아니라 `host_name` 이다 —
 * 그래야 주최자 페이지에서 보는 로고와 색이 일치한다.
 */
export const useEventHostLogo = (event: Pick<Event, 'hosts'>): EventHostLogo => {
  const host = event.hosts?.[0] ?? null;
  const [imgFailed, setImgFailed] = useState(false);

  const logo = useMemo(
    () => (host ? resolveEventHostLogo(host) : null),
    [host]
  );

  const badge = useMemo(
    () => (logo?.kind === 'fallback' ? logo : fallbackLogo(host?.host_name ?? '')),
    [logo, host]
  );

  return {
    showImage: logo?.kind === 'image' && !imgFailed,
    imageSrc: logo?.kind === 'image' ? logo.src : '',
    badge,
    handleImageError: () => setImgFailed(true),
  };
};
