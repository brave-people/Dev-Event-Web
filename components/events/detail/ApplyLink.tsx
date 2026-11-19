import classNames from 'classnames/bind';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import style from './ApplyLink.module.scss';

const cn = classNames.bind(style);

interface ApplyLinkProps {
  href: string;
  canApply: boolean;
}

function ApplyLink({ href, canApply }: ApplyLinkProps) {
  if (!canApply) {
    return <span className={cn('link', 'off')}>종료된 행사예요</span>;
  }
  return (
    <a
      className={cn('link')}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      신청하러 가기 <TimelineIcon name="out" size={18} />
      <span className={cn('sr')}>(새 탭)</span>
    </a>
  );
}

export default ApplyLink;
