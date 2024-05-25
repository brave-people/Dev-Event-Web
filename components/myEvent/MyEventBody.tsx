import MyEventDoneList from 'components/myEvent/MyEventDoneList';
import MyEventScheduledList from 'components/myEvent/MyEventScheduledList';
import React from 'react';
import { useRouter } from 'next/router';
import Letter from '../features/letter/Letter';

const MyEventBody = () => {
  const router = useRouter();

  const ongoing = router.query.tab === 'ongoing' || router.query.tab == null;
  const done = router.query.tab === 'done';

  return (
    <>
      {ongoing && <MyEventScheduledList />}
      {done && <MyEventDoneList />}
      <Letter />
    </>
  );
};

export default MyEventBody;
