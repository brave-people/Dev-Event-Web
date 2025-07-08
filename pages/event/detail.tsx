import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Layout from 'components/layout';
import ShareIcon from 'components/icons/ShareIcon';
import BookmarkIcon from 'components/icons/BookmarkIcon';
import style from 'styles/EventDetail.module.scss';
import classNames from 'classnames/bind';
import Letter from '../../components/features/letter/Letter';

const cx = classNames.bind(style);

// Mock 데이터
const mockEventData = {
  id: 1,
  title: '네이버 DEVIEW 2023',
  organizer: 'NAVER',
  date: '2024. 1월 25일(목) 19:30~21:30',
  location: '서울 강남구 테헤란로 521 파르나스타워 EAST 1층 100 직장인토론',
  status: 'recruiting',
  coverImage: '/default/event_img.png',
  tags: ['백엔드', '프론트엔드', '모바일', '클라우드'],
  description: `
    🔥 모집 소개 🔥
    AWSKRUG 재정리차 스프링부트 재업 개발자들의 모임 시리즈의 첫번째 모임입니다.
    호스팅차원 호시자들이 모든 주 개발팀 및 스타트업, 스케일업 등의 바쁜 개발 직장은 되며 매번 새희 지식
    시 연차의 발표기를 만들어 나가는 영역의 점검찾을 준거 봅니다.

    📍 참가지역 🌎
    개발자 토크나잇에 참사하는 분들을 위해 개발 저변 및 플랫폼에 기반하는 기술에 관련하는 분들입니다!

    📍 발표주제 🔥
    주제:
    1. CDC 2024 re:Cap Session
    2. 게임새별 웹게 성장하창 봄애 가이드
    발표자: 한국을 AWS Solutions Architect, Gaming

    📍 행사 일시 🌎
    일시 : 2024년 6월 서일(금요일) 19:00 ~ 21:00
    장소 : 서울 강남구 테헤란로 521 파르나스타워 EAST 1층 100 직장인토론
    * 최대문 인원을 위해 당일 인원파 40명으로 제한됩니다.

    📍 진행순서 🌎
    모임순서
    아이디어 토크
    진행(순은 사이밍)
    언급 원주
    창업 및 네트워킹
    📍 GitHub: AWSKRUG
    https://github.com/awskrug/gametech-group

    📍 OC 아이디어 토크 사회 & 인사회정 👨‍💻
    본 임포의 점검하에 인사된 토크룸 차 게시의 외국 싱경해 주셔, 특히 강의로 괜이 핫모실마다.
    * 게시하고 온전화책, @geoseong, @Youngek Kim, @mooseyoon의 DM 점검 후시겠지.
    AWSKRUG 슬팩 #gametech 채널에 문자 효력죠.

    주제에 따라 토론 인원을 임명하겠 아키걸러 나눈 뒤 시사 어젓 마음딛전되에.

    📍 오프라인 참가 안내
    - AWSKRUG 스크랩은 누군 밤전 될 된전득 직지 저 색일을 위해 7000모번 핀태 반남니다.
    
    * 삼착 받은 여건들
    - 질자성 드물어는 게시하 들으 좌기 딘웝지 직지 사경좌 누산 우저 분들입니다.
    - 질자성 손생 제공이도 우리 다죽 여겼다고 헌료해 분들입니다.
    - 정기 네인 서 신에안때 밤들을 션거신게 재가상과 신대합니다.
    - 전신하신 물러갔이 세움 되야 친번들 공지됩니다.

    📍 AWSKRUG Slack 커뮤니티 참가하기
    스크립트: http://slack.awskr.org/
    지링 스크를 주셨구의 '#gametech' 입니다.

    📍 OC 발표 지원 👨‍💻
    토론 플라미가 나이는 성열하실되 질서정각는 배으는 왕연 마음을 지식해 주시면, 문황이는 토론 그런 분저개 배열하너 소새깔
    다다.
    *우린 좌맏을복을 주 다이어론즈에 공려인의 배에이 간더고 가저좌 조사중이 기물해 호화냈다 가물 크기화치가자 게물 여석나다 
    회향의 역즘짛이 좌맏 게다시 시국발짐 좌우 됮간다고 지길 발발 후 AWSKRUG 올녀에 휘이 크 윗가듸니다.

    📍 긍저치력 😀
    인선일 쮤치 좌있씀 의중 링벅니다.
    권선친 오랍니이로 치섰 의충 북별얻 시포합리다.
  `,
};

const EventDetail: React.FC = () => {
  const router = useRouter();
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleApply = () => {
    setIsApplied(!isApplied);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockEventData.title,
        text: `${mockEventData.organizer}에서 주최하는 ${mockEventData.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    alert(isBookmarked ? '북마크에서 제거되었습니다!' : '북마크에 추가되었습니다!');
  };

  return (
    <>
      <Head>
        <title>{mockEventData.title} | DEV EVENT</title>
        <meta
          name="description"
          content={`${mockEventData.organizer}에서 주최하는 ${mockEventData.title}`}
        />
      </Head>

      <Layout>
        <div className={cx('event-detail')}>
          {/* 데스크톱/태블릿 헤더 영역 */}
          <div className={cx('event-detail__header')}>
            <div className={cx('event-detail__image-section')}>
              <div className={cx('event-detail__image')}>
                <Image
                  src={mockEventData.coverImage}
                  alt={mockEventData.title}
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
                    color={isBookmarked ? "#007AFF" : "var(--gray-2)"} 
                    isFavorite={isBookmarked}
                  />
                </button>
              </div>

              <div className={cx('event-detail__organizer')}>
                <div className={cx('organizer-badge')}>
                  <span>네이버</span>
                </div>
              </div>

              <h1 className={cx('event-detail__title')}>
                {mockEventData.title}
              </h1>

              <div className={cx('event-detail__meta')}>
                <div className={cx('meta-item')}>
                  <span className={cx('meta-label')}>일시</span>
                  <span className={cx('meta-value')}>{mockEventData.date}</span>
                </div>
                <div className={cx('meta-item')}>
                  <span className={cx('meta-label')}>장소</span>
                  <span className={cx('meta-value')}>
                    {mockEventData.location}
                  </span>
                </div>
              </div>

              <div className={cx('event-detail__tags')}>
                {mockEventData.tags.map((tag, index) => (
                  <span key={index} className={cx('event-tag')}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={cx('event-detail__actions')}>
                <button
                  className={cx('apply-btn', { applied: isApplied })}
                  onClick={handleApply}
                >
                  {isApplied ? '신청완료' : '신청하기'}
                </button>
              </div>
            </div>
          </div>

          {/* 행사 상세 내용 */}
          <div className={cx('event-detail__content')}>
            <h2 className={cx('content-title')}>행사 상세</h2>
            <div className={cx('content-description')}>
              {mockEventData.description.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
        <Letter />
      </Layout>
    </>
  );
};

export default EventDetail;
