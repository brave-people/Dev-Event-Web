import classNames from 'classnames/bind';
import style from './Footer.module.scss';
import Logo from 'components/common/logo/Logo';
import { GithubIcon, NaverWhaleIcon } from 'components/icons';
import Link from 'next/link';

const cn = classNames.bind(style);

function Footer() {
  return (
    <footer className={cn('footer')}>
      <div className={cn('footer__column')}>
        <Logo />
        <div className={cn('footer__desc')}>
          개발자를 위한 행사 정보, 데브이벤트
        </div>
        <div className={cn('footer__copyright')}>
          ⓒ 2022. 용감한 친구들 with 남송리 삼번지 all rights reserved.
        </div>
      </div>
      <div className={cn('footer__row')}>
        <Link href={"https://github.com/brave-people"}>
          <a target='_blank'>
            <GithubIcon
              className='github__icon'
            />
          </a>
        </Link>
        <Link href={"/event"}>
          <a target='_blank'>
            <NaverWhaleIcon />
          </a>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
