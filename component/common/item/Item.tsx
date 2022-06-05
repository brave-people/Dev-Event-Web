import React from 'react';
import Link from 'next/link';
import { Event } from 'model/event';
import classNames from 'classnames/bind';
import style from './item.module.scss';
import Image from 'next/image';
import Tag from '../tag/Tag';
import Star from 'public/icon/star_grey_outlined.svg';
import Share from 'public/icon/share_grey_outlined.svg';
import router from 'next/router';

const cn = classNames.bind(style);

const Item = ({ data, isSelected = false }: { data: Event; isSelected: boolean }) => {
  return (
    <div className={cn('item')}>
      <Link href={String(data.event_link)}>
        <a>
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
            </div>
            <div className={cn('item__content__body')}>
              <span className={cn('item__content__title')}>{data.title}</span>
              <div className={cn('item__content__desc')}>
                <span>{data.organizer}</span>
                <br className={cn('divider')} />
              </div>
              <div className={cn('item__content__tags')}>
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
        </a>
      </Link>
      <div className={cn('item__buttons')}>
        <button className={cn(`like-button`, isSelected ? '--selected' : null)}>
          <Star />
        </button>
        <button className={cn('share-button')}>
          <Share />
        </button>
      </div>
    </div>
  );
};
export default Item;
