import style from 'components/hosts/HostBanner.module.scss';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  bannerImageLink?: string | null;
};

const HostBanner = ({ bannerImageLink }: Props) => {
  return (
    <section className={cn('banner')}>
      <div
        className={cn('banner__inner', { banner__image: !!bannerImageLink })}
        style={bannerImageLink ? { backgroundImage: `url(${bannerImageLink})` } : undefined}
        aria-hidden="true"
      >
        {!bannerImageLink && (
          <div className={cn('banner__pattern')}>
            DEVELOPER · COMMUNITY · TALK · MEETUP · CONFERENCE
          </div>
        )}
      </div>
    </section>
  );
};

export default HostBanner;
