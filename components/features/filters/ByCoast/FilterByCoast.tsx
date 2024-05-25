import React, { useContext, useEffect } from 'react';
import BasicDropdown from 'components/common/dropdown/BasicDropdown';
import { EventContext } from 'context/event';
import { UrlContext } from 'types/Context';

type Props = {
  context: UrlContext | undefined;
};

function FilterByCoast({ context }: Props) {
  const coast = ['유료', '무료', '전체'];
  const { handleCoast } = useContext(EventContext);
  const ga = {
    action: 'web_event_비용',
    event_category: 'web_event',
    event_label: '검색',
  };
  useEffect(() => {
    if (context?.coast === undefined) {
      handleCoast(undefined);
    } else if (context.coast !== undefined) {
      const decode = decodeURIComponent(context.coast);
      if (coast.includes(decode)) {
        handleCoast(decode);
      } else {
        handleCoast(undefined);
      }
    }
  }, [context, coast]);

  return (
    <div>
      <BasicDropdown
        title="비용"
        options={coast}
        type="coast"
        context={handleCoast}
        gaParam={ga}
      />
    </div>
  );
}

export default FilterByCoast;
