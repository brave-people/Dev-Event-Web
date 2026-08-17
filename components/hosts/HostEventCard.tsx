import BookmarkIcon from 'components/icons/BookmarkIcon';
import style from 'components/hosts/HostEventCard.module.scss';
import { eventThumbnail } from 'lib/utils/eventThumbnail';
import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  event: Event;
  isDone?: boolean;
  /** 북마크 상태. 미지정이면 버튼을 렌더하지 않는다. */
  isBookmarked?: boolean;
  onClickBookmark?: (event: Event) => void;
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

/** dayjs 가 'Invalid Date' 문자열을 화면에 흘리지 않도록 유효한 값만 통과시킨다. */
const parseDate = (value: string | null | undefined) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const formatDateRange = (event: Event): string | null => {
  const start = parseDate(event.start_date_time);
  const end = parseDate(event.end_date_time);
  const isRecruit = event.event_time_type === 'RECRUIT';

  // 모집(RECRUIT)은 '언제 열리는 행사'가 아니라 '언제까지 접수'다.
  if (isRecruit) {
    if (!start && !end) return null;
    if (start && end) {
      return `접수 ${start.format('YYYY.MM.DD')} ~ ${end.format('YYYY.MM.DD')}`;
    }
    if (end) return `접수 ~ ${end.format('YYYY.MM.DD')}`;
    return `접수 ${start!.format('YYYY.MM.DD')} ~`;
  }

  if (!start) {
    return end ? `${end.format('YYYY.MM.DD')} 까지` : null;
  }

  const startDay = KOREAN_WEEKDAY[start.day()];
  const sameDay = end ? start.isSame(end, 'day') : true;
  if (sameDay) {
    if (event.use_start_date_time_yn === 'Y') {
      return `${start.format('YYYY.MM.DD')} (${startDay}) ${start.format('HH:mm')}`;
    }
    return `${start.format('YYYY.MM.DD')} (${startDay})`;
  }
  return `${start.format('YYYY.MM.DD')} – ${end!.format('MM.DD')}`;
};

const formatDday = (event: Event): string | null => {
  const isRecruit = event.event_time_type === 'RECRUIT';
  // 모집은 마감(종료일) 기준, 일반 행사는 시작일 기준
  const target = isRecruit
    ? parseDate(event.end_date_time)
    : parseDate(event.start_date_time);
  if (!target) return null;

  const diff = target.startOf('day').diff(dayjs().startOf('day'), 'day');
  if (diff < 0) return null;
  if (diff === 0) return isRecruit ? '오늘 마감' : 'D-DAY';
  return isRecruit ? `마감 D-${diff}` : `D-${diff}`;
};

const HostEventCard = ({
  event,
  isDone = false,
  isBookmarked,
  onClickBookmark,
}: Props) => {
  const category = categoryFromTags(event);
  const venue = venueFromTags(event);
  const location = locationFromTags(event);
  const dateRange = formatDateRange(event);
  const dday = formatDday(event);

  return (
    <Link href={`/event/detail/${event.id}`}>
      <a className={cn('card')}>
        {/* 썸네일 규칙은 /events 목록과 공유한다 (lib/utils/eventThumbnail) */}
        <div className={cn('thumb')}>
          <Image
            unoptimized
            alt=""
            aria-hidden="true"
            src={eventThumbnail(event.cover_image_link)}
            layout="fill"
            objectFit="cover"
          />
          {isDone && <div className={cn('thumb__done')} />}
        </div>
        <div className={cn('body')}>
          <span className={cn('category')}>{category}</span>
          <h3 className={cn(isDone ? 'title__done' : 'title')}>
            {event.title}
          </h3>
          <div className={cn('meta')}>
            {dateRange && <span>{dateRange}</span>}
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
              dday && <span className={cn('badge', 'badge__dday')}>{dday}</span>
            )}
          </div>
        </div>

        {/* 카드 전체가 <a> 로 감싸져 있으므로 기본 동작을 반드시 막는다 */}
        {onClickBookmark && (
          <div className={cn('action')}>
            <button
              type="button"
              className={cn('bookmarkBtn')}
              aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
              aria-pressed={Boolean(isBookmarked)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClickBookmark(event);
                ga.event({
                  action: isBookmarked
                    ? 'web_event_관심행사삭제버튼클릭'
                    : 'web_event_관심행사추가버튼클릭',
                  event_category: 'web_event',
                  event_label: '관심행사',
                });
              }}
            >
              <BookmarkIcon isFavorite={Boolean(isBookmarked)} />
            </button>
          </div>
        )}
      </a>
    </Link>
  );
};

export default HostEventCard;
