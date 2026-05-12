import Modal from 'react-modal';
import dayjs from 'dayjs';
import Link from 'next/link';
import classNames from 'classnames/bind';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { tagColor } from './utils/tagColor';
import style from './CalendarView.module.scss';

const cn = classNames.bind(style);
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

type Props = {
  isOpen: boolean;
  selectedDate: string | null;
  events: Event[];
  onClose: () => void;
};

const DayDetailSheet = ({ isOpen, selectedDate, events, onClose }: Props) => {
  if (!selectedDate) return null;
  const d = dayjs(selectedDate);
  const dayEvents = events.filter((e) => {
    if (e.event_time_type !== 'DATE') return false;
    if (e.use_start_date_time_yn === 'N') return false;
    if (!e.start_date_time) return false;
    const start = dayjs(e.start_date_time);
    const end = e.end_date_time ? dayjs(e.end_date_time) : start;
    return (d.isSame(start, 'day') || d.isAfter(start, 'day')) &&
           (d.isSame(end, 'day')   || d.isBefore(end, 'day'));
  });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={cn('sheet')}
      overlayClassName={cn('sheet__overlay')}
      ariaHideApp={false}
    >
      <div className={cn('sheet__header')}>
        <span className={cn('sheet__title')}>
          {d.month() + 1}월 {d.date()}일 ({DOW[d.day()]}) · 행사 {dayEvents.length}건
        </span>
        <button type="button" className={cn('sheet__close')} aria-label="닫기" onClick={onClose}>✕</button>
      </div>

      {dayEvents.length === 0 ? (
        <div className={cn('sheet__empty')}>이 날은 등록된 행사가 없어요</div>
      ) : (
        <div>
          {dayEvents.map((e) => {
            const color = tagColor(e.tags.map((t: TagResponse) => t.tag_name));
            const start = dayjs(e.start_date_time);
            const end   = e.end_date_time ? dayjs(e.end_date_time) : start;
            const isMulti = !start.isSame(end, 'day');
            const meta = isMulti
              ? `${start.format('M/D')} ~ ${end.format('M/D')} · ${e.organizer}`
              : `${start.format('M월 D일 HH:mm')} · ${e.organizer}`;
            return (
              <Link href={`/event/detail/${e.id}`} key={e.id}>
                <a className={cn('sheet__item')}>
                  <div className={cn('sheet__bar')} style={{ background: color }} />
                  <div className={cn('sheet__body')}>
                    <div className={cn('sheet__itemTitle')}>{e.title}</div>
                    <div className={cn('sheet__itemMeta')}>{meta}</div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default DayDetailSheet;
