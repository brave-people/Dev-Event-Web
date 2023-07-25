import React, { useContext, useEffect } from 'react';
import DefaultDropdown from "components/common/dropdown/DefaultDropdown";
import { EventContext } from 'context/event';
import { UrlContext } from 'types/UrlContext';
import { eventType } from '../eventType';

type Props = {
  context: UrlContext | undefined;
}

function FilterByEventType({ context }: Props) {
  const { handleEventType } = useContext(EventContext);
    const ga = {
    action: 'web_event_행사유형',
    event_category: 'web_event',
    event_label: '검색'
  }
  useEffect(() => {
    if (context?.type === undefined) {
      handleEventType(undefined);
    } else if (context.type !== undefined) {
      const decode = decodeURIComponent(context.type);
      if (eventType.includes(decode)) {
        handleEventType(decode)
      } else {
        handleEventType(undefined);
      }
    }
  }, [])
  
  return (
    <div>
      <DefaultDropdown
        title="행사 유형"
        options={eventType}
        type='type'
        context={handleEventType}
        gaParam={ga}
      />
    </div>
  )
}

export default FilterByEventType;