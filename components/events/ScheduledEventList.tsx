import ItemList from 'components/common/item/ItemList';
import EventFilter from 'components/features/filters/EventFilter';
import { EventResponse } from 'model/event';
import React from 'react';

type Props = {
  events: EventResponse[] | undefined;
  isError: boolean;
};

const ScheduledEventList = ({ events, isError }: Props) => {
  return (
    <section>
      <EventFilter />
      <ItemList events={events} isError={isError} />
    </section>
  );
};
export default ScheduledEventList;
