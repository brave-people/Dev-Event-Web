import React from 'react';
import Link from 'next/link';
import { Event } from 'model/index';
import classNames from 'classnames/bind';
import style from './item.module.scss';
import Image from 'next/image';
import Tag from '../tag/Tag';

type ItemProps = {
  //아이템만 쓰기
  data: Event;
};
const cn = classNames.bind(style);

const Item = ({ data }: any) => {
  return (
    <Link href={String(data.event_link)}>
      <a>
        {' '}
        <div className={cn('item')}>
          <div className={cn('item__content')}>
            <div className={cn('item__content__img')}>
              <Image
                className={cn('mask')}
                alt="/event_default_img.png"
                src="/event_default_img.png"
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
          <div className={cn('item__buttons')}>
            <button>별</button>
            <button>링크</button>
          </div>{' '}
        </div>
      </a>
    </Link>
  );
};
export default Item;
