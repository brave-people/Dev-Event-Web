import React from 'react';
import ScheduledEventList from 'components/myEvent/ScheduledEventList';
import DoneEventList from 'components/myEvent/DoneEventList';
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
