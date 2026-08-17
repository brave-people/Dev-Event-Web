import style from 'components/common/item/Item.module.scss';
import DdayTag from 'components/common/tag/DdayTag';
import FilterTag from 'components/common/tag/FilterTag';
import {
  BookmarkIcon,
  BookmarkIconMobile,
  ShareIcon,
  ShareIconMobile,
} from 'components/icons';
import { EventContext } from 'context/event';
import { getHostIdFromEvent, pushHostDetail } from 'lib/host/hostLink';
import { useEventHostLogo } from 'lib/host/useEventHostLogo';
import ChevronRightIcon from 'components/icons/ChevronRightIcon';
import { useToast } from 'context/toast';
import { DateUtil } from 'lib/utils/dateUtil';
import { eventThumbnail } from 'lib/utils/eventThumbnail';
import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

const DateType = {
  dateTime: 'dateTime',
  date: 'date',
  time: 'time',
};

const shortenYear = (s: string | undefined): string => {
  if (!s) return '';
  return s.replace(/\b(?:19|20)(\d{2})/g, '$1');
};

type Props = {
  data: Event;
  isEventDone: () => boolean;
  isEventNew?: () => boolean;
  isFavorite: () => boolean;
  onClickFavorite?: any;
  childLast?: boolean;
  parentLast?: boolean;
  isLast?: boolean;
};

const Item = ({
  data,
  isFavorite,
  isEventDone,
  isEventNew = () => false,
  onClickFavorite,
  childLast,
  parentLast,
}: Props) => {
  const [isLast, setIsLast] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(isEventDone());
  const [isNew, setIsNew] = useState<boolean>(isEventNew());
  const { search } = useContext(EventContext);
  const { pushToast } = useToast();
  const router = useRouter();

  // 주최자 상세 라우팅 키는 숫자 hostId(서버 PK)다. 이름 문자열로 push 하면 무조건 404.
  // 목록/행사 상세가 같은 로직·같은 GA 이벤트를 쓰도록 lib/host/hostLink 로 추출했다.
  const isHostLinkable = getHostIdFromEvent(data) !== null;

  // 로고가 없거나 URL 이 죽어 있으면 이니셜 뱃지로 대체한다 (DES-100). 행사 상세와 같은 훅.
  const hostLogo = useEventHostLogo(data);

  const moveToHostDetail = () => pushHostDetail(router, data);

  const handleHostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveToHostDetail();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(data.event_link);
      pushToast('링크가 복사되었어요');
    } catch (err) {
      console.error(err);
      pushToast('링크 복사에 실패했어요');
    }
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
  };

  const getEventDate = () => {
    let eventDate;

    if (data.start_date_time && !data.end_date_time) {
      const startDateType =
        data.use_start_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
      eventDate = convertDateFormat(data.start_date_time, startDateType);
    }
    if (!data.start_date_time && data.end_date_time) {
      const endDateType =
        data.use_end_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
      eventDate = convertDateFormat(data.end_date_time, endDateType) + ' 까지';
    }
    if (data.start_date_time && data.end_date_time) {
      const isSameDay =
        DateUtil.getDateFormat(data.start_date_time) ===
        DateUtil.getDateFormat(data.end_date_time);
      const startDateType =
        data.use_start_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
      const endDateType = isSameDay
        ? DateType.time
        : data.use_end_date_time_yn === 'Y'
        ? DateType.dateTime
        : DateType.date;

      eventDate =
        convertDateFormat(data.start_date_time, startDateType) +
        ' ~ ' +
        convertDateFormat(data.end_date_time, endDateType);
    }
    return eventDate;
  };

  const convertDateFormat = (date: string, type: string) => {
    switch (type) {
      case 'time':
        return DateUtil.getTimeFormat(date);
      case 'date':
        return DateUtil.getDateFormat(date, { hasWeek: true });
      case 'dateTime':
        return DateUtil.getDateTimeFormat(date);
    }
  };
  useEffect(() => {
    if ((!search && childLast) || (search && parentLast)) {
      setIsLast(true);
    }
  }, [search]);
  return (
    <div className={cn('item__container', `${isLast && 'item__last'}`)}>
      <div className={cn('item')}>
        <Link href={`/event/detail/${String(data.id)}`}>
          <a
            onClick={(event: any) => {
              if (
                event.target.tagName !== 'SPAN' &&
                event.target.tagName !== 'DIV' &&
                event.target.tagName !== 'IMG'
              ) {
                event.preventDefault();
              }
              ga.event({
                action: 'web_event_이벤트클릭',
                event_category: 'web_event',
                event_label: '이벤트클릭',
              });
            }}
          >
            <div className={cn('item__content')}>
              <div className={cn('item__content__img')}>
                <Image
                  unoptimized
                  className={cn('item__content__img__mask')}
                  alt="이벤트 이미지"
                  src={eventThumbnail(data.cover_image_link)}
                  priority={true}
                  layout="fill"
                />
                {isDone && <div className={cn('item__content__img__done')} />}
                {!isDone && (
                  <div className={cn('item__content__img__badge')}>
                    <DdayTag
                      startDateTime={data.start_date_time}
                      endDateTime={data.end_date_time}
                    />
                  </div>
                )}
              </div>
              <div className={cn('item__content__body')}>
                <div>
                  <div className={cn('item__content--top')}>
                    <div className={cn('wrap')}>
                      {/*
                        연결된 주최자가 없으면 클릭 가능한 UI 자체를 렌더하지 않는다.
                        카드 전체가 <a> 라 중첩 링크가 되지 않도록 role="link" 대신 button 을 쓴다 (WEB-035).
                        button 은 Space/Enter 를 브라우저가 알아서 처리하므로 keydown 분기가 필요 없다.
                      */}
                      {isHostLinkable ? (
                        <button
                          type="button"
                          className={cn(
                            isDone ? 'host__done' : 'host',
                            'host__clickable'
                          )}
                          onClick={handleHostClick}
                          aria-label={`${data.organizer} 주최자 페이지로 이동`}
                        >
                          {hostLogo.showImage ? (
                            <img
                              className={cn('host__logo', 'host__logo--img')}
                              src={hostLogo.imageSrc}
                              alt=""
                              aria-hidden="true"
                              onError={hostLogo.handleImageError}
                            />
                          ) : (
                            <span
                              className={cn('host__logo')}
                              style={{
                                background: hostLogo.badge.gradient,
                                color: hostLogo.badge.textColor,
                              }}
                              aria-hidden="true"
                            >
                              {hostLogo.badge.initial}
                            </span>
                          )}
                          <span className={cn('host__name')}>
                            {data.organizer}
                          </span>
                          <ChevronRightIcon className={cn('host__chevron')} />
                        </button>
                      ) : (
                        <span className={cn(isDone ? 'host__done' : 'host')}>
                          {data.organizer}
                        </span>
                      )}
                      {/* 공유 & 북마크 */}
                      <div className={cn('item__buttons')}>
                        <button
                          className={cn(`button`, `share-button`, 'laptop')}
                          onClick={handleShare}
                        >
                          <ShareIcon
                            color="rgba(171, 172, 178, 1)"
                            className="button"
                          />
                        </button>
                        <button
                          className={cn(`button`, `share-button`, 'mobile')}
                          onClick={handleShare}
                        >
                          <ShareIconMobile
                            color="rgba(171, 172, 178, 1)"
                            className="button"
                          />
                        </button>
                        <button
                          className={cn(`button`, 'like-button', 'laptop')}
                          onClick={onClickFavorite}
                        >
                          <BookmarkIcon
                            color="rgba(171, 172, 178, 1)"
                            className="button"
                            isFavorite={isFavorite()}
                          />
                        </button>
                        <button
                          className={cn(`button`, 'like-button', 'mobile')}
                          onClick={onClickFavorite}
                        >
                          <BookmarkIconMobile
                            color="rgba(171, 172, 178, 1)"
                            className="button"
                            isFavorite={isFavorite()}
                          />
                        </button>
                      </div>
                      {/* // 공유 & 북마크 */}
                    </div>
                  </div>
                  <div className={cn('item__content_title__container')}>
                    <div
                      className={cn(
                        isDone
                          ? 'item__content__title__done'
                          : 'item__content__title'
                      )}
                    >
                      {data.title}
                    </div>
                  </div>
                </div>
                <div className={cn('item__content__desc')}>
                  <span className={cn('wrap')}>
                    <div className={cn('date')}>
                      {/* 행사 시간 유형 */}
                      <span
                        className={cn(
                          isDone ? 'date__type__done' : 'date__type'
                        )}
                      >
                        {data.event_time_type === 'DATE' ? '일시' : '접수'}
                      </span>
                      {/* 행사 시작 시간 */}
                      <span
                        className={cn(
                          isDone ? `date__date__done` : 'date__date'
                        )}
                      >
                        {shortenYear(getEventDate())}
                      </span>
                      {/* 행사 종료 시간 */}
                      <span
                        className={cn(
                          isDone
                            ? 'date__date__done__mobile'
                            : 'date__date__mobile'
                        )}
                      >
                        {shortenYear(getEventDate())}
                      </span>
                    </div>
                  </span>
                  {/* 태그 */}
                  <div className={cn('item__content__desc__tags')}>
                    {data.tags.map((tag: TagResponse) => {
                      return (
                        <FilterTag
                          key={tag.id}
                          label={tag.tag_name}
                          size="regular"
                          type="location"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Item;
