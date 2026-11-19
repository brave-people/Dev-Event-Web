import type { ReactElement } from 'react';
import Head from 'next/head';

import Layout from 'components/layout/index';
import LegalDocumentView from 'components/legal/LegalDocumentView';
import { TERMS } from 'lib/legal/terms';
import { SITE_NAME, SITE_URL } from 'lib/seo/site';

const PAGE_URL = `${SITE_URL}${TERMS.path}`;

const Terms = () => (
  <>
    <Head>
      <title>{`${TERMS.title} | ${SITE_NAME}`}</title>
      <meta name="description" content={TERMS.description} />
      <link rel="canonical" href={PAGE_URL} />
      <meta property="og:title" content={`${TERMS.title} | ${SITE_NAME}`} />
      <meta property="og:description" content={TERMS.description} />
      <meta property="og:url" content={PAGE_URL} />
    </Head>
    <LegalDocumentView doc={TERMS} />
  </>
);

Terms.getLayout = function getLayout(page: ReactElement) {
  return <Layout subscribe={false}>{page}</Layout>;
};

export default Terms;
