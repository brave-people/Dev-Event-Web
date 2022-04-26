import React from 'react';
import Link from 'next/link';
import { Event } from 'model/index';
import classNames from 'classnames/bind';
import style from './item.module.scss';
import Image from 'next/image';
import Tag from '../tag/Tag';
import Star from 'public/icon/star_grey_outlined.svg';
import Share from 'public/icon/share_grey_outlined.svg';
type ItemProps = {
  //아이템만 쓰기
  data: Event;
};
const cn = classNames.bind(style);

const Item = ({ data, isSelected = false }: any) => {
  return (
    <div className={cn('item')}>
      <Link href={String(data.event_link)}>
        <a>
          <div className={cn('item__content')}>
            <div className={cn('item__content__img')}>
              <Image
                className={cn('mask')}
                alt="/default/event_img.png"
                src="/default/event_img.png"
                width={377}
                height={207}
              ></Image>
            </div>
            <div className={cn('item__content__body')}>
              <span className={cn('item__content__title')}>{data.title}</span>
              <div className={cn('item__content__desc')}>
                <span>{data.organizer}</span>
                <br className={cn('divider')} />
                <span> {data.description}</span>
              </div>
              <div className={cn('item__content__tags')}>
                <Tag label="태그1" />
                <Tag label="태그2" />
                <Tag label="태그3" />
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
