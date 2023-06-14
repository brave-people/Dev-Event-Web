import classNames from 'classnames/bind';
import Footer from './footer/Footer';
import Header from './header/Header';
import style from './Layout.module.scss';

const cn = classNames.bind(style);

function Layout({ children }: any) {
  return (
    <div className={cn('container')}>
      <Header />
      <main className={cn('main')}>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
