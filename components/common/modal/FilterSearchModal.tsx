import ItemList from 'components/common/item/ItemList';
import style from 'components/common/modal/FilterSearchModal.module.scss';
import SearchEvent from 'components/features/filters/searchEvent/SearchEvent';
import { ArrowBackIcon, ToggleIcon } from 'components/icons';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { isActive } from 'lib/utils/eventUtil';
import { EventResponse } from 'model/event';
import React, { useState, useContext, useEffect } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { initUrl, reflactUrlContext } from '../../../lib/utils/UrlUtil';

const cn = classNames.bind(style);

type Props = {
  events: EventResponse[] | undefined;
  isError: boolean;
};

function FilterSearchModal({ events, isError }: Props) {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [hidden, setHidden] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const { handleModalState, windowTheme } = useContext(WindowContext);
  const {
    jobGroupList,
    eventType,
    location,
    coast,
    search,
    handleSearch,
    handleUrl,
  } = useContext(EventContext);

  const deleteModal = () => {
    setHidden(true);
    handleSearch(undefined);
    setTimeout(() => {
      handleModalState({
        currentModal: 0,
        prevModal: 1,
        type: false,
      });
      if (search !== undefined) {
        handleUrl(
          initUrl(
            `${router.asPath}`,
            'kwd',
            jobGroupList,
            eventType,
            location,
            coast,
            search
          )
        );
        router.push(
          initUrl(
            `${router.asPath}`,
            'kwd',
            jobGroupList,
            eventType,
            location,
            coast,
            search
          )
        );
      }
    }, 400);
  };

  useEffect(() => {
    setFilterActive(isActive(jobGroupList, eventType, location, coast));

    return () => {
      setHidden(false);
      setFilterActive(isActive(jobGroupList, eventType, location, coast));
      handleSearch(undefined);
    };
  }, []);

  return (
    <main className={cn('container', hidden && 'hidden')}>
      <section className={cn('header')}>
        <div className={cn('header__button')} onClick={() => deleteModal()}>
          <ArrowBackIcon />
        </div>
        <div className={cn('header__input')}>
          <SearchEvent context={context} />
        </div>
        <div
          className={cn(
            'header__button',
            filterActive && windowTheme && 'active--light',
            filterActive && !windowTheme && 'active--dark'
          )}
          onClick={() => {
            handleModalState({
              currentModal: 2,
              prevModal: 1,
              type: false,
            });
          }}
        >
          {filterActive ? (
            <Image
              src={'/icon/toggle_active.svg'}
              alt="filter active"
              width={40}
              height={40}
            />
          ) : (
            <ToggleIcon />
          )}
        </div>
      </section>
      {search !== undefined ? (
        <ItemList
          events={events}
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
              alt="search"
              layout="fill"
              priority={true}
            />
          </div>
          <div className={cn('body__desc')}>검색어를 입력해주세요</div>
        </section>
      )}
    </main>
  );
}

export default FilterSearchModal;
