import { memo } from 'react';
import classNames from 'classnames/bind';
import Link from 'next/link';

import { useToast } from 'context/toast';
import EventThumb from 'components/events/timeline/EventThumb';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import * as ga from 'lib/utils/gTag';
import { TimelineEvent } from 'lib/utils/timeline/describeEvent';
import { Event } from 'model/event';

import style from './EventCard.module.scss';

const cn = classNames.bind(style);

interface EventCardProps {
  item: TimelineEvent;
  favorite: boolean;
  onToggleFavorite: (event: Event) => void;
  priority?: boolean;
}

function EventCard({
  item,
  favorite,
  onToggleFavorite,
  priority = false,
}: EventCardProps) {
  const { pushToast } = useToast();
  const { event, slot } = item;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(event.event_link);
      pushToast('링크가 복사되었어요');
    } catch (err) {
      console.error(err);
      pushToast('링크 복사에 실패했어요', 'plain');
    }
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
  };

  return (
    <article className={cn('card', { 'is-done': item.status === 'ended' })}>
      <Link href={`/event/detail/${String(event.id)}`}>
        <a
          className={cn('link')}
          aria-labelledby={`event-title-${event.id} event-slot-${event.id}`}
          onClick={() => {
            ga.event({
              action: 'web_event_이벤트클릭',
              event_category: 'web_event',
              event_label: '이벤트클릭',
            });
          }}
        >
          <span className={cn('thumb')} aria-hidden="true">
            <EventThumb event={event} priority={priority} />
          </span>
          <span className={cn('body')}>
            <span className={cn('slot')} id={`event-slot-${event.id}`}>
              <i className={cn('chip', slot.tone)}>{slot.chip}</i>
              {slot.time && <span>{slot.time}</span>}
              {slot.extra && <em>{slot.extra}</em>}
            </span>
            <strong className={cn('title')} id={`event-title-${event.id}`}>
              {item.isNew && <i className={cn('new')}>NEW</i>}
              {event.title}
            </strong>
            <span className={cn('org')}>{event.organizer}</span>
            <span className={cn('tags')}>
              {event.tags.map((tag, index) => (
                <span key={`${tag.tag_name}-${index}`}>{tag.tag_name}</span>
              ))}
            </span>
          </span>
        </a>
      </Link>
      <div className={cn('actions')}>
        <button
          type="button"
          className={cn('btn', { on: favorite })}
          aria-label="관심 행사에 담기"
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(event)}
        >
          <TimelineIcon name="bookmark" size={20} />
        </button>
        <button
          type="button"
          className={cn('btn')}
          aria-label="링크 복사"
          onClick={handleShare}
        >
          <TimelineIcon name="share" size={20} />
        </button>
      </div>
    </article>
  );
}

export default memo(EventCard);
