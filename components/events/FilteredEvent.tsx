import React, { useContext } from "react";
import { EventContext } from "context/event";
import { EventResponse } from "model/event";
import ItemList from "components/common/item/ItemList";

type Props = {
  fallbackData: EventResponse[]
}

function FilteredEvent({ fallbackData } : Props) {
  const { jobGroupList, eventType, location, coast } = useContext(EventContext);
  console.log(jobGroupList, eventType, location, coast);
  return (
    <>
      <ItemList
        fallbackData={fallbackData}
        jobGroups={`${jobGroupList?.join(', ')}`}
        eventType={eventType}
        location={location}
        coast={coast}
      />
    </>
  )
}

export default FilteredEvent;