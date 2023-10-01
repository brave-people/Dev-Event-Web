import React, { useContext, useEffect, useRef } from 'react';
import { EventResponse } from 'model/event';
import ItemList from 'components/common/item/ItemList';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import EventFilter from 'components/features/filters/EventFilter';

type Props = {
  fallbackData: EventResponse[];
}

const ScheduledEventList = ({ fallbackData }: Props) => {
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);


  return (
    <section>
      <EventFilter
        events={fallbackData}
      />
      <ItemList
        events={scheduledEvents}
        isError={isError}
      />
    </section>
  )
};
export default ScheduledEventList;
