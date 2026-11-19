import { useEffect, useState } from 'react';

import classNames from 'classnames/bind';
import Image from 'next/image';

import { Event } from 'model/event';
import {
  autoCover,
  coverCaption,
  hasCoverLink,
  isUsableCover,
} from 'lib/utils/timeline/cover';

import style from './EventThumb.module.scss';

const cn = classNames.bind(style);

interface EventThumbProps {
  event: Event;
  priority?: boolean;
  className?: string;
  anyHost?: boolean;
  onCoverError?: () => void;
  alt?: string;
}

function EventThumb({
  event,
  priority = false,
  className,
  anyHost = false,
  onCoverError,
  alt = '',
}: EventThumbProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [event.cover_image_link]);

  const usable = anyHost
    ? hasCoverLink(event.cover_image_link)
    : isUsableCover(event.cover_image_link);

  if (usable && !broken) {
    return (
      <span className={cn('thumb', className)}>
        <b className={cn('placeholder')} aria-hidden="true">
          DEV.EVENT
        </b>
        <Image
          src={event.cover_image_link}
          alt={alt}
          layout="fill"
          objectFit="cover"
          unoptimized
          priority={priority}
          onError={() => {
            setBroken(true);
            if (onCoverError) onCoverError();
          }}
        />
      </span>
    );
  }

  const cover = autoCover(event.tags);

  return (
    <span className={cn('thumb', 'auto', `auto-${cover.index}`, className)}>
      <span className={cn('auto-body')}>
        <em>{coverCaption(cover)}</em>
        <b>{event.title}</b>
        <small>{event.organizer}</small>
      </span>
    </span>
  );
}

export default EventThumb;
