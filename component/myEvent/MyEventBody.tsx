import React from 'react';
import MyOngoingEvent from 'component/myEvent/ScheduledEventTab';
import MyDoneEvent from 'component/myEvent/DoneEventTab';
import { useRouter } from 'next/router';

const TabBody = () => {
  const router = useRouter();

  const ongoing = router.query.tab === 'ongoing' || router.query.tab == null;
  const done = router.query.tab === 'done';

  return (
    <>
      {ongoing && <MyOngoingEvent />}
      {done && <MyDoneEvent />}
    </>
  );
};

export default TabBody;
