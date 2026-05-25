import style from 'components/hosts/HostEventCard.module.scss';
import { Event } from 'model/event';
import dayjs from 'dayjs';
import Link from 'next/link';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  event: Event;
  isDone?: boolean;
  colorVariant: 1 | 2 | 3 | 4 | 5;
};

const KOREAN_WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

const categoryFromTags = (event: Event): string => {
  const names = event.tags.map((t) => t.tag_name);
  const known = ['컨퍼런스', '웨비나', '해커톤', '밋업', '테크 토크', '네트워킹'];
  const match = names.find((n) => known.includes(n));
  return match ?? '행사';
};

const venueFromTags = (event: Event): string | null => {
  const names = event.tags.map((t) => t.tag_name);
  if (names.includes('온라인')) return '온라인';
  if (names.includes('오프라인')) return '오프라인';
  return null;
};

const locationFromTags = (event: Event): string | null => {
  const names = event.tags.map((t) => t.tag_name);
  const skip = new Set(['컨퍼런스', '웨비나', '해커톤', '밋업', '테크 토크', '네트워킹', '온라인', '오프라인']);
  return names.find((n) => !skip.has(n)) ?? null;
};

const formatDateRange = (event: Event): string => {
  const start = dayjs(event.start_date_time);
  const end = dayjs(event.end_date_time);
  const startDay = KOREAN_WEEKDAY[start.day()];
  const sameDay = start.isSame(end, 'day');
  if (sameDay) {
    if (event.use_start_date_time_yn === 'Y') {
      return `${start.format('YYYY.MM.DD')} (${startDay}) ${start.format('HH:mm')}`;
    }
    return `${start.format('YYYY.MM.DD')} (${startDay})`;
  }
  return `${start.format('YYYY.MM.DD')} – ${end.format('MM.DD')}`;
};

const formatDday = (event: Event): string => {
  const today = dayjs().startOf('day');
  const start = dayjs(event.start_date_time).startOf('day');
  const diff = start.diff(today, 'day');
  if (diff <= 0) return 'D-DAY';
  return `D-${diff}`;
};

const HostEventCard = ({ event, isDone = false, colorVariant }: Props) => {
  const category = categoryFromTags(event);
  const venue = venueFromTags(event);
  const location = locationFromTags(event);
  const start = dayjs(event.start_date_time);
  const ribbon = `${category.slice(0, 4).toUpperCase()} · ${start.format('MM')}`;

  return (
    <Link href={`/event/detail/${event.id}`}>
      <a className={cn('card')}>
        <div
          className={cn('thumb', {
            thumb__c1: colorVariant === 1,
            thumb__c2: colorVariant === 2,
            thumb__c3: colorVariant === 3,
            thumb__c4: colorVariant === 4,
            thumb__c5: colorVariant === 5,
          })}
          aria-hidden="true"
        >
          {ribbon}
        </div>
        <div className={cn('body')}>
          <span className={cn('category')}>{category}</span>
          <h3 className={cn(isDone ? 'title__done' : 'title')}>
            {event.title}
          </h3>
          <div className={cn('meta')}>
            <span>{formatDateRange(event)}</span>
            {location && (
              <>
                <span className={cn('meta__dot')}>•</span>
                <span>{location}</span>
              </>
            )}
            {venue && (
              <>
                <span className={cn('meta__dot')}>•</span>
                <span className={cn('meta__strong')}>{venue}</span>
              </>
            )}
            {isDone ? (
              <span className={cn('badge', 'badge__done')}>종료</span>
            ) : (
              <span className={cn('badge', 'badge__dday')}>{formatDday(event)}</span>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default HostEventCard;
