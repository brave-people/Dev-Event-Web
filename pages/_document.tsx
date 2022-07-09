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
            property="og:image"
            content="https://drive.google.com/uc?export=download&id=1-Jqapt5h4XtxXQbgX07kI3ipgk3V6ESE"
          />
          <meta property="og:title" content="Dev Event" />
          <meta property="og:description" content="개발자 {웨비나, 컨퍼런스, 해커톤} 행사를 알려드립니다." />
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
