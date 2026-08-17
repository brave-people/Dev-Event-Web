import style from 'components/hosts/HostCard.module.scss';
import { classificationLabel, fallbackLogo, resolveHostLogo } from 'lib/host/logoFallback';
import React, { useState } from 'react';
import * as ga from 'lib/utils/gTag';
import { HostListItem } from 'model/host';
import Link from 'next/link';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  host: HostListItem;
};

const HostCard = ({ host }: Props) => {
  const logo = resolveHostLogo(host);
  // 이미지 URL 이 죽어 있으면 이니셜 뱃지로 대체한다 (DES-100)
  const [imgFailed, setImgFailed] = useState(false);
  const badge = logo.kind === 'fallback' ? logo : fallbackLogo(host.host_name);
  const showImage = logo.kind === 'image' && !imgFailed;

  return (
    <Link href={`/hosts/${host.id}`}>
      <a
        className={cn('card')}
        onClick={() =>
          ga.event({
            action: 'host_card_click',
            event_category: 'web_host',
            event_label: host.host_name,
          })
        }
      >
        <div className={cn('top')}>
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
          <div className={cn('nameWrap')}>
            <div className={cn('name')}>
              {host.host_name}
              {host.verified && (
                <span className={cn('verified')} aria-label="확인된 주최">
                  ✓
                </span>
              )}
            </div>
            <div className={cn('meta')}>
              <span>{classificationLabel(host.classification)}</span>
              {host.domain && (
                <>
                  <span className={cn('meta__dot')}>•</span>
                  <span>{host.domain}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={cn('counts')}>
          {host.ongoing_count > 0 && (
            <span className={cn('count__live')}>진행중 {host.ongoing_count}</span>
          )}
          <span className={cn('count__total')}>누적 {host.total_count}건</span>
        </div>

        {host.short_description && (
          <p className={cn('desc')}>{host.short_description}</p>
        )}

        {host.topics.length > 0 && (
          <div className={cn('topics')}>
            {host.topics.map((topic) => (
              <span key={topic} className={cn('topic')}>
                {topic}
              </span>
            ))}
          </div>
        )}
      </a>
    </Link>
  );
};

export default HostCard;
