import Logo from 'components/common/logo/Logo';
import { GithubIcon } from 'components/icons';
import style from 'components/layout/footer/Footer.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';

const cn = classNames.bind(style);

function Footer() {
  return (
    <footer className={cn('footer')}>
      <div className={cn('footer__column')}>
        <Logo />
        <div className={cn('footer__desc')}>개발자를 위한 행사 정보, 데브이벤트</div>
        <div className={cn('footer__copyright')}>
          ⓒ 2022. 용감한 친구들 with 남송리 삼번지
          <br className={cn('break__line')} />
          all rights reserved.
        </div>
      </div>
      <div className={cn('footer__row')}>
        <Link href={'https://github.com/brave-people/Dev-Event'}>
          <a target="_blank">
            <GithubIcon className="github__icon" />
          </a>
        </Link>
        <Link href={'https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek'}>
          <a target="_blank">
            <Image src={'/icon/whale.png'} alt="naver whale extension" width={36} height={36} />
          </a>
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
