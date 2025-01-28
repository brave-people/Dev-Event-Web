import Footer from './footer/Footer';
import Header from './header/Header';
import Letter from '../features/letter/Letter';

function Layout({ children }: any) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default Layout;
