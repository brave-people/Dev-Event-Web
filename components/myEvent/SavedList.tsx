import classNames from 'classnames/bind';
import Link from 'next/link';

import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { SavedItem } from 'lib/utils/mypage/savedEvents';

import SavedRow from './SavedRow';
import style from './SavedList.module.scss';

const cn = classNames.bind(style);

interface SavedListProps {
  items: SavedItem[] | null; // null이면 불러오는 중
  isError: boolean;
  onRemove: (item: SavedItem) => void;
}

const SLOTS = [0, 1, 2];

function SavedList({ items, isError, onRemove }: SavedListProps) {
  if (isError) {
    return (
      <p className={cn('message')}>
        관심 행사 정보를 불러오는데 문제가 발생했습니다!
      </p>
    );
  }

  if (items === null) {
    return (
      <div className={cn('skeleton')} role="status" aria-busy="true">
        <span className={cn('sr-only')}>행사를 불러오는 중이에요</span>
        {SLOTS.map((slot) => (
          <div key={`slot-${slot}`} className={cn('slot')}>
            <div className={cn('slot-thumb')} />
            <div className={cn('slot-body')}>
              <div className={cn('bar', 'bar-badge')} />
              <div className={cn('bar', 'bar-title')} />
              <div className={cn('bar', 'bar-meta')} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('empty')}>
        <span className={cn('empty-icon')} aria-hidden="true">
          <TimelineIcon name="bookmark" size={34} />
        </span>
        <strong className={cn('empty-title')}>저장한 행사가 없습니다.</strong>
        <p className={cn('empty-desc')}>관심있는 행사를 저장해보세요</p>
        <Link href="/events">
          <a className={cn('empty-link')}>개발자 행사 보러가기</a>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('list')}>
      {items.map((item) => (
        <SavedRow
          key={`${item.favoriteId}-${item.event.id}`}
          item={item}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default SavedList;
