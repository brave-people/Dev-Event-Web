import { useEffect } from 'react';
import classNames from 'classnames/bind';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { heatLegend } from 'components/events/calendar/utils/calendarMonth';
import style from './HeatLegend.module.scss';

const cn = classNames.bind(style);

interface HeatLegendProps {
  id: string;
  tail: number;
  onClose: () => void;
}

function HeatLegend({ id, tail, onClose }: HeatLegendProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={cn('legend')}
      id={id}
      role="dialog"
      aria-label="달력 보는 법"
      style={{ '--tail': `${tail}px` } as React.CSSProperties}
    >
      <b>달력 보는 법</b>
      <p>칸의 색이 진할수록 그날 행사가 많아요.</p>
      <div className={cn('scale')} aria-hidden="true">
        <span>적음</span>
        <i className={cn('lv1')} />
        <i className={cn('lv2')} />
        <i className={cn('lv3')} />
        <i className={cn('lv4')} />
        <span>많음</span>
      </div>
      <div className={cn('steps')}>
        {heatLegend().map((text) => (
          <span key={text}>{text}</span>
        ))}
      </div>
      <p>
        숫자는 그날 <em>접수를 마감하거나 열리는</em> 행사 수예요.
      </p>
      <button
        type="button"
        className={cn('close')}
        aria-label="설명 닫기"
        onClick={onClose}
      >
        <TimelineIcon name="x" size={16} />
      </button>
    </div>
  );
}

export default HeatLegend;
