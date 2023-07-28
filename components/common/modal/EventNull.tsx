import React from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import style from 'components/common/modal/EventNull.module.scss'

const cn = classNames.bind(style)

type Props = {
  search?: string; 
}

function EventNull({ search }: Props) {
  return (
    <section className={cn('section__list')}>
      <div className={cn('section__list__title')}>
        {search && search}
      </div>
        <section className={cn('container')}>
          <div className={cn('title')}>
            찾으시는 행사정보가 없어요
          </div>
          <Image
            src={"/icon/none_event.svg"}
            alt='no event'
            priority={true}
            width={58}
            height={58}
          />
          <div className={cn('desc')}>
            추천태그로 검색해보세요
          </div>
        </section>
    </section>
  )
}

export default EventNull;