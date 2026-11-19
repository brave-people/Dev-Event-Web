import StickerDefs from 'components/common/sticker/StickerDefs';
import Footer from './footer/Footer';
import Subscribe from './footer/Subscribe';
import Header from './header/Header';

function Layout({
  children,
  subscribe = true,
}: {
  children: React.ReactNode;
  subscribe?: boolean;
}) {
  return (
    <>
      <StickerDefs />
      <Header />
      {children}
      {subscribe && <Subscribe />}
      <Footer />
    </>
  );
}

export default Layout;
