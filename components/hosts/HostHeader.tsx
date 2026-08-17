import style from 'components/hosts/HostHeader.module.scss';
import { classificationLabel, fallbackLogo, resolveHostLogo } from 'lib/host/logoFallback';
import { HostDetail } from 'model/host';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  host: HostDetail;
};

const primaryHomepage = (host: HostDetail) =>
  host.links.find((l) => l.type === 'HOMEPAGE' && l.primary) ??
  host.links.find((l) => l.type === 'HOMEPAGE') ??
  null;

const HostHeader = ({ host }: Props) => {
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  // 3줄을 넘겨 실제로 잘리는 경우에만 '더보기'를 노출한다.
  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      setClamped(false);
      return;
    }
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [host.description, expanded]);

  const logo = resolveHostLogo(host);
  // 이미지 URL 이 죽어 있으면 이니셜 뱃지로 대체한다 (DES-100)
  const [imgFailed, setImgFailed] = useState(false);
  const badge = logo.kind === 'fallback' ? logo : fallbackLogo(host.host_name);
  const showImage = logo.kind === 'image' && !imgFailed;
  const homepage = primaryHomepage(host);
  const categoryLine = [classificationLabel(host.classification), host.domain]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className={cn('header')}>
      <div className={cn('nameRow')}>
        {showImage ? (
          <img
            className={cn('logo', 'logo__img')}
            src={(logo as { src: string }).src}
            alt=""
            aria-hidden="true"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className={cn('logo')}
            style={{ background: badge.gradient, color: badge.textColor }}
            aria-hidden="true"
          >
            {badge.initial}
          </div>
        )}
        <h1 className={cn('name')}>
          {host.host_name}
          {host.verified && (
            <span className={cn('verified')} aria-label="확인된 주최">
              ✓
            </span>
          )}
        </h1>
      </div>

      <div className={cn('meta')}>
        <span>{categoryLine}</span>
        {host.meta_location && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <span>{host.meta_location}</span>
          </>
        )}
        {host.meta_history && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <span>{host.meta_history}</span>
          </>
        )}
        {homepage && (
          <>
            <span className={cn('meta__dot')}>•</span>
            <a
              className={cn('meta__link')}
              href={homepage.url}
              target="_blank"
              rel="noreferrer"
            >
              {homepage.url.replace(/^https?:\/\//, '')} ↗
            </a>
          </>
        )}
      </div>

      {host.chips.length > 0 && (
        <div className={cn('chips')}>
          {host.chips.map((chip) => (
            <span
              key={chip.label}
              className={cn('chip', {
                chip__live: chip.variant === 'live',
              })}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {host.description && (
        <div className={cn('descWrap')}>
          <p
            ref={descRef}
            className={cn('desc', { desc__clamped: !expanded })}
          >
            {host.description}
          </p>
          {/* 실제로 잘릴 때만 버튼을 보여준다 */}
          {clamped && (
            <button
              type="button"
              className={cn('descToggle')}
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? '접기' : '더보기'}
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default HostHeader;
