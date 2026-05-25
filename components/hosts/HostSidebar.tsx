import style from 'components/hosts/HostSidebar.module.scss';
import { HostLink, HostSummary } from 'model/host';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  links: HostLink[];
  summary: HostSummary;
};

const LINK_LABEL: Record<HostLink['type'], string> = {
  HOMEPAGE: '공식 홈페이지',
  YOUTUBE: 'YouTube',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  LINKEDIN: 'LinkedIn',
  GITHUB: 'GitHub',
  BLOG: '기술 블로그',
  ETC: '바로가기',
};

const linkLabel = (link: HostLink): string =>
  link.description?.trim() || LINK_LABEL[link.type];

const formatFirstDate = (iso: string | null): string => {
  if (!iso) return '—';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[1]}.${m[2]}.${m[3]}`;
};

const HostSidebar = ({ links, summary }: Props) => {
  const sorted = [...links].sort((a, b) => {
    if (a.primary !== b.primary) return a.primary ? -1 : 1;
    if (a.display_order !== b.display_order) return a.display_order - b.display_order;
    return a.id - b.id;
  });

  return (
    <aside className={cn('aside')}>
      {sorted.length > 0 && (
        <div className={cn('card')}>
          <div className={cn('card__title')}>바로가기</div>
          <ul className={cn('links')}>
            {sorted.map((link) => (
              <li key={link.id} className={cn('links__item')}>
                <a
                  className={cn('links__link')}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {linkLabel(link)}
                  <span className={cn('links__arrow')} aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={cn('card')}>
        <div className={cn('card__title')}>활동 요약</div>
        <dl className={cn('summary')}>
          <div className={cn('summary__row')}>
            <dt className={cn('summary__label')}>누적 행사</dt>
            <dd className={cn('summary__value')}>{summary.total_events}건</dd>
          </div>
          <div className={cn('summary__row')}>
            <dt className={cn('summary__label')}>첫 등록일</dt>
            <dd className={cn('summary__value')}>{formatFirstDate(summary.first_event_date)}</dd>
          </div>
          <div className={cn('summary__row')}>
            <dt className={cn('summary__label')}>최근 6개월</dt>
            <dd className={cn('summary__value')}>{summary.recent_delta}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
};

export default HostSidebar;
