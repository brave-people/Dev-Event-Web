import type { ReactElement } from 'react';
import Head from 'next/head';

import Layout from 'components/layout/index';
import LegalDocumentView from 'components/legal/LegalDocumentView';
import { PRIVACY } from 'lib/legal/privacy';
import { SITE_NAME, SITE_URL } from 'lib/seo/site';

const PAGE_URL = `${SITE_URL}${PRIVACY.path}`;

const Privacy = () => (
  <>
    <Head>
      <title>{`${PRIVACY.title} | ${SITE_NAME}`}</title>
      <meta name="description" content={PRIVACY.description} />
      <link rel="canonical" href={PAGE_URL} />
      <meta property="og:title" content={`${PRIVACY.title} | ${SITE_NAME}`} />
      <meta property="og:description" content={PRIVACY.description} />
      <meta property="og:url" content={PAGE_URL} />
    </Head>
    <LegalDocumentView doc={PRIVACY} />
  </>
);

Privacy.getLayout = function getLayout(page: ReactElement) {
  return <Layout subscribe={false}>{page}</Layout>;
};

export default Privacy;
