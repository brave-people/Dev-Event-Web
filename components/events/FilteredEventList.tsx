import React, { useContext, useState, useEffect } from "react";
import { EventContext } from "context/event";
import { EventResponse } from "model/event";
import ItemList from "components/common/item/ItemList";
import { useScheduledEvents } from "lib/hooks/useSWR";

type Props = {
  fallbackData: EventResponse[]
}

function FilteredEvent({ fallbackData } : Props) {
  const { scheduledEvents, isError } = useScheduledEvents(fallbackData);
  const { jobGroupList, eventType, location, coast } = useContext(EventContext);
  return (
    <>
      <ItemList
        events={scheduledEvents}
        isError={isError}
        jobGroups={`${jobGroupList?.join(', ')}`}
        eventType={eventType}
        location={location}
        coast={coast}
      />
    </>
  )
}

export default FilteredEvent;