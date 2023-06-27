import React, { useContext, useEffect } from 'react';
import DefaultDropdown from "components/common/dropdown/DefaultDropdown";
import { EventContext } from 'context/event';
import { UrlContext } from 'types/UrlContext';

type Props = {
  context: UrlContext | undefined;
}

function FilterByEventType({ context }: Props) {
  const eventType = ["전체", "스터디", "대회", "교육", "모임", "웨비나", "컨퍼런스", "해커톤", "공모전", "이벤트", "포럼"]
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