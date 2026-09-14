import React, { useState, useContext, useMemo } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { marked } from 'marked';
import Layout from 'components/layout';
import ShareIcon from 'components/icons/ShareIcon';
import BookmarkIcon from 'components/icons/BookmarkIcon';
import CalendarExportButton from 'components/common/calendar-export/CalendarExportButton';
import DdayTag from 'components/common/tag/DdayTag';
import FilterTag from 'components/common/tag/FilterTag';
import LoginModal from 'components/common/modal/LoginModal';
import { useToast } from 'context/toast';
import { Event } from 'model/event';
import { AuthContext } from 'context/auth';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import { useMyEvent } from 'lib/hooks/useSWR';
import {
  buildEventMetaDescription,
  buildEventPlaceholderSummary,
  getEventOgImage,
  getEventPageTitle,
} from 'lib/seo/eventMeta';
import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  serializeJsonLd,
} from 'lib/seo/jsonLd';
import { eventDetailUrl } from 'lib/seo/site';
import { formatEventPeriod, getEventTimeLabel } from 'lib/utils/eventDate';
import * as ga from 'lib/utils/gTag';
import { mutate } from 'swr';
import style from 'styles/EventDetail.module.scss';
import classNames from 'classnames/bind';
import Letter from '../../../components/features/letter/Letter';

const cx = classNames.bind(style);

const CACHE_CONTROL_DETAIL =
  'public, s-maxage=3600, stale-while-revalidate=86400';
const CACHE_CONTROL_NOT_FOUND =
  'public, s-maxage=60, stale-while-revalidate=300';

interface EventDetailProps {
  eventData: Event;
}

const isEventDone = (endDate: string): boolean => {
  return new Date(endDate).getTime() < Date.now();
};

const EventDetail: React.FC<EventDetailProps> = ({ eventData }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const { pushToast } = useToast();

  const eventDone = isEventDone(eventData.end_date_time);

  const param = { filter: '' };
  const { myEvent } = useMyEvent(param, isLoggedIn);

  // 마크다운을 HTML로 변환
  const descriptionHtml = useMemo(() => {
    if (!eventData.description) return '';
    return marked(eventData.description, {
      breaks: true, // 줄바꿈을 <br>로 변환
      gfm: true, // GitHub Flavored Markdown 지원
    });
  }, [eventData.description]);

  // 북마크 상태 확인
  const getFavoriteId = (id: string) => {
    const favoriteEvent = myEvent?.find((item) => item.dev_event.id === id);
    return favoriteEvent?.favorite_id || 0;
  };

  const isBookmarked = eventData ? getFavoriteId(eventData.id) !== 0 : false;

  const pageTitle = getEventPageTitle(eventData);
  const description = buildEventMetaDescription(eventData);
  const ogImage = getEventOgImage(eventData);
  const canonical = eventDetailUrl(eventData.id);
  const eventJsonLd = buildEventJsonLd(eventData);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(eventData);

  const handleShare = async () => {
    if (!eventData) return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast('링크가 복사되었어요');
    } catch (err) {
      console.error(err);
      pushToast('링크 복사에 실패했어요');
    }
  };

  const handleBookmark = async () => {
    if (!eventData) return;

    // 로그인하지 않은 경우 로그인 모달 표시
    if (!isLoggedIn) {
      setLoginModalIsOpen(true);
      return;
    }

    if (!myEvent) return;

    try {
      const favoriteId = getFavoriteId(eventData.id);

      if (favoriteId === 0) {
        // 북마크 추가
        const filteredEvent = myEvent.concat({
          favorite_id: 0,
          dev_event: eventData,
        });
        mutate([`/front/v1/favorite/events`, param], filteredEvent, false);

        await createMyEventApi(`/front/v1/favorite/events/${eventData.id}`, {
          eventId: Number(eventData.id),
        });

        ga.event({
          action: 'web_event_관심행사추가버튼클릭',
          event_category: 'web_event',
          event_label: '관심행사',
        });

        pushToast('북마크에 추가되었어요');
      } else {
        // 북마크 삭제
        const filteredEvent = myEvent.filter(
          (event) => event.favorite_id !== favoriteId
        );
        mutate([`/front/v1/favorite/events`, param], [...filteredEvent], false);

        await deleteMyEventApi(`/front/v1/favorite/events/${favoriteId}`, {
          favoriteId: favoriteId,
        });

        ga.event({
          action: 'web_event_관심행사삭제버튼클릭',
          event_category: 'web_event',
          event_label: '관심행사',
        });

        pushToast('북마크에서 제거되었어요');
      }

      // SWR 캐시 갱신
      mutate([`/front/v1/favorite/events`, param]);
    } catch (error) {
      console.error('북마크 처리 오류:', error);
      pushToast('처리 중 오류가 발생했어요');
    }
  };

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
        <div className={cx('event-detail')}>
          {/* 이벤트 헤더 영역 */}
          <div className={cx('event-detail__header')}>
            <div className={cx('event-detail__image-section')}>
              <div className={cx('event-detail__image')}>
                <Image
                  src={
                    eventData.cover_image_link ||
                    '/default/event-thumbnail-light.png'
                  }
                  alt={eventData.title}
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
                {eventDone && (
                  <div className={cx('event-detail__image__done')} />
                )}
                {!eventDone && (
                  <div className={cx('event-detail__image__badge')}>
                    <DdayTag
                      startDateTime={eventData.start_date_time}
                      endDateTime={eventData.end_date_time}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={cx('event-detail__info-section')}>
              {/* 공유/캘린더/북마크 아이콘 */}
              <div className={cx('event-detail__header-actions')}>
                <button className={cx('icon-btn')} onClick={handleShare}>
                  <ShareIcon color="var(--vapor-gray-500)" />
                </button>
                <CalendarExportButton event={eventData} />
                <button className={cx('icon-btn')} onClick={handleBookmark}>
                  <BookmarkIcon
                    color={
                      isBookmarked
                        ? 'var(--ktb-tech-blue)'
                        : 'var(--vapor-gray-500)'
                    }
                    isFavorite={isBookmarked}
                  />
                </button>
              </div>

              <div className={cx('event-detail__organizer')}>
                {/* 주최 뱃지 비활성화 */}
                {/*<div className={cx('organizer-badge')}></div>*/}
                <span className={cx('organizer-text')}>
                  {eventData.organizer}
                </span>
              </div>

              <h1 className={cx('event-detail__title')}>{eventData.title}</h1>

              <div className={cx('event-detail__meta')}>
                <div className={cx('meta-item')}>
                  <span className={cx('meta-label')}>
                    {getEventTimeLabel(eventData.event_time_type)}
                  </span>
                  <span className={cx('meta-value')}>
                    {formatEventPeriod(eventData)}
                  </span>
                </div>
              </div>

              <div className={cx('event-detail__tags')}>
                {eventData.tags?.map((tag, index) => (
                  <FilterTag
                    key={index}
                    label={tag.tag_name}
                    size="regular"
                    type="location"
                  />
                ))}
              </div>

              <div className={cx('event-detail__actions')}>
                <a
                  href={eventData.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx('apply-btn')}
                >
                  참여하기
                </a>
              </div>
            </div>
          </div>

          {/* 행사 상세 내용 */}
          <div className={cx('event-detail__content')}>
            {eventData.description && eventData.description.trim() !== '' ? (
              <div
                className={cx('content-description')}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : (
              <div className={cx('content-placeholder')}>
                <div className={cx('placeholder-message')}>
                  <p>{buildEventPlaceholderSummary(eventData)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <Letter />
        <LoginModal
          isOpen={loginModalIsOpen}
          onClose={() => setLoginModalIsOpen(false)}
        />
      </Layout>
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

    // 서버에서 API 호출
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

    return {
      props: {
        eventData,
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
