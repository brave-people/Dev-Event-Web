import Logo from 'components/common/logo/Logo';
import style from 'components/layout/footer/Footer.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import {
  GITHUB_URL,
  LICENSES_PATH,
  REGISTER_FORM_URL,
  WHALE_URL,
} from 'lib/links';
import { PRIVACY_PATH, TERMS_PATH } from 'lib/legal/document';

const cn = classNames.bind(style);

const Footer = () => {
  return (
    <footer className={cn('footer')}>
      <div className={cn('footer__inner')}>
        <div className={cn('footer__column')}>
          <Logo />
          <div className={cn('footer__desc')}>
            개발자를 위한 행사 정보, 데브이벤트
          </div>
          <div className={cn('footer__copyright')}>
            ⓒ 2022.{' '}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              용감한 친구들 with 남송리 삼번지
            </a>{' '}
            all rights reserved. ·{' '}
            <a href={LICENSES_PATH} target="_blank" rel="noopener noreferrer">
              로고 출처
            </a>
          </div>
          {/* 처리방침 링크는 다른 링크와 구별되게 굵게 둔다(개인정보 처리방침 작성지침) */}
          <div className={cn('footer__legal')}>
            <Link href={TERMS_PATH}>
              <a>이용약관</a>
            </Link>
            <Link href={PRIVACY_PATH}>
              <a className={cn('footer__privacy')}>개인정보 처리방침</a>
            </Link>
          </div>
        </div>
        <div className={cn('footer__row')}>
          <Link href="/about">
            <a className={cn('footer__link')}>데브이벤트 소개</a>
          </Link>
          <a
            className={cn('footer__link')}
            href={REGISTER_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            행사 등록 요청
          </a>
          <a
            className={cn('footer__icon')}
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 34 33"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17 .333C7.792.333.333 7.792.333 17A16.657 16.657 0 0 0 11.73 32.813c.833.145 1.145-.355 1.145-.793 0-.395-.022-1.707-.022-3.103-4.186.771-5.27-1.02-5.603-1.959-.188-.48-1-1.958-1.708-2.355-.584-.311-1.417-1.083-.022-1.103 1.313-.022 2.25 1.208 2.563 1.708 1.5 2.52 3.897 1.812 4.854 1.375.146-1.083.583-1.811 1.063-2.228-3.708-.417-7.583-1.855-7.583-8.23 0-1.813.645-3.312 1.708-4.48-.167-.417-.75-2.125.167-4.417 0 0 1.395-.436 4.583 1.71a15.467 15.467 0 0 1 4.167-.563c1.416 0 2.833.187 4.166.562 3.187-2.167 4.584-1.707 4.584-1.707.916 2.292.333 4 .166 4.417 1.062 1.166 1.709 2.645 1.709 4.478 0 6.397-3.895 7.813-7.604 8.23.604.52 1.125 1.52 1.125 3.083 0 2.229-.021 4.02-.021 4.584 0 .436.313.956 1.146.79A16.694 16.694 0 0 0 33.667 17C33.667 7.792 26.208.333 17 .333Z" />
            </svg>
          </a>
          <a
            className={cn('footer__icon')}
            href={WHALE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="네이버 웨일 확장 프로그램"
          >
            <Image src="/icon/whale.png" alt="" width={24} height={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
