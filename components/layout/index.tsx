import classNames from 'classnames/bind';
import Footer from './footer/Footer';
import Header from './header/Header';

function Layout({ children }: any) {
  return (
    <>
      <Header />
        <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
