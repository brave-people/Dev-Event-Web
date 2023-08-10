import React from 'react'
import Image from 'next/image'
import style from 'components/common/tag/DoneTag.module.scss'
import classNames from 'classnames/bind'

const cn = classNames.bind(style);

function DoneTag() {
  return (
    <div className={cn('tag__container')}>
      <Image
        src={"/icon/review_icon.svg"}
        alt='event'
        layout='fill'
        className={cn('tag')}
      />
    </div>
  )
}

export default DoneTag