import classNames from 'classnames/bind';

import { Event } from 'model/event';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import {
  describeHow,
  describeWhen,
  organizerInitial,
} from 'lib/utils/detail/summary';

import style from './DetailHead.module.scss';

const cn = classNames.bind(style);

interface DetailHeadProps {
  event: Event;
  now: string;
}

function DetailHead({ event, now }: DetailHeadProps) {
  const when = describeWhen(event, now);
  const how = describeHow(event.tags);

  return (
    <>
      {event.organizer && (
        <div className={cn('org')}>
          <i aria-hidden="true">{organizerInitial(event.organizer)}</i>
          {event.organizer}
        </div>
      )}
      <h1 className={cn('title')}>{event.title}</h1>
      {(event.tags || []).length > 0 && (
        <div className={cn('tags')}>
          {(event.tags || []).map((tag, index) => (
            <span key={`${tag.tag_name}-${index}`}>{tag.tag_name}</span>
          ))}
        </div>
      )}
      {(when || how) && (
        <div className={cn('blocks')}>
          {when && (
            <div className={cn('block')}>
              <div className={cn('leaf')} aria-hidden="true">
                <small>{when.month}</small>
                <b>{when.day}</b>
              </div>
              <p>
                <b>{when.headline}</b>
                <span>{when.range}</span>
              </p>
            </div>
          )}
          {how && (
            <div className={cn('block')}>
              <div className={cn('leaf', 'icon')} aria-hidden="true">
                <TimelineIcon name={how.icon} size={22} />
              </div>
              <p>
                <b>{how.headline}</b>
                <span>{how.note}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default DetailHead;
