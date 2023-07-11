import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from './Item.module.scss';
import Image from 'next/image';
import FilterTag from '../tag/FilterTag';
import { DateUtil } from 'lib/utils/dateUtil';
import * as ga from 'lib/utils/gTag';
import { WindowContext } from 'context/window';
import { TagResponse } from 'model/tag';
import { BookmarkIcon, ShareIcon } from 'components/icons';
import { getTagName, getTagType } from 'lib/utils/tagUtil';

const cn = classNames.bind(style);

const DateType = {
  dateTime: 'dateTime',
  date: 'date',
  time: 'time',
};
const Item = ({
  data,
  isFavorite,
  isEventDone,
  isEventNew = () => false,
  onClickFavorite,
  isLast
}: {
  data: Event;
  isEventDone: () => boolean;
  isEventNew?: () => boolean;
  isFavorite: () => boolean;
  onClickFavorite?: any;
  isLast: boolean
}) => {
  const { windowX, handleWindowX } = useContext(WindowContext);
  console.log(data)
  const handleShare = async () => {
    navigator.clipboard.writeText(data.event_link)
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
  };

  useEffect(() => {
    handleWindowX(window.innerWidth);
  }, [windowX])

  const getEventDate = () => {
    let eventDate;
    if (data.start_date_time && !data.end_date_time) {
      const startDateType = data.use_start_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
      eventDate = convertDateFormat(data.start_date_time, startDateType);
    }
    if (!data.start_date_time && data.end_date_time) {
      const endDateType = data.use_end_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
      eventDate = convertDateFormat(data.end_date_time, endDateType) + ' 까지';
    }
    if (data.start_date_time && data.end_date_time) {
      const isSameDay = DateUtil.getDateFormat(data.start_date_time) === DateUtil.getDateFormat(data.end_date_time);
      const startDateType = data.use_start_date_time_yn === 'Y' ? DateType.dateTime : DateType.date;
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
  return (
    <div className={cn('item__container', `${isLast && 'item-last'}`)}>
      <div className={cn('item')}>
        <Link href={String(data.event_link)}>
          <a
            onClick={(event: any) => {
              if (event.target.tagName !== 'SPAN' && event.target.tagName !== 'DIV' && event.target.tagName !== 'IMG') {
                event.preventDefault();
              }
              ga.event({
                action: 'web_event_이벤트클릭',
                event_category: 'web_event',
                event_label: '이벤트클릭',
              });
            }}
            target="_blank"
          >
            <div className={cn('item__content')}>
              <div className={cn('item__content__img')}>
                <Image
                  className={cn('mask')}
                  alt="/default/event_img.png"
                  src={
                    data.cover_image_link.includes('brave-people-3.s3.ap-northeast-2.amazonaws.com')
                      ? data.cover_image_link
                      : '/default/event_img.png'
                  }
                  width={200}
                  height={112}
                ></Image>
                {isEventDone() ? (
                  <div className={cn('item__content__img--isDone')}>
                    <span>종료된 행사입니다</span>
                  </div>
                ) : null}
                {isEventNew() ? (
                  <div className={cn('item__content__flag', 'new')}>
                    <span>NEW</span>
                  </div>
                ) : null}
                {isFavorite() ? (
                  <div className={cn('item__content__flag', 'my')}>
                    <span>MY</span>
                  </div>
                ) : null}
              </div>
              <div className={cn('item__content__body')}>
                <span className={cn('wrap')}>
                  <div className={cn('host')}>{data.organizer}</div>
                </span>
                <span className={cn('item__content__title')}>{(data.title.length >= 30 && windowX <= 750) ? `${data.title.slice(0, 30)}...` : data.title}</span>
                <div className={cn('item__content__desc')}>
                  <span className={cn('wrap')}>
                    <div className={cn('date')}> 일시 {getEventDate()} </div>
                  </span>
                  <div className={cn('item__content__desc__tags')}>
                    <FilterTag
                      label={getTagName(data.tags, "location")}
                      size='regular'
                      type='location'
                    />
                    <FilterTag
                      label={getTagName(data.tags, "eventType")}
                      size='regular'
                      type='eventType'
                    />
                    <FilterTag
                      label={getTagName(data.tags, "coast")}
                      size='regular'
                      type='eventType'
                    />
                    {data.tags.map((tag: TagResponse) => {
                      const type = getTagType(tag.tag_name);
                      if (type !== "jobGroup")
                        return null;
                      return (
                        <FilterTag
                          key={tag.id}
                          type={type}
                          label={tag.tag_name}
                          size='regular'
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </a>
        </Link>
        <div className={cn('item__buttons')}>
          <button 
            className={cn(`button`, `like-button`)} 
            onClick={onClickFavorite}>
            <ShareIcon
              color='rgba(171, 172, 178, 1)'
              className='button'
              isFavorite={isFavorite()}
            />
          </button>
          <button className={cn(`button`, 'share-button')} onClick={handleShare}>
            <BookmarkIcon
              color='rgba(171, 172, 178, 1)'
              className='button'
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;
