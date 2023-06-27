import React, { useContext, useEffect } from "react";
import EventFilter from "components/features/filters/EventFilter";
import { EventContext } from "context/event";

type Props = {
  condition: string;
}

function FilteredEvent({ condition }: Props) {
  const { jobGroupList, eventType, location, coast, date } = useContext(EventContext);
  useEffect(() => {
    console.log(jobGroupList, eventType, location, coast, date)
  }, [date])
  return (
    <div>
      <EventFilter />
    </div>
  )
}

export default FilteredEvent;