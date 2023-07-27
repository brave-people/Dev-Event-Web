import React, { useContext } from "react"
import Image from "next/image"
import classNames from "classnames/bind"
import style from 'components/common/modal/NoticeModal.module.scss'
import { DeleteIcon } from "components/icons"
import { WindowContext } from "context/window"

const cn = classNames.bind(style)

function NoticeModal() {
  const { isNotice, windowTheme, handleIsNotice } = useContext(WindowContext);
  
  const handleModal = () => {
    handleIsNotice(false)
  }
  return (
    <div className={cn('notice', !isNotice && 'status--delete', windowTheme ? "notice--light" : "notice--dark")}>
      <div className={cn('notice__inner')}>
        <div className={cn('notice__content')}>
          <span className={cn('notice__title')}>
            개발자를 위한 행사 정보, 데브이벤트
          </span>
          <Image
            src={"/icon/notice.png"}
            width={36}
            height={36}
          />
        </div>
        <div className={cn('icon')} onClick={handleModal}>
          <DeleteIcon
            color={windowTheme ? "rgba(49, 50, 52, 1)" : "rgba(203, 203, 206, 1)"}
          />
        </div>
      </div>
    </div>
  )
}

export default NoticeModal