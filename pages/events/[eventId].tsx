import React, { ReactElement, useEffect } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Layout from '../../components/layout';
import style from '../../styles/EventDetail.module.scss';
import router, { useRouter } from 'next/router';
import { useEventDetail } from 'lib/hooks/useSWR';
import EventDetailMoveButton from '../../components/common/buttons/EventDetailMoveButton';
import EventDetailTagButton from "../../components/common/buttons/EventDetailTagButton";

const cn = classNames.bind(style);

// 로딩중

const EventDetail = () => {
  const router = useRouter();
  // const { eventDetail, isError } = useEventDetail(router.query.eventId);
  const { eventDetail, isError } = useEventDetail('1502');
  // {/*{eventDetail && eventDetail.title}*/}

  return (
    <div className={cn('section')}>
      <div className={cn('top_info')}>
        <div className={cn('top_info__image_wrapper')}>
          <Image
            className={cn('top_info__image_wrapper__cover_image')}
            alt="이벤트 이미지"
            src={
              'https://brave-people-3.s3.ap-northeast-2.amazonaws.com/DEVEVENT/2023-10-07-17-29-5567-87e43512.png'
            }
            width={400}
            height={233}
            priority={true}
          />
        </div>
        <div className={cn('top_info__info_wrapper')}>
          <div className={cn('top_info__info_wrapper__host_wrapper')}>
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
              className={cn('top_info__info_wrapper__host_wrapper__host_name')}
            >
              네이버
            </div>
          </div>
          {/* 행사 제목 */}
          <div className={cn('top_info__info_wrapper__event_title')}>백엔드 | 프리온보딩 인턴십 10월</div>
          {/*  북마크 & 공유 버튼 추가 */}
          <div className={cn('top_info__info_wrapper__date_wrapper')}>
            <div
              className={cn('top_info__info_wrapper__date_wrapper__date_type')}
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
    </div>
  );
};

EventDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EventDetail;
