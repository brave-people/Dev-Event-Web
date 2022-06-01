import React from 'react';
import { useRouter } from 'next/router';
import MonthlyEventList from 'component/events/MonthlyEventList';
import ScheduledEventList from 'component/events/ScheduledEventList';

const EventBody = () => {
  const router = useRouter();
  const isMonthly = router.query.year && router.query.month;
  const isScheduled = !router.query || !isMonthly;

  return (
    <>
      {isScheduled && <ScheduledEventList />}
      {isMonthly && <MonthlyEventList />}
    </>
  );
};

export default EventBody;
