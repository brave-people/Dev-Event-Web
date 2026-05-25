import style from 'components/hosts/HostHeader.module.scss';
import { classificationLabel, resolveHostLogo } from 'lib/host/logoFallback';
import { HostDetail } from 'model/host';
import React from 'react';
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
  const logo = resolveHostLogo(host);
  const homepage = primaryHomepage(host);
  const categoryLine = [classificationLabel(host.classification), host.domain]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className={cn('header')}>
      <div className={cn('nameRow')}>
        {logo.kind === 'image' ? (
          <img
            className={cn('logo', 'logo__img')}
            src={logo.src}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <div
            className={cn('logo')}
            style={{ background: logo.gradient, color: logo.textColor }}
            aria-hidden="true"
          >
            {logo.initial}
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
        <span className={cn('meta__dot')}>•</span>
        <span>{host.meta_history}</span>
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
                chip__ghost: chip.variant === 'ghost',
              })}
            >
              {chip.label}
            </span>
          ))}
        </div>
      )}

      <p className={cn('desc')}>{host.description}</p>
    </header>
  );
};

export default HostHeader;
