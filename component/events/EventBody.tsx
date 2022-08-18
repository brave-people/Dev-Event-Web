import React from 'react';
import { useRouter } from 'next/router';
import MonthlyEventList from 'component/events/MonthlyEventList';
import ScheduledEventList from 'component/events/ScheduledEventList';
import FilteredEventList from './FilteredEventList';

const EventBody = () => {
  const router = useRouter();

  const isMonthly = router.query.year && router.query.month;
  const isFilteredByTag = router.query.tag;
  const isFilteredBySearch = router.query.keyword;
  const isFilteredByNew = router.query.filter;
  const isScheduled = !router.query || (!isMonthly && !isFilteredByTag && !isFilteredBySearch && !isFilteredByNew);

  return (
    <>
      {isScheduled && <ScheduledEventList />}
      {isMonthly && <MonthlyEventList />}
      {isFilteredByNew && <FilteredEventList type="filter" filter={String(router.query.filter)} />}
      {isFilteredByTag && <FilteredEventList type="tag" filter={String(router.query.tag)} />}
      {isFilteredBySearch && <FilteredEventList type="search" filter={String(router.query.keyword)} />}
    </>
  );
};

export default EventBody;
