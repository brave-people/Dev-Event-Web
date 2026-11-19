import { useEffect, useState } from 'react';

import classNames from 'classnames/bind';

import { Event } from 'model/event';
import EventThumb from 'components/events/timeline/EventThumb';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { LightboxImage } from 'components/events/detail/Lightbox';
import { hasCoverLink } from 'lib/utils/timeline/cover';

import style from './DetailPoster.module.scss';

const cn = classNames.bind(style);

interface DetailPosterProps {
  event: Event;
  onZoom: (image: LightboxImage) => void;
}

function DetailPoster({ event, onZoom }: DetailPosterProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [event.cover_image_link]);

  const zoomable = hasCoverLink(event.cover_image_link) && !broken;

  return (
    <div className={cn('poster')}>
      <EventThumb
        event={event}
        anyHost
        alt={event.title}
        priority
        onCoverError={() => setBroken(true)}
      />
      {zoomable && (
        <button
          type="button"
          className={cn('zoom')}
          aria-label="행사 포스터 크게 보기"
          onClick={() =>
            onZoom({
              src: event.cover_image_link,
              alt: `${event.title} 포스터`,
            })
          }
        >
          <span className={cn('hint')} aria-hidden="true">
            <TimelineIcon name="zoom" size={14} /> 크게 보기
          </span>
        </button>
      )}
    </div>
  );
}

export default DetailPoster;
