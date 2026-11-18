import classNames from 'classnames/bind';
import Link from 'next/link';

import EventThumb from 'components/events/timeline/EventThumb';
import {
  aliveRelated,
  RelatedPick,
  relatedMeta,
} from 'lib/utils/detail/related';

import style from './RelatedEvents.module.scss';

const cn = classNames.bind(style);

interface RelatedEventsProps {
  related: RelatedPick | null;
  now: string;
}

function RelatedEvents({ related, now }: RelatedEventsProps) {
  if (!related) return null;
  const events = aliveRelated(related.events, now);
  if (events.length === 0) return null;

  return (
    <section className={cn('more')} aria-labelledby="related-title">
      <h2 id="related-title" className={cn('heading')}>
        {related.title}
      </h2>
      <ul className={cn('list')}>
        {events.map((event) => (
          <li key={event.id}>
            <Link href={`/event/detail/${String(event.id)}`}>
              <a className={cn('row')}>
                <span className={cn('thumb')} aria-hidden="true">
                  <EventThumb event={event} />
                </span>
                <span className={cn('text')}>
                  <strong>{event.title}</strong>
                  <small>{relatedMeta(event, now)}</small>
                </span>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedEvents;
