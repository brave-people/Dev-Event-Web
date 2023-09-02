import React from 'react';
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
    <>
      <EventFilter
        events={fallbackData}
      />
      <ItemList
        events={scheduledEvents}
        isError={isError}
      />
    </>
  )
};
export default ScheduledEventList;
