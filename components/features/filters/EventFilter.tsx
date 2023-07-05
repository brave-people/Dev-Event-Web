import React, { useEffect } from 'react';
import classNames from "classnames/bind";
import style from './EventFilter.module.scss';
import Register from "../register/Register";
import FilterByJobGroup from "./filterByJobGroup/FilterByJobGroup";
import FilterByEventType from './filterByEventType/FilterByEventType';
import FilterByLocation from './filterByLocation/FilterByLocation';
import FilterByCoast from './filterByCoast/FilterByCoast';
import SearchEvent from './searchEvent/SearchEvent';
import DateBoard from 'components/common/date/DateBoard';
import { getDateList } from 'lib/utils/dateUtil';
import { reflactUrlContext } from 'lib/utils/UrlUtil';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

function EventFilter() {
  const router = useRouter();
  const context = reflactUrlContext(router.asPath);
  useEffect(() => {

  }, [context])
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
        <SearchEvent />
      </div>
      <div className={cn('filter__tags')}>
        <div className={cn('filter__tags__group')}>
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
        <DateBoard
          options={getDateList()}
        />
      </div>
    </div>
  </div>
  )
}

export default EventFilter