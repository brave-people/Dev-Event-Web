import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { ApplyInfo } from 'lib/utils/detail/applyCard';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import ApplyLink from './ApplyLink';
import CalendarAdd from './CalendarAdd';
import style from './MobileApplyBar.module.scss';

const cn = classNames.bind(style);

interface MobileApplyBarProps {
  event: Event;
  info: ApplyInfo;
  favorite: boolean;
  onToggleFavorite: () => void;
}

function MobileApplyBar({
  event,
  info,
  favorite,
  onToggleFavorite,
}: MobileApplyBarProps) {
  return (
    <div className={cn('bar')} role="group" aria-label="신청">
      <button
        type="button"
        className={cn('icon')}
        aria-label="관심 행사에 담기"
        aria-pressed={favorite}
        onClick={onToggleFavorite}
      >
        <TimelineIcon name="bookmark" />
      </button>
      <CalendarAdd event={event} triggerClassName={cn('icon')}>
        <TimelineIcon name="calendar" />
      </CalendarAdd>
      <div className={cn('cta')}>
        <ApplyLink href={event.event_link} canApply={info.canApply} />
      </div>
    </div>
  );
}

export function MobileApplyBarSpace() {
  return <div className={cn('space')} aria-hidden="true" />;
}

export default MobileApplyBar;
