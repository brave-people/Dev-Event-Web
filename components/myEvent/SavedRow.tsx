import { memo } from 'react';

import classNames from 'classnames/bind';
import Link from 'next/link';

import EventThumb from 'components/events/timeline/EventThumb';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import * as ga from 'lib/utils/gTag';
import { SavedItem } from 'lib/utils/mypage/savedEvents';

import style from './SavedRow.module.scss';

const cn = classNames.bind(style);

interface SavedRowProps {
  item: SavedItem;
  onRemove: (item: SavedItem) => void;
}

function SavedRow({ item, onRemove }: SavedRowProps) {
  const { event, done, tone, label, when } = item;
  const titleId = `saved-title-${item.favoriteId}`;
  const meta = [event.organizer, when].filter((part) => !!part).join(' · ');

  return (
    <article className={cn('row', { done })}>
      <Link href={`/event/detail/${String(event.id)}`}>
        <a
          className={cn('link')}
          onClick={() =>
            ga.event({
              action: 'web_event_이벤트클릭',
              event_category: 'web_event',
              event_label: '이벤트클릭',
            })
          }
        >
          <span className={cn('thumb')} aria-hidden="true">
            <EventThumb event={event} />
          </span>
          <span className={cn('body')}>
            <i className={cn('badge', tone)}>{label}</i>
            <strong id={titleId} className={cn('title')}>
              {event.title}
            </strong>
            {meta && <span className={cn('meta')}>{meta}</span>}
          </span>
        </a>
      </Link>
      <button
        type="button"
        className={cn('remove')}
        aria-label="관심 행사에서 빼기"
        title="관심 행사에서 빼기"
        aria-describedby={titleId}
        onClick={() => onRemove(item)}
      >
        <TimelineIcon name="bookmark" size={20} />
      </button>
    </article>
  );
}

export default memo(SavedRow);
