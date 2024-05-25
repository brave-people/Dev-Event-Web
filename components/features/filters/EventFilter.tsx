import DateBoard from 'components/common/date/DateBoard';
import FilterByCoast from 'components/features/filters/ByCoast/FilterByCoast';
import FilterByEventType from 'components/features/filters/ByEventType/FilterByEventType';
import FilterByJobGroup from 'components/features/filters/ByJobGroup/FilterByJobGroup';
import FilterByLocation from 'components/features/filters/ByLocation/FilterByLocation';
import style from 'components/features/filters/EventFilter.module.scss';
import SearchEvent from 'components/features/filters/searchEvent/SearchEvent';
import Register from 'components/features/register/Register';
import { ToggleIcon } from 'components/icons';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { getDateList } from 'lib/utils/dateUtil';
import { isActive } from 'lib/utils/eventUtil';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { reflactUrlContext } from '../../../lib/utils/UrlUtil';

const cn = classNames.bind(style);

function EventFilter() {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  const [filterActive, setFilterActive] = useState<boolean>(false);

  const { handleModalState } = useContext(WindowContext);
  const { jobGroupList, eventType, location, coast, search } =
    useContext(EventContext);

  useEffect(() => {
    setFilterActive(isActive(jobGroupList, eventType, location, coast));
    return () => {
      setFilterActive(false);
    };
  }, [jobGroupList, eventType, location, coast, search]);

  return (
    <section className={cn('container')}>
      <div className={cn('inner')}>
        <div className={cn('block')}>
          <span className={cn('block__desc')}>전체 행사</span>
          <Register />
        </div>
        <div className={cn('block')}>
          <div className={cn('block__taglist')}>
            <FilterByJobGroup context={context} />
          </div>
        </div>
        <div className={cn('filter')}>
          <div className={cn('filter__search')}>
            <SearchEvent context={context} />
          </div>
          <div className={cn('filter__group')}>
            <div className={cn('filter__group__tag')}>
              <FilterByEventType context={context} />
              <FilterByLocation context={context} />
              <FilterByCoast context={context} />
            </div>
            <div
              onClick={() => {
                document.body.classList.add('body__no__scroll');
                handleModalState({
                  currentModal: 2,
                  prevModal: 0,
                  type: false,
                });
              }}
              className={cn('filter__group__toggle')}
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
            <div className={cn('filter__group__date')}>
              <DateBoard options={getDateList()} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventFilter;
