import style from 'components/common/item/Item.module.scss';
import ShareModal from 'components/common/modal/ShareModal';
import DdayTag from 'components/common/tag/DdayTag';
import FilterTag from 'components/common/tag/FilterTag';
import {
  BookmarkIcon,
  BookmarkIconMobile,
  EndBulletIcon,
  NewBulletIcon,
  ShareIcon,
  ShareIconMobile,
} from 'components/icons';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { DateUtil } from 'lib/utils/dateUtil';
import * as ga from 'lib/utils/gTag';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import SaveModal from "../modal/SaveModal";

const cn = classNames.bind(style);

const DateType = {
  dateTime: 'dateTime',
  date: 'date',
  time: 'time',
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
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(isEventDone());
  const [isNew, setIsNew] = useState<boolean>(isEventNew());
  const { windowX } = useContext(WindowContext);
  const { search } = useContext(EventContext);

  const handleShare = () => {
    setIsShareModalOpen(true);
    navigator.clipboard.writeText(data.event_link);
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
    setTimeout(() => {
      setIsShareModalOpen(false);
    }, 1300);
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
      {isShareModalOpen && <ShareModal />}
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
                  src={
                    data.cover_image_link.includes(
                      'brave-people-3.s3.ap-northeast-2.amazonaws.com'
                    )
                      ? data.cover_image_link
                      : '/default/event-thumbnail-light.png'
                  }
                  priority={true}
                  layout="fill"
                />
                {isDone && <div className={cn('item__content__img__done')} />}
                {isDone ? (
                  <div className={cn('item__content__flag')}>
                    <EndBulletIcon
                      color={'rgba(203, 203, 206, 1)'}
                      backgroundColor={'rgba(49, 50, 52, 1)'}
                    />
                  </div>
                ) : null}
                {isNew ? (
                  <div className={cn('item__content__flag')}>
                    <NewBulletIcon
                      color={'rgba(203, 203, 206, 1)'}
                      backgroundColor={'rgba(44, 76, 239, 1)'}
                    />
                  </div>
                ) : null}
              </div>
              <div className={cn('item__content__body')}>
                <div>
                  <div className={cn('item__content--top')}>
                    <div className={cn('wrap')}>
                      <span className={cn(isDone ? 'host__done' : 'host')}>
                        {data.organizer}
                      </span>
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
                      {data.title.length >= 30 && windowX <= 750
                        ? `${data.title.slice(0, 45)}...`
                        : data.title}
                    </div>
                    {isDone ? null : (
                      <DdayTag
                        startDateTime={data.start_date_time}
                        endDateTime={data.end_date_time}
                      />
                    )}
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
                        {data.event_time_type === 'DATE' ? '일시 ' : '접수 '}
                      </span>
                      {/* 행사 시작 시간 */}
                      <span
                        className={cn(
                          isDone ? `date__date__done` : 'date__date'
                        )}
                      >
                        {getEventDate()}
                      </span>
                      {/* 행사 종료 시간 */}
                      <span
                        className={cn(
                          isDone
                            ? 'date__date__done__mobile'
                            : 'date__date__mobile'
                        )}
                      >
                        {getEventDate()}
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
