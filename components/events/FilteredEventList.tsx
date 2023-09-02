import React, { useContext } from "react";
import { EventContext } from "context/event";
import { EventResponse } from "model/event";
import ItemList from "components/common/item/ItemList";
import { useScheduledEvents } from "lib/hooks/useSWR";
import EventFilter from "components/features/filters/EventFilter";

type Props = {
  fallbackData: EventResponse[]
}

function FilteredEvent({ fallbackData } : Props) {
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);
  const { jobGroupList, eventType, location, coast, search } = useContext(EventContext);
  return (
    <>
      <EventFilter
        events={fallbackData}
      />
      <ItemList
        events={scheduledEvents}
        isError={isError}
        jobGroups={`${jobGroupList?.join(', ')}`}
        eventType={eventType}
        location={location}
        coast={coast}
        search={search}
      />
    </>
  )
}

export default FilteredEvent;