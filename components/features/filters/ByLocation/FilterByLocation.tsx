import BasicDropdown from 'components/common/dropdown/BasicDropdown';
import { EventContext } from 'context/event';
import { UrlContext } from 'types/Context';
import React, { useContext, useEffect } from 'react';

type Props = {
  context: UrlContext | undefined;
};

function FilterByLocation({ context }: Props) {
  const location = ['오프라인', '온라인', '전체'];
  const { handleLocation } = useContext(EventContext);
  const ga = {
    action: 'web_event_참여방법',
    event_category: 'web_event',
    event_label: '검색',
  };
  useEffect(() => {
    if (context?.location === undefined) {
      handleLocation(undefined);
    } else if (context.location !== undefined) {
      const decode = decodeURIComponent(context.location);
      if (location.includes(decode)) {
        handleLocation(decode);
      } else {
        handleLocation(undefined);
      }
    }
  }, []);
  return (
    <div>
      <BasicDropdown title="참여 방법" options={location} type="location" context={handleLocation} gaParam={ga} />
    </div>
  );
}

export default FilterByLocation;
