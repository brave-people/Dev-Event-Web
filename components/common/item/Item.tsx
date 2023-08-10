import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'components/common/item/Item.module.scss';
import Image from 'next/image';
import FilterTag from 'components/common/tag/FilterTag';
import { DateUtil, removeDupDate } from 'lib/utils/dateUtil';
import { WindowContext } from 'context/window';
import { TagResponse } from 'model/tag';
import { BookmarkIcon, EndBulletIcon, NewBulletIcon, ShareIcon } from 'components/icons';
import { getTagName, getTagType } from 'lib/utils/tagUtil';
import ShareModal from 'components/common/modal/ShareModal'
import { EventContext } from 'context/event';
import * as ga from 'lib/utils/gTag';
import DdayTag from '../tag/DdayTag';

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
  childLast: boolean;
  parentLast: boolean;
}

const Item = ({ data, isFavorite, isEventDone, isEventNew = () => false, onClickFavorite, childLast, parentLast }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(isEventDone());
  const [isNew, setIsNew] = useState<boolean>(isEventNew());
  const { windowX, windowTheme } = useContext(WindowContext);
  const { search } = useContext(EventContext);
  const imgPath = windowTheme ? "/default/event-thumbnail-light.svg" : "/default/event-thumbnail-dark.svg";
  const handleShare = () => {
    setIsOpen(true);
    navigator.clipboard.writeText(data.event_link)
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

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
    return removeDupDate(eventDate)
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
  }, [search])
  return (
    <div className={cn('item__container', `${isLast && 'item__last'}`)}>
      {isOpen && <ShareModal />}
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
                  className={cn('item__content__img__mask')}
                  alt="이벤트 이미지"
                  src={
                    data.cover_image_link.includes('brave-people-3.s3.ap-northeast-2.amazonaws.com')
                      ? data.cover_image_link
                      : imgPath
                  }
                  priority={true}
                  width={200}
                  height={112}
                />
                {isDone && <div className={cn('item__content__img__done')} />}
                {isDone ? (
                  <div className={cn('item__content__flag')}>
                    <EndBulletIcon
                      color={windowTheme ? "rgba(203, 203, 206, 1)" : "rgba(49, 50, 52, 1)"}
                      backgroundColor={windowTheme ? "rgba(49, 50, 52, 1)" : "rgba(203, 203, 206, 1)"}
                    />
                  </div>
                ) : null}
                {isNew ? (
                  <div className={cn('item__content__flag')}>
                    <NewBulletIcon
                      color={windowTheme ? "rgba(203, 203, 206, 1)" : "rgba(49, 50, 52, 1)"}
                      backgroundColor={windowTheme ? "rgba(44, 76, 239, 1)" : "rgba(79, 108, 255, 1)"}
                    />
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
                  <div className={cn(isDone ? 'host__done' : 'host')}>{data.organizer}</div>
                </span>
                <div className={cn('item__content_title__container')}>
                  <div className={cn(isDone ? 'item__content__title__done' :'item__content__title')}>{(data.title.length >= 30 && windowX <= 750) ? `${data.title.slice(0, 30)}...` : data.title}</div>
                  {isDone ? null : <DdayTag startDateTime={data.start_date_time} endDateTime={data.end_date_time} />}
                </div>
                <div className={cn('item__content__desc')}>
                  <span className={cn('wrap')}>
                    <div className={cn('date')}> 
                      <span className={cn(isDone ? 'date__type__done' : 'date__type')}>{data.event_time_type === "DATE" ? "일시 " : "접수 "}</span>
                      <span className={cn(isDone ? 'date__date__done' : 'date__date')}>{getEventDate()}</span> 
                    </div>
                  </span>
                  <div className={cn('item__content__desc__tags')}>
                    {data.tags.map((tag: TagResponse) => {
                      const type = getTagType(tag.tag_name);
                      if (type !== "location")
                        return ;
                      return (
                        <FilterTag
                          key={tag.id}
                          label={tag.tag_name}
                          size='regular'
                          type='location'
                        />
                      )})}
                    <FilterTag
                      label={getTagName(data.tags, "eventType")}
                      size='regular'
                      type='eventType'
                    />
                    <FilterTag
                      label={getTagName(data.tags, "coast")}
                      size='regular'
                      type='coast'
                    />
                    {data.tags.map((tag: TagResponse) => {
                      const type = getTagType(tag.tag_name);
                      if (type !== "jobGroup")
                        return ;
                      return (
                        <FilterTag
                          key={tag.id}
                          type="jobGroup"
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
            onClick={handleShare}>
            <ShareIcon
              color='rgba(171, 172, 178, 1)'
              className='button'
            />
          </button>
          <button className={cn(`button`, 'share-button')} onClick={onClickFavorite}>
            <BookmarkIcon
              color='rgba(171, 172, 178, 1)'
              className='button'
              isFavorite={isFavorite()}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;
