import Footer from './footer/Footer';
import Header from './header/Header';


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
