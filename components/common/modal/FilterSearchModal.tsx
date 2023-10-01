import React, { useState, useContext, useEffect, useRef } from 'react'
import style from 'components/common/modal/FilterSearchModal.module.scss'
import classNames from 'classnames/bind'
import { useRouter } from 'next/router';
import { initUrl, reflactUrlContext } from 'lib/utils/urlUtil';
import SearchEvent from 'components/features/filters/searchEvent/SearchEvent';
import { ArrowBackIcon, ToggleIcon } from 'components/icons';
import { WindowContext } from 'context/window';
import Image from 'next/image';
import { EventResponse } from 'model/event';
import { EventContext } from 'context/event';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import ItemList from 'components/common/item/ItemList';
import { isActive } from 'lib/utils/eventUtil';

const cn = classNames.bind(style);

type Props = {
  events: EventResponse[] | undefined;
}

function FilterSearchModal ({ events }: Props) {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [hidden, setHidden] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { modalState, handleModalState, windowTheme } = useContext(WindowContext);
  const { scheduledEvents, isError } = useScheduledEvents(events);
  const { jobGroupList, eventType, location, coast, search, handleSearch } = useContext(EventContext);

  const deleteModal = () => {
    setHidden(true);
    setTimeout(() => {
      handleModalState({
        currentModal: 0,
        prevModal: 0,
        type: false
      });
      handleSearch(undefined);
      document.body.classList.remove('body__no__scroll')
      if (search !== undefined) {
        router.replace(initUrl(`${router.asPath}`, 'kwd', jobGroupList, eventType, location, coast, search));
      }
    }, 300);
  }

  useEffect(() => {
    setFilterActive(isActive(jobGroupList, eventType, location, coast))
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => {
      setHidden(false);
      setIsLoading(false)
    }
  }, [])
  return (
    <main className={cn('container', hidden && 'hidden')}>
      <section className={cn('header')}>
        <div 
          className={cn('header__button')}
          onClick={() => deleteModal()}>
          <ArrowBackIcon />
        </div>
        <div className={cn('header__input')}>
          <SearchEvent
            context={context}
          />
        </div>
        <div 
          className={cn('header__button', (filterActive&& windowTheme) && 'active--light', (filterActive && !windowTheme) && 'active--dark')}
          onClick={() => {
            handleModalState({
              currentModal: 2,
              prevModal: 1,
              type: false
          })
          }}>
          {filterActive ? (
            <Image
              src={'/icon/toggle_active.svg'}
              alt='filter active'
              width={40}
              height={40}
            />
          ) : <ToggleIcon /> }
        </div>
      </section>
      {search !== undefined 
        ? (
          <ItemList
            events={scheduledEvents}
            isError={isError}
            jobGroups={`${jobGroupList?.join(', ')}`}
            eventType={eventType}
            location={location}
            coast={coast}
            search={search}
          />
        ) : (
          <section className={cn('body')}>
            <div className={cn('body__image')}>
              <Image
                src={'/icon/search.svg'}
                alt='search'
                layout='fill'
                priority={true}
              />
            </div>
            <div className={cn('body__desc')}>
              검색어를 입력해주세요
            </div>
          </section>
        )}
    </main>
  )
}

export default FilterSearchModal;