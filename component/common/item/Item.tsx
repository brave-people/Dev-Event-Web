import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from './item.module.scss';
import Image from 'next/image';
import Tag from '../tag/Tag';
import StarIcon from 'public/icon/star_grey_outlined.svg';
import ShareIcon from 'public/icon/share_grey_outlined.svg';
import router from 'next/router';
import { MdContentCopy } from 'react-icons/md';
import { DateUtil } from 'lib/utils/dateUtil';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';

const cn = classNames.bind(style);

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
  isFavorite: ({ filter }: { filter: string }) => boolean;
  onClickFavorite?: any;
}) => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const outsideRef = useRef(null);
  const handleClickOutside = () => {
    setShareModalOpen(false);
  };
  useOnClickOutside({ ref: outsideRef, handler: handleClickOutside, mouseEvent: 'click' });

  return (
    <Link href={String(data.event_link)}>
      <a
        onClick={(event: any) => {
          if (event.target.tagName !== 'SPAN' && event.target.tagName !== 'DIV' && event.target.tagName !== 'IMG') {
            event.preventDefault();
          }
        }}
      >
        <div className={cn('item')}>
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
              <span className={cn('item__content__title')}>{data.title}</span>
              <div className={cn('item__content__desc')}>
                <span>주최 : {data.organizer}</span>
                <br className={cn('divider')} />
                <span>
                  일시 : {DateUtil.getDateFormat(data.start_date_time)} ~ {DateUtil.getDateFormat(data.end_date_time)}
                </span>
              </div>
              <div className={cn('item__content__bottom')}>
                <div className={cn('tags')}>
                  {data.tags.map((tag) => {
                    return (
                      <Tag
                        label={tag.tag_name}
                        onClick={(event: any) => {
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

          <div className={cn('item__buttons')}>
            <button
              className={cn(
                `like-button`,
                isFavorite({ filter: isEventDone() ? 'OLD' : 'FUTURE' }) ? '--selected' : null
              )}
              onClick={() => {
                onClickFavorite({ filter: isEventDone() ? 'OLD' : 'FUTURE' });
              }}
            >
              <StarIcon />
            </button>
            <button
              ref={outsideRef}
              className={cn('share-button')}
              onClick={() => {
                setShareModalOpen(!isShareModalOpen);
              }}
            >
              <ShareIcon />
            </button>

            {isShareModalOpen ? (
              <div className={cn('share-modal')}>
                {' '}
                <input className={cn('share-modal__link')} value={data.event_link} readOnly></input>
                <button
                  className={cn('share-modal__button')}
                  onClick={(event) => {
                    const copyLink = data.event_link;
                    navigator.clipboard
                      .writeText(copyLink)
                      .then(() => {
                        alert('클립보드에 복사되었습니다');
                      })
                      .catch((err) => {
                        console.log('클립보드에 복사 실패', err);
                      });
                  }}
                >
                  <MdContentCopy color="#757575" size={20} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default Item;
