import React from 'react';
import ScheduledEventTab from 'component/myEvent/ScheduledEventTab';
import DoneEventTab from 'component/myEvent/DoneEventTab';
import { useRouter } from 'next/router';

const EventBody = () => {
  const router = useRouter();

  const ongoing = router.query.tab === 'ongoing' || router.query.tab == null;
  const done = router.query.tab === 'done';

  return (
    <>
      {ongoing && <ScheduledEventTab />}
      {done && <DoneEventTab />}
    </>
  );
};

export default EventBody;
