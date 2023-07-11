import Image from "next/image"
import classNames from "classnames/bind"
import style from 'components/features/letter/Letter.module.scss'

const cn = classNames.bind(style);

function Letter() {
  return (
    <section className={cn('letter')}>
      <div>
        매주
        <span>데브이벤트</span>
        소식을 받아보세요
      </div>
      <div>
        일요일 저녁 8시 개발자 행사 소식을 메일로 보내드려요
      </div>
      <Image
        src="/icon/letter_icon.svg"
        alt="letter__icon"
        width={146}
        height={109}
      />
    </section>
  )
}

export default Letter