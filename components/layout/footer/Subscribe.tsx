import classNames from 'classnames/bind';
import style from 'components/layout/footer/Subscribe.module.scss';
import { INSTAGRAM_URL, SUBSCRIBE_URL, THREADS_URL } from 'lib/links';

const cn = classNames.bind(style);

const CHANNELS = [
  {
    name: '메일',
    desc: '일요일 저녁 8시 · 한 주 치를 모아서',
    action: '구독하기',
    href: SUBSCRIBE_URL,
  },
  {
    name: 'Threads',
    desc: '@dev.event.official · 새 행사 소식을 가장 먼저',
    action: '보러 가기',
    href: THREADS_URL,
  },
  {
    name: 'Instagram',
    desc: '@dev.event.official · 익숙한 피드에서',
    action: '보러 가기',
    href: INSTAGRAM_URL,
  },
];

const Subscribe = () => {
  return (
    <section className={cn('subscribe')}>
      <div className={cn('subscribe__inner')}>
        <h2 className={cn('subscribe__title')}>
          새 행사 소식,
          <br />
          다양한 곳에서 확인해 보세요
        </h2>
        <ul className={cn('subscribe__list')}>
          {CHANNELS.map((c) => (
            <li key={c.name}>
              <a
                className={cn('row')}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={cn('row__name')}>{c.name}</span>
                <span className={cn('row__desc')}>{c.desc}</span>
                <span className={cn('row__action')}>{c.action}</span>
                <svg
                  className={cn('row__arrow')}
                  width={18}
                  height={18}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Subscribe;
