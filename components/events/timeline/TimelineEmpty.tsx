import classNames from 'classnames/bind';

import style from './TimelineEmpty.module.scss';

const cn = classNames.bind(style);

interface TimelineEmptyProps {
  title: string;
  desc?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function TimelineEmpty({
  title,
  desc,
  actionLabel,
  onAction,
}: TimelineEmptyProps) {
  return (
    <div className={cn('empty')} role="status">
      <b className={cn('title')}>{title}</b>
      {desc && <p className={cn('desc')}>{desc}</p>}
      {actionLabel && (
        <button type="button" className={cn('action')} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default TimelineEmpty;
