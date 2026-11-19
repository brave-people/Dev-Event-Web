import { useState } from 'react';

import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';

import { TopBanner } from 'model/banner';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { bannerTone } from 'lib/utils/banner/tone';
import { bannerLink, stepBanner } from 'lib/utils/banner/topBanner';

import style from './RegisteredBanner.module.scss';

const cn = classNames.bind(style);

interface RegisteredBannerProps {
  banners: TopBanner[];
}

function RegisteredBanner({ banners }: RegisteredBannerProps) {
  const [index, setIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<string[]>([]);

  const count = banners.length;
  const current = stepBanner(index, 0, count);
  const banner = banners[current];
  const tone = bannerTone(banner.background_color);
  const link = bannerLink(banner.event_link);
  const image =
    typeof banner.banner_image === 'string' ? banner.banner_image.trim() : '';
  const showImage = image !== '' && brokenIds.indexOf(image) === -1;
  const multiple = count > 1;

  const markBroken = () =>
    setBrokenIds((prev) =>
      prev.indexOf(image) === -1 ? [...prev, image] : prev
    );

  const picture = (
    <Image
      key={image}
      src={image}
      alt=""
      layout="fill"
      objectFit="cover"
      unoptimized
      onError={markBroken}
    />
  );

  return (
    <section
      className={cn('banner', tone.ink === 'light' ? 'on-dark' : 'on-light')}
      aria-label="추천 행사"
      style={
        {
          '--bn-bg': tone.bg,
          '--bn-fg': tone.fg,
        } as React.CSSProperties
      }
    >
      <h1 className={cn('sr-only')}>개발자 행사는 모두 Dev Event 웹에서</h1>
      <div className={cn('inner', { 'no-image': !showImage })}>
        <div className={cn('text')}>
          <p className={cn('eyebrow')}>추천 행사</p>
          <h2 className={cn('title')} aria-live="polite">
            {banner.title}
          </h2>
          {(link || multiple) && (
            <div className={cn('row')}>
              {link &&
                (link.external ? (
                  <a
                    className={cn('go')}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    자세히 보기
                    <span className={cn('sr-only')}>(새 탭)</span>
                  </a>
                ) : (
                  <Link href={link.href}>
                    <a className={cn('go')}>자세히 보기</a>
                  </Link>
                ))}
              {multiple && (
                <>
                  <button
                    type="button"
                    className={cn('arrow')}
                    aria-label="이전 배너"
                    onClick={() => setIndex(stepBanner(current, -1, count))}
                  >
                    <TimelineIcon name="back" size={16} />
                  </button>
                  <span className={cn('count')}>
                    {current + 1} / {count}
                  </span>
                  <button
                    type="button"
                    className={cn('arrow')}
                    aria-label="다음 배너"
                    onClick={() => setIndex(stepBanner(current, 1, count))}
                  >
                    <TimelineIcon name="chevron" size={16} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {showImage &&
          (link ? (
            link.external ? (
              <a
                className={cn('image')}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
                aria-hidden="true"
              >
                {picture}
              </a>
            ) : (
              <Link href={link.href}>
                <a className={cn('image')} tabIndex={-1} aria-hidden="true">
                  {picture}
                </a>
              </Link>
            )
          ) : (
            <span className={cn('image')}>{picture}</span>
          ))}
      </div>
    </section>
  );
}

export default RegisteredBanner;
