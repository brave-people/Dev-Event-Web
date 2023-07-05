import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from './Item.module.scss';
import Image from 'next/image';
import FilterTag from '../tag/FilterTag';
import { DateUtil } from 'lib/utils/dateUtil';
import * as ga from 'lib/utils/gTag';
import DdayTag from 'components/common/tag/DdayTag';
import { WindowContext } from 'context/window';

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
}: {
  data: Event;
  isEventDone: () => boolean;
  isEventNew?: () => boolean;
  isFavorite: () => boolean;
  onClickFavorite?: any;
}) => {
  const { windowX, handleWindowX } = useContext(WindowContext);
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
                width={280}
                height={157.5}
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
                <span className={cn('item__content__title')}>{(data.title.length >= 30 && windowX <= 750) ? `${data.title.slice(0, 30)}...` : data.title}</span>
                <div className={cn('item__content__desc')}>
                  <span className={cn('wrap')}>
                    <div className={cn('label')}>주최 : </div>
                    <div className={cn('host')}>{data.organizer}</div>
                  </span>
                  <span className={cn('wrap')}>
                    <div className={cn('label')}>{data.event_time_type === 'RECRUIT' ? '모집 : ' : '일시 : '}</div>
                    <div className={cn('date')}> {getEventDate()} </div>
                    <div className={cn('tag')}>
                      <DdayTag startDateTime={data.start_date_time} endDateTime={data.end_date_time} />
                    </div>
                  </span>
              </div>
              <div className={cn('item__content__bottom')}>
                <div className={cn('tags')}>
                  {data.tags.map((tag) => {
                    return (
                      <FilterTag
                        key={tag.id}
                        label={tag.tag_name}
                        color={tag.tag_color}
                        onClick={() => {
                          ga.event({
                            action: 'web_event_이벤트태그클릭',
                            event_category: 'web_event',
                            event_label: '검색',
                          });
                        }}
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
        <button className={cn(`like-button`, isFavorite() ? '--selected' : null)} onClick={onClickFavorite} />
        <button className={cn('share-button')} onClick={handleShare} />
      </div>
    </div>
  );
};

export default Item;
