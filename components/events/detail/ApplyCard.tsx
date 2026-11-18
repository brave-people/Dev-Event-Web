import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { ApplyInfo } from 'lib/utils/detail/applyCard';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import ApplyLink from './ApplyLink';
import CalendarAdd from './CalendarAdd';
import style from './ApplyCard.module.scss';

const cn = classNames.bind(style);

interface ApplyCardProps {
  event: Event;
  info: ApplyInfo;
  favorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

function ApplyCard({
  event,
  info,
  favorite,
  onToggleFavorite,
  onShare,
}: ApplyCardProps) {
  return (
    <section className={cn('card')} aria-label="신청">
      {(info.state || info.status) && (
        <div className={cn('status')}>
          <span>{info.state}</span>
          <b className={cn(info.tone)}>{info.status}</b>
        </div>
      )}
      {info.progress && (
        <>
          <div className={cn('bar')} aria-hidden="true">
            <i style={{ width: `${info.progress.percent}%` }} />
          </div>
          <div className={cn('barcap')}>
            <span>{info.progress.startLabel}</span>
            <span>{info.progress.endLabel}</span>
          </div>
        </>
      )}
      <div className={cn('cta')}>
        <ApplyLink href={event.event_link} canApply={info.canApply} />
      </div>
      <div className={cn('actions')}>
        <button
          type="button"
          className={cn('action')}
          aria-label="관심 행사에 담기"
          aria-pressed={favorite}
          onClick={onToggleFavorite}
        >
          <TimelineIcon name="bookmark" size={18} />
          관심
        </button>
        <CalendarAdd event={event} triggerClassName={cn('action')}>
          <TimelineIcon name="calendar" size={18} />
          캘린더
        </CalendarAdd>
        <button type="button" className={cn('action')} onClick={onShare}>
          <TimelineIcon name="share" size={18} />
          공유
        </button>
      </div>
      {info.canApply && (
        <p className={cn('note')}>신청은 주최 측 페이지에서 진행돼요.</p>
      )}
    </section>
  );
}

export default ApplyCard;
