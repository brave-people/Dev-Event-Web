import React from 'react';
import MyOngoingEvent from 'component/myEventTab/MyOngoingEvent';
import MyDoneEvent from 'component/myEventTab/MyDoneEvent';
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
