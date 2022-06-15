import classNames from 'classnames/bind';
import style from './Footer.module.scss';

const cn = classNames.bind(style);

function Footer() {
  return <footer className={cn('footer')}>footer</footer>;
}

export default Footer;
