import Document, { DocumentContext, DocumentInitialProps, Html, Head, Main, NextScript } from 'next/document';
// import Script from 'next/script';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <Head>
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Dev Event" />
          <meta name="google-site-verification" content={`${process.env.GOOGLE_SITE_VERIFICATION}`} />
          <meta name="naver-site-verification" content={`${process.env.NAVER_SITE_VERIFICATION}`} />
          <link rel="canonical" href="https://dev-event.vercel.app" />
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
          {/* <Script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchemaJsonObject) }}
          /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// const navigationSchemaJsonObject = {
//   '@context': 'https://dev-event.vercel.app',
//   '@type': 'ItemList',
//   itemListElement: [
//     {
//       '@type': 'SiteNavigationElement',
//       position: 1,
//       name: '개발자 행사',
//       description: '...',
//       url: 'https://www.your-web-service.com',
//     },
//     {
//       '@type': 'SiteNavigationElement',
//       position: 2,
//       name: '오프라인 행사',
//       description: '...',
//       url: `https://www.your-web-service.com/products`,
//     },
//   ],
// };

export default MyDocument;
