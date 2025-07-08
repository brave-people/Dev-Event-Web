import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Layout from 'components/layout';
import ShareIcon from 'components/icons/ShareIcon';
import BookmarkIcon from 'components/icons/BookmarkIcon';
import { AuthContext } from 'context/auth';
import style from 'styles/EventDetail.module.scss';
import classNames from 'classnames/bind';
import Letter from '../../components/features/letter/Letter';

const cx = classNames.bind(style);

// Mock 데이터
const mockEventData = {
  id: 1,
  title: '네이버 DEVIEW 2023',
  organizer: 'NAVER',
  date: '1월 28일(목) 19:30~21:30',
  location: '서울 강남구 테헤란로 521 파르나스타워 EAST 1층 100 직장인토론',
  status: 'recruiting',
  coverImage: '/default/event_img.png',
  tags: ['백엔드', '프론트엔드', '모바일', '클라우드'],
  description: `
저는 h1입니다.

Kakao Tech Meet은 작년부터 이어온 카카오의 공개 기술 세미나입니다. 올해에도 계속 최신 기술 트렌드와 경험 및 노하우를 자주, 지속적으로 공유하며 개발자 여러분과 함께 성장을 도모하고 긴밀한 네트워크를 형성하고자 합니다.

여섯 번째 Kakao Tech Meet에서는 클린 플랫폼을 만드는 기술을 주제로 스팸 이미지, 스팸 텍스트, 스팸 메일을 대응하기 위한 경험과 노하우를 공유합니다. 또한 발표에서 못다 한 질문과 이야기를 나눌 수 있도록 패널토의를 진행합니다.

판교역에 연결된 카카오 아지트에서 열리는 이번 기술 세미나에 많은 관심과 참여 부탁드립니다. 앞으로도 카카오는 개발자 커뮤니티의 일원으로서, 개발자 커뮤니티와 함께 성장하기 위해서 꾸준히 노력하겠습니다.

저는 h2입니다.

6월 13일(목) 19:00 - 21:30 (18:30부터 입장 가능합니다)

저는 h3입니다.

카카오판교아지트, 4층 스위치온2 / 신분당선 판교역 4번 출구
(경기 성남시 분당구 판교역로 166)

저는 h4입니다.

* 오프라인 참석자에게는 행사장 입장을 위한 '웰컴패스'를 카카오톡으로 보내 드립니다.
   festa에 등록한 휴대폰 번호가 정확한지 확인해 주세요.
* 온라인 라이브 스트리밍을 제공하며, 접속 정보는 행사 전 안내 드릴 예정입니다.

(1) 카카오의 스팸 메일 대응 전략: 문자열 변형 CASE STUDY

스팸 메일은 다양한 형태로 존재합니다.

그중 우리는 스팸 검사를 회피하기 위해 의도적으로 문자열을 깨뜨려 들어오는 경우를 집중적으로 살펴보면서, 문자 인코딩 등의 이야기를 나누며 어떻게 대응했는지 경험을 공유합니다.

카카오가 어떻게 스팸 메일 필터링을 수행하고 있는지에 대해 궁금한 분들에게 추천합니다.

#MAIL #Text #Encoding

발표자: 이소민(laura.0326)

클린플랫폼에서 스팸 메일 필터링 업무를 맡고 있습니다. 다양한 것을 경험하는 걸 좋아합니다.

(2) 이미지 기반 스팸 대응을 위한 카카오의 AI 기술 활용

스팸 이미지 분류를 하기 위해 시도했던 다양한 경험을 공유합니다.

2018년부터 스팸성 이미지 대응 업무에 ML/DL을 도입해온 과정에서, 다양한 문제를 만나고 이를 해결해 가는 과정에서 쌓은 경험을 공유합니다.

다양한 업무 영역에서 ML/DL 도입을 위해 고민하는 개발자에게 추천합니다.

#AI #ML #DL

발표자: 오창화(herschel.alway)

어쩌다 보니 세월의 흐름에 이끌려 백엔드 개발에서 스팸 관련한 AI 연구도 같이 하고 있는 개발자입니다.

(3) 스팸 콘텐츠 대응을 위한 카카오의 대규모 언어 모델(LLM) 도입 사례

문자(text) 스팸 콘텐츠를 효과적으로 분류하기 위해 LLM을 활용한 경험을 소개합니다.

기존의 규칙 기반(Rule-Base) 스팸 콘텐츠에 LLM을 적용한 배경을 설명합니다.

스팸을 단순히 분류하는 것을 넘어, 스팸으로 판정된 이유를 설명하는 LLM의 학습 과정을 소개하고 그 과정에서 발생한 시행착오와 이를 해결한 방법도 함께 공유합니다.

특히, '스팸' 분야에서 LLM을 어떤 방식으로 활용할 수 있는지에 대한 실전 경험을 중점적으로 다룹니다.

스팸 탐지에 관심 있는 누구나, 특정 도메인에 LLM을 적용해 보고 싶은 개발자에게 추천합니다.

#AI #LLM #SpamDetection #TextClassification #TextGeneration

목차

•스팸 분류를 위한 LLM 도입 배경

•스팸 도메인 LLM 학습 과정 중 챌린지와 해결 방법

발표자: 조혜연(zoey.fully)

카카오의 다양한 서비스로 유입되는 콘텐츠에서 스팸을 분류하는 업무를 맡고 있습니다. AI 기반의 스팸 분류 기술을 연구하고 있습니다.

★ 안내

- 공간 제약상, 오프라인 참여를 신청해 주신 분들 중 일부만 초대 드리는 점 양해 부탁드립니다.

- 행사 안내는 카카오톡으로 제공됩니다.
  (등록하신 휴대폰 번호가 정확하지 않거나 카카오톡과 연결되지 않은 경우, 안내드리기 어렵습니다.)
- 오프라인 참석이 선정된 분들께는 6/5(수) 이후, 카카오톡으로 안내 드릴 예정입니다.

- 온라인 라이브를 통해 모든 분들이 참여하실 수 있습니다. 행사 전 접속 정보를 안내 드릴 예정입니다.

- 발표 세션의 녹화 영상은 행사 종료 후 제공드릴 예정입니다.
  (유튜브 @kakaotech 및 기술 블로그 tech.kakao.com). 발표자료는 제공되지 않습니다.
- 간단한 다과와 기념품을 드립니다. 식사는 별도로 제공하지 않습니다.

문의

tech@kakaocorp.com

장소

카카오판교아지트, 4층 스위치온2

경기 성남시 분당구 판교역로 166

지하철을 이용하실 경우, 판교역 4번 출구 옆의 지하통로를 이용하시면 편리합니다. 오프라인 참석자분들께는 행사장 입장을 위한 '웰컴패스'를 카카오톡으로 보내 드립니다.
  `,
};

const EventDetail: React.FC = () => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);

  // 디버깅: 로그인 상태 확인
  useEffect(() => {
    console.log('EventDetail - isLoggedIn:', isLoggedIn);
    
    // 추가로 API 직접 호출해서 확인
    const checkAuthDirect = async () => {
      try {
        const response = await fetch('/api/checkAuth', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        console.log('EventDetail - API 응답:', data);
      } catch (error) {
        console.error('EventDetail - API 호출 오류:', error);
      }
    };
    
    checkAuthDirect();
  }, [isLoggedIn]);

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
          {/* 이벤트 헤더 영역 */}
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
              </div>

              <div className={cx('event-detail__tags')}>
                {mockEventData.tags.map((tag, index) => (
                  <span key={index} className={cx('event-tag')}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={cx('event-detail__actions')}>
                <a
                  href="https://festa.io/events/1234"
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
