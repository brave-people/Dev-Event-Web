import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Layout from 'components/layout';
import ShareIcon from 'components/icons/ShareIcon';
import BookmarkIcon from 'components/icons/BookmarkIcon';
import SaveModal from 'components/common/modal/SaveModal';
import { Event } from 'model/event';
import axiosInstance from 'lib/api/axiosInstance';
import style from 'styles/EventDetail.module.scss';
import classNames from 'classnames/bind';
import Letter from '../../../components/features/letter/Letter';

const cx = classNames.bind(style);

const EventDetail: React.FC = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const [eventData, setEventData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 이벤트 데이터 가져오기
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId || Array.isArray(eventId)) {
        alert('잘못된 접근입니다.');
        router.push('/events');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `${process.env.BASE_SERVER_URL}/front/v1/events/${eventId}`
        );

        if (response.data) {
          setEventData(response.data);
        } else {
          throw new Error('이벤트 데이터가 없습니다.');
        }
      } catch (error: any) {
        console.error('이벤트 데이터 로딩 오류:', error);

        if (error.response?.status === 404 || !error.response) {
          alert('잘못된 접근입니다.');
          router.push('/events');
        } else {
          alert('이벤트 정보를 불러오는데 문제가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      fetchEventData();
    }
  }, [eventId, router]);

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

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    setSaveMessage(
      isBookmarked ? '북마크에서 제거되었습니다.' : '북마크에 추가되었습니다.'
    );
    setShowSaveModal(true);

    // 2초 후 모달 자동 숨김
    setTimeout(() => {
      setShowSaveModal(false);
    }, 2000);
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

  // 로딩 중이거나 데이터가 없는 경우
  if (isLoading) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <p>이벤트 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!eventData) {
    return (
      <Layout>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <p>이벤트 정보를 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{eventData.title} | DEV EVENT</title>
        <meta
          name="description"
          content={`${eventData.organizer}에서 주최하는 ${eventData.title}`}
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
                <div className={cx('organizer-badge')}></div>
                <span className={cx('organizer-text')}>{eventData.organizer}</span>
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
            <h2 className={cx('content-title')}>행사 상세</h2>
            {eventData.description && eventData.description.trim() !== '' ? (
              <div className={cx('content-description')}>
                {eventData.description.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
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
      </Layout>
    </>
  );
};

export default EventDetail;
