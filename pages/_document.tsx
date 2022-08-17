import Document, { DocumentContext, DocumentInitialProps, Html, Head, Main, NextScript } from 'next/document';
import { GA_TRACKING_ID } from 'lib/utils/gTag';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="데브이벤트 웹에서 개발자 행사를 놓치지 마세요! 개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다."
          />
          <meta
            name="keywords"
            content="데브이벤트 웹, Dev Event, 데브이벤트, 개발자 행사, 용감한 친구들, Web, 웹, 개발자, 이벤트, 행사, 웨비나, 컨퍼런스, 해커톤, 네트워킹, IT"
          />
          <meta
            property="og:image"
            content="https://drive.google.com/uc?export=download&id=1-Jqapt5h4XtxXQbgX07kI3ipgk3V6ESE"
          />
          <meta property="og:title" content="Dev Event - 개발자 행사는 모두 데브이벤트 웹에서!" />
          <meta
            property="og:description"
            content="개발자를 위한 {웨비나, 컨퍼런스, 해커톤, 네트워킹} 소식을 알려드립니다."
          />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Dev Event" />
          <meta name="google-site-verification" content="nuMWgo5LJBkwv_VMLcsP3dS6eHzyyGcxKvnwVY9p5Vk" />
          <meta name="naver-site-verification" content="846c898c7464c31de7f1d43f7c8d6aabab12daf1" />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
