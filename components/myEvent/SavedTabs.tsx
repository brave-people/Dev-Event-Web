import classNames from 'classnames/bind';

import { SavedTab } from 'lib/utils/mypage/savedEvents';

import style from './SavedTabs.module.scss';

const cn = classNames.bind(style);

interface SavedTabsProps {
  active: SavedTab;
  ongoingCount: number;
  doneCount: number;
  onSelect: (tab: SavedTab) => void;
}

function SavedTabs({
  active,
  ongoingCount,
  doneCount,
  onSelect,
}: SavedTabsProps) {
  return (
    <div className={cn('tabs')} role="tablist" aria-label="관심 행사 상태">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'ongoing'}
        className={cn('tab', { on: active === 'ongoing' })}
        onClick={() => onSelect('ongoing')}
      >
        진행중<i className={cn('count')}>{ongoingCount}</i>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'done'}
        className={cn('tab', { on: active === 'done' })}
        onClick={() => onSelect('done')}
      >
        종료<i className={cn('count')}>{doneCount}</i>
      </button>
    </div>
  );
}

export default SavedTabs;
