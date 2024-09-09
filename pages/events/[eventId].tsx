import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Layout from '../../components/layout';
import style from '../../styles/EventDetail.module.scss';
import router, { useRouter } from 'next/router';
import EventDetailMoveButton from '../../components/common/buttons/EventDetailMoveButton';
import EventDetailTagButton from '../../components/common/buttons/EventDetailTagButton';
import { BookmarkIcon, ShareIcon } from '../../components/icons';
import Letter from '../../components/features/letter/Letter';
import { GetServerSideProps } from 'next';
import { Event } from '../../model/event';

const cn = classNames.bind(style);

// 서버 사이드 랜더링

const EventDetail = (eventDetail: Event) => {
  const router = useRouter();
  // const { eventDetail, isError } = useEventDetail(router.query.eventId);
  // const { eventDetail, isError } = useEventDetail('1502');
  // console.log(eventDetail);
  // {/*{eventDetail && eventDetail.title}*/}

  console.log(eventDetail);

  return (
    <>
      <div className={cn('section')}>
        <div className={cn('top_info')}>
          <div className={cn('top_info__image_wrapper')}>
            <Image
              className={cn('top_info__image_wrapper__cover_image')}
              alt="이벤트 이미지"
              src={'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEVEVENT/2023-10-07-17-29-5567-87e43512.png'}
              width={400}
              height={233}
              priority={true}
            />
          </div>
          <div className={cn('top_info__info_wrapper')}>
            <div className={cn('top_info__info_wrapper__host_wrapper')}>
              <div className={cn('wrap')}>
                <Image
                  className={cn(
                    'top_info__info_wrapper__host_wrapper__host_image_wrapper'
                  )}
                  alt="주최"
                  src={
                    'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEVEVENT/2023-10-07-17-29-5567-87e43512.png'
                  }
                  width={32}
                  height={32}
                />
                <div
                  className={cn(
                    'top_info__info_wrapper__host_wrapper__host_name'
                  )}
                >
                  네이버
                </div>
              </div>
              {/* 공유하기 & 저장 */}
              <div className={cn('top_info__info_wrapper__button_wrapper')}>
                <button
                  className={cn(
                    `top_info__info_wrapper__button_wrapper__buttons`,
                    `share-button`,
                    'laptop'
                  )}
                >
                  <ShareIcon
                    color="rgba(171, 172, 178, 1)"
                    className="button"
                  />
                </button>
                <button
                  className={cn(
                    `top_info__info_wrapper__button_wrapper__buttons`,
                    'like-button',
                    'laptop'
                  )}
                  // onClick={onClickFavorite}
                >
                  <BookmarkIcon
                    color="rgba(171, 172, 178, 1)"
                    className="button"
                    isFavorite={true}
                  />
                </button>
              </div>
            </div>

            {/* 행사 제목 */}
            <div className={cn('top_info__info_wrapper__event_title')}>
              백엔드 | 프리온보딩 인턴십 10월 10월 10월 10월 10월 10월 10월 10월
              10월 10월 10월
            </div>
            {/*  북마크 & 공유 버튼 추가 */}
            <div className={cn('top_info__info_wrapper__date_wrapper')}>
              <div
                className={cn(
                  'top_info__info_wrapper__date_wrapper__date_type'
                )}
              >
                일시
              </div>
              <div className={cn('top_info__info_wrapper__date_wrapper__date')}>
                2024. 07. 23 ~ 20204. 07. 25 23:30
              </div>
            </div>
            <div className={cn('top_info__tag_wrapper')}>
              <EventDetailTagButton tagName={'태그1'} />
              <EventDetailTagButton tagName={'태그2'} />
            </div>
            <div className={cn('button_wrapper')}>
              <EventDetailMoveButton />
            </div>
          </div>
        </div>
        {/* = 상단 끝 */}
        <div className={cn('test')}>
          ■ 대회명 : 2024 블록체인 경진대회 「BEST Challenge」 <br />
          ■ 주최/주관 : 과학기술정보통신부/한국인터넷진흥원 <br />
          ■ 후원사 : LG CNS, LG 사이언스파크, SK텔레콤, 라온시큐어,
          리드포인트시스템, 블로코, 씨피랩스, 에스앤피랩, 유라클, 지크립토,
          파라메타 <br />
          ■ 신청기간 : 2024년 6월 14일(금) ~ 7월 23일(화) 14:00 <br />
          ■ 대회분야 : 블록체인 아이디어톤 <br />
          ■ 주제 : 블록체인 기술을 활용한 혁신적인 서비스 아이디어 제시 <br />■
          참가자격 : 블록체인에 관심 있는 누구나(개인 또는 5인 이내 팀구성){' '}
          <br />
          ■ 문제 예시 : DID를 활용한 배지서비스 등 <br />※ 금융분야 외
          타분야에서 활용할 수 있는 블록체인 서비스 아이디어 제시 <br />
        </div>
      </div>
      <Letter />
    </>
  );
};

EventDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id  } = context.params.eventId;
  const res = await fetch(
    `${process.env.BASE_SERVER_URL}/front/v1/events/${id}`
  );
  const event = await res.json();
  return {
    props: { event: event },
  };
};

export default EventDetail;
