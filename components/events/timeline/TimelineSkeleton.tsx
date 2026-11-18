import classNames from 'classnames/bind';

import style from './TimelineSkeleton.module.scss';

const cn = classNames.bind(style);

interface TimelineSkeletonProps {
  count?: number;
}

function TimelineSkeleton({ count = 3 }: TimelineSkeletonProps) {
  const slots = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={cn('skeleton')} role="status" aria-busy="true">
      <span className={cn('sr-only')}>행사를 불러오는 중이에요</span>
      <div className={cn('day')}>
        <div className={cn('rail')} />
        <div className={cn('items')}>
          {slots.map((slot) => (
            <div key={`slot-${slot}`} className={cn('card')}>
              <div className={cn('thumb')} />
              <div className={cn('body')}>
                <div className={cn('chip')} />
                <div className={cn('name')} />
                <div className={cn('host')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimelineSkeleton;
