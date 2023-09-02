import { DeleteIcon } from "components/icons";
import style from 'components/common/modal/FilterDateModal.module.scss'
import classNames from "classnames/bind";
import { useRouter } from "next/router";
import { reflactUrlContext } from "lib/utils/urlUtil";
import { useContext, useState } from "react";
import { WindowContext } from "context/window";
import { EventContext } from "context/event";
import DateBoard from "../date/DateBoard";
import { getDateList } from "lib/utils/dateUtil";
import FillButton from "../buttons/FillButton";

const cn = classNames.bind(style);

function FilterDateModal() {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [hidden, setHidden] = useState<boolean>(false);
  const { modalState, handleModalState } = useContext(WindowContext);
  const { url } = useContext(EventContext);

  const deleteModal = () => {
    if (url !== undefined) {
      router.replace(url)
    }
    setTimeout(() => {
      handleModalState({
        currentModal: 0,
        prevModal: 0,
        type: true
      })
    }, 300)
    setHidden(true)
  }

  return (
    <section className={cn('container', hidden && 'hidden')}>
      <div className={cn('header')}>
        <div className={cn('header__title')}>
          월 선택
        </div>
        <button 
          onClick={() => deleteModal()}
          className={cn('header__deleteBtn')}>
          <DeleteIcon
            color='rgba(32, 34, 45, 0.6)'
          />
        </button>
      </div>
      <div className={cn('dateboard__container')}>
        <DateBoard
          options={getDateList()}
        />
      </div>
      <div className={cn('finishBtn')}>
        <FillButton
          label='완료'
          color='primary'
          onClick={deleteModal}
          rounded={false}
        />
      </div>
    </section>
  )
}

export default FilterDateModal;