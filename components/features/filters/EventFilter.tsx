import React, { useContext, useEffect, useState } from 'react';
import classNames from "classnames/bind";
import style from 'components/features/filters/EventFilter.module.scss';
import Register from 'components/features/register/Register'
import FilterByJobGroup from 'components/features/filters/ByJobGroup/FilterByJobGroup';
import FilterByEventType from 'components/features/filters/ByEventType/FilterByEventType';
import FilterByLocation from 'components/features/filters/ByLocation/FilterByLocation';
import FilterByCoast from 'components/features/filters/ByCoast/FilterByCoast';
import SearchEvent from 'components/features/filters/searchEvent/SearchEvent';
import DateBoard from 'components/common/date/DateBoard';
import { getDateList } from 'lib/utils/dateUtil';
import { reflactUrlContext } from 'lib/utils/urlUtil';
import { useRouter } from 'next/router';
import { ToggleIcon } from 'components/icons';
import FilterTagModal from 'components/common/modal/FilterTagModal';
import { WindowContext } from 'context/window';
import FilterSearchModal from 'components/common/modal/FilterSearchModal';
import { EventResponse } from 'model/event';
import FilterDateModal from 'components/common/modal/FilterDateModal';
import { EventContext } from 'context/event';
import { isActive } from 'lib/utils/eventUtil';
import Image from 'next/image';

const cn = classNames.bind(style);

type Props = {
  events?: EventResponse[] | undefined;
}

function EventFilter({ events }: Props) {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [filterActive, setFilterActive] = useState<boolean>(false);

  const { modalState, handleModalState } = useContext(WindowContext)
  const { jobGroupList, eventType, location, coast } = useContext(EventContext);  

  const isModalOpen = (modal_id: number): boolean => {
    if (modalState.currentModal === modal_id ||
       modalState.prevModal === modal_id) {
      return (true);
    }
    return (false);
  }

  useEffect(() => {
    setFilterActive(isActive(jobGroupList, eventType, location, coast));
  }, [jobGroupList, eventType, location, coast])
  
  return (
  <section className={cn('container')}>
    <div className={cn('inner')}> 
      <div className={cn('block')}>
        <span className={cn('block__desc')}>
            전체 행사
        </span>
        <Register />
      </div>
      <div className={cn('block')}>
        <div className={cn('block__taglist')}>
          <FilterByJobGroup
            context={context}
          />
        </div>
      </div>
      <div className={cn('filter')}>
          <div className={cn('filter__search')}>
            <SearchEvent
              context={context}
            />
          </div>
          <div className={cn('filter__group')}>
            <div className={cn('filter__group__tag')}>
              <FilterByEventType
                context={context}
                />
              <FilterByLocation 
                context={context}
              />
              <FilterByCoast
                context={context}
              />
            </div>
            <div
              onClick={() => {
                document.body.classList.add('body__no__scroll')
                handleModalState({
                  currentModal: 2,
                  prevModal: modalState.currentModal,
                  type: false
                })
              }} 
              className={cn('filter__group__toggle')}>
              {filterActive ? (
                <Image
                  src={'/icon/toggle_active.svg'}
                  alt='filter active'
                  width={40}
                  height={40}
                />
              ) : <ToggleIcon /> }
            </div>
            <div className={cn('filter__group__date')}>
              <DateBoard
                  options={getDateList()}
                />
            </div>
          </div>
      </div>
    </div>
    {isModalOpen(1) &&
      <FilterSearchModal
        events={events}
      />}
    {isModalOpen(2) && 
      <FilterTagModal />}
    {isModalOpen(3) &&
      <FilterDateModal />}
  </section>
  )
}

export default EventFilter;