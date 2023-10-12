import { EventContext } from 'context/event';
import { checkCondition, checkEventDone, getEventEndDate } from 'lib/utils/eventUtil';
import { checkSearch } from 'lib/utils/searchUtil';
import { EventResponse } from 'model/event';
import { useContext, useEffect, useState } from 'react'

export const useCountEvent = (events: EventResponse[] | undefined) => {
  const [ eventCount, setEventCount] = useState<number>(0);
  const { jobGroupList, eventType, location, coast, search } = useContext(EventContext)
  
  useEffect(() => {
    if (events === undefined || events.length === 0) {
      setEventCount(0);
    } else {
      const result = events.reduce(function add(sum, currValue) {
        const filteredEvents = currValue.dev_event.filter((item) =>
            !checkEventDone({
              endDate: getEventEndDate({
                start_date_time: item.start_date_time,
                end_date_time: item.end_date_time,
                use_start_date_time_yn: item.use_start_date_time_yn,
                use_end_date_time_yn: item.use_end_date_time_yn,
              }),
            }) && (checkCondition(jobGroupList?.join(', '), eventType, location, coast, search, item) 
            || checkSearch(search, item))
            ) 
        return sum + filteredEvents.length;
      }, 0);
      setEventCount(result);
    }
  }, [events])

  return eventCount;
}
