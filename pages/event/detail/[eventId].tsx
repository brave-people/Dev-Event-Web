import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from 'components/layout';
import EventDetailView from 'components/events/detail/EventDetailView';
import { MobileApplyBarSpace } from 'components/events/detail/MobileApplyBar';
import { Event } from 'model/event';
import {
  buildEventMetaDescription,
  getEventOgImage,
  getEventPageTitle,
} from 'lib/seo/eventMeta';
import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  serializeJsonLd,
} from 'lib/seo/jsonLd';
import { eventDetailUrl } from 'lib/seo/site';
import { pickRelated, RelatedPick } from 'lib/utils/detail/related';
import { flattenEvents } from 'lib/utils/timeline/groupByDay';
import { toKstNaive } from 'lib/utils/timeline/kst';

const CACHE_CONTROL_DETAIL =
  'public, s-maxage=3600, stale-while-revalidate=86400';
const CACHE_CONTROL_NOT_FOUND =
  'public, s-maxage=60, stale-while-revalidate=300';

interface EventDetailProps {
  eventData: Event;
  related: RelatedPick | null;
  now: string;
}

const RELATED_TIMEOUT_MS = 3000;

// 같은 날 다른 행사를 고를 목록. 실패하거나 늦으면 빈 목록(상세는 영향 없음)
const fetchCandidates = async (): Promise<Event[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RELATED_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v2/events/current`,
      { signal: controller.signal }
    );
    if (!res.ok) return [];
    return flattenEvents(await res.json());
  } catch (error) {
    console.error('같은 날 행사 목록 조회 오류:', error);
    return [];
  } finally {
    clearTimeout(timer);
  }
};

const EventDetail: React.FC<EventDetailProps> = ({
  eventData,
  related,
  now,
}) => {
  const pageTitle = getEventPageTitle(eventData);
  const description = buildEventMetaDescription(eventData);
  const ogImage = getEventOgImage(eventData);
  const canonical = eventDetailUrl(eventData.id);
  const eventJsonLd = buildEventJsonLd(eventData);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(eventData);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(breadcrumbJsonLd),
          }}
        />
        {eventJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(eventJsonLd) }}
          />
        )}
      </Head>

      <Layout>
        <EventDetailView
          key={eventData.id}
          event={eventData}
          related={related}
          now={now}
        />
      </Layout>
      <MobileApplyBarSpace />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.params!;

  // eventId 유효성 검사
  if (!eventId || Array.isArray(eventId)) {
    context.res.setHeader('Cache-Control', CACHE_CONTROL_NOT_FOUND);
    return {
      notFound: true,
    };
  }

  try {
    context.res.setHeader('Cache-Control', CACHE_CONTROL_DETAIL);

    // 서버에서 API 호출 (행사 한 건과 같은 날 후보 목록을 함께).
    // 목록 조회는 reject하지 않으므로, 404·오류로 기다리지 않고 버려도 안전하다
    const candidatesPromise = fetchCandidates();
    const response = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v1/events/${eventId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        context.res.setHeader('Cache-Control', CACHE_CONTROL_NOT_FOUND);
        return {
          notFound: true,
        };
      }
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const eventData = await response.json();

    if (!eventData) {
      context.res.setHeader('Cache-Control', CACHE_CONTROL_NOT_FOUND);
      return {
        notFound: true,
      };
    }

    const candidates = await candidatesPromise;
    const now = toKstNaive(Date.now());
    let related: RelatedPick | null = null;
    try {
      related = pickRelated(eventData, candidates, now);
    } catch (error) {
      console.error('같은 날 행사 선별 오류:', error);
    }

    return {
      props: {
        eventData,
        related,
        now,
      },
    };
  } catch (error) {
    console.error('서버사이드 데이터 페칭 오류:', error);
    context.res.setHeader('Cache-Control', CACHE_CONTROL_NOT_FOUND);
    return {
      notFound: true,
    };
  }
};

export default EventDetail;
