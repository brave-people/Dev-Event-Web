import classNames from 'classnames/bind';
import Link from 'next/link';
import style from './Footer.module.scss';

const cn = classNames.bind(style);

function Footer() {
  return (
    <footer className={cn('footer')}>
      <span>
        {' '}
        ⓒ 2022.{' '}
        <Link href="https://github.com/brave-people">
          <a target="_blank">용감한 친구들 with 남송리 삼번지</a>
        </Link>{' '}
        all rights reserved.
      </span>
    </footer>
  );
}

export default Footer;
