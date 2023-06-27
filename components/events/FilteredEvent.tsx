import React, { useContext, useEffect } from "react";
import EventFilter from "components/features/filters/EventFilter";
import { EventContext } from "context/event";

type Props = {
  condition: string;
}

function FilteredEvent({ condition }: Props) {
  const { jobGroupList, eventType, location, coast } = useContext(EventContext);
  console.log(jobGroupList, eventType, location, coast)
  return (
    <div>
      <EventFilter />
    </div>
  )
}

export default FilteredEvent;