import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from './Item.module.scss';
import Image from 'next/image';
import Tag from '../tag/Tag';
import router from 'next/router';
import { MdContentCopy } from 'react-icons/md';
import { DateUtil } from 'lib/utils/dateUtil';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import dayjs from 'dayjs';
import * as ga from 'lib/utils/gTag';

const cn = classNames.bind(style);

const Item = ({
  data,
  isFavorite,
  isEventDone,
  isEventNew = () => false,
  onClickFavorite,
  onClickShareInMobileSize,
}: {
  data: Event;
  isEventDone: () => boolean;
  isEventNew?: () => boolean;
  isFavorite: ({ filter }: { filter: string }) => boolean;
  onClickFavorite?: any;
  onClickShareInMobileSize?: any;
}) => {
  const [isShareModalOpenInDesktop, setShareModalOpenInDesktop] = useState(false);

  let defaultInnerHeight = window.innerHeight;

  const outsideRef = useRef(null);
  const handleClickOutside = () => {
    if (isShareModalOpenInDesktop) {
      setShareModalOpenInDesktop(false);
    }
  };
  useOnClickOutside({ ref: outsideRef, handler: handleClickOutside, mouseEvent: 'click' });

  const checkMobile = () => {
    return navigator.maxTouchPoints; //&& window.innerHeight !== defaultInnerHeight;
  };

  const handleShare = async () => {
    const isMobile = checkMobile();
    if (isMobile) {
      if (navigator.share) {
        try {
          await navigator
            .share({ title: data.title, url: data.event_link })
            .then(() => console.log('Hooray! Your content was shared to tha world'));
        } catch (error) {
          console.log(`공유 중 문제가 발생했습니다!`);
        }
      } else {
        onClickShareInMobileSize(data);
      }
    } else {
      const innerWidth = window.innerWidth;
      if (innerWidth < 768) {
        onClickShareInMobileSize(data);
      } else {
        setShareModalOpenInDesktop(!isShareModalOpenInDesktop);
      }
    }
    ga.event({
      action: 'web_event_공유버튼클릭',
      event_category: 'web_event',
      event_label: '공유',
    });
  };

  const getEventDate = () => {
    let eventDate;
    if (DateUtil.getDateFormat(data.start_date_time) === DateUtil.getDateFormat(data.end_date_time)) {
      if (data.start_time === data.end_time) {
        if (data.start_time === '00:00' && data.end_time === '00:00') {
          eventDate = `${DateUtil.getDateFormat(data.start_date_time)}(${data.start_day_week})`;
        } else {
          eventDate = `${DateUtil.getDateFormat(data.start_date_time)}(${data.start_day_week}) ${data.start_time}`;
        }
      } else {
        eventDate = ` ${DateUtil.getDateFormat(data.start_date_time)}(${data.start_day_week}) ${data.start_time} ~ ${
          data.end_time
        }`;
      }
    } else {
      eventDate = `${DateUtil.getDateFormat(data.start_date_time)}(${data.start_day_week}) ~ ${DateUtil.getDateFormat(
        data.end_date_time
      )}(${data.end_day_week})`;
    }
    return eventDate;
  };

  const getEventDdayTag = () => {
    const todayDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    const startDate = dayjs(data.start_date_time)
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
    const endDate = dayjs(data.end_date_time).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    if (startDate.diff(todayDate, 'day') > 0 && startDate.diff(todayDate, 'day') < 6) {
      return <span className={cn('item__content__desc__dday--approach')}>D-{startDate.diff(todayDate, 'day')}</span>;
    } else if (startDate.diff(todayDate, 'day') > 0) {
      return <span className={cn('item__content__desc__dday--scheduled')}>D-{startDate.diff(todayDate, 'day')}</span>;
    } else if (
      (startDate.diff(todayDate, 'day') < 0 && endDate.diff(todayDate, 'day') > 0) ||
      (startDate.diff(todayDate, 'day') === 0 && startDate.get('day') === todayDate.get('day')) ||
      (endDate.diff(todayDate, 'day') === 0 && endDate.get('day') === todayDate.get('day'))
    ) {
      return <span className={cn('item__content__desc__dday--ongoing')}>Today</span>;
    } else {
      return null;
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
              {isFavorite({ filter: isEventDone() ? 'OLD' : 'FUTURE' }) ? (
                <div className={cn('item__content__flag', 'my')}>
                  <span>MY</span>
                </div>
              ) : null}
            </div>
            <div className={cn('item__content__body')}>
              <div>
                <span className={cn('item__content__title')}>{data.title}</span>
                <div className={cn('item__content__desc')}>
                  <span>주최 : {data.organizer}</span>
                  <br className={cn('divider')} />
                  <span>
                    일시 :{getEventDate()} <span className={cn('item__content__desc__dday')}>{getEventDdayTag()}</span>{' '}
                  </span>
                </div>
              </div>
              <div className={cn('item__content__bottom')}>
                <div className={cn('tags')}>
                  {data.tags.map((tag) => {
                    return (
                      <Tag
                        label={tag.tag_name}
                        onClick={(event: any) => {
                          ga.event({
                            action: 'web_event_이벤트태그클릭',
                            event_category: 'web_event',
                            event_label: '검색',
                          });
                          const tag = event.target.innerText.replace(/[\t\s\#]/g, '');
                          router.replace(`/events?tag=${tag}`);
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
        <button
          className={cn(`like-button`, isFavorite({ filter: isEventDone() ? 'OLD' : 'FUTURE' }) ? '--selected' : null)}
          onClick={() => {
            onClickFavorite({ filter: isEventDone() ? 'OLD' : 'FUTURE' });
          }}
        />
        <button className={cn('share-button')} onClick={handleShare} />
        {isShareModalOpenInDesktop ? (
          <div className={cn('share-modal')} ref={outsideRef}>
            {' '}
            <input className={cn('share-modal__link')} value={data.event_link} readOnly></input>
            <button
              className={cn('share-modal__button')}
              onClick={(event) => {
                const copyLink = data.event_link;
                navigator.clipboard
                  .writeText(copyLink)
                  .then(() => {
                    alert('링크가 복사되었습니다');
                  })
                  .catch((err) => {
                    console.log('링크복사 실패', err);
                  });
                ga.event({
                  action: 'web_event_url복사버튼클릭',
                  event_category: 'web_event',
                  event_label: '공유',
                });
              }}
            >
              <MdContentCopy color="#757575" size={20} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Item;
