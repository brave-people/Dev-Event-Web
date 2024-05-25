import style from 'components/common/modal/FilterTagModal.module.scss';
import FilterByCoast from 'components/features/filters/ByCoast/FilterByCoast';
import FilterByEventType from 'components/features/filters/ByEventType/FilterByEventType';
import FilterByJobGroup from 'components/features/filters/ByJobGroup/FilterByJobGroup';
import FilterByLocation from 'components/features/filters/ByLocation/FilterByLocation';
import { DeleteIcon } from 'components/icons';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import { reflactUrlContext } from '../../../lib/utils/UrlUtil';
import FillButton from '../buttons/FillButton';

const cn = classNames.bind(style);

function FilterTagModal() {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [hidden, setHidden] = useState<boolean>(false);
  const { modalState, handleModalState } = useContext(WindowContext);
  const { url } = useContext(EventContext);

  const deleteModal = () => {
    setTimeout(() => {
      handleModalState({
        currentModal: modalState.prevModal,
        prevModal: 0,
        type: false,
      });
    }, 200);
    if (url !== undefined) {
      router.push(url);
    }
    setHidden(true);
  };
  return (
    <section className={cn('container', hidden && 'hidden')}>
      <div className={cn('header')}>
        <div className={cn('header__title')}>검색 필터</div>
        <button
          onClick={() => {
            deleteModal();
          }}
          className={cn('header__deleteBtn')}
        >
          <DeleteIcon color="rgba(32, 34, 45, 0.6)" />
        </button>
      </div>
      <div className={cn('inner')}>
        <div>
          <FilterByJobGroup context={context} />
        </div>
        <div className={cn('dropdown')}>
          <FilterByEventType context={context} />
        </div>
        <div className={cn('dropdown')}>
          <FilterByLocation context={context} />
        </div>
        <div className={cn('dropdown')}>
          <FilterByCoast context={context} />
        </div>
      </div>
      {/* todo: 선택시 필터 초기화 하도록 수정 */}
      {/*<div className={cn('initBtn')}>*/}
      {/*  <FillButton*/}
      {/*    label="초기화하기"*/}
      {/*    color="white"*/}
      {/*    onClick={deleteModal}*/}
      {/*    rounded={false}*/}
      {/*  />*/}
      {/*</div>*/}
      <div className={cn('finishBtn')}>
        <FillButton
          label="적용하기"
          color="primary"
          onClick={deleteModal}
          rounded={false}
        />
      </div>
    </section>
  );
}

export default FilterTagModal;
