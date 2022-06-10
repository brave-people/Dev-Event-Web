import React from 'react';
import ScheduledEventList from 'component/myEvent/ScheduledEventList';
import DoneEventList from 'component/myEvent/DoneEventList';
import { useRouter } from 'next/router';

const EventBody = () => {
  const router = useRouter();

  const ongoing = router.query.tab === 'ongoing' || router.query.tab == null;
  const done = router.query.tab === 'done';

  return (
    <>
      {ongoing && <ScheduledEventList />}
      {done && <DoneEventList />}
    </>
  );
};

export default EventBody;
