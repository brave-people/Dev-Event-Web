import React, { useContext } from "react";
import { EventContext } from "context/event";
import { EventResponse } from "model/event";
import ItemList from "components/common/item/ItemList";
import EventFilter from "components/features/filters/EventFilter";

type Props = {
  events: EventResponse[] | undefined;
  isError: boolean;
}

function FilteredEvent({ events, isError } : Props) {
  const { jobGroupList, eventType, location, coast, search } = useContext(EventContext);
  return (
    <section>
      <EventFilter />
      <ItemList
        events={events}
        isError={isError}
        jobGroups={jobGroupList?.join(', ')}
        eventType={eventType}
        location={location}
        coast={coast}
        search={search}
      />
    </section>
  )
}

export default FilteredEvent;