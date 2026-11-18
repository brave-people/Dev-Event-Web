import { KeyboardEvent, MouseEvent, useEffect, useMemo, useRef } from 'react';

import classNames from 'classnames/bind';

import { Event } from 'model/event';
import { LightboxImage } from 'components/events/detail/Lightbox';
import { buildEventPlaceholderSummary } from 'lib/seo/eventMeta';
import { renderDescription } from 'lib/utils/renderDescription';

import style from './DetailBody.module.scss';

const cn = classNames.bind(style);

interface DetailBodyProps {
  event: Event;
  onZoom: (image: LightboxImage) => void;
}

// 링크 안에 있지 않은 본문 그림만 크게 볼 수 있다
const asZoomable = (target: EventTarget | null): HTMLImageElement | null => {
  if (!(target instanceof HTMLImageElement)) return null;
  if (target.closest('a')) return null;
  return target;
};

function DetailBody({ event, onZoom }: DetailBodyProps) {
  const html = useMemo(
    () => renderDescription(event.description),
    [event.description]
  );
  const proseRef = useRef<HTMLDivElement>(null);

  // 마운트 뒤에 그림을 키보드로 열 수 있게 한다(첫 HTML은 서버와 같다)
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;
    Array.from(root.querySelectorAll('img')).forEach((img) => {
      if (img.closest('a')) return;
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute(
        'aria-label',
        img.alt ? `${img.alt} 크게 보기` : '본문 그림 크게 보기'
      );
    });
  }, [html]);

  const zoom = (img: HTMLImageElement) =>
    onZoom({ src: img.currentSrc || img.src, alt: img.alt || '본문 그림' });

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const img = asZoomable(e.target);
    if (img) zoom(img);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const img = asZoomable(e.target);
    if (!img) return;
    e.preventDefault();
    zoom(img);
  };

  return (
    <>
      <h2 className={cn('heading')}>행사 소개</h2>
      {html ? (
        <div
          ref={proseRef}
          className={cn('prose')}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className={cn('empty')}>{buildEventPlaceholderSummary(event)}</p>
      )}
    </>
  );
}

export default DetailBody;
