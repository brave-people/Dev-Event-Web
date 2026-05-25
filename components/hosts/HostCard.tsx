import style from 'components/hosts/HostCard.module.scss';
import { classificationLabel, resolveHostLogo } from 'lib/host/logoFallback';
import { HostListItem } from 'model/host';
import Link from 'next/link';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  host: HostListItem;
};

const HostCard = ({ host }: Props) => {
  const logo = resolveHostLogo(host);

  return (
    <Link href={`/hosts/${host.id}`}>
      <a className={cn('card')}>
        <div className={cn('top')}>
          {logo.kind === 'image' ? (
            <img
              className={cn('logo', 'logo__img')}
              src={logo.src}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <div
              className={cn('logo')}
              style={{ background: logo.gradient, color: logo.textColor }}
              aria-hidden="true"
            >
              {logo.initial}
            </div>
          )}
          <div className={cn('nameWrap')}>
            <div className={cn('name')}>
              {host.host_name}
              {host.verified && (
                <span className={cn('verified')} aria-label="확인된 주최">
                  ✓
                </span>
              )}
            </div>
            <div className={cn('meta')}>
              <span>{classificationLabel(host.classification)}</span>
              {host.domain && (
                <>
                  <span className={cn('meta__dot')}>•</span>
                  <span>{host.domain}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={cn('counts')}>
          {host.ongoing_count > 0 && (
            <span className={cn('count__live')}>진행중 {host.ongoing_count}</span>
          )}
          <span className={cn('count__total')}>누적 {host.total_count}건</span>
        </div>

        {host.topics.length > 0 && (
          <div className={cn('topics')}>
            {host.topics.map((topic) => (
              <span key={topic} className={cn('topic')}>
                {topic}
              </span>
            ))}
          </div>
        )}
      </a>
    </Link>
  );
};

export default HostCard;
