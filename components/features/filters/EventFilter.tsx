import React from 'react';
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

const cn = classNames.bind(style);

function EventFilter() {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  return (
  <div className={cn('container')}>
    <div className={cn('block')}>
      <span className={cn('block__desc')}>
          전체 행사
      </span>
      <Register />
    </div>
    <div className={cn('block')}>
      <FilterByJobGroup
        context={context}
      />
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
          <div className={cn('filter__group__date')}>
            <DateBoard
                options={getDateList()}
              />
          </div>
        </div>
    </div>
  </div>
  )
}

export default EventFilter