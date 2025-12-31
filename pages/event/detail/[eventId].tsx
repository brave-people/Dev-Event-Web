import React, { useState, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { marked } from 'marked';
import Layout from 'components/layout';
import ShareIcon from 'components/icons/ShareIcon';
import BookmarkIcon from 'components/icons/BookmarkIcon';
import SaveModal from 'components/common/modal/SaveModal';
import LoginModal from 'components/common/modal/LoginModal';
import { Event } from 'model/event';
import { AuthContext } from 'context/auth';
import { createMyEventApi } from 'lib/api/post';
import { deleteMyEventApi } from 'lib/api/delete';
import { useMyEvent } from 'lib/hooks/useSWR';
import * as ga from 'lib/utils/gTag';
import { mutate } from 'swr';
import style from 'styles/EventDetail.module.scss';
import classNames from 'classnames/bind';
import Letter from '../../../components/features/letter/Letter';

const cx = classNames.bind(style);

interface EventDetailProps {
  eventData: Event;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventData }) => {
  const router = useRouter();
  const { isLoggedIn } = useContext(AuthContext);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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

  // 북마크 모달 표시 헬퍼 함수
  const showBookmarkMessage = (message: string) => {
    setSaveMessage(message);
    setShowSaveModal(true);
    setTimeout(() => {
      setShowSaveModal(false);
    }, 2000);
  };

  const handleShare = () => {
    if (!eventData) return;

    if (navigator.share) {
      navigator.share({
        title: eventData.title,
        text: `${eventData.organizer}에서 주최하는 ${eventData.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
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

        showBookmarkMessage('북마크에 추가되었습니다.');
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

        showBookmarkMessage('북마크에서 제거되었습니다.');
      }

      // SWR 캐시 갱신
      mutate([`/front/v1/favorite/events`, param]);
    } catch (error) {
      console.error('북마크 처리 오류:', error);
      showBookmarkMessage('처리 중 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷팅 함수
  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const startWeekday = ['일', '월', '화', '수', '목', '금', '토'][
      start.getDay()
    ];
    const startTime = start.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = end.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${startMonth}월 ${startDay}일(${startWeekday}) ${startTime}~${endTime}`;
  };

  return (
    <>
      <Head>
        <title>{eventData.title} | DEV EVENT</title>
        <meta
          name="description"
          content={`${eventData.organizer}에서 주최하는 ${eventData.title}`}
        />
        <meta property="og:title" content={`${eventData.title} | DEV EVENT`} />
        <meta
          property="og:description"
          content={`${eventData.organizer}에서 주최하는 ${eventData.title}`}
        />
        <meta
          property="og:image"
          content={eventData.cover_image_link || '/default/event_img.png'}
        />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/event/detail/${eventData.id}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${eventData.title} | DEV EVENT`} />
        <meta
          name="twitter:description"
          content={`${eventData.organizer}에서 주최하는 ${eventData.title}`}
        />
        <meta
          name="twitter:image"
          content={eventData.cover_image_link || '/default/event_img.png'}
        />
      </Head>

      <Layout>
        <div className={cx('event-detail')}>
          {/* 이벤트 헤더 영역 */}
          <div className={cx('event-detail__header')}>
            <div className={cx('event-detail__image-section')}>
              <div className={cx('event-detail__image')}>
                <Image
                  src={eventData.cover_image_link || '/default/event_img.png'}
                  alt={eventData.title}
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
              </div>
            </div>

            <div className={cx('event-detail__info-section')}>
              {/* 공유/북마크 아이콘 */}
              <div className={cx('event-detail__header-actions')}>
                <button className={cx('icon-btn')} onClick={handleShare}>
                  <ShareIcon color="var(--gray-2)" />
                </button>
                <button className={cx('icon-btn')} onClick={handleBookmark}>
                  <BookmarkIcon
                    color={isBookmarked ? '#007AFF' : 'var(--gray-2)'}
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
                  <span className={cx('meta-label')}>일시</span>
                  <span className={cx('meta-value')}>
                    {formatEventDate(
                      eventData.start_date_time,
                      eventData.end_date_time
                    )}
                  </span>
                </div>
              </div>

              <div className={cx('event-detail__tags')}>
                {eventData.tags?.map((tag, index) => (
                  <span key={index} className={cx('event-tag')}>
                    {tag.tag_name}
                  </span>
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
                  <p>행사 상세 내용은 준비중입니다.</p>
                  <p>'참여하기' 버튼을 눌러서 상세 내용을 확인해주세요.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <Letter />
        <SaveModal isVisible={showSaveModal} message={saveMessage} />
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
    return {
      notFound: true,
    };
  }

  try {
    // 서버에서 API 호출
    const response = await fetch(
      `${process.env.BASE_SERVER_URL}/front/v1/events/${eventId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          notFound: true,
        };
      }
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const eventData = await response.json();

    if (!eventData) {
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
    return {
      notFound: true,
    };
  }
};

export default EventDetail;
