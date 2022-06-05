import React from 'react';
import { useRouter } from 'next/router';
import MonthlyEventList from 'component/events/MonthlyEventList';
import ScheduledEventList from 'component/events/ScheduledEventList';
import FilteredEventList from './FilteredEventList';

const EventBody = () => {
  const router = useRouter();
  const isMonthly = router.query.year && router.query.month;
  const isFilteredByTag = router.query.tag;
  const isScheduled = !router.query || (!isMonthly && !isFilteredByTag);
  return (
    <>
      {isScheduled && <ScheduledEventList />}
      {isMonthly && <MonthlyEventList />}
      {isFilteredByTag && <FilteredEventList filter={String(router.query.tag)} />}
    </>
  );
};

export default EventBody;
