import React from 'react';
import classNames from 'classnames/bind';
import style from './SocialBanner.module.scss';

const cn = classNames.bind(style);

const THREADS_URL = 'https://www.threads.com/@dev.event.official?hl=ko';
const INSTAGRAM_URL = 'https://www.instagram.com/dev.event.official/';
const HANDLE = '@dev.event.official';

const ThreadsIcon = () => (
  <svg
    viewBox="0 0 192 192"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    aria-hidden
  >
    <path d="M141.5 86.6c-.7-.3-1.4-.7-2.1-1-1.3-23.4-14.1-36.8-35.6-37-9.7 0-17.7 4.2-22.9 11.4l11.9 8.2c3.7-5.6 9.5-6.8 14.8-6.8h.2c6.6 0 11.5 1.9 14.7 5.7 2.3 2.7 3.9 6.5 4.7 11.2-6.1-1-12.6-1.4-19.7-1-19.8 1.1-32.4 12.6-31.6 28.6.4 8.1 4.4 15 11.5 19.6 5.9 3.8 13.6 5.7 21.6 5.3 10.6-.6 18.9-4.6 24.7-11.9 4.4-5.5 7.2-12.7 8.4-21.6 5 3 8.7 7 10.7 11.7 3.5 8.1 3.7 21.5-7.2 32.4-9.6 9.6-21.1 13.7-38.5 13.8C84 156.3 70.7 150 61.9 137c-8.2-12.2-12.5-29.7-12.6-52.1.1-22.4 4.4-39.9 12.6-52 8.8-13 22.1-19.3 40.6-19.5 18.6.1 32.1 6.4 41.3 19.5 4.5 6.4 7.9 14.4 10.2 23.7l14-3.7c-2.7-11.4-7-21.3-12.8-29.5-11.7-16.6-28.9-25.1-51.1-25.2H104c-22.2.2-39 8.8-50.1 25.5-9.9 14.9-15 35.6-15.2 61.6.2 26 5.3 46.7 15.2 61.6 11.1 16.7 27.9 25.3 50.1 25.5h.1c19.7-.1 33.6-5.3 45.1-16.8 15-15 14.6-33.8 9.6-45.3-3.6-8.3-10.4-15-19.7-19.4Zm-29.7 22.8c-8.8.5-17.9-3.5-18.3-11.8-.3-6.2 4.4-13.1 18.8-13.9 1.7-.1 3.3-.1 4.9-.1 5.2 0 10.1.5 14.5 1.5-1.7 20.6-11.4 23.9-19.9 24.3Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x={2} y={2} width={20} height={20} rx={5} />
    <circle cx={12} cy={12} r={4} />
    <circle cx={17.5} cy={6.5} r={1} fill="currentColor" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    width={11}
    height={11}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    aria-hidden
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

const SocialBanner: React.FC = () => {
  return (
    <div className={cn('banner')}>
      <a
        href={THREADS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('card', 'card--threads')}
        aria-label="Threads에서 데브이벤트 팔로우"
      >
        <span className={cn('icon')}>
          <ThreadsIcon />
        </span>
        <span className={cn('body')}>
          <span className={cn('label')}>Threads</span>
          <span className={cn('copy')}>새 행사 소식, 가장 먼저 받기</span>
          <span className={cn('handle')}>{HANDLE}</span>
        </span>
        <span className={cn('cta')}>
          팔로우
          <ArrowIcon />
        </span>
      </a>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('card', 'card--ig')}
        aria-label="Instagram에서 데브이벤트 팔로우"
      >
        <span className={cn('icon')}>
          <InstagramIcon />
        </span>
        <span className={cn('body')}>
          <span className={cn('label')}>Instagram</span>
          <span className={cn('copy')}>행사 현장 사진 · 후기 둘러보기</span>
          <span className={cn('handle')}>{HANDLE}</span>
        </span>
        <span className={cn('cta')}>
          팔로우
          <ArrowIcon />
        </span>
      </a>
    </div>
  );
};

export default SocialBanner;
